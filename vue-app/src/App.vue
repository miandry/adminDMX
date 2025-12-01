<template>
  <div>
    <Toaster position="top-right" richColors />
    <router-view />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
