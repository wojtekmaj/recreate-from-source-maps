const findScriptTags = html => html.match(/<script([^>]*)?\ssrc="([^"]*)"(\s[^/]*)?><\/script>/g);
const findScriptPaths = scriptTags => scriptTags.map(tag => tag.match(/src="([^"]*)"/)[1]);
const findScriptUrls = (url, html) => {
  const urlObject = new URL(url);
  const scriptTags = findScriptTags(html);
  const scriptPaths = findScriptPaths(scriptTags);
  const scriptUrls = scriptPaths.map(scriptPath => new URL(scriptPath, urlObject).toString());
  return scriptUrls;
};

module.exports = findScriptUrls;
