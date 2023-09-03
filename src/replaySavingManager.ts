import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { ReadStream } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

/**
 * The directory of replays that are unprocessed by the processor backend.
 */
const replayDirectory = join(
    homedir(),
    "..",
    "..",
    "data",
    "dpp-replays",
    "unprocessed"
);

/**
 * Saves a replay to the unprocessed replay folder.
 *
 * @param replay The replay.
 * @returns The name of the replay file if it was saved successfully, `null` otherwise.
 */
export function saveReplay(replay: ReplayAnalyzer): Promise<string | null> {
    const { originalODR, data } = replay;

    if (!originalODR || !data) {
        return Promise.resolve(null);
    }

    const filename = `${data.playerName}_${data.hash}_${Date.now()}.odr`;

    return mkdir(replayDirectory, { recursive: true })
        .then(() => writeFile(join(replayDirectory, filename), originalODR))
        .then(() => filename)
        .catch(() => null);
}

/**
 * Reads a file stream and returns it as a buffer.
 *
 * @param stream The stream to read.
 * @returns The buffer represented by the read stream.
 */
export function readFileStream(stream: ReadStream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}
