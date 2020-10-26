import axios from "axios";

import { fetchTmdbGenres } from "../fetch-tmdb-genres";
import { TmdbGenre, TmdbGenreDoc } from "../../models/tmdb-genre";
import tmdbGenresApiResultSample from "./tmdb-genres.json";

describe("fetch tmdb genres", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    await fetchTmdbGenres("en-US");
    expect(axios).toHaveBeenCalled();
  });

  it.todo("should return null if no data provided");

  it.todo("should overwrite and return existing docs");

  it.todo("should publish event when updating doc");

  it("should create and return tmdb genre docs", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    const newDocs = (await fetchTmdbGenres("en-US")) as TmdbGenreDoc[];
    expect(newDocs.length).toBeGreaterThan(0);

    const count = await TmdbGenre.countDocuments({});
    expect(count).toBeGreaterThan(0);
  });

  it.todo("should publish event when creating doc");
});
