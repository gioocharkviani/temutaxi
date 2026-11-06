import type { NameDisplay } from "@/db/entities";

/**
 * Yandex sends a full name with the surname first: "Smith, John Richard" in its docs,
 * and without the comma in some parks. The public site shows only as much as the admin chose.
 */
export function displayName(fullName: string, mode: NameDisplay) {
  const clean = fullName.trim().replace(/\s+/g, " ");
  if (mode === "full" || !clean) return clean;

  const [before, after] = clean.split(",").map((part) => part.trim());
  const words = after ? [before.split(" ")[0], ...after.split(" ")] : clean.split(" ");
  const [surname, firstName] = words;
  if (!firstName) return surname;

  return mode === "first" ? firstName : `${firstName} ${surname[0]}.`;
}
