<template>
  <div class="page-shell">
    <Header :user="user" :unread-count="unreadCount" />
    <section class="page-content">
      <div class="page-card categories-card">
        <div class="categories-header">
          <h1>Explore Categories</h1>
          <p>Choose a topic to filter your feed.</p>
        </div>
        <div class="categories-grid">
          <router-link
            v-for="category in categories"
            :key="category"
            :to="`/categories/${category}`"
            class="category-card"
          >
            <span>{{ category }}</span>
            <i class="fa fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '../components/Header.vue';
import api from '../api/api';

const user = ref(null);
const unreadCount = ref(0);
const categories = ref(['Food', 'Travel', 'Technology', 'Lifestyle']);

onMounted(async () => {
  try {
    const response = await api.getCurrentUser();
    if (response.data.success) {
      user.value = response.data.user;
      unreadCount.value = response.data.unread_notifications;
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
});
</script>

<style scoped>
.categories-card {
  padding: 2.5rem;
}

.categories-header {
  text-align: center;
  margin-bottom: 2rem;
}

.categories-header h1 {
  margin: 0;
  font-size: 2rem;
}

.categories-header p {
  color: #94a3b8;
  margin-top: 0.4rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: rgba(59,130,246,0.1);
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e2e8f0;
  font-size: 1.05rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: transform 0.2s, border 0.2s;
}

.category-card i {
  opacity: 0.7;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59,130,246,0.45);
}
</style>

