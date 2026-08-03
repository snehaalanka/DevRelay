# DevRelay

**DevRelay** is a next-generation remote execution CLI and backend architecture that redefines how developers collaborate. By creating a secure WebSocket tunnel between your local machine and a centralized cloud server, DevRelay allows you to securely share access to your local terminal across the internet—without the headaches of SSH configuration, VPNs, or exposing firewall ports.

Imagine you are debugging a complex local build issue. Instead of screen-sharing or copy-pasting logs, you can instantly grant a coworker permission to run `git diff` or `npm run debug` directly on your machine, right from their own terminal.


# Why DevRelay? (The Problem It Solves)

Traditionally, giving someone access to your local environment meant:

1. Setting up dynamic DNS or Ngrok.
2. Generating and sharing SSH keys.
3. Exposing ports on your router, creating massive security risks.
4. Giving them **full access** to your entire computer.

**DevRelay completely eliminates this.**

With our outbound-only Socket.io architecture, your machine stays safely behind its NAT/Firewall. Furthermore, our **Zero-Trust Permission Model** ensures that a teammate can only run the *exact* commands you whitelist. You maintain absolute control, and every single execution is strictly logged.


# Key Features

- ⚡ **Instant Reverse-Tunneling:** Run terminal commands on remote devices seamlessly over secure WebSockets.
- 🔐 **Zero-Trust Access Control:** Granular permission system. Grant a user permission to run `git log`, but strictly block them from running `rm -rf`.
- 📡 **NAT & Firewall Bypassing:** Because the agent initiates an outbound connection to the cloud, you never need to open inbound ports.
- ☁️ **Cloud-Native Backend:** Backed by Supabase (PostgreSQL) for blazing-fast user authentication, device tracking, and permission validation.
- 📜 **Immutable Audit Logs:** Every command executed remotely is permanently logged to the cloud database, providing complete visibility into who ran what, and when.


# Architecture & Tech Stack

DevRelay is built with modern, enterprise-grade tools:

| Component | Technologies |
|-----------|--------------|
| CLI & Agent | TypeScript, Commander.js |
| Backend API | Node.js, Express |
| Real-time Engine | Socket.io |
| Database & ORM | Supabase (PostgreSQL), Prisma ORM |
| Authentication | JWT (JSON Web Tokens), bcrypt |
| Deployment | Render |

---

# Getting Started

## 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/DevRelay.git
cd DevRelay
npm install
```

---

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="your-secure-jwt-secret"
```

---

## 3. Build & Link the CLI

Compile the TypeScript code and link it globally:

```bash
npm run build
npm link
```

---

# 💻 Usage Guide

## 1. Authentication

Create an account and log in securely.

```bash
devrelay register <username> <email> <password>

devrelay login <email> <password>
```

---

## 2. Hosting Your Environment (Agent Mode)

Start the background agent:

```bash
devrelay agent start
```

Your machine instantly connects to the cloud and is now listening for authorized commands.

---

## 3. Grant Granular Permissions

Allow a teammate to execute only a specific command.

```bash
devrelay grant <teammate-email> <your-device-id> "<command>"
```

Example:

```bash
devrelay grant sudaykumar2608@gmail.com 1 "git log"
```

---

## 4. Execute Remote Commands

Once permission has been granted:

```bash
devrelay run <target-device-name> "<command>"
```

Example:

```bash
devrelay run sneha-HP-Pavilion-Laptop-14-dv2xxx "git log"
```

---

# 🎯 Real-World Use Cases

### Remote Pair Programming

Teammates can inspect your local repository, run tests, or debug issues without requiring screen sharing.

### CI/CD Triggers

Allow deployment pipelines or automation scripts to securely execute deployment commands on on-premise machines.

### Raspberry Pi & IoT Management

Remotely diagnose and manage edge devices without exposing them to the public internet or configuring VPNs.

---

# Security Guarantee

DevRelay ensures that **no command is executed without explicit authorization.**

Before a command is relayed:

1. The cloud backend verifies the user's JWT.
2. The requested command is matched against the permissions stored in PostgreSQL.
3. Only authorized commands are forwarded through the encrypted WebSocket tunnel.
4. Every execution is recorded in the audit logs.

This provides a secure, zero-trust architecture where users retain complete control over their local machines.

---

# 📌 Future Enhancements

- Command approval prompts
- Role-based access control (RBAC)
- Multi-device management dashboard
- Session recording and playback
- End-to-end encrypted command payloads
- File transfer support
- Cross-platform desktop application

---

## ⭐ If you found this project interesting, consider giving it a star!
