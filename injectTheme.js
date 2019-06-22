#!/usr/bin/env node

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const { options } = require('get-args')();
const { red, blue } = require("colorette");
const compareVersions = require('compare-versions');

const isDirectory = source => fs.lstatSync(source).isDirectory()

const typesDir = {
  'Windows_NT': () => {
    const source = `${os.homedir()}/AppData/Local/slack/`;
    const APP_KEY = 'app-';
    const latestVersion = fs.readdirSync(source)
      .filter(name => isDirectory(path.join(source, name)))
      .filter(name => name.includes(APP_KEY))
      .map(name => name.replace(APP_KEY, ''))
      .sort((a, b) => compareVersions(b, a))[0];

    return `${source}/${APP_KEY}${latestVersion}`
  },
  'Darwin': () => '/Applications/Slack.app/Contents/',
  'Linux': () => '/usr/lib/slack/'
};

function log(info) {
  console.log(red(`
${info}
Feel free to send an issue https://github.com/elv1n/slack-dark-mojave-theme/issues
`));
  process.exit(0);
}

const systemType = os.type();
const dir = typesDir.hasOwnProperty(systemType) ? typesDir[systemType]() : null;
const INTEROP_DIR = 'resources/app.asar.unpacked/src/static';
const REGEX_THEME = /document.addEventListener(([\S\s]*))/gmi;
const filePath = path.join(dir, INTEROP_DIR, 'ssb-interop.js');
const backupPath = path.join(dir, INTEROP_DIR, 'interop_themed_backup.js');

if (!dir) {
  log(red(`Cannot find directory for your system ${systemType}`))
}

function writeInterop(content) {
  try {
    fs.writeFileSync(filePath, content);
  }catch (e) {
    log(`Cannot write file ${filePath}`);
  }
}

function restoreBackUp() {
  if (fs.pathExistsSync(backupPath)) {
    fs.writeFileSync(filePath, fs.readFileSync(backupPath, 'utf-8'));
    console.log(blue(`Theme restored from backup`));
  } else {
    log(`Backup not found`)
  }
}

function injectTheme() {
  fs.ensureFileSync(backupPath);
  fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf-8'));
  console.log(`
Backup saved and you will be able restore original theme with 'npx install-dark-theme --rollback'
`);
  const applyTheme = fs.readFileSync(path.join(__dirname, 'applyTheme.txt'), 'utf-8');
  fs.appendFileSync(filePath, applyTheme);
  console.log(blue(`Theme successfully applied!`));
}

function rewriteContent(content) {
  try {
    fs.accessSync(backupPath, fs.constants.R_OK | fs.constants.W_OK);
    writeInterop(
      fs.readFileSync(backupPath, 'utf-8')
    );
    return injectTheme();
  } catch (e) {
    const match = content.match(REGEX_THEME);
    if (match.length) {
      const clearContent = content.replace(match[0], '');
      writeInterop(clearContent);
      return injectTheme();
    }
    if (options.force) {
      return injectTheme();
    }

    return log(`Previous theme content not found, but file contains DOMContentLoaded event.
You can add theme manually or run 'npx-install-dark-theme --force
    `)
  }
}

(async() => {
  if (!await fs.pathExists(filePath)) {
    log(`
Cannot find a file ${filePath}.
If your Slack version 4 or higher theme cannot be injected https://github.com/elv1n/slack-dark-mojave-theme/issues/7
`)
  }

  try {
    fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);

    // Restore backup with argument --rollback
    if (options.rollback) {
      return restoreBackUp();
    }

    const content = await fs.readFile(filePath, 'utf-8');
    // Check if anything runs on DOMContentLoaded
    // the same event will be used for applying theme
    if(content.includes('DOMContentLoaded')) {
      rewriteContent(content);
    } else {
      injectTheme();
    }
  } catch (e) {
    console.log(e);
    log(`Cannot get access to ${filePath}. Try with sudo or administrator power shell`)
  }
})();


