# Eskalate Backend

The Eskalate Backend is a RESTful API for a job platform, enabling companies to post job listings and applicants to browse and apply for jobs. Built with **NestJS** and **TypeORM**, it supports user authentication, role-based access control, job management, and application processing with file uploads to Cloudinary. The project follows the requirements outlined in the A2SV Eskalate technical assessment, implementing user stories for signup, login, job creation, updating, deletion, browsing, and application management.

## Features
- **User Authentication**: Signup and login with JWT-based authentication (`/auth/signup`, `/auth/login`).
- **Role-Based Access Control**: Restricts endpoints to `applicant` or `company` roles using `JwtAuthGuard` and `RolesGuard`.
- **Job Management**:
  - Companies can create, update, and delete jobs (`POST /jobs`, `PATCH /jobs/:id`, `DELETE /jobs/:id`).
  - Applicants can browse jobs with filters and pagination (`GET /jobs`).
  - Companies can view their posted jobs (`GET /jobs/my-jobs`).
  - Both roles can view job details (`GET /jobs/:id`).
- **Application Management**:
  - Applicants can apply to jobs with resume uploads (`POST /applications`).
  - Applicants can view their applications (`GET /applications/my-applications`).
  - Companies can view and update application statuses (`GET /applications/job/:jobId`, `PATCH /applications/:id/status`).
- **File Uploads**: Resumes are uploaded to Cloudinary for secure storage.
- **Response Format**: All responses follow the `{ success: boolean, message: string, object: any, errors: string[] | null }` structure, with pagination support for list endpoints.
- **Unit Tests**: Includes tests for services, controllers, and guards to ensure reliability.

## Technology Choices
The following technologies were chosen to meet the project’s requirements efficiently:

- **NestJS**: A progressive Node.js framework for building scalable and maintainable server-side applications. Chosen for its modular architecture, dependency injection, and built-in support for TypeScript, which aligns with the need for a structured and type-safe backend.
- **TypeORM**: An ORM for TypeScript and JavaScript, used for interacting with a PostgreSQL database. Selected for its ease of use, support for entity relationships, and compatibility with NestJS, enabling rapid development of database operations.
- **PostgreSQL**: A robust relational database chosen for its support for complex queries, reliability, and compatibility with TypeORM. It handles the storage of users, jobs, and applications efficiently.
- **JWT (JSON Web Tokens)**: Used for authentication, providing a secure and stateless way to verify user identity and roles across requests.
- **Cloudinary**: Integrated for resume file uploads, offering a scalable and secure cloud storage solution with easy integration via the `@nestjs/config` module.
- **TypeScript**: Ensures type safety, improving code maintainability and reducing runtime errors, which is critical for a production-ready API.

These choices provide a balance of developer productivity, scalability, and alignment with the assessment’s requirements for a robust backend.

## Setup and Installation

### Prerequisites
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 13.x or higher, with a database named `eskalate`
- **Cloudinary Account**: For resume uploads

### Steps to Set Up and Run Locally
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd eskalate-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root and add the following variables:
   ```env
   DATABASE_URL=postgres://<username>:<password>@localhost:5432/eskalate
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   - Replace `<username>` and `<password>` with your PostgreSQL credentials.
   - Replace `your_jwt_secret_key` with a secure secret for JWT signing.
   - Obtain `CLOUDINARY_*` credentials from your Cloudinary dashboard.

4. **Run the Application**:
   - Start the server in development mode:
     ```bash
     npm run start:dev
     ```
   - The API will be available at `http://localhost:3000`.

## API Endpoints
All responses follow the `{ success: boolean, message: string, object: any, errors: string[] | null }` format, with pagination for list endpoints.

### Authentication
- **POST /auth/signup**: Register a new user (`applicant` or `company`).
  - Body: `{ name: string, email: string, password: string, role: "applicant" | "company" }`
  - Validations: Name (alphabets/spaces), email (unique, valid), password (8+ chars, uppercase, lowercase, number, special char), role (enum).
- **POST /auth/login**: Authenticate a user and return a JWT token.
  - Body: `{ email: string, password: string }`

### Jobs (Protected by `JwtAuthGuard` and `RolesGuard`)
- **POST /jobs**: Create a job (company only).
  - Body: `{ title: string, description: string, location: string }`
  - Headers: `Authorization: Bearer <company_token>`
- **PATCH /jobs/:id**: Update a job (company only, must own the job).
  - Body: `{ title?: string, description?: string, location?: string }`
  - Headers: `Authorization: Bearer <company_token>`
- **DELETE /jobs/:id**: Delete a job (company only, must own the job).
  - Headers: `Authorization: Bearer <company_token>`
- **GET /jobs**: Browse jobs with filters and pagination (applicant only).
  - Query: `page`, `pageSize`, `title`, `location`, `companyName`
  - Headers: `Authorization: Bearer <applicant_token>`
- **GET /jobs/my-jobs**: View company’s posted jobs with pagination (company only).
  - Query: `page`, `pageSize`
  - Headers: `Authorization: Bearer <company_token>`
- **GET /jobs/:id**: View job details (authenticated users).
  - Headers: `Authorization: Bearer <token>`

### Applications (Protected by `JwtAuthGuard` and `RolesGuard`)
- **POST /applications**: Apply to a job with resume upload (applicant only).
  - Body: Form-data with `jobId: string` and `file: file`
  - Headers: `Authorization: Bearer <applicant_token>`
- **GET /applications/my-applications**: View applicant’s applications with pagination (applicant only).
  - Query: `page`, `pageSize`
  - Headers: `Authorization: Bearer <applicant_token>`
- **GET /applications/job/:jobId**: View applications for a job (company only, must own the job).
  - Query: `page`, `pageSize`
  - Headers: `Authorization: Bearer <company_token>`
- **PATCH /applications/:id/status**: Update application status (company only, must own the job).
  - Body: `{ status: "pending" | "accepted" | "rejected" }`
  - Headers: `Authorization: Bearer <company_token>`