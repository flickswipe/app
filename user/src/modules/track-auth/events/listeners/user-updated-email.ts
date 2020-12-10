import { Message } from 'node-nats-streaming';

import { BadRequestError, Listener, Subjects, UserUpdatedEmailEvent } from '@flickswipe/common';

import { User, UserDoc } from '../../models/user';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `UserUpdatedEmail` events
 */
export class UserUpdatedEmailListener extends Listener<UserUpdatedEmailEvent> {
  // set listener subject
  subject: Subjects.UserUpdatedEmail = Subjects.UserUpdatedEmail;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: UserUpdatedEmailEvent["data"],
    msg: Message
  ): Promise<void> {
    // check if doc already exists
    const existingDoc = await User.findById({ _id: data.id });

    // fail if no user exists
    // don't ack -- maybe we received messages out of order
    if (!existingDoc) {
      throw new BadRequestError(`Can't update non-existant user`);
    }

    // update
    await updateUserEmail(existingDoc, data);
    msg.ack();
  }
}

/**
 * @param data data to update with
 */
async function updateUserEmail(
  existingDoc: UserDoc,
  data: UserUpdatedEmailEvent["data"]
): Promise<void> {
  const { email } = data;

  // don't update if current data more recent
  if (existingDoc.updatedAt > data.updatedAt) {
    return;
  }
  // update
  existingDoc.email = email;

  await existingDoc.save();
  console.info(`Tracked new email for user ${existingDoc.id}`);
}
