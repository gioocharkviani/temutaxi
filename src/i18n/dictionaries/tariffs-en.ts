const tariffsEn = {
  meta: {
    title: "Yandex Go Tariffs and Car List in Georgia — TemuTaxi",
    description: "Which tariff can your car work in? Economy, Comfort, Comfort+, Electric, Minivan, Business and Child tariffs, from the official Yandex Pro list.",
  },
  label: "Tariffs",
  title: "Yandex Go tariffs",
  lead: "Compare the Yandex Go classes available in Georgia and find out which tariff your car qualifies for.",
  sourceNote: "From the official Yandex Pro list. Only cars with 4 or more doors qualify, and age is counted from the date in the registration certificate. The final decision on every car is made by Yandex Go.",
  labels: {
    popular: "Popular",
    from: "Start fare",
    perKm: "Per km",
    perMin: "Per minute",
    freeWait: "Free waiting",
    paidWait: "Paid waiting",
    seats: "Seats",
    minYear: "Car year",
    examples: "Example cars",
    requirements: "Driver requirements",
    minutes: "min",
    perMinShort: "/min",
    compareLabel: "Compare",
    compareTitle: "All tariffs side by side",
    tariff: "Tariff",
    none: "—",
    register: "Join this tariff",
  },
  models: {
    // Conditions stated on the official Yandex Pro page.
    notes: { electro: "Only fully electric cars qualify. Some models are admitted through Yandex support.", business: "Car colour: black or white." },
    label: "Car lists",
    title: "Which cars fit each tariff",
    lead: "Open a category to see the brands and models that qualify, with the minimum production year.",
    brandModel: "Brand and model",
    year: "Production year",
    /** {year} is replaced */
    fromYear: "from {year}",
    /** {n} is replaced */
    count: "{n} models",
    search: "Search brand or model",
    noResults: "Nothing found",
  },
  items: {
    economy: {
      name: "Economy",
      tagline: "Everyday rides at the best price",
      cars: "Toyota Prius, Hyundai Elantra, Kia Rio",
      requirements: ["Any 4-door sedan or hatchback", "Air conditioning", "Clean and tidy interior"],
    },
    comfort: {
      name: "Comfort",
      tagline: "Newer cars with more legroom",
      cars: "Toyota Camry, Hyundai Sonata, Kia K5",
      requirements: ["Mid-size sedan", "Rating 4.7 or higher", "Climate control"],
    },
    comfortPlus: {
      name: "Comfort+",
      tagline: "Spacious premium sedans",
      cars: "Toyota Camry (new), Kia K8, Mercedes-Benz E-Class",
      requirements: ["Premium sedan", "Rating 4.8 or higher", "Leather or premium interior"],
    },
    electro: {
      name: "Electro",
      tagline: "Quiet, zero-emission electric cars",
      cars: "Tesla Model 3, Hyundai Ioniq 5, Kia EV6",
      requirements: ["Fully electric car", "Battery range from 300 km", "Rating 4.7 or higher"],
    },
    minivan: {
      name: "Minivan",
      tagline: "Up to 6 passengers and luggage",
      cars: "Toyota Sienna, Honda Odyssey, Mercedes-Benz Vito",
      requirements: ["6+ passenger seats", "Large luggage space", "Sliding or wide doors"],
    },
    business: {
      name: "Business",
      tagline: "Executive cars for important trips",
      cars: "Mercedes-Benz E-Class, BMW 5er, Lexus ES",
      requirements: ["Executive-class sedan", "Rating 4.9 or higher", "Dark exterior, premium interior"],
    },
    kids: {
      name: "Kids",
      tagline: "Rides with a child seat",
      cars: "Comfort-class cars with a child seat",
      requirements: ["Certified child seat or booster", "Rating 4.8 or higher", "Careful, smooth driving"],
    },
  },
  cta: {
    title: "Not sure which tariff fits your car?",
    body: "Send us your car model and year — our manager will tell you which tariffs are available to you.",
    button: "Ask a manager",
  },
};

export type TariffsDictionary = typeof tariffsEn;
export default tariffsEn;
