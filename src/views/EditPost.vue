<template>
  <div class="page-shell edit-page">
    <Header :user="user" :unread-count="unreadCount" />

    <section class="page-content">
      <div class="edit-layout">

        <div class="edit-card">
          <!-- Error & Loading Messages -->
          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="loading" class="loading-msg">Loading...</div>

          <template v-else>
            <!-- User Info & Category -->
            <div class="user-info">
              <div class="avatar">
                {{ user?.username?.charAt(0)?.toUpperCase() || "B" }}
              </div>
              <div>
                <div class="username">{{ user?.username }}</div>
                <div class="muted">{{ user?.email }}</div>
              </div>

              <select v-model="form.category" class="category-select" required>
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <!-- Font Picker -->
            <div class="form-group" style="margin-top:1rem;">
              <label style="color:#cbd5f5; margin-bottom:0.3rem; display:block;">Font Style</label>
              <select
                v-model="form.font_family"
                class="category-select"
                style="margin-left:0; width:200px;"
              >
                <option value="Roboto" style="font-family:Roboto;">Roboto</option>
                <option value="Poppins" style="font-family:Poppins;">Poppins</option>
                <option value="Lora" style="font-family:Lora;">Lora</option>
                <option value="Montserrat" style="font-family:Montserrat;">Montserrat</option>
                <option value="Playfair Display" style="font-family:'Playfair Display';">Playfair Display</option>
                <option value="Open Sans" style="font-family:'Open Sans';">Open Sans</option>
              </select>
            </div>

            <!-- Textarea with Live Font Preview -->
            <textarea
              v-model="form.content"
              class="post-input"
              :style="{ fontFamily: form.font_family }"
              placeholder="Update your post..."
              required
            ></textarea>

            <!-- Media Preview (Existing + New) -->
            <div v-if="existingMedia.length || selectedFiles.length" class="media-preview-box">
              <!-- Existing Media -->
              <div
                v-for="(m, index) in existingMedia"
                :key="'existing-' + m.filename"
                class="media-preview-item"
              >
                <img v-if="m.type === 'image'" :src="m.url" class="preview-img" />
                <video v-else-if="m.type === 'video'" :src="m.url" controls class="preview-video"></video>
                <button class="remove-btn" @click="removeExisting(index)">Remove</button>
              </div>

              <!-- Newly Selected Media -->
              <div
                v-for="(file, index) in selectedFiles"
                :key="file.preview"
                class="media-preview-item"
              >
                <img v-if="file.type.startsWith('image/')" :src="file.preview" class="preview-img" />
                <video v-else-if="file.type.startsWith('video/')" :src="file.preview" controls class="preview-video"></video>
                <button class="remove-btn" @click="removeNewFile(index)">Remove</button>
              </div>
            </div>

            <!-- Post Footer: Upload + Submit -->
            <div class="post-footer">
              <label class="upload-chip" for="media-input">
                <i class="fa fa-paperclip"></i>
                Media ({{ selectedFiles.length + existingMedia.length }}/5)
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
                :disabled="submitting"
              >
                {{ submitting ? "Updating..." : "Update Post" }}
              </button>
            </div>

          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "../components/Header.vue";
import api from "../api/api";

const router = useRouter();
const route = useRoute();

const user = ref(null);
const unreadCount = ref(0);

const form = ref({ category: "", content: "", font_family: "Roboto" });
const existingMedia = ref([]);
const removedMedia = ref([]);
const selectedFiles = ref([]);

const error = ref("");
const loading = ref(true);
const submitting = ref(false);

// Load post data
const loadPost = async () => {
  loading.value = true;
  try {
    const userResp = await api.getCurrentUser();
    if (userResp.data.success) {
      user.value = userResp.data.user;
      unreadCount.value = userResp.data.unread_notifications;
    }

    const postResp = await api.getPost(route.params.id);
    if (postResp.data.success) {
      const post = postResp.data.post;
      form.value.category = post.category;
      form.value.content = post.content;
      form.value.font_family = post.font_family || "Roboto";

      const mediaList = post.media_path ? JSON.parse(post.media_path) : [];
      existingMedia.value = mediaList.map((file) => ({
        url: file.replace(/^public/, ""),
        type: file.match(/\.(mp4|mov|avi|webm)$/i) ? "video" : "image",
        filename: file
      }));
    } else {
      error.value = postResp.data.message || "Failed to load post";
    }
  } catch (err) {
    error.value = err.data?.message || err.message;
  } finally {
    loading.value = false;
  }
};

