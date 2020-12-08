import axios from 'axios';
import split2 from 'split2';
import Stream from 'stream';
import zlib from 'zlib';

import { addBreadcrumb, captureException } from '@sentry/node';

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
  addBreadcrumb({
    category: "tmdb-file-export",
    message: `Fetch  ${fileExportUrl}`,
  });

  let result;
  try {
    result = await axios({
      method: "get",
      url: fileExportUrl,
      responseType: "stream",
    });
  } catch (err) {
    captureException(err);
    return;
  }

  if (!result?.data) {
    addBreadcrumb({
      category: "tmdb-file-export",
      message: `Missing result.data`,
      data: {
        result,
      },
    });
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
