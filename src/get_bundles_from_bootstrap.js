const httpsGet = require('./https_get');

const getNLinesAfter = (text, after, numberOfLines) => text
  .slice(text.indexOf(after))
  .split('\n')
  .slice(1, numberOfLines + 1)
  .join('\n');

const getNthLine = (text, lineNumber) => text
  .split('\n')
  .slice(lineNumber, lineNumber + 1)[0];

const beginOfPublicPath = '\t// __webpack_public_path__';
const beginOfFunction = '\t// script path function';

const getBundlesFromBootstrap = async ({
  bootstrap,
  projectName,
  sampleScriptUrl,
}) => {
  const hasJsonpScriptSrc = bootstrap.includes('jsonpScriptSrc');
  const hasScriptSrc = bootstrap.includes('script.src = __webpack_require__.p');

  const chunkIdToBundleFilename = (() => {
    const webpackPublicPath = getNLinesAfter(bootstrap, beginOfPublicPath, 1);

    const __webpack_require__ = {}; // eslint-disable-line
    eval(webpackPublicPath); // eslint-disable-line no-eval
    if (__webpack_require__.p === undefined) {
      throw new Error('Failed to determine publicPath.');
    }

    if (hasJsonpScriptSrc) {
      const jsonpScriptSrcBody = getNLinesAfter(bootstrap, beginOfFunction, 3);

      eval(jsonpScriptSrcBody); // eslint-disable-line no-eval
      /* global jsonpScriptSrc */
      if (!jsonpScriptSrc) {
        throw new Error('Failed to create jsonpScriptSrc function');
      }

      return jsonpScriptSrc;
    }

    if (hasScriptSrc) {
      const beginOfLine = 'script.src = __webpack_require__.p';
      const textToCut = 'script.src = ';
      const scriptSrcLine = bootstrap.slice(bootstrap.indexOf(beginOfLine) + textToCut.length).split('\n').slice(0, 1)[0];

      eval(`function scriptSrc(chunkId) { return ${scriptSrcLine} }`); // eslint-disable-line no-eval
      /* global scriptSrc */
      if (!scriptSrc) {
        throw new Error('Failed to create scriptSrc function');
      }

      return scriptSrc;
    }

    return v => v;
  })();

  const chunkIds = await (async () => {
    if (hasJsonpScriptSrc) {
      const jsonpScriptSrcBody = getNLinesAfter(bootstrap, beginOfFunction, 3);
      const configLine = getNthLine(jsonpScriptSrcBody, 1);

      const config = JSON.parse(configLine.slice(configLine.indexOf('{'), configLine.indexOf('}') + 1));
      return Object.keys(config);
    }

    if (hasScriptSrc) {
      /**
       * No other way to get the number of chunks than just requesting them one by one until
       * we get an error.
       */
      let maxChunkId = 0;
      let errorOccurred = false;
      const maxNumberOfChunks = 25;
      while (maxChunkId < maxNumberOfChunks && !errorOccurred) {
        try {
          const bundleFilename = chunkIdToBundleFilename(maxChunkId + 1);
          const bundleUrl = new URL(bundleFilename, sampleScriptUrl).toString();
          await httpsGet(bundleUrl, projectName); // eslint-disable-line no-await-in-loop
          maxChunkId += 1;
        } catch (error) {
          errorOccurred = true;
        }
      }

      return Array.from(new Array(maxChunkId)).map((el, index) => index + 1);
    }

    return [];
  })();

  const bundleFilenames = chunkIds.map(chunkIdToBundleFilename);
  const bundleUrls = bundleFilenames.map(
    (bundleFilename) => new URL(bundleFilename, sampleScriptUrl).toString(),
  );

  return bundleUrls;
};

module.exports = getBundlesFromBootstrap;
