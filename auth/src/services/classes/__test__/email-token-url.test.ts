import {
  EmailTokenType,
  BadRequestError,
  TooManyRequestsError,
} from "@flickswipe/common";
import mongoose from "mongoose";

import { EmailToken } from "../../../models/email-token";
import { User, UserDoc } from "../../../models/user";
import { EmailTokenUrl } from "../email-token-url";

// sample data
import { USER_A } from "../../../test/sample-data/users";

describe("EmailTokenUrl", () => {
  describe("generate from email", () => {
    describe("sign in token", () => {
      describe("user doesn't exist", () => {
        it("creates token", async () => {
          const url = await EmailTokenUrl.generateFromEmail(
            EmailTokenType.SignIn,
            USER_A.email
          );

          // has created
          expect(await EmailToken.findOne({ url })).toEqual(
            expect.objectContaining({
              emailTokenType: EmailTokenType.SignIn,
              url: url,
            })
          );

          // no extra inserts
          expect(await EmailToken.countDocuments()).toEqual(1);
        });

        it("creates user", async () => {
          await EmailTokenUrl.generateFromEmail(
            EmailTokenType.SignIn,
            USER_A.email
          );

          // has created
          expect(await User.countDocuments({ email: USER_A.email })).toEqual(1);

          // no extra inserts
          expect(await User.countDocuments()).toEqual(1);
        });

        it("throttles token generation", async () => {
          // throws error
          await expect(
            (async () => {
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
            })()
          ).rejects.toThrow(TooManyRequestsError);
        });
      });

      describe("user exists", () => {
        let user: UserDoc;
        beforeEach(async () => {
          user = await User.build(USER_A).save();
        });

        it("creates token", async () => {
          const url = await EmailTokenUrl.generateFromEmail(
            EmailTokenType.SignIn,
            USER_A.email
          );

          // has created
          expect(await EmailToken.findOne({ url })).toEqual(
            expect.objectContaining({
              user: mongoose.Types.ObjectId(user.id),
              emailTokenType: EmailTokenType.SignIn,
              url: url,
            })
          );

          // no extra inserts
          expect(await EmailToken.countDocuments()).toEqual(1);
        });

        it("throttles token generation", async () => {
          // throws error
          await expect(
            (async () => {
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
              await EmailTokenUrl.generateFromEmail(
                EmailTokenType.SignIn,
                USER_A.email
              );
            })()
          ).rejects.toThrow(TooManyRequestsError);
        });
      });
    });
  });

  describe("generate from user id", () => {
    describe("sign in token", () => {
      describe("user doesn't exist", () => {
        it("throws bad request error", async () => {
          // throws error
          await expect(
            (async () => {
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                mongoose.Types.ObjectId().toHexString()
              );
            })()
          ).rejects.toThrow(BadRequestError);
        });
      });

      describe("user exists", () => {
        let user: UserDoc;
        beforeEach(async () => {
          user = await User.build(USER_A).save();
        });

        it("creates token", async () => {
          const url = await EmailTokenUrl.generateFromUserId(
            EmailTokenType.SignIn,
            user.id
          );

          // has created
          expect(await EmailToken.findOne({ url })).toEqual(
            expect.objectContaining({
              user: mongoose.Types.ObjectId(user.id),
              emailTokenType: EmailTokenType.SignIn,
              url: url,
            })
          );

          // no extra inserts
          expect(await EmailToken.countDocuments()).toEqual(1);
        });

        it("throttles token generation", async () => {
          // throw error
          await expect(
            (async () => {
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
            })()
          ).rejects.toThrow(TooManyRequestsError);
        });
      });
    });

    describe("add email token", () => {
      describe("user doesn't exist", () => {
        it("throws BadRequestError", async () => {
          // throws error
          await expect(() =>
            EmailTokenUrl.generateFromUserId(
              EmailTokenType.AddEmail,
              mongoose.Types.ObjectId().toHexString(),
              "test-user-agent",
              {
                email: USER_A.email,
              }
            )
          ).rejects.toThrow(BadRequestError);
        });
      });

      describe("user exists", () => {
        let user: UserDoc;
        beforeEach(async () => {
          user = await User.build(USER_A).save();
        });

        it("creates token", async () => {
          const url = await EmailTokenUrl.generateFromUserId(
            EmailTokenType.AddEmail,
            user.id,
            "test-user-agent",
            {
              email: user.email,
            }
          );

          // has created
          expect(await EmailToken.findOne({ url })).toEqual(
            expect.objectContaining({
              user: mongoose.Types.ObjectId(user.id),
              emailTokenType: EmailTokenType.AddEmail,
              url: url,
              userAgent: "test-user-agent",
              payload: { email: user.email },
            })
          );

          // no extra inserts
          expect(await EmailToken.countDocuments()).toEqual(1);
        });

        it("throttles token generation", async () => {
          // throws error
          await expect(
            (async () => {
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
              await EmailTokenUrl.generateFromUserId(
                EmailTokenType.SignIn,
                user.id
              );
            })()
          ).rejects.toThrow(TooManyRequestsError);
        });
      });
    });
  });
});
