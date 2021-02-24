const request = require('request');
const { parse } = require('node-html-parser');

const initEndpoint = 'https://www.olx.pl/motoryzacja/samochody/kia/ceed/?search%5Bfilter_float_price%3Afrom%5D=22500&search%5Bfilter_float_price%3Ato%5D=35000&search%5Bfilter_enum_car_body%5D%5B0%5D=hatchback&page=1';


const olxTableOfferParser = (tableOfferDom) => {
  const offersTable = tableOfferDom.querySelector('#offers_table');
  const carHyperlinkList = offersTable.querySelectorAll('.thumb');
  const carLinkList = Array.from(carHyperlinkList).map((car) => car.getAttribute('href'));

  return carLinkList;
}

const requestForData = (endpoint, iteration = 1, items = []) => {
  return new Promise((resolve, reject) => {

    request(endpoint, {},  (err, res, body) => {
      const dom = parse(body);
      const maxNumberOfPages = dom.querySelectorAll('.pager .item').length;
      const links = [...items, ...olxTableOfferParser(dom).filter((v) => items.indexOf(v) === -1)];

      if (iteration > maxNumberOfPages) {
        return resolve(links)
      }

      return resolve(requestForData(`${endpoint}&page=${iteration}`, ++iteration, links));
    })
  })
}

const olxParser = async (endpoint = initEndpoint) => {
  let carLinkList = [];
  const response = await new Promise((resolve) => {
    const links = requestForData(endpoint)

    resolve(links)
  })

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
]

const getOfferData =  (link) => {
  if (link.includes('otomoto')) {
    const offer = new Promise((resolve) => {
      request(link, {},  (err, res, body) => {

        const dom = parse(body);
        const price = getValueFromElement(dom, '.offer-price__number');
        const parametersSection = dom.querySelector('#parameters');
        const parametersElements = Array.from(parametersSection.querySelectorAll('.offer-params__item'));
        const parametersValue = availableSearchParameters.map((parameter) => {
          const search = parametersElements.find((item) => item.toString().includes(parameter.translate))
          if (search) {
            const value = getValueFromElement(search, '.offer-params__value');
            return {
              [parameter.name]: value,
            };
          }

          return null;
        }).reduce((acc, item) => {
          return {
            ...acc,
            ...item
          }
        }, {})

        resolve({
          price,
          ...parametersValue,
          link
        });
      })
    })

    return offer;
  }

  return null;
}

const otomotoParser = async (carList) => {
  const carOffer = await Promise.all(carList.map(getOfferData).filter(e => !!e))

  return carOffer;
}

module.exports = {
  olxParser,
  otomotoParser,
}