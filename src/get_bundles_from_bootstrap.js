const { makeProgress } = require('./log');

const getBundlesFromBootstrap = async (bootstrap, scriptUrl) => {
  const findingBundles = makeProgress('Finding bundles');
  const beginOfFunction = '\t// script path function';
  const jsonpScriptSrcBody = bootstrap.slice(bootstrap.indexOf(beginOfFunction)).split('\n').slice(1, 4).join('\n');
  const configLine = jsonpScriptSrcBody
    .split('\n')
    .slice(1, -1)[0];
  const config = JSON.parse(configLine.slice(configLine.indexOf('{'), configLine.indexOf('}') + 1));

  const beginOfPublicPath = '\t// __webpack_public_path__';
  const webpackPublicPath = bootstrap.slice(bootstrap.indexOf(beginOfPublicPath)).split('\n').slice(1, 2).join('\n');

  const __webpack_require__ = {}; // eslint-disable-line
  eval(webpackPublicPath); // eslint-disable-line no-eval
  eval(jsonpScriptSrcBody); // eslint-disable-line no-eval
  if (!__webpack_require__.p) {
    throw new Error('Failed to determine publicPath');
  }
  if (!jsonpScriptSrc) { // eslint-disable-line no-undef
    throw new Error('Failed to create jsonpScriptSrc function');
  }

  const chunkIds = Object.keys(config);
  const bundleFilenames = chunkIds.map(jsonpScriptSrc); // eslint-disable-line no-undef
  const bundleUrls = bundleFilenames.map(bundleUrl => new URL(bundleUrl, scriptUrl).toString());
  findingBundles.done(`Found ${bundleUrls.length} bundles.`);

  return bundleUrls;
};

module.exports = getBundlesFromBootstrap;
