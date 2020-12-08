import axios from 'axios';

import { natsWrapper } from '../../../../nats-wrapper';
import {
    TMDB_GENRE_DOC_A, TMDB_GENRE_DOC_A_NEW
} from '../../../../test/sample-data/tmdb-genre-docs';
import { TmdbGenre, TmdbGenreDoc } from '../../models/tmdb-genre';
import { fetchTmdbGenres } from '../fetch-tmdb-genres';
// sample data
import tmdbGenresApiResultSample from './tmdb-genres.json';

describe("fetch tmdb genres", () => {
  describe("no data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({});
    });

    it("should return null if no data provided", async () => {
      // has correct data
      expect(await fetchTmdbGenres()).toBeNull();
    });
  });

  describe("data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({
        data: tmdbGenresApiResultSample,
      });
    });

    describe("doc exists", () => {
      let existingDoc: TmdbGenreDoc;
      beforeEach(async () => {
        existingDoc = await TmdbGenre.build(TMDB_GENRE_DOC_A).save();
      });

      it("should overwrite", async () => {
        await fetchTmdbGenres();

        // has been overwritten
        expect(await TmdbGenre.findById(existingDoc.id)).toEqual(
          expect.objectContaining(TMDB_GENRE_DOC_A_NEW)
        );

        // no extra inserts
        expect(await TmdbGenre.countDocuments()).toBe(
          tmdbGenresApiResultSample.genres.length
        );
      });

      it("should publish event", async () => {
        await fetchTmdbGenres();

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });
    });

    describe("no doc exists", () => {
      beforeEach(() => {
        // @ts-ignore
        axios.mockResolvedValueOnce({
          data: tmdbGenresApiResultSample,
        });
      });

      it("should create docs", async () => {
        await fetchTmdbGenres();

        // has been created
        const count = await TmdbGenre.countDocuments({});
        expect(count).toBe(tmdbGenresApiResultSample.genres.length);

        // no extra inserts
        expect(await TmdbGenre.countDocuments()).toBe(
          tmdbGenresApiResultSample.genres.length
        );
      });

      it("should publish event for each created doc", async () => {
        await fetchTmdbGenres();

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalledTimes(19);
      });
    });
  });
});
