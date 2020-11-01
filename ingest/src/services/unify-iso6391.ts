import { iso6391 } from "@flickswipe/common";
import ISO6391 from "iso-639-1";

export function unifyISO6391(languageString: string): iso6391 {
  if (ISO6391.validate(languageString)) {
    return languageString as iso6391;
  }

  const fromName = ISO6391.getCode(languageString);
  if (fromName) {
    return fromName as iso6391;
  }

  const [, fromRegex] = languageString.match(/([a-z]{2})-[A-Z]{2}/) || [];
  if (fromRegex) {
    return fromRegex as iso6391;
  }

  return null;
}
