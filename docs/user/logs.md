# Logs

## What It Does

BLXVoice keeps diagnostic logs locally so crashes and recording problems can be investigated without sending audio or transcription data to a cloud service. Logs are shown in the in-app Logs page and are also written to a plain-text `blxvoice.log` file in the app data directory.

## How to Use It

1. Open the full app window.
2. Go to **Logs** to review recent entries or export them as JSON.
3. For crash reports, attach the plain-text log file from the app data directory:
   - Windows: `%APPDATA%\com.bitslix.blxvoice\blxvoice.log`
   - macOS: `~/Library/Application Support/com.bitslix.blxvoice/blxvoice.log`
   - Linux: `~/.local/share/com.bitslix.blxvoice/blxvoice.log`
4. Use Settings to disable app logging or clear stored log entries when needed.

## Related

- [Recording](recording.md)
- [Developer: MS-10 Polish](../dev/ms10-polish.md)
