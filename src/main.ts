import { createApp } from "vue"
import "@csstools/normalize.css"
import "./styles/font.css"
import "./styles/main.scss"
import App from "./App.vue"
import { router } from "./router"

createApp(App).use(router).mount("#app")
