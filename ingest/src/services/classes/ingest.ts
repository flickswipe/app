import { announceMediaItem } from "../announce-media-item";
import { Queue } from "./queue";
import { fetchUtelly } from "../../modules/rapidapi-utelly/services/fetch-utelly";
import { fetchTmdbFileExport } from "../../modules/tmdb-file-export/services/fetch-tmdb-file-export";
import { fetchTmdbMovie } from "../../modules/tmdb/services/fetch-tmdb-movie";
import { fetchTmdbGenres } from "../../modules/tmdb/services/fetch-tmdb-genres";

export interface StartOptions {
  [key: string]: unknown;
  countries: string[];
  audioLanguages: string[];
  includeAdultContent?: boolean;
  earliestReleaseDate?: Date;
  minTmdbPopularity?: number;
}

export class Ingest {
  /**
   * Initialize the ingestion process
   *
   * @param options
   */
  static async start(options: StartOptions): Promise<void> {
    console.log(`Starting ingestion...`);
    (await Queue.isFirstImport())
      ? Ingest.runFirstImport(options)
      : Ingest.runRegularImport(options);
  }

  /**
   * Fetch all pre-requisite data.
   *
   * @param options
   */
  static async runFirstImport(options: StartOptions): Promise<void> {
    console.log(`Running first import...`);

    // get the file export
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    await Promise.all([
      Ingest.runTmdbFileExportFetch(yesterday, options),
      Ingest.runTmdbGenresFetch(options),
    ]);

    // run the regular import
    await Ingest.runRegularImport(options);
  }

  /**
   * Run regular data fetching processes
   *
   * @param options
   */
  static async runRegularImport(options: StartOptions): Promise<void> {
    console.log(`Scheduling regular import...`);
    console.log(
      `Data will be fetched for ${options.countries.length} countries`
    );

    Ingest.scheduleTmdbFileExportFetch(options);
    Ingest.scheduleTmdbMovieFetch(options);
    Ingest.scheduleTmdbGenresFetch(options);
    Ingest.scheduleUtellyDataFetch(options);
  }

  /**
   * Schedule regular TMDB file fetch
   */
  static scheduleTmdbFileExportFetch(options: StartOptions): void {
    console.log(`Scheduling tmdb file data fetch...`);

    const msUntil8am = new Date().getTime() - new Date().setHours(8, 0, 0, 0);
    const oncePerDay = 24 * 60 * 60 * 1000;

    setTimeout(() => {
      setInterval(async () => {
        const today = new Date();
        await Ingest.runTmdbFileExportFetch(today, options);
      }, oncePerDay);
    }, msUntil8am);
  }

  /**
   * Run TMDB file fetch
   *
   * @param date date of file to fetch
   */
  static async runTmdbFileExportFetch(
    date: Date,
    options: StartOptions
  ): Promise<void> {
    await fetchTmdbFileExport(date, options);
  }

  /**
   * Schedule regular TMDB movie data fetch
   */
  static scheduleTmdbMovieFetch(options: StartOptions): void {
    console.log(`Scheduling tmdb movie data fetch...`);

    const oncePerSecond = 1000;

    setInterval(async () => {
      const nextTmdbMovieId = await Queue.getNextTmdbMovie();

      if (!nextTmdbMovieId) {
        console.log(`Nothing in queue for tmdb movie data`);
        return;
      }

      await Ingest.runTmdbMovieFetch(nextTmdbMovieId, options);
    }, oncePerSecond);
  }

  /**
   * Run TMDB movie data fetch (for single movie)
   *
   * @param tmdbMovieId id of movie to fetch
   */
  static async runTmdbMovieFetch(
    tmdbMovieId: number,
    options: StartOptions
  ): Promise<void> {
    await fetchTmdbMovie(tmdbMovieId, options);
  }

  /**
   * Schedule regular TMDB genres data fetch
   *
   * @param options
   */
  static scheduleTmdbGenresFetch(options: StartOptions): void {
    console.log(`Scheduling tmdb genres data fetch...`);

    const oncePerDay = 24 * 60 * 60 * 1000;

    setInterval(async () => {
      await Ingest.runTmdbGenresFetch(options);
    }, oncePerDay);
  }

  /**
   * Run regular TMDB genres data fetch
   *
   * @param options
   */
  static async runTmdbGenresFetch(options: StartOptions): Promise<void> {
    fetchTmdbGenres(options);
  }

  /**
   * Schedule regular utelly data fetch
   *
   * @param options
   */
  static scheduleUtellyDataFetch(options: StartOptions): void {
    console.log(`Scheduling utelly data fetch...`);
    const { countries } = options;

    const thousandPerDay = ((24 * 60 * 60 * 1000) / 1000) * countries.length;

    setInterval(async () => {
      const nextImdbId = await Queue.getNextUtelly();

      if (!nextImdbId) {
        console.log(`Nothing in queue for utelly data`);
        return;
      }

      const gotResult = await Ingest.runUtellyDataFetch(nextImdbId, options);

      gotResult && (await announceMediaItem({ imdbId: nextImdbId }));
    }, thousandPerDay);
  }

  /**
   * Run utelly data fetch (for single movie)
   *
   * @param imdbId id of movie to fetch
   * @param countries countries to target
   */
  static async runUtellyDataFetch(
    imdbId: string,
    options: StartOptions
  ): Promise<boolean> {
    const { countries } = options;

    // get utelly results concurrently
    const results = await Promise.all(
      countries.map((country: string) => fetchUtelly(imdbId, country, options))
    );

    // so long as there is at least one result, return true
    return results.filter((result) => result !== null).length > 0;
  }
}
