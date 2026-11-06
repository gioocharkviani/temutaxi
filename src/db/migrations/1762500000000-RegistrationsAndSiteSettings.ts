import type { MigrationInterface, QueryRunner } from "typeorm";

export class RegistrationsAndSiteSettings1762500000000 implements MigrationInterface {
  name = "RegistrationsAndSiteSettings1762500000000";

  async up(q: QueryRunner) {
    await q.query(`
      CREATE TABLE registrations (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(64) NOT NULL UNIQUE,
        status VARCHAR(16) NOT NULL,
        full_name VARCHAR(120) NOT NULL,
        phone VARCHAR(120) NOT NULL,
        city VARCHAR(120) NULL,
        license_number VARCHAR(120) NOT NULL,
        license_issue_date VARCHAR(10) NOT NULL,
        license_expiry_date VARCHAR(10) NOT NULL,
        car_make VARCHAR(120) NULL,
        car_model VARCHAR(120) NULL,
        car_year VARCHAR(4) NULL,
        car_color VARCHAR(120) NULL,
        vin_code VARCHAR(120) NULL,
        car_number VARCHAR(120) NULL,
        tariff VARCHAR(32) NULL,
        fleet_profile_id VARCHAR(100) NULL,
        error TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_registrations_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await q.query(`
      CREATE TABLE site_settings (
        id INT NOT NULL PRIMARY KEY,
        car_list_city VARCHAR(32) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await q.query(`INSERT INTO site_settings (id, car_list_city) VALUES (1, 'tbilisi')`);
  }

  async down(q: QueryRunner) {
    await q.query("DROP TABLE site_settings");
    await q.query("DROP TABLE registrations");
  }
}
