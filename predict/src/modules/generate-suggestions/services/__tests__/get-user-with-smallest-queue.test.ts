import { User } from "../../models/user";
import { getUserWithSmallestQueue } from "../get-user-with-smallest-queue";

// sample data
import { USER_A, USER_B, USER_C } from "../../../../test/sample-data/users";

describe("get user with smallest queue", () => {
  const userIds: string[] = [USER_A.id, USER_B.id, USER_C.id];

  beforeEach(async () => {
    for (const userId of userIds) {
      await User.build({
        id: userId,
        queueLength: userIds.indexOf(userId),
      }).save();
    }
  });

  it("should return user with smallest queue", async () => {
    const user = await getUserWithSmallestQueue(50);

    // has user with smallest queue
    expect(user.id).toBe(userIds[0]);
  });
});
