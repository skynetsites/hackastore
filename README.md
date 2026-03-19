# Evoluindo a UI com PrimeVue & Tailwind - Sistema de Carrinho de Compras

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vue.js](https://img.shields.io/badge/Vue.js-3-green?logo=vue.js)
![PrimeVue](https://img.shields.io/badge/PrimeVue-3-00bcd4?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Status](https://img.shields.io/badge/status-estudo-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Descrição do projeto

Este projeto implementa uma **simulação de e-commerce** utilizando
**TypeScript, Programação Orientada a Objetos e Vue.js (Options API)**.

A aplicação foi evoluída com o uso de **PrimeVue** e **Tailwind CSS**,
proporcionando uma interface moderna, responsiva e mais próxima de
aplicações reais.

A arquitetura do projeto é dividida em duas partes:

1.  **Backend (Node + TypeScript)**\
    Responsável pela lógica de negócio utilizando Programação Orientada
    a Objetos, com classes como `Cart` e modelos (`Product`, `Category`,
    `CartItem`).

2.  **Frontend (Vue.js + Options API + PrimeVue + Tailwind CSS)**\
    Interface responsável pela interação com o usuário, incluindo:

    -   Listagem de produtos com componentes reutilizáveis
    -   Adição e remoção de itens do carrinho
    -   Controle de quantidade com `InputNumber`
    -   Confirmação de ações com `ConfirmDialog`
    -   Layout responsivo com Tailwind

O objetivo é simular um fluxo real de e-commerce, aplicando boas
práticas de organização, tipagem e construção de interfaces modernas.

## Preview

Interface de e-commerce com:

-   Grid responsivo de produtos (Tailwind CSS)
-   Componentes do PrimeVue (`Card`, `Button`, `DataView`, `InputNumber`)
-   Controle de quantidade com botões
-   Remoção de itens com confirmação
-   Estado vazio do carrinho
-   Troca de tema (DarkMode usando a classe dark: Tailwind CSS)
-   Cálculo automático de total de itens e valor

## Estrutura do projeto

```
evoluindo-ui-primevue-tailwind/
├── frontend/ 
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmptyCart.vue
│   │   │   └── ProductCard.vue
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── style.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── src/
│   ├── classes/
│   │   ├── Cart.ts
│   │   └── User.ts
│   ├── models/
│   │   ├── CartItem.ts
│   │   ├── Category.ts
│   │   └── Product.ts
│   └── index.ts
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```
## Tecnologias utilizadas

- **TypeScript** (tipagem forte, sem `any`)
- **Node.js** (execução do exemplo em `src/index.ts`)
- **Vue 3** (Options API: `data`, `methods`, `props`)
- **PrimeVue** (Componente Cardm: `<Card>`, Botão: `<Button>`, Confirmação: `<ConfirmDialog>`)
- **Tailwind CSS** (DarkMode `classes dark`, Espaçamentos `classes p-<number>`, sombras `shadow-lg`)
- **Vite** (build e dev do frontend)
- **POO** (classes `Cart` e `User`; interfaces Category, Product, CartItem)

## Implementação com PrimeVue & Tailwind CSS

A interface do projeto foi construída utilizando componentes do **PrimeVue** combinados com utilitários do **Tailwind CSS**, garantindo uma UI moderna, responsiva e consistente.

### Componente de Produto (`Card` + `Button`)

```vue
<Card class="shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800">
  <template #title>
    <span class="text-gray-900 dark:text-gray-100 font-semibold">
      {{ product.name }}
    </span>
  </template>

  <template #content>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      {{ priceBR }}
    </p>

    <Button
      label="Adicionar"
      icon="pi pi-shopping-cart"
      class="w-full bg-emerald-600 hover:bg-emerald-700 border-none"
      @click="$emit('add-to-cart')"
    />
  </template>
</Card>
```
### Controle de Quantidade (InputNumber)

```vue
<InputNumber
  v-model="item.quantity"
  :min="0"
  show-buttons
  class="
    [&_input]:w-12!
    [&_input]:text-sm!
    [&_input]:bg-transparent!
  "
  @update:modelValue="(value) =>
    value === 0
      ? confirmRemoveItem(item.product.id, item.product.name)
      : setQuantity(item.product.id, value)
  "
/>
```
### Confirmação de Remoção (ConfirmDialog)

```ts
this.$confirm.require({
  message: `Deseja remover ${productName} do carrinho?`,
  header: 'Confirmação',
  icon: 'pi pi-exclamation-triangle',
  acceptLabel: 'Sim',
  rejectLabel: 'Cancelar',
  accept: () => this.removeItem(productId)
});
```

```vue
<ConfirmDialog />
```

### Dark Mode com Tailwind

```ts
toggleDarkMode(): void {
  this.darkMode = !this.darkMode;

  if (this.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```

```html
<div class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">...</div>
```
### Estilização com Tailwind CSS

- **Espaçamentos:** p-4, gap-4, mb-4
- **Sombras:** shadow-lg
- **Bordas:** rounded-lg, border
- **Responsividade:** grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4g

## Como executar o projeto

**Clone o repositório:**

```bash
git clone https://github.com/skynetsites/evoluindo-ui-primevue-tailwind.git
```
**Entre na pasta do projeto:**

```bash
cd evoluindo-ui-primevue-tailwind
```

**Instale as dependências:**

```bash
npm install
```
**Execute o projeto (Backend):**

Na raiz do projeto:

```bash
npm run start:prod
```

**Execute o projeto (Frontend/Vue.js/PrimeVue)**

Na pasta do frontend:

```bash
cd frontend
npm install
npm run dev
```

Abra no navegador o endereço indicado pelo Vite (geralmente `http://localhost:5173`).

**Para build de produção:**

```bash
cd frontend
npm run build
npm run preview
```

## Aprendizados

Durante o desenvolvimento desta atividade foi possível praticar:

- Tipagem forte utilizando TypeScript
- Integração de PrimeVue com Vue.js
- Estilização com Tailwind CSS
- Responsividade com grid
- Uso de componentes interativos
- Criação de interfaces para modelar dados
- Uso de Enum para controle de permissões
- Aplicação de Programação Orientada a Objetos
- Manipulação de arrays com `.some()` e `.reduce()`
- Organização de projetos TypeScript, Vue.js, PrimeVue e Tailwind CSS 

## Resultado

A utilização de PrimeVue junto ao Tailwind CSS permitiu criar uma interface mais rica e interativa, com componentes reutilizáveis e estilização consistente, mantendo a simplicidade da Options API e a organização do projeto.

A aplicação evoluiu para uma interface moderna, interativa e responsiva,
aproximando-se de um e-commerce real.

## Deploy

O projeto está publicado e pode ser acessado diretamente pelo navegador:

**Acesse a aplicação:** https://evoluindo-ui-primevue-tailwind.vercel.app/

> Não é necessário instalação — basta abrir o link.

## Contribuição

Se quiser contribuir com feedback ou sugestões, fique à vontade para abrir uma **[Issue](https://github.com/skynetsites/evoluindo-ui-primevue-tailwind/issues)** ou **[enviar ideias](https://github.com/skynetsites/evoluindo-ui-primevue-tailwind/pulls)**. 

## Licença

Este projeto está licenciado sob a **Licença MIT**.

Veja o arquivo **[LICENSE](./LICENSE)** para mais detalhes.

## Autor

Projeto desenvolvido por **Isaias Oliveira**.  
Conecte-se comigo no **[in/skynetsites](https://www.linkedin.com/in/skynetsites/)**
