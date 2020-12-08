import { Message } from 'node-nats-streaming';

import { BadRequestError, Listener, Subjects, UserCreatedEvent } from '@flickswipe/common';

import { User } from '../../models/user';

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
    msg.ack();
  }
}

/**
 * @param data data to update with
 */
async function createUser(data: UserCreatedEvent["data"]): Promise<void> {
  const { id, email } = data;

  await User.build({ id, email }).save();

  console.info(`Created user #${id} with email "${email}"`);
}
