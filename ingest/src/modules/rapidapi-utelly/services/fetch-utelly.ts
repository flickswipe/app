import { Utelly, UtellyDoc } from "../models/utelly";
import { utellyQuery } from "./queries/utelly-query";
import { utellyParser } from "./queries/utelly-parser";

export async function fetchUtelly(
  imdbId: string,
  country: string
): Promise<UtellyDoc | void> {
  console.log(`Fetching utelly locations ${imdbId}...`);

  // get new data
  const raw = await utellyQuery(imdbId, country);
  if (!raw) {
    console.log(`No utelly data for ${imdbId}`);
    return null;
  }

  // parse new data
  const parsed = utellyParser(raw);
  if (!parsed) {
    return null;
  }

  // get existing data
  const existingDoc = await Utelly.findOne({ imdbId, country });

  // update existing doc
  if (existingDoc) {
    existingDoc.locations = parsed.locations;

    await existingDoc.save();

    console.log(`Updated utelly data for ${existingDoc.imdbId}!`);
    return existingDoc;
  }

  // create new doc
  const insertedDoc = await Utelly.build({
    imdbId: imdbId,
    country: country,
    locations: parsed.locations,
  }).save();

  if (insertedDoc) {
    console.log(`Created utelly data for ${insertedDoc.imdbId}`);
  }

  return insertedDoc;
}
