const extractFilesFromMap = require('./extract_files_from_map');
const { warning } = require('./log');

const extractFilesFromMaps = async (sourceMapsContent) => {
  const unmergedFiles = await Promise.all(sourceMapsContent.map(extractFilesFromMap));
  const files = unmergedFiles.reduce((obj, newFiles) => {
    const existingFiles = Object.keys(newFiles)
      .filter((newFile) => obj[newFile] && obj[newFile] !== newFiles[newFile]);
    if (existingFiles.length) {
      warning(`The following files will be overwritten with different content: ${existingFiles.join(', ')}.`);
    }
    return { ...obj, ...newFiles };
  }, {});
  return files;
};

module.exports = extractFilesFromMaps;
