<script lang="ts">
import { defineComponent } from "vue";
import type { Category } from "@shared/models/Category";
import type { Product } from "@shared/models/Product";
import type { CartItem } from "@shared/models/CartItem";
import { Cart } from "@shared/classes/Cart";
import ProductCard from "./components/ProductCard.vue";
import EmptyCart from "./components/EmptyCart.vue";

export default defineComponent({
  name: "App",
  
  components: { 
    ProductCard, 
    EmptyCart 
  },
  
  data() {
    const instrumentos: Category = { id: 1, title: "Instrumentos Musicais" };
    const roupas: Category = { id: 2, title: "Roupas" };
    const livros: Category = { id: 3, title: "Livros" };

    const products: Product[] = [
      { id: 1, name: "Guitarra", price: 400, category: instrumentos },
      { id: 2, name: "Camiseta", price: 100, category: roupas },
      { id: 3, name: "Livro de TypeScript", price: 80, category: livros },
      { id: 4, name: "Violão", price: 350, category: instrumentos },
    ];

    const cart = new Cart();
    const cartItems: CartItem[] = [];
    const darkMode = false;
    const qtyBtnCls = 'bg-transparent! w-5! [&_svg]:w-5! [&_svg]:h-3.5! [&_.pi]:hover:text-gray-800 dark:[&_.pi]:hover:text-gray-100 pt-[0.24rem]! [&_.pi]:text-[0.6rem]! [&_.pi]:font-bold! focus:outline-none! focus:shadow-none!';

    return {
      products,
      cart,
      cartItems,
      darkMode,
      qtyBtnCls,
    };
  },
  
  mounted() {
    if (this.darkMode) document.documentElement.classList.add("dark");
  },
  
  methods: {
    formatBRL(value: number): string {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    
    syncCartItems(): void {
      this.cartItems.length = 0;
      this.cartItems.push(...this.cart.getItems());
    },
    
    addToCart(product: Product): void {
      this.cart.addItem(product, 1);
      this.syncCartItems();
      this.$toast.add({
        severity: 'success',
        summary: 'Adicionado',
        detail: product.name,
        life: 3000,
        closable: false 
      });
    },
    
    setQuantity(productId: number, quantity: number): void {
      this.cart.setQuantity(productId, quantity);
      this.syncCartItems();
    },
    
    decreaseQuantity(productId: number): void {
      this.cart.decreaseQuantity(productId);
      this.syncCartItems();
    },
    
    removeItem(productId: number): void {
      this.cart.removeItem(productId);
      this.syncCartItems();
    },
    
    confirmRemoveItem(productId: number, productName: string): void {
      this.$confirm.require({
        message: productName,
        header: "Confirmação",
        icon: "pi pi-exclamation-triangle",
        accept: () => this.removeItem(productId),
        reject: () => {},
        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary',
            icon: "pi pi-times",
            outlined: true,
            class: "bg-blue-500! hover:bg-blue-700! text-gray-100! [&_span]:font-normal! border-none! py-[0.4rem]!",
        },
        acceptProps: {
            label: 'Sim, excluir',
            severity: 'danger',
            icon: "pi pi-check", 
            class: "bg-red-500! hover:bg-red-700! text-gray-100! [&_span]:font-normal! border-none! py-[0.4rem]!",
        },
       
      });
    },
    
    toggleDarkMode(): void {
      this.darkMode = !this.darkMode;
      if (this.darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
  },
});
</script>

<template>
  <div class="min-h-screen transition-colors bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <ConfirmDialog
      class="
        bg-gray-100!
        dark:bg-gray-800! 
        border!
        border-gray-200!
        dark:border-gray-700!
        text-gray-900! 
        dark:text-gray-100!
        m-4!
        md:mx-0!
        [&_.p-dialog-close-button]:hover:bg-gray-200! 
        [&_.p-dialog-close-button]:hover:dark:bg-gray-900!
        [&_.p-confirmdialog-icon]:text-gray-900! 
        dark:[&_.p-confirmdialog-icon]:text-gray-100!
        [&_.p-dialog-header]:py-3!
        [&_.p-dialog-content]:pb-6!
      "
    >
      <template #message="slotProps">
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-yellow-500 text-xl"></i>
          <span>
            Deseja mesmo excluir
            <span class="font-bold">"{{ slotProps.message.message }}"</span>
            do carrinho?
          </span>
        </div>
      </template>
    </ConfirmDialog>

    <Toast
      position="top-right"
      class="
        w-80!
        [&_.p-toast]:right-2!
        [&_.p-toast]:top-2!
      [&_.p-toast-message]:bg-gray-100!
      dark:[&_.p-toast-message]:bg-gray-800!
        [&_.p-toast-message]:shadow-lg!
        [&_.p-toast-message]:rounded-lg!
      [&_.p-toast-message]:border-gray-200!
      [&_.p-toast-message]:dark:border-gray-700!
      "
    >
      <template #message="slotProps">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <i class="pi pi pi-check font-semibold text-emerald-600 text-xl"></i>
            <span class="p-toast-summary font-semibold text-gray-900! dark:text-gray-100!">
              {{ slotProps.message.summary }}
            </span>
          </div>
          <span class="p-toast-detail text-gray-600! dark:text-gray-300! text-sm">
            Produto
            <span class="font-bold text-base">
              "{{ slotProps.message.detail }}"
            </span>
            foi adicionado ao carrinho
          </span>
        </div>
      </template>
    </Toast>

    <header class="max-w-240 mx-auto px-6 py-5 flex justify-between md:items-center">
      <h1 class="text-[1.5rem] font-bold m-0">
        Evoluindo a UI com PrimeVue & Tailwind
      </h1>
      <Button
        :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
        text
        rounded
        class="
          w-12!
          md:w-8!
          h-8!
          border! 
          border-gray-900! 
          dark:border-stone-100! 
          [&_.pi]:text-gray-900! 
          dark:[&_.pi]:text-stone-100!
           focus:outline-none! 
           focus:shadow-none!
        "
        :aria-label="darkMode ? 'Modo claro' : 'Modo escuro'"
        @click="toggleDarkMode"
      />
    </header>

    <main class="max-w-240 mx-auto px-6 pb-6">
      <section class="mb-4">
        <h2 class="text-[1.2rem] font-bold mb-[0.7rem]">Produtos</h2>
        <div
          class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :priceBR="formatBRL(product.price)"
            @add-to-cart="addToCart(product)"
          />
        </div>
      </section>

      <aside class="rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="p-4">
          
          <h2 class="text-[1.2rem]/6 font-bold m-0 mb-[0.85rem]">Carrinho</h2>
          
          <EmptyCart v-if="cartItems.length === 0" /> 
          
          <div v-else>
            <p class="m-0 text-gray-600 dark:text-gray-400">
              <strong>Total de itens:</strong> {{ cart.getTotalItems() }}
            </p>
            <p class="m-0 mt-1 text-gray-600 dark:text-gray-400">
              <strong>Valor total:</strong> {{ formatBRL(cart.getFinalPrice()) }}
            </p>

            <div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 class="font-medium mb-2">Itens no carrinho</h3>
          
              <DataView
                :value="cartItems"
                layout="list"
                class="w-full bg-transparent! [&_div.p-dataview-content]:bg-transparent!"
              >
                <template #list="slotProps">
                  <div
                    v-for="item in slotProps.items"
                    :key="item.product.id"
                    class="flex md:flex-wrap items-center gap-0 py-1 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <span class="flex-1 min-w-30 text-gray-700 dark:text-gray-400">
                      {{ item.product.name }} × {{ item.quantity }}
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-700 dark:text-emerald-400 font-semibold w-24 text-right">
                        {{ formatBRL(item.product.price * item.quantity) }}
                      </span>
                      <InputNumber
                        v-model="item.quantity"
                        :min="0"
                        show-buttons
                        buttonsClass="bg-transparent! w-5!"
                        :incrementButtonClass="qtyBtnCls"
                        :decrementButtonClass="qtyBtnCls"
                        incrementButtonIcon="pi pi-plus"
                        decrementButtonIcon="pi pi-minus"
                        :inputClass="`
                          ${item.quantity >= 100 
                            ? 'w-14!' 
                            : item.quantity >= 10 
                            ? 'w-12!' : 'w-10!'
                          }
                          bg-transparent!
                          text-sm
                          text-gray-700!
                          dark:text-gray-400!
                          py-[0.15rem]! 
                          p-2!
                          pointer-events-none
                          border-[0.12rem]!
                          border-gray-300!
                          dark:border-gray-600!
                        `"
                        @update:modelValue="(value) => {
                          if (value === 0) {
                            confirmRemoveItem(item.product.id, item.product.name);
                            $nextTick(() => item.quantity = 1);
                            return;
                          }
                          setQuantity(item.product.id, value);
                        }"
                      />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      rounded
                      aria-label="Excluir item"
                      class="w-6!"
                      @click="confirmRemoveItem(item.product.id, item.product.name)"
                    />
                    </div>
                  </div>
                </template>
              </DataView>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>
