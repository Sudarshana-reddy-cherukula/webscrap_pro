# WebScrap Pro Backend

A production-grade backend system for an AI-powered Web Scraping + PDF Processing SaaS platform.

## 🚀 Features

- **Web Scraping**: Static, dynamic, and multi-URL scraping with real-time progress
- **PDF Processing**: Text extraction, image extraction, metadata, and format conversion
- **Export System**: CSV, JSON, Excel, and TXT export capabilities
- **User Management**: JWT authentication, user profiles, and usage tracking
- **Real-time Updates**: Socket.io integration for live progress tracking
- **Queue System**: BullMQ for background job processing
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Winston-based structured logging
- **Scalability**: Modular architecture with microservices

## 📋 Tech Stack

### Backend Core
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Redis** - Caching and queue
- **BullMQ** - Job queue
- **Socket.io** - Real-time communication

### Scraping & Processing
- **Puppeteer** - Headless browser automation
- **Playwright** - Browser automation
- **Cheerio** - HTML parsing
- **Axios** - HTTP client

### PDF Processing (Python Microservices)
- **Flask** - Web framework
- **PyPDF2** - PDF manipulation
- **pdf2image** - PDF to image conversion
- **python-docx** - Word document generation
- **Pillow** - Image processing

### Security & Utilities
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Winston** - Logging
- **Multer** - File uploads

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Database models
│   ├── utils/           # Utility functions
│   ├── jobs/            # Queue job processors
│   ├── sockets/         # Socket.io handlers
│   ├── validators/      # Input validation schemas
│   ├── uploads/         # File upload directory
│   ├── exports/         # Export file directory
│   ├── logs/            # Log files
│   ├── app.js           # Express app configuration
│   └── server.js        # Server startup
├── python-services/     # Python microservices
│   ├── scraping-service/
│   └── pdf-service/
├── .env                # Environment variables
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## 🛠️ Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **Chrome/Chromium** (for Puppeteer)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/webscrap-pro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Python Services Configuration
PYTHON_SCRAPING_SERVICE_URL=http://localhost:8001
PYTHON_PDF_SERVICE_URL=http://localhost:8002

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./src/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Install Python Dependencies

#### Scraping Service

```bash
cd python-services/scraping-service
pip install -r requirements.txt
```

#### PDF Service

```bash
cd ../pdf-service
pip install -r requirements.txt
```

### 5. Install Chrome for Puppeteer

```bash
# Ubuntu/Debian
sudo apt-get install -y google-chrome-stable

# macOS
brew install --cask google-chrome

# Windows
# Download and install Chrome from https://www.google.com/chrome/
```

### 6. Install Playwright Browsers

```bash
# In the scraping-service directory
playwright install chromium
```

## 🚀 Running the Application

### Option 1: Development Mode

#### 1. Start MongoDB and Redis

```bash
# Start MongoDB
mongod

# Start Redis
redis-server
```

#### 2. Start Python Services

```bash
# Terminal 1 - Scraping Service
cd python-services/scraping-service
python app.py

# Terminal 2 - PDF Service
cd python-services/pdf-service
python app.py
```

#### 3. Start Node.js Backend

```bash
# In the main backend directory
npm run dev
```

The backend will be available at `http://localhost:5000`

### Option 2: Production Mode

#### 1. Build and Start Services

```bash
# Start Python services with Gunicorn
cd python-services/scraping-service
gunicorn --bind 0.0.0.0:8001 app:app

cd ../../python-services/pdf-service
gunicorn --bind 0.0.0.0:8002 app:app

# Start Node.js backend
cd ../../
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh-token` - Refresh JWT token

### Scraping Endpoints

- `POST /api/scrape/start` - Start scraping job
- `GET /api/scrape/status/:id` - Get scraping job status
- `GET /api/scrape/results/:id` - Get scraping results
- `DELETE /api/scrape/delete/:id` - Delete scraping job
- `GET /api/scrape/jobs` - Get user scraping jobs
- `GET /api/scrape/download/:id` - Download scraping results

### PDF Endpoints

- `POST /api/pdf/upload` - Upload PDF
- `POST /api/pdf/extract-text` - Extract text from PDF
- `POST /api/pdf/extract-images` - Extract images from PDF
- `POST /api/pdf/metadata` - Get PDF metadata
- `POST /api/pdf/convert` - Convert PDF format
- `GET /api/pdf/status/:id` - Get PDF job status
- `GET /api/pdf/results/:id` - Get PDF processing results
- `DELETE /api/pdf/delete/:id` - Delete PDF job
- `GET /api/pdf/jobs` - Get user PDF jobs
- `GET /api/pdf/download/:id` - Download processed PDF

### Export Endpoints

- `POST /api/export/create` - Create export job
- `GET /api/export/status/:id` - Get export status
- `GET /api/export/download/:id` - Download export file
- `DELETE /api/export/delete/:id` - Delete export
- `GET /api/export/list` - Get user exports

### User Endpoints

- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/user/history` - Get user history
- `GET /api/user/downloads` - Get download history
- `GET /api/user/statistics` - Get user statistics

### Utility Endpoints

- `GET /api/health` - Health check
- `GET /api` - API information

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/webscrap-pro |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `FRONTEND_URL` | Frontend URL | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max file size in bytes | 10485760 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Queue Configuration

The application uses BullMQ for background job processing. Configure Redis connection in `src/config/queue.js`.

### Logging Configuration

Logs are stored in `src/logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🚀 Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/webscrap-pro
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.0
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### Cloud Deployment

#### Render

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push

#### Railway

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy

#### VPS Deployment

```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm mongodb redis-server

# Clone and setup
git clone <repository-url>
cd backend
npm install

# Setup PM2 for process management
npm install -g pm2
pm2 start src/server.js --name webscrap-pro-backend

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure Nginx to proxy to localhost:5000
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **Database Security**: Use MongoDB authentication and SSL
4. **Rate Limiting**: Configure appropriate limits for your use case
5. **File Uploads**: Validate file types and sizes
6. **CORS**: Configure proper CORS settings
7. **HTTPS**: Use SSL/TLS in production

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and accessible

#### 2. Redis Connection Error
```bash
Error: Redis connection failed
```
**Solution**: Check Redis server status and configuration

#### 3. Puppeteer Chrome Error
```bash
Error: Failed to launch chrome
```
**Solution**: Install Chrome/Chromium or use Puppeteer's bundled Chromium

#### 4. Python Service Unavailable
```bash
Error: connect ECONNREFUSED 127.0.0.1:8001
```
**Solution**: Start Python microservices

#### 5. File Upload Errors
```bash
Error: File too large
```
**Solution**: Check `MAX_FILE_SIZE` configuration

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Health Checks

- Backend: `GET /api/health`
- Scraping Service: `GET http://localhost:8001/health`
- PDF Service: `GET http://localhost:8002/health`

## 📈 Monitoring

### Application Metrics

Monitor:
- Response times
- Error rates
- Queue processing times
- Database performance
- Memory usage

### Logging

Logs are structured JSON format for easy parsing:
```json
{
  "level": "info",
  "message": "User login successful",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "507f1f77bcf86cd799439011"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for modern web scraping and PDF processing needs**
