# Vue Frontend Setup for LavaLust Backend

This Vue.js frontend connects to the LavaLust PHP backend and converts all the PHP views into Vue components.

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- Vue 3
- Vue Router
- Axios (for API calls)
- Vite (build tool)

### 2. Start Development Server

```bash
npm run dev
```

The Vue app will run on `http://localhost:5173`

### 3. Ensure LavaLust Backend is Running

Make sure your LavaLust backend is running on `http://localhost:3002` (as configured in `LavaLust/app/config/config.php`)

### 4. Configure CORS (if needed)

If you encounter CORS issues, you may need to add CORS headers to your LavaLust backend. Add this to your `LavaLust/index.php` or create a middleware:

```php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js          # API service for all backend calls
│   ├── components/
│   │   ├── Header.vue      # Navigation header with notifications
│   │   └── PostCard.vue    # Individual post component
│   ├── views/
│   │   ├── Login.vue       # Login page
│   │   ├── Register.vue    # Registration page
│   │   ├── UserPage.vue    # Main feed (converted from user_page.php)
│   │   ├── CreatePost.vue  # Create post (converted from post.php)
│   │   ├── EditPost.vue    # Edit post
│   │   ├── Categories.vue  # Categories page
│   │   ├── Notifications.vue # Notifications page
│   │   └── Profile.vue     # User profile
│   ├── router/
│   │   └── index.js        # Vue Router configuration
│   ├── App.vue             # Root component
│   └── main.js             # Application entry point
```

## API Endpoints Used

The frontend communicates with these LavaLust endpoints:

- `GET /api/get_posts` - Get all posts
- `GET /api/get_user` - Get current user info
- `GET /api/get_posts_by_category?category=X` - Get posts by category
- `POST /api/toggle_like` - Like/unlike a post
- `POST /api/add_comment` - Add a comment
- `POST /api/delete_comment` - Delete a comment
- `POST /api/add_reply` - Add a reply
- `POST /api/delete_reply` - Delete a reply
- `GET /api/get_notifications` - Get notifications
- `POST /api/mark_notification_read` - Mark notification as read
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /post_section/create` - Create post
- `POST /post_section/edit_post/:id` - Update post
- `GET /post_section/delete_post/:id` - Delete post

## Features

✅ All PHP views converted to Vue components
✅ API integration with LavaLust backend
✅ Vue Router for navigation
✅ Real-time likes, comments, and replies
✅ Notifications system
✅ Post creation and editing
✅ Category filtering
✅ User profile

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files that can be served by any web server.

## Notes

- The frontend uses `withCredentials: true` to maintain PHP sessions
- All API calls go through the proxy configured in `vite.config.js`
- The backend must be running for the frontend to work
- Make sure both servers are on the same domain or configure CORS properly

