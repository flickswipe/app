import { Subjects, Publisher, MediaItemRatedEvent } from "@flickswipe/common";

/**
 * @see MediaItemRatedEvent for payload interface
 */
export class MediaItemRatedPublisher extends Publisher<MediaItemRatedEvent> {
  subject: Subjects.MediaItemRated = Subjects.MediaItemRated;
}
