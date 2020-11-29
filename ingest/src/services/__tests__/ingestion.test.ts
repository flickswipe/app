import { Ingestion, StartOptions } from "../ingestion";

// mocks
import { Queue } from "../queue";
import { fetchTmdbFileExport } from "../../modules/tmdb-file-export/services/fetch-tmdb-file-export";
import { fetchTmdbMovie } from "../../modules/tmdb/services/fetch-tmdb-movie";
import { fetchTmdbGenres } from "../../modules/tmdb/services/fetch-tmdb-genres";
import { announceMovie } from "../announce";
import { fetchUtelly } from "../../modules/rapidapi-utelly/services/fetch-utelly";

jest.mock("../queue");
jest.mock("../../modules/tmdb-file-export/services/fetch-tmdb-file-export");
jest.mock("../../modules/tmdb/services/fetch-tmdb-movie");
jest.mock("../../modules/tmdb/services/fetch-tmdb-genres");
jest.mock("../announce");
jest.mock("../../modules/rapidapi-utelly/services/fetch-utelly");

// sample data
const TMDB_MOVIE_ID = 1;
const IMDB_ID = "tt1234567";
const START_OPTIONS = {
  countries: ["us"],
  languages: ["en"],
  includeAdultContent: false,
  earliestReleaseDate: new Date("1970-01-01"),
  minTmdbPopularity: 0,
} as StartOptions;
const IMPORT_OPTIONS = {
  countries: ["us"],
  languages: ["en"],
};

