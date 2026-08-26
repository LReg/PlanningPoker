<script setup lang="ts">
import Card from "@/components/Card.vue";
import reactiveUser from "@/reactive/useUser";
import {flashbang, kickPlayer, makeOtherPlayerAdmin, shake, throwEmoji} from "@/api/actionsService";
import {onMounted, onUnmounted, ref} from "vue";
import {paperThrowSubject} from "@/api/actionsService";
import {Subject, takeUntil} from "rxjs";
import ThrowItem from "@/components/ThrowItem.vue";
import {message} from "ant-design-vue";
import {useI18n} from "vue-i18n";
const { t } = useI18n();
const props = defineProps(['username', 'estimate', 'id', 'listView']);
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
const handleFlashbang = (e: any) => {
  flashbang(props.id);
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
    message.error(t('toast.emojiTooShort'));
    return;
  }
  const emojis = localStorage.getItem('emojis');
  if (emojis) {
    const emojiArray = JSON.parse(emojis);
    if (emojiArray.includes(emoji)) {
      message.error(t('toast.emojiAlreadyExists'));
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
    <div :class="'user' + (listView ? ' user--list' : ' user--grid') + ((reactiveUser?.id === id) && reactiveUser ? ' user--me' : ' hoverpointer')">
      <span class="user-name">{{ username }}</span>
      <Card v-if="!listView" :estimate="estimate" :selected="estimate"></Card>
      <span v-else class="user-estimate-pill" :class="{selected: !!estimate}">
        <template v-if="estimate === null">X</template>
        <template v-else-if="typeof estimate === 'string'">{{ estimate }}</template>
        <template v-else-if="typeof estimate === 'number' && estimate === -1">?</template>
      </span>
      <ThrowItem v-for="data in throwItems" :key="data.id" :ballid="'ball' + data.id" :emoji="data.emoji"></ThrowItem>
    </div>
    <template #overlay v-if="!(reactiveUser?.id === id) && reactiveUser">
      <a-menu>
        <a-menu-item @click="handleShake" :disabled="actionCooldown"><span class="noselect">{{ t('user.shake') }}</span></a-menu-item>
        <a-menu-item @click="handleFlashbang" :disabled="actionCooldown"><span class="noselect">{{ t('user.flashbang') }}</span></a-menu-item>
        <a-menu-Item class="throw-menu-item">
          <span>{{ t('user.throwLabel') }}</span><br />
          <a-button @click="handleThrow('0')" type="text">{{ t('user.throwPaperball') }}</a-button><br />
          <a-button @click="handleThrow('🚀')" type="text">🚀</a-button>
          <a-button @click="handleThrow('🎱')" type="text">🎱</a-button>
          <a-button @click="handleThrow('❤️')" type="text">❤️</a-button><br />
          <a-button @click="handleThrow('👍')" type="text">👍</a-button>
          <a-button @click="handleThrow('👎')" type="text">👎</a-button>
          <a-button @click="handleThrow('🤣')" type="text">🤣</a-button><br />
          <div class="custom-icons">
            <a-button v-for="emoji in customIcons" @click="handleThrow(emoji)">{{emoji}}</a-button><br v-if="customIcons.length > 0" />
          </div>
          <a-button @click="handleOpenModal" type="text">{{ t('user.addEmoji') }}</a-button>
          <a-button @click="handleResetCustomEmojis" v-if="customIcons.length > 0" type="text">{{ t('user.resetEmojis') }}</a-button>
        </a-menu-Item>
        <a-menu-item v-if="reactiveUser?.isOwner" @click="kickPlayer(id)"><span class="noselect">{{ t('user.makeSpectator') }}</span></a-menu-item>
        <a-menu-item v-if="reactiveUser?.isOwner" @click="makeOtherPlayerAdmin(id)"><span class="noselect">{{ t('user.makeAdmin') }}</span></a-menu-item>
        <a-menu-item @click="dropdownOpen = false"><span class="noselect">{{ t('user.close') }}</span></a-menu-item>
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
.user--list {
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: 26rem;
  min-height: auto;
  padding: .6rem .9rem;
}
.user--list .user-name {
  text-align: left;
  -webkit-line-clamp: 1;
  flex: 1;
  min-width: 0;
}
.user-estimate-pill {
  flex-shrink: 0;
  min-width: 2.4rem;
  height: 2.4rem;
  padding: 0 .6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-border);
  background-color: var(--surface-solid);
  background-image: linear-gradient(150deg, rgba(var(--lingrad-a), 0.06), rgba(var(--lingrad-b), 0.1));
  font-weight: 700;
  font-size: 1em;
  color: var(--text-color);
}
.user-estimate-pill.selected {
  border-color: transparent;
  background-image: linear-gradient(150deg, rgb(var(--lingrad-a)), rgb(var(--lingrad-b)));
  color: white;
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
