import axios from "axios";

import { fetchTmdbMovie } from "../fetch-tmdb-movie";
import { TmdbMovie, TmdbMovieDoc } from "../../models/tmdb-movie";
import tmdbMovieApiResultSample from "./tmdb-movie.json";

describe("fetch tmdb movie", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbMovieApiResultSample,
    });

    await fetchTmdbMovie(550);
    expect(axios).toHaveBeenCalled();
  });

  it.todo("should return null if no data provided");

  it.todo("should skip if data is irrelevant now");

  it.todo("should skip if data is irrelevant forever");

  it.todo(
    "should set `neverUse=true` on movie id docs that are irrelevant forever"
  );

  it.todo(
    "should set `neverUse=true` on tmdb movie docs that are irrelevant forever"
  );

  it.todo(
    "should publish an event for movies that were previous emitted but are now irrelevant forever"
  );

  it.todo("should overwrite and return existing docs");

  it("should create and return single tmdb movie doc", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbMovieApiResultSample,
    });

    const newDoc = (await fetchTmdbMovie(550)) as TmdbMovieDoc;
    expect(newDoc).toBeDefined();
    expect(newDoc.tmdbMovieId).toBe(550);

    const count = await TmdbMovie.countDocuments({});
    expect(count).toBe(1);

    const doc = (await TmdbMovie.findOne({})) as TmdbMovieDoc;
    expect(doc.tmdbMovieId).toBe(550);
  });
});
