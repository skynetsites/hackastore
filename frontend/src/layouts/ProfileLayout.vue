<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "../services/authService";

export default defineComponent({
  name: "ProfileLayout",

  data() {
    return {
      menuItems: [
        { label: "Editar dados", icon: "pi pi-user-edit", to: "/profile/edit" },
        { label: "Meus pedidos", icon: "pi pi-shopping-bag", to: "/profile/orders" },
        { label: "Favoritos", icon: "pi pi-heart", to: "/profile/favorites" },
        { label: "Acompanhar entrega", icon: "pi pi-truck", to: "/profile/tracking" },
      ],
    };
  },

  computed: {
    user() {
      return authService.getCurrentUser();
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
  },

  methods: {
    logout(): void {
      authService.logout();
      this.$toast.add({
        severity: "info",
        summary: "Sessão encerrada",
        detail: "Até logo!",
        life: 2500,
      });
      this.$router.replace({ path: "/" });
    },
  },
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <aside class="lg:w-56 shrink-0">
      <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
        <template #title>
          <div 
            v-if="user"
            class="relative overflow-hidden w-full border-0 bg-transparent flex items-start mb-2">
                    <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png" class="mr-2" shape="circle" />
                    <span class="inline-flex flex-col items-start text-gray-800! dark:text-gray-200!">
                        <span class="text-sm font-bold">Olá, {{ firstName }}</span>
                        <span class="text-sm">{{ userRoleLabel }}</span>
                    </span>
                  </div>
          <span class="text-base text-gray-800! dark:text-gray-200! mb-3">Minha conta</span>
        </template>
        <template #content>
          <nav class="flex flex-col gap-1" aria-label="Área do usuário">
            <RouterLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm no-underline text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              active-class="!bg-blue-500/20 !font-semibold"
            >
              <i :class="item.icon" aria-hidden="true" />
              {{ item.label }}
            </RouterLink>
            <button
              type="button"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left w-full text-red-700 dark:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 border-0 bg-transparent cursor-pointer"
              @click="logout"
            >
              <i class="pi pi-sign-out" aria-hidden="true" />
              Sair
            </button>
          </nav>
        </template>
      </Card>
    </aside>
    <section class="flex-1 min-w-0">
      <router-view />
    </section>
  </div>
</template>
