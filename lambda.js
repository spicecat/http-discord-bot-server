'use strict'
const { createServer, proxy } = require('aws-serverless-express');
const app = require('./app');
const binaryMimeTypes = [
    'application/octet-stream',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
];
const server = createServer(app, null, binaryMimeTypes);
exports.handler = (event, context) => proxy(server, event, context);