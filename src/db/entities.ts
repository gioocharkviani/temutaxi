import { EntitySchema } from "typeorm";

export type PeriodMode = "rolling" | "fixed";
export type NameDisplay = "full" | "short" | "first";
export type TieBreak = "first" | "last";

export type RatingText = {
  landingTitle: string;
  landingText: string;
  pageTitle: string;
  rules: string;
};
export type RatingContent = Record<"ka" | "en" | "ru", RatingText>;
export type SyncSchedule = "hourly" | "daily";

export interface RatingSettings {
  id: number;
  enabled: boolean;
  landingCount: number;
  pageCount: number;
  tieBreak: TieBreak;
  content: RatingContent | null;
  syncSchedule: SyncSchedule;
  lastSyncAt: Date | null;
  syncPeriodKey: string | null;
  syncFrom: Date | null;
  syncTo: Date | null;
  periodMode: PeriodMode;
  rollingDays: number;
  periodStart: string | null;
  periodEnd: string | null;
  categories: string[];
  nameDisplay: NameDisplay;
  minOrders: number;
  showScores: boolean;
  showPrizes: boolean;
  prizes: number[];
  hiddenDriverIds: string[];
  updatedAt: Date;
}

export const RatingSettingsEntity = new EntitySchema<RatingSettings>({
  name: "RatingSettings",
  tableName: "rating_settings",
  columns: {
    id: { type: "int", primary: true },
    enabled: { type: "boolean" },
    landingCount: { name: "landing_count", type: "int" },
    pageCount: { name: "page_count", type: "int" },
    tieBreak: { name: "tie_break", type: "varchar", length: 16 },
    content: { type: "json", nullable: true },
    syncSchedule: { name: "sync_schedule", type: "varchar", length: 16 },
    lastSyncAt: { name: "last_sync_at", type: "datetime", nullable: true },
    syncPeriodKey: {
      name: "sync_period_key",
      type: "varchar",
      length: 64,
      nullable: true,
    },
    syncFrom: { name: "sync_from", type: "datetime", nullable: true },
    syncTo: { name: "sync_to", type: "datetime", nullable: true },
    periodMode: { name: "period_mode", type: "varchar", length: 16 },
    rollingDays: { name: "rolling_days", type: "int" },
    periodStart: {
      name: "period_start",
      type: "varchar",
      length: 10,
      nullable: true,
    },
    periodEnd: {
      name: "period_end",
      type: "varchar",
      length: 10,
      nullable: true,
    },
    categories: { type: "json" },
    nameDisplay: { name: "name_display", type: "varchar", length: 16 },
    minOrders: { name: "min_orders", type: "int" },
    showScores: { name: "show_scores", type: "boolean" },
    showPrizes: { name: "show_prizes", type: "boolean" },
    prizes: { type: "json" },
    hiddenDriverIds: { name: "hidden_driver_ids", type: "json" },
    updatedAt: { name: "updated_at", type: "datetime", updateDate: true },
  },
});

export interface RatingDriver {
  driverId: string;
  category: string;
  driverName: string;
  orders: number;
  lastOrderAt: Date;
  phones: string | null;
}

export const RatingDriverEntity = new EntitySchema<RatingDriver>({
  name: "RatingDriver",
  tableName: "rating_drivers",
  columns: {
    driverId: {
      name: "driver_id",
      type: "varchar",
      length: 100,
      primary: true,
    },
    category: { type: "varchar", length: 32, primary: true },
    driverName: { name: "driver_name", type: "varchar", length: 255 },
    orders: { type: "int" },
    lastOrderAt: { name: "last_order_at", type: "datetime" },
    phones: { type: "varchar", length: 255, nullable: true },
  },
});

export type JobType = "rating_sync" | "car_list_update";
export type JobStatus = "running" | "success" | "failed";

export interface JobRun {
  id: number;
  type: JobType;
  status: JobStatus;
  triggeredBy: string;
  startedAt: Date;
  finishedAt: Date | null;
  items: number | null;
  message: string | null;
}

