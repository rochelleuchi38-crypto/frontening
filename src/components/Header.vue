<template>
  <header class="header">
    <div class="brand">
      <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" class="brand-avatar" />
      <div class="brand-text">
        <div class="brand-title">{{ user?.username || 'Guest' }}</div>
        <div class="brand-sub">Green Community</div>
      </div>
    </div>

    <div class="center-controls">
      <div class="search">
        <i class="fa fa-search search-icon" @click="doSearch" title="Search"></i>
        <input
          v-model="query"
          placeholder="Search posts, people..."
          @keyup.enter="doSearch"
        />
        <i
          v-if="query"
          class="fa fa-times clear-icon"
          @click="() => { query = ''; doSearch(); }"
          title="Clear search"
        ></i>
      </div>
    </div>

    <nav class="nav">
      <router-link to="/home" class="nav-link">Home</router-link>
      <router-link to="/categories" class="nav-link">Categories</router-link>
      <router-link
        v-if="user?.role === 'admin'"
        to="/admin/members"
        class="nav-link"
      >
        Member
      </router-link>

      <div class="notification-container">
        <button class="bell" @click="toggleNotifications" aria-label="Notifications">
          <i class="fa fa-bell"></i>
          <span v-if="unreadCountLocal > 0" class="badge">{{ unreadCountLocal > 99 ? '99+' : unreadCountLocal }}</span>
        </button>

        <div class="notif-dropdown" :class="{ open: showDropdown }">
          <div class="notif-header">
            <span>Notifications</span>
            <router-link to="/notifications" class="view-all">View All</router-link>
          </div>

          <div class="notif-body">
            <div v-if="loading" class="empty">Loading...</div>
            <div v-else-if="notifications.length === 0" class="empty">No notifications</div>

            <div
              v-for="n in notifications"
              :key="n.notification_id"
              class="notif-item"
              :class="{ unread: n.is_read == 0 }"
              @click="handleNotificationClick(n)"
            >
              <div class="msg">{{ n.message }}</div>
              <div class="ts">{{ formatTimeAgo(n.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <router-link to="/profile" class="nav-link profile-link">
        <i class="fa fa-user-circle"></i>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../api/api';

const props = defineProps({
  user: Object,
  unreadCount: { type: Number, default: 0 }
});

const router = useRouter();
const route = useRoute();
const query = ref('');
const showDropdown = ref(false);
const notifications = ref([]);
const loading = ref(false);
const unreadCountLocal = ref(props.unreadCount);

// Sync search input with route query
watch(() => route.query.q, (newQuery) => {
  if (newQuery !== query.value) {
    query.value = newQuery || '';
  }
}, { immediate: true });

watch(() => props.unreadCount, (v) => { unreadCountLocal.value = v; });

const toggleNotifications = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) loadNotifications();
};

const loadNotifications = async () => {
  loading.value = true;
  try {
    const res = await api.getNotifications();
    if (res.data && res.data.success) {
      notifications.value = res.data.notifications.slice(0, 8);
      unreadCountLocal.value = res.data.unread_count || 0;
    }
  } catch (e) {
    console.error('loadNotifications', e);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (n) => {
  try {
    if (n.is_read == 0) {
      await api.markNotificationRead(n.notification_id);
    }
  } catch (e) {
    console.error(e);
  }
  showDropdown.value = false;

  if (n.post_id) {
    router.push({ path: '/home', query: { focus_post: n.post_id, focus_comment: n.comment_id || null, focus_reply: n.reply_id || null }});
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    let date;
    if (dateString.includes('T') || dateString.endsWith('Z')) {
      date = new Date(dateString);
    } else {
      const manilaOffset = '+08:00';
      date = new Date(dateString.replace(' ', 'T') + manilaOffset);
    }
    
    const now = new Date();
    const s = Math.floor((now - date) / 1000);
    
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  } catch {
    return dateString;
  }
};

const refresh = async () => {
  try {
    const res = await api.getNotifications();
    if (res.data && res.data.success) {
      unreadCountLocal.value = res.data.unread_count || 0;
    }
  } catch {}
};

let intervalId;
onMounted(() => {
  intervalId = setInterval(refresh, 30000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const doSearch = () => {
  const searchTerm = query.value.trim();
  if (!searchTerm) {
    // If search is empty, remove the query parameter
    const { q, ...queryWithoutQ } = route.query;
    router.push({ path: route.path, query: queryWithoutQ });
    return;
  }
  
  // Navigate to home with the search query
  router.push({ 
    path: '/home', 
    query: { ...route.query, q: searchTerm } 
  });
};

</script>

<style scoped>
.header { position: sticky; top: 0; z-index: 200; width: 100%; display:flex; align-items:center; justify-content: space-between; gap:1rem; padding: 18px clamp(1rem, 4vw, 3rem); background: rgba(8, 15, 35, 0.96); border-bottom: 1px solid rgba(59, 130, 246, 0.25); box-shadow: 0 20px 40px rgba(2, 6, 23, 0.75); backdrop-filter: blur(14px); }

/* brand */
.brand { display:flex; align-items:center; gap:0.85rem; }
.brand-avatar { width:44px; height:44px; border-radius:50%; border:2px solid rgba(96,165,250,0.4); background:#0f172a; padding:4px; }
.brand-title { font-weight:700; font-size:1rem; }
.brand-sub { font-size: 0.78rem; color: rgba(148,163,184,0.85) }

/* center search */
.center-controls { flex:1; display:flex; justify-content:center; }
.search { background: rgba(15, 23, 42, 0.8); border-radius: 22px; padding:6px 10px; display:flex; align-items:center; width:60%; max-width:520px; border:1px solid rgba(59,130,246,0.25); position:relative; }
.search input { border: none; outline:none; background: transparent; margin-left:8px; width:100%; color:#e2e8f0; }
.search-icon { cursor:pointer; }
.clear-icon { cursor:pointer; margin-left:8px; color:#f43f5e; }

/* nav */
.nav { display:flex; align-items:center; gap:0.75rem; }
.nav-link { color: #e2e8f0; text-decoration:none; font-weight:600; padding:6px 10px; border-radius:8px; transition: background 0.2s; }
.nav-link.router-link-active { background: rgba(59,130,246,0.25); }

/* notifications */
.notification-container { position:relative; }
.bell { background:transparent; border:none; color: #e2e8f0; font-size:1.1rem; position:relative; cursor:pointer; }
.badge { position:absolute; top:-8px; right:-8px; background:#f43f5e; color:#fff; border-radius:50%; padding:3px 6px; font-size:11px; box-shadow:0 6px 12px rgba(0,0,0,0.2); }

/* dropdown */
.notif-dropdown { position:absolute; right:0; top:calc(100% + 10px); width:360px; background:#0f172a; color:#e2e8f0; border-radius:12px; border:1px solid rgba(59,130,246,0.3); box-shadow: 0 20px 45px rgba(2,6,23,0.6); display:none; overflow:hidden; z-index:30; }
.notif-dropdown.open { display:block; }
.notif-header { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background: rgba(13,26,54,0.85); font-weight:700; }
.notif-body { max-height:320px; overflow:auto; }
.notif-item { padding:12px 14px; border-bottom:1px solid rgba(148,163,184,0.2); cursor:pointer; }
.notif-item.unread { background: rgba(59,130,246,0.15); }
.empty { padding: 20px; text-align:center; color: #94a3b8; }

/* small helpers */
.profile-link { font-size: 1.1rem; color:#e2e8f0 }
.view-all { font-size:0.85rem; color:#60a5fa; text-decoration:none; font-weight:600; }

@media (max-width: 900px) {
  .header { flex-wrap: wrap; }
  .center-controls { order: 3; width: 100%; }
  .search { width: 100%; }
}
</style>
