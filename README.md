# AI Cycling Academy - Frontend Dashboard

React + Vite frontend for AI Cycling Academy - AI-powered cycling coaching platform.

## Features

- Mobile-first responsive design
- Real-time ride statistics dashboard
- Drag-and-drop ride file upload
- AI coaching chat interface
- Performance analytics with charts
- Training goals management
- Bottom tab navigation for mobile

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository to Vercel
3. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.railway.app`
5. Deploy automatically

### Environment Variables

- `VITE_API_URL` - Backend API URL (e.g., `https://ai-cycling-backend.railway.app`)

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Fetch API for backend communication

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Production Notes

- Optimized build with code splitting
- Asset caching for performance
- SPA routing with fallback to index.html
- Mobile-first responsive design
- Touch-friendly UI elements

