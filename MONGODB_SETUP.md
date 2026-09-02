# MongoDB Setup Guide

## Why MongoDB instead of Firestore?

- **More Control**: Full control over your database
- **Flexible Schema**: Easy to modify data structure
- **Better for Complex Queries**: More powerful querying capabilities
- **Self-Hosted Option**: Can run on your own server
- **Industry Standard**: Widely used in production applications

## Setup Options

### Option 1: Local MongoDB (Development)

1. **Install MongoDB locally:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS (using Homebrew)
   brew install mongodb-community

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. **Start MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb

   # macOS
   brew services start mongodb-community

   # Docker (already running if using docker)
   ```

3. **Update `.env` file in `server/` directory:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. **Create MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free
   - Create a free cluster (M0 - Free tier)

2. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```

4. **Whitelist IP:**
   - In Atlas, go to Network Access
   - Add your IP address (or 0.0.0.0/0 for development)

## Server Setup

1. **Create `.env` file in `server/` directory:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Update `.env` with your MongoDB URI:**
   ```env
   PORT=4000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=your-mongodb-connection-string
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

All endpoints require `x-user-id` header with the Firebase user ID.

### Get All Expenses
```
GET /api/expenses
Headers: x-user-id: <firebase-user-id>
```

### Get Single Expense
```
GET /api/expenses/:id
Headers: x-user-id: <firebase-user-id>
```

### Create Expense
```
POST /api/expenses
Headers: x-user-id: <firebase-user-id>
Body: {
  title: string,
  amount: number,
  category: string,
  description?: string,
  date: string (ISO date)
}
```

### Update Expense
```
PUT /api/expenses/:id
Headers: x-user-id: <firebase-user-id>
Body: {
  title: string,
  amount: number,
  category: string,
  description?: string,
  date: string (ISO date)
}
```

### Delete Expense
```
DELETE /api/expenses/:id
Headers: x-user-id: <firebase-user-id>
```

## Frontend Configuration

1. **Update `.env` in `client/` directory:**
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

   This must match `PORT` in `server/.env`. If not set, it defaults to `http://localhost:4000/api`

## Testing

1. **Start MongoDB** (if using local)
2. **Start the server:**
   ```bash
   cd server
   npm start
   ```

3. **Start the client:**
   ```bash
   cd client
   npm run dev
   ```

4. **Check server logs** - you should see:
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on http://localhost:4000
   ```

## Troubleshooting

- **Connection Error**: Check MongoDB is running and URI is correct
- **Authentication Error**: Verify MongoDB credentials in connection string
- **CORS Error**: Check CLIENT_URL in server `.env` matches your frontend URL

