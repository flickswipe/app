import axios from "axios";

import { fetchTmdbGenres } from "../fetch-tmdb-genres";
import { fetchTmdbMovie } from "../fetch-tmdb-movie";
import { TmdbGenre } from "../../models/tmdb-genre";
import { TmdbMovie } from "../../models/tmdb-movie";
import tmdbGenresApiResultSample from "./tmdb-genres.json";
import tmdbMovieApiResultSample from "./tmdb-movie.json";

describe("ingest data from tmdb", () => {
  it("should ingest tmdb movie data", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbMovieApiResultSample,
    });

    await fetchTmdbMovie(550);
    expect(axios).toHaveBeenCalled();

    const count = await TmdbMovie.countDocuments({});
    expect(count).toBe(1);

    const doc = await TmdbMovie.findOne({});
    expect(doc?.tmdbMovieId).toBe(550);
    expect(doc?.timesUsed).toBe(0);
  });

  it("should ingest tmdb genres data", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    await fetchTmdbGenres("en");
    expect(axios).toHaveBeenCalled();

    const count = await TmdbGenre.countDocuments({});
    expect(count).toBe(19);

    const doc = await TmdbGenre.findOne({});
    expect(doc?.tmdbGenreId).toBeDefined();
    expect(doc?.name).toBeDefined();
  });
});
