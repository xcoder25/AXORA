# Build Project Workflow

Follow this step-by-step guide to compile and build the Axora Next.js project.

## Steps

### 1. Install Dependencies
Ensure you run npm install with options to utilize cache and prevent hangs:
```bash
npm install --prefer-offline --no-audit --no-fund
```

### 2. Typecheck Code
Run the TypeScript compiler to ensure there are no compilation errors:
```bash
npx tsc --noEmit
```

### 3. Build Application
Compile the Next.js production build:
```bash
npm run build
```
