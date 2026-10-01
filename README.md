# Build a Complete Skill & Service Exchange Platform

You are a senior full-stack MERN engineer. Build a **complete, production-ready, responsive web application from scratch** called **Skill Exchange / Skill & Service Marketplace**.

Do not provide a prototype, mockup, pseudo-code, incomplete implementation, or placeholder UI.

Generate the **actual working source code for the complete application**, including frontend, backend, database models, authentication, authorization, real-time messaging, task/service workflows, negotiation, payments, reviews, admin moderation, notifications, validation, error handling, seed/demo data, and deployment configuration.

The application must be runnable locally and deployable to **Render**, with:

* React + Vite frontend
* Node.js + Express backend
* MongoDB + Mongoose
* Firebase Authentication
* Socket.IO
* Razorpay
* Git/GitHub-friendly project structure
* Render deployment configuration

---

# 1. PRODUCT CONCEPT

This platform connects two sides:

### Service Requester

A person or organization that needs a service, project, lesson, workshop, or skill.

Examples:

* Programming help
* Website development
* Graphic design
* Tutoring
* Driving lessons
* House painting
* Cleaning
* Repairs
* Photography
* Video editing
* Mentoring
* Language lessons
* Fitness coaching
* Event assistance
* Home services
* Professional consulting
* Community projects
* Other legitimate skill-based services

### Service Provider

A person or group with a skill who can provide the requested service.

The platform should not hard-code the system around "volunteers."

Use generalized terminology such as:

* Service
* Task
* Request
* Provider
* Requester
* Applicant
* Client
* Instructor
* Workshop
* Skill

A user should be able to provide different types of services depending on their skills.

---

# 2. USER ROLES

Implement three primary roles:

## A. User / Service Provider

Can:

* Create a profile
* Add skills
* Add bio
* Add experience
* Add portfolio information
* Browse service requests
* Search and filter requests
* Apply to requests
* Submit a custom proposal/pitch
* Propose terms
* Chat with requesters
* Negotiate price and time
* Accept finalized terms
* Complete assigned work
* Receive payments
* Create workshops/classes
* Manage class enrollments
* Receive ratings/reviews
* Give ratings/reviews to requesters
* View dashboard
* View notifications
* View transaction/payment history

## B. Requester

A requester can be:

* An individual
* An organization

Can:

* Create service requests
* Specify requirements
* Set initial budget/payment
* Set expected duration/time limit
* Receive applications
* Review provider profiles
* Review proposals
* Chat with applicants
* Negotiate price and duration
* Select exactly one provider/group for a task
* Finalize terms
* Make Razorpay payment
* Start the project/service
* Mark the task completed
* Review the provider
* Receive a review from the provider
* Create or manage organization profile if applicable

## C. Admin

Can:

* Access admin dashboard
* Verify users
* Verify organizations
* Approve/reject service requests
* Approve/reject workshops
* Review reported users/content
* Manage users
* Manage tasks
* Manage classes
* View payments
* View platform statistics
* Suspend/restore accounts where appropriate
* View moderation activity

---

# 3. AUTHENTICATION

Use **Firebase Authentication**.

Do NOT build a separate password authentication system.

Support:

* Email/password registration
* Email/password login
* Google authentication if practical
* Logout
* Firebase authentication state persistence
* Password reset
* Protected routes

The frontend obtains the Firebase ID token.

The backend must verify Firebase ID tokens using the **Firebase Admin SDK**.

Do not trust role information sent directly from the frontend.

User roles must be stored in MongoDB and checked server-side.

Example backend flow:

```text
React
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Authorization header
   ↓
Express middleware
   ↓
Firebase Admin SDK verification
   ↓
MongoDB user lookup
   ↓
Role authorization
```

Use:

```http
Authorization: Bearer <firebase-id-token>
```

for authenticated API requests.

---

# 4. SECURITY

Implement:

