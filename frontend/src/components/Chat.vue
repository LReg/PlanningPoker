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

interface Command {
  title: string;
  command: string;
  description: string;
}

const commandOptions: Command[] = [
  {
    title: '/ask [question]',
    command: '/ask',
    description: 'Ask technical question'
  },
  {
    title: '/estimation [feature explanation]',
    command: '/estimation',
    description: 'Ask for estimation with considertation'
  }
];

const handleCommandClick = (command: Command) => {
  messageInputRef.value = `${command.command} ${messageInputRef.value}`
  document.getElementById("chatInput")?.focus();
}
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
          <div v-html="message.message"></div>
        </template>
      </a-comment>
      <div class="chat__message">
      </div>
    </div>
    <div class="command-options">
      <div class="command" v-for="command in commandOptions" @click="handleCommandClick(command)">
        <img src="/ai.png" height="20">
        <div class="command-text">
          <strong><span>{{command.title}}</span></strong>
          <span>{{command.description}}</span>
        </div>
      </div>
    </div>
    <div class="chat__input">
      <a-input v-model:value="messageInputRef" type="text" placeholder="Nachricht eingeben..." @keydown.enter="handleSendMessage" id="chatInput"/>
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

.command-options {
  display: flex;
  gap: 1rem;
  height: 6rem;
  font-size: .8em;
  margin: .5rem .2rem;
  padding: .9rem .2rem;
  overflow: auto;
  .command {
    .command-text {
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }
    align-items: center;
    overflow: visible;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    gap: .5rem;
    border-radius: 5px;
    padding: .4rem;
    box-shadow: 2px 3px 5px gray;
    transition: box-shadow linear .2s;
  }
  .command:hover {
    cursor: pointer;
    box-shadow: 2px 3px 15px gray;
  }
}

</style>