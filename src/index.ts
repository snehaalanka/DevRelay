import express from "express";
import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";
import jwt from "jsonwebtoken";
import os from "os";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET!;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "DevRelay server is running"
  });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id
      },
      JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
});

app.post("/devices/register", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: number;
    };

    const hostname = os.hostname();

    const existingDevice = await prisma.device.findFirst({
      where: {
        name: hostname,
        ownerId: decoded.userId
      }
    });

    const device = existingDevice
      ? existingDevice
      : await prisma.device.create({
          data: {
            name: hostname,
            ownerId: decoded.userId
          }
        });

    const existingPermission = await prisma.permission.findFirst({
      where: {
        deviceId: device.id,
        userId: decoded.userId,
        permission: "*"
      }
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          deviceId: device.id,
          userId: decoded.userId,
          permission: "*"
        }
      });
    }

    res.json({
      message: existingDevice ? "Device already registered" : "Device registered",
      device: {
        id: device.id,
        name: device.name
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Device registration failed",
      error: String(error)
    });
  }
});

app.get("/devices", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: number;
    };

    const devices = await prisma.device.findMany({
      where: {
        ownerId: decoded.userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      devices: devices.map((d: any) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        lastSeen: d.lastSeen
      }))
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

app.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

app.post("/permissions/grant", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Not authenticated" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: number; };

    const { email, deviceId, permission } = req.body;
    if (!email || !deviceId || !permission) return res.status(400).json({ message: "Missing required fields" });

    const device = await prisma.device.findUnique({ where: { id: parseInt(deviceId) } });
    if (!device) return res.status(404).json({ message: "Device not found" });
    if (device.ownerId !== decoded.userId) return res.status(403).json({ message: "Only the device owner can grant permissions" });

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return res.status(404).json({ message: "User with that email not found" });

    const existingPermission = await prisma.permission.findFirst({
      where: { deviceId: device.id, userId: targetUser.id, permission }
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: { deviceId: device.id, userId: targetUser.id, permission }
      });
    }

    return res.json({ message: `Successfully granted permission to ${targetUser.username}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/devices/:id/logs", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Not authenticated" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: number; };

    const deviceId = parseInt(req.params.id);
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    
    if (!device) return res.status(404).json({ message: "Device not found" });
    if (device.ownerId !== decoded.userId) return res.status(403).json({ message: "Only the device owner can view logs" });

    const logs = await prisma.executionLog.findMany({
      where: { deviceId },
      include: { user: true },
      orderBy: { executedAt: 'desc' },
      take: 50
    });

    return res.json({ logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/run", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: number;
    };

    const { deviceName, command } = req.body;

    if (!deviceName || !command) {
      return res.status(400).json({
        message: "Missing deviceName or command"
      });
    }

    let device = await prisma.device.findFirst({
      where: {
        name: deviceName,
        OR: [
          { ownerId: decoded.userId },
          { permissions: { some: { userId: decoded.userId } } }
        ],
        status: "online"
      },
      orderBy: { lastSeen: "desc" }
    });

    if (!device) {
      device = await prisma.device.findFirst({
        where: {
          name: deviceName,
          OR: [
            { ownerId: decoded.userId },
            { permissions: { some: { userId: decoded.userId } } }
          ]
        },
        orderBy: { lastSeen: "desc" }
      });
    }

    if (!device) {
      return res.status(404).json({
        message: "Device not found or you don't have access to it"
      });
    }

    if (device.status !== "online") {
      return res.status(400).json({
        message: "Device is offline"
      });
    }

    const hasPermission = await prisma.permission.findFirst({
      where: {
        deviceId: device.id,
        userId: decoded.userId,
        OR: [
          { permission: "*" },
          { permission: command }
        ]
      }
    });

    if (!hasPermission) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to run this command on this device"
      });
    }

    try {
      const responses = await io.in(`device_${device.id}`).timeout(30000).emitWithAck("command", { command });
      if (!responses || responses.length === 0) {
        throw new Error("Device is offline or disconnected");
      }
      const result = responses[0];

      await prisma.executionLog.create({
        data: {
          command,
          output: result.output,
          status: result.status,
          deviceId: device.id,
          userId: decoded.userId
        }
      });

      return res.json(result);
    } catch (error) {
      await prisma.executionLog.create({
        data: {
          command,
          output: String(error),
          status: "timeout_or_error",
          deviceId: device.id,
          userId: decoded.userId
        }
      });

      return res.status(504).json({
        message: "Device did not respond in time",
        error: String(error)
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong"
    });
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.use(async (socket, next) => {
  try {
    const { token, deviceId } = socket.handshake.auth as {
      token?: string;
      deviceId?: number;
    };

    if (!token || !deviceId) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      userId: number;
    };

    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!device || device.ownerId !== decoded.userId) {
      return next(new Error("Device not found"));
    }

    socket.data.deviceId = deviceId;

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const deviceId = socket.data.deviceId as number;

  console.log(`Device ${deviceId} connected`);
  
  socket.join(`device_${deviceId}`);

  prisma.device.update({
    where: { id: deviceId },
    data: {
      status: "online",
      lastSeen: new Date()
    }
  }).catch((error: any) => console.error(error));

  socket.on("heartbeat", () => {
    prisma.device.update({
      where: { id: deviceId },
      data: {
        lastSeen: new Date()
      }
    }).catch((error: any) => console.error(error));
  });

  socket.on("disconnect", () => {
    console.log(`Device ${deviceId} disconnected`);

    prisma.device.update({
      where: { id: deviceId },
      data: {
        status: "offline",
        lastSeen: new Date()
      }
    }).catch((error: any) => console.error(error));
  });
});

httpServer.listen(PORT, () => {
  console.log(`DevRelay server running on port ${PORT}`);
});