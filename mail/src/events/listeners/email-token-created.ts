import {
  Subjects,
  Listener,
  EmailTokenCreatedEvent,
  EmailTokenType,
} from "@flickswipe/common";

import { Message } from "node-nats-streaming";

import { sendAddEmailLink } from "../../services/send-add-email-link";
import { sendMagicLink } from "../../services/send-magic-link";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `EmailTokenCreated` events
 */
export class EmailTokenCreatedListener extends Listener<
  EmailTokenCreatedEvent
> {
  // set listener subject
  subject: Subjects.EmailTokenCreated = Subjects.EmailTokenCreated;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   *
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: EmailTokenCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    (await sendMail(data)) && msg.ack();
  }
}

/**
 * @param data
 * @returns {boolean} true if message should e acked
 */
async function sendMail(
  data: EmailTokenCreatedEvent["data"]
): Promise<boolean> {
  // route token types to handler services
  try {
    switch (data.emailTokenType) {
      case EmailTokenType.SignIn:
        await sendMagicLink(data);
        return true;

      case EmailTokenType.AddEmail:
        await sendAddEmailLink(data);
        return true;

      default:
        // ignore data we don't know how to handle
        return false;
    }
  } catch (err) {
    console.error("Couldn't send mail", err);
    return false;
  }
}
