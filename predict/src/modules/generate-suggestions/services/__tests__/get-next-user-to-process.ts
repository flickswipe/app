// sample data
import { USER_A, USER_B, USER_C } from '../../../../test/sample-data/users';
import { User } from '../../models/user';
import { getNextUserToProcess } from '../get-next-user-to-process';

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
    const user = await getNextUserToProcess();

    // has user with smallest queue
    expect(user.id).toBe(userIds[0]);
  });
});