// Handle new file selection
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);

  if (files.length + selectedFiles.value.length + existingMedia.value.length > 5) {
    error.value = "Maximum 5 files allowed";
    return;
  }

  files.forEach((file) => {
    file.preview = URL.createObjectURL(file);
    selectedFiles.value.push(file);
  });

  event.target.value = null;
};

// Remove existing media
const removeExisting = (index) => {
  removedMedia.value.push(existingMedia.value[index].filename);
  existingMedia.value.splice(index, 1);
};

// Remove newly added file
const removeNewFile = (index) => {
  URL.revokeObjectURL(selectedFiles.value[index].preview);
  selectedFiles.value.splice(index, 1);
};

// Submit updated post
const handleSubmit = async () => {
  submitting.value = true;
  error.value = "";

  try {
    const formData = new FormData();
    formData.append("category", form.value.category);
    formData.append("content", form.value.content);
    formData.append("font_family", form.value.font_family);
    formData.append("removed_media", JSON.stringify(removedMedia.value));

    selectedFiles.value.forEach((f) => formData.append("media[]", f));

    const response = await api.updatePost(route.params.id, formData);

    if (response.data.success) {
      router.push(response.data.redirect || "/home");
    } else {
      error.value = response.data.message;
    }
  } catch (err) {
    error.value = err.data?.message || err.message;
  } finally {
    submitting.value = false;
  }
};

onMounted(loadPost);
</script>

<style scoped>
.edit-layout { width: min(900px, 95%); margin: 1.5rem auto; }
.edit-card { background: rgba(15, 23, 42, 0.85); padding: 1.75rem; border-radius: 24px; box-shadow: 0 20px 40px rgba(2,6,23,0.6); border:1px solid rgba(59,130,246,0.15); color:#f8fafc; }

.user-info { display:flex; align-items:center; gap:1rem; }
.avatar { width:56px; height:56px; border-radius:50%; background:rgba(59,130,246,0.25); color:#bfdbfe; display:flex; justify-content:center; align-items:center; font-size:1.2rem; font-weight:700; }
.category-select { margin-left:auto; border-radius:999px; padding:0.45rem 1rem; border:1px solid rgba(148,163,184,0.4); background:rgba(15,23,42,0.5); color:#e2e8f0; }

.post-input { width:100%; min-height:200px; margin-top:1rem; border-radius:18px; padding:1rem 1.25rem; background:rgba(15,23,42,0.6); border:1px solid rgba(148,163,184,0.3); color:#f8fafc; resize:vertical; }

.media-preview-box { margin-top:1rem; display:flex; flex-wrap:wrap; gap:12px; }
.media-preview-item { width:120px; height:120px; position:relative; border-radius:10px; overflow:hidden; border:1px solid rgba(148,163,184,0.3); }
.preview-img, .preview-video { width:100%; height:100%; object-fit:cover; }
.remove-btn { position:absolute; top:4px; right:4px; background:rgba(239,68,68,0.85); color:white; padding:3px 8px; font-size:0.75rem; border:none; border-radius:6px; cursor:pointer; }

.post-footer { margin-top:1.5rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
.upload-chip { display:inline-flex; align-items:center; padding:0.55rem 1.2rem; border-radius:999px; border:1px dashed rgba(148,163,184,0.6); cursor:pointer; color:#bfdbfe; gap:0.5rem; }
.post-btn { margin-left:auto; background:linear-gradient(135deg,#3b82f6,#6366f1); border:none; padding:0.75rem 1.8rem; border-radius:999px; color:#fff; font-weight:600; cursor:pointer; }
.error-message { background:rgba(239,68,68,0.2); color:#fecaca; padding:0.75rem 1rem; border-radius:12px; margin-bottom:1rem; }
.loading-msg { text-align:center; padding:1rem; color:#93c5fd; }
</style>
