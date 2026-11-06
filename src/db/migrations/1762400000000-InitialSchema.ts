import type { MigrationInterface, QueryRunner } from "typeorm";

// Taxi categories only: delivery orders (express, cargo) never count towards the rating.
const TAXI_CATEGORIES = [
  "econom",
  "comfort",
  "comfort_plus",
  "business",
  "minivan",
  "vip",
  "wagon",
  "pool",
  "start",
  "standart",
  "child_tariff",
  "ultimate",
  "maybach",
  "premium_van",
  "premium_suv",
  "suv",
  "personal_driver",
];

export class InitialSchema1762400000000 implements MigrationInterface {
  name = "InitialSchema1762400000000";

  async up(q: QueryRunner) {
    await q.query(`
      CREATE TABLE rating_settings (
        id INT NOT NULL PRIMARY KEY,
        enabled TINYINT(1) NOT NULL,
        top_count INT NOT NULL,
        period_mode VARCHAR(16) NOT NULL,
        rolling_days INT NOT NULL,
        period_start VARCHAR(10) NULL,
        period_end VARCHAR(10) NULL,
        categories JSON NOT NULL,
        name_display VARCHAR(16) NOT NULL,
        min_orders INT NOT NULL,
        show_scores TINYINT(1) NOT NULL,
        show_prizes TINYINT(1) NOT NULL,
        prizes JSON NOT NULL,
        hidden_driver_ids JSON NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Off by default, so nothing appears on the site until an admin turns it on.
    await q.query(
      `INSERT INTO rating_settings
        (id, enabled, top_count, period_mode, rolling_days, categories, name_display, min_orders,
         show_scores, show_prizes, prizes, hidden_driver_ids)
       VALUES (1, 0, 10, 'rolling', 14, ?, 'short', 1, 1, 0, '[]', '[]')`,
      [JSON.stringify(TAXI_CATEGORIES)],
    );

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
      CREATE TABLE job_runs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        status VARCHAR(16) NOT NULL,
        triggered_by VARCHAR(64) NOT NULL,
        started_at DATETIME NOT NULL,
        finished_at DATETIME NULL,
        items INT NULL,
        message TEXT NULL,
        coverage_from DATETIME NULL,
        coverage_to DATETIME NULL,
        INDEX idx_job_runs_type_started (type, started_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await q.query(`
      CREATE TABLE car_list_entries (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(32) NOT NULL,
        brand VARCHAR(64) NOT NULL,
        model VARCHAR(128) NOT NULL,
        years JSON NOT NULL,
        via_support JSON NULL,
        INDEX idx_car_list_city (city)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await q.query(`
      CREATE TABLE admin_users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        failed_attempts INT NOT NULL DEFAULT 0,
        locked_until DATETIME NULL,
        last_login_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await q.query(`
      CREATE TABLE admin_sessions (
        token_hash CHAR(64) NOT NULL PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        INDEX idx_admin_sessions_user (user_id),
        CONSTRAINT fk_admin_sessions_user FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(q: QueryRunner) {
    await q.query("DROP TABLE admin_sessions");
    await q.query("DROP TABLE admin_users");
    await q.query("DROP TABLE car_list_entries");
    await q.query("DROP TABLE job_runs");
    await q.query("DROP TABLE rating_orders");
    await q.query("DROP TABLE rating_settings");
  }
}
