const ACRONYMS = ["EMI", "GST", "UPI"]

export function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map(word => {
      const upper = word.toUpperCase()
      if (ACRONYMS.includes(upper)) return upper
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
