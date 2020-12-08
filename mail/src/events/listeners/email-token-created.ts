import { Message } from 'node-nats-streaming';

import { EmailTokenCreatedEvent, EmailTokenType, Listener, Subjects } from '@flickswipe/common';

import { sendAddEmailLink } from '../../services/send-add-email-link';
import { sendMagicLink } from '../../services/send-magic-link';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `EmailTokenCreated` events
 */
export class EmailTokenCreatedListener extends Listener<EmailTokenCreatedEvent> {
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
    await sendMail(data);
    msg.ack();
  }
}

/**
 * @param data
 */
async function sendMail(data: EmailTokenCreatedEvent["data"]): Promise<void> {
  // route token types to handler services
  switch (data.emailTokenType) {
    case EmailTokenType.SignIn:
      await sendMagicLink(data);
      return;

    case EmailTokenType.AddEmail:
      await sendAddEmailLink(data);
      return;

    default:
      // ignore data we don't know how to handle
      return;
  }
}
