import { MovieId } from "../../modules/tmdb-file-export/models/movie-id";
import { TmdbMovie } from "../../modules/tmdb/models/tmdb-movie";
import { Queue } from "../queue";

describe("Queue", () => {
  describe("is first import", () => {
    it("should return true if no movie id documents exist", async () => {
      const result = await Queue.isFirstImport();
      expect(result).toBe(true);
    });

    it("should return false if movie id documents exist", async () => {
      await MovieId.build({
        tmdbMovieId: 1,
      }).save();

      const result = await Queue.isFirstImport();
      expect(result).toBe(false);
    });
  });

  describe("get next tdmb movie", () => {
    it("should return null if no documents exist", async () => {
      const result = await Queue.getNextTmdbMovie();
      expect(result).toBe(null);
    });

    it("should return null if no valid documents exist", async () => {
      await MovieId.build({
        tmdbMovieId: 1,
        neverUse: true,
      }).save();

      const result = await Queue.getNextTmdbMovie();
      expect(result).toBe(null);
    });

    it("should return tmdb movie id of least used document", async () => {
      await Promise.all([
        MovieId.build({
          tmdbMovieId: 1,
          timesUsed: 1,
        }).save(),
        MovieId.build({
          tmdbMovieId: 2,
          timesUsed: 2,
        }).save(),
      ]);

      const result = await Queue.getNextTmdbMovie();
      expect(result).toBe(1);
    });

    it("should increment timesUsed of returned document", async () => {
      await MovieId.build({
        tmdbMovieId: 1,
      }).save();

      await Queue.getNextTmdbMovie();

      expect(await MovieId.findOne({ tmdbMovieId: 1 })).toEqual(
        expect.objectContaining({ timesUsed: 1 })
      );
    });
  });

  describe("get next utelly", () => {
    it("should return null if no documents exist", async () => {
      const result = await Queue.getNextUtelly();
      expect(result).toBe(null);
    });

    it("should return null if no valid documents exist", async () => {
      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: ["xxx"],
        rating: {
          average: 10,
          count: 1,
          popularity: 10,
        },
        language: "english",
        releaseDate: new Date(),
        runtime: 180,
        plot: "My Test Movie plot description",
        neverUse: true,
      }).save();

      const result = await Queue.getNextUtelly();
      expect(result).toBe(null);
    });

    it("should return tmdb movie id of least used document", async () => {
      await Promise.all([
        TmdbMovie.build({
          tmdbMovieId: 1,
          imdbId: "tt1234567",
          title: "My Test Movie",
          images: {
            poster: "/poster.jpg",
            backdrop: "/backdrop.jpg",
          },
          genres: ["xxx"],
          rating: {
            average: 10,
            count: 1,
            popularity: 10,
          },
          language: "english",
          releaseDate: new Date(),
          runtime: 180,
          plot: "My Test Movie plot description",
          timesUsed: 1,
        }).save(),
        TmdbMovie.build({
          tmdbMovieId: 2,
          imdbId: "tt1234568",
          title: "My Test Movie Sequel",
          images: {
            poster: "/poster.jpg",
            backdrop: "/backdrop.jpg",
          },
          genres: ["yyy"],
          rating: {
            average: 20,
            count: 2,
            popularity: 20,
          },
          language: "english",
          releaseDate: new Date(),
          runtime: 180,
          plot: "My Test Movie Sequel plot description",
          timesUsed: 2,
        }).save(),
      ]);

      const result = await Queue.getNextUtelly();
      expect(result).toBe("tt1234567");
    });

    it("should increment timesUsed of returned document", async () => {
      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: ["xxx"],
        rating: {
          average: 10,
          count: 1,
          popularity: 10,
        },
        language: "english",
        releaseDate: new Date(),
        runtime: 180,
        plot: "My Test Movie plot description",
      }).save();

      await Queue.getNextUtelly();

      expect(await TmdbMovie.findOne({ tmdbMovieId: 1 })).toEqual(
        expect.objectContaining({ timesUsed: 1 })
      );
    });
  });
});
