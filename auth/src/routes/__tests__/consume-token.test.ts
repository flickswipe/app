import request from "supertest";

import mongoose from "mongoose";

import { natsWrapper } from "../../nats-wrapper";
import { app } from "../../app";

import { EmailTokenType } from "@flickswipe/common";
import { EmailToken } from "../../models/email-token";
import { User } from "../../models/user";
import { EmailTokenUrl } from "../../services/email-token-url";

// sample data
import { USER_A } from "../../test/sample-data/users";
const USER_A_NO_EMAIL = {
  email: "",
};
const USER_AGENT_A = "user-agent-a";
const USER_AGENT_B = "user-agent-b";
const TOKEN_A = "AAAAAA";
const TOKEN_B = "BBBBBB";

describe("consume token", () => {
  it("returns a 400 with invalid user id", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: "invalid id",
        token: emailTokenDoc.token,
      })
      .expect(400);
  });

  it("returns a 400 with incorrect user id", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: new mongoose.Types.ObjectId().toHexString(),
        token: emailTokenDoc.token,
      })
      .expect(400);
  });

  it("returns a 400 with invalid token", async () => {
    await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const user = await User.findOne({ email: USER_A.email });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: "invalid-token",
      })
      .expect(400);
  });

  it("returns a 400 with incorrect token", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const user = await User.findOne({ email: USER_A.email });
    const emailTokenDoc = await EmailToken.findOne({ url });

    // ensure incorrect token
    const incorrectToken = emailTokenDoc.token !== TOKEN_A ? TOKEN_A : TOKEN_B;

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: incorrectToken,
      })
      .expect(400);
  });

  it("returns a 400 if token has expired", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const user = await User.findOne({ email: USER_A.email });
    const emailTokenDoc = await EmailToken.findOne({ url });

    // manually expire token
    emailTokenDoc.expiresAt = new Date(new Date().getTime() - 1000);
    await emailTokenDoc.save();

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: emailTokenDoc.token,
      })
      .expect(400);
  });

  it("returns a 400 if user agents don't match", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_B
    );

    const user = await User.findOne({ email: USER_A.email });
    const emailTokenDoc = await EmailToken.findOne({ url });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: emailTokenDoc.token,
      })
      .expect(400);
  });

  it("returns a 200", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const user = await User.findOne({ email: USER_A.email });
    const emailTokenDoc = await EmailToken.findOne({ url });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: emailTokenDoc.token,
      })
      .expect(200);
  });

  it("removes token from database", async () => {
    const url = await EmailTokenUrl.generateFromEmail(
      EmailTokenType.SignIn,
      USER_A.email,
      USER_AGENT_A
    );

    const user = await User.findOne({ email: USER_A.email });
    const emailTokenDoc = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: user.id,
        token: emailTokenDoc.token,
      });

    // has been removed
    expect(await EmailToken.countDocuments()).toBe(0);
  });
});

describe("add email", () => {
  it("returns a 400 if user has email", async () => {
    const userDoc = await User.build(USER_A).save();

    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      userDoc.id,
      USER_AGENT_A,
      {
        email: USER_A.email,
      }
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    // has correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: userDoc.id,
        token: emailTokenDoc.token,
      })
      .expect(400);
  });

  it("returns 200", async () => {
    const userDoc = await User.build(USER_A_NO_EMAIL).save();

    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      userDoc.id,
      USER_AGENT_A,
      {
        email: USER_A.email,
      }
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    // expect correct status
    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: userDoc.id,
        token: emailTokenDoc.token,
      })
      .expect(200);
  });

  it("adds email", async () => {
    const userDoc = await User.build(USER_A_NO_EMAIL).save();

    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      userDoc.id,
      USER_AGENT_A,
      {
        email: USER_A.email,
      }
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: userDoc.id,
        token: emailTokenDoc.token,
      });

    // has updated
    expect(await User.findById(userDoc.id)).toEqual(
      expect.objectContaining({ email: USER_A.email })
    );
  });

  it("deletes token", async () => {
    const userDoc = await User.build(USER_A_NO_EMAIL).save();

    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      userDoc.id,
      USER_AGENT_A,
      {
        email: USER_A.email,
      }
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: userDoc.id,
        token: emailTokenDoc.token,
      });

    // has been removed
    expect(await EmailToken.countDocuments()).toBe(0);
  });

  it("publishes event", async () => {
    const userDoc = await User.build(USER_A_NO_EMAIL).save();

    const url = await EmailTokenUrl.generateFromUserId(
      EmailTokenType.AddEmail,
      userDoc.id,
      USER_AGENT_A,
      {
        email: USER_A.email,
      }
    );

    const emailTokenDoc = await EmailToken.findOne({ url });

    await request(app)
      .post("/api/en/auth/consume-token")
      .set("User-Agent", USER_AGENT_A)
      .send({
        userId: userDoc.id,
        token: emailTokenDoc.token,
      });

    // has been published
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
