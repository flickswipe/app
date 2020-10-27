import axios from "axios";

import { fetchTmdbMovie } from "../fetch-tmdb-movie";
import { TmdbMovie, TmdbMovieDoc } from "../../models/tmdb-movie";
import tmdbMovieApiResultSample from "./tmdb-movie.json";
import { MovieId } from "../../../tmdb-file-export/models/movie-id";
import { natsWrapper } from "../../../../nats-wrapper";

describe("fetch tmdb movie", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbMovieApiResultSample,
    });

    await fetchTmdbMovie(550);
    expect(axios).toHaveBeenCalled();
  });

  it("should return null if no data provided", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({});

    const result = await fetchTmdbMovie(550);

    expect(result).toBeNull();
  });

  it("should skip if media is not yet released", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { status: "Rumored" }),
    });

    const result = await fetchTmdbMovie(550);

    expect(result).toBeNull();
  });

  it("should skip if media is not on imdb", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { imdb_id: null }),
    });

    const result = await fetchTmdbMovie(550);

    expect(result).toBeNull();
  });

  it("should skip if data is irrelevant forever because of adult content", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { adult: true }),
    });

    const result = await fetchTmdbMovie(550, { includeAdultContent: false });

    expect(result).toBeNull();
  });

  it("should skip if data is irrelevant forever because of release date", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, {
        release_date: "1999-10-15",
      }),
    });

    const result = await fetchTmdbMovie(550, {
      earliestReleaseDate: new Date("1999-10-16"),
    });

    expect(result).toBeNull();
  });

  it("should set `neverUse=true` if exising doc becomes irrelevant forever because of adult content", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { adult: false }),
    });

    await fetchTmdbMovie(550);

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { adult: true }),
    });

    await fetchTmdbMovie(550, { includeAdultContent: false });

    const doc = await TmdbMovie.findOne({ tmdbMovieId: 550 });

    expect(doc.neverUse).toBe(true);
  });

  it("should publish an event for movies that were previously emitted but are now irrelevant forever", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { adult: false }),
    });

    await MovieId.build({ tmdbMovieId: 550, emitted: true }).save();
    await fetchTmdbMovie(550);

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { adult: true }),
    });

    await fetchTmdbMovie(550, { includeAdultContent: false });

    await TmdbMovie.findOne({ tmdbMovieId: 550 });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("should overwrite existing doc and return", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, { title: "My Title" }),
    });

    await fetchTmdbMovie(550);

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: Object.assign({}, tmdbMovieApiResultSample, {
        title: "My Overwritten Title",
      }),
    });

    const result = await fetchTmdbMovie(550);

    const overwrittenDoc = await TmdbMovie.findOne({
      tmdbMovieId: 550,
    });

    // has been overwritten
    expect(overwrittenDoc.title).toBe("My Overwritten Title");

    // has been returned
    expect(overwrittenDoc.id).toEqual(result && result.id);
  });

  it("should create single doc and return", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: tmdbMovieApiResultSample,
    });

    const newDoc = (await fetchTmdbMovie(550)) as TmdbMovieDoc;

    // has returned doc
    expect(newDoc.tmdbMovieId).toBe(550);

    // has created doc
    const doc = (await TmdbMovie.findOne({})) as TmdbMovieDoc;
    expect(doc.tmdbMovieId).toBe(550);
  });
});
