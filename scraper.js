const puppeteer = require("puppeteer");
const fs = require("fs");
var request = require("request-promise");

module.exports = {
  start: async function (courseCode) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: false });
    const page = await browser.newPage();
    //login
    await this.login(page);
    await page.waitFor(1000);
    //faculta
    await page.select("#MainContent_ddlFac", "3");
    await page.waitFor(1000);
    //department
    await page.select("#MainContent_ddlDepts", "14");
    await page.waitFor(1000);
    //course
    await page.select("#MainContent_ddlCourse", courseCode);
    await page.waitFor(1000);

    //start download
    const urls = await this.getUrls(page);
    return urls;
  },
  getUrls: async function (page) {
    //get current cookie
    let cookieHack = await page.cookies();
    let cookieStr = "";
    //create cookie string
    for (prop of cookieHack) {
      cookieStr += `${prop.name}=${prop.value}; `;
    }
    //finde all element that includes in the value the video id (use onle the amount in of the element in the for loop and not with the content of "elements" array)
    const elements = await page.$$(".filmname");
    let urls = [];
    let i = 0;
    for (let elm in elements) {
      //get all the videos id's by traversing to this element by id
      const elmValue = await page.$eval(
        `#MainContent_faclist_filmID_${i}`,
        el => el.value
      );
      try {
        //make request to get the video url send the video id , and cookie of current session
        const res = await this.getVideoById(cookieStr,elmValue);
        urls.push(res.d[1]);
      } catch (error) {
        console.log(error);
      }
      i++;
    }
    console.log(urls);
    return urls;

    // for (let url of urls) {
    //   await downloadVideo.download(url);
    // }
  },
  getVideoById: async function (cookieStr, videoId) {
    const options = {
      method: 'POST',
      url: 'http://video.bgu.ac.il/BGUVideo/playFlash.aspx/GetFilmUrl',
      headers:
      {
        'cache-control': 'no-cache',
        cookie: cookieStr,
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate',
        referer: 'http://video.bgu.ac.il/BGUVideo/playFlash.aspx',
        'content-type': 'application/json; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        origin: 'http://video.bgu.ac.il',
        accept: 'application/json, text/javascript, */*; q=0.01',
        connection: 'keep-alive'
      },
      body: `{"filmid":"${videoId}"}`
    };

    let response = await request(options);
    try {
      response = JSON.parse(response);
      return response;
    } catch (error) {
      console.log("response eror *****");
      return error;
    }
  },
  login: async function (page) {
    await page.goto("http://video.bgu.ac.il/BGUVideo/default.aspx");
    //   await page.waitFor('');
    await page.type("#MainContent_txtUser", "arior", { delay: 5 });
    await page.type("#MainContent_txtPassword", "orARIEL7", { delay: 5 });
    await page.type("#MainContent_txtID", "203137294", { delay: 5 });
    await page.click("#MainContent_btnLogin");
    //   await page.waitForNavigation();
    let cookieHack = await page.cookies();
    //   console.log(cookieHack);
    return;
  }
}
