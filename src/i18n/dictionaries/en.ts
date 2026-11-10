import type { PluralForms } from "../plural";

const en = {
  meta: {
    title: "Register as a Yandex Taxi Driver in Georgia Online — TemuTaxi",
    description:
      "Register online as a taxi driver with Yandex Taxi, Yandex Go and Yandex Pro in Tbilisi, Batumi and across Georgia. Check your car and tariff.",
  },
  nav: {
    skip: "Skip to content",
    roles: "Who it’s for",
    benefits: "Why us",
    steps: "How it works",
    faq: "FAQ",
    contact: "Contact",
    register: "Register",
    tariffs: "Tariffs",
    rating: "Leaderboard",
    referral: "Referral link",
    download: "Download the app",
    menu: "Open menu",
    close: "Close menu",
    language: "Language",
  },
  hero: {
    badge: "Official Yandex partner in Georgia",
    title: "Drive with Yandex.",
    titleAccent: "Start online today.",
    lead: "Fast online registration for taxi drivers in Yandex Taxi, Yandex Go and Yandex Pro — in Tbilisi, Batumi and across Georgia.",
    primary: "Start registration",
    secondary: "Talk to a manager",
    stats: [
      { value: "24/7", label: "Online application" },
      { value: "5", label: "Simple steps" },
      { value: "GE", label: "All of Georgia" },
      { value: "24/7", label: "Cash out" },
    ],
    card: {
      title: "Your application",
      status: "In progress",
      items: ["Application submitted", "Details checked", "Ready to work"],
      note: "We help at every stage — from the form to final approval.",
    },
  },
  services: { label: "Registration in" },
  roles: {
    label: "Who it’s for",
    title: "Become a taxi driver with an official partner",
    drivers: {
      tag: "For drivers",
      title: "Drive with Yandex Taxi & Yandex Go",
      body: "Submit your application online, complete verification and get support from our team.",
      points: [
        "Yandex Taxi, Yandex Go, Yandex Pro",
        "Tbilisi, Batumi and all of Georgia",
        "Smooth process with an official partner",
      ],
      cta: "Register as a driver",
    },
  },
  benefits: {
    label: "Why TemuTaxi",
    title: "Why people choose TemuTaxi",
    items: [
      {
        title: "Fully online",
        body: "Apply from your phone, tablet or computer — no extra bureaucracy.",
      },
      {
        title: "Fast start",
        body: "If your details are correct, registration is usually completed quickly.",
      },
      {
        title: "Personal support",
        body: "Our office and WhatsApp manager help you through every step.",
      },
      {
        title: "All of Georgia",
        body: "Registration is available in Tbilisi, Batumi and across the country.",
      },
      {
        title: "Bonuses & promos",
        body: "Get up-to-date information about bonuses and special offers.",
      },
      {
        title: "Official partner",
        body: "Work with an official Yandex partner you can rely on.",
      },
    ],
  },
  rating: {
    label: "Driver leaderboard",
    periodLabel: "Period",
    rollingPeriod: {
      one: "Last {n} day",
      other: "Last {n} days",
    } as PluralForms,
    minOrdersLabel: "Minimum orders",
    updated: "Updated: {time}",
    orders: { one: "order", other: "orders" } as PluralForms,
    cta: "Join the park",
    details: "Full leaderboard and conditions",
    unavailable:
      "The leaderboard is temporarily unavailable. Please try again shortly.",
    empty: "There are no results for this period yet.",
    loading: "Loading the leaderboard",
    metaTitle: "Taxi Driver Leaderboard and Conditions — TemuTaxi",
    metaDescription:
      "The park's top drivers, the full leaderboard rules, and a search to find your own place.",
    topTitle: "Top {n}",
    searchTitle: "Find your place",
    searchLead:
      "Not in the top? Start typing your name or surname and your place and orders appear straight away.",
    searchLeadPhone:
      "Not in the top? Start typing your name, surname or full phone number and your place and orders appear straight away.",
    searchLabelPhone: "Name, surname or phone",
    searchPlaceholderPhone: "Name, surname or phone",
    searchPhoneShort: "Enter the full phone number: 9 digits.",
    searching: "Searching…",
    searchLabel: "Name or surname",
    searchPlaceholder: "Name or surname",
    searchButton: "Search",
    searchTooShort: "Enter at least {n} letters.",
    searchEmpty: "No driver with this name was found in the current period.",
    searchMore:
      "Showing the first {n} matches. Enter your full name to narrow them down.",
    place: "place",
    inTop: "In the top {n}",
    rulesTitle: "Rules and conditions",
  },
  steps: {
    label: "How it works",
    title: "Register online in 5 steps",
    items: [
      "Enter your personal and contact details",
      "Add your driving licence details",
      "Enter your car details",
      "Choose a tariff and send the application",
      "Wait for our manager’s call and start driving",
    ],
  },
  bonuses: {
    label: "Bonuses",
    title: "Bonuses and special offers",
    body: "TemuTaxi regularly shares bonuses, promotions and special offers with drivers. After registration our team will keep you up to date.",
    cta: "Ask about bonuses",
  },
  faq: {
    label: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        q: "How long does registration take?",
        a: "If all information is filled in correctly, registration is usually completed quickly.",
      },
      {
        q: "Can I register from my phone?",
        a: "Yes, you can submit your application from your phone, tablet or computer.",
      },
      {
        q: "Is TemuTaxi an official Yandex partner?",
        a: "Yes, TemuTaxi is an official Yandex partner in Georgia and helps drivers complete registration.",
      },
      {
        q: "Is registration available only in Batumi?",
        a: "No. Registration is available in Tbilisi, Batumi and across Georgia.",
      },
      {
        q: "Can I register in Yandex Pro?",
        a: "Yes, TemuTaxi helps with registration in Yandex Pro, as well as Yandex Taxi and Yandex Go.",
      },
      {
        q: "Can a taxi drive in the bus lane?",
        a: "In Tbilisi, it depends on the taxi’s permit category. A Category A taxi can pick up and drop off passengers in the bus lane, and under a 2023 City Hall decision, a Category A car under 10 years old with a special sticker can also drive in it. A Category B taxi does not have this right. Registering with Yandex or TemuTaxi does not give the right to use the bus lane. Check the current conditions with Tbilisi City Hall: taxi.tbilisi.gov.ge.",
      },
      {
        q: "What is the fine for driving in a bus lane without the right?",
        a: "According to published information on the changes in force from 1 May 2026: driving in a bus lane is fined 100 GEL and 15 penalty points, or 150 GEL and 30 points for a repeat offence. Driving, stopping or parking in an oncoming bus lane is fined 200 GEL and 20 points, or 300 GEL and 30 points for a repeat offence. Amounts can change, so check official sources.",
      },
    ],
  },
  contact: {
    label: "Contact",
    title: "Have a question? We’re here to help",
    note: "Registration is available in Tbilisi, Batumi and across Georgia.",
    office: "Office number",
    whatsapp: "WhatsApp manager",
    email: "Email",
  },
  cta: {
    title: "Start working with TemuTaxi",
    body: "Submit your application now — fast registration in Yandex Taxi, Yandex Go and Yandex Pro.",
    button: "Register now",
  },
  apps: {
    title: "Download Yandex Pro",
    body: "The driver app where you receive orders.",
    appStore: "Download on the",
    googlePlay: "Get it on",
  },
  promo: {
    close: "Close",
  },
  referral: {
    metaTitle: "Referral link for drivers — TemuTaxi",
    metaDescription: "Create a referral link and QR code and invite drivers to TemuTaxi.",
    label: "For drivers",
    title: "Invite a driver with your referral link",
    lead: "Enter the phone number you work with in our park and get a link and a QR code. Anyone who registers through them is marked in our system as your referral.",
    phoneLabel: "Your phone number",
    phoneHint: "The number you use in Yandex Pro in our park.",
    generate: "Create link",
    generating: "Checking…",
    invalid: "Enter a valid Georgian mobile number: 5XX XX XX XX.",
    notDriver: "This number was not found among our park's drivers. Check the number or contact us.",
    tooMany: "Too many attempts. Please try again in a few minutes.",
    failed: "The link could not be created. Please try again.",
    verified: "The number belongs to a driver of our park",
    notVerified: "Link created",
    linkLabel: "Your referral link",
    copy: "Copy",
    copied: "Copied",
    qrAlt: "QR code with the referral link",
    downloadQr: "Download QR code",
    share: "Share",
    shareText: "Register as a taxi driver with TemuTaxi through my link:",
    emptyResult: "Your link and QR code will appear here after you enter your number.",
    steps: [
      "Create the link or QR code and share it with a driver.",
      "The driver opens the link: your number is filled in on the registration form.",
      "The application is stored with us as your referral. This is not sent to Yandex.",
    ],
  },
  footer: {
    tagline: "Official Yandex partner in Georgia for taxi driver registration.",
    disclaimer:
      "This website is operated by Company LLC and is not the official website of Yandex Go.",
    policy: "Privacy policy",
    rights: "All rights reserved.",
    madeBy: "Website by",
    navTitle: "Navigation",
    contactTitle: "Contact",
  },
};

export type Dictionary = typeof en;
export default en;
