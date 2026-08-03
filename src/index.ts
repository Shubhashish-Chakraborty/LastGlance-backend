import express from "express";
import { PORT } from "./config";
import { userRouter } from "./routes/userRoutes";
import { mediaRouter } from "./routes/mediaRoutes";
import prisma from "./db/prisma";
import { getEnvKeys } from "./utils/fetchEnvSample";

const app = express();
const requiredKeys = getEnvKeys();

app.use(express.json());

app.use("/auth/user", userRouter);
app.use("/notes", mediaRouter);

app.get("/", (req, res) => {
  res.send("The Last Glance App's Server is UP!!!");
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
      }
    });
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
})

// with checks if any env variable is missing:
requiredKeys.forEach((k) => {
  if (!process.env[k]) {
    console.error(`Missing required environment variable: ${k}`);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Backend is up: http://localhost:${PORT}`);
})