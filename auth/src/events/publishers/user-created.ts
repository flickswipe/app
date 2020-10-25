import { Subjects, Publisher, UserCreatedEvent } from "@flickswipe/common";

/**
 * @see UserCreatedEvent for payload interface
 */
export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
