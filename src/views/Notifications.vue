<template>
  <div class="page-shell">
    <Header :user="user" :unread-count="unreadCount" />
    <section class="page-content">
      <div class="page-card notifications-card">
        <div class="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Stay in sync with what’s happening.</p>
          </div>
          <button v-if="unreadCount > 0" class="mark-all-read" @click="markAllAsRead">
            Mark all read
          </button>
        </div>
        <div class="notifications-list">
          <div v-if="loading" class="no-notifications">Loading...</div>
          <div v-else-if="notifications.length === 0" class="no-notifications">
            No notifications yet.
          </div>
          <div
            v-else
            v-for="notif in notifications"
            :key="notif.notification_id"
            :class="['notification-item', { unread: notif.is_read == 0 }]"
            @click="handleNotificationClick(notif)"
          >
            <div class="notification-content">
              <div class="notification-message">{{ notif.message }}</div>
              <div class="notification-time">{{ formatTimeAgo(notif.created_at) }}</div>
            </div>
            <div v-if="notif.is_read == 0" class="notification-actions">
              <button class="mark-read-btn" @click.stop="markAsRead(notif.notification_id)">
                Mark read
              </button>
            </div>
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
const notifications = ref([]);
const unreadCount = ref(0);
const loading = ref(true);

const loadNotifications = async () => {
  loading.value = true;
  try {
    const userResponse = await api.getCurrentUser();
    if (userResponse.data.success) {
      user.value = userResponse.data.user;
    }
    
    const response = await api.getNotifications();
    if (response.data.success) {
      notifications.value = response.data.notifications;
      unreadCount.value = response.data.unread_count;
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (notificationId) => {
  try {
    await api.markNotificationRead(notificationId);
    await loadNotifications();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  if (!confirm('Mark all notifications as read?')) return;
  
  for (const notif of notifications.value) {
    if (notif.is_read == 0) {
      await markAsRead(notif.notification_id);
    }
  }
};

const handleNotificationClick = async (notif) => {
  // Mark as read first
  if (notif.is_read == 0) {
    await markAsRead(notif.notification_id);
  }
  
  // Navigate to the post with focus parameters
  if (notif.post_id) {
    const query = { focus_post: notif.post_id };
    if (notif.comment_id) {
      query.focus_comment = notif.comment_id;
    }
    if (notif.reply_id) {
      query.focus_reply = notif.reply_id;
    }
    
    router.push({
      path: '/home',
      query: query
    });
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    // Parse date as Manila time (UTC+8)
    let date;
    if (dateString.includes('T') || dateString.endsWith('Z')) {
      date = new Date(dateString);
    } else {
      // Format: "Y-m-d H:i:s" - treat as Manila time (UTC+8)
      const manilaOffset = '+08:00';
      date = new Date(dateString.replace(' ', 'T') + manilaOffset);
    }
    
    // Calculate difference (Date objects are absolute timestamps)
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
  } catch {
    return dateString;
  }
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notifications-card {
  padding: 2.5rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.notifications-header h1 {
  margin: 0;
  font-size: 2rem;
}

.notifications-header p {
  color: #94a3b8;
  margin: 0.35rem 0 0;
}

.mark-all-read {
  background: rgba(59,130,246,0.15);
  border: 1px solid rgba(59,130,246,0.4);
  color: #bfdbfe;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.notifications-list {
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 20px;
  overflow: hidden;
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148,163,184,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  background: rgba(10,18,40,0.8);
  transition: background 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: rgba(59,130,246,0.1);
}

.notification-item.unread {
  background: rgba(59,130,246,0.2);
  border-left: 3px solid #3b82f6;
}

.notification-message {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.mark-read-btn {
  background: transparent;
  border: 1px solid rgba(148,163,184,0.4);
  color: #cbd5f5;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
}

.no-notifications {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}
</style>

