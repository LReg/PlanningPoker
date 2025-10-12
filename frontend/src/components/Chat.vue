<script setup lang="ts">
import { SendOutlined } from "@ant-design/icons-vue";
import {messagesRef} from "@/api/chatService";
import {ref, watch} from "vue";
import { postMessage} from "@/api/chatService";

const messageInputRef = ref('');
const handleSendMessage = () => {
  if (messageInputRef.value === '') {
    return;
  }
  postMessage(messageInputRef.value);
  messageInputRef.value = '';
}

const messagesContainerRef = ref(null);
watch(() => messagesRef.value.length, () => {
  setTimeout(() => {
        if (!messagesContainerRef.value) {
          return;
        }
        // @ts-ignore
        messagesContainerRef.value.scrollTop = messagesContainerRef?.value?.scrollHeight},
      0
  );
});
</script>

<template>
  <div class="chat">
    <div class="chat__messages" ref="messagesContainerRef">
      <a-comment
          :author="message.name"
          :avatar="message.name === 'Server' ? '/server.png' : '/user.png'"
          v-for="message in messagesRef"
          :key="message.timestamp"
      >
        <template #datetime>
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </template>
        <template #content>
          {{ message.message }}
        </template>
      </a-comment>
      <div class="chat__message">
      </div>
    </div>
    <div class="chat__input">
      <a-input v-model:value="messageInputRef" type="text" placeholder="Nachricht eingeben..." @keydown.enter="handleSendMessage" />
      <a-button @click="handleSendMessage" :type="messageInputRef === '' ? 'default' : 'primary'">
        <SendOutlined />
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.chat__input {
  display: flex;
  gap: .2rem;
}
.chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chat__messages {
  overflow-y: scroll;
  height: 100%;
}

</style>