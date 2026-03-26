<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { AttributeFacet, CatalogFacets } from "../utils/productFacets";
import type { CatalogFilterState } from "../utils/productFilter";
import { emptyFilterState } from "../utils/productFilter";
import { colorToCss } from "../utils/colorSwatch";

export default defineComponent({
  name: "ProductFiltersSidebar",

  props: {
    modelValue: {
      type: Object as PropType<CatalogFilterState>,
      required: true,
    },
    facets: {
      type: Object as PropType<CatalogFacets>,
      required: true,
    },
    categoryOptions: {
      type: Array as PropType<{ slug: string; name: string }[]>,
      default: () => [],
    },
    hideCategoryFilter: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue"],

  computed: {
    
    extraAttributeFacets(): AttributeFacet[] {
      const fixed = new Set(["material", "tipo", "gênero", "genero", "gender"]);
      return this.facets.attributes.filter((a) => !fixed.has(a.key.toLowerCase()));
    },
    characteristicRows(): { label: string; facet: AttributeFacet | undefined }[] {
      return (["Material", "Tipo", "Gênero"] as const).map((label) => ({
        label,
        facet: this.facetForCharacteristic(label),
      }));
    },
  },

  methods: {
    colorToCss,
    emitPatch(patch: Partial<CatalogFilterState>): void {
      this.$emit("update:modelValue", { ...this.modelValue, ...patch });
    },
    toggleInArray(arr: string[], value: string, checked: boolean): string[] {
      const set = new Set(arr);
      if (checked) set.add(value);
      else set.delete(value);
      return Array.from(set);
    },
    toggleCategory(slug: string, checked: boolean): void {
      const next = this.toggleInArray(this.modelValue.categorySlugs, slug, checked);
      this.emitPatch({ categorySlugs: next });
    },
    toggleColor(c: string, checked: boolean): void {
      this.emitPatch({ colors: this.toggleInArray(this.modelValue.colors, c, checked) });
    },
    toggleSize(s: string, checked: boolean): void {
      this.emitPatch({ sizes: this.toggleInArray(this.modelValue.sizes, s, checked) });
    },
    toggleBrand(b: string, checked: boolean): void {
      this.emitPatch({ brands: this.toggleInArray(this.modelValue.brands, b, checked) });
    },
    toggleAttribute(key: string, val: string, checked: boolean): void {
      const next = { ...this.modelValue.attributeValues };
      const cur = new Set(next[key] ?? []);
      if (checked) cur.add(val);
      else cur.delete(val);
      next[key] = Array.from(cur);
      this.emitPatch({ attributeValues: next });
    },
    clearAll(): void {
      this.$emit("update:modelValue", emptyFilterState());
    },
    
    facetForCharacteristic(label: string): AttributeFacet | undefined {
      const norm = (s: string) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const t = norm(label);
      return this.facets.attributes.find((a) => {
        const k = norm(a.key);
        if (t === "material" && k === "material") return true;
        if (t === "tipo" && k === "tipo") return true;
        if ((t === "genero" || t === "gênero") && (k === "genero" || k === "gênero" || k === "gender")) return true;
        return false;
      });
    },
    attrKeyForFacet(facet: AttributeFacet): string {
      return facet.key;
    },
    activeChips(): { label: string; remove: () => void }[] {
      const out: { label: string; remove: () => void }[] = [];
      const f = this.modelValue;
      if (f.search.trim()) {
        out.push({
          label: `Busca: ${f.search.trim()}`,
          remove: () => this.emitPatch({ search: "" }),
        });
      }
      if (f.minPrice != null) {
        out.push({
          label: `Min: R$ ${f.minPrice}`,
          remove: () => this.emitPatch({ minPrice: null }),
        });
      }

      if (f.maxPrice != null) {
        out.push({
          label: `Máx: R$ ${f.maxPrice}`,
          remove: () => this.emitPatch({ maxPrice: null }),
        });
      }

      f.categorySlugs.forEach((slug) => {
        const name = this.categoryOptions.find((c) => c.slug === slug)?.name ?? slug;
        out.push({
          label: `Categoria: ${name}`,
          remove: () =>
            this.emitPatch({
              categorySlugs: f.categorySlugs.filter((s) => s !== slug),
            }),
        });
      });
      f.colors.forEach((c) => {
        out.push({
          label: `Cor: ${c}`,
          remove: () => this.emitPatch({ colors: f.colors.filter((x) => x !== c) }),
        });
      });
      f.sizes.forEach((s) => {
        out.push({
          label: `Tam.: ${s}`,
          remove: () => this.emitPatch({ sizes: f.sizes.filter((x) => x !== s) }),
        });
      });
      f.brands.forEach((b) => {
        out.push({
          label: `Marca: ${b}`,
          remove: () => this.emitPatch({ brands: f.brands.filter((x) => x !== b) }),
        });
      });
      Object.entries(f.attributeValues).forEach(([key, vals]) => {
        vals.forEach((v) => {
          out.push({
            label: `${key}: ${v}`,
            remove: () => {
              const next = { ...f.attributeValues };
              next[key] = (next[key] ?? []).filter((x) => x !== v);
              this.emitPatch({ attributeValues: next });
            },
          });
        });
      });
      return out;
    },
  },
});
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-bold m-0">Filtros</h3>
      <Button label="Limpar" size="small" severity="secondary" text @click="clearAll" />
    </div>

    <div v-if="activeChips().length" class="flex flex-wrap gap-1">
      <Tag
        v-for="(chip, idx) in activeChips()"
        :key="idx"
        severity="secondary"
        class="text-xs!"
      >
        {{ chip.label }}
        <button
          type="button"
          class="ml-1 border-0 bg-transparent cursor-pointer p-0 text-inherit"
          aria-label="Remover"
          @click="chip.remove()"
        >
          ×
        </button>
      </Tag>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="pf-search">Busca</label>
      <InputText
        id="pf-search"
        :model-value="modelValue.search"
        class="w-full"
        placeholder="Nome do produto"
        @update:model-value="emitPatch({ search: String($event) })"
      />
    </div>

    <div class="space-y-2">
  <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">Preço</p>

  <div class="flex gap-2">
    <InputNumber
      :model-value="modelValue.minPrice"
      placeholder="Mín"
      class="w-full"
      @update:model-value="emitPatch({ minPrice: $event })"
    />

    <InputNumber
      :model-value="modelValue.maxPrice"
      placeholder="Máx"
      class="w-full"
      @update:model-value="emitPatch({ maxPrice: $event })"
    />
  </div>
</div>

    <!-- 2. Categorias -->
    <div v-if="!hideCategoryFilter" class="space-y-2">
      <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">Categorias</p>
      <p
        v-if="categoryOptions.length === 0"
        class="text-xs text-gray-500 dark:text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
      >
        Nenhuma categoria disponível no momento. Cadastre categorias no admin ou aguarde o carregamento da API.
      </p>
      <div v-else class="max-h-40 overflow-y-auto space-y-1 pr-1">
        <label
          v-for="c in categoryOptions"
          :key="c.slug"
          class="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            :binary="true"
            :model-value="modelValue.categorySlugs.includes(c.slug)"
            @update:model-value="toggleCategory(c.slug, Boolean($event))"
          />
          <span>{{ c.name }}</span>
        </label>
      </div>
    </div>

    <div class="hidden space-y-2">
      <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">Cor</p>
      <p
        v-if="facets.colors.length === 0"
        class=" text-xs text-gray-500 dark:text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
      >
        Nenhuma cor nos produtos listados. Os valores aparecerão quando houver dados.
      </p>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="c in facets.colors"
          :key="c"
          type="button"
          class="w-8 h-8 rounded-full border-2 shrink-0 transition ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
          :class="modelValue.colors.includes(c) ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'"
          :title="c"
          :style="{ backgroundColor: colorToCss(c) }"
          @click="toggleColor(c, !modelValue.colors.includes(c))"
        />
      </div>
    </div>

    <div class="hidden space-y-2">
      <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">Tamanho</p>
      <p
        v-if="facets.sizes.length === 0"
        class="text-xs text-gray-500 dark:text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
      >
        Nenhum tamanho nos produtos listados. Os valores aparecerão quando houver dados.
      </p>
      <div v-else class="flex flex-wrap gap-1">
        <label
          v-for="s in facets.sizes"
          :key="s"
          class="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer"
          :class="
            modelValue.sizes.includes(s)
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
              : 'border-gray-300 dark:border-gray-600'
          "
        >
          <Checkbox
            :binary="true"
            :model-value="modelValue.sizes.includes(s)"
            @update:model-value="toggleSize(s, Boolean($event))"
          />
          {{ s }}
        </label>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-gray-600 dark:text-gray-400 m-0">Características</p>

      <div class="flex flex-col gap-3 border-l-2 border-emerald-600/30 py-3">
        
        <div>
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 m-0 mb-1">Marca</p>
          <p
            v-if="facets.brands.length === 0"
            class="text-xs text-gray-500 dark:text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
          >
            Nenhuma marca nos produtos listados.
          </p>
          <div v-else class="max-h-40 overflow-y-auto space-y-1">
            <label
              v-for="b in facets.brands"
              :key="b"
              class="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                :binary="true"
                :model-value="modelValue.brands.includes(b)"
                @update:model-value="toggleBrand(b, Boolean($event))"
              />
              <span>{{ b }}</span>
            </label>
          </div>
        </div>

        <div v-for="row in characteristicRows" :key="row.label">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 m-0 mb-1">{{ row.label }}</p>
          <template v-if="row.facet">
            <p
              v-if="row.facet.values.length === 0"
              class="text-xs text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
            >
              Sem valores para este atributo no catálogo atual.
            </p>
            <div v-else class="flex flex-wrap gap-1">
              <label
                v-for="v in row.facet.values"
                :key="v"
                class="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer"
                :class="
                  (modelValue.attributeValues[row.facet.key] ?? []).includes(v)
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <Checkbox
                  :binary="true"
                  :model-value="(modelValue.attributeValues[row.facet.key] ?? []).includes(v)"
                  @update:model-value="toggleAttribute(row.facet.key, v, Boolean($event))"
                />
                {{ v }}
              </label>
            </div>
          </template>
          <p
            v-else
            class="text-xs text-gray-500 dark:text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
          >
            Nenhum dado de “{{ row.label }}” nos produtos. Use o formato “{{ row.label }}: valor” nos atributos extras
            do produto.
          </p>
        </div>

        <div v-for="attr in extraAttributeFacets" :key="attr.key" class="space-y-1">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 m-0 mb-1">{{ attr.key }}</p>
          <p
            v-if="attr.values.length === 0"
            class="text-xs text-gray-500 m-0 border border-dashed border-gray-300 dark:border-gray-600 rounded-md px-2 py-2"
          >
            Sem valores.
          </p>
          <div v-else class="flex flex-wrap gap-1">
            <label
              v-for="v in attr.values"
              :key="`${attr.key}-${v}`"
              class="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer"
              :class="
                (modelValue.attributeValues[attr.key] ?? []).includes(v)
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-gray-300 dark:border-gray-600'
              "
            >
              <Checkbox
                :binary="true"
                :model-value="(modelValue.attributeValues[attr.key] ?? []).includes(v)"
                @update:model-value="toggleAttribute(attr.key, v, Boolean($event))"
              />
              {{ v }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
