import type { PaymentSettings } from "./PaymentSettings";

export type StoreThemePreference = "light" | "dark" | "system";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  themePreference: StoreThemePreference;
  contactEmail: string;
  /** Texto livre para políticas, horário, etc. */
  generalNotes: string;
  paymentSettings: PaymentSettings;
  /**
   * Opcional: até 1 imagem extra (4ª slide) em base64 ou URL.
   * As 3 primeiras imagens do banner são fixas no frontend.
   */
  homeBannerImages: string[];
}
