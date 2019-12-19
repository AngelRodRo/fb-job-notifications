const puppeteer = require('puppeteer');
const CRED = require('./creds');
const cookies = require('./utils/cookies');

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

const filterPostsByKeywords = (posts, keywords = []) => keywords.reduce((filteredPosts, keyword) => [...filteredPosts, ...(posts.filter(post => post.content.includes(keyword)) || [])], []);

const getPosts = async (page) => {
  try {
    const posts = [];
    const postsElements = await page.$$(postSelector);
    for (const postElement of postsElements) {
      const content = await getAttrValueBySelector(postElement, '[data-testid=post_message]', 'textContent');
      const date = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] abbr', 'title');
      const link = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] ._5pcq', 'href');

      posts.push({
        postId: link.split("/").slice(0, -1).pop(),
        groupId: link.split("/").slice(0, -3).pop(),
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

// const getPosts = async (page) => {
//   const posts = await page.evaluate(() => {
//     let posts = [];
//     const contentArray = document.querySelectorAll('[data-testid=post_message]');
//     const dateArray = document.querySelectorAll('[id^=mall_post_] .clearfix [id^=feed_subtitle] abbr');
//     //const profileArray = document.querySelectorAll("[id^=mall_post_] .fwb > .profileLink")
//     const linkArray = document.querySelectorAll('[id^=mall_post_] .clearfix [id^=feed_subtitle] ._5pcq');

//     const length = contentArray.length;

//     for (let i = 0; i < length; i++) {
//       posts[i] = {
//         //profile: profileArray[i].textContent,
//         content: contentArray[i].textContent,
//         date: dateArray[i] && dateArray[i].getAttribute("title"),
//         link: linkArray[i] && 'https://facebook.com' + linkArray[i].getAttribute("href")
//       };
//     }
//     return posts;
//   });
//   return posts;
// }

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const fbUrl = 'https://facebook.com';
  const page = await browser.newPage();
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
      await gotoLogged(page, `${fbUrl}/groups/737377046643578/`);
      const posts = await getPosts(page);
      console.log(posts)
      //console.log(filterPostsByKeywords(posts, keywords));
      console.log("==============================");
      await page.waitForNavigation();
    //},  60 * 1000);
  }
  await login();
  await page.waitForNavigation();

})();
