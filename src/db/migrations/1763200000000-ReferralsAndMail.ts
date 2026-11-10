import type { MigrationInterface, QueryRunner } from "typeorm";

/** The phone number of the person who referred a driver (kept here, never sent to Yandex), and e-mail notification settings. */
export class ReferralsAndMail1763200000000 implements MigrationInterface {
  name = "ReferralsAndMail1763200000000";

  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE registrations ADD referrer_phone VARCHAR(32) NULL, ADD INDEX idx_registrations_referrer (referrer_phone)`);
    await q.query(`ALTER TABLE site_settings ADD mail JSON NULL, ADD mail_last JSON NULL`);
  }

  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE site_settings DROP COLUMN mail, DROP COLUMN mail_last`);
    await q.query(`ALTER TABLE registrations DROP INDEX idx_registrations_referrer, DROP COLUMN referrer_phone`);
  }
}
