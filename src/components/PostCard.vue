<template>
<article class="post-card" :id="`post-${post.post_id}`">
    <div v-if="post.user_id === loggedInUser?.id" class="post-menu">
      <button class="menu-btn" @click="toggleMenu"><i class="fa fa-ellipsis-h"></i></button>
      <div v-if="showMenu" class="menu-pop">
        <router-link :to="`/post/edit/${post.post_id}`">Edit</router-link>
        <button type="button" @click.prevent="handleDelete">Delete</button>
      </div>
    </div>

    <header class="post-top">
      <div class="row-left">
        <div class="avatar">
          <img v-if="post.avatar" :src="post.avatar" />
          <i v-else class="fa fa-user"></i>
        </div>
        <div class="user-meta">
          <div class="username">{{ post.username }}</div>
          <div class="time">{{ formatDate(post.created_at, post.created_at_formatted) }}</div>
          <div v-if="post.city || post.country" class="location">
            <i class="fa fa-map-marker-alt"></i>
            {{ [post.city, post.country].filter(Boolean).join(', ') }}
          </div>
        </div>
      </div>
    </header>

    <div class="post-body">
      <div class="post-category">{{ post.category }}</div>
      <div 
        class="post-content" 
        v-html="formatContent(post.content)"
        :style="{ fontFamily: post.font_family || 'Roboto' }"
      ></div>

      <div v-if="mediaFiles.length" :class="['media-grid', `media-count-${mediaFiles.length}`]">
        <template v-for="(m, i) in mediaFiles" :key="i">
          <video v-if="isVideo(m)" controls class="media-item"><source :src="getMediaUrl(m)" /></video>
          <img v-else :src="getMediaUrl(m)" @click="openImage(getMediaUrl(m))" class="media-item" />
        </template>
      </div>
    </div>

    <footer class="post-actions">
      <button :class="['action', { active: post.is_liked }]" @click="toggleLike">
        <i class="fa fa-thumbs-up"></i> <span>{{ post.like_count || 0 }}</span>
      </button>
      <button class="action" @click="toggleComments">
        <i class="fa fa-comment"></i> <span>{{ post.comments?.length || 0 }}</span>
      </button>
    </footer>

    <section v-if="showComments" class="comments">
      <div class="comment-form">
        <input v-model="newComment" placeholder="Write a comment..." @keypress.enter="addComment" />
        <button class="btn" @click="addComment">Post</button>
      </div>

      <div class="comment-list">
        <div
          v-for="c in post.comments"
          :key="c.comment_id"
          class="comment"
          :id="`comment-${c.comment_id}`"
        >
          <div class="comment-top">
            <div><strong>{{ c.username }}</strong></div>
            <div class="muted">{{ formatDate(c.created_at, c.created_at_formatted) }}</div>
          </div>
          <div class="comment-body" v-html="formatContent(c.content)"></div>

          <div class="comment-actions">
            <span class="reply" @click="showReplyForm(c.comment_id)">Reply</span>
            <span v-if="c.user_id === loggedInUser?.id || loggedInUser?.role === 'admin'" class="delete" @click="deleteComment(c.comment_id)">Delete</span>
          </div>

          <div v-if="activeReplyForm === c.comment_id" class="reply-form">
            <input v-model="newReply" placeholder="Write a reply..." @keypress.enter="addReply(c.comment_id)" />
            <button class="btn" @click="addReply(c.comment_id)">Reply</button>
          </div>

          <div class="replies" v-if="c.replies && c.replies.length">
            <div
              v-for="r in c.replies"
              :key="r.reply_id"
              class="reply-item"
              :id="`reply-${r.reply_id}`"
            >
              <div class="reply-top">
                <strong>{{ r.username }}</strong> <span class="muted">{{ formatDate(r.created_at, r.created_at_formatted) }}</span>
              </div>
              <div v-html="formatContent(r.content)"></div>
              <div v-if="r.user_id === loggedInUser?.id || loggedInUser?.role === 'admin'" class="delete" @click="deleteReply(r.reply_id, c.comment_id)">Delete</div>
            </div>
          </div>
        </div>
      </div>
    </section>
