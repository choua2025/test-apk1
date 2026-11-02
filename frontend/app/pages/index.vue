<script setup lang="ts">
// Logged in -> customers. Otherwise: no users yet -> register, else login.
definePageMeta({
  middleware: [
    async () => {
      const { isLoggedIn } = useAuth();
      if (isLoggedIn.value) return navigateTo("/customers");

      try {
        const { request } = useApi();
        const { exists } = await request<{ exists: boolean }>("/member/exists");
        return navigateTo(exists ? "/login" : "/register");
      } catch {
        // stay on this page and show the error below
      }
    },
  ],
});
</script>

<template>
  <v-main>
    <v-container class="fill-height d-flex justify-center">
      <v-alert type="error" variant="tonal" max-width="420">
        Cannot reach the server. Make sure the backend is running on port 5000.
      </v-alert>
    </v-container>
  </v-main>
</template>
