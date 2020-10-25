import { Utelly, UtellyDoc } from "../models/utelly";
import { utellyQuery } from "./queries";
import { utellyResultParser } from "../result-parsers/utelly";

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
  const parsed = utellyResultParser(raw);
  if (!parsed) {
    return null;
  }

  // get existing data
  const existingDoc = await Utelly.findOne({ imdbId });

  // get new data
  const newDoc = {
    imdbId: imdbId,
    country: country,
    locations: parsed.locations,
  };

  // update existing doc
  if (existingDoc) {
    Object.assign(existingDoc, newDoc);

    await existingDoc
      .save()
      .then((existingDoc: UtellyDoc) =>
        console.log(`Updated utelly data for ${existingDoc.imdbId}!`)
      )
      .catch((err: Error) => {
        throw err;
      });

    return existingDoc;
  }

  // create new doc
  const insertedDoc = await Utelly.build(newDoc)
    .save()
    .catch((err: Error) => {
      throw err;
    });

  insertedDoc && console.log(`Created utelly data for ${insertedDoc.imdbId}`);

  return insertedDoc;
}
