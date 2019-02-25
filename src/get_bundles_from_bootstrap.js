const getNLinesAfter = (text, after, numberOfLines) => text
  .slice(text.indexOf(after))
  .split('\n')
  .slice(1, numberOfLines + 1)
  .join('\n');

const getBundlesFromBootstrap = async (bootstrap, sampleScriptUrl) => {
  const jsonpScriptSrc = bootstrap.includes('jsonpScriptSrc');
  const scriptSrc = bootstrap.includes('script.src = __webpack_require__.p');

  const chunkIds = (() => {
    if (jsonpScriptSrc) {
      const beginOfFunction = '\t// script path function';
      const jsonpScriptSrcBody = getNLinesAfter(bootstrap, beginOfFunction, 3);
      const configLine = jsonpScriptSrcBody
        .split('\n')
        .slice(1, -1)[0];
      const config = JSON.parse(configLine.slice(configLine.indexOf('{'), configLine.indexOf('}') + 1));
      return Object.keys(config);
    }

    if (scriptSrc) {
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

    if (jsonpScriptSrc) {
      const beginOfFunction = '\t// script path function';
      const jsonpScriptSrcBody = getNLinesAfter(bootstrap, beginOfFunction, 3);

      eval(jsonpScriptSrcBody); // eslint-disable-line no-eval
      if (!jsonpScriptSrc) {
        throw new Error('Failed to create jsonpScriptSrc function');
      }

      return jsonpScriptSrc;
    }

    if (scriptSrc) {
      const beginOfLine = 'script.src = __webpack_require__.p';
      const textToCut = 'script.src = ';
      const scriptSrcLine = bootstrap.slice(bootstrap.indexOf(beginOfLine) + textToCut.length).split('\n').slice(0, 1)[0];

      eval(`function scriptSrc(chunkId) { return ${scriptSrcLine} }`); // eslint-disable-line no-eval
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
