# Vue Frontend for LavaLust Backend

This Vue.js frontend is the **only UI** for the application. All PHP views in LavaLust have been removed - the backend now only returns JSON API responses.

## Important Notes

### LavaLust Backend (PHP)
- **DO NOT run `npm run dev` in the LavaLust folder** - it's PHP, not Node.js!
- LavaLust runs via PHP server: `php -S localhost:3002` (or use XAMPP/Apache)
- All controllers now return JSON only - no views are rendered
- All UI has been moved to Vue components

### Vue Frontend
- Run `npm run dev` **only in the `frontend/` folder**
- The frontend runs on `http://localhost:5173`
- It communicates with LavaLust backend at `http://localhost:3002`

## Setup

1. **Start LavaLust Backend (PHP)**:
   ```bash
   cd LavaLust
   php -S localhost:3002
   ```
   Or use XAMPP/Apache to serve it on port 3002

2. **Start Vue Frontend**:
   ```bash
   cd frontend
   npm install  # First time only
   npm run dev
   ```

3. **Access the app**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3002

## Architecture

- **Backend (LavaLust)**: Pure API - returns JSON only
- **Frontend (Vue)**: All UI components and user interface
- **Communication**: Axios with credentials for session management

## API Endpoints

All endpoints return JSON:

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /api/get_posts` - Get all posts
- `GET /api/get_user` - Get current user
- `GET /api/get_posts_by_category?category=X` - Filter posts
- `POST /api/toggle_like` - Like/unlike
- `POST /api/add_comment` - Add comment
- `POST /api/add_reply` - Add reply
- `GET /api/get_notifications` - Get notifications
- `POST /post_section/create` - Create post
- `POST /post_section/edit_post/:id` - Update post
- `GET /post_section/delete_post/:id` - Delete post

## Features

✅ All PHP views converted to Vue components
✅ Session-based authentication
✅ Real-time likes, comments, replies
✅ Notifications system
✅ Post creation/editing with media upload
✅ Category filtering
✅ User profile management
