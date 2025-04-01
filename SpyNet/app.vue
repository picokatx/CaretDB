<template>
  <SpyNetNavbar />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import SpyNetNavbar from './components/SpyNetNavbar.vue';

// const goto_references = useState('goto_references', () => 0)
useHead
  ({
    title: 'SpyNet',
    meta: [
      {
        name: 'SpyNet',
        content: 'Database management system for recordings of user browsing sessions.'
      }
    ],
    bodyAttrs: {
      class: 'test'
    },
    script: [{
      innerHTML: 'console.log(\'Hello world\')'
    }]
  })
</script>