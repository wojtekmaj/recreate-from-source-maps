const chalk = require('chalk');
const _ = require('lodash');
const getBundlesFromHtml = require('./get_bundles_from_html');
const extractFilesFromBundles = require('./extract_files_from_bundles');
const { log, error, success } = require('./log');

const recreateFromSourceMaps = async (projectName, urls) => {
  log(chalk`{bgWhite.black Processing…}\n`);

  try {
    const urlsEnsuredArray = [].concat(urls);
    const bundleUrls = [];
    try {
      for (let i = 0; i < urlsEnsuredArray.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const bundleUrlsPiece = await getBundlesFromHtml({
          projectName,
          url: urlsEnsuredArray[i],
        });

        if (bundleUrlsPiece) {
          bundleUrls.push(...bundleUrlsPiece);
        }
      }
    } catch (err) {
      error('Failed to get bundles from provided HTML files.');
      throw err;
    }

    const uniqueBundleUrls = _.uniq(bundleUrls);
    try {
      await extractFilesFromBundles({
        bundleUrls: uniqueBundleUrls,
        projectName,
      });
    } catch (err) {
      error('Failed to extract files from bundles.');
      throw err;
    }

    success('Successfully processed the data.');
  } catch (err) {
    error('Failed to process the data.');
  }
};

module.exports = recreateFromSourceMaps;
