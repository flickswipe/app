import { RelationshipType } from "@flickswipe/common";
import { Relationship, RelationshipDoc } from "../models/relationship";
import {
  RelationshipRequest,
  RelationshipRequestDoc,
} from "../models/relationship-request";

export async function listAllRelationships(
  userId: string
): Promise<{
  active: string[];
  blocked: string[];
  pending: string[];
}> {
  // get all active relationships
  const activeRelationships = await Relationship.find({
    relationshipType: RelationshipType.Active,
    sourceUser: userId,
  });

  // get all blocked relationships
  const blockedRelationships = await Relationship.find({
    relationshipType: RelationshipType.Blocked,
    sourceUser: userId,
  });

  // get all pending
  const pendingRelationships = await RelationshipRequest.find({
    sourceUser: userId,
    complete: false,
  }).sort({ createdAt: -1 });

  // map query results to a list of target users
  const listOfTargetUsers = (
    docList: RelationshipDoc[] | RelationshipRequestDoc[]
  ) =>
    (docList as { targetUser: string }[])
      .map(({ targetUser }) => `${targetUser}`)
      .filter((user) => user);

  return {
    active: listOfTargetUsers(activeRelationships),
    blocked: listOfTargetUsers(blockedRelationships),
    pending: listOfTargetUsers(pendingRelationships),
  };
}
