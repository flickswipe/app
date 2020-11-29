import { Message } from "node-nats-streaming";
import { SurveyResponse } from "../../../models/survey-response";
import { natsWrapper } from "../../../../../nats-wrapper";
import { MediaItemRatedListener } from "../media-item-rated";
import { InterestType } from "@flickswipe/common";
import { Suggestion } from "../../../../generate-suggestions/models/suggestion";
import { User } from "../../../../generate-suggestions/models/user";

// sample data
import { USER_A } from "../../../../../test/sample-data/users";
import { MEDIA_ITEM_A } from "../../../../../test/sample-data/media-items";
const EVENT_DATA = {
  id: MEDIA_ITEM_A.id,
  user: USER_A.id,
  interestType: InterestType.Consumed,
  rating: 5,
  updatedAt: new Date(new Date().getTime() - 86600),
};

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
  beforeEach(async () => {
    await Promise.all([
      User.build({
        id: USER_A.id,
      }).save(),
      Suggestion.build({
        user: USER_A.id,
        mediaItem: MEDIA_ITEM_A.id,
      }).save(),
    ]);
  });

  describe("data exists", () => {
    beforeEach(async () => {
      await SurveyResponse.build({
        user: USER_A.id,
        mediaItem: MEDIA_ITEM_A.id,
      }).save();
    });

    it("should not add data twice", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // no new documents created
      expect(await SurveyResponse.countDocuments()).toBe(1);
    });

    it("should remove suggestion from queue", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been removed
      expect(await Suggestion.countDocuments()).toBe(0);
    });

    it("should acknowledge the message", async () => {
      await SurveyResponse.build({
        user: USER_A.id,
        mediaItem: MEDIA_ITEM_A.id,
      }).save();

      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("no data exists", () => {
    it("should create survey response", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(
        await SurveyResponse.countDocuments({
          user: USER_A.id,
          mediaItem: MEDIA_ITEM_A.id,
        })
      ).toBe(1);
    });

    it("should remove suggestion from queue", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been removed
      expect(await Suggestion.countDocuments()).toBe(0);
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
