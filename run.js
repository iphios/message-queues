'use strict';

process.env.DEBUG='*';
process.env.AWS_REGION='ap-south-1';
process.env.AWS_ACCESS_KEY_ID='AKIASTI3N75NDR2MHQKA';
process.env.AWS_SECRET_ACCESS_KEY='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';

const messageQueues = require('./index.js');
(async () => {

  // const response = await messageQueues.queue.create('demo');

  // const response = await messageQueues.queue.list();
  // console.log(response)
  // const response = await messageQueues.message.send({
  //   queueUrl: 'https://sqs.ap-south-1.amazonaws.com/178835554138/demo.fifo',
  //   message: {
  //     meta: {
  //       className: 'saikiran'
  //     },
  //     payload: {
  //       a: 'b'
  //     }
  //   }
  // });

  // const response = await messageQueues.message.receive('https://sqs.ap-south-1.amazonaws.com/178835554138/demo.fifo');
  // console.log(response)

  // const response1 = await messageQueues.queue.info('https://sqs.ap-south-1.amazonaws.com/178835554138/demo.fifo');
  // console.log(response1)

  // await messageQueues.message.remove({
  //   queueUrl: 'https://sqs.ap-south-1.amazonaws.com/178835554138/demo.fifo',
  //   receiptHandle: 'AQEBxeh2kenZz4cLgeH79xEH7qGu/u92KZNg3qNFfr64FLy3PTowxvaI3XAQbykYGeCchEaIUvUHbV/XWsuzADu+aGywC9e3HxPCCl6IO7qYcFEBLjB7EqYwlbLDUgs8pliuG2YZFIotkAlU9Pq5vjOTyfCOy9LbwDKiTuHAU+YeHTBI/u40HREfJIUPNIGcPl4T6sqMF9lzZiP9oJKyCLbIOc88yqW5igmk2OkCkXjwPVGNxZlS4diNnzGmG+zjIWYpNVXMlX5eSU8O1mv7GsKlMw=='
  // });
})();
