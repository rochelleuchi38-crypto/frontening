<template>
  <div class="verify-shell">
    <div class="verify-box">
      <h2>Email Verification</h2>
      <p>Enter the code sent to your email.</p>

      <p v-if="error" class="alert error">{{ error }}</p>
      <p v-if="success" class="alert success">{{ success }}</p>

      <form @submit.prevent="handleVerify">
        <input
          v-model="code"
          type="text"
          maxlength="6"
          placeholder="Enter 6-digit code"
          required
        />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <button class="link-btn" @click="goBackToRegister">
        Need to change your email? Go back to registration
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/api';

const router = useRouter();
const pendingEmail = ref('');
const code = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const fetchPendingEmail = async () => {
  try {
    const res = await api.getPendingEmail();
    pendingEmail.value = res.data.pending_email;
  } catch (err) {
    pendingEmail.value = '';
    router.push('/register');
  }
};

const handleVerify = async () => {
  if (!code.value.trim()) {
    error.value = 'Please enter the verification code.';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const res = await api.verifyEmailCode({ code: code.value.trim() });
    if (res.data.success) {
      success.value = 'Email verified successfully! Redirecting to login...';
      setTimeout(() => router.push('/login'), 1500);
    } else {
      error.value = res.data.message || 'Invalid verification code.';
    }
  } catch (err) {
    error.value = err?.message || err?.data?.message || 'Verification failed.';
  } finally {
    loading.value = false;
  }
};

const goBackToRegister = () => {
  router.push('/register');
};

onMounted(fetchPendingEmail);
</script>

<style scoped>
.verify-shell {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top, #1d3b74 0%, #0a1330 45%, #020617 100%);
  padding: 1rem;
  color: #e2e8f0;
}

.verify-box {
  background: rgba(6, 12, 30, 0.92);
  padding: 2rem;
  border-radius: 28px;
  width: 350px;
  text-align: center;
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.65);
  border: 1px solid rgba(59,130,246,0.25);
}

h2 {
  margin-bottom: 0.75rem;
  color: #3b82f6; /* Blue heading */
}

p {
  color: #cbd5f5;
  margin-bottom: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 14px;
  border: 1px solid rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.8);
  color: #f8fafc;
  font-size: 1rem;
  text-align: center;
  outline: none;
  transition: border 0.3s, box-shadow 0.3s;
}

input::placeholder {
  color: #94a3b8;
  font-style: italic;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.95);
}

button[type="submit"] {
  margin-top: 0.5rem;
  padding: 0.85rem;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background: linear-gradient(135deg,#2563eb,#4f46e5);
  transform: scale(1.03);
  box-shadow: 0 0 12px rgba(0,0,0,0.5);
}

button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-btn {
  margin-top: 1rem;
  background: transparent;
  color: #3b82f6;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.link-btn:hover {
  color: #60a5fa;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  text-align: center;
}

.alert.error {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
}

.alert.success {
  background: rgba(34,197,94,0.15);
  color: #22c55e;
}
</style>
