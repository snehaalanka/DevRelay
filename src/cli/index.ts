#!/usr/bin/env node
import { Command } from "commander";
import { input, password } from "@inquirer/prompts";
import { saveToken, getToken, deleteToken, deleteDeviceId } from "./utils/auth.js";
import { agentCommand } from "./commands/agent.js";

const program = new Command();

program
  .name("devrelay")
  .description("Terminal-based remote developer collaboration tool")
  .version("1.0.0");

program
  .command("register")
  .description("Create a new DevRelay account")
  .action(async () => {
    const username = await input({
      message: "Username:"
    });

    const email = await input({
      message: "Email:"
    });

    const userPassword = await password({
      message: "Password:",
      mask: "*"
    });

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password: userPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Registration failed:", data.message);
        return;
      }

      console.log("✓", data.message);
      console.log(`Welcome, ${data.user.username}!`);

    } catch (error) {
      console.error("Actual error:", error);
    }
  });

program
  .command("login")
  .description("Log in to your DevRelay account")
  .action(async () => {
    const email = await input({
      message: "Email:"
    });

    const userPassword = await password({
      message: "Password:",
      mask: "*"
    });

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password: userPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Login failed:", data.message);
        return;
      }

      saveToken(data.token);
      console.log("✓ Login successful");
      console.log("You are now logged in.");

    } catch (error) {
      console.error("Actual error:", error);
    }
  });

program
  .command("whoami")
  .description("Show the currently logged-in user")
  .action(async () => {
    const token = getToken();

    if (!token) {
      console.log("You are not logged in.");
      return;
    }

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      console.log(`Username: ${data.username}`);
      console.log(`Email: ${data.email}`);

    } catch (error) {
      console.log("Could not connect to the DevRelay server.");
    }
  });
program
  .command("devices")
  .description("List your registered devices")
  .action(async () => {
    const token = getToken();

    if (!token) {
      console.log("You are not logged in.");
      return;
    }

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/devices", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      if (data.devices.length === 0) {
        console.log("No devices registered yet.");
        return;
      }

      console.log("ID   NAME                              STATUS");
      for (const device of data.devices) {
        console.log(
          `${String(device.id).padEnd(4)} ${device.name.padEnd(33)} ${device.status}`
        );
      }

    } catch (error) {
      console.log("Could not connect to the DevRelay server.");
    }
  });

program
  .command("run <deviceName> [command...]")
  .description("Run a command on a remote device")
  .action(async (deviceName: string, commandArgs: string[]) => {
    const token = getToken();

    if (!token) {
      console.log("You are not logged in.");
      return;
    }

    if (!commandArgs || commandArgs.length === 0) {
      console.log("Please provide a command to run.");
      return;
    }

    const command = commandArgs.join(" ");
    console.log(`Running command on ${deviceName}...`);

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceName,
          command
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(`Execution failed: ${data.message}`);
        if (data.error) console.log(data.error);
        return;
      }

      console.log();
      if (data.output) {
        console.log(data.output);
      }
      if (data.status === "error") {
        console.log(`[Status: Error]`);
      }

    } catch (error) {
      console.log("Could not connect to the DevRelay server.");
    }
  });

program
  .command("logout")
  .description("Log out of your DevRelay account")
  .action(() => {
    deleteToken();
    deleteDeviceId();
    console.log("✓ Logged out successfully");
  });

program
  .command("grant <email> <deviceId> <command>")
  .description("Grant a user permission to run a command on a device")
  .action(async (email: string, deviceId: string, command: string) => {
    const token = getToken();
    if (!token) return console.log("You are not logged in.");

    try {
      const response = await fetch("https://ending-morbidly-paradox.ngrok-free.dev/permissions/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, deviceId, permission: command })
      });
      const data = await response.json();
      if (!response.ok) return console.log(`Error: ${data.message}`);
      console.log(`✓ ${data.message}`);
    } catch (error) {
      console.log("Could not connect to the DevRelay server.");
    }
  });

program
  .command("logs <deviceId>")
  .description("View the execution logs for a device")
  .action(async (deviceId: string) => {
    const token = getToken();
    if (!token) return console.log("You are not logged in.");

    try {
      const response = await fetch(`https://ending-morbidly-paradox.ngrok-free.dev/devices/${deviceId}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) return console.log(`Error: ${data.message}`);
      
      if (data.logs.length === 0) {
        return console.log("No logs found for this device.");
      }

      console.log("TIME                 USER       STATUS    COMMAND");
      for (const log of data.logs) {
        const time = new Date(log.executedAt).toLocaleString();
        const user = log.user?.username || "Unknown";
        console.log(`${time.padEnd(20)} ${user.padEnd(10)} ${log.status.padEnd(9)} ${log.command}`);
      }
    } catch (error) {
      console.log("Could not connect to the DevRelay server.");
    }
  });

program.addCommand(agentCommand);
program.parse();