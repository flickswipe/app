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
    tmdbGenreId: number;
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
  return {
    genres: raw.genres.map((genre) => ({
      tmdbGenreId: genre.id,
      name: genre.name,
    })),
  } as TmdbGenresApiResult;
};

/**
 * Exports
 */
export { parser as tmdbGenresParser };
