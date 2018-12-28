const chalk = require('chalk');
const _ = require('lodash');
const getBundlesFromHtml = require('./get_bundles_from_html');
const extractFilesFromBundles = require('./extract_files_from_bundles');

const getProjectFromHtmls = async (urls) => {
  console.log(chalk`{bgWhite.black Processing}`);

  const urlsEnsuredArray = [].concat(urls);
  const bundleUrls = [].concat(...await Promise.all(urlsEnsuredArray.map(getBundlesFromHtml)));
  const uniqueBundleUrls = _.uniq(bundleUrls);
  await extractFilesFromBundles(uniqueBundleUrls);

  console.log(chalk`{bgGreen.black Success}`);
};

module.exports = getProjectFromHtmls;
