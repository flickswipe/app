import { Publisher, RelationshipUpdatedEvent, Subjects } from '@flickswipe/common';

/**
 * @see RelationshipUpdatedEvent for payload interface
 */
export class RelationshipUpdatedPublisher extends Publisher<
  RelationshipUpdatedEvent
> {
  subject: Subjects.RelationshipUpdated = Subjects.RelationshipUpdated;
}
