import type { MigrationInterface, QueryRunner } from "typeorm";

/** A promotion can show App Store and Google Play buttons for Yandex Pro instead of its single button. */
export class PromotionStoreButtons1763100000000 implements MigrationInterface {
  name = "PromotionStoreButtons1763100000000";

  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE promotions ADD show_apps TINYINT NOT NULL DEFAULT 0`);
    // The ready-made Yandex Pro banner linked only to Google Play; it now shows both stores.
    await q.query(`UPDATE promotions SET show_apps = 1 WHERE name = 'ბანერი: Yandex Pro'`);
  }

  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE promotions DROP COLUMN show_apps`);
  }
}
