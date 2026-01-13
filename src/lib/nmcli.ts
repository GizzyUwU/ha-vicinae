import { executeNmcliCommandSilent } from "./utils/execute-nmcli";

export interface SavedNetwork {
  name: string;
  uuid: string;
  type: string;
  device: string;
  state: string;
}

function parseSavedConnections(output: string): SavedNetwork[] {
  const lines = output.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  return lines
    .slice(1)
    .map((line) => {
      const parts = line.split(/\s{2,}/);
      if (parts.length < 4) return null;
      return {
        name: parts[0] || "",
        uuid: parts[1] || "",
        type: parts[2] || "",
        device: parts[3] || "",
        state: parts[4] || "",
      };
    })
    .filter(Boolean) as SavedNetwork[];
}

export async function getSavedNetworks(): Promise<SavedNetwork[]> {
  const result = await executeNmcliCommandSilent("connection show");

  if (!result.success) {
    throw new Error(result.error || "Failed to load saved networks");
  }

  return parseSavedConnections(result.stdout);
}
