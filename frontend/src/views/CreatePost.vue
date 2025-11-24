<template>
  <div class="page-shell compose-page">
    <Header :user="user" :unread-count="unreadCount" />
    <section class="page-content">
      <div class="compose-layout">
        <aside class="compose-info">
          <div class="logo-banner">
            <div class="logo-circle">BF</div>
            <div>
              <h2>BlogFlow</h2>
              <p>Share photos, stories, and inspiration.</p>
            </div>
          </div>
          <ul class="tips-list">
            <li>Attach up to five images or videos per post.</li>
            <li>Use categories so others can find your content.</li>
            <li>Keep captions friendly and engaging.</li>
          </ul>
        </aside>

        <div class="compose-card">
          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="user-info">
            <div class="avatar">
              {{ user?.username?.charAt(0)?.toUpperCase() || 'B' }}
            </div>
            <div>
              <div class="username">{{ user?.username }}</div>
              <div class="muted">{{ user?.email }}</div>
            </div>

            <!-- Category Select -->
            <select v-model="form.category" class="category-select" required>
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>

          <!-- 🔥 FONT PICKER ADDED HERE -->
          <div class="form-group" style="margin-top: 1rem;">
            <label style="color: #cbd5f5; margin-bottom: 0.3rem; display:block;">
              Font Style
            </label>
            <select 
              v-model="form.font_family"
              class="category-select"
              style="margin-left: 0; width: 220px;"
            >
              <option value="Roboto" style="font-family: Roboto;">Roboto</option>
              <option value="Poppins" style="font-family: Poppins;">Poppins</option>
              <option value="Lora" style="font-family: Lora;">Lora</option>
              <option value="Montserrat" style="font-family: Montserrat;">Montserrat</option>
              <option value="Playfair Display" style="font-family: 'Playfair Display';">Playfair Display</option>
              <option value="Open Sans" style="font-family: 'Open Sans';">Open Sans</option>
            </select>
          </div>
          <!-- 🔥 END FONT PICKER -->

          <!-- TEXTAREA WITH LIVE FONT PREVIEW -->
          <textarea
            v-model="form.content"
            class="post-input"
            :style="{ fontFamily: form.font_family }"
            placeholder="What would you like to share today?"
            required
          ></textarea>

          <!-- 🔥 LOCATION BUTTON -->
          <div style="margin-top: 1rem;">
            <button type="button" @click="getLocation" class="post-btn">
              {{ form.latitude && form.longitude ? 'Location Captured' : 'Get My Location' }}
            </button>
            <div v-if="locationError" style="color: #f87171; margin-top: 0.5rem;">
              {{ locationError }}
            </div>
          </div>

          <div v-if="mediaPreview.length > 0" class="media-preview">
            <div 
              v-for="(file, index) in mediaPreview" 
              :key="index" 
              class="media-preview-item"
            >
              <img v-if="file.type.startsWith('image/')" :src="file.url" alt="Preview" />
              <video v-else :src="file.url" controls></video>
              <button 
                type="button" 
                class="remove-btn" 
                @click="removeFile(index)"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>

          <div class="post-footer">
            <label class="upload-chip" for="media-input">
              <i class="fa fa-paperclip"></i>
              Media ({{ selectedFiles.length }}/5)
            </label>
            <input
              id="media-input"
              type="file"
              multiple
              accept="image/*,video/*"
              @change="handleFileSelect"
              style="display: none"
            />

            <button 
              type="button" 
              class="post-btn" 
              @click="handleSubmit" 
              :disabled="loading"
            >
              {{ loading ? 'Posting...' : 'Publish' }}
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

// 🔥 Form with location
const form = ref({
  category: '',
  content: '',
  font_family: 'Roboto',
  latitude: null,
  longitude: null
});

const selectedFiles = ref([]);
const mediaPreview = ref([]);
const error = ref('');
const loading = ref(false);
const locationError = ref(null);

// 🔥 Get browser location
function getLocation() {
  if (!navigator.geolocation) {
    locationError.value = "Geolocation not supported by browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude;
      form.value.longitude = position.coords.longitude;
      locationError.value = null;
    },
    (err) => {
      locationError.value = "Failed to get location.";
      console.log(err);
    }
  );
}

// File handling
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length + selectedFiles.value.length > 5) {
    error.value = 'Maximum 5 files allowed';
    return;
  }
  
  files.forEach(file => {
    selectedFiles.value.push(file);
    const url = URL.createObjectURL(file);
    mediaPreview.value.push({ file, url, type: file.type });
  });
};

const removeFile = (index) => {
  URL.revokeObjectURL(mediaPreview.value[index].url);
  selectedFiles.value.splice(index, 1);
  mediaPreview.value.splice(index, 1);
};

// Submit post
const handleSubmit = async () => {
  if (!form.value.category) {
    error.value = 'Please select a category';
    return;
  }
  if (!form.value.content.trim()) {
    error.value = 'Please enter some content';
    return;
  }
  
  // Optional auto-fetch location if empty
  if (!form.value.latitude || !form.value.longitude) {
    getLocation();
  }

  loading.value = true;
  error.value = '';
  
  try {
    const formData = new FormData();
    formData.append('category', form.value.category);
    formData.append('content', form.value.content);
    formData.append('font_family', form.value.font_family);
    formData.append('latitude', form.value.latitude ?? '');
    formData.append('longitude', form.value.longitude ?? '');

    selectedFiles.value.forEach(file => {
      formData.append('media[]', file);
    });
    
    const response = await api.createPost(formData);
    
    if (response.data.success) {
      router.push(response.data.redirect || '/home');
    } else {
      error.value = response.data.message || 'Failed to create post';
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to create post';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await api.getCurrentUser();
    if (response.data.success) {
      user.value = response.data.user;
      unreadCount.value = response.data.unread_notifications;
    }
  } catch (err) {
    console.error('Error loading user:', err);
  }
});
</script>

<style scoped>
/* your existing styles remain unchanged */
.compose-page {
  min-height: 100vh;
}
.compose-layout {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 2rem);
  width: min(1200px, 100%);
  margin: 1.5rem auto;
}
.compose-info,
.compose-card {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 24px;
  padding: 1.75rem;
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(59,130,246,0.15);
}
.logo-banner {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}
.logo-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #cbd5f5;
}
.compose-card .user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.compose-card .avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(59,130,246,0.2);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #bfdbfe;
}
.category-select {
  margin-left: auto;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.4);
  background: rgba(15,23,42,0.6);
  color: #e2e8f0;
  padding: 0.35rem 0.9rem;
}
.post-input {
  width: 100%;
  min-height: 200px;
  margin-top: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(148,163,184,0.3);
  background: rgba(15,23,42,0.7);
  color: #f8fafc;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  resize: vertical;
}
.media-preview {
  display: flex;
  gap: 0.85rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.media-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(59,130,246,0.3);
}
.media-preview-item img,
.media-preview-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(239,68,68,0.9);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}
.post-footer {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.upload-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  border-radius: 999px;
  border: 1px dashed rgba(148,163,184,0.6);
  color: #bfdbfe;
  cursor: pointer;
}
.post-btn {
  margin-left: auto;
  background: linear-gradient(135deg,#3b82f6,#6366f1);
  border: none;
  padding: 0.75rem 1.8rem;
  border-radius: 999px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.error-message {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}
</style>
