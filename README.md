Balance App
===========

A user balance management system with REST API interface and distributed cron service.

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

    # Start containers (5 instances of the application)
    npm run docker:up

    # Stop containers
    npm run docker:down

    # Full rebuild (with volume cleanup)
    npm run docker:reset

    # View all application logs
    npm run docker:logs

    # View logs for specific application instance
    npm run docker:logs:app1
    npm run docker:logs:app2
    npm run docker:logs:app3
    npm run docker:logs:app4
    npm run docker:logs:app5


Health check
-------------

   `GET /health` - Health check

Cron Service
-------------

The application includes a distributed cron service that runs on multiple instances.

### Features

* 10 test background tasks that run for at least 2 minutes each
* Tasks are distributed evenly across 5 application instances
* No master server - each instance works independently
* Tasks are not duplicated across instances
* Task execution history is stored in the database
* Real-time task status monitoring

### API Endpoints

* `GET /api/cron/status` - Get the status of all cron jobs, including which instance is running each job and how long it has been running

### How it works

1. Each application instance has a unique server ID
2. When a task needs to be run, the instances use a deterministic algorithm to decide which instance should run it
3. Tasks that are already running on one instance will not be started on another instance
4. Each task runs for at least 2 minutes (simulated with setTimeout)
5. Task execution history is stored in the database

Database Migrations
-------------------

Migrations run automatically on application startup.