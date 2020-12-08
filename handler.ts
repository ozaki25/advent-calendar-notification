import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  args,
  defaultViewport,
  executablePath,
  headless,
  puppeteer,
} from 'chrome-aws-lambda';

const { TARGET_URL } = process.env;

export const main: APIGatewayProxyHandler = async () => {
  const browser = await puppeteer.launch({
    args,
    defaultViewport,
    executablePath: await executablePath,
    headless,
  });

  const page = await browser.newPage();
  await page.goto(TARGET_URL);
  const result = await page.evaluate(() => {
    const days = document.querySelectorAll('.adventCalendarCalendar_day');
    const date = new Date().getDate() - 1;
    const target = days[date].querySelector(
      '.adventCalendarCalendar_comment a',
    );
    if (!target) return null;
    return { title: target.text, url: target.href, date };
  });
  console.log(result);
  await browser.close();

  if (!result) return { statusCode: 200, body: '記事が投稿されてません' };

  const { title, url, date } = result;
  return {
    statusCode: 200,
    body: JSON.stringify({ title, url, date }),
  };
};
