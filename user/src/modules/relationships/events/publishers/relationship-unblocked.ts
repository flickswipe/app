import {
  Subjects,
  Publisher,
  RelationshipUnblockedEvent,
} from "@flickswipe/common";

/**
 * @see RelationshipUnblockedEvent for payload interface
 */
export class RelationshipUnblockedPublisher extends Publisher<
  RelationshipUnblockedEvent
> {
  subject: Subjects.RelationshipUnblocked = Subjects.RelationshipUnblocked;
}
