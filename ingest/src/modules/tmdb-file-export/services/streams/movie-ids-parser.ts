/**
 * Types
 */

// raw data received by parser
export interface MovieIdsDataRaw {
  adult: boolean;
  id: number;
  original_title: string;
  popularity: number;
  video: boolean;
}

// output data
export interface MovieIdsData {
  tmdbMovieId: number;
  originalTitle: string;
  adult: boolean;
  popularity: number;
}

/**
 * @param chunk chunk to parse
 *
 * @returns {MovieIdsData} parseed data
 */
const parser = (chunk: string): MovieIdsData | void => {
  // get raw data
  const raw = JSON.parse(chunk.toString()) as MovieIdsDataRaw;

  // format raw data
  const parsed = {
    tmdbMovieId: raw.id,
    originalTitle: raw.original_title,
    adult: raw.adult,
    popularity: raw.popularity,
  } as MovieIdsData;

  return parsed;
};

/**
 * Exports
 */
export { parser as movieIdsParser };
