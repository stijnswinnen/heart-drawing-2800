export const slugify = (input: string): string => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export interface SlugifiableLocation {
  id: string;
  name: string;
}

export const buildSlugMap = <T extends SlugifiableLocation>(
  items: T[]
): Map<string, string> => {
  const used = new Map<string, number>();
  const result = new Map<string, string>();
  // Stable order by id to keep slug suffixes deterministic
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id));
  for (const item of sorted) {
    const base = slugify(item.name) || "plek";
    const count = used.get(base) || 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    used.set(base, count + 1);
    result.set(item.id, slug);
  }
  return result;
};
