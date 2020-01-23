const puppeteer = require('puppeteer');
const CRED = require('./creds');
const cookies = require('./utils/cookies');
const notifier = require('node-notifier');

const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const postSelector = '._4-u2.mbm._4mrt._5jmm._5pat._5v3q._7cqq._4-u8';
const fbUrl = 'https://facebook.com';


const Post = require("./server/models/post");


const savePosts = async (newPosts) => {
    console.log("Saving posts....");
    await Promise.all(newPosts.map(post => Post.findOrCreate(post, { $and: [{ postId: post.postid }, { groupId: post.groupId } ]})));
    //jsonfile.writeFileSync(path.resolve(__dirname, 'posts.json'), posts, { spaces: 2 });
    showNotification();
    console.log("Posts saved!");
};

const showNotification = () => {
  notifier.notify('Se encontraron nuevas coincidencias!');
  // notifier.on('click', (obj, options) => {
  //   const spawn = require('child_process').spawn;
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

const filterPostsByKeywords = (posts = [], keywords = []) => {
  const filteredPosts = [];
  for (const post of posts) {
    let coincidences = 0;
    const requiredKeywords = keywords.slice(0, 2);
    const remainingKeywords = keywords.slice(2);
    for (const keyword of requiredKeywords) {
      if (post.content.includes(keyword)) {
        coincidences++;
      }
    }

    if (coincidences >= requiredKeywords.length - 1) {
      const existCondition = remainingKeywords.some(keyword => post.content.toLowerCase().includes(keyword.toLowerCase()));
      if (existCondition) {
        filteredPosts.push(post);
      }
    }
  }
  return filteredPosts;
}

//const filterPostsByKeywords = (posts, keywords = []) => keywords.reduce((filteredPosts, keyword) => [...filteredPosts, ...(posts.filter(post => post.content.toLowerCase().includes(keyword)) || [])], []);
const getPosts = async (page) => {
  try {
    const posts = [];
    const postsElements = await page.$$(postSelector);
    for (const postElement of postsElements) {
      const content = await getAttrValueBySelector(postElement, '[data-testid=post_message]', 'textContent');
      const date = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] abbr', 'title');
      const link = await getAttrValueBySelector(postElement, '[id^=mall_post_] .clearfix [id^=feed_subtitle] ._5pcq', 'href');
      const [,,,, groupId,, postId] = link.split("/");

      posts.push({
        postId,
        groupId,
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

const checkGroupsByKeywords = async (page, groupIds, keywords) => {
  for (const groupId of groupIds) {
    try {
      await gotoLogged(page, `${fbUrl}/groups/${groupId}/`);
      const posts = await getPosts(page);
      const filteredPosts = filterPostsByKeywords(posts, keywords);
      if (filteredPosts.length > 0) {
        await savePosts(filteredPosts);
      }
    } catch (e) {
      console.log(e)
    }
  }
}

const watchNewPosts = () => {
  fs.watch(path.resolve(__dirname, 'posts.json'), { encoding: 'buffer' }, (eventType, filename) => {
    if (filename) {
      showNotification();
    }
  });
}
module.exports = (async (keywords = process.argv.slice(2)) => {
  console.log(keywords);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const groupIds = require('./groups.json');
  const login = async () => {
    await page.goto(fbUrl, {
      waitUntil: 'domcontentloaded'
    });

    //watchNewPosts();

    await page.waitForSelector(ID.login);
    await page.type(ID.login, CRED.user);

    await page.type(ID.pass, CRED.pass);
    await sleep(500);

    await page.click("#loginbutton");
    await page.waitForNavigation();
    await cookies.saveCookies(page);

    checkGroupsByKeywords(page, groupIds, keywords);
    // cron.schedule('*/1 * * * *', () => {
    //   checkGroupsByKeywords(page, groupIds, keywords);
    // });
  }
  await login();
});
