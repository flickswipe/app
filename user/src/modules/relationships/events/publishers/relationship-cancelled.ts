import {
  Subjects,
  Publisher,
  RelationshipCancelledEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipCancelledEvent for payload interface
 */
export class RelationshipCancelledPublisher extends Publisher<
  RelationshipCancelledEvent
> {
  subject: Subjects.RelationshipCancelled = Subjects.RelationshipCancelled;
}
