interface MovieIdsDataRaw {
  adult: boolean;
  id: number;
  original_title: string;
  popularity: number;
  video: boolean;
}

interface MovieIdsData {
  tmdbMovieId: number;
  originalTitle: string;
  adult: boolean;
  popularity: number;
}

const lineParser = (chunk: string): MovieIdsData | void => {
  const line = chunk.toString();

  const raw = JSON.parse(line) as MovieIdsDataRaw;

  const parsed = {
    tmdbMovieId: raw.id,
    originalTitle: raw.original_title,
    adult: raw.adult,
    popularity: raw.popularity,
  } as MovieIdsData;

  return parsed;
};

export { lineParser as movieIdsLineParser };