export const JobRunEntity = new EntitySchema<JobRun>({
  name: "JobRun",
  tableName: "job_runs",
  columns: {
    id: { type: "int", primary: true, generated: true },
    type: { type: "varchar", length: 32 },
    status: { type: "varchar", length: 16 },
    triggeredBy: { name: "triggered_by", type: "varchar", length: 64 },
    startedAt: { name: "started_at", type: "datetime" },
    finishedAt: { name: "finished_at", type: "datetime", nullable: true },
    items: { type: "int", nullable: true },
    message: { type: "text", nullable: true },
  },
  indices: [
    { name: "idx_job_runs_type_started", columns: ["type", "startedAt"] },
  ],
});

export interface CarListEntry {
  id: number;
  city: string;
  brand: string;
  model: string;
  years: Record<string, number | null>;
  viaSupport: string[] | null;
}

export const CarListEntryEntity = new EntitySchema<CarListEntry>({
  name: "CarListEntry",
  tableName: "car_list_entries",
  columns: {
    id: { type: "int", primary: true, generated: true },
    city: { type: "varchar", length: 32 },
    brand: { type: "varchar", length: 64 },
    model: { type: "varchar", length: 128 },
    years: { type: "json" },
    viaSupport: { name: "via_support", type: "json", nullable: true },
  },
  indices: [{ name: "idx_car_list_city", columns: ["city"] }],
});

export type RegistrationStatus = "received" | "sent" | "failed";

