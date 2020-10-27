import { MovieId } from "../../modules/tmdb-file-export/models/movie-id";
import { TmdbMovie } from "../../modules/tmdb/models/tmdb-movie";
import { Utelly } from "../../modules/rapidapi-utelly/models/utelly";

import { natsWrapper } from "../../nats-wrapper";

import { announceMovie } from "../announce";

describe("announce", () => {
  describe("announce movie", () => {
    it("should throw error if missing an id", async () => {
      await expect(() => announceMovie({})).rejects.toThrow();
    });

    it("should throw error if `imdbId` doesn't match any `TmdbMovie` doc", async () => {
      await expect(() =>
        announceMovie({ imdbId: "tt1234567" })
      ).rejects.toThrow();
    });

    it("should throw error if `tmdbMovieId` doesn't match any `TmdbMovie` doc", async () => {
      await expect(() => announceMovie({ tmdbMovieId: 1 })).rejects.toThrow();
    });

    it("should throw error if `imdbId` doesn't match any `Utelly` doc", async () => {
      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: [1],
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

      await expect(() => announceMovie({ tmdbMovieId: 1 })).rejects.toThrow();
    });

    it("should throw error if `Utelly` doc exists but `TmdbMovie` doc doesn't", async () => {
      await Utelly.build({
        imdbId: "tt1234567",
        country: "uk",
        locations: [
          {
            displayName: "Netflix",
            name: "NETFLIXUK",
            id: "1234567890",
            url: "https://netflix.com/m/123456",
          },
        ],
      }).save();

      await expect(() =>
        announceMovie({ imdbId: "tt1234567" })
      ).rejects.toThrow();
    });

    it("should return null if no streaming locations exist", async () => {
      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: [1],
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

      await Utelly.build({
        imdbId: "tt1234567",
        country: "uk",
        locations: [],
      }).save();

      expect(await announceMovie({ imdbId: "tt1234567" })).toBeUndefined();
    });

    it("should publish an event when all data correct", async () => {
      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: [1],
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

      await Utelly.build({
        imdbId: "tt1234567",
        country: "uk",
        locations: [
          {
            displayName: "Netflix",
            name: "NETFLIXUK",
            id: "1234567890",
            url: "https://netflix.com/m/123456",
          },
        ],
      }).save();

      await announceMovie({ imdbId: "tt1234567" });

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });

    it("should mark movie id as emitted", async () => {
      await MovieId.build({
        tmdbMovieId: 1,
      }).save();

      await TmdbMovie.build({
        tmdbMovieId: 1,
        imdbId: "tt1234567",
        title: "My Test Movie",
        images: {
          poster: "/poster.jpg",
          backdrop: "/backdrop.jpg",
        },
        genres: [1],
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

      await Utelly.build({
        imdbId: "tt1234567",
        country: "uk",
        locations: [
          {
            displayName: "Netflix",
            name: "NETFLIXUK",
            id: "1234567890",
            url: "https://netflix.com/m/123456",
          },
        ],
      }).save();

      await announceMovie({ imdbId: "tt1234567" });

      expect(
        await MovieId.findOne({
          tmdbMovieId: 1,
        })
      ).toEqual(expect.objectContaining({ emitted: true }));
    });
  });
});
