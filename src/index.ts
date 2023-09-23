import express from "express";
import cors from "cors";
import formData from "express-form-data";
import { config } from "dotenv";
import { createHash } from "crypto";
import { ReadStream } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

config();

const app = express();
const replayDirectory = join(
    homedir(),
    "..",
    "..",
    "data",
    "dpp-replays",
    "unprocessed"
);

app.set("trust proxy", 1);

app.use(cors());
app.use(formData.parse());
app.use(formData.format());
app.use(formData.stream());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post<
    "/forward-replay",
    unknown,
    unknown,
    { replayID: string; hash: string }
>("/forward-replay", (req, res) => {
    res.sendStatus(200);

    // @ts-expect-error: Bad typings
    if (Object.keys(req.files).length === 0) {
        return;
    }

    const replayId = parseInt(req.body.replayID);
    const fileHash = createHash("md5");

    // @ts-expect-error: Bad typings
    const fileStream: ReadStream = req.files.uploadedfile;
    const file: (string | Buffer)[] = [];

    fileStream
        .on("data", (chunk) => {
            fileHash.update(chunk);
            file.push(chunk);
        })
        .on("error", (err) =>
            console.error("Error when consuming replay stream:", err)
        )
        .on("end", async () => {
            const filename =
                (replayId > 0 ? `${replayId}_` : "") +
                `${fileHash.digest("hex")}.odr`;

            await mkdir(replayDirectory, { recursive: true })
                .then(() => writeFile(join(replayDirectory, filename), file))
                .catch((e) =>
                    console.error("Error when saving replay file:", e)
                );
        });
});

const port = parseInt(process.env.PORT || "3005");
app.listen(port, () => console.log("DPP replay backend is up"));
