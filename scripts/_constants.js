const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const compareVersions = require('compare-versions');

const { join } = path;
const isDirectory = source => fs.lstatSync(source).isDirectory();

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

const systemType = os.type();
const dir = typesDir.hasOwnProperty(systemType) ? typesDir[systemType]() : null;
const RESOURCES = join(dir, 'resources');

const APP_TEMP = join(RESOURCES, 'temp.app.asar');

const INJECT_FILE = 'inject-theme.js';
const INJECT_REQ = `require('./${INJECT_FILE}');`;

exports.system = {
  dir,
  type: systemType
};

exports.paths = {
  APP: join(RESOURCES, 'app.asar'),
  APP_TEMP,
  BUNDLE: join(APP_TEMP, 'dist/ssb-interop.bundle.js'),
  BACKUP: join(APP_TEMP, 'dist/interop_themed_backup.bundle.js'),
  INJECT_REQ,
  INJECT_FILE
};
