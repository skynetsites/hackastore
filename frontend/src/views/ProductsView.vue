<script lang="ts">
import { defineComponent } from "vue";
import ProductCatalog from "../components/ProductCatalog.vue";

export default defineComponent({
  name: "ProductsView",

  components: { ProductCatalog },
});
</script>

<template>
  <ProductCatalog sync-route-query />
</template>
