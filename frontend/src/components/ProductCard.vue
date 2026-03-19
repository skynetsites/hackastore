<script setup lang="ts">
import type { Product } from "@shared/models/Product";

defineProps<{
  product: Product;
  priceBR: string;
}>();

const emit = defineEmits<{
  (e: "add-to-cart"): void;
}>();
</script>

<template>
  <Card class="p-4! [&_div]:p-0! rounded-lg overflow-hidden shadow-lg bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
    <template #title>
      <h2 class="text-[1.1rem] font-bold text-gray-600! dark:text-gray-100! leading-[1.4]">{{ product.name }}</h2>
    </template>
    <template #content>
      <p class="text-emerald-700 dark:text-emerald-400 font-semibold mb-3 leading-[1.1]">
        {{ priceBR }}
      </p>
      <p class="text-gray-600 dark:text-gray-400 text-sm">{{ product.category.title }}</p>
      <Button
        label="Adicionar"
        icon="pi pi-cart-plus"
        class="mt-3 w-full text-[0.95rem]! font-normal! [&_span]:font-normal! bg-blue-500! hover:bg-blue-700! text-gray-100! border-none! shadow-none! py-[0.4rem]!"
        @click="emit('add-to-cart')"
      />
    </template>
  </Card>
</template>
