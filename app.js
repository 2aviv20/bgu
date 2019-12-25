const express = require('express');
const scraper = require("./scraper");
const bodyParser = require('body-parser')

const app = express()
const port = process.env.port | 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.post('/scrape/course', async (req, res) => {
    const code = req.body.code;
    const urls = await scraper.start(code);
    res.status(200).send(urls);
})

app.listen(port, () => console.log(`BGU VIDEO SCRAPER app listening on port ${port}!`))