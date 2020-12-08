import Stream from 'stream';

import { addBreadcrumb, configureScope, startTransaction } from '@sentry/node';

import { MovieId } from '../models/movie-id';
import { movieIdsReadFileExport } from './streams/movie-ids-read-file-export';
import { movieIdsWriteMongodb } from './streams/movie-ids-write-mongodb';

export async function fetchTmdbFileExport(
  date: Date,
  options: Record<string, unknown> = {}
): Promise<Stream> {
  const tx = startTransaction({
    op: "fetch-tmdb-file-export",
    name: "Fetch TMDB File Export Data",
    data: {
      date,
      options,
    },
  });

  configureScope((scope) => scope.setSpan(tx));

  addBreadcrumb({
    category: "tmdb-file-export",
    message: `Read stream`,
  });

  const read = await movieIdsReadFileExport(date, options);

  if (!read) {
    return new Promise((resolve, reject) => {
      reject(`Couldn't read data from stream`);
    });
  }

  addBreadcrumb({
    category: "tmdb-file-export",
    message: `Write data from stream`,
  });

  const write = read.pipe(movieIdsWriteMongodb());

  return new Promise((resolve, reject) =>
    write
      .on("error", () => {
        reject(`Couldn't write data from stream`);
      })
      .on("finish", async () => {
        const count = await MovieId.countDocuments();
        const validCount = await MovieId.countDocuments({ neverUse: false });

        console.info(`Tracked data for ${validCount}/${count} movies`);
        resolve(write);
      })
  );
}
