'use strict';

// require packages
const cluster = require('node:cluster');
const os = require('node:os');

// require libraries
const log = require('./../lib/log.js');

const numCPUs = 1 || os.cpus().length;

// https://nodejs.org/api/cluster.html#clusterisprimary
if (cluster.isPrimary) {
  log.cluster(`primary process id: ${process.pid} is started`);

  cluster.on('fork', (worker) => {
    log.cluster(`worker process id: ${worker.id} -> ${worker.process.pid} is forked`);
  });

  cluster.on('online', (worker) => {
    log.cluster(`worker process id: ${worker.id} -> ${worker.process.pid} is online after it was forked`);
  });

  cluster.on('listening', (worker, address) => {
    log.cluster(`worker process id: ${worker.id} -> ${worker.process.pid} is now listening on port: ${address.port}`);
  });

  cluster.on('disconnect', (worker) => {
    log.cluster(`worker process id: ${worker.id} -> ${worker.process.pid} has disconnected`);
  });

  cluster.on('exit', (worker, code, signal) => {
    log.cluster(`worker process id: ${worker.id} -> ${worker.process.pid} is offline with code: ${code} and singal: ${signal}`);
  });

  // The SIGHUP is caused due to nodemon restart, which is the custom signal present in nodemon.json file, SIGUSR2 is the default signal present in nodemon lib/config/defaults.js file
  process.on('SIGHUP', (signal) => {
    log.cluster(`primary process id: ${process.pid} got signal: ${signal}`);

    for (const worker of Object.values(cluster.workers)) {
      worker.process.kill('SIGTERM');
    }
  });

  // fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else if (cluster.isWorker) {
  require('./server.js');
}

module.exports = null;
