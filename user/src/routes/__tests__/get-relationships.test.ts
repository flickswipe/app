import request from 'supertest';

import { app } from '../../app';
import { getRelationships } from '../../modules/relationships/relationships';
import { USER_A } from '../../test/sample-data/users';

// mocks
jest.mock("../../modules/relationships/relationships");

describe("get relationships", () => {
  describe("invalid conditions", () => {
    describe("user not signed in", () => {
      it("returns a 400", async () => {
        // has correct status
        await request(app).get("/api/en/user/relationships").send().expect(401);
      });
    });
  });

  describe("valid conditions", () => {
    it("returns a 200", async () => {
      // has correct status
      await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("calls getRelationships", async () => {
      await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has been called
      expect(getRelationships).toHaveBeenCalled();
    });

    it("returns value of getRelationships", async () => {
      const response = await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn(USER_A.id))
        .send();

      // has correct data
      expect(response.body).toEqual(await getRelationships(USER_A.id));
    });
  });
});
