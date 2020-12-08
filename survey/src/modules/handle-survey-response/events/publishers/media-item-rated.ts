import { MediaItemRatedEvent, Publisher, Subjects } from '@flickswipe/common';

/**
 * @see MediaItemRatedEvent for payload interface
 */
export class MediaItemRatedPublisher extends Publisher<MediaItemRatedEvent> {
  subject: Subjects.MediaItemRated = Subjects.MediaItemRated;
}
