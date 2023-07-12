'use strict';

const {
  add
} = require('json-schema');

add('message:send', {
  type: 'object',
  properties: {
    queueUrl: {
      type: 'string'
    },
    messageDeduplicationId: {
      type: 'string'
    },
    messageGroupId: {
      type: 'string'
    },
    message: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            className: {
              type: 'string'
            }
          },
          additionalProperties: true,
          required: ['className']
        },
        payload: {
          type: 'object',
          properties: {},
          additionalProperties: true,
          required: []
        }
      },
      required: ['meta', 'payload']
    }
  },
  required: ['queueUrl', 'message']
});

module.exports = null;
