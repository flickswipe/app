import { Subjects, Publisher, GenreDetectedEvent } from "@flickswipe/common";

export class GenreDetectedPublisher extends Publisher<GenreDetectedEvent> {
  subject: Subjects.GenreDetected = Subjects.GenreDetected;
}
