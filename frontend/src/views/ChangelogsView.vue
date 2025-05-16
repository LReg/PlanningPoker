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
    title: 'Version 0.0.4 Beta',
    body: 'Bugfix: Schätzungsdiagramm verschwindet mit einer nachträglichen Schätzungsänderung',
    server: 'derzeitige Version',
    green: true
  },
  {
    title: 'Version 0.0.3 Beta',
    body: 'Die changelogs wurden hinzufügt',
  },
  {
    title: 'Version 0.0.2 Beta',
    body: 'Bugreport und Changerequest wurden hinzugefügt',
  },
  {
    title: 'Version 0.0.1 Beta',
    body: 'Zusätzlich zu Fibonacci Schätzungen wurden T-Shirt und Power Of two Schätzungen hinzugefügt.<br/> Zudem kann man sehen wie viele Session gerade aktiv sind.',
  }
]
</script>
