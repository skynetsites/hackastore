<script lang="ts">
import { defineComponent } from "vue";
import type { StoreThemePreference } from "@shared/models/StoreSettings";
import { DEFAULT_HOME_BANNER_IMAGES } from "../constants/homeBannerDefaults";
import { storeSettingsService } from "../services/storeSettingsService";

export default defineComponent({
  name: "AdminSettingsView",

  data() {
    const base = storeSettingsService.get();
    return {
      form: {
        ...base,
        homeBannerImages: [...(base.homeBannerImages ?? [])],
        homeBannerLinks: [...(base.homeBannerLinks ?? [])],
      },
      saving: false,
      bannerUrlDraft: "",
      bannerLinkDraft: "",
    };
  },

  computed: {
    fixedBannerImages(): { image: string; link: string }[] {
      return DEFAULT_HOME_BANNER_IMAGES;
    },
    extraBannerImages(): { image: string; link: string }[] {
      return this.form.homeBannerImages.map((img, idx) => ({
        image: img,
        link: this.form.homeBannerLinks[idx] || "/home",
      }));
    },
    allBanners(): { image: string; link: string }[] {
  return [
    ...this.fixedBannerImages,
    ...this.extraBannerImages,
  ];
},
  },

  methods: {
    save(): void {
      if (!this.form.storeName.trim()) {
        this.$toast.add({ severity: "warn", summary: "Nome da loja", detail: "Informe o nome da loja.", life: 3000 });
        return;
      }
      if (!this.form.paymentSettings.whatsappNumber.trim()) {
        this.$toast.add({ severity: "warn", summary: "WhatsApp", detail: "Informe o número do WhatsApp.", life: 3000 });
        return;
      }
      if (!this.form.paymentSettings.pixKey.trim()) {
        this.$toast.add({ severity: "warn", summary: "PIX", detail: "Informe a chave PIX.", life: 3000 });
        return;
      }

      // Apenas 1 banner extra
      const banner = this.form.homeBannerImages.slice(0, 1).filter(x => x.trim());
      const link = this.form.homeBannerLinks.slice(0, 1).map(l => l.trim());

      this.saving = true;
      try {
        this.form = storeSettingsService.update({
          storeName: this.form.storeName.trim(),
          tagline: this.form.tagline.trim(),
          themePreference: this.form.themePreference as StoreThemePreference,
          contactEmail: this.form.contactEmail.trim(),
          generalNotes: this.form.generalNotes.trim(),
          homeBannerImages: banner,
          homeBannerLinks: link,
          paymentSettings: {
            whatsappNumber: this.form.paymentSettings.whatsappNumber.trim(),
            pixKey: this.form.paymentSettings.pixKey.trim(),
            pixQrCode: this.form.paymentSettings.pixQrCode?.trim() || "",
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
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      this.form.paymentSettings.pixQrCode = dataUrl;
    },

    maxBannerReached(): boolean {
      return this.form.homeBannerImages.length >= 1;
    },

    addBannerUrl(): void {
  const url = this.bannerUrlDraft.trim();
  const link = this.bannerLinkDraft.trim() || "/home";
  
  if (!url && this.form.homeBannerImages.length === 0) {
    this.$toast.add({
      severity: "warn",
      summary: "Informe uma URL ou faça upload",
      life: 2000,
    });
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

  // ✅ Se tiver URL → usa URL
  if (url) {
    this.form.homeBannerImages = [url];
  }

  // ✅ Sempre define link
  this.form.homeBannerLinks = [link];

  this.bannerUrlDraft = "";
  this.bannerLinkDraft = "";
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

  if (!this.bannerLinkDraft.trim()) {
  this.$toast.add({
    severity: "warn",
    summary: "Informe o link",
    detail: "Digite o link antes de fazer upload.",
    life: 3000,
  });
  return;
}

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // ✅ AQUI ESTÁ A CORREÇÃO
  this.form.homeBannerImages = [dataUrl];
  this.form.homeBannerLinks = [
    this.bannerLinkDraft.trim() || "/home"
  ];

  // opcional: limpar campos
  this.bannerUrlDraft = "";
  this.bannerLinkDraft = "";

  input.value = "";
},

    removeBanner(): void {
  this.form.homeBannerImages = [];
  this.form.homeBannerLinks = [];
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
        <select id="stheme" v-model="form.themePreference" class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
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
  v-for="(banner, idx) in allBanners"
  :key="'all-' + idx"
  class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20"
>
  <RouterLink
    :to="banner.link"
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-1"
  >
    <img
      :src="banner.image"
      :alt="'Slide ' + (idx + 1)"
      class="w-full sm:w-28 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
    />
    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Slide {{ idx + 1 }}</span>
        <Tag
          :severity="!extraBannerImages.includes(banner) ? 'success' : 'info'"
          :value="!extraBannerImages.includes(banner) ? 'Padrão da loja' : 'Adicionado na loja'"
          class="text-xs!"
        />
      </div>
      <p class="m-0 text-[11px] text-gray-500 dark:text-gray-400 break-all font-mono leading-snug">
        {{ banner.link }}
      </p>
    </div>
  </RouterLink>

  <Button
    v-if="extraBannerImages.includes(banner)"
    icon="pi pi-trash"
    severity="danger"
    text
    outlined
    @click="removeBanner"
  />
</li>
</ul>
      </div>

<div class="flex flex-col gap-2 items-stretch max-w-xl w-full">
  <p class="text-base font-semibold mb-1">
    Adicionar o 4ª slide no banner (salva nas configurações)
  </p>
  <div class="flex flex-col gap-1 flex-1 min-w-0">
    <label class="text-sm font-medium" for="blink">Link da 4ª imagem</label>
      <InputText
        id="blink"
        v-model="bannerLinkDraft"
        placeholder="/home ou URL completa"
        class="w-full"
      />
  </div>
  <div class="flex flex-col gap-1 flex-1 min-w-0">
    <label class="text-sm font-medium" for="burl">URL da 4ª imagem</label>
      <InputText
        id="burl"
        v-model="bannerUrlDraft"
        placeholder="https://..."
        class="w-full"
        :disabled="!bannerLinkDraft.trim()"
      />
  </div>
  <div class="flex flex-col gap-1 max-w-xl">
    <label class="text-sm font-medium">Upload da 4ª imagem</label>
      <input
        type="file"
        accept="image/*"
        class="text-sm w-full rounded-lg border border-gray-400 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3"
        :disabled="!bannerLinkDraft.trim() || maxBannerReached()"
        @change="onBannerFiles"
      />
  </div>
  <Button
    label="Adicionar"
    :disabled="!bannerLinkDraft.trim() || (bannerUrlDraft.trim() === '' && form.homeBannerImages.length === 0)"
    @click="addBannerUrl"
  />
</div>

      <div
  v-if="form.homeBannerImages.length > 0"
  class="flex flex-col gap-3 max-w-2xl w-full hidden"
>
  <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">
    4ª slide (salva nas configurações)
  </p>

  <ul class="m-0 p-0 list-none space-y-2">
    <li
      v-for="(banner, idx) in extraBannerImages"
      :key="'extra-' + idx"
      class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20"
    >
      <RouterLink
        :to="banner.link"
        class="w-full sm:w-28 h-20 block rounded-md overflow-hidden border border-gray-200 dark:border-gray-600"
      >
        <img
          :src="banner.image"
          :alt="'Slide extra ' + (idx + 1)"
          class="w-full h-full object-cover"
        />
      </RouterLink>

      <div class="flex flex-col gap-1 flex-1 min-w-0">
        <span class="text-sm font-medium">
          Slide extra {{ idx + 1 }}
        </span>

        <p class="text-xs break-all">
          {{ banner.link }}
        </p>
      </div>

    <Button
        icon="pi pi-trash"
        severity="danger"
        outlined
        @click="removeBanner"
      />
    </li>
  </ul>
</div>


      <Divider />

      <h2 class="text-base font-semibold m-0">Pagamentos (paymentSettings)</h2>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="wa">WhatsApp</label>
        <InputText id="wa" v-model="form.paymentSettings.whatsappNumber" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="pix">Chave PIX</label>
        <InputText id="pix" v-model="form.paymentSettings.pixKey" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">QR Code PIX</label>
        <input type="file" accept="image/*" class="text-sm w-full rounded-lg border border-gray-400 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3 mb-2" @change="onQrFile" />
        <img v-if="form.paymentSettings.pixQrCode" :src="form.paymentSettings.pixQrCode" alt="QR PIX"
             class="max-w-64 rounded border border-gray-200 dark:border-gray-600 bg-white p-2" />
      </div>

      <div class="flex flex-wrap gap-2">
        <Button label="Salvar" icon="pi pi-save" :loading="saving" @click="save" />
        <Button label="Restaurar padrões" severity="secondary" outlined icon="pi pi-refresh" @click="reset" />
      </div>
    </div>
  </div>
</template>