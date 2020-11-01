import { Subjects, Listener, MediaItemUpdatedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { MediaItem, MediaItemDoc } from "../../models/media-item";

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
      (await updateMediaItem(existingDoc, data)) && msg.ack();
      return;
    }

    (await createMediaItem(data)) && msg.ack();
  }
}

async function updateMediaItem(
  existingDoc: MediaItemDoc,
  data: MediaItemUpdatedEvent["data"]
): Promise<boolean> {
  // don't overwrite more recent data
  if (existingDoc.updatedAt > data.updatedAt) {
    console.log(`Skipping media item update: current data is more recent`);
    return true;
  }
  // update
  existingDoc.imdbId = data.imdbId;
  existingDoc.title = data.title;
  existingDoc.genres = data.genres;
  existingDoc.images = data.images;
  existingDoc.rating = data.rating;
  existingDoc.language = data.language;
  existingDoc.releaseDate = data.releaseDate;
  existingDoc.runtime = data.runtime;
  existingDoc.plot = data.plot;
  existingDoc.streamLocations = data.streamLocations;

  try {
    await existingDoc.save();
  } catch (err) {
    console.error(`Couldn't update media item "${data.title}"`, err);
    return false;
  }

  console.log(`Updated media item "${data.title}"`);
  return true;
}

async function createMediaItem(
  data: MediaItemUpdatedEvent["data"]
): Promise<boolean> {
  try {
    await MediaItem.build(data).save();
  } catch (err) {
    console.error(`Couldn't create media item "${data.title}"`, err);
    return false;
  }

  console.log(`Created media item "${data.title}"`);
  return true;
}
