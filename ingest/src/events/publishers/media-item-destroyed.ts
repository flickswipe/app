import { MediaItemDestroyedEvent, Publisher, Subjects } from '@flickswipe/common';

export class MediaItemDestroyedPublisher extends Publisher<
  MediaItemDestroyedEvent
> {
  subject: Subjects.MediaItemDestroyed = Subjects.MediaItemDestroyed;
}
