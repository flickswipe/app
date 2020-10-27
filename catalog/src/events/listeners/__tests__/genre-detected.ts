import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { GenreDetectedListener } from "../genre-detected";

const setup = async () => {
  return {
    listener: new GenreDetectedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("genre detected listener", () => {
  it.todo("should ignore genres that are malformed");

  it.todo("should ignore genres that aren't in english");

  it.todo("should create a genre if one doesn't exist");

  it.todo("should update an existing genre");
});
