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
div {
  width: 34rem;
  max-width: 90vw;
}
.card {
  border: 1px solid var(--surface-border);
  background: var(--theme-container-color);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1rem;
  padding: 1.1rem 1.3rem;
  transition: box-shadow .2s ease, transform .2s ease;
}
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .8rem;
}
.card-header h2 {
  font-size: 1.05em;
}

.card-body p {
  color: var(--text-color-secondary);
  margin-top: .4rem;
  line-height: 1.5;
}

.badge {
  flex-shrink: 0;
  padding: .3rem .7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.bg-success {
  background-color: rgba(5, 150, 105, 0.16);
  color: #059669;
}

.bg-warning {
  background-color: rgba(217, 119, 6, 0.16);
  color: #d97706;
}
</style>
