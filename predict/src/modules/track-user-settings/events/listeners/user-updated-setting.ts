import { Message } from 'node-nats-streaming';

import { Listener, Subjects, UserUpdatedSettingEvent } from '@flickswipe/common';

import { createSuggestions } from '../../../generate-suggestions/generate-suggestions';
import { Setting } from '../../models/setting';

const { QUEUE_GROUP_NAME } = process.env;

/**
 * Listen to `UserUpdatedSetting` events
 */
export class UserUpdatedSettingListener extends Listener<UserUpdatedSettingEvent> {
  // set listener subject
  subject: Subjects.UserUpdatedSetting = Subjects.UserUpdatedSetting;

  // set queue group name
  queueGroupName = QUEUE_GROUP_NAME;

  /**
   * @param data message data
   * @param msg message handler
   */
  async onMessage(
    data: UserUpdatedSettingEvent["data"],
    msg: Message
  ): Promise<void> {
    // update database
    await updateUserSettings(data);

    // create suggestions
    const userId = data.user;
    await createSuggestions(userId, true);

    msg.ack();
  }
}

/**
 * @param data data to update with
 * @returns {boolean} true if message should be acked
 */
async function updateUserSettings(
  data: UserUpdatedSettingEvent["data"]
): Promise<void> {
  const { settingType, user, value, updatedAt } = data;

  const existingDoc = await Setting.findOne({ settingType, user });
  if (existingDoc) {
    if (existingDoc.updatedAt > updatedAt) {
      return;
    }

    // update
    existingDoc.value = value;
    await existingDoc.save();
  } else {
    // create
    await Setting.build({ settingType, user, value }).save();
  }

  console.info(`Updated ${settingType} setting for user #${user}`, value);
}
