# URL Shortener API

A full-stack URL shortening service with REST API and web interface. Create, manage, and track shortened URLs with complete CRUD operations and analytics.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/aynabdul/abdul-innovaxel-rehman.git
cd URL-shortner
npm install

# Configure database
# Create .env file (see configuration below)
# Create MySQL database: url_shortener

# Start server
npm start
# API: http://localhost:3000/api/urls
# Frontend: http://localhost:3000
```

## 📋 Features

- **REST API**: Full CRUD operations for URL management
- **Web Interface**: Complete frontend with forms and real-time feedback
- **Analytics**: Track access counts and usage statistics
- **Validation**: URL format validation and duplicate handling
- **Redirect**: Automatic redirect with access count tracking

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Database**: MySQL
- **Environment**: dotenv configuration

## ⚙️ Configuration

Create `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=url_shortener
BASE_URL=http://localhost:3000
```

**Database Setup:**
```sql
CREATE DATABASE url_shortener;
-- Table creation is handled automatically by the application
```

## 🔗 API Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/urls/shorten` | Create short URL | `{"url": "https://example.com"}` |
| `GET` | `/api/urls/shorten/:code` | Get URL details | - |
| `PUT` | `/api/urls/shorten/:code` | Update URL | `{"url": "https://new-url.com"}` |
| `DELETE` | `/api/urls/shorten/:code` | Delete URL | - |
| `GET` | `/api/urls/stats/:code` | Get statistics | - |
| `GET` | `/:code` | Redirect to original | - |

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    "accessCount": 5,
    "createdAt": "2025-01-13T10:30:00Z",
    "updatedAt": "2025-01-13T10:30:00Z"
  },
  "message": "Operation successful"
}
```

## 🖥️ Frontend Interface

Access the web interface at `http://localhost:3000`:

- **Create URLs**: Enter long URLs to generate short codes
- **Manage URLs**: Retrieve, update, and delete existing URLs
- **View Analytics**: Track access counts and usage statistics
- **Test Redirects**: Verify redirect functionality

## 📝 Testing with Postman

**Base URL:** `http://localhost:3000`

**1. Create Short URL:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/urls/shorten`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "url": "https://www.google.com"
}
```

**2. Get URL Details:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/urls/shorten/abc123`

**3. Update URL:**
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/urls/shorten/abc123`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "url": "https://www.github.com"
}
```

**4. Get Statistics:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/urls/stats/abc123`

**5. Delete URL:**
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/urls/shorten/abc123`

**6. Test Redirect:**
- **Method:** `GET`
- **URL:** `http://localhost:3000/abc123`

## 🗂️ Project Structure

```
URL-shortner/
├── index.js              # Main server entry point
├── package.json           # Dependencies and scripts
├── .env                  # Environment configuration
├── public/
│   └── index.html        # Frontend interface
└── src/
    ├── controllers/      # Business logic
    ├── routes/          # API route definitions
    ├── middleware/      # Validation middleware
    ├── config/          # Database configuration
    ├── utils/           # Utility functions
    └── database/        # Database scripts
```

## 🧪 Testing

```bash
# Test database connection
npm run test-db

# Manual testing via web interface
npm start
# Visit: http://localhost:3000
```

## 🤝 Development

- **Main Branch**: Documentation only
- **Dev Branch**: Source code and development

