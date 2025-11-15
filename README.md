## Local Setup Instructions

1. **Prerequisites**
   - Node.js (v18 or higher) & npm
   - Git

2. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in required API endpoints and keys

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

7. **Run tests**
   ```bash
   npm test
   ```

8. **Linting & formatting**
   ```bash
   npm run lint
   npm run format
   ```
