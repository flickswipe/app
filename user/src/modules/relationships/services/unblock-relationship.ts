import { RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipUnblockedPublisher } from "../events/publishers/relationship-unblocked";
import { Relationship } from "../models/relationship";

export async function unblockRelationship(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  // Delete current relationship
  try {
    await Relationship.deleteOne({
      relationshipType: RelationshipType.Blocked,
      sourceUser: fromUserId,
      targetUser: toUserId,
    });

    // remove opposite relationship if not "blocked"
    await Relationship.deleteOne({
      relationshipType: { $ne: RelationshipType.Blocked },
      sourceUser: toUserId,
      targetUser: fromUserId,
    });
  } catch (err) {
    console.log(`Couldn't unblock relationship`, err);
    return false;
  }

  // publish event
  new RelationshipUnblockedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
  });

  return true;
}
