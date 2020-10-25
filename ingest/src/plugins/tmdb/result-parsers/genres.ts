export interface TmdbGenresApiResultRaw {
  genres: {
    id: number;
    name: string;
  }[];
}

export interface TmdbGenresApiResult {
  genres: {
    id: number;
    name: string;
  }[];
}

const resultParser = (raw: TmdbGenresApiResultRaw): TmdbGenresApiResult => {
  const parsed = raw as TmdbGenresApiResult;

  return parsed;
};

export { resultParser as tmdbGenresResultParser };
