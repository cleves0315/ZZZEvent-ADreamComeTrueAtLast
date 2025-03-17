import { createApp } from "vue"
import "./styles/font.scss"
import "./styles/main.scss"
import App from "./App.vue"
import { router } from "./router"
import { createPinia } from "pinia"

const pinia = createPinia()

createApp(App).use(router).use(pinia).mount("#app")
