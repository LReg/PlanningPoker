<template>
  <div class="changelog-container">
    <RouterLink to="/">
      <a-button class="home-button">Home</a-button>
    </RouterLink>
    <Changelog :changelogs="changelogs" />
  </div>
</template>
<style scoped>
.changelog-container {
  width: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.home-button {
  margin: 1rem;
}
</style>

<script lang="ts" setup>
import Changelog from '@/components/Changelog.vue';

const changelogs = [
  {
    title: 'Version 0.0.3 Alpha',
    body: 'Die changelogs wurden hinzufügt',
    server: 'Production & Testserver',
    green: true
  },
  {
    title: 'Version 0.0.2 Alpha',
    body: 'Bugreport und Changerequest wurden hinzugefügt',
  },
  {
    title: 'Version 0.0.1 Alpha',
    body: 'Zusätzlich zu Fibonacci Schätzungen wurden T-Shirt und Power Of two Schätzungen hinzugefügt.<br/> Zudem kann man sehen wie viele Session gerade aktiv sind.',
  }
]
</script>
