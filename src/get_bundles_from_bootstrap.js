const getNLinesAfter = (text, after, numberOfLines) => text
  .slice(text.indexOf(after))
  .split('\n')
  .slice(1, numberOfLines + 1)
  .join('\n');

const getNthLine = (text, lineNumber) => text
  .split('\n')
  .slice(lineNumber, lineNumber + 1)[0];

const getBundlesFromBootstrap = async (bootstrap, sampleScriptUrl) => {
  const hasJsonpScriptSrc = bootstrap.includes('jsonpScriptSrc');
  const hasScriptSrc = bootstrap.includes('script.src = __webpack_require__.p');

  const chunkIds = (() => {
    if (hasJsonpScriptSrc) {
      const beginOfFunction = '\t// script path function';
      const jsonpScriptSrcBody = getNLinesAfter(bootstrap, beginOfFunction, 3);
      const configLine = getNthLine(jsonpScriptSrcBody, 1);

      const config = JSON.parse(configLine.slice(configLine.indexOf('{'), configLine.indexOf('}') + 1));
      return Object.keys(config);
    }

    if (hasScriptSrc) {
      // TODO: How to detect that?
      return [];
    }

    return [];
  })();

  const chunkIdToBundleFilename = (() => {
    const beginOfPublicPath = '\t// __webpack_public_path__';
    const webpackPublicPath = getNLinesAfter(bootstrap, beginOfPublicPath, 1);

    const __webpack_require__ = {}; // eslint-disable-line
    eval(webpackPublicPath); // eslint-disable-line no-eval
    if (!__webpack_require__.p) {
      throw new Error('Failed to determine publicPath');
    }

    if (hasJsonpScriptSrc) {
      const beginOfFunction = '\t// script path function';
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

    return null;
  })();

  const bundleFilenames = chunkIds.map(chunkIdToBundleFilename); // eslint-disable-line no-undef
  const bundleUrls = bundleFilenames.map(
    bundleUrl => new URL(bundleUrl, sampleScriptUrl).toString(),
  );

  return bundleUrls;
};

module.exports = getBundlesFromBootstrap;
