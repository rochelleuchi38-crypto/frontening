<template>
  <div class="member-form-shell">
    <Header :user="user" :unread-count="0" />

    <section class="card">
      <h2>Update User</h2>

      <p v-if="error" class="error-box">{{ error }}</p>
      <p v-if="success" class="success-box">{{ success }}</p>

      <form v-if="!initialLoading" @submit.prevent="handleSubmit" class="form-grid">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            placeholder="Enter username"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="Enter email"
            required
          />
        </div>

        <div class="form-group" v-if="!lockRole">
          <label for="role" class="form-label">Role</label>
          <select id="role" v-model="form.role" required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group" v-else>
          <label class="form-label">Role</label>
          <input type="text" :value="form.role" disabled class="readonly-input" />
          <small class="field-note">Role changes are disabled when editing from Profile.</small>
        </div>

        <div class="button-row">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update User' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="goBack">
            Cancel
          </button>
        </div>
      </form>

      <div v-else class="loading-state">Loading user details...</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../api/api';

const router = useRouter();
const route = useRoute();
const user = ref(null);
const form = ref({
  username: '',
  email: '',
  role: 'user'
});
const error = ref('');
const success = ref('');
const loading = ref(false);
const initialLoading = ref(true);
const lockRole = computed(() => route.query.self === '1');

const fetchUser = async () => {
  try {
    const res = await api.getCurrentUser();
    if (res.data.success) {
      user.value = res.data.user;
    }
  } catch {
    router.push('/login');
  }
};

const fetchMember = async () => {
  try {
    const res = await api.getAdminUser(route.params.id);
    if (res.data.success) {
      form.value = {
        username: res.data.user.username,
        email: res.data.user.email,
        role: res.data.user.role
      };
    } else {
      error.value = res.data.message || 'User not found.';
    }
  } catch (err) {
    error.value = err?.message || err?.data?.message || 'Failed to load user.';
  } finally {
    initialLoading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const res = await api.updateAdminUser(route.params.id, { ...form.value });
    if (res.data.success) {
      success.value = 'User updated successfully!';
      setTimeout(() => router.push('/admin/members'), 1000);
    } else {
      error.value = res.data.message || 'Failed to update user.';
    }
  } catch (err) {
    error.value = err?.message || err?.data?.message || 'Failed to update user.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push('/admin/members');

onMounted(async () => {
  await fetchUser();
  await fetchMember();
});
</script>

<style scoped>
.member-form-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1d3b74 0%, #0a1330 45%, #020617 100%);
  padding-bottom: 2rem;
  color: #e2e8f0;
}

.card {
  background: rgba(6, 12, 30, 0.92);
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.65);
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  margin: 2rem auto 0;
  border: 1px solid rgba(59,130,246,0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0,0,0,0.7);
}

h2 {
  color: #3b82f6; /* Blue heading */
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-weight: 600;
  color: #cbd5f5; /* Light blue label */
  margin-bottom: 0.4rem;
  display: inline-block;
}

input[type="text"],
input[type="email"],
select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 14px;
  border: 1px solid rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.8); /* Dark input background */
  color: #f8fafc; /* Light text */
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  box-sizing: border-box;
  transition: border 0.3s, box-shadow 0.3s;
}

.readonly-input {
  cursor: not-allowed;
  opacity: 0.7;
}

.field-note {
  display: block;
  margin-top: 0.25rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

input::placeholder {
  color: #94a3b8;
  font-style: italic;
}

input:focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.95);
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  font-weight: 600;
  border-radius: 16px;
  transition: all 0.3s ease;
  padding: 0.75rem 1.25rem;
  text-align: center;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
}

.btn-secondary {
  background: rgba(59,130,246,0.25);
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: rgba(59,130,246,0.4);
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(0,0,0,0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  background: rgba(239,68,68,0.15);
  border: 1px solid #fca5a5;
  color: #fecaca;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.success-box {
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.4);
  color: #22c55e;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.loading-state {
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
}

@media (max-width: 480px) {
  .card {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>