* Firebase Admin token verification
* Server-side role authorization
* Request validation
* Mongoose validation
* Secure CORS configuration
* Helmet
* Rate limiting
* Safe error handling
* No sensitive information in frontend code
* No hard-coded API keys
* No hard-coded Firebase service-account credentials
* No hard-coded Razorpay secrets
* Environment variables
* MongoDB injection protection
* Input sanitization where appropriate
* Authentication checks on Socket.IO connections
* Authorization checks for conversations
* Authorization checks for task/application access
* Payment signature verification
* Secure webhook handling
* Proper HTTP status codes

Never expose:

* Firebase Admin private key
* Razorpay secret
* MongoDB credentials
* server secrets

to the React application.

---

# 5. DATABASE

Use MongoDB with Mongoose.

Create clean schemas.

Recommended models:

```text
User
Organization
Task
Application
Conversation
Message
Negotiation/Terms
Class
Enrollment
Payment
Review
Notification
Report
AdminAction
```

You may combine models where appropriate, but keep the database design normalized and maintainable.

---

# 6. USER MODEL

Include fields such as:

```text
firebaseUid
name
email
avatar
role
accountType
bio
phone
location
skills[]
experience
portfolio[]
isVerified
verificationStatus
isActive
ratingAverage
ratingCount
createdAt
updatedAt
```

Possible account types:

```text
individual
organization
```

Roles:

```text
user
admin
```

Do not create separate authentication systems for organizations and users.

---

# 7. ORGANIZATION PROFILE

Organizations should have:

```text
organizationName
description
email
phone
website
location
category
logo
isVerified
verificationStatus
createdAt
updatedAt
```

Verification should initially focus on **basic information**.

Admin can:

```text
Pending
Approved
Rejected
```

verification requests.

---

# 8. SERVICE REQUEST / TASK SYSTEM

Create a generalized `Task` model.

A task represents something that a requester needs.

Example:

```text
Title:
Need a React developer for a small website

Category:
Programming

Description:
Need help building...

Skills:
React
JavaScript
CSS

Budget:
₹15,000

Expected Duration:
10 days

Location:
Mumbai

Work Mode:
Online

Deadline:
...

Requester:
...

Status:
...
```

Support categories such as:

* Programming
* Design
* Education
* Home Services
* Repairs
* Driving
* Photography
* Video
* Marketing
* Writing
* Music
* Fitness
* Consulting
* Other

Make categories extensible.

---

# 9. TASK STATUS

Implement a clear state machine.

Suggested states:

```text
draft
pending_approval
published
application_open
provider_selected
negotiating
payment_pending
in_progress
completed
cancelled
disputed
closed
```

Do not allow invalid state transitions.

---

# 10. TASK CREATION

Requester creates:

* Title
* Description
* Category
* Required skills
* Budget/payment
* Expected duration
* Deadline
* Location
* Online/offline
* Additional requirements
* Attachments if practical
* Number of providers required

For normal tasks:

```text
numberOfProviders = 1
```

Many people can apply, but only **one provider or one provider group** can ultimately be selected.

---

# 11. APPLICATION SYSTEM

Multiple providers can apply.

Each application should contain:

```text
taskId
applicantId
pitch
proposedPrice
proposedDuration
status
createdAt
updatedAt
```

Possible application statuses:

```text
pending
shortlisted
rejected
accepted
withdrawn
```

The requester can:

* View applicants
* Compare profiles
* Read pitches
* Open conversation
* Negotiate
* Accept one applicant

When one applicant is accepted:

* That applicant becomes the selected provider
* Other pending applications become rejected/closed
* No second provider can be selected
* Task enters negotiation/payment workflow

Prevent race conditions on the backend so two providers cannot be accepted simultaneously.

---

# 12. PRE-WORK NEGOTIATION

Use **Socket.IO** for real-time communication.

Each application gets a private conversation.

Only these participants may access the conversation:

```text
Requester
Provider/applicant
```

Features:

* Real-time messages
* Message timestamps
* Online/offline indication if practical
* Typing indicator if practical
* Read status if practical
* Message history
* System messages for important events

Examples:

```text
Application accepted
Price updated
Duration updated
Terms accepted
Payment completed
Work started
Work completed
```

---

# 13. TERMS NEGOTIATION

Do not build a complicated legal contract system.

Create a simple terms panel inside the conversation.

