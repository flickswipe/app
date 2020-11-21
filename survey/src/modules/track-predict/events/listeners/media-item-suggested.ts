import { Subjects, Listener, MediaItemSuggestedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { Suggestion } from "../../models/suggestion"

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemSuggested` events
 */
export class MediaItemSuggestedListener extends Listener<MediaItemSuggestedEvent> {
  // set listener subject
  subject: Subjects.MediaItemSuggested = Subjects.MediaItemSuggested;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemSuggestedEvent["data"],
    msg: Message
  ): Promise<void> {

    // create suggestion doc if none exists
    (await Suggestion.findOne(data) || await createSuggestionDoc(data)) && msg.ack();
  }
}

/**
 * @param data data to create with
 * @returns {boolean} true if message should be acked
 */
async function createSuggestionDoc(
  data: MediaItemSuggestedEvent["data"]
): Promise<boolean> {
  const { user, mediaItem } = data;

  try {
    await Suggestion.build({ user, mediaItem }).save();
  } catch (err) {
    console.error(`Couldn't create suggestion, will try again later.`);
    console.error(err);
    return;
  }
  console.log(`Suggested media item #${mediaItem} for user #"${user}"`);
  return true;
}
