/**
 * Types
 */

// raw data received by parser
export interface TmdbGenresApiResultRaw {
  genres: {
    id: number;
    name: string;
  }[];
}

// output data
export interface TmdbGenresApiResult {
  genres: {
    id: number;
    name: string;
  }[];
}

/**
 * @param raw raw api result
 *
 * @returns {TmdbGenresApiResult} parsed api result
 */
const parser = async (
  raw: TmdbGenresApiResultRaw
): Promise<TmdbGenresApiResult> => {
  // No parsing!
  return raw as TmdbGenresApiResult;
};

/**
 * Exports
 */
export { parser as tmdbGenresParser };
