const request = require('request');
const { parse } = require('node-html-parser');

const getLinkFromTable = (tableOfferDom) => {
  const offersTable = tableOfferDom.querySelector('#offers_table');
  const carHyperlinks = offersTable.querySelectorAll('.thumb');
  const carUrls = Array.from(carHyperlinks).map((car) => car.getAttribute('href'));

  return carUrls;
}

const requestForPageData = (url, iteration = 1, currentUrls = []) => {
  return new Promise((resolve, reject) => {
    request(url, {},  (error, res, body) => {
      const dom = parse(body);
      const lastPageNumber = dom.querySelectorAll('.pager .item').length;
      const uniquePageUrls = getLinkFromTable(dom).filter((v) => currentUrls.indexOf(v) === -1);
      const urls = [...currentUrls, ...uniquePageUrls];

      if (error) {
        return reject(error)
      }

      if (iteration > lastPageNumber) {
        return resolve(urls);
      }

      return resolve(requestForPageData(`${url}&page=${iteration}`, ++iteration, urls));
    })
  })
}

const getPageSearchUrl = async (endpoint) => {
  const response = await requestForPageData(endpoint);

  return response;
}

module.exports = {
  getPageSearchUrl,
}