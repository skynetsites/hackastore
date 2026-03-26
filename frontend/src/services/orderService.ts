import type {
  Order,
  OrderCustomerSnapshot,
  OrderShippingAddress,
  OrderStatus,
} from "@shared/models/Order";
import type { PaymentMethod } from "@shared/models/Order";
import type { CartItem } from "@shared/models/CartItem";
import type { Product } from "@shared/models/Product";
import { STORAGE } from "./storageKeys";

function formatShippingLine(s: OrderShippingAddress): string {
  const line1 = [s.street, s.number].filter(Boolean).join(", ").trim();
  const parts = [line1, s.neighborhood, [s.city, s.state].filter(Boolean).join("/")].filter(Boolean);
  return parts.join(" — ").trim();
}

function migrateStatus(raw: string | undefined): OrderStatus {
  if (raw === "pending" || raw === "awaiting_payment") return "awaiting_payment";
  if (raw === "paid") return "paid";
  if (raw === "shipped") return "shipped";
  if (raw === "delivered") return "delivered";
  if (raw === "cancelled") return "cancelled";
  return "awaiting_payment";
}

function normalizeShipping(o: Partial<Order>): OrderShippingAddress {
  const s = o.shipping;
  if (s && typeof s === "object") {
    return {
      street: String(s.street ?? "").trim(),
      number: String(s.number ?? "").trim(),
      neighborhood: String(s.neighborhood ?? "").trim(),
      city: String(s.city ?? "").trim(),
      state: String(s.state ?? "").trim().toUpperCase().slice(0, 2),
    };
  }
  return {
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  };
}

function normalizeCustomer(o: Partial<Order>): OrderCustomerSnapshot {
  const c = o.customer;
  if (c && typeof c === "object") {
    return {
      fullName: String(c.fullName ?? "").trim(),
      email: String(c.email ?? "").trim().toLowerCase(),
      phone: String(c.phone ?? "").trim(),
      cpf: String(c.cpf ?? "").trim(),
    };
  }
  return { fullName: "", email: "", phone: "", cpf: "" };
}

function normalizeOrder(row: unknown): Order {
  const o = row as Partial<Order> & { status?: string };
  const status = migrateStatus(o.status);
  const paymentMethod: PaymentMethod =
    o.paymentMethod === "whatsapp" ? "whatsapp" : "pix";
  const rawItems = Array.isArray(o.items) ? (o.items as CartItem[]) : [];
  const items: CartItem[] = [];
  for (const i of rawItems) {
    if (!i?.product || typeof i.product.id !== "number") continue;
    items.push({
      quantity: Number(i.quantity ?? 0),
      variantNote: i.variantNote,
      product: {
        ...(i.product as Product),
        category: { ...i.product.category },
      },
    });
  }
  const shipping = normalizeShipping(o);
  const customer = normalizeCustomer(o);
  const legacy = String(o.shippingAddress ?? "").trim();
  const shippingAddress = legacy || formatShippingLine(shipping);
  return {
    id: String(o.id ?? ""),
    userId: Number(o.userId ?? 0),
    items,
    total: Number(o.total ?? 0),
    createdAt: String(o.createdAt ?? new Date().toISOString()),
    status,
    shippingAddress,
    customer,
    shipping,
    paymentMethod,
    paymentLink: typeof o.paymentLink === "string" ? o.paymentLink : "",
    whatsappMessageSnapshot:
      typeof o.whatsappMessageSnapshot === "string" ? o.whatsappMessageSnapshot : undefined,
  };
}

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE.ORDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE.ORDERS, JSON.stringify(orders));
}

function makeId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const orderService = {
  listForUser(userId: number): Order[] {
    return readOrders()
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listAll(): Order[] {
    return readOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): Order | null {
    return readOrders().find((o) => o.id === id) ?? null;
  },

  createFromCart(payload: {
    userId: number;
    items: CartItem[];
    total: number;
    customer: OrderCustomerSnapshot;
    shipping: OrderShippingAddress;
    paymentMethod: PaymentMethod;
    whatsappMessageSnapshot?: string;
  }): Order {
    const shippingAddress = formatShippingLine(payload.shipping);
    const order: Order = {
      id: makeId(),
      userId: payload.userId,
      items: payload.items.map((row) => ({
        quantity: row.quantity,
        variantNote: row.variantNote,
        product: {
          ...row.product,
          category: { ...row.product.category },
        },
      })),
      total: payload.total,
      createdAt: new Date().toISOString(),
      status: "awaiting_payment",
      shippingAddress,
      customer: {
        fullName: payload.customer.fullName.trim(),
        email: payload.customer.email.trim().toLowerCase(),
        phone: payload.customer.phone.trim(),
        cpf: payload.customer.cpf.trim(),
      },
      shipping: {
        street: payload.shipping.street.trim(),
        number: payload.shipping.number.trim(),
        neighborhood: payload.shipping.neighborhood.trim(),
        city: payload.shipping.city.trim(),
        state: payload.shipping.state.trim().toUpperCase().slice(0, 2),
      },
      paymentMethod: payload.paymentMethod,
      paymentLink: "",
      whatsappMessageSnapshot: payload.whatsappMessageSnapshot,
    };
    const all = readOrders();
    all.push(order);
    writeOrders(all);
    return order;
  },

  summary(): { orders: number; revenue: number; itemsSold: number } {
    const orders = readOrders();
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const itemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
    return { orders: orders.length, revenue, itemsSold };
  },

  updateStatus(id: string, status: OrderStatus): { ok: true } | { ok: false; error: string } {
    const all = readOrders();
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return { ok: false, error: "Pedido não encontrado." };
    all[idx] = { ...all[idx], status };
    writeOrders(all);
    return { ok: true };
  },

  updatePaymentLink(
    id: string,
    paymentLink: string
  ): { ok: true } | { ok: false; error: string } {
    const all = readOrders();
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return { ok: false, error: "Pedido não encontrado." };
    all[idx] = { ...all[idx], paymentLink: paymentLink.trim() };
    writeOrders(all);
    return { ok: true };
  },

  remove(id: string): { ok: true } | { ok: false; error: string } {
    const all = readOrders();
    const next = all.filter((o) => o.id !== id);
    if (next.length === all.length) {
      return { ok: false, error: "Pedido não encontrado." };
    }
    writeOrders(next);
    return { ok: true };
  },
};
