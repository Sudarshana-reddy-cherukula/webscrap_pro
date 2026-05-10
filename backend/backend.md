\# MASTER BACKEND DEVELOPMENT PROMPT

You are a senior full-stack architect and backend engineer.

Build a production-grade backend system for an AI-powered Web Scraping \+ PDF Processing SaaS platform.

IMPORTANT RULES:  
\- Do NOT generate dummy logic.  
\- Do NOT generate fake APIs.  
\- Do NOT remove existing frontend pages.  
\- Backend must integrate with already-built frontend pages.  
\- Keep architecture scalable and modular.  
\- Use clean code principles.  
\- Use professional folder structure.  
\- Use REST APIs.  
\- Backend must be ready for production deployment.  
\- Add proper validations, error handling, logging, security, and reusable utilities.  
\- Maintain futuristic SaaS-level architecture.

\---

\# TECH STACK

\#\# Backend Core  
\- Node.js  
\- Express.js  
\- MongoDB  
\- Mongoose  
\- JWT Authentication  
\- Redis  
\- BullMQ  
\- Socket.io

\#\# Scraping  
\- Puppeteer  
\- Playwright  
\- Cheerio  
\- Axios

\#\# PDF Processing  
\- Python Flask microservice  
\- PyPDF2  
\- pdf2image  
\- python-docx  
\- pillow

\#\# Security  
\- Helmet  
\- CORS  
\- Rate Limiting  
\- bcryptjs  
\- Input Validation  
\- Environment Variables

\#\# Logging  
\- Winston  
\- Morgan

\---

\# PROJECT GOAL

Build backend APIs and services for a modern SaaS platform with features:

\#\# Web Scraping Features  
\- Scrape static websites  
\- Scrape dynamic JS-rendered websites  
\- Extract:  
  \- text  
  \- tables  
  \- images  
  \- links  
  \- metadata  
\- Multi-URL scraping  
\- Real-time scraping progress  
\- Job queue system  
\- Retry failed jobs  
\- Download scraped results

\#\# PDF Features  
\- PDF upload  
\- Text extraction  
\- Image extraction  
\- Metadata extraction  
\- PDF to Word conversion  
\- PDF parsing history  
\- Download processed files

\#\# User Features  
\- Register/Login  
\- JWT Authentication  
\- User profile  
\- Dashboard statistics  
\- Activity history  
\- Download history

\#\# Export Features  
\- CSV export  
\- JSON export  
\- Excel export  
\- TXT export

\---

\# IMPORTANT FRONTEND INTEGRATION RULES

The frontend pages already exist.

DO NOT:  
\- rebuild frontend  
\- change frontend structure  
\- remove styles  
\- remove animations  
\- remove 3D/glassmorphism UI

ONLY:  
\- connect backend APIs cleanly  
\- create API endpoints matching frontend requirements  
\- return proper JSON responses  
\- support loading/error states  
\- support real-time progress updates

\---

\# REQUIRED BACKEND ARCHITECTURE

Create scalable architecture:

backend/  
│  
├── src/  
│   ├── config/  
│   ├── controllers/  
│   ├── routes/  
│   ├── services/  
│   ├── middlewares/  
│   ├── models/  
│   ├── utils/  
│   ├── jobs/  
│   ├── sockets/  
│   ├── validators/  
│   ├── uploads/  
│   ├── exports/  
│   ├── logs/  
│   ├── app.js  
│   └── server.js  
│  
├── .env  
├── package.json  
└── README.md

\---

\# REQUIRED PYTHON MICROSERVICES

python-services/  
│  
├── scraping-service/  
│   ├── app.py  
│   ├── routes/  
│   ├── scrapers/  
│   ├── utils/  
│   └── requirements.txt  
│  
├── pdf-service/  
│   ├── app.py  
│   ├── services/  
│   ├── routes/  
│   └── requirements.txt

\---

\# REQUIRED API MODULES

\#\# AUTH APIs  
\- POST /api/auth/register  
\- POST /api/auth/login  
\- GET /api/auth/profile

\#\# SCRAPING APIs  
\- POST /api/scrape/start  
\- GET /api/scrape/status/:id  
\- GET /api/scrape/results/:id  
\- DELETE /api/scrape/delete/:id

\#\# PDF APIs  
\- POST /api/pdf/upload  
\- POST /api/pdf/extract-text  
\- POST /api/pdf/extract-images  
\- POST /api/pdf/metadata  
\- POST /api/pdf/convert

