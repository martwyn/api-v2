import { getBrowser } from "../browser";
import { absoluteSharesiesUrl } from "../browser/urls";
import { URLAndThings } from "../types";

export const fetchLearnSectionUrls = async () => {
  const url = absoluteSharesiesUrl("/learn");
  const ulSelector = ".ArticleSearchLarge_list__rUhM0";
  const anchorSelector = ".ArticleSearchLarge_list__rUhM0 a";

  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("📚 Getting learn content URLs");
  try {
    await page.goto(absoluteSharesiesUrl(url), {
      waitUntil: "domcontentloaded",
    });
  } catch (e) {
    console.error("👠 Error going to page, trying again");
    await page.goto(absoluteSharesiesUrl(url), {
      waitUntil: "domcontentloaded",
    });
  }
  await page.waitForSelector(ulSelector);

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
  const url = absoluteSharesiesUrl(topicUrl);
  const ulSelector = ".CategoryPage_list__nPLJW";
  const anchorSelector = ".CategoryPage_list__nPLJW a";

  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("🤪 Getting learn topic URLs");
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(ulSelector);

  const anchorHandles = await page.$$(anchorSelector);
  const links = await Promise.all(
    anchorHandles.map((handle) =>
      page.evaluate((anchor) => anchor.getAttribute("href"), handle)
    )
  );

  await page.close();

  return links;
};

export const getAllLearnUrlsAndSelectors = async () => {
  const learnSectionLinks = await fetchLearnSectionUrls();

  const topicLinks = (
    await Promise.all(
      learnSectionLinks.map((url) => {
        return getTopicUrls(url);
      })
    )
  ).flat();

  return topicLinks.map(
    (t) =>
      ({
        url: t,
        selector: [".LearnArticle_body__3DXEQ"],
        elements: ["H2", "H3", "P"],
      } as URLAndThings)
  );
};
