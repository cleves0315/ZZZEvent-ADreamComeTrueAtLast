import { createMemoryHistory, createRouter } from "vue-router"

import MainMenu from "./components/MainMenu.vue"
import PlayView from "./components/PlayView.vue"

const routes = [
  { path: "/", component: MainMenu },
  { path: "/play", component: PlayView, meta: { transition: "slide-left" } },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
