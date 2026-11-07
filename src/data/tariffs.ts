import type { IconName } from "@/components/Icon";

export type TariffId =
  | "economy"
  | "comfort"
  | "comfortPlus"
  | "electro"
  | "minivan"
  | "business"
  | "kids";

export type Tariff = {
  id: TariffId;
  icon: IconName;
  popular?: boolean;
  start: number;
  perKm: number;
  perMin: number;
  freeWait: number;
  paidWait: number;
  seats?: number;
  minYear?: number;
};

export const tariffs: Tariff[] = [
  {
    id: "economy",
    icon: "car",
    popular: true,
    start: 2.0,
    perKm: 0.9,
    perMin: 0.15,
    freeWait: 3,
    paidWait: 0.15,
    seats: 4,
    minYear: 2010,
  },
  {
    id: "comfort",
    icon: "star",
    start: 2.6,
    perKm: 1.1,
    perMin: 0.2,
    freeWait: 3,
    paidWait: 0.15,
    seats: 4,
    minYear: 2014,
  },
  {
    id: "comfortPlus",
    icon: "sparkles",
    start: 3.5,
    perKm: 1.4,
    perMin: 0.25,
    freeWait: 3,
    paidWait: 0.25,
    seats: 4,
    minYear: 2017,
  },
  {
    id: "electro",
    icon: "zap",
    start: 2.8,
    perKm: 1.2,
    perMin: 0.2,
    freeWait: 3,
    paidWait: 0.15,
    seats: 4,
    minYear: 2018,
  },
  {
    id: "minivan",
    icon: "users",
    start: 3.2,
    perKm: 1.3,
    perMin: 0.2,
    freeWait: 3,
    paidWait: 0.15,
    seats: 6,
    minYear: 2014,
  },
  {
    id: "business",
    icon: "briefcase",
    start: 5.0,
    perKm: 2.0,
    perMin: 0.35,
    freeWait: 5,
    paidWait: 0.3,
    seats: 4,
    minYear: 2018,
  },
  {
    id: "kids",
    icon: "baby",
    start: 2.6,
    perKm: 1.1,
    perMin: 0.2,
    freeWait: 4,
    paidWait: 0.15,
    seats: 4,
    minYear: 2014,
  },
];

export const formatGel = (value: number) => `${value.toFixed(2)} ₾`;
