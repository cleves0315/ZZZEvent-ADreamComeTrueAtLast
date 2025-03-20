import { createMemoryHistory, createRouter } from "vue-router"

export enum CinemaUserEnum {
  zhuyuan0 = "zhuyuan0",
  zhuyuan1 = "zhuyuan1",
}

import MainMenu from "./components/MainMenu.vue"
import PlayView from "./components/PlayView.vue"
import HomeView from "./components/HomeView.vue"
import CinemaView from "./components/CinemaView.vue"
import LoadingView from "./components/LoadingView.vue"

const routes = [
  { path: "/", component: MainMenu },
  { path: "/home", component: HomeView },
  { path: "/play", component: PlayView },
  { path: "/cinema/:user", component: CinemaView, props: true },
  { path: "/loading", component: LoadingView },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
