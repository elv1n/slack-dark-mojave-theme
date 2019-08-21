const fs = require('fs-extra');
const { join } = require('path');
const asar = require('asar');
const { red } = require("colorette");
const { paths } = require('./_constants');

function log(info) {
  console.log(red(`
${info}
Feel free to send an issue https://github.com/elv1n/slack-dark-mojave-theme/issues
`));
  process.exit(0);
}

exports.log = log;

exports.pack = async () => {
  try {
    await asar.createPackage(paths.APP_TEMP, paths.APP);
  } catch (e) {
    console.log(e);
    log(`Cannot pack the package back!`);
  }
  //await fs.remove(paths.APP_TEMP);
};

const cleanTheme = async () => {
  const bundleContent = await fs.readFile(paths.BUNDLE, 'utf-8');
  await fs.writeFile(paths.BUNDLE, bundleContent.replace(paths.INJECT_REQ, ''));
};

exports.cleanTheme = cleanTheme;

exports.prepareToInject = async () => {
  try {
    await fs.access(paths.APP, fs.constants.R_OK | fs.constants.W_OK);
  } catch (e) {
    console.log(e);
    log(`Try with sudo or administrator power shell. Cannot get access to ${paths.APP}.`)
  }

  try {
    asar.extractAll(paths.APP, paths.APP_TEMP);
  } catch (e) {
    console.log(e);
    log('Cannot extract package!');
  }

  if (!await fs.pathExists(paths.BUNDLE)) {
    log(`Cannot find a file ${paths.BUNDLE}.`)
  }
};

exports.injectTheme = async (content) => {
  const bundleContent = await fs.readFile(paths.BUNDLE, 'utf-8');
  const isInstalled = bundleContent.includes(paths.INJECT_REQ);

  const injectPath = join(paths.APP_TEMP, 'dist', paths.INJECT_FILE);

  await fs.ensureFile(injectPath);
  await fs.writeFile(injectPath, content);
  if (!isInstalled) {
    await fs.appendFile(paths.BUNDLE, `
${paths.INJECT_REQ}  
  `);
  }
};