// handle async functions inside setTimeout and setInterval
function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe("ingestion", () => {
  /**
   * Initialize the ingestion process
   */
  describe("start", () => {
    let runFirstImport: any;
    let runRegularImport: any;

    beforeEach(() => {
      runFirstImport = jest
        .spyOn(Ingestion, "runFirstImport")
        .mockResolvedValue(null);

      runRegularImport = jest
        .spyOn(Ingestion, "runRegularImport")
        .mockResolvedValue(null);
    });

    afterAll(() => {
      runFirstImport.mockRestore();
      runRegularImport.mockRestore();
    });

    it("should run first import when no data", async () => {
      // @ts-ignore
      Queue.isFirstImport.mockResolvedValueOnce(true);

      await Ingestion.start(START_OPTIONS);

      expect(runFirstImport).toHaveBeenCalled();
    });

    it("should run regular import when some data exists", async () => {
      // @ts-ignore
      Queue.isFirstImport.mockResolvedValueOnce(false);

      await Ingestion.start(START_OPTIONS);

      expect(runRegularImport).toHaveBeenCalled();
    });
  });

  /**
   * Fetch all pre-requisite data.
   */
  describe("run first import", () => {
    let runTmdbFileExportFetch: any;
    let runTmdbGenresFetch: any;
    let runRegularImport: any;

    beforeAll(() => {
      runTmdbFileExportFetch = jest
        .spyOn(Ingestion, "runTmdbFileExportFetch")
        .mockResolvedValue(null);

      runTmdbGenresFetch = jest
        .spyOn(Ingestion, "runTmdbGenresFetch")
        .mockResolvedValue(null);

      runRegularImport = jest
        .spyOn(Ingestion, "runRegularImport")
        .mockResolvedValue(null);
    });

    afterAll(() => {
      runTmdbFileExportFetch.mockRestore();
      runTmdbGenresFetch.mockRestore();
      runRegularImport.mockRestore();
    });

    it("should run TMDB file export fetch", async () => {
      await Ingestion.runFirstImport(IMPORT_OPTIONS);

      expect(runTmdbFileExportFetch).toHaveBeenCalled();
    });

    it("should run TMDB genres fetch", async () => {
      await Ingestion.runFirstImport(IMPORT_OPTIONS);

      expect(runTmdbGenresFetch).toHaveBeenCalled();
    });

    it("should run regular import", async () => {
      await Ingestion.runFirstImport(IMPORT_OPTIONS);

      expect(runRegularImport).toHaveBeenCalled();
    });
  });

  /**
   * Run regular data fetching processes
   */
  describe("run regular import", () => {
    let scheduleTmdbFileExportFetch: any;
    let scheduleTmdbMovieFetch: any;
    let scheduleTmdbGenresFetch: any;
    let scheduleUtellyDataFetch: any;

    beforeAll(() => {
      scheduleTmdbFileExportFetch = jest
        .spyOn(Ingestion, "scheduleTmdbFileExportFetch")
        .mockImplementation(() => {
          // do nothing
        });

      scheduleTmdbMovieFetch = jest
        .spyOn(Ingestion, "scheduleTmdbMovieFetch")
        .mockImplementation(() => {
          // do nothing
        });

      scheduleTmdbGenresFetch = jest
        .spyOn(Ingestion, "scheduleTmdbGenresFetch")
        .mockImplementation(() => {
          // do nothing
        });

      scheduleUtellyDataFetch = jest
        .spyOn(Ingestion, "scheduleUtellyDataFetch")
        .mockImplementation(() => {
          // do nothing
        });
    });

    afterAll(() => {
      scheduleTmdbFileExportFetch.mockRestore();
      scheduleTmdbMovieFetch.mockRestore();
      scheduleTmdbGenresFetch.mockRestore();
      scheduleUtellyDataFetch.mockRestore();
    });

    it("should schedule TMDB file export fetch", async () => {
      await Ingestion.runRegularImport(IMPORT_OPTIONS);

      expect(scheduleTmdbFileExportFetch).toHaveBeenCalled();
    });

    it("should schedule TMDB movie fetch", async () => {
      await Ingestion.runRegularImport(IMPORT_OPTIONS);

      expect(scheduleTmdbMovieFetch).toHaveBeenCalled();
    });

    it("should schedule TMDB genres fetch", async () => {
      await Ingestion.runRegularImport(IMPORT_OPTIONS);

      expect(scheduleTmdbGenresFetch).toHaveBeenCalled();
    });

    it("should schedule utelly data fetch", async () => {
      await Ingestion.runRegularImport(IMPORT_OPTIONS);

      expect(scheduleUtellyDataFetch).toHaveBeenCalled();
    });
  });

  /**
   * Schedule regular TMDB file fetch
   */
  describe("schedule TMDB file export fetch", () => {
    let runTmdbFileExportFetch: any;

    beforeAll(() => {
      runTmdbFileExportFetch = jest
        .spyOn(Ingestion, "runTmdbFileExportFetch")
        .mockResolvedValue(null);
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      runTmdbFileExportFetch.mockRestore();
    });

    it("should use setTimeout and setInterval", async () => {
      Ingestion.scheduleTmdbFileExportFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("should run TMDB file export fetch", () => {
      Ingestion.scheduleTmdbFileExportFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();

      expect(runTmdbFileExportFetch).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * Run TMDB file fetch
   */
  describe("run TMDB file export fetch", () => {
    it("should fetch TMDB file export", async () => {
      // @ts-ignore
      fetchTmdbFileExport.mockImplementation(() => {
        // do nothing
      });

      await Ingestion.runTmdbFileExportFetch(new Date(), START_OPTIONS);
      expect(fetchTmdbFileExport).toHaveBeenCalled();
    });
  });

  /**
   * Schedule regular TMDB movie data fetch
   */
  describe("schedule TMDB movie fetch", () => {
    let runTmdbMovieFetch: any;

    beforeAll(() => {
      runTmdbMovieFetch = jest
        .spyOn(Ingestion, "runTmdbMovieFetch")
        .mockResolvedValue(null);
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      runTmdbMovieFetch.mockRestore();
    });

    it("should use setInterval", async () => {
      Ingestion.scheduleTmdbMovieFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("should run TMDB movie fetch", async () => {
      // @ts-ignore
      Queue.getNextTmdbMovie.mockResolvedValueOnce(TMDB_MOVIE_ID);

      Ingestion.scheduleTmdbMovieFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(runTmdbMovieFetch).toHaveBeenCalled();
    });
  });

  /**
   * Run TMDB movie data fetch (for single movie)
   */
  describe("run TMDB movie fetch", () => {
    it("should fetch TMDB file export", async () => {
      // @ts-ignore
      fetchTmdbMovie.mockImplementation(() => {
        // do nothing
      });

      await Ingestion.runTmdbMovieFetch(1, START_OPTIONS);
      expect(fetchTmdbMovie).toHaveBeenCalled();
    });
  });

  /**
   * Schedule regular TMDB genres data fetch
   */
  describe("schedule TMDB genres fetch", () => {
    let runTmdbGenresFetch: any;

    beforeAll(() => {
      runTmdbGenresFetch = jest
        .spyOn(Ingestion, "runTmdbGenresFetch")
        .mockResolvedValue(null);
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      runTmdbGenresFetch.mockRestore();
    });

    it("should use setInterval", async () => {
      Ingestion.scheduleTmdbGenresFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("should run TMDB genres fetch", async () => {
      Ingestion.scheduleTmdbGenresFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(runTmdbGenresFetch).toHaveBeenCalled();
    });
  });

  /**
   * Run regular TMDB genres data fetch
   */
  describe("run TMDB genres fetch", () => {
    it("should fetch TMDB genres for each language", async () => {
      // @ts-ignore
      fetchTmdbGenres.mockImplementation(() => {
        // do nothing
      });

      await Ingestion.runTmdbGenresFetch(
        Object.assign({}, START_OPTIONS, { languages: ["en", "es", "fr"] })
      );
      expect(fetchTmdbGenres).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Schedule regular utelly data fetch
   */
  describe("schedule utelly data fetch", () => {
    let runUtellyDataFetch: any;

    beforeAll(() => {
      runUtellyDataFetch = jest
        .spyOn(Ingestion, "runUtellyDataFetch")
        .mockResolvedValue(true);
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
      runUtellyDataFetch.mockRestore();
    });

    it("should use setInterval", async () => {
      Ingestion.scheduleUtellyDataFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it("should run utelly data fetch", async () => {
      // @ts-ignore
      Queue.getNextUtelly.mockResolvedValueOnce(IMDB_ID);

      Ingestion.scheduleUtellyDataFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(runUtellyDataFetch).toHaveBeenCalled();
    });

    it("should announce new movie", async () => {
      // @ts-ignore
      Queue.getNextUtelly.mockResolvedValueOnce(IMDB_ID);

      // @ts-ignore
      announceMovie.mockImplementationOnce(async () => {
        // do nothing
      });

      Ingestion.scheduleUtellyDataFetch(START_OPTIONS);

      jest.runOnlyPendingTimers();
      await flushPromises();

      expect(announceMovie).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Run utelly data fetch (for single movie)
   */
  describe("run utelly data fetch", () => {
    it("should fetch utelly data for each country", async () => {
      // @ts-ignore
      fetchUtelly.mockImplementation(() => {
        // do nothing
      });

      await Ingestion.runUtellyDataFetch(
        IMDB_ID,
        Object.assign({}, START_OPTIONS, { countries: ["uk", "us", "es"] })
      );
      expect(fetchUtelly).toHaveBeenCalledTimes(3);
    });
  });
});
