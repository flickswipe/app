import axios from 'axios';
import split2 from 'split2';
import Stream from 'stream';
import zlib from 'zlib';

import { MovieIdsFilterRows } from './movie-ids-filter-rows';

/**
 * Configure source url
 */
const URL = "http://files.tmdb.org/p/exports/movie_ids_MM_DD_YYYY.json.gz";

/**
 * Create stream from file export
 *
 * @param date date of file export to stream
 *
 * @returns {Promise} resolves to a stream
 */
export const movieIdsReadFileExport = async (
  date: Date,
  options: Record<string, unknown> = {}
): Promise<Stream> => {
  // get date in MM_DD_YYYY format
  const MM = `${date.getMonth() + 1}`.padStart(2, "0");
  const DD = `${date.getDate()}`.padStart(2, "0");
  const YYYY = `${date.getFullYear()}`;

  const fileExportUrl = URL.replace("MM_DD_YYYY", `${MM}_${DD}_${YYYY}`);

  // stream from the server
  console.log(`Getting file export ${fileExportUrl}`);

  let result;
  try {
    result = await axios({
      method: "get",
      url: fileExportUrl,
      responseType: "stream",
    });
  } catch (err) {
    console.error(`Error when streaming file export: `, err);
    return;
  }

  if (!result?.data) {
    console.log(`File export stream contains no data`);
    return;
  }

  // decompress the stream, split into lines, and filter out irrelevant data
  const stream: Stream = result.data
    .pipe(zlib.createGunzip())
    .pipe(split2())
    .pipe(new MovieIdsFilterRows(options));

  // return stream for further processing
  return stream;
};
