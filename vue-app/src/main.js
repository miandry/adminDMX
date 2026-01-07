import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { createPinia } from "pinia";
import { registerSW } from "virtual:pwa-register";

import App from "./App.vue";
import CardTransaction from "./pages/CardTransaction.vue";
import About from "./pages/About.vue";
import TransactionDetails from "./pages/TransactionDetails.vue";

const routes = [
  { path: "/", component: CardTransaction, name: "home" },
  { path: "/about", component: About, name: "about" },
  {
    path: "/transaction/:id",
    component: TransactionDetails,
    name: "transaction.details",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const pinia = createPinia();

document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector("#vue-app");
  if (el) {
    createApp(App).use(pinia).use(router).mount("#vue-app");
  }
});

// registerSW({
//   onOfflineReady() {
//     alert("PWA prête hors ligne");
//   },
// });

console.log("AVANT registerSW");

const updateSW = registerSW({
  onRegistered() {
    console.log("SW enregistré");
  },
  onRegisterError(error) {
    console.error("SW erreur", error);
  },
  onOfflineReady() {
    alert("PWA prête hors ligne");
  },
});

console.log("APRÈS registerSW");
