import { getBrowser } from "../browser";

const headerEls: string[] = ["H1", "H2", "H3"];

type SourceContent = {
  content: string;
  source: string;
};

type GetContentFromUrlOptions = {
  url: string;
  chunkOnHeaders: boolean;
  selectors: string[];
  elements: string[];
};

export const getContentFromUrl = async ({
  url,
  chunkOnHeaders,
  selectors,
  elements,
}: GetContentFromUrlOptions) => {
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

          // This attempts to be a teeny bit smart. If we are chunking on headers,
          // this will try and get embedded content from one header to the next,
          // unless the next element is also a header. It _should_ mean we have content
          // chunked into semi standalone parts. Big assumption here though in that
          // relevant content follows a heading.
          // We also chunk when we get over 500 characters
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

type GetLinksFromUrlOptions = {
  url: string;
  containerSelector: string;
  anchorSelector: string;
};

export const getLinksFromUrl = async ({
  url,
  containerSelector,
  anchorSelector,
}: GetLinksFromUrlOptions) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log("🦄 Getting links from URL", url);
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
