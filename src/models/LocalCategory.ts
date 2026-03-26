export interface LocalCategory {
  id: number;
  name: string;
  slug: string;
  /** Base64 (data URL) ou URL — obrigatório no cadastro admin (legado pode estar vazio) */
  image?: string;
}
