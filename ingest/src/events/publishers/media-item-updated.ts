import { Subjects, Publisher, MediaItemUpdatedEvent } from "@flickswipe/common";

export class MediaItemUpdatedPublisher extends Publisher<
  MediaItemUpdatedEvent
> {
  subject: Subjects.MediaItemUpdated = Subjects.MediaItemUpdated;
}
