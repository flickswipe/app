import ISO6391 from 'iso-639-1';

export function unifyISO6391(languageString: string): string | null {
  if (ISO6391.validate(languageString)) {
    return languageString;
  }

  const fromName = ISO6391.getCode(languageString);
  if (fromName) {
    return fromName;
  }

  const [, fromRegex] = languageString.match(/([a-z]{2})-[A-Z]{2}/) || [];
  if (fromRegex) {
    return fromRegex;
  }

  return null;
}
