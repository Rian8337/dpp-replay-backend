import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { ReadStream } from "fs";
import { saveReplay } from "../replaySavingManager";
import { Player } from "@rian8337/osu-droid-utilities";
import { Router } from "express";
import { sendReplay } from "../replaySender";

const router = Router();

function readFile(stream: ReadStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

router.post<"/", unknown, unknown, { replayID: string; hash: string }>(
    "/",
    async (req, res) => {
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
        await sendReplay(replayFilename, replayAnalyzer);
    }
);

export default router;
