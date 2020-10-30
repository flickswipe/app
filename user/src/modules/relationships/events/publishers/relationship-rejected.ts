import {
  Subjects,
  Publisher,
  RelationshipRejectedEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipRejectedEvent for payload interface
 */
export class RelationshipRejectedPublisher extends Publisher<
  RelationshipRejectedEvent
> {
  subject: Subjects.RelationshipRejected = Subjects.RelationshipRejected;
}
