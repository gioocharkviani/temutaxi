import type { MigrationInterface, QueryRunner } from "typeorm";

// Changes to texts an admin has already saved, as they were written when this migration was added.
const SENTENCES: Record<string, [string, string][]> = {
  ka: [
    ["- ბოლო შეკვეთის დროს", "- ბოლო შეკვეთის დროს\n- ტელეფონის ნომერს, თუ Yandex მას გადმოგვცემს: მხოლოდ ძიებისთვის, საიტზე არ ჩანს"],
    ["ცალკეულ შეკვეთებს, მარშრუტებს, შემოსავალსა და ტელეფონის ნომერს რეიტინგისთვის არ ვინახავთ.", "ცალკეულ შეკვეთებს, მარშრუტებსა და შემოსავალს არ ვინახავთ."],
  ],
  en: [
    ["- The time of the latest order", "- The time of the latest order\n- The phone number, if Yandex provides it: used only for search and never shown on the site"],
    ["We do not store individual orders, routes, earnings or phone numbers for the rating.", "We do not store individual orders, routes or earnings."],
  ],
  ru: [
    ["- Время последнего заказа", "- Время последнего заказа\n- Номер телефона, если Яндекс его передаёт: только для поиска, на сайте не показывается"],
    ["Отдельные заказы, маршруты, доход и номера телефонов для рейтинга мы не храним.", "Отдельные заказы, маршруты и доход мы не храним."],
  ],
};

/** "Rating" becomes "leaderboard" in each language; Georgian and Russian keep their endings. */
const RENAME: Record<string, (text: string) => string> = {
  ka: (t) => t.replaceAll("რეიტინგ", "ლიდერბორდ"),
  en: (t) => t.replaceAll("Rating", "Leaderboard").replaceAll("rating", "leaderboard"),
  ru: (t) => t.replaceAll("Рейтинг", "Лидерборд").replaceAll("рейтинг", "лидерборд"),
};

/** Stores drivers' phone numbers for search, and renames the rating to leaderboard in texts an admin saved. */
export class LeaderboardAndPhones1762900000000 implements MigrationInterface {
  name = "LeaderboardAndPhones1762900000000";

  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE rating_drivers ADD phones VARCHAR(255) NULL`);

    const [row] = await q.query(`SELECT content FROM rating_settings WHERE id = 1`);
    if (!row?.content) return;
    const content: Record<string, Record<string, string>> = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
    for (const [lang, texts] of Object.entries(content)) {
      for (const field of Object.keys(texts)) {
        let text = texts[field];
        for (const [from, to] of SENTENCES[lang] ?? []) text = text.replace(from, to);
        texts[field] = RENAME[lang] ? RENAME[lang](text) : text;
      }
    }
    await q.query(`UPDATE rating_settings SET content = ? WHERE id = 1`, [JSON.stringify(content)]);
  }

  // The renamed texts stay as they are; an admin can edit them.
  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE rating_drivers DROP COLUMN phones`);
  }
}
