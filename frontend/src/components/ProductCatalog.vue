<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@shared/models/Product";
import { categoryService } from "../services/categoryService";
import { cartService } from "../services/cartService";
import { matchesProductCategorySlug, productService } from "../services/productService";
import type { CatalogFacets } from "../utils/productFacets";
import { extractFacets } from "../utils/productFacets";
import type { CatalogFilterState } from "../utils/productFilter";
import { emptyFilterState, filterProducts } from "../utils/productFilter";
import { formatBRL } from "../utils/format";
import ProductCard from "./ProductCard.vue";
import ProductFiltersSidebar from "./ProductFiltersSidebar.vue";

const EMPTY_FACETS: CatalogFacets = { colors: [], sizes: [], brands: [], attributes: [] };

export default defineComponent({
  name: "ProductCatalog",

  components: { ProductCard, ProductFiltersSidebar },

  props: {
    forcedCategorySlug: {
      type: String,
      default: "",
    },
    syncRouteQuery: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      allProducts: [] as Product[],
      loading: true,
      error: "" as string,
      filter: emptyFilterState() as CatalogFilterState,
      facets: EMPTY_FACETS as CatalogFacets,
      mobileFiltersOpen: false,
      categoryOptions: [] as { slug: string; name: string }[],
      sortOrder: "" as "" | "price-asc" | "price-desc",
      currentPage: 1,
      rowsPerPage: 12,
      home: { label: "Início", to: "/" },
      items: [] as Array<{ label: string; to?: string }>,
    };
  },

  computed: {
    
    filteredProducts(): Product[] {
  const f = { ...this.filter };

  if (this.forcedCategorySlug) {
    f.categorySlugs = [];
  }

  let result = filterProducts(this.allProducts, f, matchesProductCategorySlug);

  const search = String(this.$route.query.search || '').toLowerCase();

  if (search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search)
    );
  }

  return result;
},
    sortedProducts(): Product[] {
    const list = [...this.filteredProducts];

    if (this.sortOrder === "price-asc") {
      return list.sort((a, b) => a.price - b.price);
    }

    if (this.sortOrder === "price-desc") {
      return list.sort((a, b) => b.price - a.price);
    }

    return list;
    },
    paginatedProducts(): Product[] {
  const start = (this.currentPage - 1) * this.rowsPerPage;
  const end = start + this.rowsPerPage;
  return this.sortedProducts.slice(start, end);
},
visiblePages(): number[] {
  const max = 5;
  const total = this.totalPages;
  const current = this.currentPage;

  let start = Math.max(1, current - Math.floor(max / 2));
  let end = start + max - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - max + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
},
totalPages(): number {
  return Math.ceil(this.sortedProducts.length / this.rowsPerPage);
},
    pageTitle(): string {
      if (this.forcedCategorySlug) {
        const c = categoryService.getBySlug(this.forcedCategorySlug);
        return c ? c.name : "Categoria";
      }
      return "Produtos";
    },
    pageSubtitle(): string {
      if (this.forcedCategorySlug) {
        const c = categoryService.getBySlug(this.forcedCategorySlug);
        return c ? `Exibindo itens em “${c.name}”.` : "Produtos desta categoria.";
      }
      return "Filtros em tempo real sobre o catálogo (API + produtos locais).";
    },
  },

  watch: {
    forcedCategorySlug() {
      void this.load();
    },
    "$route.query.category"(val: string | string[] | undefined) {
      if (!this.syncRouteQuery || this.forcedCategorySlug) return;
      const slug = typeof val === "string" ? val : "";
      this.filter = { ...this.filter, categorySlugs: slug ? [slug] : [] };
    },
  },

  async mounted() {
    await this.buildCategoryOptions();
    if (this.syncRouteQuery && !this.forcedCategorySlug) {
      const slug = typeof this.$route.query.category === "string" ? this.$route.query.category : "";
      if (slug) this.filter = { ...this.filter, categorySlugs: [slug] };
    }
    await this.load();
  },

  methods: {
    formatBRL,
    async buildCategoryOptions(): Promise<void> {
      const locals = categoryService.list().map((c) => ({ slug: c.slug, name: c.name }));
      try {
        const api = await productService.fetchCategories();
        const merged = new Map<string, string>();
        locals.forEach((c) => merged.set(c.slug, c.name));
        api.forEach((c) => merged.set(c.slug, c.name));
        this.categoryOptions = Array.from(merged.entries()).map(([slug, name]) => ({ slug, name }));
        this.categoryOptions.sort((a, b) => a.name.localeCompare(b.name));
      } catch {
        this.categoryOptions = locals;
      }
    },
    async load(): Promise<void> {
      this.loading = true;
      this.error = "";
      try {
        const slug = this.forcedCategorySlug || undefined;
        this.allProducts = await productService.fetchEntireCatalog({ categorySlug: slug });
        this.facets = extractFacets(this.allProducts);
        this.items = [
          { label: "Produtos", to: "/products" }
        ];
      } catch {
        this.error = "Não foi possível carregar os produtos.";
        this.allProducts = [];
        this.facets = EMPTY_FACETS;
      } finally {
        this.loading = false;
      }
    },
    onFilterUpdate(v: CatalogFilterState): void {
      this.filter = v;
      this.currentPage = 1;
      if (this.syncRouteQuery && !this.forcedCategorySlug) {
        if (v.categorySlugs.length === 1) {
          void this.$router.replace({ query: { category: v.categorySlugs[0] } });
        } else if (v.categorySlugs.length === 0) {
          void this.$router.replace({ query: {} });
        }
      }
    },
    addToCart(product: Product): void {
      cartService.addItem(product, 1);
      this.$toast.add({
        severity: "success",
        summary: "Adicionado",
        detail: product.name,
        life: 2500,
        closable: false,
      });
    },
    categoryHeroImage(): string {
      const c = categoryService.getBySlug(this.forcedCategorySlug);
      const img = c?.image?.trim();
      if (img) return img;
      return "";
    },
  },
});
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold mb-3">{{ pageTitle }}</h1>
        
    <AppBreadcrumb :home="home" :items="items" />
        <p class="my-3 text-sm text-gray-600 dark:text-gray-400">
          {{ pageSubtitle }}
          <span v-if="!loading" class="text-gray-500">
            · {{ filteredProducts.length }} produto(s)
          </span>
        </p>
      </div>
      <Button
        class="lg:hidden shrink-0 hidden!"
        label="Filtros"
        icon="pi pi-filter"
        outlined
        @click="mobileFiltersOpen = true"
      />
          <Select
  v-model="sortOrder"
  :options="[
    { label: 'Sem ordenação', value: '' },
    { label: 'Menor preço', value: 'price-asc' },
    { label: 'Maior preço', value: 'price-desc' }
  ]"
  optionLabel="label"
  optionValue="value"
  placeholder="Ordenar"
  class="w-44
   transition-colors! 
   bg-gray-100!
   dark:bg-gray-900!
   [&_.p-select-overlay]:bg-gray-100!
   [&_.p-select-overlay]:dark:bg-gray-900!
   [&_.p-select-label]:text-gray-900!
   [&_.p-select-label]:dark:text-gray-200!
   border-gray-300!
   dark:border-gray-700!
   focus:ring-2
   focus:ring-primary/50
   focus:outline-none!
  "
  :pt="{
    overlay: {
      class: 'bg-gray-100! dark:bg-gray-900! border-gray-300! dark:border-gray-700! [&_.p-select-option-label]:text-gray-900! [&_.p-select-option-label]:dark:text-gray-200!'
    }
  }"
