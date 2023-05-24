import { Router } from "express";
import { ReadStream } from "fs";
import { readFileStream, saveReplay } from "../replaySavingManager";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

const router = Router();

router.post<"/", unknown, unknown, { playerid: string }>(
    "/",
    async (req, res) => {
        // @ts-expect-error: Bad typings
        if (Object.keys(req.files).length === 0) {
            return;
        }

        // @ts-expect-error: Bad typings
        const fileStream: ReadStream = req.files.replayfile;
        const replayAnalyzer = new ReplayAnalyzer({
            scoreID: 0,
        });
        replayAnalyzer.originalODR = await readFileStream(fileStream);
        await replayAnalyzer.analyze();

        const filename = await saveReplay(
            parseInt(req.body.playerid),
            replayAnalyzer
        );

        if (!filename) {
            return res
                .status(500)
                .send({ error: "Unable to save replay file" });
        }

        res.send(filename);
    }
);

export default router;
