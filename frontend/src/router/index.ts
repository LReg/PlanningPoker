import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from "@/views/GameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game/:token',
      name: 'game',
      component: GameView
    },
    {
      path: '/join/:token',
      name: 'join',
      component: import('@/views/JoinView.vue'),
    },
    {
      path: "/bugreport",
      component: import('@/views/BugView.vue')
    },
    {
      path: "/changerequest",
      component: import('@/views/ChangeView.vue')
    },
    {
      path: "/:catchAll(.*)",
      redirect: '/',
    },
  ]
})

export default router;
