'use strict';

// require packages
const fs = require('node:fs');
const path = require('node:path');
const messageQueues = require('./../src/message-queues.js');
const log = require('../lib/log.js');
const {
  Promise
} = require('bluebird');

const WORKER_FOLDER_NAME = 'workers';
const WORKER_CLASS_METHODS = ['constructor', 'start', 'processMessage', 'stop'];

const workerFolderPath = path.join(process.cwd(), WORKER_FOLDER_NAME);

const App = class {
  static async init(...args) {
    const app = new App(...args);
    return app;
  }

  #queueUrl = null;
  #workers = {};
  #stopped = true;
  #pollingTimeoutId = undefined;

  constructor(queueUrl) {
    this.#queueUrl = queueUrl;
  }

  async init() {
    this.#initWorkerFolder();
    this.#setWorkerClasses();
    await this.#startWorkers();
  }

  #initWorkerFolder() {
    if (!fs.existsSync(workerFolderPath)) {
      log.app('worker folder created');
      fs.mkdirSync(workerFolderPath, {
        recursive: false
      });
    }
  }

  #setWorkerClasses() {
    fs.readdirSync(workerFolderPath).forEach(file => {
      const classRef = require(path.join(workerFolderPath, file));

      const check = WORKER_CLASS_METHODS.every(workerClassMethod => {
        return typeof classRef.prototype[workerClassMethod] === 'function';
      });
      if (!check) {
        log.app(`skipped "${classRef.name}" worker since it doesn't have following methods "${WORKER_CLASS_METHODS.join(', ')}"`);
        return;
      }

      this.#workers[classRef.name] = new classRef();
      log.app(`added "${classRef.name}" worker`);
    });
  }

  async #startWorkers() {
    await Promise.all(Object.entries(this.#workers).map(async ([className, classObj]) => {
      log.app(`called "${className}" worker start`);
      await classObj.start();
    }));
  }

  async start() {
    if (this.#stopped === false) {
      log.app('already_started');
      return;
    }

    this.#stopped = false;
    log.app('starting');
    await this.#poll();
  }

  async stop() {
    if (this.#stopped === true) {
      log.app('already_stopped');
      return;
    }

    this.#stopped = false;
    log.app('stoping');
    clearTimeout(this.#pollingTimeoutId);
  }

  async #poll() {
    log.app('polling');

    const messages = await messageQueues.message.receive(this.#queueUrl);
    await this.#processMessages(messages);
    this.#pollingTimeoutId = setTimeout(this.#poll.bind(this), 3e3);
  }

  async #processMessages(messages) {
    await Promise.all(messages.map(async message => {
      log.messageQueue(`MessageId: ${message.MessageId}, status: "processing", body: "${message.Body}"`);
      const {
        meta,
        payload
      } = JSON.parse(message.Body);

      let status = false;
      try {
        status = await this.#workers[meta.className]?.processMessage(payload);
      } catch(err) {
        log.messageQueue(`MessageId: ${message.MessageId}, error: ${err.message}`);
      } finally {
        log.messageQueue(`MessageId: ${message.MessageId}, status: "${status === true ? 'success' : 'failed'}"`);
      }
      if (status === true) {
        await messageQueues.message.remove({
          queueUrl: this.#queueUrl,
          receiptHandle: message.ReceiptHandle
        });
      }
    }));
  }
};

module.exports = App;
