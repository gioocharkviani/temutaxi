// Same 13 colours as the original form; `value` is what gets submitted.
export const carColors = [
  { id: "white", value: "თეთრი", hex: "#ffffff" },
  { id: "black", value: "შავი", hex: "#1c1c1c" },
  { id: "gray", value: "რუხი", hex: "#8c8c8c" },
  { id: "blue", value: "ლურჯი", hex: "#1f4fa8" },
  { id: "lightBlue", value: "ცისფერი", hex: "#7cc4ee" },
  { id: "red", value: "წითელი", hex: "#c8201f" },
  { id: "brown", value: "ყავისფერი", hex: "#6f4a2d" },
  { id: "beige", value: "ბეჟი", hex: "#dcc9a6" },
  { id: "yellow", value: "ყვითელი", hex: "#fce000" },
  { id: "orange", value: "ნარინჯისფერი", hex: "#f07f13" },
  { id: "green", value: "მწვანე", hex: "#2c8a45" },
  { id: "purple", value: "იისფერი", hex: "#7b3fb0" },
  { id: "pink", value: "ვარდისფერი", hex: "#ef9ac0" },
] as const;

export type CarColorId = (typeof carColors)[number]["id"];
