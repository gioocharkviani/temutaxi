import type { CarCheckDictionary } from "./carcheck-en";

const carCheckRu: CarCheckDictionary = {
  label: "Проверьте авто",
  title: "В каком тарифе может работать ваш автомобиль?",
  lead: "Выберите марку, модель и год выпуска — покажем, каким категориям Yandex Go соответствует ваш автомобиль.",
  brand: "Марка",
  model: "Модель",
  year: "Год выпуска",
  brandPlaceholder: "Toyota",
  modelPlaceholder: "Prius",
  yearPlaceholder: "2016",
  emptyTitle: "Выберите автомобиль",
  emptyBody: "Заполните все три поля, и результат появится здесь.",
  resultCount: "Доступно тарифов: {n} из {total}",
  available: "Доступен",
  fromYear: "С {year} года",
  notForModel: "Недоступен для модели",
  noneTitle: "Автомобиль этого года пока не подходит ни под один тариф",
  noneBody: "Напишите нам — менеджер поможет подобрать вариант.",
  register: "Регистрация",
  askManager: "Спросить менеджера",
  notFound: "Не нашли свой автомобиль?",
  reset: "Сбросить",
  allTariffs: "Все тарифы",
  demoNote: "Демо-список — будет обновлён по официальным данным.",
};

export default carCheckRu;
