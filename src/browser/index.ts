import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;

export const getBrowser = async () => {
  if (browser) {
    return browser;
  }
  console.log("💻 Setting up browser");
  browser = await puppeteer.launch({
    headless: true,
    // You'll have to change this if you have Chrome stored in a different place. This
    // is correct for me on MacOS
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  return browser;
};
