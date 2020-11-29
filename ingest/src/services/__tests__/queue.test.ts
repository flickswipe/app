import { MovieId } from "../../modules/tmdb-file-export/models/movie-id";
import { TmdbMovie } from "../../modules/tmdb/models/tmdb-movie";
import { TMDB_MOVIE_A, TMDB_MOVIE_B } from "../../test/sample-data/tmdb-movies";
import { Queue } from "../queue";

// sample data
const TMDB_MOVIE_A_NEVER_USE = Object.assign({}, TMDB_MOVIE_A, {
  neverUse: true,
});
const MOVIE_ID_A = {
  tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId,
  timesUsed: 0,
};
const MOVIE_ID_A_NEVER_USE = {
  tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId,
  timesUsed: 0,
  neverUse: true,
};
const MOVIE_ID_B = {
  tmdbMovieId: TMDB_MOVIE_B.tmdbMovieId,
  timesUsed: 1,
};

describe("Queue", () => {
  describe("is first import", () => {
    describe("no movie id docs exist", () => {
      it("should return true", async () => {
        // has correct data
        expect(await Queue.isFirstImport()).toBe(true);
      });
    });
    describe("movie id docs exist", () => {
      beforeEach(async () => {
        await MovieId.build(MOVIE_ID_A).save();
      });

      it("should return false", async () => {
        // has correct data
        expect(await Queue.isFirstImport()).toBe(false);
      });
    });
  });

  describe("get next tdmb movie", () => {
    describe("no movie id docs exist", () => {
      it("should return null", async () => {
        // has correct data
        expect(await Queue.getNextTmdbMovie()).toBe(null);
      });
    });

    describe("movie id docs exist but are not valid", () => {
      beforeEach(async () => {
        await MovieId.build(MOVIE_ID_A_NEVER_USE).save();
      });

      it("should return null", async () => {
        // has correct data
        expect(await Queue.getNextTmdbMovie()).toBe(null);
      });
    });

    describe("movie id docs exist", () => {
      beforeEach(async () => {
        await Promise.all([
          MovieId.build(MOVIE_ID_A).save(),
          MovieId.build(MOVIE_ID_B).save(),
        ]);
      });

      it("should return tmdb movie id of least used doc", async () => {
        // has correct id
        expect(await Queue.getNextTmdbMovie()).toBe(MOVIE_ID_A.tmdbMovieId);
      });

      it("should increment timesUsed", async () => {
        await Queue.getNextTmdbMovie();

        // has been incremented
        expect(
          await MovieId.findOne({ tmdbMovieId: MOVIE_ID_A.tmdbMovieId })
        ).toEqual(
          expect.objectContaining({ timesUsed: MOVIE_ID_A.timesUsed + 1 })
        );
      });
    });
  });

  describe("get next utelly", () => {
    describe("no tmdb movie docs exist", () => {
      it("should return null", async () => {
        expect(await Queue.getNextUtelly()).toBe(null);
      });
    });

    describe("tmdb movie docs exist but are not valid", () => {
      beforeEach(async () => {
        await TmdbMovie.build(TMDB_MOVIE_A_NEVER_USE).save();
      });

      it("should return null", async () => {
        expect(await Queue.getNextUtelly()).toBe(null);
      });
    });

    describe("tmdb movie docs exist", () => {
      beforeEach(async () => {
        await Promise.all([
          TmdbMovie.build(TMDB_MOVIE_A).save(),
          TmdbMovie.build(TMDB_MOVIE_B).save(),
        ]);
      });

      it("should return imdb id of least used doc", async () => {
        expect(await Queue.getNextUtelly()).toBe(TMDB_MOVIE_A.imdbId);
      });

      it("should increment timesUsed", async () => {
        await Queue.getNextUtelly();

        expect(
          await TmdbMovie.findOne({ tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId })
        ).toEqual(
          expect.objectContaining({ timesUsed: TMDB_MOVIE_A.timesUsed + 1 })
        );
      });
    });
  });
});
