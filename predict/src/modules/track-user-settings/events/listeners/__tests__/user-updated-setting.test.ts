import {
  Listener,
  SettingType,
  UserUpdatedSettingEvent,
} from "@flickswipe/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../../generate-suggestions/models/user";
import { Setting } from "../../../models/setting";
import { UserUpdatedSettingListener } from "../user-updated-setting";

const setup = async () => {
  return {
    listener: new UserUpdatedSettingListener(natsWrapper.client),

    // @ts-ignore
    msg: {
      ack: jest.fn(),
    } as Message,
  };
};

describe("user updated setting listener", () => {
  let listener: Listener<UserUpdatedSettingEvent>;
  let msg: Message;

  beforeEach(async () => {
    const setupValues = await setup();
    listener = setupValues.listener;
    msg = setupValues.msg;
  });

  describe("existing doc", () => {
    beforeEach(async () => {
      await User.build({
        id: "aaabbbcccddd",
      }).save();

      await Setting.build({
        settingType: SettingType.Country,
        user: "aaabbbcccddd",
        value: "us",
      }).save();
    });

    it("should ignore old data", async () => {
      await listener.onMessage(
        {
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
          value: "uk",
          updatedAt: new Date(new Date().getTime() - 86600),
        },
        msg
      );

      expect(
        await Setting.findOne({
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
        })
      ).toEqual(
        expect.objectContaining({
          value: "us",
        })
      );
    });
    it("should overwrite doc", async () => {
      await listener.onMessage(
        {
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
          value: "uk",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(
        await Setting.findOne({
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
        })
      ).toEqual(
        expect.objectContaining({
          value: "uk",
        })
      );
    });
    it("should acknowledge the message", async () => {
      await listener.onMessage(
        {
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
          value: "uk",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });

  describe("create new doc", () => {
    beforeEach(async () => {
      await User.build({
        id: "aaabbbcccddd",
      }).save();
    });

    it("should create a new doc", async () => {
      await listener.onMessage(
        {
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
          value: "uk",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(
        await Setting.findOne({
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
        })
      ).toEqual(
        expect.objectContaining({
          value: "uk",
        })
      );
    });
    it("should acknowledge the message", async () => {
      await listener.onMessage(
        {
          settingType: SettingType.Country,
          user: "aaabbbcccddd",
          value: "uk",
          updatedAt: new Date(new Date().getTime() + 86600),
        },
        msg
      );

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
