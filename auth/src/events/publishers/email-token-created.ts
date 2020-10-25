import {
  Subjects,
  Publisher,
  EmailTokenCreatedEvent,
} from "@flickswipe/common";

/**
 * @see EmailTokenCreatedEvent for payload interface
 */
export class EmailTokenCreatedPublisher extends Publisher<
  EmailTokenCreatedEvent
> {
  subject: Subjects.EmailTokenCreated = Subjects.EmailTokenCreated;
}
