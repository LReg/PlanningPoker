<script setup lang="ts">
import Card from "@/components/Card.vue";
import reactiveUser from "@/reactive/useUser";
import {kickPlayer, makeOtherPlayerAdmin, shake, throwEmoji} from "@/api/actionsService";
import {onMounted, onUnmounted, ref} from "vue";
import {paperThrowSubject} from "@/api/actionsService";
import {Subject, takeUntil} from "rxjs";
import ThrowItem from "@/components/ThrowItem.vue";
import {message} from "ant-design-vue";
const props = defineProps(['username', 'estimate', 'id']);
const actionCooldown = ref(false);
const dropdownOpen = ref(false);
const throwItems = ref([] as {id: number, emoji: string}[]);
const unsubscribe = new Subject<void>();
const modalOpen = ref(false);
const newEmoji = ref('');
const customIcons = ref(JSON.parse(localStorage.getItem('emojis') || '[]'));
onMounted(() => {
  paperThrowSubject.pipe(
      takeUntil(unsubscribe),
  ).subscribe((data) => {
    if (data.id === props.id) {
      triggerBallAnimation(data.emoji);
    }
  });
});
onUnmounted(() => {
  unsubscribe.complete();
});
const triggerActionCooldown = () => {
  actionCooldown.value = true;
  setTimeout(() => actionCooldown.value = false, 5000);
}
const handleShake = (e: any) => {
  shake(props.id);
  triggerActionCooldown();
}
const triggerBallAnimation = (emoji: string) => {
  throwItems.value.push({id: Math.floor(Math.random() * 9999999), emoji});
  setTimeout(() => {
    //throwItems.value.shift();
  }, 1100);
}
const handleThrow = (emoji:string) => {
  throwEmoji(props.id, emoji);
}

const handleAddEmoji = () => {
  const emoji = newEmoji.value;
  if (emoji.length === 0) {
    message.error('Emoji zu kurz');
    return;
  }
  const emojis = localStorage.getItem('emojis');
  if (emojis) {
    const emojiArray = JSON.parse(emojis);
    if (emojiArray.includes(emoji)) {
      message.error('Emoji bereits vorhanden');
      return;
    }
    emojiArray.push(emoji);
    localStorage.setItem('emojis', JSON.stringify(emojiArray));
  } else {
    localStorage.setItem('emojis', JSON.stringify([emoji]));
  }
  modalOpen.value = false;
  customIcons.value.push(emoji);
  newEmoji.value = '';
}

const handleResetCustomEmojis = () => {
  localStorage.removeItem('emojis');
  customIcons.value = [];
}

const handleOpenModal = () => {
  dropdownOpen.value = false;
  modalOpen.value = true;
}

</script>

<template>
  <a-dropdown :trigger="['click']" v-model:open="dropdownOpen">
    <div :class="'user' + ((reactiveUser?.id === id) && reactiveUser ? ' user--me' : ' hoverpointer')">
      <span class="user-name">{{ username }}</span>
      <Card :estimate="estimate" :selected="estimate"></Card>
      <ThrowItem v-for="data in throwItems" :key="data.id" :ballid="'ball' + data.id" :emoji="data.emoji"></ThrowItem>
    </div>
    <template #overlay v-if="!(reactiveUser?.id === id) && reactiveUser">
      <a-menu>
        <a-menu-item @click="handleShake" :disabled="actionCooldown"><span class="noselect">Schütteln</span></a-menu-item>
        <a-menu-Item class="throw-menu-item">
          <span>Abwerfen:</span><br />
          <a-button @click="handleThrow('0')" type="text">Papierkugel</a-button><br />
          <a-button @click="handleThrow('🚀')" type="text">🚀</a-button>
          <a-button @click="handleThrow('🎱')" type="text">🎱</a-button>
          <a-button @click="handleThrow('❤️')" type="text">❤️</a-button><br />
          <a-button @click="handleThrow('👍')" type="text">👍</a-button>
          <a-button @click="handleThrow('👎')" type="text">👎</a-button>
          <a-button @click="handleThrow('🤣')" type="text">🤣</a-button><br />
          <div class="custom-icons">
            <a-button v-for="emoji in customIcons" @click="handleThrow(emoji)">{{emoji}}</a-button><br v-if="customIcons.length > 0" />
          </div>
          <a-button @click="handleOpenModal" type="text">Emoji hinzufügen</a-button>
          <a-button @click="handleResetCustomEmojis" v-if="customIcons.length > 0" type="text">Zurücksetzen</a-button>
        </a-menu-Item>
        <a-menu-item v-if="reactiveUser?.isOwner" @click="kickPlayer(id)"><span class="noselect">zum Zuschauer machen / rauswerfen</span></a-menu-item>
        <a-menu-item v-if="reactiveUser?.isOwner" @click="makeOtherPlayerAdmin(id)"><span class="noselect">zum Admin machen</span></a-menu-item>
        <a-menu-item @click="dropdownOpen = false"><span class="noselect">Schließen</span></a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <a-modal v-model:open="modalOpen" @ok="handleAddEmoji" :closable="false">
    <a-input v-model:value="newEmoji"></a-input>
  </a-modal>
</template>

<style scoped>

.user {
  user-select: none;
  width: 10rem;
  min-height: 9.6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: .7rem;
  padding: .9rem .6rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: background .2s ease, border-color .2s ease;
}
.user-name {
  font-weight: 600;
  font-size: .9em;
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.25;
  word-break: break-word;
}
.user--me {
  background: rgba(var(--lingrad-a), 0.08);
  border-color: rgba(var(--lingrad-a), 0.25);
}
.hoverpointer:hover {
  cursor: pointer;
  background: var(--theme-container-color);
}
.noselect {
  user-select: none;
}
.custom-icons {
  display: flex;
  flex-wrap: wrap;
  max-width: 30rem;
}
.throw-menu-item {
  max-width: 30rem;
}
.throw-menu-item button {
  margin: 0.1rem;
  background-color: var(--theme-container-color);
  border-radius: var(--radius-sm);
}
</style>
