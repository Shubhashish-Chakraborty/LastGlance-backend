import express from "express";
import { PORT } from "./config";

const app = express();

app.get("/" , (req, res) => {
    res.send("The Last Glance App's Server is UP!!!");
})

// with checks if any env variable is missing:
if (!PORT) {
    console.log("SOME ENVIRONMENT VARIABLE IS MISSING!");
} else {
    app.listen(PORT,() => {
        console.log(`Backend is up: http://localhost:${PORT}`);
    })
}