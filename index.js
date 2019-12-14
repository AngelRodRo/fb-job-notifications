const puppeteer = require('puppeteer');
const CRED = require('./creds');
const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

const cookiesFilePath = './cookies.json';
const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

const saveCookies =  async (page) => {
  const cookiesObject = await page.cookies()
  jsonfile.writeFileSync(path.resolve(__dirname, cookiesFilePath), cookiesObject, { spaces: 2 });
}

const retrieveCookies = async (page) => {
  const previousSession = fs.existsSync(path.resolve(__dirname, cookiesFilePath))
  if (previousSession) {
    // If file exist load the cookies
    const cookiesArr = require(`./cookies.json`)
    if (cookiesArr.length !== 0) {
      for (let cookie of cookiesArr) {
        await page.setCookie(cookie)
      }
      console.log('Session has been loaded in the browser')
      return true
    }
  }
}

const gotoLogged = async (page, url) => {
  await retrieveCookies(page);
  await page.goto(url, {
    waitUntil: 'networkidle2'
  });
}

const ID = {
  login: '#email',
  pass: '#pass'
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const fbUrl = 'https://facebook.com';
  const page = await browser.newPage();
  const login = async () => {
    // login
    await page.goto(fbUrl, {
      waitUntil: 'networkidle2'
    });
    await page.waitForSelector(ID.login);
    console.log(CRED.user);
    console.log(ID.login);
    await page.type(ID.login, CRED.user);

    await page.type(ID.pass, CRED.pass);
    await sleep(500);

    await page.click("#loginbutton");
    await page.waitForNavigation();

    await saveCookies(page);
    await gotoLogged(page, `${fbUrl}/groups/737377046643578/`);
    await retrieveCookies(page);

    await page.waitForNavigation();

  }
  await login();
})();
