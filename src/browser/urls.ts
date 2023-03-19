export const sharesiesPrefix = "https://www.sharesies.nz";
export const intercomPrefix = "https://intercom.help/sharesies/en/";

export const absoluteSharesiesUrl = (url: string) => {
  if (url.startsWith(sharesiesPrefix)) {
    return url;
  }

  return `${sharesiesPrefix}${url}`;
};

export const absoluteIntercomUrl = (url: string) => {
  if (url.startsWith(intercomPrefix)) {
    return url;
  }

  return `${intercomPrefix}${url}`;
};
