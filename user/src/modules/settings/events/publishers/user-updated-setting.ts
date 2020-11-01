import {
  Subjects,
  Publisher,
  UserUpdatedSettingEvent,
} from "@flickswipe/common";

/**
 * @see UserUpdatedSettingEvent for payload interface
 */
export class UserUpdatedSettingPublisher extends Publisher<
  UserUpdatedSettingEvent
> {
  subject: Subjects.UserUpdatedSetting = Subjects.UserUpdatedSetting;
}
