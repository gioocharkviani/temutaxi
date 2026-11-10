const privacyEn = {
  meta: {
    title: "Privacy policy — TemuTaxi",
    description: "How TemuTaxi collects, uses and protects the personal data of drivers and website visitors.",
  },
  label: "Legal",
  title: "Privacy policy",
  contents: "On this page",
  updatedLabel: "Last updated",
  updated: "7 November 2026",
  intro:
    "This policy explains what personal data temutaxi.ge collects when you use the website or apply to become a taxi driver, why we use it, who receives it, and what rights you have.",
  sections: [
    {
      title: "1. Who is responsible for your data",
      paragraphs: [
        "The website is operated by {company} (company ID {companyId}), {address}. It is an official partner of Yandex Go in Georgia, but it is not the official website of Yandex Go.",
      ],
    },
    {
      title: "2. What data we collect",
      paragraphs: ["When you submit the registration form, we receive the data you enter:"],
      list: [
        "Full name, phone number and city of work",
        "Driving licence number, date of issue and expiry date",
        "Car brand, model, year, colour, plate number and VIN code",
        "The tariff you choose and your consent",
        "The referrer's phone number, if you enter one. It is kept by us only and is not sent to Yandex",
      ],
      after: "We do not ask you to upload photos of documents on this form.",
    },
    {
      title: "3. Why we use it",
      paragraphs: ["We use this data on the basis of your consent, and to take the steps you ask for before you start working with the park:"],
      list: [
        "To create your driver profile in Yandex Fleet",
        "To contact you about your application",
        "To check which tariffs your car qualifies for",
      ],
    },
    {
      title: "4. Who receives your data",
      paragraphs: [
        "Your application is sent to Yandex Go through the Yandex Fleet service, which is needed to create your driver profile. Yandex processes it under its own terms and privacy policy.",
        "Our hosting and database providers process data on our behalf so that the website can work. We do not sell personal data or use it for advertising.",
      ],
    },
    {
      title: "5. Driver leaderboard",
      paragraphs: [
        "The website may show a leaderboard of the park's drivers, based on completed orders from Yandex Fleet. The leaderboard is updated on a regular schedule. For each driver we store only what the leaderboard and its search need: the driver's identifier and full name, the number of completed orders per tariff in the leaderboard period, the time of the latest order and, if Yandex provides it, the phone number. The phone number is used only for search and is never shown on the site. We do not store individual orders, and each update replaces the previous figures.",
        "The public pages show only the name in the form the park has chosen and the number of orders. Anyone can search the leaderboard by name or full phone number, and a match shows the driver's place in that same form. A driver can ask to be removed from the leaderboard at any time using the contacts below.",
      ],
    },
    {
      title: "6. How long we keep data",
      paragraphs: [
        "Submitted applications are stored in our database, where only authorised administrators can see them, and passed to Yandex Fleet. We keep them for as long as they are needed for your application and the park's work with you, or as required by law. You can ask us to delete yours at any time.",
        "Leaderboard data is kept while it is needed for the leaderboard. Technical server logs are kept for a limited time and are used only to find and fix errors.",
      ],
    },
    {
      title: "7. Cookies",
      paragraphs: ["The website uses only the cookies it needs to work. We do not use advertising or analytics cookies."],
      list: [
        "Language: remembers the language you chose, for one year",
        "Admin session: keeps administrators signed in to the admin panel, for up to 12 hours",
      ],
    },
    {
      title: "8. Your rights",
      paragraphs: [
        "You can ask us to tell you what data we hold about you, give you a copy, correct or delete it, or limit how it is used. You can withdraw your consent at any time; this does not affect processing that took place before.",
        "You can also complain to the Personal Data Protection Service of Georgia.",
      ],
    },
    {
      title: "9. How to contact us",
      paragraphs: ["For any question about your data or to use your rights, write to {email} or call {phone}."],
    },
    {
      title: "10. Changes to this policy",
      paragraphs: ["If this policy changes, we will publish the new version on this page and update the date above."],
    },
  ],
};

export type PrivacyDictionary = typeof privacyEn;
export default privacyEn;
