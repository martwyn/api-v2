import { getBrowser } from "../browser";
import { absoluteIntercomUrl } from "../browser/urls";
import { URLAndThings } from "../types";

export const fetchIntercomSectionUrls = async () => {
  const url = absoluteIntercomUrl("");
  const containerSelector = ".educate_content";
  const anchorSelector = ".educate_content a";

  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("🎤 Getting Intercom section URLs");
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(containerSelector);

  const anchorHandles = await page.$$(anchorSelector);
  const links = await Promise.all(
    anchorHandles
      .slice(1)
      .map((handle) =>
        page.evaluate((anchor) => anchor.getAttribute("href"), handle)
      )
  );

  await page.close();
  return links;
};

export const getTopicUrls = async (topicUrl: string) => {
  const url = absoluteIntercomUrl(topicUrl);
  const containerSelector = ".section__bg";
  const anchorSelector = ".section__bg a";

  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("🥹 Getting blog topic URLs");
  try {
    await page.goto(absoluteIntercomUrl(url), {
      waitUntil: "domcontentloaded",
    });
  } catch (e) {
    console.error("👠 Error going to page, trying again");
    await page.goto(absoluteIntercomUrl(url), {
      waitUntil: "domcontentloaded",
    });
  }
  await page.waitForSelector(containerSelector);

  const anchorHandles = await page.$$(anchorSelector);
  const links = await Promise.all(
    anchorHandles.map((handle) =>
      page.evaluate((anchor) => anchor.getAttribute("href"), handle)
    )
  );

  await page.close();

  return links;
};

export const getAllIntercomUrlsAndSelectors = async () => {
  const blogSectionLinks = await fetchIntercomSectionUrls();

  const topicLinks = await Promise.all(
    blogSectionLinks.map((url) => {
      return getTopicUrls(url);
    })
  );

  return topicLinks.flat().map(
    (t) =>
      ({
        url: t,
        selector: [".content"],
        elements: ["H1", "H2", "H3", "P", "LI"],
      } as URLAndThings)
  );
};
