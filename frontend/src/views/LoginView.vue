<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "../services/authService";

export default defineComponent({
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
      loading: false,
    };
  },

  methods: {
    async submit(): Promise<void> {
      this.loading = true;
      try {
        const res = authService.login(this.email, this.password);
        if (!res.ok) {
          this.$toast.add({
            severity: "error",
            summary: "Falha no login",
            detail: res.error,
            life: 4000,
          });
          return;
        }
        this.$toast.add({
          severity: "success",
          summary: "Bem-vindo",
          detail: res.user.name,
          life: 2500,
        });
        const redirect = this.$route.query.redirect;
        const path = typeof redirect === "string" && redirect ? redirect : "/";
        await this.$router.replace(path);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<template>
  <section class="max-w-md mx-auto">
    <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
      <template #title>
        <span class="text-lg font-semibold text-gray-800! dark:text-gray-200!">Entrar</span>
      </template>
      <template #content>
        
          <p class="flex flex-col text-base bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 pt-2 mb-2 rounded-md">
            <strong>Acesso demo admin:</strong>
            <code class="text-sm">admin@loja.com</code>
            <code class="text-sm">admin123</code>
          </p>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="email">E-mail</label>
            <InputText 
              id="email" 
              v-model="email" 
              type="email" 
              autocomplete="email"
              required 
        class="
          w-full
          transition-colors! 
          bg-gray-200!
          dark:bg-gray-900!
          text-gray-900! 
          dark:text-gray-100! 
          border-gray-300! 
          dark:border-gray-700! 
          focus:ring-2 
          focus:ring-primary/50 
          focus:outline-none! 
          rounded-md!
        "
              />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="password">Senha</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggle-mask
              required
              class="
                [&_.p-inputtext]:w-full 
                [&_.p-inputtext]:transition-colors! 
                [&_.p-inputtext]:bg-gray-200! 
                [&_.p-inputtext]:dark:bg-gray-900! 
                [&_.p-inputtext]:text-gray-900! 
                [&_.p-inputtext]:dark:text-gray-100! 
                [&_.p-inputtext]:border-gray-300! 
                [&_.p-inputtext]:dark:border-gray-700! 
                [&_.p-inputtext]:focus:ring-2 
                [&_.p-inputtext]:focus:ring-primary/50 
                [&_.p-inputtext]:focus:outline-none!
              "
            />
          </div>
          <Button type="submit" label="Entrar" class="w-full" icon="pi pi-sign-in" :loading="loading" />
          <p class="text-base text-center m-0 text-gray-600 dark:text-gray-400">
            Não tem conta?
            <RouterLink
              class="text-blue-700 dark:text-blue-300 font-semibold"
              :to="{ name: 'register', query: $route.query }"
            >
              Cadastre-se
            </RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </section>
</template>