export interface Registration {
  id: number;
  requestId: string;
  status: RegistrationStatus;
  fullName: string;
  phone: string;
  city: string | null;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  carMake: string | null;
  carModel: string | null;
  carYear: string | null;
  carColor: string | null;
  vinCode: string | null;
  carNumber: string | null;
  tariff: string | null;
  fleetProfileId: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const RegistrationEntity = new EntitySchema<Registration>({
  name: "Registration",
  tableName: "registrations",
  columns: {
    id: { type: "int", primary: true, generated: true },
    requestId: {
      name: "request_id",
      type: "varchar",
      length: 64,
      unique: true,
    },
    status: { type: "varchar", length: 16 },
    fullName: { name: "full_name", type: "varchar", length: 120 },
    phone: { type: "varchar", length: 120 },
    city: { type: "varchar", length: 120, nullable: true },
    licenseNumber: { name: "license_number", type: "varchar", length: 120 },
    licenseIssueDate: {
      name: "license_issue_date",
      type: "varchar",
      length: 10,
    },
    licenseExpiryDate: {
      name: "license_expiry_date",
      type: "varchar",
      length: 10,
    },
    carMake: { name: "car_make", type: "varchar", length: 120, nullable: true },
    carModel: {
      name: "car_model",
      type: "varchar",
      length: 120,
      nullable: true,
    },
    carYear: { name: "car_year", type: "varchar", length: 4, nullable: true },
    carColor: {
      name: "car_color",
      type: "varchar",
      length: 120,
      nullable: true,
    },
    vinCode: { name: "vin_code", type: "varchar", length: 120, nullable: true },
    carNumber: {
      name: "car_number",
      type: "varchar",
      length: 120,
      nullable: true,
    },
    tariff: { type: "varchar", length: 32, nullable: true },
    fleetProfileId: {
      name: "fleet_profile_id",
      type: "varchar",
      length: 100,
      nullable: true,
    },
    error: { type: "text", nullable: true },
    createdAt: { name: "created_at", type: "datetime", createDate: true },
    updatedAt: { name: "updated_at", type: "datetime", updateDate: true },
  },
});

export type PrivacyText = { title: string; body: string };
export type PrivacyContent = Record<"ka" | "en" | "ru", PrivacyText>;

export type SeoPageKey = "home" | "tariffs" | "register" | "rating" | "privacy";
export type SeoText = { title: string; description: string };
export type SeoSettings = {
  siteUrl: string;
  siteName: string;
  ogImage: string;
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  indexing: boolean;
  hiddenPages: SeoPageKey[];
  pages: Record<SeoPageKey, Record<"ka" | "en" | "ru", SeoText>>;
};

export type PromotionType = "modal" | "banner" | "bar";
export type PromotionTheme = "solid" | "glow" | "stripes" | "outline";
export type PromotionText = { title: string; body: string; buttonText: string };
export type PromotionColors = { background: string; text: string; button: string; buttonText: string };

export interface Promotion {
  id: number;
  /** Only shown in the admin panel. */
  name: string;
  type: PromotionType;
  theme: PromotionTheme;
  enabled: boolean;
  /** Higher shows first; only the highest modal and bar are shown. */
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  colors: PromotionColors;
  icon: string | null;
  /** A page of this site ("/register") or an http(s) address. */
  link: string | null;
  newTab: boolean;
  content: Record<"ka" | "en" | "ru", PromotionText>;
  /** Modal only: once per browser session, or again after repeatHours. */
  repeat: "session" | "hours";
  repeatHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PromotionEntity = new EntitySchema<Promotion>({
  name: "Promotion",
  tableName: "promotions",
  columns: {
    id: { type: "int", primary: true, generated: true },
    name: { type: "varchar", length: 80 },
    type: { type: "varchar", length: 16 },
    theme: { type: "varchar", length: 16 },
    enabled: { type: "boolean" },
    priority: { type: "int" },
    startsAt: { name: "starts_at", type: "datetime", nullable: true },
    endsAt: { name: "ends_at", type: "datetime", nullable: true },
    colors: { type: "json" },
    icon: { type: "varchar", length: 32, nullable: true },
    link: { type: "varchar", length: 500, nullable: true },
    newTab: { name: "new_tab", type: "boolean" },
    content: { type: "json" },
    repeat: { name: "repeat_mode", type: "varchar", length: 16 },
    repeatHours: { name: "repeat_hours", type: "int" },
    createdAt: { name: "created_at", type: "datetime", createDate: true },
    updatedAt: { name: "updated_at", type: "datetime", updateDate: true },
  },
});

export interface SiteSettings {
  id: number;
  carListCity: string;
  privacy: PrivacyContent | null;
  privacyUpdatedAt: Date | null;
  seo: SeoSettings | null;
}

export const SiteSettingsEntity = new EntitySchema<SiteSettings>({
  name: "SiteSettings",
  tableName: "site_settings",
  columns: {
    id: { type: "int", primary: true },
    carListCity: { name: "car_list_city", type: "varchar", length: 32 },
    privacy: { type: "json", nullable: true },
    privacyUpdatedAt: {
      name: "privacy_updated_at",
      type: "datetime",
      nullable: true,
    },
    seo: { type: "json", nullable: true },
  },
});

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export const AdminUserEntity = new EntitySchema<AdminUser>({
  name: "AdminUser",
  tableName: "admin_users",
  columns: {
    id: { type: "int", primary: true, generated: true },
    username: { type: "varchar", length: 64, unique: true },
    passwordHash: { name: "password_hash", type: "varchar", length: 255 },
    failedAttempts: { name: "failed_attempts", type: "int", default: 0 },
    lockedUntil: { name: "locked_until", type: "datetime", nullable: true },
    lastLoginAt: { name: "last_login_at", type: "datetime", nullable: true },
    createdAt: { name: "created_at", type: "datetime", createDate: true },
  },
});

export interface AdminSession {
  tokenHash: string;
  userId: number;
  expiresAt: Date;
}

export const AdminSessionEntity = new EntitySchema<AdminSession>({
  name: "AdminSession",
  tableName: "admin_sessions",
  columns: {
    tokenHash: { name: "token_hash", type: "char", length: 64, primary: true },
    userId: { name: "user_id", type: "int" },
    expiresAt: { name: "expires_at", type: "datetime" },
  },
  indices: [{ name: "idx_admin_sessions_user", columns: ["userId"] }],
});
