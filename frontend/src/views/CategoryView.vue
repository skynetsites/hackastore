<script lang="ts">
import { defineComponent } from "vue";
import ProductCatalog from "../components/ProductCatalog.vue";

export default defineComponent({
  name: "CategoryView",

  components: { ProductCatalog },

  props: {
    slug: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <ProductCatalog :forced-category-slug="slug" />
</template>
