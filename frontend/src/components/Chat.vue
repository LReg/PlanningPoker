<script setup lang="ts">
import { SendOutlined, WechatOutlined, PictureOutlined } from "@ant-design/icons-vue";
import {aimessageRef, messagesRef} from "@/api/chatService";
import { ref, toRefs, watch } from 'vue';
import { postMessage} from "@/api/chatService";
import type {Message} from "@/models/Message.model";
import { useScroll } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const messageInputRef = ref('');
const messageInputRefAi = ref('');

const activeTabKey = ref('0');
const messagesContainerRef = useTemplateRef<HTMLElement>('messagesContainerRef');
const { arrivedState } = useScroll(messagesContainerRef)
const { bottom } = toRefs(arrivedState);
const showScrollDown = ref(false)


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

const scrollDown = () => {
  setTimeout(() => {
      if (!messagesContainerRef.value) {
        return;
      }
      // @ts-ignore
      messagesContainerRef.value.scrollTop = messagesContainerRef?.value?.scrollHeight
    },
    200
  );
}

watch([bottom], (arrivedState) => {
  const scDo = arrivedState[0];
  console.log(scDo);
  showScrollDown.value = !scDo;
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
    description: 'send image or gif'
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
        <div class="scroll-down" @click="scrollDown" v-if="showScrollDown">Scroll Down</div>
        <div class="chat__messages" ref="messagesContainerRef">
          <div class="chat-bubble" v-for="message in messagesRef" :key="message.timestamp">
            <a-comment
                :author="message.name"
                :avatar="message.name === 'Server' ? '/server.png' : '/user.png'"
            >
              <template #datetime>
                {{ new Date(message.timestamp).toLocaleTimeString() }}
              </template>
              <template #content>
                <div v-html="message.message" class="chat-message-content"></div>
              </template>
            </a-comment>
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
        <div class="chat__messages">
          <div class="chat-bubble" v-for="message in aimessageRef" :key="message.timestamp">
            <a-comment
                :author="message.name"
                :avatar="message.name === 'Server' ? '/server.png' : '/user.png'"
            >
              <template #datetime>
                {{ new Date(message.timestamp).toLocaleTimeString() }}
              </template>
              <template #content>
                <div v-html="message.message"></div>
              </template>
            </a-comment>
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
  gap: .5rem;
  align-items: flex-end;
}
.chat__input :deep(textarea) {
  border-radius: var(--radius-md);
}
.chat__input :deep(.ant-btn) {
  border-radius: var(--radius-md);
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
  padding-right: .3rem;
  display: flex;
  flex-direction: column;
  gap: .6rem;
  padding-bottom: .6rem;
}
.chat-bubble {
  border-radius: var(--radius-md);
  background: var(--theme-container-color);
  border: 1px solid var(--surface-border);
  overflow: hidden;
}
.chat-bubble :deep(.ant-comment-inner) {
  padding: .6rem .7rem !important;
}
.chat-bubble :deep(.ant-comment-content-author-name) {
  font-weight: 700 !important;
  color: var(--text-color) !important;
}
.chat-bubble :deep(.ant-comment-content-author-time) {
  color: var(--text-color-secondary) !important;
}
.chat-bubble :deep(.ant-avatar) {
  border-radius: var(--radius-sm) !important;
}

.command-options {
  display: flex;
  gap: .6rem;
  height: 6rem;
  font-size: .8em;
  margin: .5rem .2rem;
  padding: .3rem .2rem;
  overflow: auto;
  .command {
    .command-text {
      display: flex;
      flex-direction: column;
      gap: .3rem;
    }
    align-items: center;
    overflow: visible;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    gap: .5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--surface-border);
    background: var(--theme-container-color);
    padding: .5rem .7rem;
    box-shadow: var(--shadow-sm);
    transition: box-shadow .2s ease, transform .2s ease;
  }
  .command:hover {
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.scroll-down {
  position: absolute;
  width: fit-content;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: .4rem 1rem;
  font-size: .85em;
  font-weight: 600;
  z-index: 2;

  background: var(--theme-container-color);
  border-radius: 999px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  border: 1px solid var(--surface-border);
}

.scroll-down:hover {
  cursor: pointer;
}

</style>