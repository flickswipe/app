import { Message } from 'node-nats-streaming';

import { Listener, MediaItemUpdatedEvent, Subjects } from '@flickswipe/common';

import { Country } from '../../models/country';
import { Language } from '../../models/language';
import { StreamLocation, StreamLocationAttrs } from '../../models/stream-location';

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

    // track audioLanguages
    promises.push(createAudioLanguageIfNotExists(data.audioLanguage));

    // track stream locations
    parseStreamLocations(data).forEach((location) => {
      promises.push(saveStreamLocation(location, data));
      promises.push(createCountryIfNotExists(location.country));
    });

    // wait for all promises to finish
    await Promise.all(promises);

    msg.ack();
  }
}

/**
 * @param data
 * @returns {boolean} true if message should be acked
 */
export async function createAudioLanguageIfNotExists(
  audioLanguage: string
): Promise<void> {
  // create doc if not exists
  let audioLanguageDoc = await Language.findOne({
    audioLanguage,
  });

  if (!audioLanguageDoc) {
    audioLanguageDoc = await Language.build({ audioLanguage }).save();
  }
}

/**
 * @param data
 * @returns {array} array of stream location attrs
 */
export function parseStreamLocations(
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
  locations = locations.map((location) => {
    let url;
    try {
      url = new URL(location.url).origin;
    } catch (err) {
      console.error(`Ignore ${location.name}: invalid url`, location, err);
      return null;
    }

    return Object.assign(location, { url });
  });

  return locations.filter((location) => location);
}

/**
 * @param location stream location to save
 * @param data
 * @returns {boolean} true if message should be acked
 */
export async function saveStreamLocation(
  { id, name, url, country }: StreamLocationAttrs,
  data: MediaItemUpdatedEvent["data"]
): Promise<void> {
  // check for existing doc
  const existingDoc = await StreamLocation.findById({
    _id: StreamLocation.id(id),
  });

  // create if none exists
  if (!existingDoc) {
    await StreamLocation.build({ id, name, url, country }).save();
    return;
  }

  // don't overwrite more recent data
  if (existingDoc.updatedAt > data.updatedAt) {
    return;
  }

  // update
  existingDoc.name = name;
  existingDoc.url = url;
  existingDoc.country = country;

  await existingDoc.save();
}

/**
 * @param country country to save
 * @param data
 */
export async function createCountryIfNotExists(country: string): Promise<void> {
  // check for existing doc
  const existingDoc = await Country.findOne({
    country,
  });

  // create if none exists
  if (!existingDoc) {
    await Country.build({ country }).save();
  }
}
