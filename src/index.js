const chalk = require('chalk');
const _ = require('lodash');
const getBundlesFromHtml = require('./get_bundles_from_html');
const extractFilesFromBundles = require('./extract_files_from_bundles');
const { log, error, success } = require('./log');

const getProjectFromHtmls = async (projectName, urls) => {
  log(chalk`{bgWhite.black Processing…}\n`);

  let errorHappened = false;

  const urlsEnsuredArray = [].concat(urls);
  const bundleUrls = [];
  try {
    for (let i = 0; i < urlsEnsuredArray.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      bundleUrls.push(...await getBundlesFromHtml(urlsEnsuredArray[i]));
    }
  } catch (err) {
    process.stdout.write('\n');
    error('Failed to get bundles from provided HTML files.');
    errorHappened = true;
  }
  const uniqueBundleUrls = _.uniq(bundleUrls);
  try {
    await extractFilesFromBundles(projectName, uniqueBundleUrls);
  } catch (err) {
    process.stdout.write('\n');
    error('Failed to extract files from bundles.');
    errorHappened = true;
  }

  process.stdout.write('\n');

  if (errorHappened) {
    error('Failed to process the data.');
  } else {
    success('Successfully processed the data.');
  }
};

module.exports = getProjectFromHtmls;
