<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Product } from "@shared/models/Product";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import ProductCard from "./ProductCard.vue";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "RelatedProducts",

  components: { ProductCard },

  props: {
    product: {
      type: Object as PropType<Product | null>,
      default: null,
    },
  },

  data() {
    return {
      items: [] as Product[],
      loading: false,
    };
  },

  watch: {
    product: {
      immediate: true,
      handler(p: Product | null) {
        void this.load(p);
      },
    },
  },

  methods: {
    formatBRL,
    async load(p: Product | null): Promise<void> {
      if (!p) {
        this.items = [];
        return;
      }
      this.loading = true;
      try {
        this.items = await productService.getRelatedProducts(p, 4);
      } catch {
        this.items = [];
      } finally {
        this.loading = false;
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
  },
});
</script>

<template>
  <section v-if="product" class="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
    <h2 class="text-xl font-bold m-0 mb-4">Produtos relacionados</h2>
    <p class="m-0 mb-4 text-sm text-gray-600 dark:text-gray-400">
      Mesma categoria ou produtos semelhantes; a lista atualiza automaticamente.
    </p>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton v-for="n in 4" :key="n" height="12rem" class="rounded-lg" />
    </div>

    <div v-else-if="items.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      Nenhum produto relacionado encontrado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ProductCard
        v-for="row in items"
        :key="row.id"
        :product="row"
        :formatted-price="formatBRL(row.price)"
        detail-link-label="Ver produto"
        add-to-cart-label="Comprar"
        @add-to-cart="addToCart(row)"
      />
    </div>
  </section>
</template>
