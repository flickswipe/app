import { MediaItemsSuggestedEvent, Publisher, Subjects } from '@flickswipe/common';

/**
 * @see MediaItemsSuggestedEvent for payload interface
 */
export class MediaItemsSuggestedPublisher extends Publisher<MediaItemsSuggestedEvent> {
  subject: Subjects.MediaItemsSuggested = Subjects.MediaItemsSuggested;
}
