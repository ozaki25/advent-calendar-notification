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
    region: 'ap-northeast-1',
    stage: '${opt:stage, self:custom.defaultStage}',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      STAGE: '${self:provider.stage}',
      LAYER_NAME: '${self:service}-${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    main: {
      handler: 'handler.main',
      timeout: 60,
      layers: [{ Ref: 'AdventCalendarNotificationLambdaLayer' }],
    },
  },
  layers: {
    adventCalendarNotification: {
      path: 'layers',
      name: '${self:provider.environment.LAYER_NAME}',
    },
  },
};

module.exports = serverlessConfiguration;
