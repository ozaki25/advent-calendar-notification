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
    slack: {
      dev: {
        token: '${env:SLACK_API_TOKEN_DEV}',
        channel: '${env:SLACK_CHANNEL_DEV}',
        username: '${env:SLACK_USERNAME_DEV}',
      },
      production: {
        token: '${env:SLACK_API_TOKEN_PROD}',
        channel: '${env:SLACK_CHANNEL_PROD}',
        username: '${env:SLACK_USERNAME_PROD}',
      },
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
      TZ: 'Asia/Tokyo',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      TARGET_URL: 'https://qiita.com/advent-calendar/2020/mdc',
      SLACK_API_TOKEN: '${self:custom.slack.${self:provider.stage}.token}',
      SLACK_CHANNEL: '${self:custom.slack.${self:provider.stage}.channel}',
      SLACK_USERNAME: '${self:custom.slack.${self:provider.stage}.username}',
    },
  },
  functions: {
    main: {
      handler: 'handler.main',
      timeout: 60,
      layers: [{ Ref: 'AdventCalendarNotificationLambdaLayer' }],
      events: [{ schedule: 'cron(5 22 * * ? *)' }], // 毎朝7:05
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
