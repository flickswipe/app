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
