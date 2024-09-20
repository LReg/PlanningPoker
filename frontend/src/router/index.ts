import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from "@/views/GameView.vue";
import JoinView from "@/views/JoinView.vue";
import BugView from "@/views/BugView.vue";
import ChangeView from "@/views/ChangeView.vue";

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
      component: JoinView,
    },
    {
      path: "/bugreport",
      component: BugView
    },
    {
      path: "/changerequest",
      component: ChangeView
    },
    {
      path: "/:catchAll(.*)",
      redirect: '/',
    },
  ]
})

export default router;
