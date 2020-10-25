import axios from "axios";
import split2 from "split2";
import Stream, { Transform } from "stream";
import zlib from "zlib";

import { MovieIdsRowsFilter } from "../filters/movie-ids-rows";

class Dataset {
  constructor(public url: string, public filter: Transform) {}

  ingest(date: Date): Promise<Stream> {
    return new Promise((resolve, reject) => {
      const MM = `${date.getMonth() + 1}`.padStart(2, "0");
      const DD = `${date.getDay()}`.padStart(2, "0");
      const YYYY = `${date.getFullYear()}`;

      const fileExportUrl = this.url.replace(
        "MM_DD_YYYY",
        `${MM}_${DD}_${YYYY}`
      );

      console.log(`Getting file export ${fileExportUrl}`);

      axios({
        method: "get",
        url: fileExportUrl,
        responseType: "stream",
      })
        .then(({ data }: { data: Stream }) => {
          // get stream, decompress, and split by line
          const stream: Stream = data
            .pipe(zlib.createGunzip())
            .pipe(split2())
            .pipe(this.filter);

          resolve(stream);
        })
        .catch((err) => {
          reject(err);
          throw err;
        });
    });
  }
}

export const movieIdsDataset = new Dataset(
  "http://files.tmdb.org/p/exports/movie_ids_MM_DD_YYYY.json.gz",
  new MovieIdsRowsFilter()
);
