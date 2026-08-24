<template>
  <div class="changelog-container">
    <RouterLink to="/">
      <a-button class="home-button">Home</a-button>
    </RouterLink>
    <h1 class="page-title">Changelog</h1>
    <Changelog :changelogs="changelogs" />
  </div>
</template>
<style scoped>
.changelog-container {
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 1.5rem 3rem;
}
.page-title {
  font-size: 1.6em;
  font-weight: 800;
  margin-bottom: .5rem;
  background-image: linear-gradient(105deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.home-button {
  margin-top: 1rem;
  border-radius: var(--radius-sm);
}
</style>

<script lang="ts" setup>
import Changelog from '@/components/Changelog.vue';

const changelogs = [
  {
    title: 'Version 0.2.0 Beta',
    body: 'Chat Tabs, Images and Gifs in chat',
    server: 'derzeitige Version',
    green: true
  },
  {
    title: 'Version 0.1.0 Beta',
    body: 'Feature: AI Integration',

  },
  {
    title: 'Version 0.0.4 Beta',
    body: 'Bugfix: Schätzungsdiagramm verschwindet mit einer nachträglichen Schätzungsänderung',
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
