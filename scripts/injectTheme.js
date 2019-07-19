#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { options } = require('get-args')();
const { red, blue } = require("colorette");
const { paths, system } = require('./_constants');
const { pack, extract, injectTheme, cleanTheme } = require('./_helpers');

function log(info) {
  console.log(red(`
${info}
Feel free to send an issue https://github.com/elv1n/slack-dark-mojave-theme/issues
`));
  process.exit(0);
}


if (!system.dir) {
  log(red(`Cannot find directory for your system ${system.type}`))
}

const getTheme = async () => fs.readFile(path.join(__dirname, '..', 'static/applyTheme.txt'), 'utf-8');


(async() => {
  try {
    await extract();
    if (!await fs.pathExists(paths.BUNDLE)) {
      log(`Cannot find a file ${paths.BUNDLE}.`)
    }
    await fs.access(paths.BUNDLE, fs.constants.R_OK | fs.constants.W_OK);

    const content = await fs.readFile(paths.BUNDLE, 'utf-8');
    const isInstalled = content.includes(paths.INJECT_REQ);

    // Restore backup with argument --rollback
    if (options.rollback) {
      if (!isInstalled) {
        console.log(`Cannot find the theme to rollback.
If dark theme still appears then reinstall Slack, please`);
        return;
      }
      await cleanTheme();
      console.log('Dark theme successfully removed!')
    }
    // check if theme already installed
    else if (isInstalled && !options.force) {
      console.log('Theme already installed');
    }
    // inject theme
    else {
      await injectTheme(await getTheme());
    }

    await pack();
    console.log(blue(`Theme successfully applied!`));
    console.log(`You are able restore original theme by 'npx install-dark-theme --rollback'`);
  } catch (e) {
    console.log(e);
    log(`Cannot get access to ${paths.BUNDLE}. Try with sudo or administrator power shell`)
  }
})();


