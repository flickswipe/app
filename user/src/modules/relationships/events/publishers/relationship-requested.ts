import {
  Subjects,
  Publisher,
  RelationshipRequestedEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipRequestedEvent for payload interface
 */
export class RelationshipRequestedPublisher extends Publisher<
  RelationshipRequestedEvent
> {
  subject: Subjects.RelationshipRequested = Subjects.RelationshipRequested;
}
