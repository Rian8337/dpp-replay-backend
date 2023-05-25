import express from "express";
import cors from "cors";
import formData from "express-form-data";
import { startResendCycle } from "./replaySender";
import { config } from "dotenv";
import getLocalReplay from "./routes/get-local-replay";
import getOnlineReplay from "./routes/get-online-replay";
import forwardReplay from "./routes/forward-replay";
import persistLocalReplay from "./routes/persist-local-replay";
import persistOnlineReplay from "./routes/persist-online-replay";
import saveLocalReplay from "./routes/save-local-replay";

config();

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(formData.parse());
app.use(formData.format());
app.use(formData.stream());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/get-local-replay", getLocalReplay);
app.use("/get-online-replay", getOnlineReplay);
app.use("/forward-replay", forwardReplay);
app.use("/save-local-replay", saveLocalReplay);
app.use("/persist-local-replay", persistLocalReplay);
app.use("/persist-online-replay", persistOnlineReplay);

const port = parseInt(process.env.PORT || "3005");
app.listen(port, () => {
    console.log("DPP replay backend is up");

    startResendCycle();
});
