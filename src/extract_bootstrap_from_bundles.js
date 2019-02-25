const httpsGet = require('./https_get');
const findSourceMapUrls = require('./find_source_map_urls');
const extractFilesFromMaps = require('./extract_files_from_maps');
const getBundlesFromBootstrap = require('./get_bundles_from_bootstrap');
const { info, makeProgress } = require('./log');

const extractBootstrapFromBundles = async (projectName, bundleUrls) => {
  const gettingBundles = makeProgress('Getting bundles');
  let scriptsContents;
  try {
    scriptsContents = await Promise.all(bundleUrls.map(url => httpsGet(url, projectName)));
    gettingBundles.done();
  } catch (err) {
    gettingBundles.error(err);
    throw err;
  }

  const findingSourceMapUrls = makeProgress('Finding sourceMapURLs');
  let sourceMapUrls;
  try {
    sourceMapUrls = findSourceMapUrls(bundleUrls, scriptsContents);
    findingSourceMapUrls.done(`Found ${scriptsContents.length === sourceMapUrls.length ? 'all' : sourceMapUrls.length} sourceMapURLs.`);
  } catch (err) {
    findingSourceMapUrls.error(err);
    throw err;
  }

  const downloadingSourceMaps = makeProgress('Downloading source maps');
  let sourceMapsContent;
  try {
    sourceMapsContent = await Promise.all(sourceMapUrls.map(url => httpsGet(url, projectName)));
    downloadingSourceMaps.done();
  } catch (err) {
    downloadingSourceMaps.error(err);
    throw err;
  }

  const extractingFiles = makeProgress('Extracting files from source maps');
  let files;
  try {
    files = await extractFilesFromMaps(sourceMapsContent);
    // Remove files which are in fact previously found bundles
    bundleUrls.forEach((bundleUrl) => {
      const bundleFilename = bundleUrl.split('/').pop();
      if (bundleFilename in files) {
        delete files[bundleFilename];
      }
    });
    extractingFiles.done(`Extracted ${Object.keys(files).length} files.`);
  } catch (err) {
    extractingFiles.error(err);
    throw err;
  }

  // On the first pass, the function will try and use extracted data to find even more data
  const bootstrapFile = files['webpack/bootstrap'];
  if (bootstrapFile) {
    info('Found Webpack bootstrap file.');
    const secondaryBundleUrls = await getBundlesFromBootstrap(
      projectName,
      bootstrapFile,
      bundleUrls[0],
    );
    return [...bundleUrls, ...secondaryBundleUrls];
  }

  return bundleUrls;
};

module.exports = extractBootstrapFromBundles;
