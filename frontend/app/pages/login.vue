<script setup lang="ts">
import type { Member } from "~/composables/useAuth";

definePageMeta({ middleware: "guest" });

const { request } = useApi();
const { setSession } = useAuth();

const form = ref();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");

const required = (v: string) => !!v?.trim() || "Required";

async function submit() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  error.value = "";
  try {
    const res = await request<{ token: string; member: Member }>("/member/login", {
      method: "POST",
      body: { member_name: username.value.trim(), member_password: password.value },
    });
    setSession(res.token, res.member);
    await navigateTo("/customers");
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-main class="bg-grey-lighten-4">
    <v-container class="fill-height d-flex justify-center">
      <v-card width="400" class="pa-4" elevation="4">
        <v-card-title class="text-h5">Log in</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

          <v-form ref="form" @submit.prevent="submit">
            <v-text-field
              v-model="username"
              label="Username"
              prepend-inner-icon="mdi-account"
              autocomplete="username"
              :rules="[required]"
            />
            <v-text-field
              v-model="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="current-password"
              :rules="[required]"
              @click:append-inner="showPassword = !showPassword"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Log in
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          No account yet?
          <v-btn to="/register" variant="text" color="primary">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>
