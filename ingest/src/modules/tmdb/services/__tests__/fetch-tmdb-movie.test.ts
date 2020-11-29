import axios from "axios";

import { fetchTmdbMovie } from "../fetch-tmdb-movie";
import { TmdbMovie } from "../../models/tmdb-movie";
import { MovieId } from "../../../tmdb-file-export/models/movie-id";
import { natsWrapper } from "../../../../nats-wrapper";

// sample data
import tmdbMovieApiResultSample from "./tmdb-movie.json";
import {
  TMDB_MOVIE_DOC_A,
  TMDB_MOVIE_DOC_A_OVERWRITTEN,
} from "../../../../test/sample-data/tmdb-movie-docs";

describe("fetch tmdb movie", () => {
  describe("no data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({});
    });

    it("should return null if no data provided", async () => {
      // returns null
      expect(await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId)).toBeNull();
    });
  });

  describe("data provided", () => {
    describe("irrelevant data", () => {
      describe("media not yet released", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: Object.assign({}, tmdbMovieApiResultSample, {
              status: "Rumored",
            }),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId);

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(0);
        });

        it("should return null", async () => {
          // returns null
          expect(await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId)).toBeNull();
        });
      });

      describe("media not on imdb", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: Object.assign({}, tmdbMovieApiResultSample, {
              imdb_id: null,
            }),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId);

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(0);
        });

        it("should return null", async () => {
          // returns null
          expect(await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId)).toBeNull();
        });
      });

      describe("adult content", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: Object.assign({}, tmdbMovieApiResultSample, { adult: true }),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId);

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(0);
        });

        it("should return null", async () => {
          // returns null
          expect(await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId)).toBeNull();
        });
      });

      describe("release date out of range", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: Object.assign({}, tmdbMovieApiResultSample, {
              release_date: "1999-10-15",
            }),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId, {
            earliestReleaseDate: new Date("1999-10-16"),
          });

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(0);
        });

        it("should return null", async () => {
          // returns null
          expect(
            await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId, {
              earliestReleaseDate: new Date("1999-10-16"),
            })
          ).toBeNull();
        });
      });

      describe("doc exists", () => {
        beforeEach(async () => {
          await MovieId.build({
            tmdbMovieId: TMDB_MOVIE_DOC_A.tmdbMovieId,
            emitted: true,
          }).save();
          await TmdbMovie.build(TMDB_MOVIE_DOC_A).save();

          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: Object.assign({}, tmdbMovieApiResultSample, { adult: true }),
          });
        });
        it("should set `neverUse` field to `true`", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId, {
            includeAdultContent: false,
          });

          // has been updated
          expect(
            await TmdbMovie.findOne({
              tmdbMovieId: TMDB_MOVIE_DOC_A.tmdbMovieId,
            })
          ).toEqual(
            expect.objectContaining({
              neverUse: true,
            })
          );

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(1);
        });

        it("should publish an event", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId, {
            includeAdultContent: false,
          });

          // has been published
          expect(natsWrapper.client.publish).toHaveBeenCalled();
        });
      });
    });

    describe("relevant data", () => {
      describe("doc exists", () => {
        beforeEach(async () => {
          await TmdbMovie.build(TMDB_MOVIE_DOC_A).save();

          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: tmdbMovieApiResultSample,
          });
        });

        it("should overwrite", async () => {
          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId);

          // has been overwritten
          expect(
            await TmdbMovie.findOne({
              tmdbMovieId: TMDB_MOVIE_DOC_A.tmdbMovieId,
            })
          ).toEqual(
            expect.objectContaining({
              title: TMDB_MOVIE_DOC_A_OVERWRITTEN.title,
            })
          );

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(1);
        });
      });

      describe("no doc exists", () => {
        it("should create doc", async () => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: tmdbMovieApiResultSample,
          });

          await fetchTmdbMovie(TMDB_MOVIE_DOC_A.tmdbMovieId);

          // has created doc
          expect(await TmdbMovie.findOne({})).toEqual(
            expect.objectContaining({
              tmdbMovieId: TMDB_MOVIE_DOC_A.tmdbMovieId,
            })
          );

          // no extra inserts
          expect(await TmdbMovie.countDocuments()).toBe(1);
        });
      });
    });
  });
});
