import { createApp } from "vue"
import "./styles/font.scss"
import "./styles/main.scss"
import App from "./App.vue"
import { router } from "./router.ts"
import { createPinia } from "pinia"
import { inject } from "@vercel/analytics"

inject()

const pinia = createPinia()

createApp(App).use(router).use(pinia).mount("#app")
