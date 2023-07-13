'use strict';

// require packages
require('./schema.js');
const {
  validate:jsonSchemaValidate
} = require('json-schema');
const log = require('./../lib/log.js');
const aws = require('./../lib/aws.js');

const info = async (queueUrl) => {
  const input = {
    QueueUrl: queueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
  };

  const command = aws.sqs.getQueueAttributesCommand(input);
  const response = await aws.sqs.client.send(command);
  return {
    approximateNumberOfMessages: response.Attributes.ApproximateNumberOfMessages,
    approximateNumberOfMessagesNotVisible: response.Attributes.ApproximateNumberOfMessagesNotVisible
  };
};

const list = async () => {
  const output = [];

  const input = {
    QueueNamePrefix: '',
    MaxResults: 1000
  };
  let response = null;
  do {
    const command = new aws.sqs.listQueuesCommand(input);
    response = await aws.sqs.client.send(command);

    if (Object.hasOwn(response, 'QueueUrls')) {
      output.push(...response.QueueUrls);
    }
    if (Object.hasOwn(response, 'NextToken')) {
      input.NextToken = response.NextToken;
    }
  } while (Object.hasOwn(response, 'NextToken'));

  return output;
};

const create = async (queueName) => {
  const input = {
    QueueName: `${queueName}.fifo`,
    Attributes: {
      DelaySeconds: 0,
      // 256 kb
      MaximumMessageSize: 256 * 1024,
      // 14 days
      MessageRetentionPeriod: 14 * 24 * 60 * 60,
      ReceiveMessageWaitTimeSeconds: 20,
      // 5 min
      VisibilityTimeout: 5 * 60,
      SqsManagedSseEnabled: false,
      FifoQueue: true,
      ContentBasedDeduplication: true,
      DeduplicationScope: 'messageGroup',
      FifoThroughputLimit: 'perMessageGroupId'
    }
  };
  const command = new aws.sqs.createQueueCommand(input);

  const response = await aws.sqs.client.send(command);
  return response.QueueUrl;
};

/**
 * @function
 * @desc this method is used to send message to queue.
 * @param {Object} data - message data.
 * @param {string} data.queueUrl - AWS SQS queue url.
 * @param {string} data.messageDeduplicationId - it allows you to specify a custom ID that AWS SQS uses to detect and eliminate duplicate messages.
 * @param {string} data.messageGroupId - it is an attribute used for message grouping within an SQS queue.
 * @param {Object} data.message - message object.
 * @param {Object} data.message.meta - message meta object.
 * @param {string} data.message.meta.className - execution class name.
 * @param {Object} data.message.payload - message payload data.
 * @returns {string} MessageId.
 */
const send = async (data) => {
  jsonSchemaValidate('message:send', data);
  const input = {
    MessageBody: JSON.stringify(data.message),
    QueueUrl: data.queueUrl,
    MessageGroupId: data?.messageGroupId | 'default'
  };
  if (Object.hasOwn(data, 'messageDeduplicationId')) {
    input.MessageDeduplicationId = data.messageDeduplicationId;
  }

  const command = new aws.sqs.sendMessageCommand(input);
  const response = await aws.sqs.client.send(command);
  log.messageQueue(`MessageId: ${response.MessageId}, status: "queued", body: "${JSON.stringify(data.message)}"`);
  return response.MessageId;
};

const receive = async (queueUrl) => {
  const input = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10
  };

  const command = new aws.sqs.receiveMessageCommand(input);
  const response = await aws.sqs.client.send(command);
  return response?.Messages || [];
};

/**
 * @function
 * @desc this method is used to send message to queue.
 * @param {Object} data - message data.
 * @param {string} data.queueUrl - AWS SQS queue url.
 * @param {string} data.receiptHandle - The receipt handle associated with the message to delete..
 */
const remove = async (data) => {
  const input = {
    QueueUrl: data.queueUrl,
    ReceiptHandle: data.receiptHandle
  };

  const command = new aws.sqs.deleteMessageCommand(input);
  await aws.sqs.client.send(command);
};

module.exports = {
  queue: {
    info,
    list,
    create
  },
  message: {
    send,
    receive,
    remove
  }
};