The agreed terms should include:

```text
finalPrice
currency
expectedDuration
startDate
deadline
additionalNotes
```

Either participant can propose updated terms during negotiation.

The platform does not need to maintain a complicated historical pricing ledger.

However, the currently active terms must always be clearly visible.

Both parties should be able to explicitly accept the current terms.

Example:

```text
Requester:
₹12,000
Duration: 7 days

Provider:
Accept

Requester:
Accept
```

Only when both sides accept the current terms should the application proceed.

---

# 14. PAYMENT

Integrate **Razorpay**.

The requester pays the agreed amount through Razorpay.

Payment amount must come from the finalized terms stored on the backend.

Never trust a payment amount sent directly from the browser.

Flow:

```text
Application accepted
        ↓
Negotiation
        ↓
Final terms
        ↓
Both parties accept terms
        ↓
Requester clicks Pay
        ↓
Backend creates Razorpay order
        ↓
Frontend opens Razorpay Checkout
        ↓
Payment completed
        ↓
Frontend sends payment response
        ↓
Backend verifies Razorpay signature
        ↓
Payment marked successful
        ↓
Task becomes In Progress
```

Store payment information:

```text
razorpayOrderId
razorpayPaymentId
razorpaySignature
amount
currency
status
taskId
applicationId
requesterId
providerId
createdAt
updatedAt
```

Support payment statuses:

```text
created
pending
paid
failed
refunded
cancelled
```

Include Razorpay webhook support if appropriate.

Do not falsely claim that money is being held in escrow unless the actual Razorpay integration supports the exact escrow flow.

---

# 15. PAYMENT CURRENCY

Primary currency should be:

```text
INR
```

Use ₹ throughout the default UI.

Keep currency configurable in the backend so the architecture can be extended later.

---

# 16. TASK TIME

Volunteer-hour logging is NOT required.

Instead, each task should have:

* Expected duration
* Start date
* Deadline
* Optional estimated hours

The requester and provider can negotiate the duration.

Example:

```text
Initial duration: 10 days

After discussion:

Agreed duration: 14 days
```

Do not build a timesheet/hour logging system unless needed elsewhere.

---

# 17. TASK COMPLETION

After payment and work:

Provider can indicate that work is completed.

Requester can:

```text
Mark completed
```

The task becomes:

```text
completed
```

Both sides can then review each other.

Add a completion confirmation flow so one side cannot arbitrarily claim a task is completed without the appropriate permissions.

---

# 18. REVIEWS

Both sides can review each other.

A review contains:

```text
reviewerId
revieweeId
taskId
rating
comment
createdAt
```

Rating:

```text
1–5 stars
```

Both requester and provider can review each other.

Prevent:

* Duplicate reviews
* Reviewing users who were not part of the task
* Reviewing before completion

Display:

* Average rating
* Number of reviews
* Recent reviews

---

# 19. WORKSHOPS / CLASSES

Providers can create classes/workshops.

Examples:

```text
React for Beginners
Driving Basics
Photography Workshop
English Conversation
Graphic Design
Excel Training
Guitar Basics
```

A class should support:

```text
title
description
category
skills
instructor
price
currency
date
startTime
endTime
duration
capacity
locationType
location
meetingUrl
image
requirements
status
```

Location type:

```text
online
offline
hybrid
```

Support:

* Enrollment
* Capacity limits
* Scheduled date/time
* Online meeting link
* Offline location
* Free or paid classes
* Enrollment status
* Cancellation
* Instructor management
* Admin approval

If the class is paid, use Razorpay for enrollment payment.

---

# 20. CLASS APPROVAL

New classes should not immediately become public.

Flow:

```text
Draft
↓
Pending Admin Approval
↓
Approved
↓
Published
```

Admin can:

* Approve
* Reject
* Request changes if practical

---

# 21. TASK APPROVAL

New service requests should also pass through moderation.

Flow:

```text
Draft
↓
Pending Approval
↓
Approved
↓
Published
```

Admin can reject inappropriate or incomplete requests.

---

# 22. SEARCH

Implement powerful search.

Users should be able to search tasks/classes by:

