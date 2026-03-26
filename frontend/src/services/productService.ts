import type { Category } from "@shared/models/Category";
import type { Product } from "@shared/models/Product";
import { idFromString } from "@shared/utils/hashId";
import { categoryService } from "./categoryService";
import { STORAGE } from "./storageKeys";

const API = "https://dummyjson.com/products";

interface DummyProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  thumbnail?: string;
  brand?: string;
  stock?: number;
  category: string;
}

interface DummyListResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

function mapDummy(p: DummyProduct): Product {
  const categoryTitle = p.category;

  const category: Category = {
    id: idFromString(categoryTitle),
    title: categoryTitle,
  };

  const cat = p.category.toLowerCase();

  // 🎨 CORES (melhoradas)
  const colors = getColors(cat, p.id);

  // 📏 TAMANHOS
  const sizes = getSizes(cat);

  // 🧵 MATERIAL
  const material =
    cat.includes("shirt") || cat.includes("mens") || cat.includes("womens")
      ? "Algodão"
      : cat.includes("furniture")
      ? "Madeira"
      : cat.includes("electronics")
      ? "Metal"
      : "Sintético";

  // 👤 TIPO
  const tipo =
    cat.includes("shirt") ? "Camiseta" :
    cat.includes("shoes") ? "Calçado" :
    "Geral";

  // 🚻 GÊNERO (pode ser igual ao tipo)
  const genero = 
  cat.includes("womens") ? "Feminino" :
  cat.includes("mens") ? "Masculino" :
  "Unissex";

  return {
    id: p.id,
    name: p.title,
    price: p.price,
    category,
    thumbnail: p.thumbnail,
    description: p.description,
    brand: p.brand,
    stock: p.stock,

    colors,
    sizes,

    extraAttributes: [
      //`Categoria: ${categoryTitle}`,

      ...(p.brand ? [`Marca: ${p.brand}`] : []),

      `Faixa de Preço: ${getPriceRange(p.price)}`,
      `Material: ${material}`,
      `Tipo: ${tipo}`,
      `Gênero: ${genero}`,
    ],
  };
}

function getColors(category: string, id: number): string[] {
  if (category.includes("beauty")) return ["pink", "red"];
  if (category.includes("fragrance")) return ["black", "white"];
  if (category.includes("furniture")) return ["brown", "beige"];
  if (category.includes("groceries")) return ["green", "yellow"];
  if (category.includes("mens")) return ["black", "blue"];
  if (category.includes("womens")) return ["pink", "white"];
  if (category.includes("electronics")) return ["black", "gray"];

  // fallback com variação
  const palette = ["black", "white", "red", "blue", "green", "yellow", "orange", "purple", "pink", "gray", "brown", "gold", "silver"]
  return [palette[id % palette.length]];
}

function getSizes(category: string): string[] {
  if (category.includes("mens") || category.includes("womens")) {
    return ["P", "M", "G", "GG"];
  }

  if (category.includes("shoes")) {
    return ["38", "39", "40", "41", "42"];
  }

  return [];
}

function getPriceRange(price: number): string {
  if (price <= 100) return "0-100";
  if (price <= 500) return "100-500";
  if (price <= 1000) return "500-1000";
  return "1000+";
}

function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProducts(products: Product[]): void {
  localStorage.setItem(STORAGE.LOCAL_PRODUCTS, JSON.stringify(products));
}

function nextLocalId(): number {
  const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCT_SEQ);
  const current = raw ? Number(raw) : 1_000_000;
  const next = current + 1;
  localStorage.setItem(STORAGE.LOCAL_PRODUCT_SEQ, String(next));
  return next;
}

function matchesCategoryFilter(product: Product, categorySlug: string): boolean {
  const slug = categorySlug.toLowerCase().trim();
  const localCat = categoryService.getBySlug(slug);
  if (localCat && product.categoryId) {
    return product.categoryId === localCat.id;
  }
  const t = product.category.title.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
  return t === slug || product.category.title.toLowerCase() === slug;
}

export function matchesProductCategorySlug(product: Product, categorySlug: string): boolean {
  return matchesCategoryFilter(product, categorySlug);
}

