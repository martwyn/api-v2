require("dotenv").config();

import chunk from "lodash/chunk";
import wait from "waait";
import { contentExists, insertContent } from "./db";
import { calculateEmbedding } from "./openai";
import { getAllLearnUrlsAndSelectors } from "./scrape/learn";
import { getAllBlogUrlsAndSelectors } from "./scrape/blog";
import { getContentFromUrl } from "./scrape/content";
import { pagesAndSelectors } from "./scrape/pages";
import { getAllIntercomUrlsAndSelectors } from "./scrape/intercom";

const goAndGatherAllTheData = async () => {
  const learnLinks = await getAllLearnUrlsAndSelectors();
  const blogLinks = await getAllBlogUrlsAndSelectors();
  const pageLinks = pagesAndSelectors;
  const intercomLinks = await getAllIntercomUrlsAndSelectors();
  const linkChunks = chunk(
    [...learnLinks, ...blogLinks, ...pageLinks, ...intercomLinks],
    5
  );

  for (let i = 0; i < linkChunks.length; i++) {
    console.log("🗿 Iterating over chunk");
    const contentFromUrls = (
      await Promise.all(
        linkChunks[i].map((link) =>
          getContentFromUrl({
            url: link.url,
            chunkOnHeaders: true,
            selectors: link.selector,
            elements: link.elements || [],
          })
        )
      )
    ).flat();

    for (let j = 0; j < contentFromUrls.length; j++) {
      const t = contentFromUrls[j];
      const alreadyExists = await contentExists(t.content);
      if (alreadyExists) {
        console.log("🪖 Content already exists. Skipping");
        continue;
      }
      const embedding = await calculateEmbedding(t.content);
      await insertContent(t.content, t.source, embedding);
      await wait(2000);
    }
  }
};

console.log("🤲 Gathering starting");
goAndGatherAllTheData().then(() => {
  console.log("🤙 Gathering finished");
  process.exit();
});
