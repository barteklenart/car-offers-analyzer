const express = require('express');
const bodyParser = require('body-parser');
const json2xls = require('json2xls');

const { olxParser, otomotoParser } = require('./pagesParser');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(json2xls.middleware);

app.get('/', async (req, res, next) => {
  try {

    const linksToOffers = await olxParser();
    const offer = await otomotoParser(linksToOffers)
    res.xls('data.xlsx', offer);
    res.send('Working! 😎');
    next()
  } catch (error) {
    next(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})