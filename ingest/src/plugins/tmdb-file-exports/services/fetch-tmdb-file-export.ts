import Stream from "stream";

import { movieIdsDataset } from "./datasets";
import { MovieId } from "../models/movie-id";
import { movieIdsWritableStream } from "../streams/movie-ids-writable";

export async function fetchTmdbFileExport(date: Date): Promise<Stream> {
  console.log(`Fetching tmdb file export...`);

  const read = await movieIdsDataset.ingest(date);
  const write = read.pipe(movieIdsWritableStream);

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
