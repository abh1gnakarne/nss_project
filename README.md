# NSS NGO Donation Management System

This is a full-stack MERN application developed for the NSS NGO to manage donations and user roles securely.

## Key Features

- **Role-Based Authentication & Authorization**
  - Distinct Admin and User roles
  - Protected routes to ensure secure access to sensitive pages
- **Donation Management (CRUD)**
  - Users can initiate new donations
  - Real-time tracking of donation status (Pending/Success)
- **Interactive Admin Dashboard**
  - Overview of total funds collected
  - Management of registered users and donor lists
- **Payment Verification Simulation**
  - Sandbox verification button to simulate successful bank transactions
- **Secure Session Handling**
  - Password encryption using Bcrypt.js
  - Authentication tokens for persistent and secure user sessions

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) and Cookie-based tracking
- **Security**: Bcrypt.js for hashing sensitive data

## Workflow

1. **User Access**: User enters the application and registers or logs in.
2. **Authentication**: Server validates credentials against the MongoDB database.
3. **Role Identification**: 
   - **Admin**: Gains full access to the management dashboard and fund analytics.
   - **User**: Directed to the donation portal to contribute.
4. **Donation Process**: User submits a donation which is stored as 'Pending'.
5. **Verification**: User clicks the simulation button to verify the payment, updating the status to 'Success'.
6. **Data Sync**: The UI re-fetches data to reflect updated totals in the Admin dashboard.

## Role Summary

- **Admin**
  - View dashboard analytics
  - Monitor all user registrations
  - Track total funds collected
- **User**
  - Access personal donation history
  - Initiate new donations
  - View donation status

## Deployment

- **Platform**: Vercel
- **Database Hosting**: MongoDB Atlas Cloud
- **CI/CD**: Automatic builds via GitHub integration on every push to the main branch.

## Environment Configuration

The following variables are configured in the production environment:
- **MONGODB_URI**: Connection string for the cloud database cluster.
- **JWT_SECRET**: Private key for secure token generation.