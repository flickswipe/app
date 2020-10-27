import fs from "fs";
import axios from "axios";

import { MovieId } from "../../models/movie-id";

import { fetchTmdbFileExport } from "../fetch-tmdb-file-export";

describe("fetch tmdb file export", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: fs.createReadStream(`${__dirname}/movies.1000.json.gz.sample`),
    });

    await fetchTmdbFileExport(new Date());

    expect(axios).toHaveBeenCalled();
  });

  it("should skip if data is adult content", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: fs.createReadStream(`${__dirname}/movies.adult.json.gz.sample`),
    });

    await fetchTmdbFileExport(new Date(), { includeAdultContent: false });

    const count = await MovieId.countDocuments({});
    expect(count).toBe(0);
  });

  it("should skip if data is not popular enough", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: fs.createReadStream(`${__dirname}/movies.unpopular.json.gz.sample`),
    });

    await fetchTmdbFileExport(new Date(), { minTmdbPopularity: 1 });

    const count = await MovieId.countDocuments({});
    expect(count).toBe(0);
  });

  it("should create movie id docs", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: fs.createReadStream(`${__dirname}/movies.1000.json.gz.sample`),
    });

    await fetchTmdbFileExport(new Date());

    const count = await MovieId.countDocuments({});
    expect(count).toBeGreaterThan(0);
  });
});
