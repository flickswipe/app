import {
  BadRequestError,
  NotAuthorizedError,
  RelationshipType,
  TooManyRequestsError,
} from "@flickswipe/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../../../nats-wrapper";
import { Relationship } from "../../models/relationship";
import { RelationshipRequest } from "../../models/relationship-request";
import { requestRelationship } from "../request-relationship";

describe("request relationship", () => {
  const A = Types.ObjectId("aaaaaaaaaaaa").toHexString();
  const B = Types.ObjectId("bbbbbbbbbbbb").toHexString();

  describe("active relationship exists", () => {
    it("should throw bad request error", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Active,
        sourceUser: A,
        targetUser: B,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(BadRequestError);
    });
  });

  describe("requester has blocked receiver", () => {
    it("should throw not authorized error", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: A,
        targetUser: B,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(NotAuthorizedError);
    });
  });

  describe("receiver has blocked requester", () => {
    it("should throw not authorized error", async () => {
      await Relationship.build({
        relationshipType: RelationshipType.Blocked,
        sourceUser: B,
        targetUser: A,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(NotAuthorizedError);
    });
  });

  describe("incomplete request already exists", () => {
    it("should throw bad request error", async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(BadRequestError);
    });
  });

  describe("last completed request too recent", () => {
    it("should throw too many requests error", async () => {
      await RelationshipRequest.build({
        sourceUser: A,
        targetUser: B,
        complete: true,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(TooManyRequestsError);
    });
  });

  describe("incomplete opposite request already exists", () => {
    it("should throw bad request error", async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
      }).save();

      await expect(
        async () => await requestRelationship(A, B)
      ).rejects.toThrowError(BadRequestError);
    });
  });

  describe("last completed opposite request too recent", () => {
    beforeEach(async () => {
      await RelationshipRequest.build({
        sourceUser: B,
        targetUser: A,
        complete: true,
      }).save();
    });
    it("should create request document", async () => {
      await requestRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          complete: false,
        })
      );
    });
    it("should publish event", async () => {
      await requestRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });

  describe("can request relationship", () => {
    it("should create request document", async () => {
      await requestRelationship(A, B);

      expect(
        await RelationshipRequest.findOne({
          sourceUser: A,
          targetUser: B,
        })
      ).toEqual(
        expect.objectContaining({
          complete: false,
        })
      );
    });
    it("should publish event", async () => {
      await requestRelationship(A, B);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
  });
});
