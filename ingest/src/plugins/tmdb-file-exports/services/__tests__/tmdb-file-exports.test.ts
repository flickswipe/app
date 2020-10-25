import fs from "fs";
import axios from "axios";

import { MovieId } from "../../models/movie-id";

import { fetchTmdbFileExport } from "../fetch-tmdb-file-export";

jest.mock("axios");

describe("ingest data from tmdb", () => {
  it("should ingest ids from file export", async () => {
    // @ts-ignore
    axios.mockImplementationOnce(() =>
      Promise.resolve({
        data: fs.createReadStream(`${__dirname}/movies.1000.json.gz.sample`),
      })
    );

    await fetchTmdbFileExport(new Date());

    expect(axios).toHaveBeenCalled();

    const count = await MovieId.countDocuments({});
    expect(count).toBe(278);

    const doc = await MovieId.findOne({});
    expect(doc?.tmdbMovieId).toBeDefined();
    expect(doc?.timesUsed).toBe(0);
  });
});
