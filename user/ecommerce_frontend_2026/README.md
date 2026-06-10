Frontend setup

1. Install dependencies:
   npm install

2. Configure environment:
   Copy ".env.example" to ".env.local" and update NEXT_PUBLIC_API_BASE_URL if the backend is not running on the default local API URL.

3. Start development server:
   npm run dev

4. Build production bundle:
   npm run build

Environment variables:
- NEXT_PUBLIC_API_BASE_URL: Express backend URL.
