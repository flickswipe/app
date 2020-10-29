import {
  Subjects,
  Listener,
  UserCreatedEvent,
  BadRequestError,
} from "@flickswipe/common";

import { Message } from "node-nats-streaming";
import { User } from "../../models/user";

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `UserCreated` events
 */
export class UserCreatedListener extends Listener<UserCreatedEvent> {
  // set listener subject
  subject: Subjects.UserCreated = Subjects.UserCreated;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(data: UserCreatedEvent["data"], msg: Message): Promise<void> {
    const { id, email } = data;

    try {
      // check if doc already exists
      const existingDoc = await User.findOne({ _id: id });
      if (existingDoc) {
        throw new BadRequestError(`Can't create the same user twice`);
      } else {
        await User.build({ id, email }).save();

        console.log(`Created user #${id} with email "${email}"`);
      }
    } catch (err) {
      // don't loop requests that can't be fulfilled
      if (err instanceof BadRequestError) {
        msg.ack();
        throw err;
      }

      // handle database errors
      console.error(`Couldn't create user ${id} with email ${email}`, err);
      return;
    }

    // mark message as processed
    msg.ack();
  }
}
