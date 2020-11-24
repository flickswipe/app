import { Setting, SettingDoc } from "../models/setting";

export async function getSettings(user: string): Promise<SettingDoc[] | null> {
  return await Setting.find({ user });
}