</article>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import api, { backendBaseUrl } from '../api/api';


const props = defineProps({
  post: Object,
  loggedInUser: Object,
  focusPostId: Number,
  focusCommentId: Number,
  focusReplyId: Number
});
const emit = defineEmits(['refresh', 'clear-focus']);

// --- DEBUG LOG FOR POST DATES ---
console.log('Post received:', {
  postId: props.post?.post_id,
  createdAt: props.post?.created_at,
  formatted: props.post?.created_at_formatted
});

const showMenu = ref(false);
const showComments = ref(false);
const newComment = ref('');
const newReply = ref('');
const activeReplyForm = ref(null);

const toggleMenu = () => showMenu.value = !showMenu.value;
const toggleComments = () => showComments.value = !showComments.value;

const highlightTarget = (selector) => {
  const el = selector ? document.querySelector(selector) : null;
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('highlight-target');
  setTimeout(() => el.classList.remove('highlight-target'), 2500);
};

const runFocusIfNeeded = () => {
  if (props.focusPostId !== props.post?.post_id) return;
  showComments.value = true;
  nextTick(() => {
    if (props.focusReplyId) {
      highlightTarget(`#reply-${props.focusReplyId}`);
    } else if (props.focusCommentId) {
      highlightTarget(`#comment-${props.focusCommentId}`);
    } else {
      highlightTarget(`#post-${props.post.post_id}`);
    }
    emit('clear-focus');
  });
};

watch(
  () => [props.focusPostId, props.focusCommentId, props.focusReplyId, props.post?.post_id],
  () => runFocusIfNeeded()
);

runFocusIfNeeded();


const formatDate = (dateString) => {
  if (!dateString) {
    return '';
  }

  // The API now provides a standard ISO 8601 string (e.g., "2023-10-27T10:00:00.000Z").
  // JavaScript's Date constructor can parse this directly and correctly.
  const correctDate = new Date(dateString);

  // Use toLocaleString() to display the date and time in the user's own local timezone.
  // This provides a better user experience.
  // Check if the date is valid before formatting.
  if (isNaN(correctDate)) return 'Invalid date';
  return correctDate.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};
const formatContent = (c) => (c || '').replace(/\n/g, '<br>');

const mediaFiles = computed(() => {
  if (!props.post?.media_path) return [];
  try {
    const parsed = JSON.parse(props.post.media_path);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return props.post.media_path.split(',').map(s => s.trim()).filter(Boolean);
  }
});

const getMediaUrl = (path) => {
  if (!path) return '';
  let clean = path.startsWith('/') ? path.slice(1) : path;
  if (clean.startsWith('public/')) clean = clean.slice(7);
  if (!clean.startsWith('uploads/')) clean = 'uploads/' + clean;
  const base = backendBaseUrl && backendBaseUrl !== '/' ? backendBaseUrl.replace(/\/$/, '') : '';
  return base ? `${base}/${clean}` : `/${clean}`;
};

const isVideo = (p) => {
  const ext = (p || '').split('.').pop().toLowerCase();
  return ['mp4','mov','webm','ogg'].includes(ext);
};

const openImage = (url) => window.open(url, '_blank');

const toggleLike = async () => {
  try {
    const res = await api.toggleLike(props.post.post_id);
    if (res.data && res.data.success) {
      props.post.is_liked = res.data.liked;
      props.post.like_count = res.data.like_count;
    }
  } catch (e) { console.error(e); alert('Failed to toggle like'); }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;
  try {
    const res = await api.addComment(props.post.post_id, newComment.value);
    if (res.data && res.data.success) {
      props.post.comments = props.post.comments || [];
      props.post.comments.push(res.data.comment);
      newComment.value = '';
      emit('refresh');
    }
  } catch (e) { console.error(e); alert('Failed to add comment'); }
};

