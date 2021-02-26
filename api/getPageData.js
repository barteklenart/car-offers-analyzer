const { getPageSearchUrl } = require('./parsers/pageOfferListParser');
const { getOffersData } = require('./parsers/pageOfferParser');

const getPageData = async (mainUrl) => {
  const offersUrls = await getPageSearchUrl(mainUrl);
  const offers = await getOffersData(offersUrls);

  return offers;
}

module.exports = {
  getPageData,
}