import { User, UserRole } from "./classes/User";
import { Cart } from "./classes/Cart";
import type { Category } from "./models/Category";
import type { Product } from "./models/Product";

const instrumentos: Category = { id: 1, title: "Instrumentos Musicais" };
const roupas: Category = { id: 2, title: "Roupas" };
const livros: Category = { id: 3, title: "Livros" };

const guitarra: Product = {
  id: 1,
  name: "Guitarra",
  price: 400,
  category: instrumentos,
};

const camiseta: Product = {
  id: 2,
  name: "Camiseta",
  price: 100,
  category: roupas,
};

const typescript: Product = {
  id: 3,
  name: "Livro de TypeScript",
  price: 80,
  category: livros,
};

const violao: Product = {
  id: 4,
  name: "Violão",
  price: 350,
  category: instrumentos,
};

const usuario: User = new User(
  1,
  "isaiasoliveira",
  "isaiaswebnet@gmail.com",
  UserRole.CUSTOMER
);

const carrinho: Cart = new Cart();

carrinho.addItem(guitarra, 1);
carrinho.addItem(camiseta, 2);
carrinho.addItem(guitarra, 1);

console.log("Usuário:", usuario.username, "- Role:", usuario.role);
console.log("Itens no carrinho:", JSON.stringify(carrinho.getItems(), null, 2));
console.log("Total de itens:", carrinho.getTotalItems());
console.log("Valor total: R$", carrinho.getFinalPrice().toFixed(2));

