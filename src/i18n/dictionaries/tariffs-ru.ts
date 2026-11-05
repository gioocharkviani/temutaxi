import type { TariffsDictionary } from "./tariffs-en";

const tariffsRu: TariffsDictionary = {
  meta: {
    title: "Тарифы Yandex Go в Грузии — TemuTaxi",
    description:
      "Эконом, Комфорт, Комфорт+, Минивэн, Детский, Доставка и Грузовой: сравните тарифы Yandex Go и узнайте, какой подходит вашему авто.",
  },
  label: "Тарифы",
  title: "Тарифы Yandex Go",
  lead: "Сравните классы Yandex Go, доступные в Грузии, и узнайте, в каком тарифе может работать ваш автомобиль.",
  demoNote: "Демо-данные: цены и требования приведены для примера и будут обновлены по официальной информации.",
  filters: { all: "Все", ride: "Поездки", delivery: "Доставка" },
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
      requirements: ["Седан бизнес-класса", "Рейтинг от 4.9", "Тёмный кузов, премиальный салон"],
    },
    kids: {
      name: "Детский",
      tagline: "Поездки с детским креслом",
      cars: "Авто класса Комфорт с детским креслом",
      requirements: ["Сертифицированное детское кресло или бустер", "Рейтинг от 4.8", "Аккуратное, плавное вождение"],
    },
    delivery: {
      name: "Доставка",
      tagline: "Посылки и документы по городу",
      cars: "Легковой автомобиль или пешком",
      requirements: ["Авто, велосипед или пешком", "Смартфон с Yandex Pro", "Термосумка для заказов еды"],
    },
    cargo: {
      name: "Грузовой",
      tagline: "Мебель, техника и переезды",
      cars: "Ford Transit, Mercedes-Benz Sprinter, Hyundai Porter",
      requirements: ["Фургон или лёгкий грузовик", "Грузовой отсек от 4 м³", "Помощь с погрузкой по запросу"],
    },
  },
  cta: {
    title: "Не знаете, какой тариф подходит вашему авто?",
    body: "Отправьте нам модель и год выпуска — менеджер подскажет, какие тарифы вам доступны.",
    button: "Спросить менеджера",
  },
};

export default tariffsRu;
