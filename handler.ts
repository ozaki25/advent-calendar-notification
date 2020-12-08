import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  args,
  defaultViewport,
  executablePath,
  headless,
  puppeteer,
} from 'chrome-aws-lambda';
import { WebClient } from '@slack/web-api';

const {
  TARGET_URL,
  SLACK_API_TOKEN,
  SLACK_CHANNEL,
  SLACK_USERNAME,
} = process.env;

const slackClient = new WebClient(SLACK_API_TOKEN);

const excuteScraping = async () => {
  const browser = await puppeteer.launch({
    args,
    defaultViewport,
    executablePath: await executablePath,
    headless,
  });

  const page = await browser.newPage();
  await page.emulateTimezone('Asia/Tokyo');
  await page.goto(TARGET_URL);

  const article = await page.evaluate(() => {
    const days = document.querySelectorAll('.adventCalendarCalendar_day');
    const date = new Date().getDate();
    const target = days[date - 1].querySelector(
      '.adventCalendarCalendar_comment a',
    );
    if (!target) return null;
    return { title: target.text, url: target.href, date };
  });
  await browser.close();
  return article;
};

const excuteSlackNotification = async (text: string) => {
  console.log({ text });
  return await slackClient.chat.postMessage({
    text,
    channel: SLACK_CHANNEL,
    username: SLACK_USERNAME,
    unfurl_links: true,
  });
};

export const main: APIGatewayProxyHandler = async () => {
  const d = new Date();
  console.log(d);
  console.log(d.getDate());
  console.log(d.getHours());
  console.log(d.getMinutes());

  const article = await excuteScraping();

  console.log(article);
  if (!article) return { statusCode: 200, body: '記事が投稿されてません' };

  const { title, url, date } = article;
  const text = `MDC Advent Calendar 2020 ${date}日目の記事です！
<${url}|${title}>`;
  await excuteSlackNotification(text);

  return {
    statusCode: 200,
    body: JSON.stringify({ text, title, url, date }),
  };
};
