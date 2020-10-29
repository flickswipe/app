import {
  Subjects,
  Listener,
  UserUpdatedEmailEvent,
  BadRequestError,
} from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { User } from "../../models/user";

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
    const { id, email } = data;

    try {
      // check if doc already exists
      const existingDoc = await User.findById({ _id: id });
      if (!existingDoc) {
        throw new BadRequestError(`Can't update non-existant user`);
      }

      // don't update if current data more recent
      if (existingDoc.updatedAt > data.updatedAt) {
        console.log(`Skipping user update: current data is more recent`);
        msg.ack();
      } else {
        // update
        existingDoc.email = email;
        await existingDoc.save();

        console.log(`Updated user #${id}'s email to ${existingDoc.email}`);
      }
    } catch (err) {
      console.error(`Couldn't update user #${id}'s email to ${email}`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
