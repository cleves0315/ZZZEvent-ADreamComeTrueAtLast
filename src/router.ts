import { createMemoryHistory, createRouter } from "vue-router"

import MainMenu from "./components/MainMenu.vue"
import PlayView from "./components/PlayView.vue"
import HomeView from "./components/HomeView.vue"

const routes = [
  { path: "/", component: MainMenu },
  { path: "/home", component: HomeView },
  { path: "/play", component: PlayView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
