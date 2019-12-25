const puppeteer = require("puppeteer");
const fs = require("fs");
var request = require("request-promise");

module.exports = {
  start: async function(courseCode) {
    const browser = await puppeteer.launch({ headless: true });
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
  getUrls: async function(page){
    const elements = await page.$$(".filmname");
    let urls = [];
    let i = 0;
    for (let elm in elements) {
      const elmValue = await page.$eval(
        `#MainContent_faclist_filmID_${i}`,
        el => el.value
      );
      const res = await this.getVideoById(elmValue);
      urls.push(res.d[1]);
      i++;
    }
    console.log(urls);
    return urls;
    // for (let url of urls) {
    //   await downloadVideo.download(url);
    // }
  },
  getVideoById: async function(videoId) {
    const options = {
      method: "POST",
      url: "http://video.bgu.ac.il/BGUVideo/playFlash.aspx/GetFilmUrl",
      headers: {
        "cache-control": "no-cache",
        "Content-Length": "16",
        Host: "video.bgu.ac.il",
        "Cache-Control": "no-cache",
        Cookie:
          "ASP.NET_SessionId=tpkmptbfzq3widuhoyuvyfhu; UserSettings=lang=2; .authentication=F107B763A5FEBACD38BAFF7C10A230B5A5FCE5ADE14A264F1F50D5656DB6083BC9B3DF0C3A6A6856BC01CB6AEEFC9AA4C74EB3311256C005669E30059C161C34076DDFBAE1F1249CA9457345D4A2E7E90108D149BC6DB8DCF89C105D7223CE116E05B0E0DC1B41B4A3DC6BD722448C31D70B044E196EC99323484630E4E0951C30B1F86FFE54F48418309E5C262D47B1; ip=2.55.147.225; idnumber=203137294,ASP.NET_SessionId=tpkmptbfzq3widuhoyuvyfhu; UserSettings=lang=2; .authentication=F107B763A5FEBACD38BAFF7C10A230B5A5FCE5ADE14A264F1F50D5656DB6083BC9B3DF0C3A6A6856BC01CB6AEEFC9AA4C74EB3311256C005669E30059C161C34076DDFBAE1F1249CA9457345D4A2E7E90108D149BC6DB8DCF89C105D7223CE116E05B0E0DC1B41B4A3DC6BD722448C31D70B044E196EC99323484630E4E0951C30B1F86FFE54F48418309E5C262D47B1; ip=2.55.147.225; idnumber=203137294; ASP.NET_SessionId=q32xkzqvv2mudukb0khygduy",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        Referer: "http://video.bgu.ac.il/BGUVideo/playFlashNew.aspx",
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        Origin: "http://video.bgu.ac.il",
        Accept: "application/json, text/javascript, */*; q=0.01",
        Connection: "keep-alive"
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
