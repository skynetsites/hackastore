<script lang="ts">
import { defineComponent } from "vue";
import { LocalCategory } from "@shared/models/LocalCategory";
import { MenuItem } from "primevue/menuitem";
import { CartItem } from "@shared/models/CartItem";
import { cartService } from "../services/cartService";
import { categoryService } from "../services/categoryService";
import { authService } from "../services/authService";
import { storeSettingsService } from "../services/storeSettingsService";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "ConsumerLayout",

  data() {
    return {
      darkMode: false,
      cartTick: 0,
      unsubscribe: null as null | (() => void),
      authTick: 0,
      brandTick: 0,
      miniCartOpen: false,
      mobileNavOpen: false,
      isMobileViewport: false,
      showSearch: false,
      email: "",
      loading: false,
      message: "",
      error: "",
      showTop: false,
      isLogged: authService.isAuthenticated(),
      search: "" as string,
      categories: [] as LocalCategory[],
    };
  },

  computed: {
    user() {
      return authService.getCurrentUser();
    },
    greeting(): string {
      this.authTick;
      
      const hour = new Date().getHours();
      let saudacao = 'Olá';
  
      if (hour < 12) saudacao = 'Bom dia';
      else if (hour < 18) saudacao = 'Boa tarde';
      else saudacao = 'Boa noite';
  
      if (!authService.isAuthenticated()) return `${saudacao}, Cliente/Visitante`;
  
      const user = authService.getCurrentUser();
      if (!user || !user.name) return `${saudacao}, Cliente/Visitante`;

      const nameParts = user.name.trim().split(' ');
      const displayName = nameParts.slice(0, 2).join(' ');
 
      return `${saudacao}, ${displayName}`;
    },
    avatarUrl(): string {
      this.authTick;
  
      if (!authService.isAuthenticated()) {
         return 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png';
      }
      
      return authService.isAdmin()
        ? 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
        : 'https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png';
    },
    firstName() {
      this.authTick;
      if (!this.user || !this.user.name) return '';
      return this.user.name.trim().split(' ').slice(0, 2).join(' ');
    },
    userRoleLabel() {
      this.authTick;
      return authService.isAdmin() ? 'Admin' : 'Cliente';
    },
    firstColumn(): LocalCategory[] {
      return this.categories.slice(0, 6);
    },
    secondColumn(): LocalCategory[] {
      return this.categories.slice(6, 12);
    },
    cartCount(): number {
      this.cartTick;
      return cartService.getTotalItems();
    },
    cartItems(): CartItem[] {
      this.cartTick;
      return cartService.getItems();
    },
    cartTotal(): number {
      this.cartTick;
      return cartService.getFinalPrice();
    },
    cartEmpty(): boolean {
      this.cartTick;
      return cartService.isEmpty();
    },
    isLoggedIn(): boolean {
      this.authTick;
      return authService.isAuthenticated();
    },
    isAdminUser(): boolean {
      this.authTick;
      return authService.isAdmin();
    },
    storeTitle(): string {
      this.brandTick;
      return storeSettingsService.get().storeName;
    },
    storeTagline(): string {
      this.brandTick;
      return storeSettingsService.get().tagline;
    },
    linkClass(): string {
      return "px-2 py-1.5 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-300/80 dark:hover:bg-gray-800 text-lg";
    },
    itemsLeft(): MenuItem[] {
      return [
        {
          label: "Início",
          icon: "pi pi-home",
          command: () => this.$router.push("/"),
        },
        {
          label: "Produtos",
          icon: "pi pi-box",
          command: () => this.$router.push("/products"),
        },
        {
          label: "Meu Carrinho",
          icon: "pi pi-shopping-cart",
          command: () => this.$router.push("/cart"),
        },
        {
          label: "Lista de Desejos",
          icon: "pi pi-heart",
          command: () => this.$router.push("/profile/favorites"),
        },
        {
          label: "Minha Conta",
          icon: "pi pi-user",
          command: () => this.$router.push("/profile/edit"),
        },
        {
          label: "Meus Pedidos",
          icon: "pi pi-shopping-bag",
          command: () => this.$router.push("/profile/orders"),
        },
        {
          label: "Rastrear Pedido",
          icon: "pi pi-truck",
          command: () => this.$router.push("/profile/tracking"),
        },
        {
          label: "Finalizar Pedido",
          icon: "pi pi-check",
          command: () => this.$router.push("/checkout"),
        },
      ];
    },

    itemsRight(): MenuItem[] {
      this.authTick;

      if (!authService.isAuthenticated()) {
        return [
          {
            label: "Entrar / Cadastrar",
            icon: "pi pi-user",
            items: [
              {
                label: "Entrar",
                icon: "pi pi-sign-in",
                command: () => this.$router.push("/login"),
              },
              {
                label: "Cadastrar",
                icon: "pi pi-user-plus",
                command: () => this.$router.push("/register"),
              },
            ],
          },
        ];
      } else {
        return [
          {
            label: "Minha Conta",
            icon: "pi pi-user",
            items: [
              {
                label: "Perfil",
                icon: "pi pi-user-edit",
                command: () => this.$router.push("/profile/edit"),
              },
              {
                label: "Pedidos",
                icon: "pi pi-shopping-bag",

                command: () => this.$router.push("/profile/orders"),
              },
              {
                label: "Favoritos",
                icon: "pi pi-heart",
                command: () => this.$router.push("/profile/favorites"),
              },
              {
                label: "Entregas",
                icon: "pi pi-truck",
                command: () => this.$router.push("/profile/tracking"),
              },
              ...(authService.isAdmin()
                ? [
                    {
                      label: "Painel Admin",
                      icon: "pi pi-cog",
                      command: () => this.$router.push("/admin"),
                    },
                  ]
                : []),
              {
                label: "Sair",
                icon: "pi pi-sign-out",
                command: () => {
                  this.logout();
                  this.authTick += 1;
                },
              },
            ],
          },
        ];
      }
    },
  },

  mounted() {
    this.applyStoreTheme();
    this.updateViewport();
    this.loadCategories();
    window.addEventListener("resize", this.updateViewport);
    window.addEventListener('scroll', this.handleScroll);
    document.addEventListener("click", this.handleClickOutside);
    this.unsubscribe = cartService.subscribe(() => {
      this.cartTick += 1;
    });

  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateViewport);
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener("click", this.handleClickOutside);
    this.unsubscribe?.();
  },

  watch: {
    $route() {
      this.authTick += 1;
      this.brandTick += 1;
      this.applyStoreTheme();
      this.miniCartOpen = false;
      this.mobileNavOpen = false;
    },
  },

  methods: {
    formatBRL,
    goToUserArea() {
      const route = authService.isAdmin() ? '/admin' : '/profile/edit';
      this.$router.push(route);
    },
    toggleSearch() {
      this.showSearch = !this.showSearch;
    },
    handleSearch() {
      this.goToSearch();
    },
    goToSearch() {
      this.$router.push({
        name: "products",
        query: { search: this.search },
      });
      this.showSearch = false;
    },

    async loadCategories() {
      try {
        await categoryService.seedFromApiIfEmpty();
        this.categories = categoryService.list();
      } catch (err) {
        console.error("Erro ao carregar categorias", err);
        this.categories = [];
      }
    },
    
    toggle(event: Event) {
      (this.$refs.menu as any).toggle(event);
    },

    handleClickOutside(event: MouseEvent) {
      const container = this.$refs.searchContainer as HTMLElement;

      if (container && !container.contains(event.target as Node)) {
        this.showSearch = false;
      }
    },
    updateViewport(): void {
      if (typeof window === "undefined") return;
      this.isMobileViewport = window.innerWidth < 1024;
      if (!this.isMobileViewport) {
        this.mobileNavOpen = false;
      }
    },
    applyStoreTheme(): void {
      const pref = storeSettingsService.get().themePreference;
      if (pref === "dark") {
        this.darkMode = true;
        document.documentElement.classList.add("dark");
        return;
      }
      if (pref === "light") {
        this.darkMode = false;
        document.documentElement.classList.remove("dark");
        return;
      }
    },
    lineSubtotal(item: CartItem): number {
      return item.product.price * item.quantity;
    },
    productThumb(item: CartItem): string {
      return item.product.mainImage || item.product.thumbnail || "";
    },
    onCartMouseEnter(): void {
      if (!this.isMobileViewport) this.miniCartOpen = true;
    },
    onCartMouseLeave(): void {
      if (!this.isMobileViewport) this.miniCartOpen = false;
    },
    onCartTriggerClick(): void {
      if (this.isMobileViewport) {
        this.miniCartOpen = !this.miniCartOpen;
      } else {
        void this.$router.push({ name: "cart" });
      }
    },
    clearCart(): void {
      cartService.clear();
      this.$toast.add({
        severity: "info",
        summary: "Carrinho limpo",
        life: 2200,
      });
    },
    removeLine(productId: number): void {
      cartService.removeItem(productId);
    },
    goCheckout(): void {
      if (this.cartEmpty) return;
      void this.$router.push({ name: "checkout" });
      this.miniCartOpen = false;
    },
    goCartPage(): void {
      void this.$router.push({ name: "cart" });
      this.miniCartOpen = false;
    },
    toggleDarkMode(): void {
      const pref = storeSettingsService.get().themePreference;
      if (pref === "light" || pref === "dark") {
        this.$toast.add({
          severity: "info",
          summary: "Tema fixo",
          detail:
            "O administrador definiu tema claro/escuro nas configurações.",
          life: 3500,
        });
        return;
      }
      this.darkMode = !this.darkMode;
      if (this.darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
    checkLogin() {
      this.isLogged = authService.isAuthenticated();
    },

    logout(): void {
      authService.logout();
      this.isLogged = false;
      this.$toast.add({
        severity: "info",
        summary: "Sessão encerrada",
        detail: "Até logo!",
        life: 2500,
      });
      this.$router.replace({ path: "/login" });
    },

    async handleSubscribe() {
      if (!this.email) {
        this.$toast.add({
          severity: "warn",
          summary: "Aviso",
          detail: "Digite um email válido",
          life: 3000,
        });
        return;
      }

      try {
        this.loading = true;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.$toast.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Inscrição realizada!",
          life: 3000,
        });
        this.email = "";
      } catch (err) {
        this.$toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao enviar. Tente novamente.",
          life: 3000,
        });
      } finally {
        this.loading = false;
      }
    },
    handleScroll() {
      this.showTop = window.scrollY > 200;
    },

    scrollToTop() {
  const scrollElement = document.scrollingElement || document.documentElement;

  scrollElement.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
  },
});
</script>

