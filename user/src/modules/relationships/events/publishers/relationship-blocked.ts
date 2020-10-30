import {
  Subjects,
  Publisher,
  RelationshipBlockedEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipBlockedEvent for payload interface
 */
export class RelationshipBlockedPublisher extends Publisher<
  RelationshipBlockedEvent
> {
  subject: Subjects.RelationshipBlocked = Subjects.RelationshipBlocked;
}
