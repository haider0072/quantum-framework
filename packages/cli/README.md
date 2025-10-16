# @quantum/cli

CLI tool for Quantum Framework - scaffolding, development, and build tools.

## Installation

```bash
# Using npm
npm create quantum-app my-app

# Using pnpm
pnpm create quantum-app my-app

# Using yarn
yarn create quantum-app my-app
```

## Usage

### Create a New Project

```bash
# Interactive mode
create-quantum-app

# With project name
create-quantum-app my-app

# With specific template
create-quantum-app my-app --template typescript
```

### Available Templates

- **basic**: Minimal setup with JSX
- **typescript**: TypeScript configuration
- **full**: Full-featured with components and styling

### Development Commands

```bash
# Start development server
quantum dev

# Build for production
quantum build

# Preview production build
quantum preview
```

## CLI Commands

### `create [project-name]`

Create a new Quantum project.

Options:
- `-t, --template <template>`: Project template (basic|typescript|full)

### `dev`

Start the development server.

Options:
- `-p, --port <port>`: Port number (default: 3000)
- `-h, --host <host>`: Host address (default: localhost)

### `build`

Build the project for production.

Options:
- `-o, --outDir <dir>`: Output directory (default: dist)
- `--minify`: Minify output (default: true)

### `preview`

Preview the production build.

Options:
- `-p, --port <port>`: Port number (default: 4173)
- `-h, --host <host>`: Host address (default: localhost)

## Project Structure

A newly created project will have the following structure:

```
my-app/
├── src/
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Application entry point
├── index.html       # HTML template
├── package.json     # Project dependencies
└── vite.config.js   # Vite configuration
```

## License

MIT
