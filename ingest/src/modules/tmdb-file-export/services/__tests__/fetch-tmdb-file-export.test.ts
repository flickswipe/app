import axios from 'axios';
import fs from 'fs';

import { MovieId } from '../../models/movie-id';
// sample data
import { fetchTmdbFileExport } from '../fetch-tmdb-file-export';

describe("fetch tmdb file export", () => {
  describe("data provided", () => {
    describe("irrelevant data", () => {
      describe("adult content", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: fs.createReadStream(
              `${__dirname}/movies.adult.json.gz.sample`
            ),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbFileExport(new Date(), { includeAdultContent: false });

          // no extra inserts
          expect(await MovieId.countDocuments()).toBe(0);
        });
      });

      describe("not popular", () => {
        beforeEach(() => {
          // @ts-ignore
          axios.mockResolvedValueOnce({
            data: fs.createReadStream(
              `${__dirname}/movies.unpopular.json.gz.sample`
            ),
          });
        });

        it("shouldn't create docs", async () => {
          await fetchTmdbFileExport(new Date(), { minTmdbPopularity: 1 });

          // no extra inserts
          expect(await MovieId.countDocuments()).toBe(0);
        });
      });
    });
  });

  describe("relevant data", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({
        data: fs.createReadStream(`${__dirname}/movies.1000.json.gz.sample`),
      });
    });

    describe("doc exists", () => {
      let existingDocCount: number;
      beforeEach(async () => {
        await fetchTmdbFileExport(new Date());
        existingDocCount = await MovieId.countDocuments();

        // @ts-ignore
        axios.mockResolvedValueOnce({
          data: fs.createReadStream(`${__dirname}/movies.1000.json.gz.sample`),
        });
      });
      it("shouldn't add duplicate data", async () => {
        await fetchTmdbFileExport(new Date());

        // has been created
        expect(await MovieId.countDocuments()).toEqual(existingDocCount);
      });
    });

    describe("no doc exists", () => {
      it("should create movie id docs", async () => {
        await fetchTmdbFileExport(new Date());

        // has been created
        expect(await MovieId.countDocuments()).toBeGreaterThan(0);
      });
    });
  });
});
