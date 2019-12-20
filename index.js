const puppeteer = require('puppeteer');
const CRED = require('./creds');
const cookies = require('./utils/cookies');
const notifier = require('node-notifier');

const showNotification = (content, url) => {

  notifier.notify(content);
  notifier.on('click', (obj, options) => {
    const spawn = require('child_process').spawn;
    spawn('open', [url]);
  });

  // // Object
  // notifier.notify({
  //   'title': 'David Walsh Blog',
  //   'subtitle': 'Daily Maintenance',
  //   'message': 'Go approve comments in moderation!',
  //   'icon': 'dwb-logo.png',
  //   'contentImage': 'blog.png',
  //   'sound': 'ding.mp3',
  //   'wait': true
  // });
}

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

const gotoLogged = async (page, url) => {
  await cookies.retrieveCookies(page);
  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  });
}

const ID = {
  login: '#email',
  pass: '#pass'
};

const postSelector = '._4-u2.mbm._4mrt._5jmm._5pat._5v3q._7cqq._4-u8';

const getAttrValueBySelector =  async (parent, selector, attr) => {
  try {
    const element = await parent.$(selector);
    const elementAttr = await element.getProperty(attr);
    const elementAttrValue = await elementAttr.jsonValue();
    return elementAttrValue;
  } catch (e) {
    return "";
  }
}

const filterPostsByKeywords = (posts, keywords = []) => keywords.reduce((filteredPosts, keyword) => [...filteredPosts, ...(posts.filter(post => post.content.toLowerCase().includes(keyword)) || [])], []);

const getPosts = async (page) => {
  try {
    const posts = [];
    const postsElements = await page.$$(postSelector);
    for (const postElement of postsElements) {
      const content = await getAttrValueBySelector(postElement, '[data-testid=post_message]', 'textContent');
      const date = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] abbr', 'title');
      const link = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] ._5pcq', 'href');
      const paths = link.split("/");
      posts.push({
        postId: paths.slice(0, -1).pop(),
        groupId: paths.slice(0, -3).pop(),
        content,
        date,
        link
      })
    }
    return posts;
  } catch (e) {
    console.log(e)
  }
}

const groupIds = ['737377046643578'];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const fbUrl = 'https://facebook.com';
  const page = await browser.newPage();

  showNotification();
  const login = async () => {
    // login
    await page.goto(fbUrl, {
      waitUntil: 'domcontentloaded'
    });

    const keywords = process.argv.slice(2);
    console.log(keywords)
    await page.waitForSelector(ID.login);
    await page.type(ID.login, CRED.user);

    await page.type(ID.pass, CRED.pass);
    await sleep(500);

    await page.click("#loginbutton");
    await page.waitForNavigation();
    await cookies.saveCookies(page);

    //setInterval(async () => {
      console.log("==============================");
      for (const groupId of groupIds) {
        try {
          await gotoLogged(page, `${fbUrl}/groups/${groupId}/`);
          const posts = await getPosts(page);
          for (const post of posts) {
            showNotification(post.content, post.link);
          }
          const filteredPosts = filterPostsByKeywords(posts, keywords);
          console.log(filteredPosts);
          console.log("==============================");
          //await page.waitForNavigation();
        } catch (e) {
          console.log(e)
        }
      }
    //},  60 * 1000);
  }
  await login();
  //await page.waitForNavigation();

})();
