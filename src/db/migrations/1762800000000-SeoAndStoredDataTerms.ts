import type { MigrationInterface, QueryRunner } from "typeorm";

// The new section of the rating rules, as it was written when this migration was added.
const SECTIONS: Record<string, string> = {
  ka: `# რა მონაცემებს ვინახავთ
რეიტინგისა და ძიებისთვის თითოეულ მძღოლზე ვინახავთ მხოლოდ:
- მძღოლის იდენტიფიკატორს Yandex-ში
- სახელსა და გვარს
- პერიოდში დასრულებული შეკვეთების რაოდენობას ტარიფების მიხედვით
- ბოლო შეკვეთის დროს

ცალკეულ შეკვეთებს, მარშრუტებს, შემოსავალსა და ტელეფონის ნომერს რეიტინგისთვის არ ვინახავთ. ყოველი განახლება წინა მონაცემებს ანაცვლებს. მძღოლს შეუძლია მოითხოვოს რეიტინგიდან ამოღება.`,
  en: `# What data we store
For the rating and its search, we store only this for each driver:
- The driver's identifier in Yandex
- Name and surname
- The number of completed orders per tariff in the period
- The time of the latest order

We do not store individual orders, routes, earnings or phone numbers for the rating. Each update replaces the previous figures. A driver can ask to be removed from the rating.`,
  ru: `# Какие данные мы храним
Для рейтинга и поиска по каждому водителю мы храним только:
- Идентификатор водителя в Яндексе
- Имя и фамилию
- Количество завершённых заказов по тарифам за период
- Время последнего заказа

Отдельные заказы, маршруты, доход и номера телефонов для рейтинга мы не храним. Каждое обновление заменяет прежние данные. Водитель может попросить убрать его из рейтинга.`,
};

type Content = Record<string, { rules: string }>;

async function readContent(q: QueryRunner): Promise<Content | null> {
  const [row] = await q.query(`SELECT content FROM rating_settings WHERE id = 1`);
  if (!row?.content) return null;
  return typeof row.content === "string" ? JSON.parse(row.content) : row.content;
}

/** Adds the SEO settings, and the stored-data section to rating rules an admin has already saved. */
export class SeoAndStoredDataTerms1762800000000 implements MigrationInterface {
  name = "SeoAndStoredDataTerms1762800000000";

  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE site_settings ADD seo JSON NULL`);

    const content = await readContent(q);
    if (!content) return;
    for (const [lang, section] of Object.entries(SECTIONS)) {
      if (content[lang]) content[lang].rules = `${content[lang].rules.replace(/\r\n?/g, "\n").trimEnd()}\n\n${section}`;
    }
    await q.query(`UPDATE rating_settings SET content = ? WHERE id = 1`, [JSON.stringify(content)]);
  }

  async down(q: QueryRunner) {
    const content = await readContent(q);
    if (content) {
      for (const [lang, section] of Object.entries(SECTIONS)) {
        if (content[lang]) content[lang].rules = content[lang].rules.replace(`\n\n${section}`, "");
      }
      await q.query(`UPDATE rating_settings SET content = ? WHERE id = 1`, [JSON.stringify(content)]);
    }
    await q.query(`ALTER TABLE site_settings DROP COLUMN seo`);
  }
}
