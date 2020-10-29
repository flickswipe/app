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
    const { id, language } = data;

    // update doc
    const existingDoc = await Genre.findOne({ _id: id, language });
    if (existingDoc) {
      (await updateGenreDoc(existingDoc, data)) && msg.ack();
      return;
    }

    // create doc
    (await createGenreDoc(data)) && msg.ack();
  }
}

/**
 * @param existingDoc doc to update
 * @param data data to update with
 * @returns {boolean} true if message should be acked
 */
async function updateGenreDoc(
  existingDoc: GenreDoc,
  data: GenreDetectedEvent["data"]
): Promise<boolean> {
  const { id, name } = data;

  // don't update if current data more recent
  if (existingDoc.updatedAt > data.detectedAt) {
    console.log(`Skipping genre update: current data is more recent`);
    return true;
  }
  // update
  existingDoc.name = name;

  try {
    await existingDoc.save();
  } catch (err) {
    console.error(`Couldn't update genre ${name}, will try again later.`);
    console.error(err);
    return;
  }

  console.log(`Updated genre #${id}'s name to ${existingDoc.name}`);
  return true;
}

/**
 * @param data data to create with
 * @returns {boolean} true if message should be acked
 */
async function createGenreDoc(
  data: GenreDetectedEvent["data"]
): Promise<boolean> {
  const { id, name, language } = data;

  try {
    await Genre.build({ id, name, language }).save();
  } catch (err) {
    console.error(`Couldn't create genre ${name}, will try again later.`);
    console.error(err);
    return;
  }
  console.log(`Created genre #${id} with name "${name}" (${language})`);
  return true;
}
