<template>
  <footer class="footer">
    <nav>
      <ul class="footer-links">
        <li v-for="(link, index) in links" :key="index">
          <RouterLink :to="link.href">{{ link.text }}</RouterLink>
        </li>
      </ul>
    </nav>
  </footer>
</template>

<script lang="ts" setup>
const links = [
  { text: 'Changelog', href: '/changelog'},
  { text: 'Änderung vorschlagen', href: '/changerequest' },
  { text: 'Fehler melden', href: '/bugreport' },
]
</script>

<style scoped>
.footer {
  padding: 2rem 1rem 2.5rem;
  text-align: center;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .4rem 1.6rem;
}

.footer-links a {
  color: var(--text-color-secondary);
  font-size: .88em;
  font-weight: 500;
  text-decoration: none;
  transition: color .2s ease;
}

.footer-links a:hover {
  color: rgb(var(--lingrad-a));
}
</style>
