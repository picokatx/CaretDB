<template>
  <div class="flex flex-wrap align-items-center justify-content-center pt-8" data-aos="fade-up">
    <div class="flex align-items-center justify-content-center text-center
        font-bold text-8xl">SpyNet</div>
  </div>
  <div class="flex flex-wrap align-items-center justify-content-center" data-aos="fade-up" data-aos-easing="ease"
    data-aos-delay="400">
    <div class="flex align-items-center justify-content-center
        font-bold text-4xl" style="color: #84aedf">Track everything your consumers do on the Internet</div>
  </div>
  <div class="galleria-container pt-4 px-6 " data-aos="zoom-in" data-aos-delay="1000">
    <Galleria :value="images" :circular="true" :autoPlay="true" :transitionInterval="3000" :numVisible="1"
      :responsiveOptions="responsiveOptions" styleClass="custom-galleria">
      <template #item="slotProps">
        <img :src="slotProps.item" class="galleria-image" />
      </template>
    </Galleria>
  </div>
  <div class="flex flex-row flex-wrap align-items-center justify-content-center gap-5 py-2">
    <Card class="w-25rem overflow-hidden m-2" data-aos="fade-right" data-aos-easing="ease-in-out">
      <template #header>
        <img alt="user header" src="/card-vue.jpg" />
      </template>
      <template #title>Scalable Systems</template>
      <template #content>
        <p class="m-0">
          With support for up to 240 yottabytes of data, 16 trillion tables and 32 million users, SpyNet will never
          constraint your ability to create.<br><br>- CEO, SpyNet Inc.
        </p>
      </template>
    </Card>
    <Card class="w-25rem overflow-hidden m-2" data-aos="fade-right" data-aos-easing="ease-in-out" data-aos-delay="300">
      <template #header>
        <img alt="user header" src="/card-vue.jpg" />
      </template>
      <template #title>State-Of-The-Art Performance</template>
      <template #content>
        <p class="m-0">
          Boasting 1.42 trillion transactions per second, SpyNet is always several years ahead of our competitors. We
          frequently communicate with our most loyal customers to ensure they get the best out of our infrastructure.
        </p>
      </template>
    </Card>
    <Card class="w-25rem overflow-hidden m-2" data-aos="fade-right" data-aos-easing="ease-in-out" data-aos-delay="600">
      <template #header>
        <img alt="user header" src="/card-vue.jpg" />
      </template>
      <template #title>Always on the move</template>
      <template #content>
        <p class="m-0">
          At SpyNet Incorporated, we hate stagnation. Our techonlogies are ever evolving, adapting the latest
          innovations in database management for your benefit.<br>- Public Relations Officer, SpyNet Inc.
        </p>
      </template>
    </Card>
  </div>
  <div class="py-3">
    <div class="flex flex-wrap align-items-center justify-content-center" data-aos="fade-up" data-aos-easing="ease"
      data-aos-delay="">
      <div class="flex align-items-center justify-content-center
        font-bold text-m">Libraries</div>
    </div>
    <div class="flex flex-wrap align-items-center justify-content-center" data-aos="fade-up" data-aos-easing="ease"
      data-aos-delay="">
      <div class="flex align-items-center justify-content-center
        font-bold text-4xl" style="color: #84aedf">Built purely on open-source projects</div>
    </div>
    <div class="flex flex-row flex-wrap align-items-center justify-content-center gap-5 py-6">
      <img src="/logos/nuxt.svg" alt="Nuxt Logo" class="logo-size" data-aos="zoom-in" data-aos-delay="0" />
      <img src="/logos/primevue.svg" alt="Nuxt Logo" class="logo-size" data-aos="zoom-in" data-aos-delay="300" />
      <img src="/logos/primeflex.svg" alt="Bootstrap Logo" class="logo-size" data-aos="zoom-in" data-aos-delay="600" />
      <img src="/logos/ag_grid.svg" alt="AG Grid" class="logo-size" data-aos="zoom-in" data-aos-delay="900" />
    </div>
  </div>
  <div class="py-3">
    <div class="flex flex-wrap align-items-center justify-content-center" data-aos="fade-up" data-aos-easing="ease"
      data-aos-delay="">
      <div class="flex align-items-center justify-content-center
        font-bold text-m">Our sponsors</div>
    </div>
    <div class="flex flex-wrap align-items-center justify-content-center" data-aos="fade-up" data-aos-easing="ease"
      data-aos-delay="">
      <div class="flex align-items-center justify-content-center
        font-bold text-4xl" style="color: #84aedf">SpyNet is brought to you by</div>
    </div>
    <div class="flex flex-row flex-wrap align-items-center justify-content-center gap-5 py-6">
      <img src="/logos/nushigh.png" alt="Nuxt Logo" class="logo-size" data-aos="zoom-in" data-aos-delay="0" />
    </div>
  </div>
  <div class="flex flex-row flex-wrap align-items-center justify-content-center py-2">
    <Panel header="README.md">
      <h1>SpyNet</h1>
      <p class="text-justify">
        Database Management System for the WebLinx Project https://huggingface.co/datasets/McGill-NLP/WebLINX
      </p>
    </Panel>
  </div>

  <Dialog :visible="displayDialog" header="customized greeting to your user based on the user's name input in the url" modal :closable="false">
    <div class="p-d-flex p-jc-center p-ai-center">
      <h3>Hello {{ username }}</h3>
    </div>
    <template #footer>
      <Button label="Close" @click="closeDialog" />
    </template>
  </Dialog>
</template>

<style lang="scss">
@use "~/node_modules/primeflex/primeflex.min.css";

.logo-size {
  height: 48px;
  /* Set the desired height */
}
</style>

<style>
.custom-galleria {
  z-index: -999999;
}

.custom-galleria .galleria-item {
  transition: transform 0.5s ease-in-out;
}

.custom-galleria .galleria-item-enter-active,
.custom-galleria .galleria-item-leave-active {
  animation: slide-left 0.5s ease-in-out;
}

@keyframes slide-left {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(0);
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const username = ref('')
const displayDialog = ref(false)

onMounted(() => {
  if (route.query.username) {
    username.value = route.query.username
    displayDialog.value = true
  }
})

const closeDialog = () => {
  displayDialog.value = false
}
</script>


<script>
import Galleria from 'primevue/galleria';
import AOS from 'aos';

export default {
  components: {
    Galleria,
  },
  data() {
    return {
      images: [
        './v1.png',
        './v2.png',
        // Add more image paths as needed
      ],
      responsiveOptions: [
        {
          breakpoint: '1024px',
          numVisible: 1,
        },
        {
          breakpoint: '600px',
          numVisible: 1,
        },
      ],
    };
  },
  mounted() {
    AOS.init();
  },
};
</script>