<template>
  <div
    class="min-h-screen transition-colors bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <header class="bg-gray-100 dark:bg-gray-800">
      <div class="hidden md:block tagline bg-emerald-950 dark:bg-gray-900 py-2">
        <div class="relative">
          <div class="grid grid-cols-3 items-center">
            <div class="text-center"></div>
            <div class="text-center">
              <h6 class="text-white font-normal">
                Indique um amigo e ganhem juntos R$ 200 em créditos 🎉
              </h6>
            </div>
            <div 
                class="flex justify-end items-center gap-3 cursor-pointer" 
                @click="toggle">
              <div class="text-white font-normal">{{ greeting }}</div>
              <Avatar :image="avatarUrl" class="mr-2" shape="circle" />
            </div>
          </div>
        </div>
      </div>
      <div class="max-w-[1320px] mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="min-w-0">
              <RouterLink
                to="/"
                class="flex items-center gap-2 text-[1.5rem] sm:text-[2rem] font-bold m-0 no-underline text-gray-900 dark:text-gray-100 hover:opacity-90 truncate"
                ><svg
                  class="text-[2rem] size-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>

                {{ storeTitle }}
              </RouterLink>
              <p
                class="m-0 text-xs sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2"
              >
                {{ storeTagline }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            <div
              ref="searchContainer"
              class="hidden md:flex items-center gap-1 sm:gap-2 shrink-0"
            >
              <div v-show="showSearch" class="relative w-[20rem]">
                <InputText
                  ref="searchInput"
                  v-model="search"
                  placeholder="Buscar produtos..."
                  class="w-full pr-20 pl-3 h-10 transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700! focus:ring-2 focus:ring-primary/50 focus:outline-none! rounded-md!"
                  @keyup.enter="handleSearch"
                />

                <Button
                  icon="pi pi-search"
                  text
                  class="!absolute right-1 top-1/2 -translate-y-1/2 !h-8 !w-8 !p-0 flex items-center justify-center text-gray-600! dark:text-green-400!"
                  @click="handleSearch"
                />

                <i
                  v-if="search"
                  class="pi pi-times absolute right-10 top-1/2 -translate-y-1/2 text-[.75rem]! text-gray-600! dark:text-green-400! cursor-pointer flex items-center justify-center w-3 h-3"
                  @click="search = ''"
                />
              </div>
              <Button
                icon="pi pi-search"
                rounded
                class="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
                aria-label="Busca"
                @click.stop="toggleSearch"
              />
            </div>
            <div
              class="relative inline-flex"
              @mouseenter="onCartMouseEnter"
              @mouseleave="onCartMouseLeave"
            >
              <Button
                icon="pi pi-shopping-cart"
                rounded
                class="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
                :aria-expanded="miniCartOpen"
                aria-label="Carrinho"
                 @click="onCartTriggerClick"
              />

              <div
                v-show="miniCartOpen"
                class="fixed md:absolute left-0 md:left-auto right-0 top-16 md:top-full z-[100] px-3 md:px-0 pt-1 w-full md:w-[min(calc(100vw-1rem),22rem)]"
                role="region"
                aria-label="Resumo do carrinho"
                @click.stop
              >
                <div
                  class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-900/15 dark:shadow-black/40 overflow-hidden flex flex-col max-h-[min(85vh,28rem)]"
                >
                  <div
                    class="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
                  >
                    <p
                      class="m-0 text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Meu Carrinho ({{ cartCount }} {{ cartCount === 1 ? "item" : "itens" }})
                    </p>
                    <Button
                      label=""
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      text
                      class="w-full"
                      :disabled="cartEmpty"
                      @click="clearCart"
                    />
                  </div>

                  <div
                    v-if="cartEmpty"
                    class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Carrinho vazio
                  </div>

                  <ul
                    v-else
                    class="m-0 p-0 list-none overflow-y-auto flex-1 min-h-0 divide-y divide-gray-100 dark:divide-gray-800"
                  >
                    <li
                      v-for="row in cartItems"
                      :key="row.product.id"
                      class="flex gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div
                        class="w-14 h-14 shrink-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          v-if="productThumb(row)"
                          :src="productThumb(row)"
                          :alt="row.product.name"
                          class="w-full h-full object-contain"
                        />
                        <i
                          v-else
                          class="pi pi-image text-gray-400 text-lg"
                          aria-hidden="true"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="m-0 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug"
                        >
                          {{ row.product.name }}
                        </p>
                        <p
                          class="m-0 mt-0.5 text-xs text-gray-500 dark:text-gray-400"
                        >
                          {{ formatBRL(row.product.price) }} ×
                          {{ row.quantity }}
                        </p>
                        <p
                          class="m-0 mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                        >
                          Subtotal: {{ formatBRL(lineSubtotal(row)) }}
                        </p>
                      </div>
                      <Button
                        icon="pi pi-times"
                        severity="danger"
                        text
                        rounded
                        class="shrink-0 self-start!"
                        title="Remover item"
                        aria-label="Remover item"
                        @click="removeLine(row.product.id)"
                      />
                    </li>
                  </ul>

                  <div
                    v-if="!cartEmpty"
                    class="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div
                      class="flex justify-between items-center text-sm font-semibold"
                    >
                      <span class="text-gray-700 dark:text-gray-300"
                        >Total</span
                      >
                      <span class="text-emerald-700 dark:text-emerald-400">{{
                        formatBRL(cartTotal)
                      }}</span>
                    </div>
                  </div>

                  <div
  class="p-3 flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
>

  <div class="flex gap-2">
    <Button
      label="Carrinho"
      icon="pi pi-shopping-cart"
      severity="secondary"
      outlined
      class="w-full"
      @click="goCartPage"
    />
    <Button
      label="Confirmar"
      icon="pi pi-check"
      class="w-full"
      :disabled="cartEmpty"
      @click="goCheckout"
    />
  </div>
</div>
                </div>
              </div>
            </div>

            <Button
              icon="pi pi-heart"
              rounded
              class="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
              aria-label="Favoritos"
              @click="$router.push('/profile/favorites')"
            />
            <div>
              <Button
                :icon="isLogged ? 'pi pi-sign-in':'pi pi-user'"
                rounded
                :class="[
                  isLogged ? 'bg-emerald-600! text-gray-100!' : 'bg-primary',
                  'py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center text-white rounded-md hover:bg-primary-dark focus:outline-none'
                ]"
                aria-label="Usiário"
                @click="toggle"
              />
        <Menu
          ref="menu"
          id="overlay_menu"
          :model="itemsRight"
          :popup="true"
          class="
            p-0! 
            border-0! 
            text-gray-600! 
            dark:text-gray-400! 
            bg-gray-50! 
            dark:bg-gray-800/80! 
            border-gray-200! 
            dark:border-gray-700! 
            shadow-lg! 
            dark:shadow-gray-900/20! 
            z-10!
            min-w-[13rem]!
            left-auto!
            right-5! 
            md:right-10! 
            
            [&_.p-menu-start]:border-b! 
            [&_.p-menu-start]:border-slate-200! 
            [&_.p-menu-start]:dark:border-slate-700!

            [&_.p-menu-item-content]:bg-transparent! 
            [&_.p-menu-item-content]:hover:bg-transparent! 
            [&_.p-menu-item-content]:focus:bg-transparent! 
            [&_.p-menu-item-content]:shadow-none! 
            [&_.p-menu-item-link]:px-2! 
            [&_.p-menu-item-link]:py-1.5! 
            [&_.p-menu-item-content]:rounded-none! 
            [&_.p-menu-item-link]:text-gray-900! 
            [&_.p-menu-item-link]:dark:text-gray-100!
          "
        >
          <template
                v-if="isLoggedIn" 
                #start 
            >
              <button 
                v-ripple
                @click="goToUserArea"
                class="relative overflow-hidden w-full border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200">
                    <Avatar :image="avatarUrl" class="mr-2" shape="circle" />    
                    <span class="inline-flex flex-col items-start">
                        <span class="text-sm font-bold">Olá, {{ firstName }}</span>
                        <span class="text-sm">{{ userRoleLabel }}</span>
                    </span>
                </button>
            </template>
            <template #submenulabel="{ item }">
                <span class="text-primary font-bold">{{ item.label }}</span>
            </template>
            <template #item="{ item, props }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                    <span :class="item.icon" />
                    <span>{{ item.label }}</span>
                    <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                    <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                </a>
            </template>
        </Menu>
            </div>
            <Button
              :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
              rounded
              class="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
              :aria-label="darkMode ? 'Modo claro' : 'Modo escuro'"
              @click="toggleDarkMode"
            />
          </div>
        </div>
        <nav class="mt-3 md:mt-4" aria-label="Menu principal">
          <Menubar
            class="text-gray-600! dark:text-gray-400! bg-gray-50! dark:bg-gray-800/80! border-gray-200! dark:border-gray-700! p-1! hover:bg-gray-100! dark:hover:bg-gray-700/50! rounded-md!"
          >
            <template #start>
              <Menubar
                :model="itemsLeft"
                class="
                  hidden! 
                  md:flex! 
                  border-0! 
                  bg-transparent! 
                  [&_.p-menubar-item-link]:text-gray-600! 
                  [&_.p-menubar-item-link]:dark:text-gray-400! 
                  [&_.p-menubar-item-link]:hover:text-green-600! 
                  [&_.p-menubar-item-link]:dark:hover:text-green-400! 
                  [&_.p-menubar-item-link]:px-2! 
                  [&_.p-menubar-item-link]:py-1.5!  
                  
                  [&_.p-menubar-item-icon]:dark:text-gray-400! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:text-green-600! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:dark:text-green-400!
                  
                  [&_.p-focus]:text-green-600!
                  [&_.p-focus]:dark:text-green-400!

                  [&_.p-menubar-item-content]:bg-transparent! 
                  [&_.p-menubar-item-content]:hover:bg-transparent! 
                  [&_.p-menubar-item-content]:focus:bg-transparent! 
                  [&_.p-menubar-item-content]:shadow-none!
                  [&_.p-menubar-item-content]:rounded-none!"
              />
              <Button
                icon="pi pi-bars"
                text
                class="md:hidden!"
                aria-label="Menu"
                @click="mobileNavOpen = true"
              />
              <Dialog
                v-model:visible="mobileNavOpen"
                modal
                header="Menu"
                class="
                  w-[min(100%,20rem)] 
                  mx-4! 
                  border-0! 
                  bg-gray-100! 
                  dark:bg-gray-800! 
                  text-gray-900! 
                  dark:text-gray-100!
                "
                :dismissable-mask="true"
                :breakpoints="{ '576px': '100%' }"
              >
                <nav class="flex flex-col gap-1" aria-label="Menu mobile">
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-home"></i>  
                    Início
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/products"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-box"></i> 
                    Produtos
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/cart"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-shopping-cart"></i> 
                    Meu Carrinho
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/profile/favorites"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-heart"></i> 
                    Lista de Desejos
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/profile/edit"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-user"></i> 
                    Minha Conta
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/profile/orders"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-shopping-bag"></i> 
                    Meus Pedidos
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/profile/tracking"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-truck"></i> 
                    Rastrear Pedido
                  </RouterLink>
                  <RouterLink
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/checkout"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-check"></i> 
                    Finalizar Pedido
                  </RouterLink>
                  <RouterLink
                    v-if="!isLoggedIn"
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/login"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-sign-in"></i> 
                    Entrar
                  </RouterLink>
                  <RouterLink
                    v-if="!isLoggedIn"
                    :class="linkClass"
                    active-class="!bg-blue-500/20 !text-blue-800 dark:!text-blue-200 font-semibold"
                    to="/register"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-user-plus"></i> 
                    Cadastro
                  </RouterLink>
                  <RouterLink
                    v-if="isAdminUser"
                    class="px-2 py-1.5 rounded-md text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/40"
                    to="/admin"
                    @click="mobileNavOpen = false"
                  >
                    <i class="pi pi-cog"></i> 
                    Painel Admin
                  </RouterLink>
                </nav>
              </Dialog>
            </template>

            <template #end>
              <div class="relative md:hidden w-full max-w-sm">
                <InputText
                  ref="searchInput"
                  v-model="search"
                  placeholder="Buscar produtos..."
                  class="w-full pr-20 pl-3 h-10 transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700! focus:ring-2 focus:ring-primary/50 focus:outline-none! rounded-md!"
                  @keyup.enter="handleSearch"
                />
                
                <Button
                  icon="pi pi-search"
                  text
                  class="!absolute right-1 top-1/2 -translate-y-1/2 !h-8 !w-8 !p-0 flex items-center justify-center text-gray-600! dark:text-green-400!"
                  @click="handleSearch"
                />

                <i
                  v-if="search"
                  class="pi pi-times absolute right-10 top-1/2 -translate-y-1/2 text-[.75rem]! text-gray-600! dark:text-green-400! cursor-pointer flex items-center justify-center w-3 h-3"
                  @click="search = ''"
                />
              </div>
              <div></div>
            </template>
          </Menubar>
        </nav>
      </div>
    </header>

    <main class="max-w-[1320px] mx-auto px-3 sm:px-6 pb-10 pt-4 md:pt-6">
      <router-view />
    </main>

    <footer
      class="footer bg-emerald-950 dark:bg-slate-800 relative text-gray-200 dark:text-gray-200"
    >
      <div class="container relative max-w-[1320px] mx-auto px-3 sm:px-6 pb-0">
        <div class="grid grid-cols-12">
          <div class="col-span-12">
            <div class="py-5 md:py-15 px-0">
              <div class="grid md:grid-cols-12 grid-cols-1 gap-6">
                <div class="lg:col-span-3 md:col-span-12">
                  <div class="min-w-0">
                    <RouterLink
                      to="/"
                      class="flex items-center gap-2 text-[3rem] sm:text-[2rem] font-bold m-0 no-underline text-gray-100 hover:opacity-90 truncate"
                      ><svg
                        class="text-[2rem] size-7"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>

                      {{ storeTitle }}
                    </RouterLink>
                    <p
                      class="m-0 text-xs sm:text-base text-gray-200 line-clamp-2"
                    >
                      {{ storeTagline }}
                    </p>
                  </div>
                  <p class="mt-6 text-gray-300">
                    Eleve seu estilo com nossos produtos. Compre com confiança e
                    destaque seu visual único em cada detalhe.
                  </p>
                  <ul class="flex gap-2 mt-6">
                    <li>
                      <a
                        href="https://instagram.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-instagram h-4 w-4 align-middle"
                          title="instagram"
                        >
                        </i>
                    </a>
                    </li>
                    <li>
                    <a
                        href="https://facebook.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-facebook h-4 w-4 align-middle"
                          title="facebook"
                        >
                        </i>
                    </a>
                    </li>
                    <li>
                    <a
                        href="https://linkedin.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-linkedin h-4 w-4 align-middle"
                          title="linkedin"
                        >
                        </i>
                    </a>
                    </li>
                    <li>
                    <a
                        href="https://twitter.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-twitter h-4 w-4 align-middle"
                          title="twitter"
                        >
                        </i>
                    </a>
                      
                    </li>
                    <li>
                    <a
                        href="https://youtube.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-youtube h-4 w-4 align-middle"
                          title="youtube"
                        >
                        </i>
                    </a>
                      
                    </li>
                    <li>
                    <a
                        href="https://tiktok.com/"
                        target="_blank"
                        class="size-8 inline-flex items-center justify-center tracking-wide align-middle text-base border border-gray-800 dark:border-slate-800 rounded-md hover:text-primary dark:hover:text-primary text-slate-300"
                        ><i
                          class="pi pi-tiktok h-4 w-4 align-middle"
                          title="tiktok"
                        >
                        </i>
                    </a>
                  </li>
                </ul>
                </div>
                <div class="lg:col-span-6 md:col-span-12">
                  <h5 class="tracking-[1px] text-gray-100 font-semibold">
                    Categorias populares
                  </h5>
                  <div class="grid md:grid-cols-12 grid-cols-1">
                    <div class="md:col-span-4">
                      <ul class="list-none footer-list mt-6">
                        <li v-for="c in firstColumn" :key="c.id" class="mt-2.5">
                          <RouterLink
                            :to="{ name: 'category', params: { slug: c.slug } }"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            {{ c.name }}
                          </RouterLink>
                        </li>
                      </ul>
                    </div>
                    <div class="md:col-span-4">
                      <ul class="list-none footer-list mt-6">
                        <li
                          v-for="c in secondColumn"
                          :key="c.id"
                          class="mt-2.5"
                        >
                          <RouterLink
                            :to="{ name: 'category', params: { slug: c.slug } }"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            {{ c.name }}
                          </RouterLink>
                        </li>
                      </ul>
                    </div>
                    <div class="md:col-span-4">
                      <ul class="list-none footer-list mt-6">
                        <li class="mt-2.5">
                          <RouterLink
                            to="/profile/edit"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Minha Conta
                          </RouterLink>
                        </li>
                        <li class="mt-2.5">
                          <RouterLink
                            to="/profile/orders"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Meus Pedidos
                          </RouterLink>
                        </li>
                        <li class="mt-2.5">
                          <RouterLink
                            to="/profile/favorites"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Lista de desejos
                          </RouterLink>
                        </li>
                        <li class="mt-2.5">
                          <RouterLink
                            to="/profile/tracking"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Rastrear pedido
                          </RouterLink>
                        </li>
                        <li class="mt-2.5">
                          <RouterLink
                            to="/cart"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Meu carrinho
                          </RouterLink>
                        </li>
                        <li class="mt-2.5">
                          <RouterLink
                            to="/checkout"
                            class="text-gray-300 hover:text-gray-400 duration-500 ease-in-out"
                          >
                            <i class="pi pi-angle-right"></i>
                            Finalizar pedido
                          </RouterLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-3 md:col-span-4">
                  <h5 class="tracking-[1px] text-gray-100 font-semibold">
                    Boletim informativo
                  </h5>
                  <p class="mt-6">
                    Cadastre-se e receba as dicas mais recentes por e-mail.
                  </p>
                  <form @submit.prevent="handleSubscribe">
                    <div class="grid grid-cols-1">
                      <div class="my-3">
                        <label class="form-label">
                          Informe um e-mail válido
                          <span class="text-red-600">*</span>
                        </label>

                        <div class="form-icon relative mt-2">
                          <i
                            class="pi pi-envelope absolute top-1/2 start-4 -translate-y-1/2"
                          ></i>

                          <input
                            v-model="email"
                            type="email"
                            class="ps-12 rounded-sm w-full py-2 px-3 h-10 bg-emerald-800 dark:bg-slate-900 border-0 text-gray-100 outline-none"
                            placeholder="E-mail"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        class="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                        :aria-label="loading ? 'Enviando...' : 'Inscreva-se'"
                        :disabled="loading"
                      >
                        {{ loading ? "Enviando..." : "Inscreva-se" }}
                      </Button>

                      <p v-if="message" class="mt-3 text-sm text-green-400">
                        {{ message }}
                      </p>

                      <p v-if="error" class="mt-3 text-sm text-red-400">
                        {{ error }}
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="py-7.5 px-0 border-t border-slate-800 dark:border-slate-700">
        <div class="max-w-[1320px] mx-auto px-3 sm:px-6 pb-0">
          <div class="relative text-center">
            <div class="grid md:grid-cols-2 items-center">
              <div class="md:text-start text-center">
                <p>
                  &copy; {{ new Date().getFullYear() }} {{ storeTitle }}. Todos
                  os direitos reservados. Feito para o Hackathon - Fullstack.
                </p>
              </div>

              <div class="flex items-center justify-center md:justify-center xl:justify-end">
                <span class="mt-6 md:mt-0 mr-4">Aceitamos:</span>
              <ul class="flex list-none md:text-end text-center mt-6 md:mt-0 gap-2 justify-center md:justify-end">
                <li class="inline">
                  <a href="#"
                    ><img
                      src="/assets/images/payments/american-express.jpg"
                      class="max-h-6 rounded-sm inline"
                      title="American Express"
                      alt=""
                  /></a>
                </li>
                <li class="inline">
                  <a href="#"
                    ><img
                      src="/assets/images/payments/discover.jpg"
                      class="max-h-6 rounded-sm inline"
                      title="Discover"
                      alt=""
                  /></a>
                </li>
                <li class="inline">
                  <a href="#"
                    ><img
                      src="/assets/images/payments/mastercard.jpg"
                      class="max-h-6 rounded-sm inline"
                      title="Master Card"
                      alt=""
                  /></a>
                </li>
                <li class="inline">
                  <a href="#"
                    ><img
                      src="/assets/images/payments/paypal.jpg"
                      class="max-h-6 rounded-sm inline"
                      title="Paypal"
                      alt=""
                  /></a>
                </li>
                <li class="inline">
                  <a href="#"
                    ><img
                      src="/assets/images/payments/visa.jpg"
                      class="max-h-6 rounded-sm inline"
                      title="Visa"
                      alt=""
                  /></a>
                </li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <Button
      v-show="showTop"
      @click="scrollToTop"
      rounded
      icon="pi pi-angle-up"
      aria-label="Voltar ao topo"
      class="fixed! bottom-5! end-5! z-50! flex items-center justify-center
         w-10 h-10 sm:w-9 sm:h-9
         rounded-full shadow-lg
         
         bg-gray-900 text-white
         hover:bg-gray-700
         
         dark:bg-gray-100 dark:text-gray-900
         dark:hover:bg-gray-300
         
         border border-gray-900 dark:border-gray-200
         
         transition-all duration-300 opacity-80 hover:opacity-100"
    />
  </div>
</template>
