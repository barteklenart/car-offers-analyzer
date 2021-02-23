const request = require('request');
const { parse } = require('node-html-parser');

const initEndpoint = 'https://www.olx.pl/motoryzacja/samochody/kia/ceed/?search%5Bfilter_float_price%3Afrom%5D=22500&search%5Bfilter_float_price%3Ato%5D=35000&search%5Bfilter_enum_car_body%5D%5B0%5D=hatchback';


const oxlIsNextPage = (dom) => {
  dom.querySelector('.pager')
}

const olxTableOfferParser = (tableOfferDom) => {
  const offersTable = tableOfferDom.querySelector('#offers_table');
  const carHyperlinkList = offersTable.querySelectorAll('.thumb');
  const carLinkList = Array.from(carHyperlinkList).map((car) => car.getAttribute('href'));

  return carLinkList;
}

const requestForData = async (endpoint, resolver) => {
  return await new Promise((resolve) => {
    request(endpoint, {},  (err, res, body) => {
      const dom = parse(body);
      carLinkList = [...olxTableOfferParser(dom)];
      resolve(carLinkList);
      // resolver(oxlIsNextPage(dom));
    })
  })

}

const olxParser = async (endpoint = initEndpoint) => {
  let carLinkList = [];
  const response = await new Promise((resolve) => {
    request(endpoint, {},  (err, res, body) => {
      const dom = parse(body);
      carLinkList = [...olxTableOfferParser(dom)];
      resolve(carLinkList);
      // resolver(oxlIsNextPage(dom));
    })
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

const getOfferData =  (link) => {
  if (link.includes('otomoto')) {
    const offer = new Promise((resolve) => {
      request(link, {},  (err, res, body) => {

        const dom = parse(body);
        const price = getValueFromElement(dom, '.offer-price__number');
        const parametersSection = dom.querySelector('#parameters');
        const parametersElements = Array.from(parametersSection.querySelectorAll('.offer-params__item'));
        const availableSearchParameters = ['Oferta od', 'Przebieg', 'Moc', 'Liczba drzwi', 'Kolor', 'Rok produkcji', 'Liczba drzwi', 'Bezwypadkowy']
        const parametersValue = availableSearchParameters.map((parameter) => {
          const search = parametersElements.find((item) => item.toString().includes(parameter))
          if (search) {
            const value = getValueFromElement(search, '.offer-params__value');
            return {
              parameter,
              value
            };
          }

          return null;
        }).filter(i => i)

        resolve({
          price,
          parameters: parametersValue,
          link
        });
      })
    })

    return offer;
  }

  return null;
}

const otomotoParser = async (carList) => {
  const carOffer = await Promise.all(carList.map(getOfferData))

  return carOffer;
}

module.exports = {
  olxParser,
  otomotoParser,
}