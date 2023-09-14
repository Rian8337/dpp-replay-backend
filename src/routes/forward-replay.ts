import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { ReadStream } from "fs";
import { Router } from "express";
import { sendReplay } from "../replaySender";
import { readFileStream, saveReplay } from "../replaySavingManager";

const router = Router();

router.post<"/", unknown, unknown, { replayID: string; hash: string }>(
    "/",
    async (req, res) => {
        res.sendStatus(200);

        // @ts-expect-error: Bad typings
        if (Object.keys(req.files).length === 0) {
            return;
        }

        // @ts-expect-error: Bad typings
        const fileStream: ReadStream = req.files.uploadedfile;

        const replayAnalyzer = new ReplayAnalyzer({
            scoreID: parseInt(req.body.replayID),
        });
        replayAnalyzer.originalODR = await readFileStream(fileStream);
        await replayAnalyzer.analyze().catch(() => {});

        const filename = await saveReplay(replayAnalyzer);
        if (!filename) {
            return;
        }

        // Send the replay to the processing backend.
        await sendReplay(req.body.replayID, filename).catch(() => null);
    }
);

export default router;
