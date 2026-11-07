import type { TariffsDictionary } from "./tariffs-en";

const tariffsRu: TariffsDictionary = {
  meta: {
    title: "Тарифы Yandex Go и список автомобилей в Грузии — TemuTaxi",
    description: "На каком тарифе может работать ваш автомобиль? Эконом, Комфорт, Комфорт+, Электро, Минивэн, Бизнес и Детский тариф по официальному списку Yandex Pro.",
  },
  label: "Тарифы",
  title: "Тарифы Yandex Go",
  lead: "Сравните классы Yandex Go, доступные в Грузии, и узнайте, в каком тарифе может работать ваш автомобиль.",
  sourceNote: "Данные из официального списка Yandex Pro. Допускаются только автомобили с 4 и более дверьми, а возраст считается по дате в техпаспорте. Окончательное решение по каждому автомобилю принимает Yandex Go.",
  labels: {
    popular: "Популярный",
    from: "Подача",
    perKm: "За км",
    perMin: "За минуту",
    freeWait: "Бесплатное ожидание",
    paidWait: "Платное ожидание",
    seats: "Мест",
    minYear: "Год авто",
    examples: "Примеры авто",
    requirements: "Требования к водителю",
    minutes: "мин",
    perMinShort: "/мин",
    compareLabel: "Сравнение",
    compareTitle: "Все тарифы рядом",
    tariff: "Тариф",
    none: "—",
    register: "Работать в тарифе",
  },
  models: {
    // Conditions stated on the official Yandex Pro page.
    notes: { electro: "Допускаются только электромобили. Для некоторых моделей допуск оформляется через службу поддержки.", business: "Цвет автомобиля: чёрный или белый." },
    label: "Списки авто",
    title: "Какие автомобили подходят для каждого тарифа",
    lead: "Откройте категорию, чтобы увидеть подходящие марки и модели с минимальным годом выпуска.",
    brandModel: "Марка и модель",
    year: "Год выпуска",
    fromYear: "с {year}",
    count: "Моделей: {n}",
    search: "Поиск марки или модели",
    noResults: "Ничего не найдено",
  },
  items: {
    economy: {
      name: "Эконом",
      tagline: "Повседневные поездки по лучшей цене",
      cars: "Toyota Prius, Hyundai Elantra, Kia Rio",
      requirements: ["Любой 4-дверный седан или хэтчбек", "Кондиционер", "Чистый и опрятный салон"],
    },
    comfort: {
      name: "Комфорт",
      tagline: "Более новые авто с простором для ног",
      cars: "Toyota Camry, Hyundai Sonata, Kia K5",
      requirements: ["Седан среднего класса", "Рейтинг от 4.7", "Климат-контроль"],
    },
    comfortPlus: {
      name: "Комфорт+",
      tagline: "Просторные премиальные седаны",
      cars: "Toyota Camry (новая), Kia K8, Mercedes-Benz E-Class",
      requirements: ["Премиальный седан", "Рейтинг от 4.8", "Кожаный или премиальный салон"],
    },
    electro: {
      name: "Электро",
      tagline: "Тихие электромобили без выбросов",
      cars: "Tesla Model 3, Hyundai Ioniq 5, Kia EV6",
      requirements: ["Полностью электрический автомобиль", "Запас хода от 300 км", "Рейтинг от 4.7"],
    },
    minivan: {
      name: "Минивэн",
      tagline: "До 6 пассажиров и багаж",
      cars: "Toyota Sienna, Honda Odyssey, Mercedes-Benz Vito",
      requirements: ["6+ пассажирских мест", "Большой багажник", "Сдвижные или широкие двери"],
    },
    business: {
      name: "Бизнес",
      tagline: "Автомобили представительского класса",
      cars: "Mercedes-Benz E-Class, BMW 5er, Lexus ES",
      requirements: ["Седан бизнес-класса", "Рейтинг от 4.9", "Чёрный или белый кузов, премиальный салон"],
    },
    kids: {
      name: "Детский",
      tagline: "Поездки с детским креслом",
      cars: "Авто класса Комфорт с детским креслом",
      requirements: ["Сертифицированное детское кресло или бустер", "Рейтинг от 4.8", "Аккуратное, плавное вождение"],
    },
  },
  cta: {
    title: "Не знаете, какой тариф подходит вашему авто?",
    body: "Отправьте нам модель и год выпуска — менеджер подскажет, какие тарифы вам доступны.",
    button: "Спросить менеджера",
  },
};

export default tariffsRu;
