# Recreate-From-Source-Maps
Recreate a Webpack project just by providing an URL.

## How?
RFSM looks for `<script>` tags in provided URLs. It attempts to find a source map for each file. These source maps contain information on each file included in your Webpack bundle, including their locations and unminified sources.

Based on this information, the project structure is recreated in `results` directory. A `package.json` file is also created, containing the list of all `dependencies` (no `devDependencies`) used in the project.

Of course, only publicly available information is used.

## Why?
While source maps make debugging way easier, they are often created when they shouldn't be. As a result, we may expose more information than we intend to. This project aims to demonstrated that in the most straightforward way.

## Usage
**Note**: This is not an NPM package.

```js
const recreateProject = require('recreate-from-source-maps');

recreateProject('example-project', 'https://www.example.com/');

// or, if there are many starting bundles
recreateProject('example-project', [
  'https://www.example.com/',
  'https://www.example.com/some-page-with-code-splitting',
]);
```

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/wojtekmaj.png?s=100" width="100">
    </td>
    <td>
      Wojciech Maj<br />
      <a href="mailto:kontakt@wojtekmaj.pl">kontakt@wojtekmaj.pl</a><br />
      <a href="http://wojtekmaj.pl">http://wojtekmaj.pl</a>
    </td>
  </tr>
</table>
