import { Message } from "node-nats-streaming";
import { Genre } from "../../../models/genre";
import { natsWrapper } from "../../../../../nats-wrapper";
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
  describe("ignore old data", () => {
    it("should not overwrite a more recent doc", async () => {
      await Genre.build({
        id: "ab1234567890ab1234567890",
        name: "My Genre",
        language: "en-US",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          name: "My New Genre",
          language: "en-US",
          detectedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      // has not been overwritten
      expect(
        await Genre.findOne({
          _id: "ab1234567890ab1234567890",
          language: "en-US",
        })
      ).toEqual(
        expect.objectContaining({
          name: "My Genre",
        })
      );
    });

    it("should acknowledge the message", async () => {
      await Genre.build({
        id: "ab1234567890ab1234567890",
        name: "My Genre",
        language: "en-US",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          name: "My New Genre",
          language: "en-US",
          detectedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("update existing doc", () => {
    it("should overwrite existing doc", async () => {
      await Genre.build({
        id: "ab1234567890ab1234567890",
        name: "My Genre",
        language: "en-US",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          name: "My New Genre",
          language: "en-US",
          detectedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      // has been overwritten
      expect(
        await Genre.findOne({
          _id: "ab1234567890ab1234567890",
          language: "en-US",
        })
      ).toEqual(
        expect.objectContaining({
          name: "My New Genre",
        })
      );
    });

    it("should acknowledge the message", async () => {
      await Genre.build({
        id: "ab1234567890ab1234567890",
        name: "My Genre",
        language: "en-US",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          name: "My New Genre",
          language: "en-US",
          detectedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });

    describe("create new doc", () => {
      it("should create a new doc", async () => {
        const { listener, msg } = await setup();

        await listener.onMessage(
          {
            id: "ab1234567890ab1234567890",
            name: "My Genre",
            language: "en-US",
            detectedAt: new Date(),
          },
          msg
        );

        // has not been overwritten
        expect(
          await Genre.findOne({
            _id: "ab1234567890ab1234567890",
            language: "en-US",
          })
        ).toEqual(
          expect.objectContaining({
            name: "My Genre",
          })
        );
      });
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          name: "My Genre",
          language: "en-US",
          detectedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
