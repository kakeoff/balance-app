Balance App
===========

A user balance management system with REST API interface.

Installation & Setup
--------------------

### Prerequisites

*   Node.js (version 16+)
*   PostgreSQL (version 12+)
*   Docker (optional, for containerized deployment)

### Install dependencies

    npm install

### Environment setup

Create `.env` file in project root:

    DB_HOST=postgres
    DB_PORT=5432
    DB_USER=example_user
    DB_PASSWORD=example_password
    DB_NAME=example_db

### Development mode

    npm run dev

### Production build

    npm run build
    npm run start

Docker Deployment
-----------------

    # Start containers
    npm run docker:up

    # Stop containers
    npm run docker:down

    # Full rebuild (with volume cleanup)
    npm run docker:reset

    # View application logs
    npm run docker:logs


Health check
-------------

   `GET /health` - Health check



Database Migrations
-------------------

Migrations run automatically on application startup.