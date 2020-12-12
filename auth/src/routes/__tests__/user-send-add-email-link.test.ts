import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/user';
// sample data
import { USER_A } from '../../test/sample-data/users';

describe("send email update link", () => {
  describe("invalid conditions", () => {
    describe("no current user", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app)
          .post("/api/en/auth/send-add-email-link")
          .send(USER_A)
          .expect(401);
      });
    });

    describe("no email supplied", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post("/api/en/auth/send-add-email-link")
          .set("Cookie", await global.signIn(USER_A.email))
          .send()
          .expect(400);
      });
    });

    describe("invalid email supplied", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post("/api/en/auth/send-add-email-link")
          .set("Cookie", await global.signIn(""))
          .send({
            email: "invalid-email",
          })
          .expect(400);
      });
    });

    describe("email already in use", () => {
      beforeEach(async () => {
        await User.build({
          email: "existing@email.com",
        }).save();
      });

      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post("/api/en/auth/send-add-email-link")
          .set("Cookie", await global.signIn(""))
          .send({
            email: "existing@email.com",
          })
          .expect(400);
      });
    });

    describe("user has email already", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post("/api/en/auth/send-add-email-link")
          .set("Cookie", await global.signIn(USER_A.email))
          .send({
            email: "new@email.com",
          })
          .expect(400);
      });
    });
  });

  describe("valid conditions", () => {
    it("returns a 202", async () => {
      // has correct status
      await request(app)
        .post("/api/en/auth/send-add-email-link")
        .set("Cookie", await global.signIn(""))
        .send({
          email: "new@email.com",
        })
        .expect(202);
    });
  });
});
