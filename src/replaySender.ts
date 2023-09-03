/**
 * Instructs the processing backend to process a replay.
 *
 * @param replayId The ID of the replay.
 * @param filename The name of the replay file.
 * @returns Whether the request was successful.
 */
export function sendReplay(
    replayId: string,
    filename: string
): Promise<boolean> {
    const formData = new FormData();
    formData.append("replayId", replayId);
    formData.append("key", process.env.DROID_SERVER_INTERNAL_KEY!);
    formData.append("filename", filename);

    return fetch("http://127.0.0.1:3006/api/dpp/processor/forward-replay", {
        method: "POST",
        body: formData,
    })
        .then((res) => res.status === 200)
        .catch(() => false);
}
