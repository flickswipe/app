import { Message } from 'node-nats-streaming';

import { BadRequestError, Listener, Subjects, UserCreatedEvent } from '@flickswipe/common';

import { User } from '../../models/user';
import { createSuggestions } from '../../services/create-suggestions';

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
    // check if doc already exists
    const existingDoc = await User.findOne({ _id: data.id });

    // fail & ignore message if user already exists
    if (existingDoc) {
      msg.ack();
      throw new BadRequestError(`Can't create the same user twice`);
    }

    // create
    await createUser(data);

    // create suggestions
    const userId = data.id;
    await createSuggestions(userId);

    msg.ack();
  }
}

/**
 * @param data data to update with
 * @returns {boolean} true if message should be acked
 */
async function createUser(data: UserCreatedEvent["data"]): Promise<void> {
  const { id } = data;

  const insertedDoc = await User.build({ id }).save();
  console.info(`Tracked user ${insertedDoc.id}`);
}
