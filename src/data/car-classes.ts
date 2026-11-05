// DEMO DATA: car list modelled on the Yandex Pro "which tariff fits my car" tables
// (brand + model + minimum production year per class). Replace with the official lists.

export const carClasses = ["economy", "comfort", "comfortPlus", "electro", "minivan", "business"] as const;
export type CarClass = (typeof carClasses)[number];

/** Minimum production year per class; a missing class means the model never qualifies. */
export type ClassYears = Partial<Record<CarClass, number>>;

export type CarModel = { brand: string; model: string; years: ClassYears };

// Oldest and newest year offered in the year picker.
export const MIN_YEAR = 1999;
export const MAX_YEAR = 2026;

const e = (economy: number, more: Omit<ClassYears, "economy"> = {}): ClassYears => ({ economy, ...more });

export const carModels: CarModel[] = [
  { brand: "Audi", model: "A4", years: e(1999, { comfort: 2012, comfortPlus: 2018 }) },
  { brand: "Audi", model: "A6", years: e(1999, { comfort: 2010, comfortPlus: 2015, business: 2019 }) },
  { brand: "Audi", model: "A8", years: e(1999, { comfort: 2008, comfortPlus: 2012, business: 2016 }) },
  { brand: "Audi", model: "S4", years: e(1999, { comfort: 2012 }) },
  { brand: "Audi", model: "e-tron", years: e(2019, { comfort: 2019, comfortPlus: 2019, electro: 2019 }) },
  { brand: "BMW", model: "3er", years: e(1999, { comfort: 2012, comfortPlus: 2018 }) },
  { brand: "BMW", model: "5er", years: e(1999, { comfort: 2010, comfortPlus: 2015, business: 2019 }) },
  { brand: "BMW", model: "7er", years: e(1999, { comfort: 2008, comfortPlus: 2012, business: 2016 }) },
  { brand: "BMW", model: "i4", years: e(2021, { comfort: 2021, comfortPlus: 2021, electro: 2021 }) },
  { brand: "BMW", model: "iX", years: e(2021, { comfort: 2021, comfortPlus: 2021, electro: 2021, business: 2021 }) },
  { brand: "BYD", model: "Atto 3", years: e(2022, { comfort: 2022, electro: 2022 }) },
  { brand: "BYD", model: "Han", years: e(2020, { comfort: 2020, comfortPlus: 2021, electro: 2020 }) },
  { brand: "BYD", model: "Seal", years: e(2022, { comfort: 2022, comfortPlus: 2022, electro: 2022 }) },
  { brand: "Changan", model: "CS35", years: e(2013) },
  { brand: "Changan", model: "CS55", years: e(2017, { comfort: 2019 }) },
  { brand: "Changan", model: "Eado", years: e(2013, { comfort: 2020 }) },
  { brand: "Chevrolet", model: "Bolt", years: e(2017, { electro: 2017 }) },
  { brand: "Chevrolet", model: "Cruze", years: e(2009) },
  { brand: "Chevrolet", model: "Malibu", years: e(2008, { comfort: 2016 }) },
  { brand: "Ford", model: "Focus", years: e(2005) },
  { brand: "Ford", model: "Fusion", years: e(2006, { comfort: 2015 }) },
  { brand: "Genesis", model: "G80", years: e(2016, { comfort: 2016, comfortPlus: 2017, business: 2018 }) },
  { brand: "Honda", model: "Accord", years: e(2003, { comfort: 2013, comfortPlus: 2018 }) },
  { brand: "Honda", model: "Civic", years: e(2006, { comfort: 2016 }) },
  { brand: "Honda", model: "Fit", years: e(2008) },
  { brand: "Honda", model: "Odyssey", years: e(2005, { comfort: 2012, minivan: 2011 }) },
  { brand: "Hyundai", model: "Elantra", years: e(2006, { comfort: 2016 }) },
  { brand: "Hyundai", model: "Ioniq", years: e(2016, { comfort: 2017 }) },
  { brand: "Hyundai", model: "Ioniq 5", years: e(2021, { comfort: 2021, comfortPlus: 2021, electro: 2021 }) },
  { brand: "Hyundai", model: "Kona Electric", years: e(2018, { comfort: 2019, electro: 2018 }) },
  { brand: "Hyundai", model: "Sonata", years: e(2004, { comfort: 2012, comfortPlus: 2019 }) },
  { brand: "Hyundai", model: "Staria", years: e(2021, { comfort: 2021, minivan: 2021 }) },
  { brand: "Hyundai", model: "Tucson", years: e(2006, { comfort: 2015 }) },
  { brand: "Kia", model: "Carnival", years: e(2006, { comfort: 2014, minivan: 2012 }) },
  { brand: "Kia", model: "EV6", years: e(2021, { comfort: 2021, comfortPlus: 2021, electro: 2021 }) },
  { brand: "Kia", model: "K5 / Optima", years: e(2005, { comfort: 2012, comfortPlus: 2020 }) },
  { brand: "Kia", model: "Niro EV", years: e(2018, { comfort: 2019, electro: 2018 }) },
  { brand: "Kia", model: "Rio", years: e(2008) },
  { brand: "Kia", model: "Sportage", years: e(2006, { comfort: 2016 }) },
  { brand: "Lexus", model: "ES", years: e(2002, { comfort: 2008, comfortPlus: 2013, business: 2018 }) },
  { brand: "Lexus", model: "LS", years: e(2002, { comfort: 2007, comfortPlus: 2010, business: 2016 }) },
  { brand: "Lexus", model: "RX", years: e(2003, { comfort: 2009, comfortPlus: 2015 }) },
  { brand: "Mercedes-Benz", model: "C-Class", years: e(1999, { comfort: 2011, comfortPlus: 2017 }) },
  { brand: "Mercedes-Benz", model: "E-Class", years: e(1999, { comfort: 2010, comfortPlus: 2014, business: 2018 }) },
  { brand: "Mercedes-Benz", model: "EQE", years: e(2022, { comfort: 2022, comfortPlus: 2022, electro: 2022, business: 2022 }) },
  { brand: "Mercedes-Benz", model: "S-Class", years: e(1999, { comfort: 2006, comfortPlus: 2010, business: 2015 }) },
  { brand: "Mercedes-Benz", model: "V-Class", years: e(2005, { comfort: 2014, minivan: 2010, business: 2018 }) },
  { brand: "Mercedes-Benz", model: "Vito", years: e(2005, { minivan: 2010 }) },
  { brand: "Nissan", model: "Altima", years: e(2004, { comfort: 2013 }) },
  { brand: "Nissan", model: "Leaf", years: e(2013, { electro: 2018 }) },
  { brand: "Nissan", model: "Sentra", years: e(2007) },
  { brand: "Tesla", model: "Model 3", years: e(2018, { comfort: 2018, comfortPlus: 2019, electro: 2018 }) },
  { brand: "Tesla", model: "Model S", years: e(2013, { comfort: 2013, comfortPlus: 2015, electro: 2013, business: 2019 }) },
  { brand: "Tesla", model: "Model Y", years: e(2020, { comfort: 2020, comfortPlus: 2020, electro: 2020 }) },
  { brand: "Toyota", model: "Alphard", years: e(2008, { comfort: 2012, minivan: 2010, business: 2018 }) },
  { brand: "Toyota", model: "Aqua", years: e(2012) },
  { brand: "Toyota", model: "Camry", years: e(2002, { comfort: 2012, comfortPlus: 2018 }) },
  { brand: "Toyota", model: "Corolla", years: e(2004, { comfort: 2016 }) },
  { brand: "Toyota", model: "Prius", years: e(2004, { comfort: 2012 }) },
  { brand: "Toyota", model: "RAV4", years: e(2006, { comfort: 2014 }) },
  { brand: "Toyota", model: "Sienna", years: e(2004, { comfort: 2011, minivan: 2010 }) },
  { brand: "Volkswagen", model: "ID.4", years: e(2020, { comfort: 2020, electro: 2020 }) },
  { brand: "Volkswagen", model: "Jetta", years: e(2006, { comfort: 2015 }) },
  { brand: "Volkswagen", model: "Passat", years: e(2003, { comfort: 2012, comfortPlus: 2019 }) },
];

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const brands = [...new Set(carModels.map((c) => c.brand))].sort();

export const modelsFor = (brand: string) => carModels.filter((c) => same(c.brand, brand));


/** Case-insensitive lookup, so free-typed values match the list. */
export const findCar = (brand: string, model: string) =>
  carModels.find((c) => same(c.brand, brand) && same(c.model, model));

/** Per class: the minimum year (if any) and whether a car of this year qualifies. */
export const classResults = (car: CarModel | undefined, year: number) =>
  carClasses.map((c) => {
    const from = car?.years[c];
    return { c, from, ok: from !== undefined && year >= from };
  });
