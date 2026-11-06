// The privacy policy text: edited in the admin panel, with the dictionaries as the starting text.

import "server-only";
import { getDb } from "@/db/data-source";
import { SiteSettingsEntity, type PrivacyContent, type PrivacyText } from "@/db/entities";
import { locales, type Locale } from "@/i18n/config";
import { getPrivacyDictionary } from "@/i18n/dictionaries";
import type { PrivacyDictionary } from "@/i18n/dictionaries/privacy-en";

/** The dictionary in the same simple format the admin edits: "# " heading, "- " list item, blank line between paragraphs. */
function toEditableText(t: PrivacyDictionary): PrivacyText {
  const sections = t.sections.map((s) => {
    const section: { title: string; paragraphs: string[]; list?: string[]; after?: string } = s;
    return [
      `# ${section.title}`,
      section.paragraphs.join("\n\n"),
      section.list?.map((item) => `- ${item}`).join("\n"),
      section.after,
    ].filter(Boolean).join("\n\n");
  });
  return { title: t.title, body: [t.intro, ...sections].join("\n\n") };
}

async function getDefaultPrivacy(): Promise<PrivacyContent> {
  const entries = await Promise.all(locales.map(async (l) => [l, toEditableText(await getPrivacyDictionary(l))] as const));
  return Object.fromEntries(entries) as PrivacyContent;
}

async function getStored() {
  const db = await getDb();
  return db.getRepository(SiteSettingsEntity).findOneBy({ id: 1 });
}

export async function getPrivacyContent(): Promise<PrivacyContent> {
  return (await getStored())?.privacy ?? getDefaultPrivacy();
}

/** The policy for one language. Falls back to the built-in text if the database is unavailable. */
export async function getPrivacyPage(lang: Locale): Promise<{ text: PrivacyText; updatedAt: Date | null }> {
  try {
    const stored = await getStored();
    if (stored?.privacy) return { text: stored.privacy[lang], updatedAt: stored.privacyUpdatedAt };
  } catch (error) {
    console.error("Privacy policy could not be read from the database", error);
  }
  return { text: toEditableText(await getPrivacyDictionary(lang)), updatedAt: null };
}

/** Saves the text. The public "last updated" date changes only when the text really changed. */
export async function savePrivacyContent(content: PrivacyContent) {
  const current = await getPrivacyContent();
  if (locales.every((l) => current[l].title === content[l].title && current[l].body === content[l].body)) return;

  const db = await getDb();
  await db.getRepository(SiteSettingsEntity).update(1, { privacy: content, privacyUpdatedAt: new Date() });
}
