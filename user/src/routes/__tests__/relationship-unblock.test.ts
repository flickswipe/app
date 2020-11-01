import request from "supertest";
import { app } from "../../app";
import { unblockRelationship } from "../../modules/relationships/relationships";
import { User, UserDoc } from "../../modules/track-auth/models/user";

jest.mock("../../modules/relationships/relationships");

describe("unblock user", () => {
  describe("invalid target user", () => {
    it("returns a 400", async () => {
      await request(app)
        .post("/api/en/user/relationships/invalid-id/unblock")
        .set("Cookie", await global.signIn())
        .send()
        .expect(400);
    });
  });

  describe("non-existant target user", () => {
    it("returns a 404", async () => {
      await request(app)
        .post("/api/en/user/relationships/targettarget/unblock")
        .set("Cookie", await global.signIn())
        .send()
        .expect(404);
    });
  });

  describe("target user exists", () => {
    let sourceUserDoc: UserDoc;
    let targetUserDoc: UserDoc;

    beforeEach(async () => {
      sourceUserDoc = await User.build({
        id: "sourcesource",
        email: "source@user.com",
      }).save();

      targetUserDoc = await User.build({
        id: "targettarget",
        email: "target@user.com",
      }).save();
    });

    it("returns a 401 if not signed in", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${targetUserDoc.id}/unblock`)
        .send()
        .expect(401);
    });

    it("should return a 200", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${targetUserDoc.id}/unblock`)
        .set(
          "Cookie",
          await global.signIn(sourceUserDoc.id, sourceUserDoc.email)
        )
        .send()
        .expect(200);
    });

    it("should call unblockRelationship correctly", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${targetUserDoc.id}/unblock`)
        .set(
          "Cookie",
          await global.signIn(sourceUserDoc.id, sourceUserDoc.email)
        )
        .send();

      expect(unblockRelationship).toHaveBeenCalledWith(
        sourceUserDoc.id,
        targetUserDoc.id
      );
    });
  });
});
