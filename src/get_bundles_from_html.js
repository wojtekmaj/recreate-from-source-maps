const httpsGet = require('./https_get');
const findScriptUrls = require('./find_script_urls');
const { makeProgress } = require('./log');

const getBundlesFromHtml = async (url) => {
  const gettingHtml = makeProgress(`Getting source from URL ${url}`);
  const html = await httpsGet(url);
  gettingHtml.done();

  const findingBundles = makeProgress('Finding bundles');
  const scriptUrls = findScriptUrls(url, html);
  findingBundles.done(`Found ${scriptUrls.length} bundles.`);

  return scriptUrls;
};

module.exports = getBundlesFromHtml;
