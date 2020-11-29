import { RelationshipType } from "@flickswipe/common";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { listAllRelationships } from "../list-all-relationships";

// sample data
import {
  USER_A,
  USER_B,
  USER_C,
  USER_D,
} from "../../../../test/sample-data/users";

describe("list all relationships", () => {
  describe("user has no active relationships", () => {
    it("should return property 'active' with empty array", async () => {
      // has correct data
      expect(await listAllRelationships(USER_A.id)).toEqual(
        expect.objectContaining({
          active: [],
        })
      );
    });
  });

  describe("user has active relationships", () => {
    beforeEach(async () => {
      await Promise.all([
        Relationship.build({
          relationshipType: RelationshipType.Active,
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save(),

        Relationship.build({
          relationshipType: RelationshipType.Active,
          sourceUser: USER_A.id,
          targetUser: USER_C.id,
        }).save(),

        Relationship.build({
          relationshipType: RelationshipType.Active,
          sourceUser: USER_A.id,
          targetUser: USER_D.id,
        }).save(),
      ]);
    });
    it("should return property 'active' with array of user ids", async () => {
      const result = await listAllRelationships(USER_A.id);

      // has correct data
      expect(result.active).toContain(USER_B.id);
      expect(result.active).toContain(USER_C.id);
      expect(result.active).toContain(USER_D.id);
    });
  });

  describe("user has no blocked relationships", () => {
    it("should return property 'blocked' with empty array", async () => {
      // has correct data
      expect(await listAllRelationships(USER_A.id)).toEqual(
        expect.objectContaining({
          blocked: [],
        })
      );
    });
  });

  describe("user has blocked relationships", () => {
    beforeEach(async () => {
      await Promise.all([
        Relationship.build({
          relationshipType: RelationshipType.Blocked,
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save(),

        Relationship.build({
          relationshipType: RelationshipType.Blocked,
          sourceUser: USER_A.id,
          targetUser: USER_C.id,
        }).save(),

        Relationship.build({
          relationshipType: RelationshipType.Blocked,
          sourceUser: USER_A.id,
          targetUser: USER_D.id,
        }).save(),
      ]);
    });
    it("should return property 'blocked' with array of user ids", async () => {
      const result = await listAllRelationships(USER_A.id);

      // has correct data
      expect(result.blocked).toContain(USER_B.id);
      expect(result.blocked).toContain(USER_C.id);
      expect(result.blocked).toContain(USER_D.id);
    });
  });

  describe("user has no pending relationships", () => {
    it("should return property 'pending' with empty array", async () => {
      // has correct data
      expect(await listAllRelationships(USER_A.id)).toEqual(
        expect.objectContaining({
          pending: [],
        })
      );
    });
  });

  describe("user has pending relationships", () => {
    beforeEach(async () => {
      await Promise.all([
        RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_B.id,
        }).save(),

        RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_C.id,
        }).save(),

        RelationshipRequest.build({
          sourceUser: USER_A.id,
          targetUser: USER_D.id,
        }).save(),
      ]);
    });
    it("should return property 'pending' with array of user ids", async () => {
      const result = await listAllRelationships(USER_A.id);

      // has correct data
      expect(result.pending).toContain(USER_B.id);
      expect(result.pending).toContain(USER_C.id);
      expect(result.pending).toContain(USER_D.id);
    });
  });
});
