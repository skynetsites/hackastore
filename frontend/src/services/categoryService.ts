import type { LocalCategory } from "@shared/models/LocalCategory";
import { STORAGE } from "./storageKeys";

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `cat-${Date.now()}`
  );
}

function normalize(cat: LocalCategory): LocalCategory {
  return {
    ...cat,
    image: cat.image ?? "",
  };
}

function read(): LocalCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE.CATEGORIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalCategory[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(list: LocalCategory[]): void {
  localStorage.setItem(STORAGE.CATEGORIES, JSON.stringify(list));
}

function nextId(): number {
  const raw = localStorage.getItem(STORAGE.CATEGORY_SEQ);
  const cur = raw ? Number(raw) : 0;
  const next = cur + 1;
  localStorage.setItem(STORAGE.CATEGORY_SEQ, String(next));
  return next;
}

export const categoryService = {
  list(): LocalCategory[] {
    return read().sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(id: number): LocalCategory | undefined {
    return read().find((c) => c.id === id);
  },

  getBySlug(slug: string): LocalCategory | undefined {
    const s = slug.trim().toLowerCase();
    return read().find((c) => c.slug.toLowerCase() === s);
  },

  async seedFromApiIfEmpty(): Promise<void> {
    if (read().length > 0) return;
    try {
      const res = await fetch("https://dummyjson.com/products/categories");
      if (!res.ok) return;
      const data = (await res.json()) as Array<{ slug: string; name: string }>;
      if (!Array.isArray(data) || data.length === 0) return;
      const list: LocalCategory[] = [];
      for (const c of data) {
        list.push({
          id: nextId(),
          name: c.name,
          slug: c.slug,
          image: "",
        });
      }
      write(list);
    } catch {
      /* ignore */
    }
  },

  create(payload: {
    name: string;
    image: string;
    slug?: string;
  }): { ok: true; category: LocalCategory } | { ok: false; error: string } {
    const trimmed = payload.name.trim();
    if (!trimmed) return { ok: false, error: "Nome obrigatório." };
    const img = payload.image.trim();
    if (!img) return { ok: false, error: "Imagem obrigatória (upload ou URL)." };
    let slug = (payload.slug?.trim() || slugify(trimmed)).toLowerCase();
    const all = read();
    if (all.some((c) => c.slug === slug)) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const category: LocalCategory = {
      id: nextId(),
      name: trimmed,
      slug,
      image: img,
    };
    all.push(category);
    write(all);
    return { ok: true, category };
  },

  update(
    id: number,
    patch: Partial<Pick<LocalCategory, "name" | "slug" | "image">>
  ): { ok: true } | { ok: false; error: string } {
    const all = read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return { ok: false, error: "Categoria não encontrada." };
    const current = all[idx];
    const nextName = patch.name?.trim() ?? current.name;
    let nextSlug = (patch.slug?.trim() ?? current.slug).toLowerCase();
    if (patch.slug !== undefined && all.some((c, i) => i !== idx && c.slug === nextSlug)) {
      return { ok: false, error: "Slug já em uso." };
    }
    const nextImage =
      patch.image !== undefined ? patch.image.trim() : current.image ?? "";
    if (!nextImage) {
      return { ok: false, error: "Imagem obrigatória." };
    }
    all[idx] = { ...current, name: nextName, slug: nextSlug, image: nextImage };
    write(all);
    return { ok: true };
  },

  remove(id: number): { ok: true } | { ok: false; error: string } {
    const all = read();
    const next = all.filter((c) => c.id !== id);
    if (next.length === all.length) return { ok: false, error: "Categoria não encontrada." };
    write(next);
    return { ok: true };
  },

  /** Primeiras N categorias com imagem; completa com as demais (para grid da home) */
  topForHome(count: number): LocalCategory[] {
    const list = this.list();
    const withImg = list.filter((c) => (c.image ?? "").trim().length > 0);
    const rest = list.filter((c) => !(c.image ?? "").trim().length);
    const merged = [...withImg, ...rest];
    return merged.slice(0, count);
  },
};
