# AI Fake News Detector

An AI-powered web application that uses machine learning and natural language processing to detect fake news with high accuracy.

## 🚀 Features

- **Text Analysis**: Paste news articles or text for real-time analysis
- **URL Content Extraction**: Analyze content directly from URLs
- **AI-Powered Detection**: Uses advanced NLP models for accurate detection
- **Confidence Scoring**: Get detailed confidence scores and explanations
- **User Feedback**: Submit feedback to improve model accuracy
- **Analysis History**: Track your previous analyses
- **Modern UI**: Clean, responsive interface with dark/light mode

## 🛠️ Tech Stack

### Frontend

- React 18+ with TypeScript
- Apollo Client for GraphQL
- Material-UI (MUI) for components
- Framer Motion for animations
- React Router for navigation

### Backend

- Node.js with Express
- Apollo Server for GraphQL
- PostgreSQL with raw SQL (pg)
- Redis for caching
- JWT for authentication

### AI/ML

- Hugging Face Transformers (free tier)
- OpenAI API (free tier) as backup
- TensorFlow.js for client-side processing

### Infrastructure

- Frontend: Vercel
- Backend: Railway
- Database: Supabase
- AI Models: Hugging Face Hub

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/elhamposhtiban/fake-news-detector.git
   cd fake-news-detector
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit the .env files with your configuration
   ```

4. **Set up the database**

   ```bash
   cd server
   # Create your .env file with database credentials
   # Then run the setup script to create tables
   node db/setup.js
   ```

5. **Start the development servers**

   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:

   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000
   - GraphQL Playground on http://localhost:5000/graphql

## 📁 Project Structure

```
fake-news-detector/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── apollo/        # GraphQL client setup
│   └── package.json
├── server/                # Node.js backend
│   ├── db/                # Database configuration and setup
│   │   ├── index.js       # Database connection pool
│   │   ├── setup.js       # Database setup script
│   │   └── create_tables.sql # SQL schema
│   ├── src/               # Source code (for future phases)
│   │   ├── resolvers/     # GraphQL resolvers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── utils/         # Utility functions
│   ├── server.js          # Main server file
│   └── package.json
├── project-plan.test.js   # Comprehensive project plan
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the client
- `npm run server` - Start only the server
- `npm run build` - Build the client for production

### Database Management

```bash
# Set up database tables
cd server
node db/setup.js

# Test database connection
node db/testDB.js

# View database in your preferred PostgreSQL client
# (e.g., Postico, pgAdmin, etc.)
```

## 🤖 AI Models

The application uses multiple AI models for robust fake news detection:

1. **Primary Model**: Fine-tuned BERT for fake news detection
2. **Secondary Model**: RoBERTa for cross-validation
3. **Fallback Model**: OpenAI GPT-3.5 for complex cases

## 🔒 Security

- Rate limiting (100 requests/hour per IP)
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CORS configuration
- JWT-based authentication

## 📊 API Documentation

### GraphQL Endpoints

- `POST /graphql` - Main GraphQL endpoint
- `GET /graphql` - GraphQL Playground (development only)

### Key Queries

```graphql
# Analyze text for fake news
mutation AnalyzeText($input: AnalyzeInput!) {
  analyzeText(input: $input) {
    id
    prediction {
      isFake
      confidence
      explanation
      suspiciousPhrases
    }
    confidenceScore
    modelUsed
  }
}

# Get analysis history
query UserAnalyses($limit: Int, $offset: Int) {
  userAnalyses(limit: $limit, offset: $offset) {
    id
    textContent
    prediction {
      isFake
      confidence
    }
    createdAt
  }
}
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set up environment variables
3. Deploy automatically on push to main

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Set up environment variables
3. Deploy automatically on push to main

### Database (Supabase)

1. Create a new Supabase project
2. Get the connection string
3. Update your environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing free AI models
- [Material-UI](https://mui.com/) for the component library
- [Apollo GraphQL](https://www.apollographql.com/) for the GraphQL implementation
- [PostgreSQL](https://www.postgresql.org/) for the database

## 📞 Contact

Elham Poshtiban - [@elhamposhtiban](https://github.com/elhamposhtiban)

Project Link: [https://github.com/elhamposhtiban/fake-news-detector](https://github.com/elhamposhtiban/fake-news-detector)

---

**Ready to fight fake news with AI? Let's build something amazing! 🚀**
