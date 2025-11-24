<template>
  <div class="user-dashboard page-shell">
    <Header :user="user" :unread-count="unreadCount" />

    <div class="dashboard-grid">
      <aside class="panel analytics-panel">
        <div class="panel-scroll">
          <div class="panel-title">Your Analytics</div>

          <div class="analytics-cards">
            <div class="analytic-card">
              <span class="label">Total Posts</span>
              <span class="value">{{ analytics.totalPosts }}</span>
              <small>{{ analytics.lastPostDate }}</small>
            </div>
            <div class="analytic-card">
              <span class="label">Engagements</span>
              <span class="value">{{ analytics.totalEngagements }}</span>
              <small>{{ analytics.totalLikes }} likes • {{ analytics.totalComments }} comments</small>
            </div>
            <div class="analytic-card">
              <span class="label">Media Uploads</span>
              <span class="value">{{ analytics.totalMedia }}</span>
              <small>{{ analytics.images }} images • {{ analytics.videos }} videos</small>
            </div>
          </div>

          
          <div class="panel-title mt">Top Categories</div>
          <ul class="category-list">
            <li v-for="cat in topCategories" :key="cat.name">
              <span>{{ cat.name }}</span>
              <span class="badge">{{ cat.count }}</span>
            </li>
            <li v-if="topCategories.length === 0" class="empty">
              Not enough posts yet.
            </li>
          </ul>
        </div>
      </aside>

      <main class="feed-panel">
        <div class="status-section" @click="$router.push('/post/create')">
          <img class="avatar" src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="avatar">
          <input type="text" placeholder="What's on your mind?" readonly />
          <div class="status-actions">
            <i class="fa fa-image"></i>
            <i class="fa fa-video-camera"></i>
            <i class="fa fa-paper-plane"></i>
          </div>
        </div>

        <section class="posts-wrapper">
          <div v-if="loading" class="feed-message">
            Loading posts...
          </div>
          <div v-else-if="posts.length === 0" class="feed-message">
            {{ searchQuery ? 'No matching posts found.' : 'No posts yet.' }}
          </div>
          <PostCard
            v-else
            v-for="post in posts"
            :key="post.post_id"
            :post="post"
            :logged-in-user="user"
            :focus-post-id="focusTargets.post"
            :focus-comment-id="focusTargets.comment"
            :focus-reply-id="focusTargets.reply"
            @refresh="loadPosts"
            @clear-focus="clearFocusTargets"
          />
        </section>
      </main>

      <aside class="panel profile-panel" v-if="user">
        <div class="panel-scroll">
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-avatar">
                {{ user.username?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <h3>{{ user.username }}</h3>
                <p>{{ user.email }}</p>
              </div>
            </div>
            <div class="profile-stats">
              <div>
                <span class="label">Role</span>
                <span class="value">{{ user.role }}</span>
              </div>
              <div>
                <span class="label">Notifications</span>
                <span class="value">{{ unreadCount }}</span>
              </div>
            </div>
            <router-link to="/profile" class="profile-btn">
              View full profile
            </router-link>
          </div>

          <div class="panel-title">Reminders</div>
          <ul class="reminders">
            <li>Stay active and engage with others.</li>
            <li>Share media-rich posts for better reach.</li>
            <li>Check notifications to stay updated.</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import PostCard from '../components/PostCard.vue';
import api from '../api/api';

const route = useRoute();
const router = useRouter();

const user = ref(null);
const posts = ref([]);
const unreadCount = ref(0);
const loading = ref(true);
const searchQuery = ref(route.query.q || '');

/* ============================================================
   FIXED ANALYTICS
   ============================================================ */
const analytics = computed(() => {
  const u = user.value;

// Wait until user + posts are fully loaded
if (!user.value || loading.value) {
  return {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalEngagements: 0,
    totalMedia: 0,
    images: 0,
    videos: 0,
    lastPostDate: 'Loading...'
  };
}


  // ADMIN → See all posts
  // USER → Only own posts
  // Standardize user_id on all posts (fix API inconsistencies)
const normalizedPosts = posts.value.map(p => ({
  ...p,
  user_id: Number(p.user_id ?? p.userID ?? p.author_id ?? p.owner_id ?? 0)
}));

const currentUserId = Number(user.value?.user_id ?? user.value?.id ?? 0);

const postsForAnalytics =
  user.value.role === 'admin'
    ? normalizedPosts
    : normalizedPosts.filter(p => p.user_id === currentUserId);

  const totalPosts = postsForAnalytics.length;

  const totalLikes = postsForAnalytics.reduce(
    (sum, p) => sum + (Number(p.like_count) || 0),
    0
  );

  const totalComments = postsForAnalytics.reduce(
    (sum, p) => sum + ((p.comments || []).length),
    0
  );

  // MEDIA COUNTERS
  const media = postsForAnalytics.reduce(
    (acc, p) => {
      if (!p.media_path) return acc;
      let files = [];

      try {
        const decoded = JSON.parse(p.media_path);
        files = Array.isArray(decoded) ? decoded : [decoded];
      } catch {
        files = [p.media_path];
      }

      files.forEach(f => {
        const ext = f.split('.').pop().toLowerCase();
        if (["mp4","webm","mov","ogg","mkv","avi"].includes(ext))
          acc.videos++;
        else
          acc.images++;
      });

      return acc;
    },
    { images: 0, videos: 0 }
  );

  // Latest post
  let lastPostDate = "No posts yet";
  if (postsForAnalytics.length > 0) {
    const latest = postsForAnalytics[0];
    lastPostDate = latest.created_at_formatted || latest.created_at || "No posts yet";
  }

  return {
    totalPosts,
    totalLikes,
    totalComments,
    totalEngagements: totalLikes + totalComments,
    totalMedia: media.images + media.videos,
    images: media.images,
    videos: media.videos,
    lastPostDate
  };
});

/* ============================================================
   FIXED TOP CATEGORIES (role-based category analytics)
   ============================================================ */
const topCategories = computed(() => {
  if (!user.value) return [];

  // Normalize posts for consistent user_id
  const normalizedPosts = posts.value.map(p => ({
    ...p,
    user_id: Number(p.user_id ?? p.userID ?? p.author_id ?? p.owner_id ?? 0)
  }));

  const currentUserId = Number(user.value?.id ?? user.value?.user_id ?? 0);

  // Filter posts based on role
  const postsForCategories =
    user.value.role === 'admin'
      ? normalizedPosts
      : normalizedPosts.filter(p => p.user_id === currentUserId);

  // Count categories
  const counts = {};
  postsForCategories.forEach(post => {
    if (!post.category) return;
    counts[post.category] = (counts[post.category] || 0) + 1;
  });

  // Sort and take top 4
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
});


/* ============================================================
   FIXED loadPosts user assignment (reactivity safe)
   ============================================================ */
const loadPosts = async () => {
  loading.value = true;
  try {
    let response;
    const searchTerm = searchQuery.value?.trim().toLowerCase();

    if (searchTerm) {
      response = await api.getPosts();
      let allPosts = response.data?.posts || [];
      posts.value = allPosts.filter(post => {
        const usernameMatch = post.username?.toLowerCase().includes(searchTerm);
        const categoryMatch = post.category?.toLowerCase().includes(searchTerm);
        const contentMatch = post.content?.toLowerCase().includes(searchTerm);
        return usernameMatch || categoryMatch || contentMatch;
      });
    } else if (route.params.category) {
      response = await api.getPostsByCategory(route.params.category);
      posts.value = response.data?.posts || [];
    } else {
      response = await api.getPosts();
      posts.value = response.data?.posts || [];
    }

    // FIXED: Safe deep clone → ensures reactivity
    if (response.data?.logged_in_user) {
      user.value = JSON.parse(JSON.stringify(response.data.logged_in_user));
    }

    if (!unreadCount.value) {
      const notifResponse = await api.getNotifications();
      if (notifResponse.data?.success) {
        unreadCount.value = notifResponse.data.unread_count;
      }
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  } finally {
    loading.value = false;
  }
};

// Focus targets
const focusTargets = computed(() => ({
  post: route.query.focus_post ? Number(route.query.focus_post) : null,
  comment: route.query.focus_comment ? Number(route.query.focus_comment) : null,
  reply: route.query.focus_reply ? Number(route.query.focus_reply) : null
}));

const clearFocusTargets = () => {
  const nextQuery = { ...route.query };
  delete nextQuery.focus_post;
  delete nextQuery.focus_comment;
  delete nextQuery.focus_reply;
  router.replace({ path: route.path, query: nextQuery });
};

const clearSearch = () => {
  const { q, ...queryWithoutQ } = route.query;
  router.push({ path: route.path, query: queryWithoutQ });
  searchQuery.value = '';
};

// Load initial data
onMounted(loadPosts);

// Watch for route + search query changes
watch(
  () => ({ path: route.path, query: route.query.q }),
  async (newVal, oldVal) => {
    if (newVal.path !== oldVal?.path || newVal.query !== oldVal?.query) {
      searchQuery.value = route.query.q || '';
      if (route.path === '/home' || newVal.path !== oldVal?.path) {
        await loadPosts();
      }
    }
  },
  { immediate: true, deep: true }
);
</script>



<style scoped>
.user-dashboard {
  min-height: 100vh;
  color: #f3f4f6;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr) minmax(260px, 340px);
  gap: clamp(1rem, 2vw, 2rem);
  padding: 1.5rem clamp(1rem, 4vw, 3rem) 2rem;
  width: min(1600px, 100%);
  margin: 1.25rem auto 0;
  height: calc(100vh - 110px);
}

.panel {
  background: rgba(15, 23, 42, 0.65);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(12px);
}

.panel-title {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.panel-title.mt {
  margin-top: 1.5rem;
}

.analytics-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analytic-card {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.analytic-card .label {
  color: #cbd5f5;
  font-size: 0.85rem;
}

.analytic-card .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #f8fafc;
}

.analytic-card small {
  color: #94a3b8;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(148, 163, 184, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
}

.category-list .badge {
  background: #3b82f6;
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.category-list .empty {
  justify-content: center;
  color: #94a3b8;
}

.feed-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
  padding-right: 0.75rem;
}

.analytics-panel,
.profile-panel {
  height: 100%;
  overflow: hidden;
  position: sticky;
  top: 110px;
}

.panel-scroll {
  overflow-y: auto;
  height: 100%;
  padding-right: 0.4rem;
}

.status-section {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 18px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.status-section .avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.35);
}

.status-section input {
  flex: 1;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  letter-spacing: 0.02em;
}

.status-actions {
  display: flex;
  gap: 0.75rem;
  color: #94a3b8;
}

.status-actions i {
  font-size: 1.2rem;
}

.posts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

.feed-message {
  text-align: center;
  background: rgba(15, 23, 42, 0.8);
  padding: 2rem;
  border-radius: 16px;
  color: #e2e8f0;
}

.profile-panel .profile-card {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.profile-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
}

.profile-header h3 {
  margin: 0;
  color: #f8fafc;
}

.profile-header p {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.profile-stats {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.profile-stats .label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.profile-stats .value {
  display: block;
  margin-top: 0.15rem;
  font-weight: 600;
}

.profile-btn {
  display: block;
  text-align: center;
  background: #2563eb;
  color: white;
  padding: 0.75rem;
  border-radius: 12px;
  text-decoration: none;
  margin-top: 0.5rem;
  font-weight: 600;
}

.reminders {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #cbd5f5;
}

.reminders li {
  padding-left: 1.25rem;
  position: relative;
  font-size: 0.9rem;
}

.reminders li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    overflow: visible;
  }

  .panel,
  .status-section,
  .feed-panel {
    width: 100%;
  }

  .feed-panel {
    height: auto;
    overflow: visible;
    padding-right: 0;
  }
}

.highlight-target {
  animation: highlightPulse 2s ease-in-out;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35);
  border-radius: 10px;
}

@keyframes highlightPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.45);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}
</style>

