'use strict';

// require configs
const config = require('./../config/aws.js');

const {
  SQSClient,
  GetQueueAttributesCommand,
  CreateQueueCommand,
  ListQueuesCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand
} = require('@aws-sdk/client-sqs');

module.exports = {
  sqs: {
    client: new SQSClient({
      region: config.region,
      credentials: config.credentials
    }),
    getQueueAttributesCommand: GetQueueAttributesCommand,
    createQueueCommand: CreateQueueCommand,
    listQueuesCommand: ListQueuesCommand,
    sendMessageCommand: SendMessageCommand,
    receiveMessageCommand: ReceiveMessageCommand,
    deleteMessageCommand: DeleteMessageCommand
  }
};
