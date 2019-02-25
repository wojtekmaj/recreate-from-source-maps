const httpsGet = require('./https_get');
const findSourceMapUrls = require('./find_source_map_urls');
const extractBootstrapFromBundles = require('./extract_bootstrap_from_bundles');
const extractFilesFromMaps = require('./extract_files_from_maps');
const writeFiles = require('./write_files');
const extractNodeModules = require('./extract_node_modules');
const { makeProgress } = require('./log');

const extractFilesFromBundles = async ({
  bundleUrls,
  projectName,
}) => {
  const extractBootstrap = makeProgress('Extracting Webpack bootstrap file');
  let allBundleUrls;
  try {
    allBundleUrls = await extractBootstrapFromBundles({ bundleUrls, projectName });
    extractBootstrap.done(`Found ${bundleUrls.length === allBundleUrls.length ? 'no' : allBundleUrls.length - bundleUrls.length} extra bundles.`);
  } catch (err) {
    extractBootstrap.error(err);
    throw err;
  }

  const gettingBundles = makeProgress('Getting bundles');
  let scriptsContents;
  try {
    scriptsContents = await Promise.all(allBundleUrls.map(url => httpsGet(url, projectName)));
    gettingBundles.done();
  } catch (err) {
    gettingBundles.error(err);
    throw err;
  }

  const findingSourceMapUrls = makeProgress('Finding sourceMapURLs');
  let sourceMapUrls;
  try {
    sourceMapUrls = findSourceMapUrls({
      bundleUrls: allBundleUrls,
      scriptsContents,
    });
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
    allBundleUrls.forEach((bundleUrl) => {
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

  const writingAllFiles = makeProgress('Writing all files');
  try {
    await writeFiles(files, projectName);
    writingAllFiles.done();
  } catch (err) {
    writingAllFiles.error(err);
    throw err;
  }

  const extractingModules = makeProgress('Extracting node modules');
  const nodeModules = await extractNodeModules({
    files,
    projectName,
  });
  extractingModules.done(`Extracted ${nodeModules.length} node modules.`);
};

module.exports = extractFilesFromBundles;
