const httpsGet = require('./https_get');
const extractFilesFromMap = require('./extract_files_from_map');
const getBundlesFromBootstrap = require('./get_bundles_from_bootstrap');
const writeFiles = require('./write_files');
const extractNodeModules = require('./extract_node_modules');
const { info, warning, makeProgress } = require('./log');

const extractFilesFromBundles = async (projectName, bundleUrls) => {
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
  const sourceMapUrls = [];
  scriptsContents.forEach((scriptContent, scriptIndex) => {
    const scriptUrl = bundleUrls[scriptIndex];
    const match = scriptContent.match(/\/\/# sourceMappingURL=([^\s]*)/);
    const sourceMapName = match && match[1];
    if (sourceMapName) {
      sourceMapUrls.push(new URL(sourceMapName, scriptUrl).toString());
    }
  });
  findingSourceMapUrls.done(`Found ${scriptsContents.length === sourceMapUrls.length ? 'all' : sourceMapUrls.length} sourceMapURLs.`);

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
  const unmergedFiles = await Promise.all(sourceMapsContent.map(extractFilesFromMap));
  const files = unmergedFiles.reduce((obj, newFiles) => {
    const existingFiles = Object.keys(newFiles)
      .filter(newFile => obj[newFile] && obj[newFile] !== newFiles[newFile]);
    if (existingFiles.length) {
      warning(`The following files will be overwritten with different content: ${existingFiles.join(', ')}.`);
    }
    return { ...obj, ...newFiles };
  }, {});
  extractingFiles.done(`Extracted ${Object.keys(files).length} files.`);

  const writingAllFiles = makeProgress('Writing all files');
  await writeFiles(files, projectName);
  writingAllFiles.done();

  const extractingModules = makeProgress('Extracting node modules');
  const nodeModules = await extractNodeModules(projectName, files);
  extractingModules.done(`Extracted ${nodeModules.length} node modules.`);

  if (files['webpack/bootstrap']) {
    info('Found Webpack bootstrap file. Extracting data…');
    const secondaryBundleUrls = await getBundlesFromBootstrap(files['webpack/bootstrap'], bundleUrls[0]);
    await extractFilesFromBundles(projectName, secondaryBundleUrls);
  }
};

module.exports = extractFilesFromBundles;
