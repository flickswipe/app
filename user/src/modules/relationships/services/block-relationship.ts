import { RelationshipType } from "@flickswipe/common";
import { natsWrapper } from "../../../nats-wrapper";
import { RelationshipBlockedPublisher } from "../events/publishers/relationship-blocked";
import { Relationship } from "../models/relationship";

export async function blockRelationship(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  // get existing
  const existingDoc = await Relationship.findOne({
    sourceUser: fromUserId,
    targetUser: toUserId,
  });

  // update
  if (existingDoc) {
    existingDoc.relationshipType = RelationshipType.Blocked;
    try {
      await existingDoc.save();
    } catch (err) {
      console.log(`Couldn't block user`);
      return false;
    }
  }

  // create
  try {
    await Relationship.build({
      relationshipType: RelationshipType.Blocked,
      sourceUser: fromUserId,
      targetUser: toUserId,
    }).save();
  } catch (err) {
    console.log(`Couldn't block user`);
    return false;
  }

  // remove opposite relationship if not "blocked"
  try {
    await Relationship.deleteOne({
      relationshipType: { $ne: RelationshipType.Blocked },
      sourceUser: toUserId,
      targetUser: fromUserId,
    });
  } catch (err) {
    console.log(`Couldn't delete opposite relationship`, err);
  }

  // publish event
  new RelationshipBlockedPublisher(natsWrapper.client).publish({
    sourceUserId: fromUserId,
    targetUserId: toUserId,
  });

  return true;
}
