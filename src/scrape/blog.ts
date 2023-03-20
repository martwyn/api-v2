import { getBrowser } from "../browser";
import { absoluteSharesiesUrl } from "../browser/urls";
import { URLAndThings } from "../types";
import { getLinksFromUrl } from "./content";

export const fetchBlogSectionUrls = async () => {
  return getLinksFromUrl({
    url: absoluteSharesiesUrl("/blog"),
    containerSelector: ".ArticleSearchLarge_list__rUhM0",
    anchorSelector: ".ArticleSearchLarge_list__rUhM0 a",
  });
};

export const getAllBlogUrlsAndSelectors = async () => {
  const blogSectionLinks = await fetchBlogSectionUrls();

  const topicLinks = await Promise.all(
    blogSectionLinks.map((url) => {
      return getLinksFromUrl({
        url: absoluteSharesiesUrl(url),
        containerSelector: ".CategoryPage_list__nPLJW",
        anchorSelector: ".CategoryPage_list__nPLJW a",
      });
    })
  );

  return topicLinks.flat().map(
    (t) =>
      ({
        url: t,
        selector: [".LearnArticle_body__3DXEQ"],
        elements: ["H2", "H3", "P"],
      } as URLAndThings)
  );
};
