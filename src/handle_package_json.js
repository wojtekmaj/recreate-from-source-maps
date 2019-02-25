const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const appendDependenciesInPackageJson = ({
  projectName,
  property,
  dependency,
  version,
}) => {
  const packageJsonPath = path.join('results', projectName, 'package.json');
  const packageJsonDir = 'results';
  if (!fs.existsSync(packageJsonDir)) {
    mkdirp.sync(packageJsonDir);
  }

  let packageJson;
  try {
    const existingPackageJson = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(existingPackageJson);
  } catch (err) {
    packageJson = {
      name: projectName,
      version: '',
      dependencies: {},
      devDependencies: {},
    };
  }
  if (!packageJson[property]) {
    packageJson[property] = {};
  }
  packageJson[property][dependency] = version || 'latest';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '  '));
};

const addDependencyInPackageJson = ({
  projectName,
  dependency,
  version,
}) => appendDependenciesInPackageJson({
  projectName,
  property: 'dependencies',
  dependency,
  version,
});

const addDevDependencyInPackageJson = ({
  projectName,
  dependency,
  version,
}) => appendDependenciesInPackageJson({
  projectName,
  property: 'devDependencies',
  dependency,
  version,
});

module.exports = {
  addDependencyInPackageJson,
  addDevDependencyInPackageJson,
};
