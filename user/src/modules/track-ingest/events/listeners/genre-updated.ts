import { Message } from 'node-nats-streaming';

import { GenreUpdatedEvent, Listener, Subjects } from '@flickswipe/common';

import { Genre, GenreDoc } from '../../models/genre';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `GenreUpdated` events
 */
export class GenreUpdatedListener extends Listener<GenreUpdatedEvent> {
  // set listener subject
  subject: Subjects.GenreUpdated = Subjects.GenreUpdated;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: GenreUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { id } = data;

    // update doc
    const existingDoc = await Genre.findById(id);
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
  data: GenreUpdatedEvent["data"]
): Promise<void> {
  const { id, tmdbGenreId, name } = data;

  // don't update if current data more recent
  if (existingDoc.updatedAt > data.updatedAt) {
    console.info(`Skipping genre update: current data is more recent`);
    return;
  }
  // update
  existingDoc.tmdbGenreId = tmdbGenreId;
  existingDoc.name = name;
  await existingDoc.save();

  console.info(`Updated genre #${id}'s name to ${existingDoc.name}`);
}

/**
 * @param data data to create with
 */
async function createGenreDoc(data: GenreUpdatedEvent["data"]): Promise<void> {
  const { id, tmdbGenreId, name } = data;

  await Genre.build({ id, tmdbGenreId, name }).save();

  console.info(`Created genre #${id} with name "${name}"`);
}
