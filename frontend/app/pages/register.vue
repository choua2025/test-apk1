<script setup lang="ts">
definePageMeta({ middleware: "guest" });

const { request } = useApi();

const form = ref();
const username = ref("");
const password = ref("");
const confirm = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref("");

const rules = {
  required: (v: string) => !!v?.trim() || "Required",
  min8: (v: string) => (v?.length ?? 0) >= 8 || "At least 8 characters",
  match: (v: string) => v === password.value || "Passwords do not match",
};

async function submit() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  error.value = "";
  try {
    await request("/member/register", {
      method: "POST",
      body: { member_name: username.value.trim(), member_password: password.value },
    });
    success.value = "Registered! Redirecting to login...";
    setTimeout(() => navigateTo("/login"), 800);
  } catch (err) {
    error.value = (err as Error).message;
    loading.value = false;
  }
}
</script>

<template>
  <v-main class="bg-grey-lighten-4">
    <v-container class="fill-height d-flex justify-center">
      <v-card width="400" class="pa-4" elevation="4">
        <v-card-title class="text-h5">Create account</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mb-4">{{ success }}</v-alert>

          <v-form ref="form" @submit.prevent="submit">
            <v-text-field
              v-model="username"
              label="Username"
              prepend-inner-icon="mdi-account"
              autocomplete="username"
              :rules="[rules.required]"
            />
            <v-text-field
              v-model="password"
              label="Password"
              prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="new-password"
              :rules="[rules.min8]"
              @click:append-inner="showPassword = !showPassword"
            />
            <v-text-field
              v-model="confirm"
              label="Confirm password"
              prepend-inner-icon="mdi-lock-check"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :rules="[rules.match]"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Register
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          Already have an account?
          <v-btn to="/login" variant="text" color="primary">Log in</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>
