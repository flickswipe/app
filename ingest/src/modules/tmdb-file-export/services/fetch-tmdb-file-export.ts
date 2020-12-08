import Stream from 'stream';

import { MovieId } from '../models/movie-id';
import { movieIdsReadFileExport } from './streams/movie-ids-read-file-export';
import { movieIdsWriteMongodb } from './streams/movie-ids-write-mongodb';

export async function fetchTmdbFileExport(
  date: Date,
  options: Record<string, unknown> = {}
): Promise<Stream> {
  console.info(`Fetching tmdb file export...`);

  const read = await movieIdsReadFileExport(date, options);

  if (!read) {
    return new Promise((resolve, reject) => {
      reject(`Couldn't read movie ids`);
    });
  }

  const write = read.pipe(movieIdsWriteMongodb());

  return new Promise((resolve, reject) =>
    write
      .on("finish", async () => {
        const count = await MovieId.countDocuments();
        console.info(`Fetched ${count} IDs from tmdb file export!`);
        const validCount = await MovieId.countDocuments({ neverUse: false });
        console.info(`(Tracking data for ${validCount} movies)`);

        resolve(write);
      })
      .on("error", reject)
  );
}
