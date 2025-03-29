<template>
  <Dialog :visible="displayDialog" header="A customized greeting to your user based on the user's name input in the url" modal :closable="false">
    <div class="p-d-flex p-jc-center p-ai-center">
      <h3>Hello {{ username }}</h3>
    </div>
    <template #footer>
      <Button label="Close" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script setup>
import { navigateTo, useRoute } from '#imports'

const route = useRoute()
const username = route.params.username
if (username) {
  navigateTo({ path: '/', query: { username } })
}
</script>
