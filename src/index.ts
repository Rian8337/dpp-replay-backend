import express from "express";
import cors from "cors";
import formData from "express-form-data";
import { mkdirSync } from "fs";
import { startResendCycle } from "./replaySender";
import { replayDirectory } from "./replaySavingManager";
import { config } from "dotenv";
import getReplay from "./routes/get-replay";
import forwardReplay from "./routes/forward-replay";
import persistReplay from "./routes/persist-replay";

config();

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(formData.parse());
app.use(formData.format());
app.use(formData.stream());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/get-replay", getReplay);
app.use("/forward-replay", forwardReplay);
app.use("/persist-replay", persistReplay);

try {
    mkdirSync(replayDirectory);
} catch {}

const port = parseInt(process.env.PORT || "3005");
app.listen(port, () => {
    console.log("DPP replay backend is up");

    startResendCycle();
});
