import axios from 'axios';

// Always use the live backend URL from environment variable
const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendBaseUrl, // Live backend only
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Handle FormData properly
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set multipart boundary
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
  login(payload) { return api.post('/auth/login', payload).catch(handleError); },
  register(payload) { return api.post('/auth/register', payload).catch(handleError); },
  getPendingEmail() { return api.get('/api/auth/pending-email').catch(handleError); },
  verifyEmailCode(payload) { return api.post('/api/auth/verify_code', payload).catch(handleError); },
  logout() { return api.get('/auth/logout').catch(handleError).then(() => { window.location.href = '/login'; }); },

  // User & Posts
  getCurrentUser() { return api.get('/api/get_user').catch(handleError); },
  getPosts() { return api.get('/api/get_posts').catch(handleError); },
  getPostsByCategory(category) { return api.get(`/api/get_posts_by_category?category=${category}`).catch(handleError); },
  createPost(formData) { return api.post('/post_section/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(handleError); },
  getPost(id) { return api.get(`/api/get_post/${id}`).catch(handleError); },
  updatePost(id, formData) { return api.post(`/post_section/edit_post/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(handleError); },
  deletePost(id) { return api.get(`/post_section/delete_post/${id}`).catch(handleError); },

  // Search
  search(query) { return api.get('/api/search', { params: { q: query } }).catch(handleError); },

  // Likes, Comments, Replies
  toggleLike(postId) { const fd = new FormData(); fd.append('post_id', postId); return api.post('/api/toggle_like', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(handleError); },
  addComment(postId, content) { const fd = new FormData(); fd.append('post_id', postId); fd.append('content', content); return api.post('/api/add_comment', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(handleError); },
  deleteComment(commentId) { const fd = new FormData(); fd.append('comment_id', commentId); return api.post('/api/delete_comment', fd).catch(handleError); },
  addReply(commentId, content) { const fd = new FormData(); fd.append('comment_id', commentId); fd.append('content', content); return api.post('/api/add_reply', fd).catch(handleError); },
  deleteReply(replyId) { const fd = new FormData(); fd.append('reply_id', replyId); return api.post('/api/delete_reply', fd).catch(handleError); },

  // Notifications
  getNotifications() { return api.get('/api/get_notifications').catch(handleError); },
  markNotificationRead(notificationId) { const fd = new FormData(); fd.append('notification_id', notificationId); return api.post('/api/mark_notification_read', fd).catch(handleError); },

  // Profile
  getProfile() { return api.get('/users/profile').catch(handleError); },
  updateProfile(formData) { return api.post('/users/update_profile', formData).catch(handleError); },

  // Admin
  getAdminUsers(params = {}) { return api.get('/api/admin/users', { params }).catch(handleError); },
  createAdminUser(payload) { return api.post('/api/admin/users', payload).catch(handleError); },
  getAdminUser(id) { return api.get(`/api/admin/users/${id}`).catch(handleError); },
  updateAdminUser(id, payload) { return api.post(`/api/admin/users/${id}`, payload).catch(handleError); },
  deleteAdminUser(id) { return api.post(`/api/admin/users/${id}/delete`).catch(handleError); }
};
