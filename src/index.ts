import express from "express";
import cors from "cors";
import formData from "express-form-data";
import { ReadStream, mkdirSync } from "fs";
import { sendReplay, startResendCycle } from "./replaySender";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { replayDirectory, saveReplay } from "./replaySavingManager";
import { Player } from "@rian8337/osu-droid-utilities";
import { config } from "dotenv";

config();

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(formData.parse());
app.use(formData.format());
app.use(formData.stream());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function readFile(stream: ReadStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

try {
    mkdirSync(replayDirectory);
} catch {}

app.post<
    "/forward-replay",
    unknown,
    unknown,
    { replayID: string; hash: string }
>("/forward-replay", async (req, res) => {
    res.send("Success");

    // @ts-expect-error: Bad typings
    if (Object.keys(req.files).length === 0) {
        return;
    }

    // @ts-expect-error: Bad typings
    const fileStream: ReadStream = req.files.uploadedfile;

    const replayAnalyzer = new ReplayAnalyzer({
        scoreID: parseInt(req.body.replayID),
    });
    replayAnalyzer.originalODR = await readFile(fileStream);
    await replayAnalyzer.analyze();

    const { data } = replayAnalyzer;
    if (!data) {
        return;
    }

    const player = await Player.getInformation(data.playerName);
    if (!player) {
        return;
    }

    // Save replay file to disk.
    const replayFilename = await saveReplay(player.uid, replayAnalyzer);
    if (!replayFilename) {
        return;
    }

    // Send the replay to the processing backend.
    // sendReplay(replayFilename, replayAnalyzer);
});

const port = parseInt(process.env.PORT || "3005");

startResendCycle();

app.listen(port, () => console.log("Up"));
