<template>
  <div class="min-h-screen bg-gray-50">
    <SidebarMenu />
    <div class="pt-14">
      <Toaster position="top-right" richColors />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import SidebarMenu from './components/SidebarMenu.vue'
</script>
