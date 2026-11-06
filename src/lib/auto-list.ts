// Reads the official Yandex Pro car lists. The page embeds its tables as JSON in
// <script id="__NEXT_DATA__">, so no HTML parsing is needed.

export const AUTO_LIST_CITIES = ["tbilisi", "batumi", "kutaisi", "rustavi"] as const;
export type AutoListCity = (typeof AUTO_LIST_CITIES)[number];

export type AutoListCar = {
  brand: string;
  model: string;
  /** Minimum year per class; null means the class explicitly does not allow this car. */
  years: Record<string, number | null>;
  viaSupport?: string[];
};

export type AutoListCityData = {
  source: string;
  lastUpdate: string;
  classes: string[];
  notes: Record<string, string>;
  cars: AutoListCar[];
};

const pageUrl = (city: AutoListCity) => `https://pro.yandex.com/ge-ka/${city}/knowledge-base/taxi/tariffs/auto-list`;

// Accordion titles on the page. An unknown title stops the run instead of silently dropping a category.
const CLASS_BY_TITLE: Record<string, string> = {
  ეკონომი: "economy",
  კომფორტი: "comfort",
  "კომფორტი +": "comfortPlus",
  ელექტრო: "electro",
  მინივენი: "minivan",
  ბიზნესი: "business",
};

// The page writes make and model as one string, so brands of more than one word must be listed.
const MULTI_WORD_BRANDS = ["Alfa Romeo", "Great Wall", "Iran Khodro", "LADA (ВАЗ)", "Land Rover", "Lynk & Co"];

// The same brand is spelled differently in places on the page.
const BRAND_SPELLING: Record<string, string> = { AudI: "Audi", Dongfeng: "DongFeng", Seat: "SEAT" };

const clean = (text: unknown) =>
  String(text)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function splitName(name: string) {
  const multi = MULTI_WORD_BRANDS.find((b) => name.startsWith(`${b} `));
  const brand = multi ?? name.split(" ")[0];
  return { brand: BRAND_SPELLING[brand] ?? brand, model: name.slice(brand.length).trim() };
}

/** "2013-დან" and "2013 -დან" to 2013; "არ დაიშვება" (not allowed) to null. */
function parseYear(value: string, where: string) {
  if (value === "არ დაიშვება") return null;
  const match = /^(\d{4}) ?-დან$/.exec(value);
  if (!match) throw new Error(`Unknown year value "${value}" at ${where}`);
  return Number(match[1]);
}

type Section = {
  type: string;
  values: { title?: string; text?: string; body?: [unknown, unknown][] };
  children?: Section[];
};
type Article = { last_update: string; text_components: Section[] };

function findArticle(node: unknown): Article | null {
  if (!node || typeof node !== "object") return null;
  const article = (node as { article?: Article }).article;
  if (article?.text_components) return article;
  for (const value of Object.values(node)) {
    const found = findArticle(value);
    if (found) return found;
  }
  return null;
}

async function fetchCity(city: AutoListCity): Promise<AutoListCityData> {
  const response = await fetch(pageUrl(city), { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${pageUrl(city)} answered ${response.status}`);

  const html = await response.text();
  const json = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1];
  const article = json ? findArticle(JSON.parse(json)) : null;
  if (!article) throw new Error(`No article data in ${pageUrl(city)}: the page layout has changed`);

  const cars = new Map<string, AutoListCar>();
  const notes: Record<string, string> = {};
  const classes: string[] = [];

  for (const section of article.text_components) {
    if (section.type !== "AccordionStart") continue;
    const carClass = CLASS_BY_TITLE[clean(section.values.title)];
    if (!carClass) throw new Error(`Unknown category "${section.values.title}" in ${city}`);
    classes.push(carClass);

    for (const child of section.children ?? []) {
      if (child.type === "YTextArea") notes[carClass] = clean(child.values.text);
      if (child.type !== "Table") continue;

      for (const [rawName, rawYear] of child.values.body ?? []) {
        const name = clean(rawName);
        // A trailing * means access to the tariff goes through Yandex support.
        const viaSupport = name.endsWith("*");
        const { brand, model } = splitName(name.replace(/\*$/, "").trim());
        const year = parseYear(clean(rawYear), `${city}/${carClass}/${name}`);

        const key = `${brand} ${model}`.toLowerCase();
        const car = cars.get(key) ?? { brand, model, years: {} };
        // The page lists a few cars twice; that is only safe when both rows agree.
        if (carClass in car.years && car.years[carClass] !== year) {
          throw new Error(`Conflicting years for ${key} in ${city}/${carClass}`);
        }
        car.years[carClass] = year;
        if (viaSupport) car.viaSupport = [...new Set([...(car.viaSupport ?? []), carClass])];
        cars.set(key, car);
      }
    }
  }
  if (cars.size === 0) throw new Error(`No cars found for ${city}`);

  const sorted = [...cars.values()].sort(
    (a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model, undefined, { numeric: true }),
  );
  return { source: pageUrl(city), lastUpdate: article.last_update, classes, notes, cars: sorted };
}

/** All cities, or an error: a partial result is never returned. */
export async function fetchAutoList() {
  const result = {} as Record<AutoListCity, AutoListCityData>;
  for (const city of AUTO_LIST_CITIES) result[city] = await fetchCity(city);
  return result;
}
