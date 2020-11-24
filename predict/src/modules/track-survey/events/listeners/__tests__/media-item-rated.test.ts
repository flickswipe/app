import { Message } from "node-nats-streaming";
import { SurveyResponse } from "../../../models/survey-response";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemRatedListener } from "../media-item-rated";
import { InterestType } from "@flickswipe/common";

const setup = async () => {
  return {
    listener: new MediaItemRatedListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("media item rated listener", () => {
  describe("ignore old data", () => {
    it("should not add data twice", async () => {
      await SurveyResponse.build({
        user: "aaabbbcccddd",
        mediaItem: "ab1234567890ab1234567890",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          user: "aaabbbcccddd",
          interestType: InterestType.Interested,
          rating: null,
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      // no new documents created
      expect(await SurveyResponse.countDocuments()).toBe(1);
    });

    it("should acknowledge the message", async () => {
      await SurveyResponse.build({
        user: "aaabbbcccddd",
        mediaItem: "ab1234567890ab1234567890",
      }).save();

      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          user: "aaabbbcccddd",
          interestType: InterestType.Interested,
          rating: null,
          updatedAt: new Date(new Date().getTime() - 86600),
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
          id: "ab1234567890ab1234567890",
          user: "aaabbbcccddd",
          interestType: InterestType.Interested,
          rating: null,
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      // has been created
      expect(
        await SurveyResponse.countDocuments({
          user: "aaabbbcccddd",
          mediaItem: "ab1234567890ab1234567890",
        })
      ).toBe(1);
    });
    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();

      await listener.onMessage(
        {
          id: "ab1234567890ab1234567890",
          user: "aaabbbcccddd",
          interestType: InterestType.Interested,
          rating: null,
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
