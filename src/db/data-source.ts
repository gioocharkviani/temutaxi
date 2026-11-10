import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  AdminSessionEntity,
  AdminUserEntity,
  CarListEntryEntity,
  JobRunEntity,
  PromotionEntity,
  RatingDriverEntity,
  RatingSettingsEntity,
  RegistrationEntity,
  SiteSettingsEntity,
} from "./entities";
import { InitialSchema1762400000000 } from "./migrations/1762400000000-InitialSchema";
import { RegistrationsAndSiteSettings1762500000000 } from "./migrations/1762500000000-RegistrationsAndSiteSettings";
import { LiveRatingAndContent1762600000000 } from "./migrations/1762600000000-LiveRatingAndContent";
import { StoredRatingAndPrivacy1762700000000 } from "./migrations/1762700000000-StoredRatingAndPrivacy";
import { SeoAndStoredDataTerms1762800000000 } from "./migrations/1762800000000-SeoAndStoredDataTerms";
import { LeaderboardAndPhones1762900000000 } from "./migrations/1762900000000-LeaderboardAndPhones";
import { Promotions1763000000000 } from "./migrations/1763000000000-Promotions";

function createDataSource() {
  return new DataSource({
    type: "mysql",
    url: process.env.DATABASE_URL,
    charset: "utf8mb4",
    timezone: "Z",
    connectTimeout: 3000,
    synchronize: false,
    entities: [
      RatingSettingsEntity,
      JobRunEntity,
      PromotionEntity,
      RatingDriverEntity,
      CarListEntryEntity,
      AdminUserEntity,
      AdminSessionEntity,
      RegistrationEntity,
      SiteSettingsEntity,
    ],
    migrations: [
      InitialSchema1762400000000,
      RegistrationsAndSiteSettings1762500000000,
      LiveRatingAndContent1762600000000,
      StoredRatingAndPrivacy1762700000000,
      SeoAndStoredDataTerms1762800000000,
      LeaderboardAndPhones1762900000000,
      Promotions1763000000000,
    ],
  });
}

const store = globalThis as unknown as { temutaxiDb?: Promise<DataSource> };

export function getDb(): Promise<DataSource> {
  if (!process.env.DATABASE_URL)
    return Promise.reject(new Error("DATABASE_URL is not set"));
  store.temutaxiDb ??= createDataSource()
    .initialize()
    .catch((error) => {
      store.temutaxiDb = undefined;
      throw error;
    });
  return store.temutaxiDb;
}
