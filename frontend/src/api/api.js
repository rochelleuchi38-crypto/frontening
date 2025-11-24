import axios from 'axios';

const resolvedBackendBaseUrl = (() => {
  const envUrl = import.meta?.env?.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }

  // When running Vite locally, talk directly to the bundled PHP server
  if (import.meta?.env?.DEV) {
    return 'http://localhost:3002';
  }

  // If this runs in a browser without explicit config, reuse the current origin
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return '/';
})();

export const backendBaseUrl = resolvedBackendBaseUrl;

const api = axios.create({
  baseURL: resolvedBackendBaseUrl, // Use Vite proxy in development ("/"), env in prod
  withCredentials: true,
  headers: {
    'Accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser/axios set the multipart boundary automatically
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

function handleError(err) {
  if (err?.response?.data) return Promise.reject(err.response.data);
  if (err?.response) return Promise.reject(err.response);
  return Promise.reject({ message: err?.message || 'Network error' });
}

export default {
  // Auth
  login(payload) {
    return api.post('/auth/login', payload).catch(handleError);
  },
  register(payload) {
    return api.post('/auth/register', payload).catch(handleError);
  },
  getPendingEmail() {
    return api.get('/api/auth/pending-email').catch(handleError);
  },
  verifyEmailCode(payload) {
    return api.post('/api/auth/verify_code', payload).catch(handleError);
  },
  logout() {
    return api.get('/auth/logout').catch(handleError).then(() => {
      window.location.href = '/login';
    });
  },
  
  // User & Posts
  getCurrentUser() {
    return api.get('/api/get_user').catch(handleError);
  },
  getPosts() {
    return api.get('/api/get_posts').catch(handleError);
  },
  getPostsByCategory(category) {
    return api.get(`/api/get_posts_by_category?category=${category}`).catch(handleError);
  },
  createPost(formData) {
    return api.post('/post_section/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).catch(handleError);
  },
  getPost(id) {
    return api.get(`/api/get_post/${id}`).catch(handleError);
  },
  updatePost(id, formData) {
    return api.post(`/post_section/edit_post/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).catch(handleError);
  },
  deletePost(id) {
    return api.get(`/post_section/delete_post/${id}`).catch(handleError);
  },

  // Search for users and posts by query
  search(query) {
    return api.get('/api/search', { params: { q: query } }).catch(handleError);
  },
  
  // Likes, Comments, Replies
  toggleLike(postId) {
    const formData = new FormData();
    formData.append('post_id', postId);
    return api.post('/api/toggle_like', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).catch(handleError);
  },
  addComment(postId, content) {
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('content', content);
    return api.post('/api/add_comment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).catch(handleError);
  },
  deleteComment(commentId) {
    const formData = new FormData();
    formData.append('comment_id', commentId);
    return api.post('/api/delete_comment', formData).catch(handleError);
  },
  addReply(commentId, content) {
    const formData = new FormData();
    formData.append('comment_id', commentId);
    formData.append('content', content);
    return api.post('/api/add_reply', formData).catch(handleError);
  },
  deleteReply(replyId) {
    const formData = new FormData();
    formData.append('reply_id', replyId);
    return api.post('/api/delete_reply', formData).catch(handleError);
  },
  
  // Notifications
  getNotifications() {
    return api.get('/api/get_notifications').catch(handleError);
  },
  markNotificationRead(notificationId) {
    const formData = new FormData();
    formData.append('notification_id', notificationId);
    return api.post('/api/mark_notification_read', formData).catch(handleError);
  },
  
  // Profile
  getProfile() {
    return api.get('/users/profile').catch(handleError);
  },
  updateProfile(formData) {
    return api.post('/users/update_profile', formData).catch(handleError);
  },

  // Admin members
  getAdminUsers(params = {}) {
    return api.get('/api/admin/users', { params }).catch(handleError);
  },
  createAdminUser(payload) {
    return api.post('/api/admin/users', payload).catch(handleError);
  },
  getAdminUser(id) {
    return api.get(`/api/admin/users/${id}`).catch(handleError);
  },
  updateAdminUser(id, payload) {
    return api.post(`/api/admin/users/${id}`, payload).catch(handleError);
  },
  deleteAdminUser(id) {
    return api.post(`/api/admin/users/${id}/delete`).catch(handleError);
  }
};
