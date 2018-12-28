const httpsGet = require('./https_get');
const getMap = require('./get_map');
const extractFilesFromMap = require('./extract_files_from_map');
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
  const sourceMapPaths = await Promise.all(sourceMapUrls.map(getMap));
  downloadingSourceMaps.done();

  const extractingFiles = makeProgress('Extracting files from source maps');
  const unmergedFiles = await Promise.all(sourceMapPaths.map(extractFilesFromMap));
  const files = unmergedFiles.reduce((obj, newFiles) => ({ ...obj, ...newFiles }), {});
  extractingFiles.done();

  const writingAllFiles = makeProgress('Writing all files');
  await writeFiles(files);
  writingAllFiles.done();

  const extractingModules = makeProgress('Extracting node modules');
  await extractNodeModules(files);
  extractingModules.done();
};

module.exports = extractFilesFromBundles;
