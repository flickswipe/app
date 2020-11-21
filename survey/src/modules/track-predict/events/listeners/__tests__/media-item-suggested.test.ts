import { Message } from "node-nats-streaming";
import { Suggestion } from "../../../models/suggestion";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemSuggestedListener } from "../media-item-suggested";

const setup = async () => {
  return {
    listener: new MediaItemSuggestedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item suggested listener", () => {
  describe("create if not exists", () => {
    it("should not overwrite a more recent doc", async () => {
      const existingDoc = await Suggestion.build({
        user: "useruseruser",
        mediaItem: "itemitemitem",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          user: "useruseruser",
          mediaItem: "itemitemitem",
        },
        msg
      );

      // has not been overwritten
      expect(
        await Suggestion.findOne({
          _id: existingDoc._id,
        })
      ).toEqual(
        expect.objectContaining({
          updatedAt: existingDoc.updatedAt,
        })
      );
    });

    it("should acknowledge the message", async () => {
      await Suggestion.build({
        user: "useruseruser",
        mediaItem: "itemitemitem",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          user: "useruseruser",
          mediaItem: "itemitemitem",
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("create new doc", () => {
    it("should create a new doc", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          user: "useruseruser",
          mediaItem: "itemitemitem",
        },
        msg
      );

      // has been created
      expect(
        await Suggestion.findOne({
          user: "useruseruser",
          mediaItem: "itemitemitem",
        })
      ).toBeDefined();
    });
  });

  it("should acknowledge the message", async () => {
    const { listener, msg } = await setup();

    await listener.onMessage(
      {
        user: "useruseruser",
        mediaItem: "itemitemitem",
      },
      msg
    );

    // has been acked
    expect(msg.ack).toHaveBeenCalled();
  });
});
