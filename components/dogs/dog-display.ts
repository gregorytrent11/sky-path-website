import type { Dog, DogAgeCategory, DogSize } from "@/types/database";

export function ageCategoryLabel(value: DogAgeCategory | null): string | null {
  switch (value) {
    case "puppy":
      return "Puppy";
    case "young":
      return "Young";
    case "adult":
      return "Adult";
    case "senior":
      return "Senior";
    default:
      return null;
  }
}

export function sizeLabel(value: DogSize | null): string | null {
  switch (value) {
    case "small":
      return "Small";
    case "medium":
      return "Medium";
    case "large":
      return "Large";
    case "xlarge":
      return "Extra Large";
    default:
      return null;
  }
}

export function dogSummaryLine(dog: Pick<Dog, "breed" | "age_category" | "sex" | "size">): string {
  const parts = [
    dog.breed,
    ageCategoryLabel(dog.age_category),
    dog.sex && dog.sex !== "unknown" ? (dog.sex === "male" ? "Male" : "Female") : null,
    sizeLabel(dog.size),
  ].filter(Boolean);
  return parts.join(" · ");
}

export function compatibilityBadges(
  dog: Pick<Dog, "good_with_kids" | "good_with_dogs" | "good_with_cats" | "house_trained">
): string[] {
  const badges: string[] = [];
  if (dog.good_with_kids) badges.push("Good with kids");
  if (dog.good_with_dogs) badges.push("Good with dogs");
  if (dog.good_with_cats) badges.push("Good with cats");
  if (dog.house_trained) badges.push("House trained");
  return badges;
}
