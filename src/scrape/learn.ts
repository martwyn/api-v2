import { getBrowser } from "../browser";
import { absoluteSharesiesUrl } from "../browser/urls";
import { URLAndThings } from "../types";
import { getLinksFromUrl } from "./content";

export const fetchLearnSectionUrls = async () => {
  return getLinksFromUrl({
    url: absoluteSharesiesUrl("/learn"),
    containerSelector: ".ArticleSearchLarge_list__rUhM0",
    anchorSelector: ".ArticleSearchLarge_list__rUhM0 a",
  });
};

export const getAllLearnUrlsAndSelectors = async () => {
  const learnSectionLinks = await fetchLearnSectionUrls();

  const topicLinks = (
    await Promise.all(
      learnSectionLinks.map((url) => {
        return getLinksFromUrl({
          url: absoluteSharesiesUrl(url),
          containerSelector: ".CategoryPage_list__nPLJW",
          anchorSelector: ".CategoryPage_list__nPLJW a",
        });
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
