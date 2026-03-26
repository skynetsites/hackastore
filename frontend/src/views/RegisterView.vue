<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "../services/authService";

export default defineComponent({
  name: "RegisterView",

  data() {
    return {
      name: "",
      email: "",
      password: "",
      loading: false,
    };
  },

  methods: {
    async submit(): Promise<void> {
      if (this.password.length < 4) {
        this.$toast.add({
          severity: "warn",
          summary: "Senha curta",
          detail: "Use pelo menos 4 caracteres.",
          life: 3000,
        });
        return;
      }
      this.loading = true;
      try {
        const res = authService.register({
          name: this.name,
          email: this.email,
          password: this.password,
        });
        if (!res.ok) {
          this.$toast.add({
            severity: "error",
            summary: "Cadastro",
            detail: res.error,
            life: 4000,
          });
          return;
        }
        authService.login(this.email, this.password);
        this.$toast.add({
          severity: "success",
          summary: "Conta criada",
          detail: "Você já está autenticado.",
          life: 3000,
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
        <span class="text-lg font-semibold text-gray-800! dark:text-gray-200!">Criar conta</span>
      </template>
      <template #content>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="name">Nome</label>
            <InputText 
              id="name" 
              v-model="name" 
              autocomplete="name" 
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
          <Button type="submit" label="Cadastrar" class="w-full" icon="pi pi-user-plus" :loading="loading" />
          <p class="text-base text-center m-0 text-gray-600 dark:text-gray-400">
            Já tem conta?
            <RouterLink class="text-blue-700 dark:text-blue-300 font-semibold" :to="{ name: 'login', query: $route.query }">
              Entrar
            </RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </section>
</template>
