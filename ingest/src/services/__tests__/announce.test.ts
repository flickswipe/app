import { MovieId } from "../../modules/tmdb-file-export/models/movie-id";
import { TmdbMovie } from "../../modules/tmdb/models/tmdb-movie";
import { Utelly } from "../../modules/rapidapi-utelly/models/utelly";
import { natsWrapper } from "../../nats-wrapper";
import { announceMovie } from "../announce";

// sample data
import { TMDB_MOVIE_A } from "../../test/sample-data/tmdb-movies";
import { UTELLY_A } from "../../test/sample-data/utellys";
import { TMDB_GENRE_A } from "../../test/sample-data/tmdb-genres";
import { TmdbGenre } from "../../modules/tmdb/models/tmdb-genre";
const UTELLY_A_NO_LOCATIONS = Object.assign({}, UTELLY_A, { locations: [] });

describe("announce", () => {
  describe("announce movie", () => {
    describe("invalid args", () => {
      describe("no ids supplied", () => {
        it("should throw error", async () => {
          // throws error
          await expect(() => announceMovie({})).rejects.toThrow();
        });
      });

      describe("`imdbId` doesn't match any `TmdbMovie` doc", () => {
        it("should throw error", async () => {
          // throws error
          await expect(() =>
            announceMovie({ imdbId: TMDB_MOVIE_A.imdbId })
          ).rejects.toThrow();
        });
      });

      describe("`tmdbMovieId` doesn't match any `TmdbMovie` doc", () => {
        it("should throw error", async () => {
          // throws error
          await expect(() =>
            announceMovie({ tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId })
          ).rejects.toThrow();
        });
      });

      describe("`imdbId` doesn't match any `Utelly` doc", () => {
        beforeEach(async () => {
          await TmdbMovie.build(TMDB_MOVIE_A).save();
        });

        it("should throw error", async () => {
          // throws error
          await expect(() =>
            announceMovie({ tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId })
          ).rejects.toThrow();
        });
      });

      describe("`Utelly` doc exists but `TmdbMovie` doc doesn't", () => {
        beforeEach(async () => {
          await Utelly.build(UTELLY_A).save();
        });

        it("should throw error", async () => {
          // throws error
          await expect(() =>
            announceMovie({ imdbId: UTELLY_A.imdbId })
          ).rejects.toThrow();
        });
      });

      describe("`TmdbMovie` and `Utelly` docs exist, but not `Genres`", () => {
        beforeEach(async () => {
          await Promise.all([
            await TmdbMovie.build(TMDB_MOVIE_A).save(),
            await Utelly.build(UTELLY_A).save(),
          ]);
        });
        it("should throw error", async () => {
          // throws error
          await expect(() =>
            announceMovie({ imdbId: UTELLY_A.imdbId })
          ).rejects.toThrow();
        });
      });
    });

    describe("irrelevant data", () => {
      describe("no stream locations", () => {
        beforeEach(async () => {
          await Promise.all([
            TmdbMovie.build(TMDB_MOVIE_A).save(),
            TmdbGenre.build(TMDB_GENRE_A).save(),
            Utelly.build(UTELLY_A_NO_LOCATIONS).save(),
          ]);
        });

        it("should not publish event", async () => {
          await announceMovie({ imdbId: TMDB_MOVIE_A.imdbId });

          // has not been published
          expect(natsWrapper.client.publish).not.toHaveBeenCalled();
        });
      });
    });

    describe("relevant data", () => {
      beforeEach(async () => {
        await Promise.all([
          MovieId.build({
            tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId,
          }).save(),
          TmdbMovie.build(TMDB_MOVIE_A).save(),
          TmdbGenre.build(TMDB_GENRE_A).save(),
          Utelly.build(UTELLY_A).save(),
        ]);
      });

      it("should publish an event", async () => {
        await announceMovie({ imdbId: TMDB_MOVIE_A.imdbId });

        // has been published
        expect(natsWrapper.client.publish).toHaveBeenCalled();
      });

      it("should update `emitted` to `true`", async () => {
        await announceMovie({ imdbId: TMDB_MOVIE_A.imdbId });

        expect(
          await MovieId.findOne({
            tmdbMovieId: TMDB_MOVIE_A.tmdbMovieId,
          })
        ).toEqual(expect.objectContaining({ emitted: true }));
      });
    });
  });
});
