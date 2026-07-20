# DevRelay

## Overview

DevRelay is a **terminal-first remote developer collaboration platform** that enables developers to securely connect multiple devices and remotely execute approved development tasks.

Unlike traditional remote desktop software such as TeamViewer or AnyDesk, DevRelay is **not designed for screen sharing or full remote control**. Instead, it focuses specifically on **developer workflows**, allowing authenticated users to execute predefined development commands, monitor connected machines, and collaborate securely through a centralized server.

The project is designed to simulate how real distributed systems work, where multiple clients communicate with a backend server that manages authentication, authorization, device registration, and real-time communication.

The entire interaction happens from the terminal.

---

# Project Goal

Imagine this situation.

You are working on your college laptop.

Your desktop computer at home contains your latest project.

Instead of opening a remote desktop application, you simply type:

```bash
devrelay login

devrelay devices

devrelay run home-pc git-status
```

The command reaches your home computer.

Your home computer executes it.

The result comes back to your terminal.

Everything happens securely.

No graphical interface.

Only terminal.

---

# Why are we building this?

The purpose is not just to make another CRUD application.

This project teaches how real backend systems work.

It combines

* Authentication
* Authorization
* Networking
* Database Design
* Terminal Applications
* APIs
* WebSockets
* Secure Communication

into one realistic software system.

It is much closer to how real developer tools are built than a simple Todo application.

---

# Project Philosophy

Instead of asking

> "How do I make a website?"

we are asking

> "How do multiple computers securely communicate over the internet?"

That is the entire purpose of DevRelay.

---

# Technology Stack

## Language

TypeScript

Why?

Because modern companies increasingly prefer TypeScript over plain JavaScript.

It provides

* Static typing
* Better autocomplete
* Fewer runtime bugs
* Easier maintenance

---

## Runtime

Node.js

Node allows JavaScript/TypeScript to run outside the browser.

It is responsible for

* Running the backend
* Running the CLI
* Running the device agent

---

## Backend Framework

Express.js

Express creates the HTTP server.

It handles routes like

```
POST /register

POST /login

GET /devices

POST /run
```

---

## Database

PostgreSQL

Stores

Users

Devices

Permissions

Sessions

Execution history

Audit logs

---

## ORM

Prisma

Instead of writing SQL manually

```sql
SELECT * FROM users;
```

we write

```ts
await prisma.user.findMany();
```

Prisma converts it into SQL automatically.

---

## Authentication

JWT (JSON Web Token)

After login

```
Email
Password
```

↓

Server verifies credentials

↓

Creates JWT

↓

CLI stores JWT

↓

Every future request automatically proves the user's identity.

---

## Password Security

bcrypt

Passwords are **never stored directly**.

Instead of

```
password123
```

Database stores something like

```
$2b$10$Y7...
```

Even if someone steals the database, they cannot easily recover users’ passwords.

---

## Terminal Framework

Commander.js

Allows commands like

```
devrelay login

devrelay register

devrelay devices

devrelay agent start

devrelay run
```

instead of manually parsing terminal arguments.

---

## Interactive CLI

Inquirer

Instead of

```
node app.js sneha pass123
```

users get

```
Username:

Email:

Password:
```

making the application feel like a professional CLI.

---

## Real-Time Communication

WebSockets

Unlike HTTP

```
Request

Response

Connection closes
```

WebSockets keep the connection alive.

This is essential because devices must remain online.

```
Server
      ↑
      ↓
Device
```

Both sides can send messages at any time.

---

# Overall Architecture

```
                 DevRelay CLI
          (Terminal Commands)

                  │

                  ▼

          Express Backend Server

                  │

      Authentication (JWT)

                  │

               Prisma ORM

                  │

             PostgreSQL

                  │

          WebSocket Server

                  │

                  ▼

           Device Agent

          (Another Computer)
```

---

# Main Components

## 1. CLI

Runs inside the terminal.

Examples

```
devrelay register

devrelay login

devrelay devices

devrelay run

devrelay logout
```

The CLI never directly accesses the database.

It only talks to the backend.

---

## 2. Backend

The brain of DevRelay.

Responsible for

Authentication

Device management

Permissions

Command routing

Database access

Security

---

## 3. Database

Stores

Users

Registered devices

Permissions

Logs

History

Sessions

---

## 4. Device Agent

Runs on every connected computer.

When started

```
devrelay agent start
```

it

Registers itself

Maintains WebSocket connection

Waits for commands

Executes allowed commands

Returns output

---

# Authentication Flow

```
User

↓

Register

↓

Database stores account

↓

Login

↓

JWT created

↓

Token stored locally

↓

Future requests automatically authenticated
```

---

# Device Registration Flow

```
Agent starts

↓

Reads hostname

↓

Connects to server

↓

Registers device

↓

Server stores

Device Name

Owner

Status

Operating System

Connection Time
```

---

# Remote Command Flow

```
Your Terminal

↓

devrelay run home-pc git-status

↓

Server verifies JWT

↓

Checks permissions

↓

Finds device

↓

Sends command over WebSocket

↓

Device executes command

↓

Collects output

↓

Returns output

↓

Displays in your terminal
```

---

# Security

Passwords hashed with bcrypt

JWT authentication

Permission checks

User isolation

Only authenticated users

No plain password storage

No direct database access from clients

---

# Database Design

Users

```
id

username

email

passwordHash

createdAt
```

Devices

```
id

name

ownerId

status

createdAt
```

Permissions

```
id

deviceId

userId

permission
```

Execution Logs

```
id

command

output

executedAt

status
```

---

# Learning Objectives

This project teaches

TypeScript

Node.js

Express

REST APIs

Authentication

Authorization

JWT

bcrypt

Prisma

PostgreSQL

CLI Development

Interactive Terminal Applications

WebSockets

Database Relationships

Project Structure

Error Handling

Middleware

Asynchronous Programming

Real-Time Systems

System Design

---

# Why This Project Is Valuable

Many portfolio projects demonstrate isolated skills:

* A todo app demonstrates CRUD.
* A weather app demonstrates API consumption.
* A blog demonstrates authentication.

DevRelay combines **multiple software engineering concepts into one cohesive system**:

* A custom terminal application.
* A backend API.
* A relational database.
* Secure authentication.
* Real-time communication.
* Distributed device management.

It demonstrates how different parts of a modern application work together, which makes it a stronger learning project than a collection of disconnected examples.

---

# Final User Experience

```
$ devrelay register

Username: sneha
Email: sneha@gmail.com
Password: ********

✓ Account created
```

```
$ devrelay login

Email: sneha@gmail.com
Password: ********

✓ Logged in
```

```
$ devrelay agent start

✓ Device registered

✓ Connected to DevRelay
```

```
$ devrelay devices

NAME            STATUS

Home-PC         Online

College-Laptop  Online
```

```
$ devrelay run Home-PC git-status

Running command...

On branch main

Your branch is up to date with origin/main
```
