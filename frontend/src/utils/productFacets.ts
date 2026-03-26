import type { Product } from "@shared/models/Product";

export interface AttributeFacet {
  key: string;
  values: string[];
}

export interface CatalogFacets {
  colors: string[];
  sizes: string[];
  brands: string[];
  attributes: AttributeFacet[];
}

/** "Chave: Valor" ou "Chave : Valor" */
export function parseExtraAttributeLine(line: string): { key: string; value: string } | null {
  const t = line.trim();
  const idx = t.indexOf(":");
  if (idx <= 0) return null;
  const key = t.slice(0, idx).trim();
  const value = t.slice(idx + 1).trim();
  if (!key || !value) return null;
  return { key, value };
}

export function extractFacets(products: Product[]): CatalogFacets {
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const brandSet = new Set<string>();
  const attrMap = new Map<string, Set<string>>();

  for (const p of products) {
    p.colors?.forEach((c) => {
      const t = c.trim();
      if (t) colorSet.add(t);
    });
    p.sizes?.forEach((s) => {
      const t = s.trim();
      if (t) sizeSet.add(t);
    });
    if (p.brand?.trim()) brandSet.add(p.brand.trim());

    for (const line of p.extraAttributes ?? []) {
      const parsed = parseExtraAttributeLine(line);
      if (!parsed) continue;
      const k = parsed.key;
      if (!attrMap.has(k)) attrMap.set(k, new Set());
      attrMap.get(k)!.add(parsed.value);
    }
  }

  const attributes: AttributeFacet[] = Array.from(attrMap.entries())
    .map(([key, values]) => ({
      key,
      values: Array.from(values).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return {
    colors: Array.from(colorSet).sort((a, b) => a.localeCompare(b)),
    sizes: Array.from(sizeSet).sort((a, b) => a.localeCompare(b)),
    brands: Array.from(brandSet).sort((a, b) => a.localeCompare(b)),
    attributes,
  };
}
