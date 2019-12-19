const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const cookiesFilePath = '../cookies.json';

const saveCookies =  async (page) => {
    const cookiesObject = await page.cookies()
    jsonfile.writeFileSync(path.resolve(__dirname, cookiesFilePath), cookiesObject, { spaces: 2 });
}

const retrieveCookies = async (page) => {
    const previousSession = fs.existsSync(path.resolve(__dirname, cookiesFilePath))
    if (previousSession) {
        // If file exist load the cookies
        const cookiesArr = require(`../cookies.json`)
        if (cookiesArr.length !== 0) {
        for (let cookie of cookiesArr) {
            await page.setCookie(cookie)
        }
        console.log('Session has been loaded in the browser')
        return true
        }
    }
}

module.exports = {
    saveCookies,
    retrieveCookies
}