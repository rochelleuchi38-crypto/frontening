<template>
  <div class="page-shell">
    <Header :user="user" :unread-count="unreadCount" />
    <section class="page-content">
      <div class="page-card profile-card">
        <h1>Profile</h1>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
          <div class="profile-header">
            <div class="profile-avatar">
              {{ user?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="profile-info">
              <h2>{{ user?.username }}</h2>
              <p>{{ user?.email }}</p>
              <span class="role-pill">{{ user?.role }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn primary" @click="goToMemberEdit" :disabled="!user">
              <i class="fa fa-edit"></i> Edit Profile
            </button>
            <button @click="handleLogout" class="btn ghost">
              <i class="fa fa-sign-out"></i> Logout
            </button>
          </div>
        </div>
      </div>
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
const unreadCount = ref(0);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await api.getCurrentUser();
    if (response.data.success) {
      user.value = response.data.user;
      unreadCount.value = response.data.unread_notifications;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    loading.value = false;
  }
});

const goToMemberEdit = () => {
  if (!user.value?.id) return;
  router.push(`/admin/members/${user.value.id}/edit?self=1`);
};

const handleLogout = async () => {
  if (!confirm('Are you sure you want to logout?')) return;
  
  try {
    await api.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    // Still redirect to login even if API call fails
    router.push('/login');
  }
};
</script>

<style scoped>
.profile-card h1 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(148,163,184,0.2);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.8rem;
}

.profile-info p {
  margin: 0.35rem 0;
  color: #94a3b8;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  background: rgba(59,130,246,0.2);
  color: #93c5fd;
  font-weight: 600;
  font-size: 0.85rem;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn.primary {
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  color: white;
}

.btn.ghost {
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(148,163,184,0.4);
  color: #cbd5f5;
}

.loading {
  color: #94a3b8;
}
</style>

