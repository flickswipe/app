import { Publisher, Subjects, UserUpdatedEmailEvent } from '@flickswipe/common';

/**
 * @see UserUpdatedEmailEvent for payload interface
 */
export class UserUpdatedEmailPublisher extends Publisher<
  UserUpdatedEmailEvent
> {
  subject: Subjects.UserUpdatedEmail = Subjects.UserUpdatedEmail;
}