const deleteComment = async (commentId) => {
  if (!confirm('Delete comment?')) return;
  try {
    const res = await api.deleteComment(commentId);
    if (res.data && res.data.success) {
      props.post.comments = props.post.comments.filter(c => c.comment_id !== commentId);
      emit('refresh');
    }
  } catch (e) { console.error(e); }
};

const showReplyForm = (commentId) => activeReplyForm.value = activeReplyForm.value === commentId ? null : commentId;

const addReply = async (commentId) => {
  if (!newReply.value.trim()) return;
  try {
    const res = await api.addReply(commentId, newReply.value);
    if (res.data && res.data.success) {
      const comment = props.post.comments.find(c => c.comment_id === commentId);
      if (comment) {
        comment.replies = comment.replies || [];
        comment.replies.push(res.data.reply);
      }
      newReply.value = '';
      activeReplyForm.value = null;
      emit('refresh');
    }
  } catch (e) { console.error(e); }
};

const deleteReply = async (replyId, commentId) => {
  if (!confirm('Delete reply?')) return;
  try {
    const res = await api.deleteReply(replyId);
    if (res.data && res.data.success) {
      const comment = props.post.comments.find(c => c.comment_id === commentId);
      if (comment) comment.replies = comment.replies.filter(r => r.reply_id !== replyId);
      emit('refresh');
    }
  } catch (e) { console.error(e); }
};

const handleDelete = async () => {
  if (!confirm('Delete this post?')) return;
  try {
    const res = await api.deletePost(props.post.post_id);
    if (res.data && res.data.success) {
      emit('refresh');
    } else {
      alert(res.data?.message || 'Failed to delete post');
    }
  } catch (e) { console.error(e); alert('Failed to delete post'); }
};
</script>

