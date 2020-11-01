import { RelationshipType } from "@flickswipe/common";
import { Types } from "mongoose";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { listAllRelationships } from "../list-all-relationships";

describe("get relationships", () => {
  const targetIds = [
    Types.ObjectId("target111111").toHexString(),
    Types.ObjectId("target222222").toHexString(),
    Types.ObjectId("target333333").toHexString(),
  ];

  describe("user has no active relationships", () => {
    it("should return property 'active' with empty array", async () => {
      const result = await listAllRelationships("sourcesource");

      expect(result).toEqual(
        expect.objectContaining({
          active: [],
        })
      );
    });
  });

  describe("user has active relationships", () => {
    it("should return property 'active' with array of user ids", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: "sourcesource",
        targetUser: targetIds[0],
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: "sourcesource",
        targetUser: targetIds[1],
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: "sourcesource",
        targetUser: targetIds[2],
      }).save();

      const result = await listAllRelationships("sourcesource");

      expect(result.active).toContain(targetIds[0]);
      expect(result.active).toContain(targetIds[1]);
      expect(result.active).toContain(targetIds[2]);
    });
  });

  describe("user has no blocked relationships", () => {
    it("should return property 'blocked' with empty array", async () => {
      const result = await listAllRelationships("sourcesource");

      expect(result).toEqual(
        expect.objectContaining({
          blocked: [],
        })
      );
    });
  });

  describe("user has blocked relationships", () => {
    it("should return property 'blocked' with array of user ids", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: "sourcesource",
        targetUser: targetIds[0],
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: "sourcesource",
        targetUser: targetIds[1],
      }).save();

      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: "sourcesource",
        targetUser: targetIds[2],
      }).save();

      const result = await listAllRelationships("sourcesource");

      expect(result.blocked).toContain(targetIds[0]);
      expect(result.blocked).toContain(targetIds[1]);
      expect(result.blocked).toContain(targetIds[2]);
    });
  });

  describe("user has no pending relationships", () => {
    it("should return property 'pending' with empty array", async () => {
      const result = await listAllRelationships("sourcesource");

      expect(result).toEqual(
        expect.objectContaining({
          pending: [],
        })
      );
    });
  });

  describe("user has pending relationships", () => {
    it("should return property 'pending' with array of user ids", async () => {
      await RelationshipRequest.build({
        sourceUser: "sourcesource",
        targetUser: targetIds[0],
      }).save();

      await RelationshipRequest.build({
        sourceUser: "sourcesource",
        targetUser: targetIds[1],
      }).save();

      await RelationshipRequest.build({
        sourceUser: "sourcesource",
        targetUser: targetIds[2],
      }).save();

      const result = await listAllRelationships("sourcesource");

      expect(result.pending).toContain(targetIds[0]);
      expect(result.pending).toContain(targetIds[1]);
      expect(result.pending).toContain(targetIds[2]);
    });
  });
});
