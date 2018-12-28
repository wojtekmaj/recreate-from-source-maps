const _ = require('lodash');
const getBundlesFromHtml = require('./get_bundles_from_html');
const extractFilesFromBundles = require('./extract_files_from_bundles');

const getProjectFromHtmls = async (urls) => {
  const urlsEnsuredArray = [].concat(urls);
  const bundleUrls = [].concat(...await Promise.all(urlsEnsuredArray.map(getBundlesFromHtml)));
  const uniqueBundleUrls = _.uniq(bundleUrls);
  await extractFilesFromBundles(uniqueBundleUrls);
};

module.exports = getProjectFromHtmls;
