// Flavour states are written verbatim (NO/MAYBE/YES); parsing accepts them
// case-insensitively, and unrecognized or missing states default to NO.
export const parseState = (label: string): string => {
  const normalized = label.trim().toUpperCase();

  if (normalized === "YES") {
    return "YES";
  } else if (normalized === "MAYBE") {
    return "MAYBE";
  } else {
    return "NO";
  }
};
