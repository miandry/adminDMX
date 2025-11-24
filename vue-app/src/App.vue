<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
            <router-link to="/users">Users</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
// Logic global (si besoin)
</script>

<style scoped>
h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
nav a {
  margin-right: 10px;
  color: blue;
}
</style>
