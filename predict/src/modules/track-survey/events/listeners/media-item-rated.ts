import { Subjects, Listener, MediaItemRatedEvent } from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { deleteSuggestion } from "../../../generate-suggestions/generate-suggestions";
import { SurveyResponse } from "../../models/survey-response";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `MediaItemRated` events
 */
export class MediaItemRatedListener extends Listener<MediaItemRatedEvent> {
  // set listener subject
  subject: Subjects.MediaItemRated = Subjects.MediaItemRated;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: MediaItemRatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const existingDoc = await SurveyResponse.findOne({
      user: data.user,
      mediaItem: data.id,
    });

    if (!existingDoc) {
      await createSurveyReponse(data);
    }

    await removeFromQueue(data);

    msg.ack();
  }
}

async function createSurveyReponse(
  data: MediaItemRatedEvent["data"]
): Promise<void> {
  await SurveyResponse.build({ user: data.user, mediaItem: data.id }).save();
}

async function removeFromQueue(
  data: MediaItemRatedEvent["data"]
): Promise<void> {
  await deleteSuggestion(data.user, data.id);
}
