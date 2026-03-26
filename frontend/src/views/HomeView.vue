<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@shared/models/Product";
import type { LocalCategory } from "@shared/models/LocalCategory";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import ProductCard from "../components/ProductCard.vue";
import HomeBannerCarousel from "../components/HomeBannerCarousel.vue";
import { DEFAULT_CATEGORY_IMAGES } from "../constants/categoryImagesDefaults";
import { formatBRL } from "../utils/format";

function placeholderCategoryImage(name: string): string {
  const t = encodeURIComponent(name.slice(0, 24));
  return `https://placehold.co/480x280/e2e8f0/64748b?text=${t}`;
}

export default defineComponent({
  name: "HomeView",

  components: { ProductCard, HomeBannerCarousel },

  data() {
    return {
      categories: [] as LocalCategory[],
      featured: [] as Product[],
      crossSell: [] as Product[],
      relatedCategoryColumns: [] as {
        category: LocalCategory;
        products: Product[];
      }[],
      loading: true,
      loadingCross: false,
      loadingRelatedColumns: false,
      error: "" as string,
    };
  },

  async mounted() {
    try {
      await categoryService.seedFromApiIfEmpty();
      this.categories = categoryService.topForHome(5);
      const { products } = await productService.fetchPage({
        limit: 8,
        skip: 0,
      });
      this.featured = productService.getMergedCatalog(products);
    } catch {
      this.error = "Não foi possível carregar os dados da página inicial.";
    } finally {
      this.loading = false;
    }
    this.loadingCross = true;
    try {
      this.crossSell = await productService.getCrossSellProducts(32);
    } catch {
      this.crossSell = [];
    } finally {
      this.loadingCross = false;
    }
    this.loadingRelatedColumns = true;
    try {
      this.relatedCategoryColumns = await this.loadRelatedCategoryColumns();
    } catch {
      this.relatedCategoryColumns = [];
    } finally {
      this.loadingRelatedColumns = false;
    }
  },

  methods: {
    formatBRL,
    async loadRelatedCategoryColumns(): Promise<
      { category: LocalCategory; products: Product[] }[]
    > {
      const list = categoryService.list();
      if (list.length === 0) return [];
      let pick: LocalCategory[] = [];
      if (list.length >= 7) {
        pick = [list[5], list[6]];
      } else if (list.length >= 2) {
        pick = [list[0], list[1]];
      } else {
        pick = [list[0]];
      }
      const out: { category: LocalCategory; products: Product[] }[] = [];
      for (const cat of pick) {
        try {
          const raw = await productService.fetchByCategory(cat.slug);
          const merged = productService.getMergedCatalog(raw);
          out.push({ category: cat, products: merged.slice(0, 4) });
        } catch {
          out.push({ category: cat, products: [] });
        }
      }
      return out;
    },
    categoryImage(c: LocalCategory, index: number): string {
      const img = (c.image ?? "").trim();

      return (
        img ||
        DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length] ||
        placeholderCategoryImage(c.name)
      );
    },
    addToCart(product: Product): void {
      cartService.addItem(product, 1);
      this.$toast.add({
        severity: "success",
        summary: "Adicionado",
        detail: product.name,
        life: 3000,
        closable: false,
      });
    },
  },
});
</script>

