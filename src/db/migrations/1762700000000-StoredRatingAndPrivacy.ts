import type { MigrationInterface, QueryRunner } from "typeorm";

/** The rating is stored again, as one summary row per driver and tariff. The privacy policy text becomes editable. */
export class StoredRatingAndPrivacy1762700000000 implements MigrationInterface {
  name = "StoredRatingAndPrivacy1762700000000";

  async up(q: QueryRunner) {
    await q.query(`
      CREATE TABLE rating_drivers (
        driver_id VARCHAR(100) NOT NULL,
        category VARCHAR(32) NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        orders INT NOT NULL,
        last_order_at DATETIME NOT NULL,
        PRIMARY KEY (driver_id, category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await q.query(`
      ALTER TABLE rating_settings
        ADD sync_schedule VARCHAR(16) NOT NULL DEFAULT 'hourly',
        ADD last_sync_at DATETIME NULL,
        ADD sync_period_key VARCHAR(64) NULL,
        ADD sync_from DATETIME NULL,
        ADD sync_to DATETIME NULL
    `);
    await q.query(`ALTER TABLE site_settings ADD privacy JSON NULL, ADD privacy_updated_at DATETIME NULL`);
  }

  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE site_settings DROP COLUMN privacy, DROP COLUMN privacy_updated_at`);
    await q.query(`
      ALTER TABLE rating_settings
        DROP COLUMN sync_schedule,
        DROP COLUMN last_sync_at,
        DROP COLUMN sync_period_key,
        DROP COLUMN sync_from,
        DROP COLUMN sync_to
    `);
    await q.query(`DROP TABLE rating_drivers`);
    await q.query(`DELETE FROM job_runs WHERE type = 'rating_sync'`);
  }
}
