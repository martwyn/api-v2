require("dotenv").config();

import chunk from "lodash/chunk";
import wait from "waait";
import { absoluteSharesiesUrl } from "./browser/urls";
import { contentExists, insertContent } from "./db";
import { calculateEmbedding } from "./openai";
import { getAllLearnUrlsAndSelectors } from "./scrape/learn";
import { getAllBlogUrlsAndSelectors } from "./scrape/blog";
import { getContentFromUrl } from "./scrape/content";
import { pagesAndSelectors } from "./scrape/pages";
import { getAllIntercomUrlsAndSelectors } from "./scrape/intercom";

const goAndGatherAllTheData = async () => {
  // const learnLinks = await getAllLearnUrlsAndSelectors();
  // const blogLinks = await getAllBlogUrlsAndSelectors();
  // const pageLinks = pagesAndSelectors;
  const intercomLinks = await getAllIntercomUrlsAndSelectors();
  console.log(intercomLinks);
  const linkChunks = chunk([...intercomLinks], 5);

  for (let i = 0; i < linkChunks.length; i++) {
    console.log("🗿 Iterating over chunk");
    const contentFromUrls = (
      await Promise.all(
        linkChunks[i].map((link) =>
          getContentFromUrl(link.url, true, link.selector, link.elements || [])
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

console.log("🤲 starting");
goAndGatherAllTheData().then(() => {
  console.log("🤲 finished");
  process.exit();
});
