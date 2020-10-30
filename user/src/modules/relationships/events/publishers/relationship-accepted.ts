import {
  Subjects,
  Publisher,
  RelationshipAcceptedEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipAcceptedEvent for payload interface
 */
export class RelationshipAcceptedPublisher extends Publisher<
  RelationshipAcceptedEvent
> {
  subject: Subjects.RelationshipAccepted = Subjects.RelationshipAccepted;
}
