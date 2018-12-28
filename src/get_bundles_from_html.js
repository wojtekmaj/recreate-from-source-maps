const httpsGet = require('./https_get');
const findScriptUrls = require('./find_script_urls');

const getBundlesFromHtml = async (url) => {
  console.log('Getting HTML...');
  const html = await httpsGet(url);
  console.log('Getting HTML... Done');

  console.log('Finding bundles...');
  const scriptUrls = findScriptUrls(url, html);
  console.log('Finding bundles... Done');

  return scriptUrls;
};

module.exports = getBundlesFromHtml;
