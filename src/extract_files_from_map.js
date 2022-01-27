const _ = require('lodash');
const { warning } = require('./log');

const warnAboutSourceMapsWithoutSourcesContent = _.once(() => {
  warning('Source maps without sourcesContent are not supported');
});

const removeLinesStartingFrom = (text, startingFrom) => {
  if (!text.includes(startingFrom)) {
    return text;
  }

  const cutOn = text.indexOf(startingFrom);

  return text.slice(0, cutOn);
};

const beginOfWebpackFooter = ['', '', '', '// WEBPACK FOOTER //'].join('\n');

const extractFilesFromMap = (textContent) =>
  new Promise((resolve) => {
    const json = JSON.parse(textContent);

    if (!json.sourcesContent) {
      warnAboutSourceMapsWithoutSourcesContent();
      resolve({});
    }

    // Extract all files
    const files = {};
    json.sources.forEach((rawSource, sourceIndex) => {
      let fileName = rawSource.split('///').pop();
      if (fileName.includes(' ')) {
        [fileName] = fileName.split(' ');
      }
      if (fileName.includes('?')) {
        [fileName] = fileName.split('?');
      }

      const rawData = json.sourcesContent[sourceIndex];
      const data = removeLinesStartingFrom(rawData, beginOfWebpackFooter);

      files[fileName] = data;
    });

    resolve(files);
  });

module.exports = extractFilesFromMap;
