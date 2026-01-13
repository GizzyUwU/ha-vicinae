import { Action, ActionPanel, Color, Icon, List, showToast, Cache } from "@vicinae/api";
import { useEffect, useState } from "react";
import { executeNmcliCommand, executeNmcliCommandSilent } from "../../lib/utils/execute-nmcli";
import {
  type CurrentConnection,
  loadCurrentConnection,
  loadWifiDevice,
  parseWifiList,
  type SavedNetwork,
  type WifiDevice,
} from "../../lib/utils/wifi-helpers-nmcli";

interface SavedNetworksResult {
  networks: SavedNetwork[];
  isLoading: boolean;
  error: string | null;
}

function parseSavedConnections(output: string): SavedNetwork[] {
  const lines = output.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

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

export default function ManageSavedNetworksNmcli({ cache }: {
    cache: Cache
}) {
  const [savedNetworks, setSavedNetworks] = useState<SavedNetworksResult>({
    networks: [],
    isLoading: true,
    error: null,
  });
  const [currentConnection, setCurrentConnection] = useState<CurrentConnection | null>(null);
  const [wifiDevice, setWifiDevice] = useState<WifiDevice | null>(null);
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);

  const loadWifiDeviceData = async () => {
    const device = await loadWifiDevice();
    setWifiDevice(device);
  };

  const loadCurrentConnectionData = async () => {
    const connection = await loadCurrentConnection();
    setCurrentConnection(connection);
  };

  const loadAvailableNetworks = async () => {
    try {
      const result = await executeNmcliCommandSilent("device wifi list --rescan yes");
      if (result.success) {
        const networks = parseWifiList(result.stdout);
        const ssids = networks.map((network) => network.ssid).filter((ssid) => ssid);
        setAvailableNetworks(ssids);
      }
    } catch (error) {
      console.error("Failed to load available networks:", error);
    }
  };

  const loadSavedNetworks = async () => {
    try {
      setSavedNetworks((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await executeNmcliCommandSilent("connection show");

      if (!result.success) {
        setSavedNetworks((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Failed to load saved networks",
        }));
        return;
      }

      const networks = parseSavedConnections(result.stdout);

      setSavedNetworks({
        networks,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setSavedNetworks({
        networks: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const getStateIcon = (network: SavedNetwork) => {
    const isConnected = currentConnection?.name === network.name;
    if (isConnected) {
      return Icon.CheckCircle;
    }
    switch (network.state.toLowerCase()) {
      case "activated":
        return Icon.CheckCircle;
      case "activating":
        return Icon.Clock;
      default:
        return Icon.Circle;
    }
  };

  const getStateColor = (network: SavedNetwork) => {
    const isConnected = currentConnection?.name === network.name;
    if (isConnected) {
      return Color.Green;
    }
    switch (network.state.toLowerCase()) {
      case "activated":
        return Color.Green;
      case "activating":
        return Color.Orange;
      default:
        return Color.SecondaryText;
    }
  };

  useEffect(() => {
    loadWifiDeviceData();
    loadCurrentConnectionData();
    loadAvailableNetworks();
    loadSavedNetworks();
  }, []);

  if (savedNetworks.isLoading) {
    return (
      <List searchBarPlaceholder="Loading saved networks...">
        <List.EmptyView
          title="Loading Saved Networks"
          description="Please wait while we load your saved Wi-Fi networks..."
          icon={Icon.Clock}
        />
      </List>
    );
  }

  if (savedNetworks.error) {
    return (
      <List searchBarPlaceholder="Search saved networks...">
        <List.EmptyView
          title="Failed to Load Networks"
          description={savedNetworks.error}
          icon={Icon.Exclamationmark}
          actions={
            <ActionPanel>
              <Action title="Retry" icon={Icon.ArrowClockwise} onAction={loadSavedNetworks} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (savedNetworks.networks.length === 0) {
    return (
      <List searchBarPlaceholder="Search saved networks...">
        <List.EmptyView
          title="No Saved Networks"
          description="No saved Wi-Fi networks found. Connect to a network first to save it."
          icon={Icon.Wifi}
        />
      </List>
    );
  }

  return (
    <List searchBarPlaceholder="Search networks..." isShowingDetail={true}>
      <List.Section title={`Choose a network - ${savedNetworks.networks.length}`}>
        {savedNetworks.networks.map((network) => (
          <List.Item
            key={network.uuid}
            title={network.name}
            icon={{
              source: getStateIcon(network),
              tintColor: getStateColor(network),
            }}
            detail={
              <List.Item.Detail
                markdown={`# ${network.name}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Type" text={network.type} />
                    <List.Item.Detail.Metadata.Label
                      title="Device"
                      text={network.device || "No device"}
                    />
                    <List.Item.Detail.Metadata.Label title="State" text={network.state} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="UUID" text={network.uuid} />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action
                  title="Use this network"
                  icon={Icon.Wifi}
                  onAction={() => cache.set("network", network.name)}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={() => {
                    loadWifiDeviceData();
                    loadCurrentConnectionData();
                    loadAvailableNetworks();
                    loadSavedNetworks();
                  }}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}