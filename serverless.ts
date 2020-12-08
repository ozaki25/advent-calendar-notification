import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'advent-calendar-notification',
  frameworkVersion: '2',
  custom: {
    defaultStage: 'dev',
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'aa',
    stage: '${opt:stage, self:custom.defaultStage}',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      STAGE: '${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    hello: {
      handler: 'handler.hello',
      events: [
        {
          http: {
            method: 'get',
            path: 'hello',
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
