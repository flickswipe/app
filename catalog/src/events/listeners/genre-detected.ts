import { Subjects, Listener, GenreDetectedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { Genre } from "../../models/genre";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `GenreDetected` events
 */
export class GenreDetectedListener extends Listener<GenreDetectedEvent> {
  // set listener subject
  subject: Subjects.GenreDetected = Subjects.GenreDetected;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: GenreDetectedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { tmdbGenreId, name, language } = data;
    try {
      // check if doc already exists
      const existingDoc = await Genre.findOne({ tmdbGenreId, language });
      if (existingDoc) {
        // don't update if current data more recent
        if (existingDoc.updatedAt > data.detectedAt) {
          console.log(`Skipping genre update: current data is more recent`);
          msg.ack();
        } else {
          // update

          existingDoc.name = name;
          await existingDoc.save();

          console.log(
            `Updated genre #${tmdbGenreId}'s name to ${existingDoc.name}`
          );
        }
      } else {
        await Genre.build({ tmdbGenreId, name, language }).save();

        console.log(
          `Created genre #${tmdbGenreId} with name "${name}" (${language})`
        );
      }
    } catch (err) {
      console.error(`Couldn't update genre ${tmdbGenreId}`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
