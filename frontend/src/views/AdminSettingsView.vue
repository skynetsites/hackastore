<script lang="ts">
import { defineComponent } from "vue";
import type { StoreThemePreference } from "@shared/models/StoreSettings";
import { DEFAULT_HOME_BANNER_IMAGES } from "../constants/homeBannerDefaults";
import { storeSettingsService } from "../services/storeSettingsService";

export default defineComponent({
  name: "AdminSettingsView",

  computed: {
    
    fixedBannerImages(): readonly string[] {
      return DEFAULT_HOME_BANNER_IMAGES;
    },
  },

  data() {
    const base = storeSettingsService.get();
    return {
      form: {
        ...base,
        homeBannerImages: [...(base.homeBannerImages ?? [])],
      },
      saving: false,
      bannerUrlDraft: "",
    };
  },

  methods: {
    save(): void {
      if (!this.form.storeName.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "Nome da loja",
          detail: "Informe o nome da loja.",
          life: 3000,
        });
        return;
      }
      if (!this.form.paymentSettings.whatsappNumber.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "WhatsApp",
          detail: "Informe o número do WhatsApp (apenas dígitos com DDI).",
          life: 3000,
        });
        return;
      }
      if (!this.form.paymentSettings.pixKey.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "PIX",
          detail: "Informe a chave PIX.",
          life: 3000,
        });
        return;
      }
      const banner = this.form.homeBannerImages.slice(0, 1).filter((x) => typeof x === "string" && x.trim());
      this.saving = true;
      try {
        this.form = storeSettingsService.update({
          storeName: this.form.storeName.trim(),
          tagline: this.form.tagline.trim(),
          themePreference: this.form.themePreference as StoreThemePreference,
          contactEmail: this.form.contactEmail.trim(),
          generalNotes: this.form.generalNotes.trim(),
          homeBannerImages: banner,
          paymentSettings: {
            whatsappNumber: this.form.paymentSettings.whatsappNumber.trim(),
            pixKey: this.form.paymentSettings.pixKey.trim(),
            pixQrCode: this.form.paymentSettings.pixQrCode.trim(),
          },
        });
        this.$toast.add({ severity: "success", summary: "Configurações salvas", life: 2500 });
      } finally {
        this.saving = false;
      }
    },
    reset(): void {
      this.$confirm.require({
        message: "Restaurar valores padrão da loja?",
        header: "Confirmar",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.form = storeSettingsService.reset();
          this.$toast.add({ severity: "info", summary: "Padrões restaurados", life: 2500 });
        },
      });
    },
    async onQrFile(ev: Event): Promise<void> {
      const input = ev.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      this.form.paymentSettings.pixQrCode = dataUrl;
    },
    maxBannerReached(): boolean {
      return this.form.homeBannerImages.length >= 1;
    },
    addBannerUrl(): void {
      const u = this.bannerUrlDraft.trim();
      if (!u) {
        this.$toast.add({ severity: "warn", summary: "Informe uma URL", life: 2000 });
        return;
      }
      if (this.maxBannerReached()) {
        this.$toast.add({
          severity: "warn",
          summary: "Banner principal",
          detail: "Remova a imagem extra atual para substituir por outra.",
          life: 3000,
        });
        return;
      }
      this.form.homeBannerImages = [u];
      this.bannerUrlDraft = "";
    },
    async onBannerFiles(ev: Event): Promise<void> {
      const input = ev.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        input.value = "";
        return;
      }
      if (this.maxBannerReached()) {
        this.$toast.add({
          severity: "warn",
          summary: "Banner principal",
          detail: "Remova a imagem extra atual para substituir por outra.",
          life: 3000,
        });
        input.value = "";
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      this.form.homeBannerImages = [dataUrl];
      input.value = "";
    },
    removeBannerAt(index: number): void {
      this.form.homeBannerImages.splice(index, 1);
    },
  },
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-xl font-bold m-0">Configurações da loja</h1>
      <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Identidade, pagamentos (PIX / WhatsApp) e textos gerais — persistidos no localStorage.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 max-w-2xl w-full">
      <h2 class="text-base font-semibold m-0">Identidade</h2>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="sname">Nome da loja</label>
        <InputText id="sname" v-model="form.storeName" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="stag">Tagline</label>
        <InputText id="stag" v-model="form.tagline" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="stheme">Tema básico</label>
        <select
          id="stheme"
          v-model="form.themePreference"
          class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
        >
          <option value="system">Sistema (respeita o toggle do usuário)</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="semail">E-mail de contato</label>
        <InputText id="semail" v-model="form.contactEmail" type="email" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="snotes">Observações gerais</label>
        <Textarea id="snotes" v-model="form.generalNotes" rows="4" auto-resize class="w-full" />
      </div>

      <Divider />

      <h2 class="text-base font-semibold m-0">Banner principal (Home)</h2>
      <p class="text-xs text-gray-600 dark:text-gray-400 m-0 max-w-xl">
        As três primeiras imagens aparecem aqui como na loja (definidas no sistema). Opcionalmente acrescente uma
        <strong>4ª imagem</strong> por URL ou upload — só ela é salva no navegador.
      </p>

      <div class="flex flex-col gap-2 max-w-2xl w-full">
        <p class="text-xs font-medium text-gray-700 dark:text-gray-300 m-0">Imagens do carrossel (pré-visualização)</p>
        <ul class="m-0 p-0 list-none space-y-2">
          <li
            v-for="(src, idx) in fixedBannerImages"
            :key="'fixed-' + idx"
            class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20"
          >
            <img
              :src="src"
              :alt="'Slide ' + (idx + 1)"
              class="w-full sm:w-28 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
            />
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Slide {{ idx + 1 }}</span>
                <Tag severity="success" value="Padrão da loja" class="text-xs!" />
              </div>
              <p class="m-0 text-[11px] text-gray-500 dark:text-gray-400 break-all font-mono leading-snug">
                {{ src }}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end max-w-xl w-full">
        <div class="flex flex-col gap-1 flex-1 min-w-0">
          <label class="text-sm font-medium" for="burl">URL da 4ª imagem (opcional)</label>
          <InputText
            id="burl"
            v-model="bannerUrlDraft"
            class="w-full"
            placeholder="https://..."
            @keyup.enter="addBannerUrl"
          />
        </div>
        <Button
          label="Adicionar URL"
          icon="pi pi-link"
          class="shrink-0"
          :disabled="maxBannerReached()"
          @click="addBannerUrl"
        />
      </div>
      <div class="flex flex-col gap-1 max-w-xl">
        <label class="text-sm font-medium">Upload da 4ª imagem (opcional)</label>
        <input
          type="file"
          accept="image/*"
          class="text-sm w-full"
          :disabled="maxBannerReached()"
          @change="onBannerFiles"
        />
      </div>
      <div v-if="form.homeBannerImages.length" class="flex flex-col gap-3 max-w-2xl w-full">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">4ª slide (salva nas configurações)</p>
        <ul class="m-0 p-0 list-none space-y-2">
          <li
            v-for="(src, idx) in form.homeBannerImages"
            :key="'extra-' + idx"
            class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40"
          >
            <img
              :src="src"
              alt=""
              class="w-full sm:w-28 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
            />
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Slide 4</span>
                <Tag severity="info" value="Opcional · localStorage" class="text-xs!" />
              </div>
              <p class="m-0 text-[11px] text-gray-500 dark:text-gray-400 break-all font-mono leading-snug">
                {{ src.length > 120 ? src.slice(0, 120) + '…' : src }}
              </p>
            </div>
            <div class="flex flex-wrap gap-1 items-center justify-end sm:justify-start shrink-0">
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                aria-label="Remover"
                @click="removeBannerAt(idx)"
              />
            </div>
          </li>
        </ul>
      </div>

      <Divider />

      <h2 class="text-base font-semibold m-0">Pagamentos (paymentSettings)</h2>
      <p class="text-xs text-gray-600 dark:text-gray-400 m-0">
        WhatsApp (DDI + DDD + número), chave PIX e QR Code exibidos no checkout e na confirmação.
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="wa">WhatsApp (somente números, ex.: 5511999999999)</label>
        <InputText id="wa" v-model="form.paymentSettings.whatsappNumber" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="pix">Chave PIX</label>
        <InputText id="pix" v-model="form.paymentSettings.pixKey" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">QR Code PIX (imagem)</label>
        <input type="file" accept="image/*" class="text-sm" @change="onQrFile" />
        <img
          v-if="form.paymentSettings.pixQrCode"
          :src="form.paymentSettings.pixQrCode"
          alt="QR PIX"
          class="max-w-xs rounded border border-gray-200 dark:border-gray-600 bg-white p-2"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <Button label="Salvar" icon="pi pi-save" :loading="saving" @click="save" />
        <Button label="Restaurar padrões" severity="secondary" outlined icon="pi pi-refresh" @click="reset" />
      </div>
    </div>
  </div>
</template>
