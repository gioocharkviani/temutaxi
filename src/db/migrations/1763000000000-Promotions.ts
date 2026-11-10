import type { MigrationInterface, QueryRunner } from "typeorm";

const text = (title: string, body: string, buttonText: string) => ({ title, body, buttonText });

// Ready-made promotions, written from what the site really offers. An admin can change, turn off or delete them.
const PROMOTIONS = [
  {
    name: "ზედა ზოლი: ონლაინ რეგისტრაცია",
    type: "bar",
    theme: "stripes",
    priority: 10,
    colors: { background: "#21201f", text: "#ffffff", button: "#fce000", buttonText: "#21201f" },
    icon: "zap",
    link: "/register",
    content: {
      ka: text("ტაქსის მძღოლად რეგისტრაცია ონლაინ.", "ამ ეტაპზე ფოტოები საჭირო არ არის.", "რეგისტრაცია"),
      en: text("Register as a taxi driver online.", "No photos are needed at this stage.", "Register"),
      ru: text("Регистрация водителем такси онлайн.", "На этом этапе фотографии не нужны.", "Регистрация"),
    },
  },
  {
    name: "მოდალი: გახდით მძღოლი",
    type: "modal",
    theme: "glow",
    priority: 10,
    colors: { background: "#21201f", text: "#ffffff", button: "#fce000", buttonText: "#21201f" },
    icon: "car",
    link: "/register",
    content: {
      ka: text("გახდით ტაქსის მძღოლი", "შეავსეთ განაცხადი ონლაინ: სახელი, ტელეფონი, მართვის მოწმობა და მანქანა. მენეჯერი დაგიკავშირდებათ.", "რეგისტრაციის დაწყება"),
      en: text("Become a taxi driver", "Fill in the application online: name, phone, driving licence and car. Our manager will contact you.", "Start registration"),
      ru: text("Станьте водителем такси", "Заполните заявку онлайн: имя, телефон, водительское удостоверение и автомобиль. Менеджер свяжется с вами.", "Начать регистрацию"),
    },
  },
  {
    name: "ბანერი: მანქანის შემოწმება",
    type: "banner",
    theme: "stripes",
    priority: 10,
    colors: { background: "#fce000", text: "#21201f", button: "#21201f", buttonText: "#ffffff" },
    icon: "search",
    link: "/tariffs",
    content: {
      ka: text("რომელ ტარიფზე იმუშავებს თქვენი მანქანა?", "აირჩიეთ მარკა, მოდელი და წელი და ნახეთ შესაბამისი ტარიფები Yandex Pro-ს ოფიციალური სიით.", "შემოწმება"),
      en: text("Which tariff can your car work in?", "Choose the brand, model and year and see the matching tariffs from the official Yandex Pro list.", "Check now"),
      ru: text("На каком тарифе может работать ваш автомобиль?", "Выберите марку, модель и год и посмотрите подходящие тарифы по официальному списку Yandex Pro.", "Проверить"),
    },
  },
  {
    name: "ბანერი: Yandex Pro",
    type: "banner",
    theme: "outline",
    priority: 0,
    colors: { background: "#ffffff", text: "#21201f", button: "#fce000", buttonText: "#21201f" },
    icon: "smartphone",
    link: "https://play.google.com/store/apps/details?id=ru.yandex.taximeter",
    newTab: true,
    content: {
      ka: text("შეკვეთები Yandex Pro-ში მოდის", "მძღოლის აპლიკაცია ხელმისაწვდომია Android-ზე და iPhone-ზე. ჩამოტვირთვის ბმულები ფუტერშიც არის.", "ჩამოტვირთვა"),
      en: text("Orders arrive in Yandex Pro", "The driver app is available on Android and iPhone. Download links are also in the footer.", "Download"),
      ru: text("Заказы приходят в Yandex Pro", "Приложение для водителей есть на Android и iPhone. Ссылки для скачивания есть и в подвале сайта.", "Скачать"),
    },
  },
];

/** Promotions an admin controls: modal pop-ups, landing banners and top bars, each with a theme. */
export class Promotions1763000000000 implements MigrationInterface {
  name = "Promotions1763000000000";

  async up(q: QueryRunner) {
    await q.query(`
      CREATE TABLE promotions (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        type VARCHAR(16) NOT NULL,
        theme VARCHAR(16) NOT NULL DEFAULT 'solid',
        enabled TINYINT NOT NULL DEFAULT 0,
        priority INT NOT NULL DEFAULT 0,
        starts_at DATETIME NULL,
        ends_at DATETIME NULL,
        colors JSON NOT NULL,
        icon VARCHAR(32) NULL,
        link VARCHAR(500) NULL,
        new_tab TINYINT NOT NULL DEFAULT 0,
        content JSON NOT NULL,
        repeat_mode VARCHAR(16) NOT NULL DEFAULT 'hours',
        repeat_hours INT NOT NULL DEFAULT 24,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_promotions_active (enabled, type, priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    for (const p of PROMOTIONS) {
      await q.query(
        `INSERT INTO promotions (name, type, theme, enabled, priority, colors, icon, link, new_tab, content, repeat_mode, repeat_hours)
         VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, 'hours', 24)`,
        [p.name, p.type, p.theme, p.priority, JSON.stringify(p.colors), p.icon, p.link, p.newTab ? 1 : 0, JSON.stringify(p.content)],
      );
    }
  }

  async down(q: QueryRunner) {
    await q.query(`DROP TABLE promotions`);
  }
}
