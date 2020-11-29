import { Subjects, Publisher, GenreUpdatedEvent } from "@flickswipe/common";

export class GenreUpdatedPublisher extends Publisher<GenreUpdatedEvent> {
  subject: Subjects.GenreUpdated = Subjects.GenreUpdated;
}
