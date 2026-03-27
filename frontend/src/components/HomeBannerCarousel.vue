<script lang="ts">
import { defineComponent } from "vue";
import { DEFAULT_HOME_BANNER_IMAGES } from "../constants/homeBannerDefaults";
import { storeSettingsService } from "../services/storeSettingsService";

export default defineComponent({
  name: "HomeBannerCarousel",

  computed: {
    slides(): { image: string; link: string }[] {
      const extraImage = storeSettingsService
        .get()
        .homeBannerImages.map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 1)[0];

      const extra = extraImage ? [{ image: extraImage, link: "/" }] : []; // link padrão caso precise
      return [...DEFAULT_HOME_BANNER_IMAGES, ...extra];
    },
    showCarousel(): boolean {
      return DEFAULT_HOME_BANNER_IMAGES.length >= 3;
    },
  },
});
</script>

<template>
  <div v-if="showCarousel" class="w-full -mx-4 sm:mx-0 mb-8 sm:mb-10">
    <Carousel
      :value="slides"
      :num-visible="1"
      :num-scroll="1"
      circular
      :autoplay-interval="5000"
      :show-navigators="false"
      :show-indicators="true"
      class="
        home-banner-carousel 
        w-full
        rounded-lg 
        [&_.p-carousel-indicator-list]:w-full! 
        [&_.p-carousel-indicator-list]:absolute! 
        [&_.p-carousel-indicator-list]:flex! 
        [&_.p-carousel-indicator-list]:justify-center! 
        [&_.p-carousel-indicator-list]:gap-2! 
        [&_.p-carousel-indicator-list]:bottom-1!
        overflow-hidden
        relative"
    >
      <template #item="slotProps">
        <div
          class="relative w-full aspect-[21/9] min-h-[140px] sm:min-h-[180px] md:min-h-[220px] max-h-[330px] bg-gray-200 dark:bg-gray-800"
        >
          <a :href="slotProps.data.link"> <!-- ou <router-link :to="slotProps.data.link"> para SPA -->
            <img
              :src="slotProps.data.image"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </a>
        </div>
      </template>
    </Carousel>
  </div>
</template>