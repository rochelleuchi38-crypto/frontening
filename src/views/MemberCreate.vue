<template>
  <div class="member-form-shell">
    <Header :user="user" :unread-count="0" />

    <section class="form-container">
      <h2>Create User</h2>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="username"
              v-model="form.username"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input
              type="email"
              id="email"
              v-model="form.email"
              placeholder="Enter email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              :type="passwordVisible ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              placeholder="Enter password"
              required
            />
            <button type="button" class="toggle-password" @click="passwordVisible = !passwordVisible">
              <i :class="passwordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <div class="select-wrapper">
            <select id="role" v-model="form.role" required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button class="submit-btn" type="submit" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create User' }}
        </button>
        <router-link to="/admin/members" class="cancel-btn">
          Cancel
        </router-link>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import api from '../api/api';

const router = useRouter();
const user = ref(null);
const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'user'
});
const passwordVisible = ref(false);
const error = ref('');
const success = ref('');
const loading = ref(false);

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

const handleSubmit = async () => {
  if (!form.value.username || !form.value.email || !form.value.password) {
    error.value = 'All fields are required.';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const res = await api.createAdminUser({ ...form.value });
    if (res.data.success) {
      success.value = 'User created successfully!';
      setTimeout(() => router.push('/admin/members'), 1000);
    } else {
      error.value = res.data.message || 'Failed to create user.';
    }
  } catch (err) {
    error.value = err?.message || err?.data?.message || 'Failed to create user.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUser);
</script>

<style scoped>
.member-form-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1d3b74 0%, #0a1330 45%, #020617 100%);
  padding-bottom: 2rem;
  color: #e2e8f0;
}

.form-container {
  background: rgba(6, 12, 30, 0.92);
  padding: 2.5rem;
  border-radius: 28px;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto 0;
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.65);
  border: 1px solid rgba(59,130,246,0.25);
  text-align: center;
  color: #e2e8f0;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #3b82f6; /* Soft blue heading */
}

.error {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
  padding: 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.success {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
  padding: 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: #cbd5f5; /* Light blue label */
  margin-bottom: 0.4rem;
}

.input-wrapper,
.password-wrapper,
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

input,
select {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 14px;
  border: 1px solid rgba(59,130,246,0.25);
  font-size: 1rem;
  outline: none;
  background: rgba(15,23,42,0.8);
  color: #f8fafc;
  transition: border 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

input::placeholder {
  color: #94a3b8; /* Light gray placeholder */
  font-style: italic;
}

input:focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1rem;
}

.submit-btn {
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  transform: scale(1.03);
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  display: inline-block;
  margin-top: 0.8rem;
  background: #475569; /* Gray cancel button */
  color: #e2e8f0;
  text-decoration: none;
  padding: 0.85rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
}

.cancel-btn:hover {
  background: #64748b;
  color: #e2e8f0;
  transform: scale(1.03);
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
}
</style>
