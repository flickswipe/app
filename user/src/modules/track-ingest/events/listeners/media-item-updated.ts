import { Message } from 'node-nats-streaming';

import { Listener, MediaItemUpdatedEvent, Subjects } from '@flickswipe/common';

import { AudioLanguage } from '../../models/audio-language';
import { Country } from '../../models/country';
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

    // parse stream locations
    const streamLocations = parseStreamLocations(data);

    // track stream locations
    streamLocations.forEach((location) => {
      promises.push(saveStreamLocation(location, data));
    });

    // track countries
    const countries = Array.from(
      new Set(streamLocations.map(({ country }) => country))
    );
    countries.forEach((country) => {
      promises.push(createCountryIfNotExists(country));
    });

    // track audioLanguages
    promises.push(createAudioLanguageIfNotExists(data.audioLanguage));

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
  const existingDoc = await AudioLanguage.findOne({
    audioLanguage,
  });

  if (!existingDoc) {
    const insertedDoc = await AudioLanguage.build({ audioLanguage }).save();
    console.info(
      `Tracked audio language ${insertedDoc.id} ${insertedDoc.audioLanguage}`
    );
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
      console.error(`Ignore ${location.name}: invalid url`);
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
    const insertedDoc = await StreamLocation.build({
      id,
      name,
      url,
      country,
    }).save();
    console.info(
      `Tracked stream location ${insertedDoc.id} ${insertedDoc.name} ${insertedDoc.country}`
    );
    return;
  }

  // don't overwrite more recent data
  if (existingDoc.updatedAt > data.updatedAt) {
    return;
  }

  // update
  if (
    existingDoc.name !== name ||
    existingDoc.url !== url ||
    existingDoc.country !== country
  ) {
    existingDoc.name = name;
    existingDoc.url = url;
    existingDoc.country = country;

    await existingDoc.save();
    console.info(
      `Tracked stream location ${existingDoc.id} ${existingDoc.name} ${existingDoc.country}`
    );
  }
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
    const insertedDoc = await Country.build({ country }).save();
    console.info(`Tracked country ${insertedDoc.id} ${insertedDoc.country}`);
  }
}
