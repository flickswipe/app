import { Message } from 'node-nats-streaming';

import { Listener, MediaItemUpdatedEvent, Subjects } from '@flickswipe/common';

import { MediaItem, MediaItemDoc } from '../../models/media-item';

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
    const existingDoc = await MediaItem.findOne({ _id: data.id });

    if (existingDoc) {
      await updateMediaItem(existingDoc, data);
      msg.ack();
      return;
    }

    await createMediaItem(data);
    msg.ack();
  }
}

/**
 * @param existingDoc doc to update
 * @param data
 */
async function updateMediaItem(
  existingDoc: MediaItemDoc,
  data: MediaItemUpdatedEvent["data"]
): Promise<void> {
  // don't overwrite more recent data
  if (existingDoc.updatedAt > data.updatedAt) {
    console.info(`Skipping media item update: current data is more recent`);
    return;
  }
  // update
  existingDoc.imdbId = data.imdbId;
  existingDoc.title = data.title;
  existingDoc.genres = data.genres;
  existingDoc.images = data.images;
  existingDoc.rating = data.rating;
  existingDoc.audioLanguage = data.audioLanguage;
  existingDoc.releaseDate = data.releaseDate;
  existingDoc.runtime = data.runtime;
  existingDoc.plot = data.plot;
  existingDoc.streamLocations = data.streamLocations;

  await existingDoc.save();

  console.info(`Updated media item "${data.title}"`);
}

/**
 * @param data
 */
async function createMediaItem(
  data: MediaItemUpdatedEvent["data"]
): Promise<void> {
  await MediaItem.build(data).save();

  console.info(`Created media item "${data.title}"`);
}
