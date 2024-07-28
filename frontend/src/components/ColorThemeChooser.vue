<script setup lang="ts">
import { BgColorsOutlined } from '@ant-design/icons-vue';
import {onMounted} from "vue";
const changeTheme = (key: string) => {
  console.log(key);
  document.body.className = key;
  localStorage.setItem('theme', key);
}
const handleMenuClick = (e: any) => {
  const theme = e.key;
  changeTheme(theme);
}

onMounted(() => {
  const theme = localStorage.getItem('theme');
  if (theme) {
    changeTheme(theme);
  }
});
</script>


<template>
<a-dropdown @click.prevent>
  <BgColorsOutlined />
  <template #overlay>
    <a-menu @click="handleMenuClick">
      <a-menu-item key="purple">
        Purple
      </a-menu-item>
      <a-menu-item key="blue">
        Blue
      </a-menu-item>
      <a-menu-item key="gray">
        Gray
      </a-menu-item>
      <a-menu-item key="green">
        Green
      </a-menu-item>
      <a-menu-item key="red">
        Red
      </a-menu-item>
    </a-menu>
  </template>
</a-dropdown>
</template>

<style scoped>

</style>