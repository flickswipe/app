import {
  EmailTokenType,
  BadRequestError,
  TooManyRequestsError,
} from "@flickswipe/common";
import { ObjectId } from "mongodb";

import { EmailToken } from "../../models/email-token";
import { EmailTokenUrl } from "../../services/email-token-url";

/**
 * Tests
 */
describe("EmailTokenUrl", () => {
  describe("generate from email", () => {
    describe("sign in token", () => {
      it("creates a token and saves for a new email address", async () => {
        const url = await EmailTokenUrl.generateFromEmail(
          EmailTokenType.SignIn,
          "test@user.com"
        );
        const emailToken = await EmailToken.findOne({ url });

        expect(emailToken).toMatchObject({
          emailTokenType: EmailTokenType.SignIn,
          url: url,
        });
      });

      it("creates a token and saves for an existing email address", async () => {
        const user = await global.createUser("test@user.com");
        const url = await EmailTokenUrl.generateFromEmail(
          EmailTokenType.SignIn,
          "test@user.com"
        );
        const emailToken = await EmailToken.findOne({ url });

        expect(emailToken).toMatchObject({
          user: user.id,
          emailTokenType: EmailTokenType.SignIn,
          url: url,
        });
      });

      it("throttles token generation", async () => {
        const generateToken = () =>
          EmailTokenUrl.generateFromEmail(
            EmailTokenType.SignIn,
            "test@user.com"
          );

        await expect(
          (async () => {
            await generateToken();
            await generateToken();
            await generateToken();
            await generateToken();
          })()
        ).rejects.toThrow(TooManyRequestsError);
      });
    });
  });

  describe("generate from user id", () => {
    describe("sign in token", () => {
      it("creates a token and saves for a new email address", async () => {
        const user = await global.createUser("test@user");
        const url = await EmailTokenUrl.generateFromUserId(
          EmailTokenType.SignIn,
          user.id
        );
        const emailToken = await EmailToken.findOne({ url });

        expect(emailToken).toMatchObject({
          emailTokenType: EmailTokenType.SignIn,
          url: url,
        });
      });

      it("creates a token and saves for an existing email address", async () => {
        const user = await global.createUser("test@user.com");
        const url = await EmailTokenUrl.generateFromUserId(
          EmailTokenType.SignIn,
          user.id
        );
        const emailToken = await EmailToken.findOne({ url });

        expect(emailToken).toMatchObject({
          user: user.id,
          emailTokenType: EmailTokenType.SignIn,
          url: url,
        });
      });

      it("throttles token generation", async () => {
        const user = await global.createUser("test@user");
        const generateToken = () =>
          EmailTokenUrl.generateFromUserId(EmailTokenType.SignIn, user.id);

        await expect(
          (async () => {
            await generateToken();
            await generateToken();
            await generateToken();
            await generateToken();
          })()
        ).rejects.toThrow(TooManyRequestsError);
      });
    });

    describe("add email token", () => {
      it("throws BadRequestError if user not found", async () => {
        await expect(() =>
          EmailTokenUrl.generateFromUserId(
            EmailTokenType.AddEmail,
            new ObjectId().toString(),
            "test-user-agent",
            {
              email: "new@email.com",
            }
          )
        ).rejects.toThrow(BadRequestError);
      });

      it("creates a token and saves for an existing email address", async () => {
        const user = await global.createUser("");
        const url = await EmailTokenUrl.generateFromUserId(
          EmailTokenType.AddEmail,
          user.id,
          "test-user-agent",
          {
            email: "new@email.com",
          }
        );
        const emailToken = await EmailToken.findOne({ url });

        expect(emailToken).toMatchObject({
          user: user.id,
          emailTokenType: EmailTokenType.AddEmail,
          url: url,
          userAgent: "test-user-agent",
          payload: { email: "new@email.com" },
        });
      });

      it("throttles token generation", async () => {
        const user = await global.createUser("");

        const generateToken = () =>
          EmailTokenUrl.generateFromUserId(
            EmailTokenType.AddEmail,
            user.id,
            "test-user-agent",
            {
              email: "new@email.com",
            }
          );

        await expect(
          (async () => {
            await generateToken();
            await generateToken();
            await generateToken();
            await generateToken();
          })()
        ).rejects.toThrow(TooManyRequestsError);
      });
    });
  });
});
