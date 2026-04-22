# CGPA Simulator
CGPA Simulator: a free tool to find out what you need to score next semester to hit your target CGPA.

## Live Demo
[Live demo](https://cgpa-simulator.vercel.app)

## What it does
The CGPA Simulator calculates the minimum semester GPA and per-course score a student needs to reach their target CGPA. It supports both the Nigerian 5.0 grading scale and the International 4.0 grading scale via a simple toggle. There is no login, no account required, and no data is stored anywhere, your results live entirely in the browser memory and reset completely on refresh.

## How to use it
1. Enter your current CGPA.
2. Enter the total units you have completed so far.
3. Add your planned next semester courses along with their credit units.
4. Enter your target CGPA.
5. Click **Calculate Requirements** to see your per-course breakdown.

## Grading scales supported

| Grade | Nigerian 5.0 Scale | International 4.0 Scale |
|-------|--------------------|-------------------------|
| **A** | 70–100 (5.0)       | 90–100 (4.0)            |
| **B** | 60–69 (4.0)        | 80–89 (3.0)             |
| **C** | 50–59 (3.0)        | 70–79 (2.0)             |
| **D** | 45–49 (2.0)        | 60–69 (1.0)             |
| **E** | 40–44 (1.0)        | N/A                     |
| **F** | 0–39 (0.0)         | 0–59 (0.0)              |

## Running locally

```bash
git clone [repo url]
cd cgpa-simulator
npm install
npm run dev
```

## Tech stack
- React
- Vite
- Tailwind CSS v3
- lucide-react

*Note: There is no backend and no external API calls are made.*

## Known advisories
There is one moderate severity advisory in `esbuild` (a dev dependency only). This affects the local development server only and has zero impact on the production build. A fix has been deferred pending a non-breaking Vite upgrade.

## License
MIT
