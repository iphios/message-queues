'use strict';

// require configs
const config = require('./../config/aws.js');

// require packages
require('./schema.js');
const {
  validate:jsonSchemaValidate
} = require('json-schema');
const log = require('./../lib/log.js');
const {
  SQSClient,
  GetQueueAttributesCommand,
  CreateQueueCommand,
  ListQueuesCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand
} = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient(config);

const info = async (queueUrl) => {
  const input = {
    QueueUrl: queueUrl,
    AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible']
  };

  const command = new GetQueueAttributesCommand(input);
  const response = await sqsClient.send(command);
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
    const command = new ListQueuesCommand(input);
    response = await sqsClient.send(command);

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
  const command = new CreateQueueCommand(input);

  const response = await sqsClient.send(command);
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

  const command = new SendMessageCommand(input);
  const response = await sqsClient.send(command);
  log.default(`MessageId: ${response.MessageId}, status: "queued", data: "${JSON.stringify(data)}"`);
  return response.MessageId;
};

const receive = async (queueUrl) => {
  const input = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10
  };

  const command = new ReceiveMessageCommand(input);
  const response = await sqsClient.send(command);
  return response.Messages;
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

  const command = new DeleteMessageCommand(input);
  await sqsClient.send(command);
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
