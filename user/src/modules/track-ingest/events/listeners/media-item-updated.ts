import { Subjects, Listener, MediaItemUpdatedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { MediaItem } from "../../models/media-item";

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
    const {
      id,
      rating,
      releaseDate,
      runtime,
      genres,
      language,
      streamLocations,
    } = data;

    try {
      // check if doc already exists
      const existingDoc = await MediaItem.findById({ _id: id });
      if (existingDoc) {
        // don't update if current data more recent
        if (existingDoc.updatedAt > data.updatedAt) {
          console.log(`Skipping genre update: current data is more recent`);
          msg.ack();
        } else {
          // update
          existingDoc.rating = rating;
          existingDoc.releaseDate = releaseDate;
          existingDoc.runtime = runtime;
          existingDoc.genres = genres;

          // @todo process stream locations into db
          existingDoc.streamLocations = [];

          // @todo process language into db
          existingDoc.language = language;

          await existingDoc.save();

          console.log(`Updated media item "${id}"`);
        }
      } else {
        await MediaItem.build({
          id,
          rating,
          releaseDate,
          runtime,
          genres,
          language,
          streamLocations: [],
        }).save();

        console.log(`Created media item "${id}"`);
      }
    } catch (err) {
      console.error(`Couldn't update media item "${id}"`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
