const adjectives = [
  "Groovy",
  "Funky",
  "Smooth",
  "Jazzy",
  "Rockin",
  "Epic",
  "Wild",
  "Cool",
  "Rad",
  "Chill",
  "Sick",
  "Dope",
  "Fresh",
  "Lit",
  "Fire",
  "Beast",
  "Legend",
  "Boss",
  "Ninja",
  "Wizard",
]

const nouns = [
  "Penguin",
  "Dolphin",
  "Tiger",
  "Eagle",
  "Wolf",
  "Fox",
  "Bear",
  "Lion",
  "Shark",
  "Dragon",
  "Phoenix",
  "Unicorn",
  "Panda",
  "Koala",
  "Sloth",
  "Owl",
  "Raven",
  "Falcon",
  "Jaguar",
  "Panther",
]

export function generateFunnyName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective} ${noun}`
}

export function getFunnyNameForFingerprint(fingerprint: string): string {
  const seed = fingerprint.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const adjIndex = seed % adjectives.length
  const nounIndex = Math.floor(seed / adjectives.length) % nouns.length
  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`
}

