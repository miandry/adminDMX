<template>
  <div>
    <!-- Top bar -->
    <header class="fixed top-0 inset-x-0 z-[60] bg-white border-b border-gray-200">
      <div class="flex items-center justify-between px-3 py-2.5">
        <button type="button" @click="open = true"
          class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
          aria-label="Ouvrir le menu">
          <i class="ri-menu-line text-xl"></i>
        </button>
        <h1 class="text-base font-semibold text-gray-900">{{ pageTitle }}</h1>
        <div class="w-10 h-10"></div>
      </div>
    </header>

    <!-- Overlay -->
    <div v-if="open" class="fixed inset-0 z-[70] bg-black/40" @click="open = false"></div>

    <!-- Sidebar drawer -->
    <aside
      class="fixed top-0 left-0 z-[80] h-full w-[280px] max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300"
      :class="open ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-primary text-white">
        <div>
          <p class="text-sm font-semibold">adminMDX</p>
          <p class="text-xs text-white/80">Menu principal</p>
        </div>
        <button type="button" @click="open = false"
          class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10"
          aria-label="Fermer le menu">
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>

      <nav class="p-3">
        <p class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Navigation</p>
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.to">
            <router-link :to="item.to" @click="open = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="isActive(item.to)
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-50'">
              <i :class="[item.icon, 'text-lg']"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const open = ref(false)
const route = useRoute()

const menuItems = [
  { to: '/', label: 'Calcul', icon: 'ri-calculator-line' },
  { to: '/list_card', label: 'Transactions', icon: 'ri-file-list-3-line' },
]

const pageTitle = computed(() => route.meta?.title || 'adminMDX')

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
