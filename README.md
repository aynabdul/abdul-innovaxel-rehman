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
   - Run the SQL scripts in the `database/` directory

6. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Create Short URL
- **POST** `/api/urls`
- **Body**: `{ "originalUrl": "https://example.com" }`

### Get Original URL
- **GET** `/api/urls/:shortCode`

### Update URL
- **PUT** `/api/urls/:shortCode`
- **Body**: `{ "originalUrl": "https://new-example.com" }`

### Delete URL
- **DELETE** `/api/urls/:shortCode`

### Get Statistics
- **GET** `/api/urls/:shortCode/stats`

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
