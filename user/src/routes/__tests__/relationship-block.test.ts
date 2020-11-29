import request from "supertest";
import { app } from "../../app";
import { blockRelationship } from "../../modules/relationships/relationships";
import { User } from "../../modules/track-auth/models/user";
import { USER_A, USER_B } from "../../test/sample-data/users";

// sample data
const INVALID_ID = "invalid-id";

// mocks
jest.mock("../../modules/relationships/relationships");

describe("block relationship", () => {
  describe("invalid conditions", () => {
    describe("invalid id", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/user/relationships/${INVALID_ID}/block`)
          .set("Cookie", await global.signIn(USER_A.id))
          .send()
          .expect(400);
      });
    });

    describe("not signed in", () => {
      it("returns a 401", async () => {
        // has correct status
        await request(app)
          .post(`/api/en/user/relationships/${USER_B.id}/block`)
          .send()
          .expect(401);
      });
    });

    describe("non-existant user", () => {
      // has correct status
      it("returns a 404", async () => {
        await request(app)
          .post(`/api/en/user/relationships/${USER_B.id}/block`)
          .set("Cookie", await global.signIn(USER_A.id))
          .send()
          .expect(404);
      });
    });
  });

  describe("valid conditions", () => {
    beforeEach(async () => {
      await Promise.all([User.build(USER_A).save(), User.build(USER_B).save()]);
    });

    it("should return a 200", async () => {
      // has correct status
      await request(app)
        .post(`/api/en/user/relationships/${USER_B.id}/block`)
        .set("Cookie", await global.signIn(USER_A.id, USER_A.email))
        .send()
        .expect(200);
    });

    it("should call blockRelationship correctly", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${USER_B.id}/block`)
        .set("Cookie", await global.signIn(USER_A.id, USER_A.email))
        .send();

      // has been called
      expect(blockRelationship).toHaveBeenCalledWith(USER_A.id, USER_B.id);
    });
  });
});
