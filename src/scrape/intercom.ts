import { getBrowser } from "../browser";
import { absoluteIntercomUrl } from "../browser/urls";
import { URLAndThings } from "../types";
import { getLinksFromUrl } from "./content";

export const fetchIntercomSectionUrls = async () => {
  return getLinksFromUrl({
    url: absoluteIntercomUrl(""),
    containerSelector: ".educate_content",
    anchorSelector: ".educate_content a",
  });
};

export const getAllIntercomUrlsAndSelectors = async () => {
  const blogSectionLinks = await fetchIntercomSectionUrls();

  const topicLinks = await Promise.all(
    blogSectionLinks.map((url) => {
      return getLinksFromUrl({
        url: absoluteIntercomUrl(url),
        containerSelector: ".section__bg",
        anchorSelector: ".section__bg a",
      });
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
