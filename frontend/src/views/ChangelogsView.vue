<template>
  <div class="changelog-container">
    <RouterLink to="/">
      <a-button class="home-button">{{ t('common.home') }}</a-button>
    </RouterLink>
    <h1 class="page-title">{{ t('changelog.pageTitle') }}</h1>
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
import {computed} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const changelogs = computed(() => [
  {
    title: 'Version 1.5.0',
    body: t('changelog.v150'),
    server: t('changelog.currentVersion'),
    green: true
  },
  {
    title: 'Version 1.4.0',
    body: t('changelog.v140'),
  },
  {
    title: 'Version 1.1.0',
    body: t('changelog.v110'),
  },
  {
    title: 'Version 0.2.0 Beta',
    body: t('changelog.v020'),
  },
  {
    title: 'Version 0.1.0 Beta',
    body: t('changelog.v010'),
  },
  {
    title: 'Version 0.0.4 Beta',
    body: t('changelog.v004'),
  },
  {
    title: 'Version 0.0.3 Beta',
    body: t('changelog.v003'),
  },
  {
    title: 'Version 0.0.2 Beta',
    body: t('changelog.v002'),
  },
  {
    title: 'Version 0.0.1 Beta',
    body: t('changelog.v001'),
  }
]);
</script>
