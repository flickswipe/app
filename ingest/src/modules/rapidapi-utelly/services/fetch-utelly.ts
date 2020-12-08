import { addBreadcrumb, configureScope, startTransaction } from '@sentry/node';

import { Utelly, UtellyDoc } from '../models/utelly';
import { utellyParser } from './queries/utelly-parser';
import { utellyQuery } from './queries/utelly-query';

export async function fetchUtelly(
  imdbId: string,
  country: string,
  options: Record<string, unknown> = {}
): Promise<UtellyDoc | void> {
  options;

  const tx = startTransaction({
    op: "fetch-utelly",
    name: "Fetch Utelly Data",
    data: {
      options,
    },
  });

  configureScope((scope) => scope.setSpan(tx));

  addBreadcrumb({
    category: "utelly",
    message: `Fetch`,
  });

  // get new data
  const raw = await utellyQuery(imdbId, country);
  if (!raw) {
    addBreadcrumb({
      category: "utelly",
      message: `No data for ${imdbId}`,
    });
    tx.finish();
    return null;
  }

  // parse new data
  const parsed = utellyParser(raw);
  if (!parsed) {
    addBreadcrumb({
      category: "utelly",
      message: `Malformed data for ${imdbId}`,
    });
    tx.finish();
    return null;
  }

  // get existing data
  const existingDoc = await Utelly.findOne({ imdbId, country });

  // update existing doc
  if (existingDoc) {
    addBreadcrumb({
      category: "utelly",
      message: `Updating ${imdbId}`,
    });

    existingDoc.locations = parsed.locations;

    await existingDoc.save();

    console.info(`Updated utelly data for ${existingDoc.imdbId}`);
    tx.finish();
    return existingDoc;
  }

  // create new doc
  addBreadcrumb({
    category: "utelly",
    message: `Creating ${imdbId}`,
  });

  const insertedDoc = await Utelly.build({
    imdbId: imdbId,
    country: country,
    locations: parsed.locations,
  }).save();

  console.info(`Created utelly data for ${insertedDoc.imdbId}`);
  tx.finish();
  return insertedDoc;
}
