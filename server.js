const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const json2xls = require('json2xls');

const { getPageData } = require('./api/getPageData');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(json2xls.middleware);
app.use(express.static('web'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/web/index.html'))
})

app.post('/data', async (req, res, next) => {
  try {
    const { url } = req.body;
    const data = await getPageData(url);
    res.xls('data.xlsx', data);
    next();
  } catch (error) {
    next(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})