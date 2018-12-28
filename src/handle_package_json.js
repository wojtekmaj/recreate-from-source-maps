const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const appendDependenciesInPackageJson = (property, dependency, version) => {
  const packageJsonPath = path.join('results', 'package.json');
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
      name: 'recreated-project',
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

const addDependencyInPackageJson = (dependency, version) => appendDependenciesInPackageJson('dependencies', dependency, version);
const addDevDependencyInPackageJson = (dependency, version) => appendDependenciesInPackageJson('devDependencies', dependency, version);

module.exports = {
  addDependencyInPackageJson,
  addDevDependencyInPackageJson,
};
