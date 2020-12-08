import { MediaItemUpdatedEvent, Publisher, Subjects } from '@flickswipe/common';

export class MediaItemUpdatedPublisher extends Publisher<
  MediaItemUpdatedEvent
> {
  subject: Subjects.MediaItemUpdated = Subjects.MediaItemUpdated;
}
