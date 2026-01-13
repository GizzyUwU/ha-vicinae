import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  LocalStorage,
  useNavigation,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import { executeNmcliCommandSilent } from "../../lib/utils/execute-nmcli";
import { type SavedNetwork } from "../../lib/utils/wifi-helpers-nmcli";
import INIP from "./inIPForm";

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

export default function ManageSavedNetworksNmcli() {
  const { push } = useNavigation();
  const [savedNetworks, setSavedNetworks] = useState<SavedNetworksResult>({
    networks: [],
    isLoading: true,
    error: null,
  });

  const getNetworkName = async () => {
    return await LocalStorage.getItem("networkName");
  }

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
      const cachedNetwork = await LocalStorage.getItem("networkName");
      const sorted = [...networks].sort((a, b) => {
        if (a.name === cachedNetwork && b.name !== cachedNetwork) return -1;
        if (b.name === cachedNetwork && a.name !== cachedNetwork) return 1;
        return 0;
      });
      setSavedNetworks({
        networks: sorted,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setSavedNetworks({
        networks: [],
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const getStateIcon = (network: SavedNetwork) => {
    const storedNetwork = getNetworkName();
    if (network.name === String(storedNetwork)) {
      return Icon.CheckCircle;
    } else {
      return Icon.Circle;
    }
  };

  const getStateColor = (network: SavedNetwork) => {
    const storedNetwork = getNetworkName()
    if (network.name === String(storedNetwork)) {
      return Color.Green;
    } else {
      return Color.SecondaryText;
    }
  };

  useEffect(() => {
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
              <Action
                title="Retry"
                icon={Icon.ArrowClockwise}
                onAction={loadSavedNetworks}
              />
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
    <List
      searchBarPlaceholder="Search for a networks..."
      isShowingDetail={true}
    >
      <List.Section
        title={`Choose a network - ${savedNetworks.networks.length}`}
      >
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
                    <List.Item.Detail.Metadata.Label
                      title="Type"
                      text={network.type}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Device"
                      text={network.device || "No device"}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="State"
                      text={network.state}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="UUID"
                      text={network.uuid}
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action
                  title="Use this network"
                  icon={Icon.Wifi}
                  onAction={async () => {
                    await LocalStorage.setItem("networkName", network.name)
                    return push(<INIP />);
                  }}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={() => {
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
