import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

/**
 * A map that contains replays that failed to submit to the processing backend, mapped by their filename.
 */
export const failedReplaySubmissions = new Map<string, ReplayAnalyzer>();

/**
 * Starts the interval to resend failed replay submissions.
 */
export function startResendCycle() {
    setInterval(async () => {
        for (const [replayFilename, replay] of failedReplaySubmissions) {
            if (await sendReplay(replayFilename, replay)) {
                failedReplaySubmissions.delete(replayFilename);
            }
        }
    }, 60 * 5 * 1000);
}

/**
 * Sends a replay to the processing backend.
 *
 * @param filename The name of the replay file.
 * @param replay The replay to be sent.
 * @returns Whether the request was successful.
 */
export async function sendReplay(
    filename: string,
    replay: ReplayAnalyzer
): Promise<boolean> {
    if (!replay.originalODR) {
        return false;
    }

    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("replayID", replay.scoreID.toString());
    formData.append("replayfile", new Blob([replay.originalODR]), filename);

    const success = await fetch("http://127.0.0.1:3006/forward-replay", {
        method: "POST",
        body: formData,
    })
        .then(() => true)
        .catch(() => false);

    if (!success) {
        failedReplaySubmissions.set(filename, replay);
    }

    return success;
}