\#\# EXPORT APIs  
\- GET /api/export/csv/:id  
\- GET /api/export/json/:id  
\- GET /api/export/excel/:id  
\- GET /api/export/txt/:id

\#\# USER APIs  
\- GET /api/user/dashboard  
\- GET /api/user/history  
\- GET /api/user/downloads

\---

\# REQUIRED DATABASE MODELS

\#\# User Model  
Fields:  
\- name  
\- email  
\- password  
\- role  
\- createdAt

\#\# ScrapeJob Model  
Fields:  
\- userId  
\- targetUrl  
\- scrapingType  
\- status  
\- results  
\- createdAt

\#\# PDFJob Model  
Fields:  
\- userId  
\- filename  
\- operation  
\- status  
\- outputFile  
\- createdAt

\#\# Export Model  
Fields:  
\- userId  
\- exportType  
\- filePath  
\- createdAt

\---

\# REQUIRED MIDDLEWARES

Create:  
\- auth middleware  
\- error middleware  
\- logger middleware  
\- upload middleware  
\- validation middleware

Add:  
\- centralized error handling  
\- async handler wrapper  
\- secure JWT verification  
\- request sanitization

\---

\# REQUIRED FEATURES

\#\# Security  
Implement:  
\- JWT authentication  
\- Password hashing  
\- Rate limiting  
\- Helmet security  
\- Environment variable protection  
\- Secure file uploads

\#\# Performance  
Implement:  
\- Redis caching  
\- Queue jobs  
\- Async processing  
\- Compression  
\- Lazy loading  
\- Retry mechanism

\#\# File Handling  
Implement:  
\- Auto cleanup of old files  
\- File size validation  
\- File type validation  
\- Organized upload folders

\#\# Logging  
Implement:  
\- API request logging  
\- Error logging  
\- Scraping job logs  
\- PDF processing logs

\---

\# REQUIRED SOCKET FEATURES

Implement Socket.io for:  
\- scraping progress  
\- PDF processing progress  
\- live notifications  
\- job completion updates

\---

\# REQUIRED RESPONSE FORMAT

All APIs must return:

Success:  
{  
  success: true,  
  message: "",  
  data: {}  
}

Error:  
{  
  success: false,  
  message: "",  
  error: {}  
}

\---

\# REQUIRED CODE QUALITY

Generate:  
\- clean architecture  
\- reusable services  
\- reusable utilities  
\- scalable modules  
\- professional naming conventions  
\- production-ready code  
\- comments only where necessary

Avoid:  
\- giant files  
\- duplicated logic  
\- hardcoded values  
\- insecure code  
\- fake implementations

\---

\# REQUIRED INSTALL COMMANDS

Generate all required:  
\- npm install commands  
\- pip install commands  
\- environment setup  
\- Redis setup  
\- MongoDB setup  
\- nodemon setup  
\- startup scripts

\---

\# REQUIRED ENV VARIABLES

Create complete .env example including:  
\- PORT  
\- MONGO\_URI  
\- JWT\_SECRET  
\- REDIS\_URL  
\- PYTHON\_SERVICE\_URL  
\- SOCKET\_PORT

\---

\# REQUIRED README

Generate professional README with:  
\- installation steps  
\- folder structure  
\- environment setup  
\- API documentation  
\- deployment guide  
\- production setup  
\- troubleshooting

\---

\# DEPLOYMENT TARGETS

Backend should be deployable to:  
\- Render  
\- Railway  
\- Docker  
\- VPS

Database:  
\- MongoDB Atlas

Redis:  
\- Upstash

Frontend:  
\- Vercel

\---

\# FINAL OUTPUT REQUIREMENTS

Generate:  
1\. Full backend structure  
2\. All required folders/files  
3\. Base server setup  
4\. Authentication system  
5\. Scraping service architecture  
6\. PDF service architecture  
7\. Export system  
8\. Queue system  
9\. Socket system  
10\. Security implementation  
11\. Production-ready configuration

The final backend should feel like:  
\- modern SaaS architecture  
\- scalable enterprise system  
\- AI-ready platform  
\- production-grade infrastructure  
\- clean developer experience

DO NOT SIMPLIFY THE ARCHITECTURE.  
DO NOT GENERATE TOY PROJECT CODE.  
BUILD IT LIKE A REAL STARTUP PRODUCT.  
