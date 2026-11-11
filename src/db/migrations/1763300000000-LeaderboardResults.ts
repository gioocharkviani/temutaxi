import type { MigrationInterface, QueryRunner } from "typeorm";

/** Final results of each finished leaderboard period, saved once when the period ends. */
export class LeaderboardResults1763300000000 implements MigrationInterface {
  name = "LeaderboardResults1763300000000";

  async up(q: QueryRunner) {
    await q.query(`
      CREATE TABLE leaderboard_periods (
        id INT NOT NULL AUTO_INCREMENT,
        period_key VARCHAR(64) NOT NULL,
        period_from DATETIME NOT NULL,
        period_to DATETIME NOT NULL,
        rules JSON NOT NULL,
        drivers INT NOT NULL,
        total_orders INT NOT NULL,
        saved_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_leaderboard_periods_key (period_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await q.query(`
      CREATE TABLE leaderboard_results (
        id INT NOT NULL AUTO_INCREMENT,
        period_id INT NOT NULL,
        position INT NOT NULL,
        driver_id VARCHAR(100) NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        orders INT NOT NULL,
        last_order_at DATETIME NOT NULL,
        prize INT NULL,
        PRIMARY KEY (id),
        INDEX idx_leaderboard_results_period (period_id, position),
        CONSTRAINT fk_leaderboard_results_period FOREIGN KEY (period_id) REFERENCES leaderboard_periods (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }

  async down(q: QueryRunner) {
    await q.query(`DROP TABLE leaderboard_results`);
    await q.query(`DROP TABLE leaderboard_periods`);
  }
}
