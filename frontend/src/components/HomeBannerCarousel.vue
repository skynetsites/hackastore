<script lang="ts">
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
import { DEFAULT_HOME_BANNER_IMAGES } from "../constants/homeBannerDefaults";
import { storeSettingsService } from "../services/storeSettingsService";

export default defineComponent({
  name: "HomeBannerCarousel",
  components: {
    RouterLink,
  },

 computed: {
  slides(): { image: string; link: string }[] {
    const settings = storeSettingsService.get();

    // Pega a primeira imagem extra, se existir
    const extraImage = settings.homeBannerImages
      ?.map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 1)[0];

    // Pega o link correspondente
    const extraLink = extraImage && settings.homeBannerLinks?.[0]?.trim() ? settings.homeBannerLinks[0].trim() : "/";

    const extra = extraImage ? [{ image: extraImage, link: extraLink }] : [];

    return [...DEFAULT_HOME_BANNER_IMAGES, ...extra];
  },

  showCarousel(): boolean {
    return DEFAULT_HOME_BANNER_IMAGES.length >= 3;
  },
},
});
</script>

<template>
  <div v-if="showCarousel" class="w-full md-mx-4 sm:mx-0 mb-8 sm:mb-10">
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
        md:[&_.p-carousel-indicator-list]:bottom-1!
        [&_.p-carousel-indicator-list]:bottom-0!
        [&_.p-carousel-indicator-list]:p-3!
        overflow-hidden
        relative"
    >
      <template #item="slotProps">
        <div
          class="relative w-full md:aspect-[21/9] min-h-[120px] sm:min-h-[180px] md:min-h-[220px] max-h-[330px] bg-gray-200 dark:bg-gray-800"
        >
          <RouterLink :to="slotProps.data.link">
            <img
              :src="slotProps.data.image"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </RouterLink>
        </div>
      </template>
    </Carousel>
  </div>
</template>