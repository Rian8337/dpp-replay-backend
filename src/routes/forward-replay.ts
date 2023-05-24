import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { ReadStream } from "fs";
import { Player } from "@rian8337/osu-droid-utilities";
import { Router } from "express";
import { sendReplay } from "../replaySender";
import { readFileStream } from "../replaySavingManager";

const router = Router();

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
        replayAnalyzer.originalODR = await readFileStream(fileStream);
        await replayAnalyzer.analyze();

        const { data } = replayAnalyzer;
        if (!data) {
            return;
        }

        const player = await Player.getInformation(data.playerName);
        if (!player) {
            return;
        }

        // Send the replay to the processing backend.
        await sendReplay(replayAnalyzer).catch(() => null);
    }
);

export default router;
