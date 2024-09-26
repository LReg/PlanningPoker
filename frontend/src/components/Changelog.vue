<template>
  <div>
    <div v-for="(log, index) in changelogs" :key="index" class="card">
      <div class="card-header">
        <h2>{{ log.title }}</h2>
        <span v-if="log.server" :class="log.green ? 'badge bg-success' : 'badge bg-warning'">{{ log.server }}</span>
      </div>
      <div class="card-body">
        <p v-html="log.body"></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* type Changelog = {
  title: string;
  body: string;
  server?: string;
  green?: boolean
} */
defineProps(['changelogs']);
</script>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.bg-success {
  background-color: #28a745;
  color: white;
}

.bg-warning {
  background-color: #ffc107;
  color: white;
}
</style>
