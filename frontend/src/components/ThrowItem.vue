<script setup lang="ts">
import {onMounted} from "vue";
const props = defineProps(['icon', 'ballid', 'emoji'])
const showPaperBall = props.emoji === '0';
const triggerBallAnimation = () => {
  const ball = document.querySelector(`#${props.ballid}`);
  if (ball) {
    ball.classList.add('fly-animation');
    setTimeout(() => ball.classList.remove('fly-animation'), 1000);
  }
}
onMounted(() => {
  triggerBallAnimation();
})
</script>
<template>
<div :id="ballid" :class="'item' + (showPaperBall ? ' showPaperBall' : '')">{{!showPaperBall ? emoji : ''}}</div>
</template>

<style scoped>
.item {
  height: 1.5rem;
  flex-shrink: 0;
  transform: translate(0, -1rem);
  position: relative;
  display: none;
}
.showPaperBall {
  width: 1.5rem;
  background-image: url("/papier.png");
  background-size: 1.5rem 1.5rem;
}

.fly-animation {
  display: block;
  position: fixed;
  animation: fly-animation 1s linear;
  z-index: 999;
}
.bounce-animation {
  display: block;
  position: fixed;
  animation: bounce-animaiton 1s linear;
}
@keyframes fly-animation {
  0% {
    transform: translate(-30rem, -5rem);
  }
  50% {
    transform: translate(-15rem, -2.7rem);
  }
  100% {
    transform: translate(-0rem, 0);
  }
}
@keyframes bounce-animaiton {
  0% {
    transform: translate(0, 0);
  }
  30% {
    transform: translate(4px, -1.5rem);
  }
  60% {
    transform: translate(8px, 0);
  }
  80% {
    transform: translate(16px, -1.1rem);
  }
  100% {
    transform: translate(20px, 0);
  }
}
</style>