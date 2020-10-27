import {
  Subjects,
  Listener,
  MediaItemDestroyedEvent,
} from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { MediaItem } from "../../models/media-item";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemDestroyed` events
 */
export class MediaItemDestroyedListener extends Listener<
  MediaItemDestroyedEvent
> {
  // set listener subject
  subject: Subjects.MediaItemDestroyed = Subjects.MediaItemDestroyed;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemDestroyedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { tmdbMovieId } = data;

    try {
      await MediaItem.deleteMany({
        tmdbMovieId,
      });
      console.log(`Removed media item ${tmdbMovieId}`);
    } catch (err) {
      console.error(`Couldn't delete media item ${tmdbMovieId}`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
