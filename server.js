const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const json2xls = require('json2xls');

const { olxParser, otomotoParser } = require('./pagesParser');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(json2xls.middleware);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/web/index.html'))
})

app.get('/data', async (req, res, next) => {
  try {
    const linksToOffers = await olxParser();
    const offer = await otomotoParser(linksToOffers)
    res.xls('data.xlsx', offer);
    next()
  } catch (error) {
    next(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})