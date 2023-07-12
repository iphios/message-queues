'use strict';

const debug = require('debug');

const MODULE_NAMES = ['default', 'cluster', 'server'];

const log = MODULE_NAMES.reduce((log, module) => {
  log[module] = debug(module);
  return log;
}, {});

module.exports = log;
