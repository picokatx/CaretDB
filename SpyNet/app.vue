<template>
  <NuxtLoadingIndicator />
  <Toolbar class="my-3 mx-1 p-3">
    <template #start>
      <div class="flex">
        <Button icon="pi pi-home" class="spynet-nav" aria-label="Landing" @click="navigateTo('/');" text plain/>
        <Button id="database-link" class="spynet-nav" label="Database" @click="navigateTo('/database');" text plain/>
        <Button id="references-link" class="spynet-nav" label="References" @click="navigateTo('/references');" text plain />
      </div>
    </template>
    <template #end>
      <div class="flex">
        <Button id="login-link" class="spynet-nav" label="Login" @click="navigateTo('/login');" text plain />
      </div>
    </template>
  </Toolbar>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
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