export const productService = {
  async fetchPage(params?: {
    limit?: number;
    skip?: number;
    categorySlug?: string;
  }): Promise<{
    products: Product[];
    total: number;
  }> {
    const limit = params?.limit ?? 30;
    const skip = params?.skip ?? 0;
    let url = `${API}?limit=${limit}&skip=${skip}`;
    if (params?.categorySlug) {
      url += `&category=${encodeURIComponent(params.categorySlug)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao carregar produtos.");
    const data = (await res.json()) as DummyListResponse;
    return {
      products: data.products.map(mapDummy),
      total: data.total,
    };
  },

  async fetchByCategory(category: string): Promise<Product[]> {
    const slug = encodeURIComponent(category);
    const res = await fetch(`https://dummyjson.com/products/category/${slug}`);
    if (!res.ok) throw new Error("Categoria não encontrada.");
    const data = (await res.json()) as DummyListResponse;
    return data.products.map(mapDummy);
  },

  async fetchCategories(): Promise<{ slug: string; name: string }[]> {
    const res = await fetch("https://dummyjson.com/products/categories");
    if (!res.ok) throw new Error("Falha ao carregar categorias.");
    const data = (await res.json()) as Array<{ slug: string; name: string }>;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: number): Promise<Product | null> {
    const local = readLocalProducts().find((p) => p.id === id);
    if (local) return local;
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return null;
    const p = (await res.json()) as DummyProduct;
    return mapDummy(p);
  },

  getMergedCatalog(apiProducts: Product[]): Product[] {
    const local = readLocalProducts();
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    local.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  },

  mergePage(apiProducts: Product[], categorySlug: string | "", includeLocalExtras: boolean): Product[] {
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    if (includeLocalExtras) {
      readLocalProducts().forEach((p) => {
        if (categorySlug && !matchesCategoryFilter(p, categorySlug)) return;
        if (!map.has(p.id)) map.set(p.id, p);
      });
    }
    return Array.from(map.values());
  },

  listLocal(): Product[] {
    return readLocalProducts();
  },

  createLocal(payload: {
    name: string;
    price: number;
    categoryId: number;
    description?: string;
    stock?: number;
    colors?: string[];
    sizes?: string[];
    extraAttributes?: string[];
    mainImage?: string;
    galleryImages?: string[];
  }): Product {
    const cat = categoryService.getById(payload.categoryId);
    if (!cat) {
      throw new Error("Categoria inválida.");
    }
    const category: Category = {
      id: cat.id,
      title: cat.name,
    };
    const thumb = payload.mainImage || (payload.galleryImages && payload.galleryImages[0]);
    const product: Product = {
      id: nextLocalId(),
      name: payload.name.trim(),
      price: payload.price,
      category,
      categoryId: cat.id,
      description: payload.description?.trim(),
      stock: payload.stock ?? 0,
      localOnly: true,
      colors: payload.colors,
      sizes: payload.sizes,
      extraAttributes: payload.extraAttributes,
      mainImage: payload.mainImage,
      galleryImages: payload.galleryImages,
      thumbnail: thumb,
    };
    const all = readLocalProducts();
    all.push(product);
    writeLocalProducts(all);
    return product;
  },

  updateLocal(product: Product): void {
    const all = readLocalProducts();
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx === -1) return;
    all[idx] = { ...product, localOnly: true };
    writeLocalProducts(all);
  },

  deleteLocal(id: number): void {
    const all = readLocalProducts().filter((p) => p.id !== id);
    writeLocalProducts(all);
  },

  async fetchEntireCatalog(opts?: { categorySlug?: string }): Promise<Product[]> {
    if (opts?.categorySlug) {
      try {
        const api = await this.fetchByCategory(opts.categorySlug);
        const merged = this.getMergedCatalog(api);
        return merged.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      } catch {
        const all = await this.fetchEntireCatalog();
        return all.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      }
    }
    const allApi: Product[] = [];
    let skip = 0;
    let total = Infinity;
    while (skip < total) {
      const res = await this.fetchPage({ limit: 100, skip });
      total = res.total;
      allApi.push(...res.products);
      if (res.products.length === 0) break;
      skip += res.products.length;
    }
    return this.getMergedCatalog(allApi);
  },

  async getRelatedProducts(current: Product, limit: number): Promise<Product[]> {
    const excluded = new Set<number>([current.id]);
    const pool: Product[] = [];

    let slug: string | undefined;
    if (current.categoryId) {
      slug = categoryService.getById(current.categoryId)?.slug;
    }
    if (!slug) {
      slug = current.category.title.toLowerCase().replace(/\s+/g, "-");
    }

    try {
      const fromApi = await this.fetchByCategory(slug);
      fromApi.forEach((p) => {
        if (!excluded.has(p.id)) pool.push(p);
      });
    } catch {
      /* ignora */
    }

    this.listLocal().forEach((p) => {
      if (excluded.has(p.id)) return;
      if (matchesCategoryFilter(p, slug!)) pool.push(p);
    });

    const map = new Map<number, Product>();
    pool.forEach((p) => map.set(p.id, p));

    if (map.size < limit) {
      const { products } = await this.fetchPage({ limit: 200, skip: 0 });
      const merged = this.getMergedCatalog(products);
      for (const p of merged) {
        if (p.id === current.id || map.has(p.id)) continue;
        if (current.brand && p.brand && p.brand === current.brand) {
          map.set(p.id, p);
        } else if (Math.abs(p.price - current.price) <= Math.max(current.price * 0.3, 5)) {
          map.set(p.id, p);
        }
        if (map.size >= limit + 20) break;
      }
    }

    return Array.from(map.values())
      .filter((p) => p.id !== current.id)
      .slice(0, limit);
  },

  async getCrossSellProducts(limit: number): Promise<Product[]> {
    const cats = categoryService.list().slice(0, 6);
    const out: Product[] = [];
    const seen = new Set<number>();
    for (const c of cats) {
      if (out.length >= limit) break;
      try {
        const batch = await this.fetchByCategory(c.slug);
        const merged = this.getMergedCatalog(batch);
        for (const p of merged) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          out.push(p);
          if (out.length >= limit) break;
        }
      } catch {
        /* ignora */
      }
    }
    return out.slice(24, limit);
  },
};