<style scoped>
.post-card { position: relative; background: rgba(10, 18, 40, 0.95); border-radius: 18px; padding: 1.25rem; box-shadow: 0 18px 40px rgba(2,6,23,0.65); color: #e2e8f0; overflow: hidden; }
.post-top { display:flex; justify-content:flex-start; align-items:center; gap:1rem; }
.row-left { display:flex; gap:0.9rem; align-items:center; }
.avatar { width:52px; height:52px; border-radius:50%; background: rgba(59,130,246,0.15); display:flex; align-items:center; justify-content:center; overflow:hidden; color:#60a5fa; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.user-meta .username { font-weight:700; font-size:1.05rem; }
.user-meta .time { font-size: 0.8rem; color: #94a3b8; }
.location { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.location i { font-size: 0.85rem; color: #60a5fa; }
.post-menu { position: absolute; top: 1rem; right: 1rem; }
.menu-btn { background:rgba(59,130,246,0.15); border:none; cursor:pointer; color: #bfdbfe; padding:6px 8px; border-radius:10px; }
.menu-pop { position:absolute; right:0; margin-top:8px; background:#0f172a; border:1px solid rgba(59,130,246,0.3); border-radius:12px; padding:8px; box-shadow:0 18px 35px rgba(2,6,23,0.7); display:flex; flex-direction:column; gap:6px; min-width:140px; }
.menu-pop a, .menu-pop button { background:transparent; border:none; color:#e2e8f0; text-align:left; padding:6px 8px; border-radius:8px; font-weight:600; cursor:pointer; }
.menu-pop button { font-family: inherit; }
.menu-pop a:hover, .menu-pop button:hover { background: rgba(59,130,246,0.15); }
.post-category { font-weight:800; color:#93c5fd; margin-bottom:6px; text-transform: uppercase; font-size: 0.85rem; letter-spacing:0.08em; }
.post-content { margin-bottom:10px; line-height:1.6; color:#e2e8f0; }

/* MEDIA GRID */
.media-grid { display: grid; gap:8px; margin-top:10px; }

/* 1 image */
.media-count-1 { grid-template-columns: 1fr; }
/* 2 images */
.media-count-2 { grid-template-columns: repeat(2, 1fr); }
/* 3 images: large left + 2 stacked right */
.media-count-3 { grid-template-areas: "left right1" "left right2"; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; }
.media-count-3 .media-item:nth-child(1) { grid-area: left; }
.media-count-3 .media-item:nth-child(2) { grid-area: right1; }
.media-count-3 .media-item:nth-child(3) { grid-area: right2; }
/* 4 images: 2x2 grid */
.media-count-4 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
/* 5+ images: 3-column square tiles */
.media-count-5, .media-count-6, .media-count-7, .media-count-8, .media-count-9, .media-count-10 { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 160px; }

.media-item { width:100%; height:100%; border-radius:12px; object-fit:cover; border:1px solid rgba(59,130,246,0.2); }

/* actions */
.post-actions { display:flex; gap:12px; margin-top:12px; }
.action { background:rgba(59,130,246,0.1); border: none; cursor:pointer; font-weight:600; color:#bfdbfe; display:flex; gap:8px; align-items:center; padding:6px 10px; border-radius:999px; transition: background 0.2s, color 0.2s; }
.action:hover { background:rgba(59,130,246,0.25); }
.action.active { color:#60a5fa; background:rgba(59,130,246,0.35); }

/* comments */
.comments { margin-top:12px; border-top: 1px solid rgba(148,163,184,0.15); padding-top:12px; }
.comment-form { display:flex; gap:8px; align-items:center; margin-bottom:12px; }
.comment-form input { flex:1; padding:10px 12px; border-radius:20px; border:1px solid rgba(148,163,184,0.25); outline:none; background:rgba(15,23,42,0.8); color:#e2e8f0; }
.btn { background:linear-gradient(90deg,#3b82f6,#6366f1); color:white; border:none; padding:8px 14px; border-radius:999px; font-weight:700; cursor:pointer; }
.comment-list .comment { background: rgba(15,23,42,0.8); padding:10px; border-radius:12px; margin-bottom:8px; border:1px solid rgba(59,130,246,0.15); }
.comment-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.comment-actions { display:flex; gap:10px; margin-top:6px; color:#93c5fd; font-weight:600; }
/* REPLY SECTION — improved design */
.reply-form {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  background: rgba(10, 18, 40, 0.85);
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(59,130,246,0.2);
  animation: fadeIn 0.25s ease-out;
}

.reply-form input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,0.25);
  outline: none;
  background: rgba(15,23,42,0.8);
  color: #e2e8f0;
  transition: 0.3s;
}

.reply-form input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
  background: rgba(15,23,42,0.95);
}

.reply-form .btn {
  padding: 8px 16px;
  background: linear-gradient(90deg,#3b82f6,#6366f1);
  border-radius: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.reply-form .btn:hover {
  background: linear-gradient(90deg,#2563eb,#4f46e5);
  transform: scale(1.05);
}

/* REPLY ITEMS */
.replies {
  margin-left: 1.2rem;
  margin-top: 10px;
  border-left: 2px solid rgba(59,130,246,0.25);
  padding-left: 14px;
}

.reply-item {
  background: rgba(15,23,42,0.8);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(59,130,246,0.15);
  margin-bottom: 8px;
  animation: fadeIn 0.25s ease-out;
}

.reply-item:hover {
  background: rgba(15,23,42,0.9);
  border-color: rgba(59,130,246,0.3);
}

.reply-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #bfdbfe;
}

.reply-item .muted {
  font-size: 0.8rem;
  color: #94a3b8;
}

.reply-item .delete {
  margin-top: 6px;
  color: #f87171;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.reply-item .delete:hover {
  color: #ef4444;
}

/* Smooth reveal */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.muted { color: #94a3b8; font-size:0.85rem; }
</style>
