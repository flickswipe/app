import { Subjects, Listener, GenreDetectedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { Genre, GenreDoc } from "../../models/genre";

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
    const { genreId, language } = data;

    // update doc
    const existingDoc = await Genre.findOne({ genreId: genreId, language });
    if (existingDoc) {
      await updateGenreDoc(existingDoc, data);
      msg.ack();
      return;
    }

    // create doc
    await createGenreDoc(data);
    msg.ack();
  }
}

/**
 * @param existingDoc doc to update
 * @param data data to update with
 */
async function updateGenreDoc(
  existingDoc: GenreDoc,
  data: GenreDetectedEvent["data"]
): Promise<void> {
  const { genreId, name } = data;

  // don't update if current data more recent
  if (existingDoc.updatedAt > data.detectedAt) {
    console.log(`Skipping genre update: current data is more recent`);
    return;
  }

  // update
  existingDoc.name = name;
  await existingDoc.save();

  console.log(`Updated genre #${genreId}'s name to ${existingDoc.name}`);
}

/**
 * @param data data to create with
 */
async function createGenreDoc(data: GenreDetectedEvent["data"]): Promise<void> {
  const { genreId, name, language } = data;

  await Genre.build({ genreId, name, language }).save();

  console.log(`Created genre #${genreId} with name "${name}" (${language})`);
}
