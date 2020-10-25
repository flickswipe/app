import request from "supertest";

import { ObjectId } from "mongodb";

import { natsWrapper } from "../../nats-wrapper";
import { app } from "../../app";

import { EmailTokenType } from "@flickswipe/common";
import { EmailToken } from "../../models/email-token";
import { User } from "../../models/user";
import { EmailTokenUrl } from "../../services/email-token-url";

describe("consume token", () => {
  it("returns a 400 with invalid user id", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: "invalid id",
        token: storedToken.token,
      })
      .expect(400);
  });

  it("returns a 400 with incorrect user id", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: new ObjectId().toString(),
        token: storedToken.token,
      })
      .expect(400);
  });

  it("returns a 400 with invalid token", async () => {
    await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: "invalid-token",
      })
      .expect(400);
  });

  it("returns a 400 with incorrect token", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });
    const storedToken = await EmailToken.findOne({ url });
    const incorrectToken = storedToken.token !== "AAAAAA" ? "AAAAAA" : "BBBBBB";

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: incorrectToken,
      })
      .expect(400);
  });

  it("returns a 400 if token has expired", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });
    const storedToken = await EmailToken.findOne({ url });

    // manually expire token
    const expiredToken = EmailToken.build({
      emailTokenType: storedToken.emailTokenType,
      user: storedToken.user,
      userAgent: storedToken.userAgent,
      token: storedToken.token,
      url: storedToken.url,
      payload: storedToken.payload,
      expiresAt: new Date(new Date().getTime() - 1000),
    });
    await expiredToken.save();
    await storedToken.remove();

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(400);
  });

  it("returns a 400 if user agents don't match", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "incorrect-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });
    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(400);
  });

  it("returns a 200", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });
    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);
  });

  it("removes token from database", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      "test@user.com",
      "test-user-agent"
    );

    const user = await User.findOne({ email: "test@user.com" });
    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);

    expect(await EmailToken.findOne({ url })).toBeNull();
  });
});

describe("add email", () => {
  it("returns a 400 if user already has email", async () => {
    const user = await global.createUser("existing@email.com");
    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      user.id,
      "test-user-agent",
      {
        email: "new@email.com",
      }
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(400);
  });

  it("returns 200", async () => {
    const user = await global.createUser("");
    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      user.id,
      "test-user-agent",
      {
        email: "new@email.com",
      }
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);
  });

  it("adds email", async () => {
    const user = await global.createUser("");
    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      user.id,
      "test-user-agent",
      {
        email: "new@email.com",
      }
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);

    // adds email to user
    expect(await User.findOne({ _id: user.id })).toEqual(
      expect.objectContaining({ email: "new@email.com" })
    );
  });

  it("deletes token", async () => {
    const user = await global.createUser("");
    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      user.id,
      "test-user-agent",
      {
        email: "new@email.com",
      }
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);

    expect(await EmailToken.findOne({ url })).toBeNull();
  });

  it("publishes event", async () => {
    const user = await global.createUser("");
    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      user.id,
      "test-user-agent",
      {
        email: "new@email.com",
      }
    );

    const storedToken = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", "test-user-agent")
      .send({
        userId: user.id,
        token: storedToken.token,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
