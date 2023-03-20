export const sharesiesPrefix = "https://www.sharesies.nz";
export const intercomPrefix = "https://intercom.help/sharesies/en";

const absoluteFromPrefix = (url: string, prefix: string) => {
  if (url.startsWith(prefix)) {
    return url;
  }

  return `${prefix}${url}`;
};

export const absoluteSharesiesUrl = (url: string) =>
  absoluteFromPrefix(url, sharesiesPrefix);
export const absoluteIntercomUrl = (url: string) =>
  absoluteFromPrefix(url, intercomPrefix);
