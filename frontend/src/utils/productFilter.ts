import type { Product } from "@shared/models/Product";
import { parseExtraAttributeLine } from "./productFacets";

export interface CatalogFilterState {
  search: string;
  categorySlugs: string[];
  colors: string[];
  sizes: string[];
  brands: string[];
  /** chave -> valores selecionados */
  attributeValues: Record<string, string[]>;
  
  minPrice?: number | null;
  maxPrice?: number | null;
}

export function emptyFilterState(): CatalogFilterState {
  return {
    search: "",
    categorySlugs: [],
    colors: [],
    sizes: [],
    brands: [],
    attributeValues: {},
    minPrice: null,
    maxPrice: null,
  };
}

function matchesCategory(product: Product, slug: string, matcher: (p: Product, s: string) => boolean): boolean {
  return matcher(product, slug);
}

export function filterProducts(
  products: Product[],
  f: CatalogFilterState,
  categoryMatcher: (p: Product, slug: string) => boolean
): Product[] {
  return products.filter((p) => {
    if (f.search.trim()) {
      const q = f.search.trim().toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }

    if (f.categorySlugs.length > 0) {
      const ok = f.categorySlugs.some((slug) => matchesCategory(p, slug, categoryMatcher));
      if (!ok) return false;
    }

    if (f.colors.length > 0) {
      const cols = (p.colors ?? []).map((c) => c.toLowerCase());
      const wanted = f.colors.map((c) => c.toLowerCase());
      if (!wanted.some((w) => cols.includes(w))) return false;
    }

    if (f.sizes.length > 0) {
      const sz = (p.sizes ?? []).map((s) => s.toUpperCase());
      const wanted = f.sizes.map((s) => s.toUpperCase());
      if (!wanted.some((w) => sz.includes(w))) return false;
    }

    if (f.brands.length > 0) {
      const b = (p.brand ?? "").trim();
      if (!b || !f.brands.some((fb) => fb.toLowerCase() === b.toLowerCase())) return false;
    }

    for (const [attrKey, selectedVals] of Object.entries(f.attributeValues)) {
      if (!selectedVals?.length) continue;
      const lines = p.extraAttributes ?? [];
      const parsed = lines
        .map((l) => parseExtraAttributeLine(l))
        .filter((x): x is { key: string; value: string } => !!x && x.key === attrKey);
      const values = parsed.map((x) => x.value);
      if (!selectedVals.some((sv) => values.some((v) => v.toLowerCase() === sv.toLowerCase()))) {
        return false;
      }
    }
    
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;

    return true;
  });
}
