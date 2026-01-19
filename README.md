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
- **Secure Payment Integration (Stripe Sandbox)**
  - Integrated Stripe Sandbox for simulating secure card payments
  - Embedded payment processing without redirection
- **Secure Session Handling**
  - Password encryption using Bcrypt.js
  - Authentication tokens for persistent and secure user sessions

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Stripe Elements
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) and Cookie-based tracking
- **Security**: Bcrypt.js for hashing sensitive data

## Demo Credentials

You can use the following credentials to test the application or create your own account.

### Admin Login
- **Email**: `hello12@gmail.com`
- **Password**: `200311`

### Test Card (Stripe Sandbox)
Use these details to simulate a successful payment:
- **Card Number**: `4242 4242 4242 4242`
- **CVV**: `123`
- **Expiry**: `11/28` (or any future date)
- **ZIP**: `34567` (or any valid ZIP)

## Workflow

1. **User Access**: User enters the application and registers or logs in.
2. **Authentication**: Server validates credentials against the MongoDB database.
3. **Role Identification**: 
   - **Admin**: Gains full access to the management dashboard and fund analytics.
   - **User**: Directed to the donation portal to contribute.
4. **Donation Process**: 
   - User enters donation amount.
   - Enters test card details in the secure Stripe element.
   - Clicks "Donate Now" to process the transaction.
5. **Verification**: Backend verifies the payment intent and updates the database status to 'Success' automatically.
6. **Data Sync**: The UI re-fetches data to reflect updated totals in the User history and Admin dashboard.

## Deployment

- **Platform**: Vercel ([Live Demo](https://nss-project-gray.vercel.app/))
- **Database Hosting**: MongoDB Atlas Cloud
- **CI/CD**: Automatic builds via GitHub integration on every push to the main branch.

## Environment Configuration

The following variables are configured in the production environment:
- **MONGODB_URI**: Connection string for the cloud database cluster.
- **JWT_SECRET**: Private key for secure token generation.
- **STRIPE_PUBLISHABLE_KEY**: Public key for Stripe.
- **STRIPE_SECRET_KEY**: Secret key for Stripe backend operations.