import { getSettings } from "../../track-user-settings/track-user-settings";

export async function createSuggestions(
  user: string,
  clearExistingSuggestions = false
): Promise<string[]> {
  // get user settings
  const settings = (await getSettings(user)).map((doc) => ({
    settingType: doc.settingType,
    value: doc.value,
  }));

  console.log("Got settings", settings);

  // get media items that match settings

  // pick most appropriate media items

  // create new suggestions
  console.log(`created suggestions for #${user}`);

  if (clearExistingSuggestions) {
    // delete old suggestions
    console.log("cleared previous suggestions");
  }

  // update queue length

  return [];
}
