const httpsGet = require('./https_get');
const extractFilesFromMap = require('./extract_files_from_map');
const getBundlesFromBootstrap = require('./get_bundles_from_bootstrap');
const writeFiles = require('./write_files');
const extractNodeModules = require('./extract_node_modules');
const { makeProgress } = require('./log');

const extractFilesFromBundles = async (bundleUrls) => {
  const gettingBundles = makeProgress('Getting bundles');
  const scriptsContent = await Promise.all(bundleUrls.map(httpsGet));
  gettingBundles.done();

  const findingSourceMapUrls = makeProgress('Finding sourceMapURLs');
  const sourceMapUrls = [];
  scriptsContent.forEach((scriptContent, scriptIndex) => {
    const scriptUrl = bundleUrls[scriptIndex];
    const match = scriptContent.match(/\/\/# sourceMappingURL=([^\s]*)/);
    const sourceMapName = match && match[1];
    if (sourceMapName) {
      sourceMapUrls.push(new URL(sourceMapName, scriptUrl).toString());
    }
  });
  findingSourceMapUrls.done();

  const downloadingSourceMaps = makeProgress('Downloading source maps');
  const sourceMapsContent = await Promise.all(sourceMapUrls.map(httpsGet));
  downloadingSourceMaps.done();

  const extractingFiles = makeProgress('Extracting files from source maps');
  const unmergedFiles = await Promise.all(sourceMapsContent.map(extractFilesFromMap));
  const files = unmergedFiles.reduce((obj, newFiles) => ({ ...obj, ...newFiles }), {});
  extractingFiles.done();

  if (files['webpack/bootstrap']) {
    console.log('Found Webpack bootstrap file.');
    const secondaryBundleUrls = await getBundlesFromBootstrap(files['webpack/bootstrap'], bundleUrls[0]);
    await extractFilesFromBundles(secondaryBundleUrls);
  }

  const writingAllFiles = makeProgress('Writing all files');
  await writeFiles(files);
  writingAllFiles.done();

  const extractingModules = makeProgress('Extracting node modules');
  await extractNodeModules(files);
  extractingModules.done();
};

module.exports = extractFilesFromBundles;
