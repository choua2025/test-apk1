<script setup lang="ts">
definePageMeta({ middleware: "auth" });

interface Customer {
  customer_id: number;
  customer_name: string;
}

const { request } = useApi();
const { member, logout } = useAuth();

const customers = ref<Customer[]>([]);
const loading = ref(false);
const search = ref("");

const headers = [
  { title: "ID", key: "customer_id", width: 100 },
  { title: "Name", key: "customer_name" },
  { title: "Actions", key: "actions", sortable: false, align: "end" as const },
];

// add / edit dialog
const dialog = ref(false);
const form = ref();
const editing = ref<Customer | null>(null);
const name = ref("");
const saving = ref(false);

// delete dialog
const deleteDialog = ref(false);
const deleting = ref<Customer | null>(null);

const snackbar = reactive({ show: false, text: "", color: "success" });
function notify(text: string, color = "success") {
  Object.assign(snackbar, { show: true, text, color });
}

const required = (v: string) => !!v?.trim() || "Customer name is required";

async function load() {
  loading.value = true;
  try {
    const res = await request<{ data: Customer[] }>("/customer");
    customers.value = res.data;
  } catch (err) {
    notify((err as Error).message, "error");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  name.value = "";
  dialog.value = true;
}

function openEdit(customer: Customer) {
  editing.value = customer;
  name.value = customer.customer_name;
  dialog.value = true;
}

async function save() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const body = { customer_name: name.value.trim() };
    if (editing.value) {
      await request(`/customer/${editing.value.customer_id}`, { method: "PUT", body });
      notify("Customer updated");
    } else {
      await request("/customer", { method: "POST", body });
      notify("Customer added");
    }
    dialog.value = false;
    await load();
  } catch (err) {
    notify((err as Error).message, "error");
  } finally {
    saving.value = false;
  }
}

function confirmDelete(customer: Customer) {
  deleting.value = customer;
  deleteDialog.value = true;
}

async function remove() {
  if (!deleting.value) return;
  saving.value = true;
  try {
    await request(`/customer/${deleting.value.customer_id}`, { method: "DELETE" });
    notify("Customer deleted");
    deleteDialog.value = false;
    await load();
  } catch (err) {
    notify((err as Error).message, "error");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <v-app-bar color="primary">
    <v-app-bar-title>Customer Management</v-app-bar-title>
    <template #append>
      <v-chip prepend-icon="mdi-account" variant="text" class="mr-2">
        {{ member?.member_name }}
      </v-chip>
      <v-btn prepend-icon="mdi-logout" variant="outlined" @click="logout">Log out</v-btn>
    </template>
  </v-app-bar>

  <v-main class="bg-grey-lighten-4">
    <v-container style="max-width: 900px">
      <v-card elevation="2">
        <v-card-title class="d-flex align-center ga-4 pa-4">
          <span>Customers</span>
          <v-spacer />
          <v-text-field
            v-model="search"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            label="Search"
            hide-details
            single-line
            style="max-width: 260px"
          />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add</v-btn>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="customers"
          :search="search"
          :loading="loading"
          no-data-text="No customers yet"
        >
          <template #item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEdit(item)" />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </v-main>

  <v-dialog v-model="dialog" max-width="420">
    <v-card :title="editing ? 'Edit customer' : 'Add customer'">
      <v-form ref="form" @submit.prevent="save">
        <v-card-text>
          <v-text-field v-model="name" label="Customer name" autofocus :rules="[required]" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn type="submit" color="primary" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="420">
    <v-card title="Delete customer">
      <v-card-text>
        Delete <strong>{{ deleting?.customer_name }}</strong>? This cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" :loading="saving" @click="remove">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
    {{ snackbar.text }}
  </v-snackbar>
</template>
