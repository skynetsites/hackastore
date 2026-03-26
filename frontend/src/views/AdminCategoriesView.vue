<script lang="ts">
import { defineComponent } from "vue";
import type { LocalCategory } from "@shared/models/LocalCategory";
import { categoryService } from "../services/categoryService";

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default defineComponent({
  name: "AdminCategoriesView",

  data() {
    return {
      rows: [] as LocalCategory[],
      loading: false,
      dialogVisible: false,
      editingId: null as number | null,
      form: {
        name: "",
        slug: "",
        image: "" as string,
        imageUrl: "" as string,
      },
      pendingFileName: "" as string,
    };
  },

  mounted() {
    this.reload();
  },

  methods: {
    reload(): void {
      this.loading = true;
      try {
        this.rows = categoryService.list();
      } finally {
        this.loading = false;
      }
    },
    previewImage(c: LocalCategory): string {
      const img = (c.image ?? "").trim();
      return img || "https://placehold.co/120x72/e2e8f0/64748b?text=Sem+imagem";
    },
    openCreate(): void {
      this.editingId = null;
      this.form = { name: "", slug: "", image: "", imageUrl: "" };
      this.pendingFileName = "";
      this.dialogVisible = true;
    },
    openEdit(c: LocalCategory): void {
      this.editingId = c.id;
      this.form = {
        name: c.name,
        slug: c.slug,
        image: (c.image ?? "").trim(),
        imageUrl: "",
      };
      this.pendingFileName = "";
      this.dialogVisible = true;
    },
    onNameInput(): void {
      if (this.editingId !== null) return;
      this.form.slug = slugify(this.form.name);
    },
    onFile(e: Event): void {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        this.$toast.add({ severity: "warn", summary: "Selecione uma imagem", life: 2500 });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const r = reader.result;
        if (typeof r === "string") {
          this.form.image = r;
          this.form.imageUrl = "";
          this.pendingFileName = file.name;
        }
      };
      reader.readAsDataURL(file);
    },
    resolveImagePayload(): string {
      const url = this.form.imageUrl.trim();
      if (url) return url;
      return this.form.image.trim();
    },
    save(): void {
      const name = this.form.name.trim();
      if (!name) {
        this.$toast.add({ severity: "warn", summary: "Nome obrigatório", life: 2500 });
        return;
      }
      const imagePayload = this.resolveImagePayload();
      if (this.editingId === null) {
        if (!imagePayload) {
          this.$toast.add({
            severity: "warn",
            summary: "Imagem obrigatória",
            detail: "Envie um arquivo ou informe uma URL.",
            life: 4000,
          });
          return;
        }
        const res = categoryService.create({
          name,
          image: imagePayload,
          slug: this.form.slug.trim() || undefined,
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Categoria", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Categoria criada", life: 2500 });
      } else {
        const res = categoryService.update(this.editingId, {
          name,
          slug: this.form.slug.trim() || undefined,
          image: imagePayload || undefined,
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Categoria", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Atualizada", life: 2500 });
      }
      this.dialogVisible = false;
      this.reload();
    },
    confirmDelete(c: LocalCategory): void {
      this.$confirm.require({
        message: `Excluir categoria "${c.name}"?`,
        header: "Confirmar",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          const res = categoryService.remove(c.id);
          if (!res.ok) {
            this.$toast.add({ severity: "error", summary: "Exclusão", detail: res.error, life: 4000 });
            return;
          }
          this.$toast.add({ severity: "success", summary: "Removida", life: 2500 });
          this.reload();
        },
      });
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold m-0">Categorias</h1>
        <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          Nome, slug e imagem (upload base64 ou URL). Produtos do admin devem usar estas categorias.
        </p>
      </div>
      <Button label="Nova categoria" icon="pi pi-plus" @click="openCreate" />
    </div>

    <DataTable :value="rows" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <Column field="id" header="ID" />
      <Column header="Imagem" :exportable="false">
        <template #body="{ data }">
          <img
            :src="previewImage(data)"
            alt=""
            class="h-12 w-20 object-cover rounded border border-gray-200 dark:border-gray-700"
          />
        </template>
      </Column>
      <Column field="name" header="Nome" />
      <Column field="slug" header="Slug" />
      <Column header="Ações" :exportable="false">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="openEdit(data)" />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Excluir"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId === null ? 'Nova categoria' : 'Editar categoria'"
      class="w-[min(100%,28rem)]"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="cn">Nome *</label>
          <InputText id="cn" v-model="form.name" class="w-full" @input="onNameInput" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="cs">Slug</label>
          <InputText id="cs" v-model="form.slug" class="w-full" placeholder="auto a partir do nome" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="curl">URL da imagem (opcional se enviar arquivo)</label>
          <InputText id="curl" v-model="form.imageUrl" class="w-full" placeholder="https://..." />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="cfile">Upload de imagem</label>
          <input
            id="cfile"
            type="file"
            accept="image/*"
            class="text-sm"
            @change="onFile"
          />
          <small v-if="pendingFileName" class="text-xs text-gray-500">{{ pendingFileName }}</small>
        </div>
        <div v-if="resolveImagePayload()" class="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
          <img :src="resolveImagePayload()" alt="Preview" class="w-full max-h-40 object-contain" />
        </div>
        <Message v-if="editingId === null" severity="info" :closable="false" class="text-xs!">
          Imagem obrigatória no cadastro (arquivo ou URL).
        </Message>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Salvar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
