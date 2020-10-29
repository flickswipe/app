import { Subjects, Listener, MediaItemUpdatedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import {
  StreamLocation,
  StreamLocationAttrs,
} from "../../models/stream-location";
import { Language } from "../../models/language";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemUpdated` events
 */
export class MediaItemUpdatedListener extends Listener<MediaItemUpdatedEvent> {
  // set listener subject
  subject: Subjects.MediaItemUpdated = Subjects.MediaItemUpdated;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const promises = [];

    // track languages
    promises.push(createLanguageIfNotExists(data));

    // track stream locations
    parseStreamLocations(data).forEach((location) => {
      promises.push(saveStreamLocation(location, data));
    });

    // mark message as processed
    const results = await Promise.all(promises);
    !results.includes(false) && msg.ack();
  }
}

/**
 * @param data
 * @returns {boolean} true if message should be acked
 */
async function createLanguageIfNotExists(
  data: MediaItemUpdatedEvent["data"]
): Promise<boolean> {
  const { language } = data;

  // create doc if not exists
  try {
    let languageDoc = await Language.findOne({
      language,
    });

    if (!languageDoc) {
      languageDoc = await Language.build({ language }).save();
    }
  } catch (err) {
    console.error(`Couldn't track language ${language}`, err);
    return false;
  }

  return true;
}

/**
 * @param data
 * @returns {array} array of stream location attrs
 */
function parseStreamLocations(
  data: MediaItemUpdatedEvent["data"]
): StreamLocationAttrs[] {
  const { streamLocations } = data;

  // convert stream locations into a flat array
  // using country as a property instead of a key
  let locations = Object.keys(streamLocations)
    .map((country) =>
      streamLocations[country].map((location) =>
        Object.assign({ country }, location)
      )
    )
    .flat() as StreamLocationAttrs[];

  // guess the streaming service url from the video url
  // (which we assume is just the origin, ie. host+protocol)
  try {
    locations = locations.map((location) =>
      Object.assign(location, { url: new URL(location.url).origin })
    );
  } catch (err) {
    console.error(
      "Couldn't parse all urls, stream locations ignored",
      locations,
      err
    );
    return [];
  }

  return locations;
}

async function saveStreamLocation(
  { id, name, url, country }: StreamLocationAttrs,
  data: MediaItemUpdatedEvent["data"]
): Promise<boolean> {
  // check for existing doc
  const existingDoc = await StreamLocation.findById({
    _id: StreamLocation.id(id),
  });

  // create if none exists
  if (!existingDoc) {
    try {
      await StreamLocation.build({ id, name, url, country }).save();
    } catch (err) {
      console.error(`Couldn't create location ${name}`, err);
      return false;
    }
    return true;
  }

  // don't overwrite more recent data
  if (existingDoc.updatedAt > data.updatedAt) {
    return true;
  }

  // update
  existingDoc.name = name;
  existingDoc.url = url;
  existingDoc.country = country;

  try {
    await existingDoc.save();
  } catch (err) {
    console.error(`Couldn't update location ${name}`, err);
    return false;
  }

  return true;
}
