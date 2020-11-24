import { User } from "../../models/user";
import { getUserWithSmallestQueue } from "../get-user-with-smallest-queue";

describe("get user with smallest queue", () => {
  const userIds: string[] = ["aaabbbcccddd", "bbbcccdddeee", "cccdddeeefff"];

  beforeEach(async () => {
    for (const userId of userIds) {
      await User.build({
        id: userId,
        queueLength: userIds.indexOf(userId),
      }).save();
    }
  });

  it("should return user with lowest queue length", async () => {
    const user = await getUserWithSmallestQueue(50);

    expect(user.id).toBe(userIds[0]);
  });
});
