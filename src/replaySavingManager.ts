import { IModApplicableToDroid, Mod } from "@rian8337/osu-base";
import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { ReadStream } from "fs";
import { readFile, copyFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

const mainDirectory = join(homedir(), "..", "..");

/**
 * The directory of local replays.
 */
export const localReplayDirectory = join(mainDirectory, "data", "dpp-replays");

/**
 * The directory of online replays.
 */
export const onlineReplayDirectory = join(
    mainDirectory,
    "DroidData",
    "osudroid",
    "zip",
    "upload"
);

/**
 * Saves a replay to the disk.
 *
 * @param playerId The ID of the player.
 * @param replayFile The replay file.
 * @returns The name the replay file was saved in if the operation is successful, `null` otherwise.
 */
export async function saveReplay(
    playerId: number,
    replayAnalyzer: ReplayAnalyzer
): Promise<string | null> {
    const { originalODR, data } = replayAnalyzer;
    if (!originalODR || !data) {
        return null;
    }

    // Rename incremental IDs
    let filePath = generateReplayFilePath(
        playerId,
        data.hash,
        data.convertedMods,
        data.speedModification,
        data.forcedAR
    );

    for (let i = 4; i > 0; --i) {
        const name = join(localReplayDirectory, filePath);
        const file = await readFile(name + "_" + i + ".odr").catch(() => null);

        if (!file) {
            continue;
        }

        await copyFile(name + "_" + i + ".odr", name + "_" + (i + 1) + ".odr");
    }

    filePath += "_1.odr";
    return writeFile(join(localReplayDirectory, filePath), originalODR)
        .then(() => filePath.split("/").at(-1)!)
        .catch(() => null);
}

/**
 * Generates a path for a replay.
 *
 * @param playerId The ID of the player.
 * @param mapMD5 The MD5 hash of the beatmap.
 * @param mods The mods of the replay, either in array of mods or droid string.
 * @param speedModification The speed modification used in the replay.
 * @param forcedAR The force AR value used in the replay.
 * @returns The path to the replay file, without the `.odr` extension.
 */
export function generateReplayFilePath(
    playerId: number,
    mapMD5: string,
    mods: (Mod & IModApplicableToDroid)[],
    speedModification: number = 1,
    forcedAR?: number
) {
    let filePath = join(
        playerId.toString(),
        mapMD5,
        `${mods.reduce((a, v) => a + v.droidString, "") || "-"}`
    );

    if (speedModification !== 1) {
        filePath += `_${speedModification}x`;
    }

    if (forcedAR !== undefined) {
        filePath += `_AR${forcedAR}`;
    }

    return filePath;
}

/**
 * Persists a local replay file.
 *
 * This removes the incremental IDs in the replay file name
 * and appends it with `_persisted.odr`.
 *
 * @param replayFilename The name of the replay file.
 * @returns Whether the operation was successful.
 */
export async function persistLocalReplay(
    replayFilename: string
): Promise<boolean> {
    const filenameSections = replayFilename.split("_");
    filenameSections.pop();
    filenameSections.push("persisted.odr");

    return copyFile(
        join(localReplayDirectory, replayFilename),
        join(localReplayDirectory, filenameSections.join("_"))
    )
        .then(() => true)
        .catch(() => false);
}

/**
 * Persists an online replay file.
 *
 * @param playerId The ID of the player.
 * @param scoreId The ID of the score.
 */
export async function persistOnlineReplay(
    playerId: number,
    scoreId: number
): Promise<boolean> {
    const onlineReplayPath = join(onlineReplayDirectory, `${scoreId}.odr`);
    const analyzer = new ReplayAnalyzer({ scoreID: scoreId });
    analyzer.originalODR = await readFile(onlineReplayPath).catch(() => null);

    if (!analyzer.originalODR) {
        return false;
    }

    await analyzer.analyze();
    const { data } = analyzer;
    if (!data) {
        return false;
    }

    const filePath =
        generateReplayFilePath(
            playerId,
            data.hash,
            data.convertedMods,
            data.speedModification,
            data.forcedAR
        ) + "_persisted.odr";

    return writeFile(join(localReplayDirectory, filePath), analyzer.originalODR)
        .then(() => true)
        .catch(() => false);
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
