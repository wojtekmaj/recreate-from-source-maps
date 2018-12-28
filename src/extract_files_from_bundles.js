const httpsGet = require('./https_get');
const getMap = require('./get_map');
const extractFilesFromMap = require('./extract_files_from_map');
const writeFiles = require('./write_files');
const extractNodeModules = require('./extract_node_modules');

const extractFilesFromBundles = async (bundleUrls) => {
  console.log('Getting bundles...');
  const scriptsContent = await Promise.all(bundleUrls.map(httpsGet));
  console.log('Getting bundles... Done');

  console.log('Finding sourceMapURLs...');
  const sourceMapUrls = [];
  scriptsContent.forEach((scriptContent, scriptIndex) => {
    const scriptUrl = bundleUrls[scriptIndex];
    const match = scriptContent.match(/\/\/# sourceMappingURL=([^\s]*)/);
    const sourceMapName = match && match[1];
    if (sourceMapName) {
      sourceMapUrls.push(new URL(sourceMapName, scriptUrl).toString());
    }
  });
  console.log('Finding sourceMapURLs... Done');

  console.log('Downloading source maps...');
  const sourceMapPaths = await Promise.all(sourceMapUrls.map(getMap));
  console.log('Downloading source maps... Done');

  console.log('Extracting files from source maps...');
  const unmergedFiles = await Promise.all(sourceMapPaths.map(extractFilesFromMap));
  const files = unmergedFiles.reduce((obj, newFiles) => ({ ...obj, ...newFiles }), {});
  console.log('Extracting files from source maps... Done');

  console.log('Writing all files...');
  await writeFiles(files);
  console.log('Writing all files... Done');

  console.log('Extracting node modules...');
  await extractNodeModules(files);
  console.log('Extracting node modules... Done');
};

module.exports = extractFilesFromBundles;
