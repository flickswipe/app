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
      tmdbMovieId,
      imdbId,
      title,
      genres,
      images,
      rating,
      language,
      releaseDate,
      runtime,
      plot,
      streamLocations,
    } = data;

    try {
      // check if doc already exists
      const existingDoc = await MediaItem.findOne({ tmdbMovieId });
      if (existingDoc) {
        // don't update if current data more recent
        if (existingDoc.updatedAt > data.updatedAt) {
          console.log(`Skipping genre update: current data is more recent`);
          msg.ack();
        } else {
          // update
          existingDoc.imdbId = imdbId;
          existingDoc.title = title;
          existingDoc.genres = genres;
          existingDoc.images = images;
          existingDoc.rating = rating;
          existingDoc.language = language;
          existingDoc.releaseDate = releaseDate;
          existingDoc.runtime = runtime;
          existingDoc.plot = plot;
          existingDoc.streamLocations = streamLocations;
          await existingDoc.save();

          console.log(`Updated media item "${title}"`);
        }
      } else {
        await MediaItem.build({
          id,
          tmdbMovieId,
          imdbId,
          title,
          genres,
          images,
          rating,
          language,
          releaseDate,
          runtime,
          plot,
          streamLocations,
        }).save();

        console.log(`Created media item "${title}"`);
      }
    } catch (err) {
      console.error(`Couldn't update media item "${title}"`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
