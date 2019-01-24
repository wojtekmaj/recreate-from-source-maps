const findSourceMapUrls = (bundleUrls, scriptsContents) => {
  const sourceMapUrls = [];
  scriptsContents.forEach((scriptContent, scriptIndex) => {
    const scriptUrl = bundleUrls[scriptIndex];
    const match = scriptContent.match(/\/\/# sourceMappingURL=([^\s]*)/);
    const sourceMapName = match && match[1];
    if (sourceMapName) {
      sourceMapUrls.push(new URL(sourceMapName, scriptUrl).toString());
    }
  });
  return sourceMapUrls;
};

module.exports = findSourceMapUrls;
