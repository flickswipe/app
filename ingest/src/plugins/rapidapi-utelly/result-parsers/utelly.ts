export interface UtellyApiResultRaw {
  collection: {
    id: string;
    picture: string;
    name: string;
    locations: {
      icon: string;
      display_name: string;
      name: string;
      id: string;
      url: string;
    }[];
    provider: string;
    weight: number;
    source_ids: {
      imdb: {
        url: string;
        id: string;
      };
    };
  };
  type: string;
  id: string;
  status_code: string;
  variant: string;
}

export interface UtellyApiResult {
  locations: {
    displayName: string;
    name: string;
    id: string;
    url: string;
  }[];
}

const resultParser = (raw: UtellyApiResultRaw): UtellyApiResult | void => {
  const parsed = {
    locations: [],
  } as UtellyApiResult;

  if (!raw?.collection?.locations) return null;

  raw.collection.locations.forEach(({ display_name, name, id, url }) => {
    parsed.locations.push({
      displayName: display_name,
      name: name,
      id: id,
      url: url,
    });
  });

  return parsed;
};

export { resultParser as utellyResultParser };
