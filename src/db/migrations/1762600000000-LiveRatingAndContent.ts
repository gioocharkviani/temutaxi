import type { MigrationInterface, QueryRunner } from "typeorm";

/** Driver ratings are now read live from Yandex and no longer stored. Only the settings and texts stay here. */
export class LiveRatingAndContent1762600000000 implements MigrationInterface {
  name = "LiveRatingAndContent1762600000000";

  async up(q: QueryRunner) {
    await q.query(`
      ALTER TABLE rating_settings
        CHANGE top_count page_count INT NOT NULL,
        ADD landing_count INT NOT NULL DEFAULT 3,
        ADD tie_break VARCHAR(16) NOT NULL DEFAULT 'first',
        ADD content JSON NULL
    `);
    await q.query(`DROP TABLE rating_orders`);
    await q.query(`DELETE FROM job_runs WHERE type = 'rating_sync'`);
    await q.query(`ALTER TABLE job_runs DROP COLUMN coverage_from, DROP COLUMN coverage_to`);
  }

  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE job_runs ADD coverage_from DATETIME NULL, ADD coverage_to DATETIME NULL`);
    await q.query(`
      CREATE TABLE rating_orders (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        driver_id VARCHAR(100) NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        category VARCHAR(32) NULL,
        ended_at DATETIME NOT NULL,
        INDEX idx_rating_orders_ended_driver (ended_at, driver_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await q.query(`
      ALTER TABLE rating_settings
        CHANGE page_count top_count INT NOT NULL,
        DROP COLUMN landing_count,
        DROP COLUMN tie_break,
        DROP COLUMN content
    `);
  }
}
