import Stream from "stream";

import { MovieId } from "../models/movie-id";
import { movieIdsReadFileExport } from "./streams/movie-ids-read-file-export";
import { movieIdsWriteMongodb } from "./streams/movie-ids-write-mongodb";

export async function fetchTmdbFileExport(
  date: Date,
  options: Record<string, unknown> = {}
): Promise<Stream> {
  console.log(`Fetching tmdb file export...`);

  const read = await movieIdsReadFileExport(date, options);
  const write = read.pipe(movieIdsWriteMongodb());

  return new Promise((resolve, reject) =>
    write
      .on("finish", async () => {
        const count = await MovieId.countDocuments();
        console.log(`Fetched ${count} IDs from tmdb file export!`);
        const validCount = await MovieId.countDocuments({ neverUse: false });
        console.log(`(Tracking data for ${validCount} movies)`);

        resolve(write);
      })
      .on("error", reject)
  );
}
