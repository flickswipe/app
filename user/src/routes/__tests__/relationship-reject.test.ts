import request from "supertest";
import { app } from "../../app";
import { rejectRelationship } from "../../modules/relationships/relationships";
import { User, UserDoc } from "../../modules/track-auth/models/user";

jest.mock("../../modules/relationships/relationships");

describe("reject relationship", () => {
  describe("invalid target user", () => {
    it("returns a 400", async () => {
      await request(app)
        .post("/api/en/user/relationships/invalid-id/reject")
        .set("Cookie", await global.signIn())
        .send()
        .expect(400);
    });
  });

  describe("non-existant target user", () => {
    it("returns a 404", async () => {
      await request(app)
        .post("/api/en/user/relationships/targettarget/reject")
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
        .post(`/api/en/user/relationships/${targetUserDoc.id}/reject`)
        .send()
        .expect(401);
    });

    it("should return a 200", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${targetUserDoc.id}/reject`)
        .set(
          "Cookie",
          await global.signIn(sourceUserDoc.id, sourceUserDoc.email)
        )
        .send()
        .expect(200);
    });

    it("should call rejectRelationship correctly", async () => {
      await request(app)
        .post(`/api/en/user/relationships/${targetUserDoc.id}/reject`)
        .set(
          "Cookie",
          await global.signIn(sourceUserDoc.id, sourceUserDoc.email)
        )
        .send();

      expect(rejectRelationship).toHaveBeenCalledWith(
        sourceUserDoc.id,
        targetUserDoc.id
      );
    });
  });
});
