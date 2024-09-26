<template>
  <div class="card-container">
    <a-card class="card" title="Hier kannst du eine Änderung vorschlagen" hoverable>
      <user-request-form request-type="changerequest"></user-request-form>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import UserRequestForm from "@/components/UserRequestForm.vue";
</script>
<style scoped>

.card-container {
  width: 100%;
  height: 100%;
  padding: 3rem;
}
.card {
  width: 30rem;
  margin: 0 auto;
}
</style>