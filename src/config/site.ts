export const site = {
  name: "TemuTaxi",
  domain: "temutaxi.ge",
  phone: { display: "598 16 17 16", href: "tel:+995598161716" },
  whatsapp: { display: "598 16 17 16", href: "https://wa.me/995598161716" },
  email: "info@temutaxi.ge",
  company: {
    name: "LLC ბასტეტ",
    id: "406571516",
    address: "41 David Guramishvili Ave, Tbilisi 0178, Georgia",
  },
  copyrightYear: 2026,
  services: ["Yandex Taxi", "Yandex Go", "Yandex Pro"],
  yandexPro: {
    ios: "https://apps.apple.com/app/yandex-pro/id1496904594",
    android:
      "https://play.google.com/store/apps/details?id=ru.yandex.taximeter",
  },
} as const;
