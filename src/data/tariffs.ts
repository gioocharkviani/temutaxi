import type { IconName } from "@/components/Icon";

// DEMO DATA: tariff names follow Yandex Go in Georgia, but every number is a placeholder.
// Replace with the figures from the official Yandex Go page before launch.

export type TariffId =
  | "economy"
  | "comfort"
  | "comfortPlus"
  | "electro"
  | "minivan"
  | "business"
  | "kids"
  | "delivery"
  | "cargo";
export type TariffCategory = "ride" | "delivery";

export type Tariff = {
  id: TariffId;
  category: TariffCategory;
  icon: IconName;
  popular?: boolean;
  /** GEL */
  start: number;
  /** GEL per km */
  perKm: number;
  /** GEL per minute of the trip */
  perMin: number;
  /** minutes of free waiting */
  freeWait: number;
  /** GEL per minute of paid waiting */
  paidWait: number;
  seats?: number;
  minYear?: number;
};

export const tariffs: Tariff[] = [
  { id: "economy", category: "ride", icon: "car", popular: true, start: 2.0, perKm: 0.9, perMin: 0.15, freeWait: 3, paidWait: 0.15, seats: 4, minYear: 2010 },
  { id: "comfort", category: "ride", icon: "star", start: 2.6, perKm: 1.1, perMin: 0.2, freeWait: 3, paidWait: 0.15, seats: 4, minYear: 2014 },
  { id: "comfortPlus", category: "ride", icon: "sparkles", start: 3.5, perKm: 1.4, perMin: 0.25, freeWait: 3, paidWait: 0.25, seats: 4, minYear: 2017 },
  { id: "electro", category: "ride", icon: "zap", start: 2.8, perKm: 1.2, perMin: 0.2, freeWait: 3, paidWait: 0.15, seats: 4, minYear: 2018 },
  { id: "minivan", category: "ride", icon: "users", start: 3.2, perKm: 1.3, perMin: 0.2, freeWait: 3, paidWait: 0.15, seats: 6, minYear: 2014 },
  { id: "business", category: "ride", icon: "briefcase", start: 5.0, perKm: 2.0, perMin: 0.35, freeWait: 5, paidWait: 0.3, seats: 4, minYear: 2018 },
  { id: "kids", category: "ride", icon: "baby", start: 2.6, perKm: 1.1, perMin: 0.2, freeWait: 4, paidWait: 0.15, seats: 4, minYear: 2014 },
  { id: "delivery", category: "delivery", icon: "package", start: 2.6, perKm: 0.9, perMin: 0.15, freeWait: 6, paidWait: 0.1 },
  { id: "cargo", category: "delivery", icon: "truck", start: 15.0, perKm: 2.5, perMin: 0.35, freeWait: 10, paidWait: 0.35 },
];

export const formatGel = (value: number) => `${value.toFixed(2)} ₾`;
