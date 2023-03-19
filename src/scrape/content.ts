import { getBrowser } from "../browser";
import { absoluteSharesiesUrl } from "../browser/urls";

const headerEls: string[] = ["H1", "H2", "H3"];

type SourceContent = {
  content: string;
  source: string;
};

export const getContentFromUrl = async (
  url: string,
  chunkOnHeaders: boolean = true,
  selectors: string[],
  elements: string[]
) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("📃 Getting content from url", url);
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
  } catch (e) {
    console.error("👠 Error going to page, trying again");
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
  }

  await page.waitForSelector(selectors[0]);

  const contentArr = await Promise.all(
    selectors.map(async (selector) => {
      const allSelectors = elements.length
        ? elements.map((el) => `${selector} ${el}`).join(", ")
        : selector;
      const handles = await page.$$(allSelectors);
      const allToReturn: string[] = [];
      let current = "";
      let previousTagName = "";
      await Promise.all(
        handles.map(async (handle, i) => {
          const { tagName, textContent } = await handle.evaluate((e) => {
            return {
              tagName: e.tagName,
              textContent: e.textContent.replace(/<img .*?>/g, " "),
            };
          });

          if (
            (headerEls.includes(tagName) &&
              chunkOnHeaders &&
              current.length &&
              !headerEls.includes(previousTagName)) ||
            current.length > 500
          ) {
            allToReturn.push(current);
            current = "";
          }

          if (handles.length === i + 1) {
            allToReturn.push(textContent);
          }

          current = `${current} ${textContent}`;
          previousTagName = tagName;
        })
      );
      return allToReturn;
    })
  );

  return contentArr.flat().map(
    (content) =>
      ({
        content,
        source: url,
      } as SourceContent)
  );
};
