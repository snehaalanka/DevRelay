async function main() {
  try {
    const email = "dummy_" + Date.now() + "@test.com";

    // 1. Register a dummy user
    console.log("Registering dummy user...");
    const regRes = await fetch("https://devrelay-if0z.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "dummy_test",
        email: email,
        password: "password123"
      })
    });
    
    if (!regRes.ok) {
      console.log("Registration failed:", await regRes.text());
      return;
    }
    
    // 2. Login
    console.log("Logging in...");
    const loginRes = await fetch("https://devrelay-if0z.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: "password123"
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // 3. Hit /devices/register
    console.log("Hitting /devices/register...");
    const devRes = await fetch("https://devrelay-if0z.onrender.com/devices/register", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "ngrok-skip-browser-warning": "true"
      }
    });
    
    const devData = await devRes.json();
    console.log("\n--- EXACT RENDER ERROR ---");
    console.log(JSON.stringify(devData, null, 2));
    
  } catch (err) {
    console.error("Script failed:", err);
  }
}

main();
