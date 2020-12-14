import { Message } from 'node-nats-streaming';

import { Listener, MediaItemsSuggestedEvent, Subjects } from '@flickswipe/common';

import { Suggestion } from '../../models/suggestion';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemsSuggested` events
 */
export class MediaItemsSuggestedListener extends Listener<MediaItemsSuggestedEvent> {
  // set listener subject
  subject: Subjects.MediaItemsSuggested = Subjects.MediaItemsSuggested;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemsSuggestedEvent["data"],
    msg: Message
  ): Promise<void> {
    // create suggestion doc if none exists
    (await Suggestion.findOne(data)) || (await createSuggestionDocs(data));
    msg.ack();
  }
}

/**
 * @param data data to create with
 */
async function createSuggestionDocs(
  data: MediaItemsSuggestedEvent["data"]
): Promise<void> {
  const { user, mediaItems } = data;

  const promises = [];

  for (const mediaItem of mediaItems) {
    const promise = Suggestion.build({ user, mediaItem }).save();
    promises.push(promise);
  }

  await Promise.all(promises);

  console.info(`User ${user} tracked ${mediaItems.length} suggestions`);
}
