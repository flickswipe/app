import axios from "axios";

import { fetchTmdbGenres } from "../fetch-tmdb-genres";
import { TmdbGenre, TmdbGenreDoc } from "../../models/tmdb-genre";
import tmdbGenresApiResultSample from "./tmdb-genres.json";
import { natsWrapper } from "../../../../nats-wrapper";

describe("fetch tmdb genres", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    await fetchTmdbGenres("en-US");
    expect(axios).toHaveBeenCalled();
  });

  it("should return null if no data provided", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({});

    const result = await fetchTmdbGenres("en-US");

    expect(result).toBeNull();
  });

  it("should overwrite existing doc and return", async () => {
    const existingDocAttrs = {
      tmdbGenreId: 69,
      name: "My Genre",
      language: "en-US",
    };

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: {
        genres: [
          {
            id: 69,
            name: "My Overwritten Genre",
          },
        ],
      },
    });

    await TmdbGenre.build(existingDocAttrs).save();

    const result = await fetchTmdbGenres("en-US");

    const overwrittenDoc = await TmdbGenre.findOne({
      tmdbGenreId: 69,
      language: "en-US",
    });

    // has been overwritten
    expect(overwrittenDoc.name).toBe("My Overwritten Genre");

    // has been returned
    expect(overwrittenDoc.id).toEqual(result[0].id);
  });

  it("should publish event when updating doc", async () => {
    const existingDocAttrs = {
      tmdbGenreId: 69,
      name: "My Genre",
      language: "en-US",
    };

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: {
        genres: [
          {
            id: 69,
            name: "My Overwritten Genre",
          },
        ],
      },
    });

    await TmdbGenre.build(existingDocAttrs).save();

    await fetchTmdbGenres("en-US");

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("should create tmdb genre docs and return", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    const newDocs = (await fetchTmdbGenres("en-US")) as TmdbGenreDoc[];

    // has been returned
    expect(newDocs.length).toBeGreaterThan(0);

    // has been created
    const count = await TmdbGenre.countDocuments({});
    expect(count).toBeGreaterThan(0);
  });

  it("should publish event for each created doc", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbGenresApiResultSample,
    });

    await fetchTmdbGenres("en-US");

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(19);
  });
});
