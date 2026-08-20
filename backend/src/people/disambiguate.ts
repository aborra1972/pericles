/**
 * Disambiguates a name when there are duplicates.
 * Returns "Name (N)" where N is the position among duplicates.
 */
export function disambiguateName(
  name: string,
  allNames: string[],
  index?: number,
): string {
  const trimmed = name.trim();
  const duplicates = allNames.filter((n) => n.trim() === trimmed);

  if (duplicates.length <= 1) {
    return trimmed;
  }

  const position = index !== undefined
    ? allNames.slice(0, index + 1).filter((n) => n.trim() === trimmed).length
    : duplicates.length;

  return `${trimmed} (${position})`;
}
