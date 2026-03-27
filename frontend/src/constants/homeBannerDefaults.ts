/**
 * Três imagens fixas do carrossel da Home. A 4ª slide (opcional) vem de
 * `storeSettings.homeBannerImages` (no máximo 1 URL/base64).
 */
export const DEFAULT_HOME_BANNER_IMAGES: readonly { image: string; link: string }[] = [
  { image: "/assets/images/hero/banner-01.png", link: "/categoria/mens-shirts" },
  { image: "/assets/images/hero/banner-02.png", link: "/categoria/mobile-accessories" },
  { image: "/assets/images/hero/banner-03.png", link: "/categoria/womens-dresses" },
];
