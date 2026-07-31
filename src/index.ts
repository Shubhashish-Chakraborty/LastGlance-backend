import express from "express";
import { PORT } from "./config";
import { userRouter } from "./routes/userRoutes";

const app = express();

app.use(express.json());

app.use("/auth/user" , userRouter);

app.get("/" , (req, res) => {
    res.send("The Last Glance App's Server is UP!!!");
});

// with checks if any env variable is missing:
if (!PORT) {
    console.log("SOME ENVIRONMENT VARIABLE IS MISSING!");
} else {
    app.listen(PORT,() => {
        console.log(`Backend is up: http://localhost:${PORT}`);
    })
}