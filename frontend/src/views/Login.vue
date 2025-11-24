<template>
  <div class="auth-shell">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="logo-circle">BF</div>
        <div>
          <h1>BlogFlow</h1>
          <p>Sign in to continue</p>
        </div>
      </div>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <label class="input-label">Username or Email</label>
        <div class="input-field">
          <i class="fa fa-user"></i>
          <input
            v-model="form.username"
            type="text"
            placeholder="Enter username or email"
            required
          />
        </div>

        <label class="input-label">Password</label>
        <div class="input-field">
          <i class="fa fa-lock"></i>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter password"
            required
          />
          <button type="button" class="eye-btn" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
          </button>
        </div>

        <button type="submit" class="primary-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="switch-text">
        Don't have an account?
        <router-link to="/register">Create one</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/api';

const router = useRouter();
const form = ref({ username: '', password: '' });
const error = ref('');
const successMessage = ref('');
const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await api.login({
      username: form.value.username,
      password: form.value.password
    });
    
    if (response.data.success) {
      router.push('/home');
    } else {
      error.value = response.data.message || 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.data?.message || err.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #1d3b74 0%, #0a1330 45%, #020617 100%);
  padding: 2rem;
}

.auth-card {
  width: min(420px, 100%);
  background: rgba(6, 12, 30, 0.9);
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.65);
  border: 1px solid rgba(59,130,246,0.25);
  color: #e2e8f0;
}

.auth-brand {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
  letter-spacing:0.08em;
}

.alert {
  padding: 0.85rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.alert.error {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
}

.alert.success {
  background: rgba(34,197,94,0.15);
  color: #bbf7d0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-label {
  font-size: 0.9rem;
  color: #cbd5f5;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(59,130,246,0.25);
  border-radius: 14px;
  padding: 0.1rem 0.75rem;
}

.input-field input {
  width: 100%;
  border: none;
  background: transparent;
  color: #f8fafc;
  padding: 0.85rem;
  font-size: 1rem;
  outline: none;
}

.input-field i {
  color: #94a3b8;
}

.eye-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0 0.5rem;
}

.primary-btn {
  margin-top: 0.5rem;
  border: none;
  border-radius: 16px;
  padding: 0.9rem;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-text {
  margin-top: 1.5rem;
  text-align: center;
  color: #94a3b8;
}

.switch-text a {
  color: #93c5fd;
}
</style>