<template>
  <section class="space-y-10">
    <HomeBannerCarousel />
    <div class="grid grid-cols-1">
        <div
          class="flex flex-col gap-2 h-full"
        >
          
            <div class="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
             <div class="flex flex-col items-center lg:justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-10 mb-1 me-2"
                >
                  <g fill="#10b981">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </g>                     
                </svg>
                <h6 class="mb-2 font-medium">Entrega com frete grátis</h6>
                <p class="text-sm text-gray-600 dark:text-gray-200">
                  Receba seus produtos sem custo extra, com frete grátis para todo o Brasil.
                </p>
              </div>
              
              <div class="flex flex-col items-center lg:justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-9 mb-1 me-2"
                >
                  <g fill="#10b981">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                    />
                  </g> 
                </svg>
                <h6 class="mb-2 font-medium">Entrega segura e direta</h6>
                <p class="text-sm text-gray-600 dark:text-gray-200">
                  Seu pedido chega rápido e protegido, direto do nosso estoque até você.
                </p>
              </div>

              <div class="flex flex-col items-center lg:justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-9 mb-1 me-2"
                >
                  <g fill="#10b981">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                    />
                  </g> 
                </svg>
                <h6 class="mb-2 font-medium">Garantia de devolução</h6>
                <p class="text-sm text-gray-600 dark:text-gray-200">
                  Se não estiver satisfeito, devolvemos seu dinheiro de forma simples e segura.
                </p>
              </div>

              <div class="flex flex-col items-center lg:justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-9 mb-1 me-2"
                >
                  <g fill="#10b981">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </g> 
                </svg>

                <h6 class="mb-2 font-medium">Pagamento protegido</h6>
                <p class="text-sm text-gray-600 dark:text-gray-200">
                  Compre com total segurança, todas as transações são protegidas e confiáveis.
                </p>
              </div>
            </div>
          </div>
      </div>
    <div
      class="hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-500/15 dark:to-emerald-500/10 p-6 sm:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold m-0 mb-2">
        Bem-vindo à vitrine
      </h1>
      <p class="m-0 text-gray-700 dark:text-gray-300 max-w-2xl">
        Explore categorias, destaques e sugestões para aumentar sua conversão.
        Produtos da API DummyJSON combinados com itens cadastrados localmente.
      </p>
      <div class="mt-4 flex flex-wrap gap-0">
        <Button label="Ver todos os produtos" icon="pi pi-th-large" icon-pos="right"
          @click="$router.push('/products')" />
        <Button label="Ir ao carrinho" severity="secondary" outlined icon="pi pi-shopping-cart"
          @click="$router.push('/cart')" />
      </div>
    </div>

    <div>
      <h2 class="text-[1.7rem] font-bold m-0 mb-3">Categorias</h2>
      <p class="m-0 mb-4 text-[1rem] text-gray-600 dark:text-gray-400">
        Explore nossas melhores categorias e encontre exatamente o que você procura.
      </p>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Skeleton v-for="n in 5" :key="n" height="10rem" class="rounded-lg" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <router-link v-for="(c, index) in categories" :key="c.id" :to="{ name: 'category', params: { slug: c.slug } }"
          class="relative group block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 shadow-sm hover:shadow-md transition-shadow no-underline">
          <div class="aspect-[16/10] overflow-hidden bg-gray-200 dark:bg-gray-800">
            <img :src="categoryImage(c, index)" :alt="c.name"
              class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" />
          </div>
          <span
            class="bg-white dark:bg-slate-900 group-hover:text-primary py-2 px-6 rounded-full shadow-sm dark:shadow-gray-800 absolute bottom-4 left-1/2 -translate-x-1/2 text-base font-medium whitespace-nowrap">
            {{ c.name }}
          </span>
        </router-link>
      </div>
    </div>

    <div>
      <h2 class="text-[1.7rem] font-bold m-0 mb-3">Produtos em destaque</h2>
      <p class="m-0 mb-4 text-[1rem] text-gray-600 dark:text-gray-400">
        Produtos selecionados especialmente para você, com qualidade e os melhores preços.
      </p>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="n in 4" :key="n" height="12rem" class="rounded-lg" />
      </div>

      <Message v-else-if="error" severity="error" :closable="false">{{
        error
      }}</Message>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard v-for="product in featured" :key="product.id" :product="product"
          :formatted-price="formatBRL(product.price)" @add-to-cart="addToCart(product)" />
      </div>
    </div>

    <div>
      <h2 class="text-[1.7rem] font-bold m-0 mb-3">Você também pode gostar</h2>
      <p class="m-0 mb-4 text-[1rem] text-gray-600 dark:text-gray-400">
        Sugestões especiais que combinam com o que você está procurando.
      </p>

      <div v-if="loadingCross" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="n in 4" :key="n" height="12rem" class="rounded-lg" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard v-for="product in crossSell" :key="product.id" :product="product"
          :formatted-price="formatBRL(product.price)" @add-to-cart="addToCart(product)" />
      </div>
    </div>

    <div>
      <div v-if="loadingRelatedColumns" class="grid grid-cols-1 md:grid-cols-2 gap-0">
        <Skeleton v-for="n in 2" :key="n" height="16rem" class="rounded-xl" />
      </div>

      <div v-else-if="relatedCategoryColumns.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="col in relatedCategoryColumns" :key="col.category.id"
          class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3"
          :class="relatedCategoryColumns.length === 1 ? 'md:col-span-2' : ''">
          <div
            class="flex flex-wrap items-start justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <div>
              <h3 class="text-[1.7rem] font-bold m-0">{{ col.category.name }}</h3>
              <p class="m-0 text-[1rem] text-gray-500 dark:text-gray-400">
                Confira os produtos desta da lista desta categoria.
              </p>
            </div>
            <router-link :to="{ name: 'category', params: { slug: col.category.slug } }"
              class="text-sm text-emerald-700 dark:text-emerald-400 font-medium no-underline hover:underline">
              Ver categoria
            </router-link>
          </div>

          <div v-if="col.products.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            Nenhum produto disponível nesta categoria no momento.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProductCard v-for="product in col.products" :key="product.id" :product="product"
              :formatted-price="formatBRL(product.price)" @add-to-cart="addToCart(product)" />
          </div>
        </div>
      </div>

      <p v-else class="m-0 text-sm text-gray-500 dark:text-gray-400">
        Cadastre categorias para exibir esta seção.
      </p>
    </div>
    
  </section>
</template>