* Keyword
* Category
* Skill
* Location
* Online/offline
* Price range
* Date
* Duration
* Rating
* Verified requester/provider

Use MongoDB indexes where useful.

---

# 23. USER DASHBOARD

Provider dashboard should include:

### Overview

* Active applications
* Accepted tasks
* Tasks in progress
* Completed tasks
* Upcoming classes
* Earnings
* Rating

### Applications

Show:

```text
Task
Requester
Proposal
Price
Duration
Status
```

### Active Work

Show:

```text
Task
Agreed payment
Deadline
Conversation
Payment status
```

### Classes

* Created classes
* Upcoming classes
* Enrollments

### Reviews

* Received reviews
* Given reviews

---

# 24. REQUESTER DASHBOARD

Show:

### Overview

* Active tasks
* Applications
* Tasks in progress
* Completed tasks
* Payments
* Upcoming classes/enrollments

### My Tasks

Show:

```text
Task
Applications
Selected provider
Payment
Status
Deadline
```

### Applications

Allow requester to:

* Review applicants
* Open profiles
* Chat
* Negotiate
* Select provider

---

# 25. ADMIN DASHBOARD

Create a professional admin dashboard.

Display:

* Total users
* Verified users
* Verified organizations
* Active tasks
* Completed tasks
* Workshops
* Total applications
* Total payments
* Total payment volume
* Monthly growth
* Pending verifications
* Pending task approvals
* Pending class approvals
* Reports

Use charts where appropriate.

For example:

* Users over time
* Tasks created over time
* Completed tasks
* Payment volume
* Class enrollments

Do not expose sensitive information unnecessarily.

---

# 26. ADMIN VERIFICATION

Admin should have a verification queue.

For individual users:

Review basic profile information.

For organizations:

Review:

* Organization name
* Description
* Contact information
* Website if provided
* Location
* Other basic information

Admin actions:

```text
Approve
Reject
Suspend
```

Verified profiles receive a visible verification badge.

---

# 27. REPORTING AND MODERATION

Users should be able to report:

* User
* Task
* Class
* Message if appropriate

Report fields:

```text
reporter
target
reason
description
status
createdAt
```

Admin can:

* Review reports
* Resolve reports
* Suspend accounts
* Remove inappropriate content where appropriate

---

# 28. NOTIFICATIONS

Create an in-app notification system.

Notify users when:

* Application submitted
* Application accepted
* Application rejected
* New message
* Terms changed
* Terms accepted
* Payment required
* Payment successful
* Task started
* Task completed
* Review received
* Class approved
* Class rejected
* Someone enrolls in their class
* Class reminder
* Verification approved/rejected

Include unread count.

---

# 29. FRONTEND TECHNOLOGY

Use:

* React
* Vite
* React Router
* Tailwind CSS
* Lucide React
* Context API
* Axios
* Socket.IO client
* Firebase client SDK
* Razorpay Checkout

Keep the frontend component-based and maintainable.

---

# 30. DESIGN SYSTEM

Use a **modern SaaS marketplace UI**.

Do NOT make it look like an AI-generated dashboard.

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Random animations
* Huge decorative elements
* Overly futuristic AI aesthetics

Use:

* Clean layouts
* Professional typography
* Strong spacing
* Cards where useful
* Clear buttons
* Accessible forms
* Consistent colors
* Subtle shadows
* Professional dashboards
* Good empty states
* Loading skeletons
* Toast notifications

The interface should feel like a real modern marketplace/SaaS product.

---

# 31. RESPONSIVE DESIGN

The entire application must work properly on:

* Desktop
* Laptop
* Tablet
* Mobile

Do not simply shrink desktop layouts.

Create proper mobile navigation.

Tables should become responsive cards or horizontally scroll where appropriate.

Chat must work well on mobile.

Dashboards must be usable on small screens.

---

# 32. REQUIRED PAGES

Create at minimum:

