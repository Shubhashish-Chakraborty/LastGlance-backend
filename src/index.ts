import express from "express";
import { PORT } from "./config";
import { userRouter } from "./routes/userRoutes";
import prisma from "./db/prisma";

const app = express();

app.use(express.json());

app.use("/auth/user", userRouter);

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
if (!PORT) {
  console.log("SOME ENVIRONMENT VARIABLE IS MISSING!");
} else {
  app.listen(PORT, () => {
    console.log(`Backend is up: http://localhost:${PORT}`);
  })
}