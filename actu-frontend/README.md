# Actu Frontend

A modern Next.js frontend application for the Actu news website, featuring a responsive design with Tailwind CSS and SOAP client integration.

## 🚀 Features

- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **SOAP Integration**: Client-side SOAP requests for user management
- **Responsive Design**: Mobile-first approach with modern UI components
- **Component Library**: Uses Radix UI primitives for accessible components

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React icons
- **SOAP Client**: easy-soap-request, fast-xml-parser
- **Development**: ESLint, Turbopack

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd actu-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Project Structure

```
actu-frontend/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable UI components
│   └── lib/          # Utility functions and configurations
├── public/           # Static assets
├── components.json   # Radix UI configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## 🔧 Configuration

The application uses several configuration files:
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration

## 🌐 API Integration

This frontend integrates with the backend SOAP services for:
- User authentication and management
- Token management
- News article operations

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

For other deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is part of the Actu news website application.