```text
/
 /login
 /register
 /forgot-password

 /tasks
 /tasks/:id
 /create-task

 /applications/:id
 /messages

 /classes
 /classes/:id
 /create-class

 /dashboard
 /dashboard/tasks
 /dashboard/applications
 /dashboard/payments
 /dashboard/classes
 /dashboard/reviews
 /profile/:id
 /settings

 /notifications

 /admin
 /admin/users
 /admin/organizations
 /admin/tasks
 /admin/classes
 /admin/payments
 /admin/reports
 /admin/analytics
```

Use role-based route protection.

---

# 33. IMPORTANT COMPONENTS

Create reusable components such as:

```text
Navbar
Footer
TaskCard
ClassCard
UserCard
OrganizationCard
RatingStars
VerifiedBadge
SearchBar
FilterPanel
TaskApplicationForm
ApplicationCard
DiscussionPanel
ChatWindow
MessageBubble
TermsPanel
PaymentButton
PaymentStatus
ReviewForm
ReviewCard
NotificationDropdown
NotificationItem
Modal
ConfirmDialog
LoadingSpinner
Skeleton
EmptyState
ErrorState
ProtectedRoute
RoleGuard
```

---

# 34. BACKEND STRUCTURE

Use a clean architecture similar to:

```text
server/
├── config/
│   ├── db.js
│   ├── firebase.js
│   └── razorpay.js
│
├── controllers/
│   ├── userController.js
│   ├── organizationController.js
│   ├── taskController.js
│   ├── applicationController.js
│   ├── messageController.js
│   ├── classController.js
│   ├── enrollmentController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── notificationController.js
│   ├── reportController.js
│   └── adminController.js
│
├── middleware/
│   ├── auth.js
│   ├── role.js
│   ├── errorHandler.js
│   ├── validation.js
│   └── rateLimiter.js
│
├── models/
│   ├── User.js
│   ├── Organization.js
│   ├── Task.js
│   ├── Application.js
│   ├── Conversation.js
│   ├── Message.js
│   ├── Class.js
│   ├── Enrollment.js
│   ├── Payment.js
│   ├── Review.js
│   ├── Notification.js
│   ├── Report.js
│   └── AdminAction.js
│
├── routes/
│   ├── userRoutes.js
│   ├── organizationRoutes.js
│   ├── taskRoutes.js
│   ├── applicationRoutes.js
│   ├── messageRoutes.js
│   ├── classRoutes.js
│   ├── enrollmentRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   ├── notificationRoutes.js
│   ├── reportRoutes.js
│   └── adminRoutes.js
│
├── sockets/
│   └── chatSocket.js
│
├── utils/
│   ├── response.js
│   ├── validation.js
│   └── helpers.js
│
├── seed.js
├── server.js
└── package.json
```

You may improve this structure if there is a strong architectural reason.

---

# 35. FRONTEND STRUCTURE

Use:

```text
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── routes/
│   ├── firebase/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

# 36. API DESIGN

Create RESTful APIs.

Examples:

```text
POST   /api/users
GET    /api/users/me
GET    /api/users/:id
PUT    /api/users/me

POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id

POST   /api/tasks/:id/applications
GET    /api/tasks/:id/applications

GET    /api/applications/:id
PUT    /api/applications/:id
POST   /api/applications/:id/accept
POST   /api/applications/:id/terms
POST   /api/applications/:id/terms/accept

POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook

GET    /api/classes
POST   /api/classes
GET    /api/classes/:id
PUT    /api/classes/:id
POST   /api/classes/:id/enroll

POST   /api/reviews
GET    /api/users/:id/reviews

GET    /api/notifications
PUT    /api/notifications/:id/read

