#!/usr/bin/env node
/**
 * @author Craig Thayer <cthayer@sazze.com>
 * @copyright 2015 Sazze, Inc.
 */

var path = require('path');
var execSync = require('child_process').execSync;

var rootDir = path.join(__dirname, '..');
var origCwd = process.cwd();

process.chdir(path.join(rootDir, 'node_modules', 'engine.io-client'));

try {
  var stdout = execSync('patch -p1 < ' + path.join(rootDir, 'patches', 'engine.io-client', '1.5.2-master-2015-07-06.patch'));
} catch (e) {
  console.log(e);
  stdout = '';
}

console.log(stdout.toString());

stdout = execSync('npm install');

console.log(stdout.toString());

process.chdir(origCwd);