const carCheckEn = {
  label: "Check your car",
  title: "Which tariff can your car work in?",
  lead: "Choose the brand, model and year — we’ll show which Yandex Go categories your car qualifies for.",
  brand: "Brand",
  model: "Model",
  year: "Year",
  brandPlaceholder: "Choose brand",
  modelPlaceholder: "Choose model",
  yearPlaceholder: "Choose year",
  emptyTitle: "Pick your car",
  emptyBody: "Fill in all three fields and the result will appear here.",
  /** {n} and {total} are replaced */
  resultCount: "Available tariffs: {n} of {total}",
  available: "Available",
  /** {year} is replaced */
  fromYear: "From {year}",
  notForModel: "Not for this model",
  noneTitle: "This year doesn’t qualify for any tariff yet",
  noneBody: "Message us — a manager will help you find an option.",
  register: "Register",
  askManager: "Ask a manager",
  notFound: "Can’t find your car?",
  reset: "Reset",
  allTariffs: "All tariffs",
  demoNote: "Demo list — will be updated with official data.",
};

export type CarCheckDictionary = typeof carCheckEn;
export default carCheckEn;
