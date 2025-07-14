# Express Logging Demo with Linode Object Storage

A Node.js Express application demonstrating file-based logging with configurable rotation and automatic upload to Linode Object Storage. The application includes a RESTful API for managing users with comprehensive logging of all operations.

## Features

- **Node.js v20.18.0** with Express framework
- **File-based logging** with configurable rotation intervals using Winston
- **Automatic upload** of rotated log files to Linode Object Storage
- **In-memory user management** with CRUD operations
- **Comprehensive request/response logging**
- **Error handling and validation**
- **Security middleware** (Helmet, CORS)
- **Configurable log rotation** via environment variables

## Prerequisites

- Node.js v20.18.0
- pnpm package manager
- Linode Object Storage account with bucket access

## Installation

1. Clone the repository:

2. Install dependencies using pnpm:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create the template file manually (see below for content)
# Then copy and edit with your credentials
cp .env.template .env
```

**Note:** If `.env.template` doesn't exist, create it with this content:
```bash
# Linode Object Storage Configuration
BUCKET=your-bucket-name
ENDPOINT=us-sea-1.linodeobjects.com
ACCESS_KEY=your-access-key
SECRET_ACCESS_KEY=your-secret-access-key

# Logging Configuration (optional)
LOG_ROTATION_DURATION=5  # minutes, default: 60
LOG_LEVEL=info           # default: info
NODE_ENV=development     # default: development
PORT=3000               # default: 3000
```

## Environment Configuration

Create a `.env` file with your Linode Object Storage credentials:

```bash
# Linode Object Storage Configuration
BUCKET=your-bucket-name
ENDPOINT=us-sea-1.linodeobjects.com
ACCESS_KEY=your-access-key
SECRET_ACCESS_KEY=your-secret-access-key

# Logging Configuration (optional)
LOG_ROTATION_DURATION=5  # minutes, default: 60
LOG_LEVEL=info           # default: info
NODE_ENV=development     # default: development
PORT=3000               # default: 3000
```

### Environment Variables Explained

- **BUCKET**: Your Linode Object Storage bucket name
- **ENDPOINT**: Linode Object Storage endpoint (region-specific)
- **ACCESS_KEY**: Your Linode Object Storage access key
- **SECRET_ACCESS_KEY**: Your Linode Object Storage secret key
- **LOG_ROTATION_DURATION**: How often to rotate log files (in minutes)
- **LOG_LEVEL**: Logging level (error, warn, info, debug)
- **NODE_ENV**: Environment (development/production)
- **PORT**: Server port

## Testing Object Storage Connection

Before running the application, test your Linode Object Storage connection:

```bash
node scripts/test-object-storage.js
```

This script will:
- Display your environment variables (with sensitive data masked)
- Test the connection to your Linode bucket
- Verify bucket access permissions

Expected output:
```
Environment variables:
ENDPOINT: us-sea-1.linodeobjects.com
BUCKET: your-bucket-name
ACCESS_KEY: ***XXXX
SECRET_ACCESS_KEY: ***XXXX

Testing connection...
✅ Successfully connected to Linode Object Storage!
```

## Running the Application

### Development Mode
```bash
pnpm run dev
```

### Production Mode
```bash
pnpm start
```

The server will start on port 3000 (or the port specified in the `PORT` environment variable).

## API Endpoints

### Health Check
- **GET** `/health` - Check application status

### Users API

#### Get All Users
- **GET** `/api/users`
- Returns all users with count

#### Get User by ID
- **GET** `/api/users/:id`
- Returns a specific user by ID

#### Create User
- **POST** `/api/users`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "role": "developer"
}
```

#### Update User
- **PUT** `/api/users/:id`
- **Body:** Same as create user (all fields optional)

#### Delete User
- **DELETE** `/api/users/:id`
- Deletes a user by ID

#### Reset Users
- **POST** `/api/users/reset`
- Resets the user list to initial seeded data

