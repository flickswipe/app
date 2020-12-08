import { User, UserDoc } from '../models/user';

export async function getUser(id: string): Promise<UserDoc | null> {
  return await User.findById(id);
}
