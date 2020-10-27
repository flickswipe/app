import { announceMovie } from "./announce";
import { Queue } from "./queue";
import { fetchUtelly } from "../modules/rapidapi-utelly/services/fetch-utelly";
import { fetchTmdbFileExport } from "../modules/tmdb-file-export/services/fetch-tmdb-file-export";
import { fetchTmdbMovie } from "../modules/tmdb/services/fetch-tmdb-movie";
import { fetchTmdbGenres } from "../modules/tmdb/services/fetch-tmdb-genres";

export class Ingestion {
  /**
   * Initialize the ingestion process
   *
   * @param countries countries to target
   * @param languages languages to target
   */
  static async start(countries: string[], languages: string[]): Promise<void> {
    console.log(`Starting ingestion...`);
    (await Queue.isFirstImport())
      ? Ingestion.runFirstImport(countries, languages)
      : Ingestion.runRegularImport(countries, languages);
  }

  /**
   * Fetch all pre-requisite data.
   *
   * @param countries countries to target
   * @param languages languages to target
   */
  static async runFirstImport(
    countries: string[],
    languages: string[]
  ): Promise<void> {
    console.log(`Running first import...`);

    // get the file export
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    await Promise.all([
      Ingestion.runTmdbFileExportFetch(yesterday),
      Ingestion.runTmdbGenresFetch(languages),
    ]);

    // run the regular import
    await Ingestion.runRegularImport(countries, languages);
  }

  /**
   * Run regular data fetching processes
   *
   * @param countries countries to target
   * @param languages languages to target
   */
  static async runRegularImport(
    countries: string[],
    languages: string[]
  ): Promise<void> {
    console.log(`Scheduling regular import...`);
    console.log(`Data will be fetched for ${countries.length} countries`);

    Ingestion.scheduleTmdbFileExportFetch();
    Ingestion.scheduleTmdbMovieFetch();
    Ingestion.scheduleTmdbGenresFetch(languages);
    Ingestion.scheduleUtellyDataFetch(countries);
  }

  /**
   * Schedule regular TMDB file fetch
   */
  static scheduleTmdbFileExportFetch(): void {
    console.log(`Scheduling tmdb file data fetch...`);

    const msUntil8am = new Date().getTime() - new Date().setHours(8, 0, 0, 0);
    const oncePerDay = 24 * 60 * 60 * 1000;

    const runForCurrentDay = () => {
      const today = new Date();
      Ingestion.runTmdbFileExportFetch(today);
    };

    setTimeout(() => {
      runForCurrentDay();
      setInterval(runForCurrentDay, oncePerDay);
    }, msUntil8am);
  }

  /**
   * Run TMDB file fetch
   *
   * @param date date of file to fetch
   */
  static async runTmdbFileExportFetch(date: Date): Promise<void> {
    await fetchTmdbFileExport(date);
  }

  /**
   * Schedule regular TMDB movie data fetch
   */
  static scheduleTmdbMovieFetch(): void {
    console.log(`Scheduling tmdb movie data fetch...`);

    const oncePerSecond = 1000;

    setInterval(async () => {
      const nextTmdbMovieId = await Queue.getNextTmdbMovie();

      if (!nextTmdbMovieId) {
        console.log(`Nothing in queue for tmdb movie data`);
        return;
      }

      await Ingestion.runTmdbMovieFetch(nextTmdbMovieId);
    }, oncePerSecond);
  }

  /**
   * Run TMDB movie data fetch (for single movie)
   *
   * @param tmdbMovieId id of movie to fetch
   */
  static async runTmdbMovieFetch(tmdbMovieId: number): Promise<void> {
    await fetchTmdbMovie(tmdbMovieId);
  }

  /**
   * Schedule regular TMDB genres data fetch
   *
   * @param languages languages to target
   */
  static scheduleTmdbGenresFetch(languages: string[]): void {
    console.log(`Scheduling tmdb genres data fetch...`);

    const oncePerDay = 24 * 60 * 60 * 1000;

    setInterval(async () => {
      await Ingestion.runTmdbGenresFetch(languages);
    }, oncePerDay);
  }

  /**
   * Run regular TMDB genres data fetch
   *
   * @param languages languages to target
   */
  static async runTmdbGenresFetch(languages: string[]): Promise<void> {
    await Promise.all(languages.map((language) => fetchTmdbGenres(language)));
  }

  /**
   * Schedule regular utelly data fetch
   *
   * @param countries countries to target
   */
  static scheduleUtellyDataFetch(countries: string[]): void {
    console.log(`Scheduling utelly data fetch...`);

    const thousandPerDay = ((24 * 60 * 60 * 1000) / 1000) * countries.length;

    setInterval(async () => {
      const nextImdbId = await Queue.getNextUtelly();

      if (!nextImdbId) {
        console.log(`Nothing in queue for utelly data`);
        return;
      }

      await Ingestion.runUtellyDataFetch(nextImdbId, countries);

      await announceMovie({ imdbId: nextImdbId });
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
    countries: string[]
  ): Promise<void> {
    await Promise.all(
      countries.map(async (country: string) => {
        fetchUtelly(imdbId, country);
      })
    );
  }
}
