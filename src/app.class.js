'use strict';

// require packages
const fs = require('node:fs');
const path = require('node:path');

const WORKER_FOLDER_NAME = 'workers';

const defaultWorkerFolderPath = path.join(process.cwd(), WORKER_FOLDER_NAME);

const App = class {
  static init(...args) {
    return new App(...args);
  }

  #workers = {};

  constructor() {
    this.#createWorkerFolder();
  }

  #createWorkerFolder() {
    console.log(defaultWorkerFolderPath);
    console.log(process.env.HASH_SALT);
    if (!fs.existsSync(defaultWorkerFolderPath)) {
      fs.mkdirSync(defaultWorkerFolderPath, {
        recursive: false
      });
    }
  }

  async start() {

  }
  async stop() {

  }
};

module.exports = App;
