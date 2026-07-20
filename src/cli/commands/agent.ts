import { Command } from "commander";
import { io } from "socket.io-client";
import { getToken, saveDeviceId } from "../utils/auth.js";
import { exec } from "child_process";

export const agentCommand = new Command("agent");

agentCommand
  .command("start")
  .action(async () => {
    const token = getToken();

    if (!token) {
      console.log("Please login first");
      return;
    }

    let deviceId: number;

    try {
      const response = await fetch(
        "https://ending-morbidly-paradox.ngrok-free.dev/devices/register",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Failed to register device:", data.message);
        return;
      }

      deviceId = data.device.id;
      saveDeviceId(deviceId);

      console.log(`Device registered: ${data.device.name} (id: ${deviceId})`);

    } catch (error) {
      console.error("Could not connect to the DevRelay server.");
      return;
    }

    const socket = io("https://ending-morbidly-paradox.ngrok-free.dev", {
      auth: {
        token,
        deviceId
      }
    });

    socket.on("connect", () => {
      console.log("Agent connected. Sending heartbeat every 10s. Press Ctrl+C to stop.");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("command", (payload, callback) => {
      console.log(`\nReceived command: ${payload.command}`);
      
      exec(payload.command, (error, stdout, stderr) => {
        if (error) {
          callback({ output: stderr || error.message, status: "error" });
        } else {
          callback({ output: stdout, status: "success" });
        }
      });
    });

    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat");
    }, 10000);

    process.on("SIGINT", () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
      console.log("\nAgent stopped.");
      process.exit(0);
    });
  });