GET    /api/admin/stats
GET    /api/admin/verifications
PUT    /api/admin/users/:id/verify
PUT    /api/admin/tasks/:id/approve
PUT    /api/admin/classes/:id/approve
```

Add pagination to list APIs.

Return consistent JSON responses.

---

# 37. SOCKET.IO

Implement authenticated Socket.IO connections.

Events can include:

```text
joinConversation
leaveConversation
sendMessage
newMessage
typing
stopTyping
messageRead
termsUpdated
applicationUpdated
notification
```

Users must only be able to join conversations they are authorized to access.

Persist messages in MongoDB.

Socket.IO is for real-time delivery; MongoDB remains the source of truth.

---

# 38. ERROR HANDLING

Implement centralized backend error handling.

Frontend should display useful messages such as:

```text
Something went wrong.
You are not authorized.
This task is no longer accepting applications.
This task already has a provider.
Payment verification failed.
This class is full.
```

Never expose stack traces or sensitive server details to users in production.

---

# 39. VALIDATION

Validate both frontend and backend.

Examples:

* Required fields
* Valid email
* Valid price
* Positive duration
* Valid dates
* Maximum text lengths
* Valid rating 1–5
* Valid ObjectIds
* Valid payment amounts
* Valid class capacity

Backend validation is mandatory even if frontend validation exists.

---

# 40. DATABASE INDEXING

Add appropriate indexes for:

* User email
* Firebase UID
* Task status
* Task category
* Task location
* Task skills
* Task creation date
* Application task ID
* Application applicant ID
* Messages conversation ID
* Notifications user ID
* Reviews reviewee ID

Add text indexes where appropriate for task/class searching.

---

# 41. DEMO / SEED DATA

Create a useful seed system.

Include:

### Admin

```text
admin@example.com
```

### Demo requester

```text
requester@example.com
```

### Demo provider

```text
provider@example.com
```

### Demo organization

```text
organization@example.com
```

Do NOT hard-code real passwords or secrets into production configuration.

Because Firebase Authentication is used, clearly explain how demo users are created in Firebase.

If automatic Firebase user creation is included in the seed process, use Firebase Admin SDK and environment variables for credentials.

Seed:

* Users
* Organization
* Approved tasks
* Pending task
* Applications
* Sample conversation
* Sample messages
* Classes
* Reviews
* Notifications
* Payment examples where safe

---

# 42. ENVIRONMENT VARIABLES

Create:

```text
server/.env.example
client/.env.example
```

Never commit real `.env` files.

Backend example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CLIENT_URL=http://localhost:3000

NODE_ENV=development
```

