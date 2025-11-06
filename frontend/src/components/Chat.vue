<script setup lang="ts">
import { SendOutlined, WechatOutlined, PictureOutlined } from "@ant-design/icons-vue";
import {aimessageRef, messagesRef} from "@/api/chatService";
import {ref, watch} from "vue";
import { postMessage} from "@/api/chatService";
import type {Message} from "@/models/Message.model";

const messageInputRef = ref('');
const messageInputRefAi = ref('');

const activeTabKey = ref('0');
const messagesContainerRef = ref(null);

const handleSendMessage = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  if (messageInputRef.value === '') {
    return;
  }
  postMessage(messageInputRef.value, 'std');
  messageInputRef.value = '';
}

const handleSendMessageAi = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  if (messageInputRefAi.value === '') {
    return;
  }
  const msg: string = messageInputRefAi.value;
  const isCommand = commandOptionsAI.map(c => c.command).some(cm => msg.startsWith(cm))

  if (!isCommand) {
    const helpMsg: Message = {
      message: 'Use one of the shown Commands',
      name: 'Failed',
      timestamp: Date.now(),
      type: 'ai'
    }
    aimessageRef.value.push(helpMsg)
  }
  postMessage(messageInputRefAi.value, 'ai');
  messageInputRefAi.value = '';
}

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

const commandOptionsAI: Command[] = [
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

const commandOptions: Command[] = [
  {
    title: '/img [url]',
    command: '/img',
    description: 'send image of gif'
  },
];

const handleCommandClick = (command: Command) => {
  messageInputRef.value = `${command.command} ${messageInputRef.value}`;
  document.getElementById("chatInput")?.focus();
}
const handleCommandClickAi = (command: Command) => {
  messageInputRefAi.value = `${command.command} ${messageInputRefAi.value}`;
  document.getElementById("chatInputAi")?.focus();
}
</script>

<template>
  <a-tabs v-model:activeKey="activeTabKey" style="height: 100%">
    <a-tab-pane key="0" style="height: 100%">
      <template #tab>
        <span>
          <WechatOutlined />
          Chat
        </span>
      </template>

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
              <div v-html="message.message" class="chat-message-content"></div>
            </template>
          </a-comment>
          <div class="chat__message">
          </div>
        </div>
        <div class="command-options">
          <div class="command" v-for="command in commandOptions" @click="handleCommandClick(command)">
            <PictureOutlined />
            <div class="command-text">
              <strong><span>{{command.title}}</span></strong>
              <span>{{command.description}}</span>
            </div>
          </div>
        </div>
        <div class="chat__input">
          <a-textarea v-model:value="messageInputRef" type="text" placeholder="Nachricht eingeben..." @keydown.enter="handleSendMessage" id="chatInput" :auto-size="{ minRows: 1, maxRows: 5 }"/>
          <a-button @click="handleSendMessage" :type="messageInputRef === '' ? 'default' : 'primary'">
            <SendOutlined />
          </a-button>
        </div>
      </div>
    </a-tab-pane>


    <a-tab-pane key="1">
      <template #tab>
        <span>
        <img src="/ai.png" height="20">
          Ai
        </span>
      </template>

      <div class="chat">
        <div class="chat__messages" ref="messagesContainerRef">
          <a-comment
              :author="message.name"
              :avatar="message.name === 'Server' ? '/server.png' : '/user.png'"
              v-for="message in aimessageRef"
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
          <div class="command" v-for="command in commandOptionsAI" @click="handleCommandClickAi(command)">
            <img src="/ai.png" height="20">
            <div class="command-text">
              <strong><span>{{command.title}}</span></strong>
              <span>{{command.description}}</span>
            </div>
          </div>
        </div>
        <div class="chat__input">
          <a-textarea v-model:value="messageInputRefAi" type="text" placeholder="Prompt eingeben..." @keydown.enter="handleSendMessageAi" id="chatInputAi" :auto-size="{ minRows: 1, maxRows: 5 }"/>
          <a-button @click="handleSendMessageAi" :type="messageInputRefAi === '' ? 'default' : 'primary'">
            <SendOutlined />
          </a-button>
        </div>
      </div>

    </a-tab-pane>
  </a-tabs>

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