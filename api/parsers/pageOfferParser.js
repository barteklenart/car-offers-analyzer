const request = require('request');
const { parse } = require('node-html-parser');

const getValueFromElement = (domElement, selector) => {
  if (domElement) {
    const value = domElement.querySelector(selector);
    if (value) {
      return value.innerText.replace(/\n/ig, '').replace(/ /ig, '');
    }

    return null;
  }

  return null;
}

const scrapDataFromOffer = (body, config) => {
  const dom = parse(body);
  const price = getValueFromElement(dom, config.priceSelector);
  const domParametersSection = dom.querySelector(config.offerDetailsSelector);
  const parametersElements = Array.from(domParametersSection.querySelectorAll(config.offerDetailItemSelector));
  const parametersValue = config.searchParameter.map((parameter) => {
    const search = parametersElements.find((item) => item.toString().includes(parameter.translate))
    if (search) {
      const value = getValueFromElement(search, config.offerDetailItemValueSelector);
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
  }, {});

  return {
    ...parametersValue,
    price
  }
}

const config = {
  otomoto: {
    searchParameter: [
      { name: 'owner', translate: 'Oferta od' },
      { name: 'distance', translate: 'Przebieg' },
      { name: 'power', translate: 'Moc' },
      { name: 'doors', translate: 'Liczba drzwi' },
      { name: 'color', translate: 'Kolor' },
      { name: 'year', translate: 'Rok produkcji' },
      { name: 'noAccident', translate: 'Bezwypadkowy' }
    ],
    priceSelector: '.offer-price__number',
    offerDetailsSelector: '#parameters',
    offerDetailItemSelector: '.offer-params__item',
    offerDetailItemValueSelector: '.offer-params__value'
  },
  olx: {
    searchParameter: [
      { name: 'owner', translate: 'Oferta od' },
      { name: 'distance', translate: 'Przebieg' },
      { name: 'power', translate: 'Moc silnika' },
      { name: 'color', translate: 'Kolor' },
      { name: 'year', translate: 'Rok produkcji' },
      { name: 'noAccident', translate: 'Stan techniczny' },
      { name: 'engineCapacity', translate: 'Poj. silnika' }
    ],
    priceSelector: '.pricelabel__value',
    offerDetailsSelector: '.offer-details',
    offerDetailItemSelector: '.offer-details__item',
    offerDetailItemValueSelector: '.offer-details__value'
  }
}

const scrapFactory = (url, body) => {
  if (url.includes('otomoto')) {
    return scrapDataFromOffer(body, config.otomoto);
  } else if (url.includes('olx')) {
    return scrapDataFromOffer(body, config.olx);
  }
}

const getOfferData =  (url) => {
  const offer = new Promise((resolve) => {
    request(url, {},  (err, res, body) => {
      let parametersValue = scrapFactory(url, body);

      resolve({
        ...parametersValue,
        url
      });
    })
  });

  return offer;
}

const getOffersData = async (carList) => {
  const carOffers = await Promise.all(carList.map(getOfferData).filter(e => !!e));

  return carOffers;
}

module.exports = {
  getOffersData,
}