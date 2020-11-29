import { CountrySetting, SettingType } from "@flickswipe/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../../../nats-wrapper";
import { User } from "../../../../generate-suggestions/models/user";
import { Setting } from "../../../models/setting";
import { UserUpdatedSettingListener } from "../user-updated-setting";

// sample data
import { USER_A } from "../../../../../test/sample-data/users";
const COUNTRY_A = "us";
const COUNTRY_B = "uk";
const EVENT_DATA = {
  settingType: SettingType.Country,
  user: USER_A.id,
  value: COUNTRY_B,
  updatedAt: new Date(new Date().getTime() + 86600),
} as CountrySetting;
const STALE_EVENT_DATA = Object.assign({}, EVENT_DATA, {
  updatedAt: new Date(new Date().getTime() - 86600),
}) as CountrySetting;

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
  describe("setting exists", () => {
    beforeEach(async () => {
      await Promise.all([
        User.build({
          id: USER_A.id,
        }).save(),
        Setting.build({
          settingType: SettingType.Country,
          user: USER_A.id,
          value: COUNTRY_A,
        }).save(),
      ]);
    });

    describe("data received out of order", () => {
      it("should not update", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(STALE_EVENT_DATA, msg);

        // has not been updated
        expect(
          await Setting.findOne({
            settingType: SettingType.Country,
            user: USER_A.id,
          })
        ).toEqual(
          expect.objectContaining({
            value: COUNTRY_A,
          })
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(STALE_EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });

    describe("data received in order", () => {
      it("should overwrite doc", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been updated
        expect(
          await Setting.findOne({
            settingType: SettingType.Country,
            user: USER_A.id,
          })
        ).toEqual(
          expect.objectContaining({
            value: COUNTRY_B,
          })
        );
      });

      it("should acknowledge the message", async () => {
        const { listener, msg } = await setup();
        await listener.onMessage(EVENT_DATA, msg);

        // has been acked
        expect(msg.ack).toHaveBeenCalled();
      });
    });
  });

  describe("no setting exists", () => {
    beforeEach(async () => {
      await User.build({
        id: USER_A.id,
      }).save();
    });

    it("should create setting", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been created
      expect(
        await Setting.countDocuments({
          settingType: SettingType.Country,
          user: USER_A.id,
        })
      ).toBe(1);
    });

    it("should acknowledge the message", async () => {
      const { listener, msg } = await setup();
      await listener.onMessage(EVENT_DATA, msg);

      // has been acked
      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
