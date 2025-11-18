# SkillForge Frontend

This is the frontend application for SkillForge - an AI-driven adaptive learning platform. Built with Angular 20 and TypeScript, it provides an intuitive interface for students, instructors, and administrators.

## 🚀 Tech Stack

- **Angular 20** (Generated with Angular CLI version 20.3.6)
- **TypeScript**
- **Standalone Components**
- **Reactive Forms**
- **JWT Authentication**
- **Role-based Routing**
- **Responsive CSS Design**

## 🔐 Demo Credentials

The application includes pre-configured demo accounts for immediate testing:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | `admin@skillforge.com` | `Admin@123` | Full system administration |
| **Instructor** | `instructor@skillforge.com` | `Instr@123` | Course and quiz management |
| **Student** | `student@skillforge.com` | `Stud@123` | Learning and quiz taking |

### Quick Login Features
- **One-Click Demo Login**: Click any demo credential button on the login page
- **Auto-Fill & Submit**: Credentials are automatically filled and submitted
- **Visual Role Indicators**: Color-coded buttons for easy identification
- **Instant Access**: No need to remember or type credentials

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 10+
- Angular CLI 20+

### Setup & Installation
```bash
# Install dependencies
npm install

# Install zone.js if missing
npm install zone.js

# Start development server
ng serve
```

### Access the Application
- **Frontend URL**: http://localhost:4200
- **Backend API**: http://localhost:8080 (must be running)

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
