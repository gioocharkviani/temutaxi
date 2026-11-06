// The rating texts an admin can edit. These defaults apply until an admin saves their own.
// In `rules`: "# " starts a heading, "- " a list item, and a blank line a new paragraph.

import type { RatingContent, RatingSettings, RatingText } from "@/db/entities";
import type { Locale } from "@/i18n/config";

export const DEFAULT_RATING_CONTENT: RatingContent = {
  ka: {
    landingTitle: "რეიტინგის პირობები",
    landingText: "თითო დასრულებული შეკვეთა ერთხელ ითვლება. თანაბარი რაოდენობისას წინ ის არის, ვინც ეს რაოდენობა პირველმა შეაგროვა.",
    pageTitle: "მძღოლების რეიტინგი",
    rules: `# როგორ ითვლება
- რეიტინგი ეფუძნება პარკის დასრულებულ შეკვეთებს, რომლებიც Yandex-იდან მოდის.
- თითო დასრულებული შეკვეთა ერთხელ ითვლება.
- ითვლება მხოლოდ ტაქსის შეკვეთები. მიტანა რეიტინგში არ შედის.

# ადგილების განაწილება
- წინ ის მძღოლია, ვისაც პერიოდში მეტი შეკვეთა აქვს.
- თანაბარი რაოდენობისას წინ ის არის, ვინც ეს რაოდენობა პირველმა შეაგროვა.

# თქვენი ადგილი
თუ ტოპში არ ხართ, თქვენი ადგილი ძიებით იპოვეთ: ჩაწერეთ სახელი ან გვარი.

# რა მონაცემებს ვინახავთ
რეიტინგისა და ძიებისთვის თითოეულ მძღოლზე ვინახავთ მხოლოდ:
- მძღოლის იდენტიფიკატორს Yandex-ში
- სახელსა და გვარს
- პერიოდში დასრულებული შეკვეთების რაოდენობას ტარიფების მიხედვით
- ბოლო შეკვეთის დროს

ცალკეულ შეკვეთებს, მარშრუტებს, შემოსავალსა და ტელეფონის ნომერს რეიტინგისთვის არ ვინახავთ. ყოველი განახლება წინა მონაცემებს ანაცვლებს. მძღოლს შეუძლია მოითხოვოს რეიტინგიდან ამოღება.`,
  },
  en: {
    landingTitle: "Rating conditions",
    landingText: "Each completed order counts once. With equal counts, the driver who reached that count first ranks higher.",
    pageTitle: "Driver rating",
    rules: `# How it is counted
- The rating is based on the park's completed orders, received from Yandex.
- Each completed order counts once.
- Only taxi orders count. Delivery is not included.

# How places are decided
- The driver with more orders in the period ranks higher.
- With equal counts, the driver who reached that count first ranks higher.

# Your place
If you are not in the top, find your place with the search: enter your name or surname.

# What data we store
For the rating and its search, we store only this for each driver:
- The driver's identifier in Yandex
- Name and surname
- The number of completed orders per tariff in the period
- The time of the latest order

We do not store individual orders, routes, earnings or phone numbers for the rating. Each update replaces the previous figures. A driver can ask to be removed from the rating.`,
  },
  ru: {
    landingTitle: "Условия рейтинга",
    landingText: "Каждый завершённый заказ считается один раз. При равном количестве выше тот, кто набрал его раньше.",
    pageTitle: "Рейтинг водителей",
    rules: `# Как считается
- Рейтинг основан на завершённых заказах парка, которые поступают из Яндекса.
- Каждый завершённый заказ считается один раз.
- Считаются только заказы такси. Доставка не учитывается.

# Как распределяются места
- Выше водитель, у которого больше заказов за период.
- При равном количестве выше тот, кто набрал его раньше.

# Ваше место
Если вас нет в топе, найдите своё место через поиск: введите имя или фамилию.

# Какие данные мы храним
Для рейтинга и поиска по каждому водителю мы храним только:
- Идентификатор водителя в Яндексе
- Имя и фамилию
- Количество завершённых заказов по тарифам за период
- Время последнего заказа

Отдельные заказы, маршруты, доход и номера телефонов для рейтинга мы не храним. Каждое обновление заменяет прежние данные. Водитель может попросить убрать его из рейтинга.`,
  },
};

export function getRatingText(settings: Pick<RatingSettings, "content">, lang: Locale): RatingText {
  return settings.content?.[lang] ?? DEFAULT_RATING_CONTENT[lang];
}
