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

const parseSearchPage = async (endpoint) => {
  const response = await requestForPageData(endpoint);

  return response;
}

const getValueFromElement = (domElement, selector) => {
  if (domElement) {
    const value = domElement.querySelector(selector);
    if (value) {
      return value.innerText.replace(/\n/ig, '').replace(/ /ig, '')
    }

    return null;
  }

  return null;
}


const availableSearchParameters = [
  { name: 'owner', translate: 'Oferta od' },
  { name: 'distance', translate: 'Przebieg'},
  { name: 'power', translate: 'Moc'},
  { name: 'doors', translate: 'Liczba drzwi'},
  { name: 'color', translate: 'Kolor'},
  { name: 'year', translate: 'Rok produkcji'},
  { name: 'noAccident', translate: 'Bezwypadkowy'}
];

const getOfferData =  (url) => {
  if (url.includes('otomoto')) {
    const offer = new Promise((resolve) => {
      request(url, {},  (err, res, body) => {
        const dom = parse(body);
        const price = getValueFromElement(dom, '.offer-price__number');
        const domParametersSection = dom.querySelector('#parameters');
        const parametersElements = Array.from(domParametersSection.querySelectorAll('.offer-params__item'));
        const parametersValue = availableSearchParameters.map((parameter) => {
          const search = parametersElements.find((item) => item.toString().includes(parameter.translate))
          if (search) {
            const value = getValueFromElement(search, '.offer-params__value');
            return {
              [parameter.name]: value,
            };
          }

          return null;
        })
        .filter(pv => !!pv)
        .reduce((acc, item) => {
          return {
            ...acc,
            ...item
          }
        }, {})

        resolve({
          price,
          ...parametersValue,
          url
        });
      })
    })

    return offer;
  }

  return null;
}

const getOffersData = async (carList) => {
  const carOffers = await Promise.all(carList.map(getOfferData).filter(e => !!e));

  return carOffers;
}

const getCarData = async (mainUrl) => {
  const offersUrls = await parseSearchPage(mainUrl);
  const offers = await getOffersData(offersUrls);

  return offers;
}

module.exports = {
  getCarData,
}