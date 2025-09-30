# Fake News Detector Frontend

A modern React TypeScript application for detecting fake news using OpenAI GPT-4o Mini.

## 🚀 Features

- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Analysis**: Instant fake news detection
- **Budget Management**: Built-in API usage tracking
- **Sample Texts**: Pre-loaded examples for testing

## 📦 Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **TanStack Query** (React Query) for data management
- **Axios** for API calls
- **Lucide React** for icons
- **React Router** for navigation

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
│   └── useAnalysis.ts  # Analysis logic hook
├── services/           # API services
│   └── apiClient.ts    # Axios configuration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── mockData.ts         # Sample data for testing
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles with Tailwind
```

## 🎨 UI Components

### Main Features

- **Text Input**: Multi-line textarea with send button
- **Sample Buttons**: Quick test with pre-loaded examples
- **Analysis Results**: Detailed breakdown with confidence scores
- **Budget Status**: Real-time API usage tracking
- **Error Handling**: User-friendly error messages

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable button and input styles
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Fade-in and loading animations

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Tailwind Configuration

The `tailwind.config.js` includes:

- Custom color palette
- Inter font family
- Custom animations
- Responsive breakpoints

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Next Steps

1. **Backend Integration**: Connect to OpenAI API
2. **URL Support**: Add URL content extraction
3. **History**: Implement analysis history
4. **Authentication**: Add user accounts (optional)
5. **Deployment**: Deploy to Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