Frontend example:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_RAZORPAY_KEY_ID=your_public_razorpay_key_id
```

Explain exactly where each value comes from.

Do not put Razorpay secret keys in the frontend.

---

# 43. FIREBASE SETUP DOCUMENTATION

Create documentation explaining:

1. Create Firebase project
2. Enable Authentication
3. Enable Email/Password
4. Optionally enable Google provider
5. Create web application
6. Copy frontend Firebase configuration
7. Generate Firebase Admin credentials securely
8. Configure backend environment variables

Never place service-account JSON directly into Git.

---

# 44. MONGODB SETUP

Support:

```text
MongoDB local
MongoDB Atlas
```

Explain how to configure:

```text
MONGO_URI
```

Include database connection error handling.

---

# 45. RAZORPAY SETUP DOCUMENTATION

Explain:

1. Create Razorpay account
2. Obtain test API keys
3. Configure environment variables
4. Use test mode during development
5. Configure webhook
6. Verify payment signatures
7. Switch to production credentials only during deployment

The application must work correctly in Razorpay test mode.

---

# 46. RENDER DEPLOYMENT

Prepare the project for deployment to Render.

Backend:

```text
Node/Express Web Service
```

Frontend:

Either:

```text
Static Site
```

or an appropriate Render frontend deployment.

Configure:

* Build command
* Start command
* Environment variables
* CORS
* Production API URL
* MongoDB Atlas
* Firebase
* Razorpay

Document the deployment process.

---

# 47. GIT / GITHUB

Create:

```text
.gitignore
README.md
```

`.gitignore` must include:

```text
node_modules
.env
.env.*
!.env.example
dist
build
coverage
logs
```

Do not commit:

* secrets
* Firebase private keys
* Razorpay secrets
* MongoDB credentials

---

# 48. README

Create a complete README containing:

* Project overview
* Features
* Architecture
* Tech stack
* Folder structure
* Prerequisites
* Installation
* MongoDB setup
* Firebase setup
* Razorpay setup
* Environment variables
* Running backend
* Running frontend
* Seeding data
* Testing
* Socket.IO architecture
* Payment architecture
* Deployment to Render
* Security notes
* Troubleshooting

---

# 49. QUALITY REQUIREMENTS

The final application must:

* Compile without errors
* Have no broken imports
* Have no missing components
* Have no fake API calls
* Have no TODO placeholders for core functionality
* Have no dead buttons
* Have no fake payment success
* Have no insecure authentication shortcuts
* Have proper loading states
* Have proper error states
* Have empty states
* Have responsive layouts
* Have accessible forms
* Have useful validation
* Have working navigation
* Have working API integration
* Have working Socket.IO messaging
* Have working Firebase authentication
* Have working Razorpay test integration
* Have working MongoDB persistence

---

# 50. IMPORTANT IMPLEMENTATION RULE

Do not merely generate the file structure.

Actually implement every required file.

If you need to make architectural decisions that were not explicitly specified, choose the simplest secure production-quality solution and document the decision.

Do not repeatedly ask for permission to create normal files or components.

Use sensible defaults.

---

# 51. DEVELOPMENT PROCESS

Build the project in logical phases:

### Phase 1

Project setup and configuration.

### Phase 2

MongoDB models and database connection.

### Phase 3

Firebase authentication and backend authorization.

### Phase 4

Task/service request system.

### Phase 5

Application system.

### Phase 6

Socket.IO chat.

### Phase 7

Negotiation and terms.

### Phase 8

Razorpay payments.

### Phase 9

Task completion and reviews.

### Phase 10

Classes/workshops.

### Phase 11

Notifications.

### Phase 12

Admin moderation.

### Phase 13

Analytics.

### Phase 14

Responsive UI polish.

### Phase 15

Testing, security review, and deployment configuration.

---

# 52. FINAL ACCEPTANCE TEST

Before considering the project complete, verify this complete scenario:

### Scenario A — Service Request

1. Requester registers with Firebase.
2. Requester completes profile.
3. Requester creates a task.
4. Task enters admin approval.
5. Admin approves it.
6. Task appears publicly.

### Scenario B — Provider Application

1. Provider logs in.
2. Provider searches tasks.
3. Provider opens task.
4. Provider submits pitch.
5. Requester receives application.
6. Requester reviews provider profile.

### Scenario C — Negotiation

1. Requester opens application.
2. Both parties enter private Socket.IO chat.
3. They discuss requirements.
4. Price/duration is updated.
5. Both accept final terms.
6. Task enters payment stage.

### Scenario D — Payment

1. Requester clicks Pay.
2. Backend creates Razorpay order.
3. Razorpay Checkout opens.
4. Test payment succeeds.
5. Backend verifies signature.
6. Payment is saved.
7. Task becomes `in_progress`.

### Scenario E — Completion

1. Provider completes service.
2. Provider marks work completed.
3. Requester confirms completion.
4. Task becomes `completed`.
5. Both users can submit reviews.
6. Ratings appear on profiles.

### Scenario F — Workshop

1. Provider creates workshop.
2. Workshop enters moderation.
3. Admin approves.
4. Workshop becomes public.
5. User enrolls.
6. If paid, Razorpay processes payment.
7. Enrollment is recorded.
8. User sees scheduled date/time and meeting information.

### Scenario G — Admin

1. Admin logs in.
2. Admin sees analytics.
3. Admin sees verification queue.
4. Admin approves/rejects users.
5. Admin approves/rejects tasks.
6. Admin approves/rejects workshops.
7. Admin reviews reports.
8. Admin can view payment statistics.

---

# 53. FINAL OUTPUT EXPECTATION

At the end, provide:

1. Complete project source code
2. Complete folder structure
3. Backend implementation
4. Frontend implementation
5. MongoDB models
6. Firebase integration
7. Socket.IO integration
8. Razorpay integration
9. Admin dashboard
10. Seed/demo system
11. `.env.example` files
12. `.gitignore`
13. README
14. Local setup instructions
15. Render deployment instructions
16. Testing instructions
17. Security checklist
18. Final verification that the main user workflows work

The result should be a **real, coherent, end-to-end MERN application**, not a collection of disconnected examples.

Prioritize correctness, security, maintainability, responsive UX, and working business logic over unnecessary visual complexity.
