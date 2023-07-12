'use strict';

// require packages
const cluster = require('node:cluster');

// require libraries
const log = require('../lib/log.js');
const App = require('./app.class.js');

const server = {
  _app: null,
  // set up app
  init: async function() {
    this._app = App.init();
    await this._app.start();
  },
  // set up app terminate function
  _isRunning: false,
  terminate: async function() {
    if (!this._isRunning && (this._isRunning = true)) {
      log.server(`worker process id: ${process.pid}(${cluster.worker.id}) terminating`);
      await this._app.stop();
      log.server(`worker process id: ${process.pid}(${cluster.worker.id}) terminated`);
      process.exit(0);
    } else {
      log.server(`worker process id: ${process.pid}(${cluster.worker.id}) terminate function called twice so skipping it`);
    }
  }
};

// The SIGTERM signal is a generic signal used to cause program termination when using systemctl stop
process.on('SIGTERM', async (signal) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await server.terminate();
});

// The SIGINT signal is a program interrupt triggered by the user when pressing ctrl-c
process.on('SIGINT', async (signal) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await server.terminate();
});

// The SIGQUIT signal is similar to SIGINT, except that it’s controlled by a different key—the QUIT character, usually ctrl-\
process.on('SIGQUIT', async (signal) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) got signal: ${signal}`);
  await server.terminate();
});

// uncaughtException signal
process.on('uncaughtException', async (err, origin) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) uncaughtException at: ${origin} err: ${err}`);
  await server.terminate();
});

// unhandledRejection signal
process.on('unhandledRejection', async (reason, promise) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) Unhandled Rejection at: `, promise, 'reason: ', reason);
  await server.terminate();
});

// The exit signal event is emitted when the Node.js process is about to exit
process.on('exit', (code) => {
  log.server(`worker process id: ${process.pid}(${cluster.worker.id}) exit event with code: ${code}`);
});

server.init();

module.exports = null;