/>
    </div>

    <div
      v-if="forcedCategorySlug && categoryHeroImage()"
      class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-48"
    >
      <img :src="categoryHeroImage()" alt="" class="w-full h-48 object-cover" />
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <aside
        class="hidden lg:block w-full lg:w-64 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
      >
        <ProductFiltersSidebar
          :model-value="filter"
          :facets="facets"
          :category-options="categoryOptions"
          :hide-category-filter="Boolean(forcedCategorySlug)"
          @update:model-value="onFilterUpdate($event)"
        />
        
      </aside>

      <div class="flex-1 min-w-0 w-full">
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton v-for="n in 8" :key="n" height="12rem" class="rounded-lg" />
        </div>

        <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-10 text-gray-600 dark:text-gray-400">
          Nenhum produto com os filtros atuais.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            :formatted-price="formatBRL(product.price)"
            @add-to-cart="addToCart(product)"
          />
        </div>
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6 flex-wrap">
  
  <Button
    icon="pi pi-angle-left"
    :disabled="currentPage === 1"
    @click="currentPage--"
  />

  <span v-if="visiblePages[0] > 1">...</span>

<Button
  v-for="p in visiblePages"
  :key="p"
  :label="String(p)"
  :severity="p === currentPage ? 'primary' : 'secondary'"
  @click="currentPage = p"
/>

<span v-if="visiblePages[visiblePages.length - 1] < totalPages">...</span>

  <Button
    icon="pi pi-angle-right"
    :disabled="currentPage === totalPages"
    @click="currentPage++"
  />

</div>
      </div>
    </div>

    <Dialog
      v-model:visible="mobileFiltersOpen"
      modal
      header="Filtros"
      class="w-[min(100%,24rem)]"
      :dismissable-mask="true"
    >
      <ProductFiltersSidebar
        :model-value="filter"
        :facets="facets"
        :category-options="categoryOptions"
        :hide-category-filter="Boolean(forcedCategorySlug)"
        @update:model-value="onFilterUpdate($event)"
      />
      <template #footer>
        <Button label="Aplicar" icon="pi pi-check" class="w-full" @click="mobileFiltersOpen = false" />
      </template>
    </Dialog>
  </section>
</template>
