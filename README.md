# URL Shortener API

A simple RESTful API that allows users to shorten long URLs with full CRUD operations and access statistics.

## Features

- **Create**: Generate short URLs from long URLs
- **Retrieve**: Get original URLs from short codes
- **Update**: Modify existing URL mappings
- **Delete**: Remove URL mappings
- **Statistics**: Track access counts for shortened URLs

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Environment**: dotenv for configuration

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aynabdul/abdul-innovaxel-rehman.git
   cd URL-shortner
   ```

2. Switch to the development branch:
   ```bash
   git checkout dev
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=url_shortener
   BASE_URL=http://localhost:3000
   ```

5. Set up the MySQL database:
   - Create a database named `url_shortener`
   - Run the SQL scripts in the `src/database/` directory

6. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`
The Frontend will be available at `http://localhost:3000` (same URL)

## Frontend Interface

The application includes a comprehensive web interface built with HTML, Tailwind CSS, and JavaScript that allows you to:

- **Create Short URLs**: Enter a long URL and get a shortened version
- **Retrieve URL Details**: View information about a short URL using its code
- **Update URLs**: Modify the destination of an existing short URL
- **View Statistics**: See access counts and other metrics for short URLs
- **Delete URLs**: Remove short URLs from the system
- **Test Redirects**: Test the redirect functionality in a new tab

### Frontend Features

- ✨ Clean, responsive design with Tailwind CSS
- 🔄 Real-time loading states and animations
- ✅ Comprehensive error handling and user feedback
- 📱 Mobile-friendly responsive layout
- ⌨️ Keyboard shortcuts (Enter key support)
- 🎨 Color-coded sections for different operations

## API Endpoints

### Create Short URL
- **POST** `/api/urls/shorten`
- **Body**: `{ "originalUrl": "https://example.com" }`

### Get Original URL Data
- **GET** `/api/urls/shorten/:shortCode`

### Update URL
- **PUT** `/api/urls/shorten/:shortCode`
- **Body**: `{ "originalUrl": "https://new-example.com" }`

### Delete URL
- **DELETE** `/api/urls/shorten/:shortCode`

### Get Statistics
- **GET** `/api/urls/stats/:shortCode`

### Redirect to Original URL
- **GET** `/:shortCode` (redirects to original URL and increments access count)

## Testing Scripts

The project includes several testing scripts:

```bash
# Test database connection
npm run test-db

# Test all API endpoints
npm run test-api

# Test CRUD operations
npm run test-crud

# Test statistics endpoint
npm run test-stats

# Open frontend in browser
npm run open-frontend
```

## Development

- **Main Branch**: Contains only documentation and setup instructions
- **Dev Branch**: Contains all source code and development work

## Contributing

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Submit a pull request to the `dev` branch

## License

This project is licensed under the MIT License.