## Logging System

The application uses Winston for logging with the following features:

### Log Files
- **Application logs:** `logs/application-YYYY-MM-DD-HH:MM.log`
- **No compression** - Files are stored as plain text for easy reading

### Log Rotation
- **Configurable rotation** - Set via `LOG_ROTATION_DURATION` (default: 60 minutes)
- **Automatic upload** to Linode Object Storage when rotation occurs
- **14-day retention** - Old logs are automatically deleted locally
- **20MB max file size** per log file

### Log Levels
- **INFO** - General application events, API requests
- **WARN** - Validation errors, missing resources
- **ERROR** - Application errors, exceptions

### Log Format
Each log entry includes:
- Timestamp
- Log level
- Message
- Structured metadata (JSON format)

### Example Log Entries
```
2024-01-15 14:30:25 [INFO]: GET /api/users | {"method":"GET","path":"/api/users","ip":"::1","userAgent":"Mozilla/5.0...","timestamp":"2024-01-15T14:30:25.123Z"}
2024-01-15 14:30:25 [INFO]: Retrieved all users | {"count":20,"query":{}}
```

## Activity Generator

The application includes a script to generate continuous API activity for testing log rotation and upload:

```bash
node scripts/activity-generator.js
```

This script will:
- Send GET requests to retrieve all users
- Send GET requests for random individual users
- Create new users with random data
- Delete random users
- Repeat every 15 seconds

**Features:**
- Uses Faker.js to generate realistic user data
- Handles errors gracefully (ignores 404s, duplicate emails)
- Provides console output showing each request
- Runs indefinitely until stopped

**To run in background:**
```bash
nohup node scripts/activity-generator.js > activity.log 2>&1 &
```

## Object Storage Integration

### Automatic Upload
When log files are rotated:
1. The old log file is closed
2. A new log file is created
3. The old file is automatically uploaded to Linode Object Storage
4. Files are stored under the `logs/` prefix in your bucket

### File Structure in Object Storage
```
bucket-name/
├── logs/
│   ├── application-2025-07-13-12:00.log
│   ├── application-2025-07-13-12:05.log
│   ├── application-2025-07-13-12:10.log
│   └── ...
```

### Monitoring Uploads
Upload status is logged in the application logs:
```
info: Rotated log file uploaded to object storage {"file":"/path/to/application-2025-07-13-12:15.log","timestamp":"2025-07-13T12:15:00.000Z"}
```

## Testing the API

### Using curl

1. **Get all users:**
```bash
curl http://localhost:3000/api/users
```

2. **Get user by ID:**
```bash
curl http://localhost:3000/api/users/1
```

3. **Create a new user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@example.com","age":25,"role":"developer"}'
```

4. **Update a user:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":29}'
```

5. **Delete a user:**
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

6. **Reset to initial data:**
```bash
curl -X POST http://localhost:3000/api/users/reset
```

## Monitoring Logs

### View Current Logs
```bash
# View current application log
tail -f logs/application-$(date +%Y-%m-%d-%H:%M).log

# View all logs in the directory
ls -la logs/
```

### Check Object Storage
Monitor uploaded files in your Linode Object Storage dashboard or use the Linode CLI:
```bash
linode-cli obj ls bucket-name/logs/
```

## Project Structure

```
├── src/
│   ├── app.js              # Main application file
│   ├── routes/
│   │   └── users.js        # User API routes
│   ├── data/
│   │   └── users.js        # In-memory user data and service
│   └── utils/
│       ├── logger.js       # Winston logger configuration
│       └── objectStorage.js # Linode Object Storage integration
├── scripts/
│   ├── activity-generator.js # API activity generator
│   └── test-object-storage.js # Object storage connection tester
├── logs/                   # Generated log files
├── .env.template          # Environment variables template
├── .env                   # Local environment variables (not tracked)
├── package.json
└── README.md
```