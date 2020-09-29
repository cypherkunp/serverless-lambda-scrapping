import chromium from 'chrome-aws-lambda';

import data from './listing-data.json';
import { sanitizeURL } from './utilities';

const { LAMBDA_ENVIRONMENT } = process.env;

const browserInit = async () => {
  let browser = null;

  if (LAMBDA_ENVIRONMENT === 'development') {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({ headless: false });
  } else {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  return browser;
};

module.exports.forEvent = async (event, context, callback) => {
  let result;
  let browser;

  try {
    browser = await browserInit();
    const { listing, locators, retailer_website } = data;

    const page = await browser.newPage();
    await page.goto(listing.listing_page_url);
    result = await page.title();
    console.log(result);

    // wait for element defined by XPath appear in page
    await page.waitForXPath(locators.product_listing_page_xpath);

    // evaluate XPath expression of the target selector (it return array of ElementHandle)
    const productLists = await page.$x(locators.product_listing_page_xpath);
    const productRelativeUrl = await page.evaluate((el) => el.value, productLists[0]);
    const productUrl = `${sanitizeURL(retailer_website)}${productRelativeUrl}`;

    await page.goto(productUrl);
    result = await page.title();

    const productLists = await page.$x(locators.product_listing_page_xpath);
    const productRelativeUrl = await page.evaluate((el) => el.value, productLists[0]);

    console.log(result);
  } catch (error) {
    console.log(error);
    return callback(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return callback(null, result);
};

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
