  <template>
    <div class="members-shell">
      <Header :user="user" :unread-count="0" />

      <section class="card">
        <div class="actions-row">
          <form class="search-form" @submit.prevent="handleSearch">
            <input
              type="text"
              v-model="search"
              placeholder="Search users..."
            />
            <button type="submit" class="btn btn-primary">Search</button>
          </form>

          <button class="btn btn-primary add-btn" @click="goToCreate">
            Add Account
          </button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="empty">Loading members...</td>
              </tr>
              <tr v-else-if="members.length === 0">
                <td colspan="4" class="empty">No user records found.</td>
              </tr>
              <tr v-for="member in members" :key="member.id">
                <td>{{ member.username }}</td>
                <td>{{ member.email }}</td>
                <td>
                  <span :class="['tag', member.role === 'admin' ? 'tag-admin' : 'tag-user']">
                    {{ capitalize(member.role) }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="row-actions">
                    <button class="btn-pill" @click="editMember(member.id)">Edit</button>
                    <button
                      class="btn-pill danger"
                      :disabled="member.id === user?.id"
                      @click="deleteMember(member.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="pages.length > 1">
          <button
            class="page-btn"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            ← Prev
          </button>
          <button
            v-for="page in pages"
            :key="page"
            :class="['page-btn', page === pagination.page ? 'active' : '']"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            :disabled="pagination.page === pagination.total_pages"
            @click="changePage(pagination.page + 1)"
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  </template>

  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Header from '../components/Header.vue';
  import api from '../api/api';

  const router = useRouter();
  const user = ref(null);
  const members = ref([]);
  const pagination = ref({ page: 1, total_pages: 1, per_page: 5, total_rows: 0 });
  const search = ref('');
  const loading = ref(true);
  const error = ref('');

  const pages = computed(() => {
    const perPage = Number(pagination.value?.per_page) || 1;
    const totalRows = Number(pagination.value?.total_rows) || members.value.length || 0;
    let totalPages = Number(pagination.value?.total_pages);

    if (!totalPages && perPage > 0) {
      totalPages = Math.max(1, Math.ceil(totalRows / perPage));
    }

    return Array.from({ length: totalPages || 1 }, (_, idx) => idx + 1);
  });

  const loadMembers = async (page = 1) => {
    loading.value = true;
    error.value = '';
    try {
      const res = await api.getAdminUsers({ page, q: search.value });
      if (res.data.success) {
        members.value = res.data.users || [];
        pagination.value = res.data.pagination;
        user.value = res.data.logged_in_user;
      } else {
        error.value = res.data.message || 'Failed to load members.';
      }
    } catch (err) {
      error.value = err?.message || err?.data?.message || 'Failed to load members.';
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    loadMembers(1);
  };

  const changePage = (page) => {
    if (page < 1 || page > pagination.value.total_pages) return;
    loadMembers(page);
  };

  const goToCreate = () => router.push('/admin/members/create');
  const editMember = (id) => router.push(`/admin/members/${id}/edit`);

  const deleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.deleteAdminUser(id);
      if (res.data.success) loadMembers(pagination.value.page);
      else alert(res.data.message || 'Failed to delete user.');
    } catch (err) {
      alert(err?.message || err?.data?.message || 'Failed to delete user.');
    }
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  onMounted(() => loadMembers());
  </script>

  <style scoped>
  .members-shell {
    min-height: 100vh;
    background: #1e3a8a; /* Dark blue background only */
    color: #f3f4f6;
    padding-bottom: 2rem;
  }

  .card {
    background: #15213a; /* Solid dark panel */
    border-radius: 20px;
    max-width: 1100px;
    margin: 2rem auto;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .actions-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-form {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .search-form input {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #3b82f6;
    background: #1e3a8a;
    color: #f3f4f6;
    min-width: 220px;
  }

  .btn {
    border: none;
    border-radius: 0.5rem;
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .btn-primary {
    background: #1e3a8a; /* Dark blue */
    color: #f3f4f6;
  }

  .btn-primary:hover {
    background: #152a6f; /* Darker blue hover */
    transform: scale(1.03);
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 150px;
  }

  .table-wrapper {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid #1e3a8a;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: #091c5b; /* Darker blue */
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    color: #f3f4f6;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #1e3a8a;
    color: #f3f4f6;
  }

  tbody tr:hover {
    background: #152a6f;
  }

  .text-center {
    text-align: center;
  }

  .empty {
    text-align: center;
    padding: 1.5rem 0;
    color: #f3f4f6;
    font-weight: 600;
  }

  .tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .tag-admin {
    background: #1e3a8a; /* Dark blue admin */
    color: #f3f4f6;
  }

  .tag-user {
    background: #152a6f; /* Darker blue user */
    color: #f3f4f6;
  }

  .row-actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn-pill {
    border-radius: 999px;
    background: #0b215f;
    color: #f3f4f6;
    padding: 0.35rem 0.9rem;
    font-size: 0.85rem;
  }

  .btn-pill.danger {
    background: #152a6f;
    color: #f3f4f6;
  }

  .btn-pill:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .page-btn {
    border: 1px solid #1e3a8a;
    border-radius: 0.5rem;
    background: transparent;
    color: #f3f4f6;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
  }

  .page-btn.active {
    background: #1e3a8a;
    color: #f3f4f6;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .actions-row {
      flex-direction: column;
    }

    .search-form,
    .add-btn,
    .btn {
      width: 100%;
    }
  }
  </style>
