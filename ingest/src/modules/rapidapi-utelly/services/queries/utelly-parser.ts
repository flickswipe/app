/**
 * Types
 */

// raw data received by parser
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

// output data
export interface UtellyApiResult {
  locations: {
    displayName: string;
    name: string;
    id: string;
    url: string;
  }[];
}

/**
 * @param raw raw api result
 *
 * @returns {UtellyApiResult} parsed api result
 */
const parser = (raw: UtellyApiResultRaw): UtellyApiResult | void => {
  // ignore missing data
  if (!raw?.collection?.locations) {
    return null;
  }

  // parse
  const parsed = {
    locations: [],
  } as UtellyApiResult;

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

/**
 * Exports
 */
export { parser as utellyParser };
