const getBundlesFromHtml = require('./get_bundles_from_html');

const getBundlesFromHtmls = async (urls) => {
  if (Array.isArray(urls)) {
    await Promise.all(urls.map(getBundlesFromHtml));
  } else {
    await getBundlesFromHtml(urls);
  }
  console.log('All done!');
};

module.exports = getBundlesFromHtmls;
