import axios from "axios";

import { fetchTmdbGenres } from "../fetch-tmdb-genres";
import { TmdbGenre, TmdbGenreDoc } from "../../models/tmdb-genre";
import { natsWrapper } from "../../../../nats-wrapper";

// sample data
import tmdbGenresApiResultSample from "./tmdb-genres.json";
import {
  TMDB_GENRE_DOC_A,
  TMDB_GENRE_DOC_A_OVERWRITTEN,
} from "../../../../test/sample-data/tmdb-genre-docs";
const LANGUAGE = "en";
const UNUSUAL_LANGUAGE = "en-GB";

describe("fetch tmdb genres", () => {
  describe("no data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({});
    });

    it("should return null if no data provided", async () => {
      // returns null
      expect(await fetchTmdbGenres(LANGUAGE)).toBeNull();
    });
  });

  describe("data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({
        data: tmdbGenresApiResultSample,
      });
    });

    describe("doc already exists", () => {
      let existingDoc: TmdbGenreDoc;
      beforeEach(async () => {
        existingDoc = await TmdbGenre.build(TMDB_GENRE_DOC_A).save();
      });

      it("should overwrite", async () => {
        await fetchTmdbGenres(LANGUAGE);

        // has been overwritten
        expect(await TmdbGenre.findById(existingDoc.id)).toEqual(
          expect.objectContaining(TMDB_GENRE_DOC_A_OVERWRITTEN)
        );

        // no extra inserts
        expect(await TmdbGenre.countDocuments()).toBe(
          tmdbGenresApiResultSample.genres.length
        );
      });

      it("should publish event", async () => {
        await fetchTmdbGenres(LANGUAGE);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });

      it("should normalize language attribute in published event", async () => {
        await fetchTmdbGenres(UNUSUAL_LANGUAGE);

        // has been normalized
        expect(natsWrapper.client.publish).toHaveBeenCalledWith(
          "genre:detected",
          expect.stringContaining(`"language":"${LANGUAGE}"`),
          expect.any(Function)
        );
      });
    });

    describe("no doc already exists", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.mockResolvedValueOnce({
          data: tmdbGenresApiResultSample,
        });
      });

      it("should create docs", async () => {
        await fetchTmdbGenres(LANGUAGE);

        // has been created
        const count = await TmdbGenre.countDocuments({});
        expect(count).toBe(tmdbGenresApiResultSample.genres.length);

        // no extra inserts
        expect(await TmdbGenre.countDocuments()).toBe(
          tmdbGenresApiResultSample.genres.length
        );
      });

      it("should publish event for each created doc", async () => {
        await fetchTmdbGenres(LANGUAGE);

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalledTimes(19);
      });

      it("should normalize language attribute in published event when creating doc", async () => {
        await fetchTmdbGenres(UNUSUAL_LANGUAGE);

        // has been normalised
        expect(natsWrapper.client.publish).toHaveBeenCalledWith(
          "genre:detected",
          expect.stringContaining(`"language":"${LANGUAGE}"`),
          expect.any(Function)
        );
      });
    });
  });
});
