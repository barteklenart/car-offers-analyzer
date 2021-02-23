const express = require('express');
const bodyParser = require('body-parser');

const { olxParser, otomotoParser } = require('./pagesParser');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res, next) => {
  try {

    const linksToOffers = await olxParser();
    const offer = await otomotoParser(linksToOffers)
    next()
    // res.json(JSON.stringify(offer));
    res.send('Working! 😎');
  } catch (error) {
    next(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})