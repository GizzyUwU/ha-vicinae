import { useEffect, useState } from "react";
import {
  Action,
  ActionPanel,
  List,
  showToast,
  getPreferenceValues,
  LocalStorage,
} from "@vicinae/api";
import HA from "./lib/ha";
import * as HATypes from "./lib/ha.d";
import {
  type CurrentConnection,
  loadCurrentConnection,
} from "./lib/utils/wifi-helpers-nmcli";

export default function ListDetail() {
  const { server, token } = getPreferenceValues<{
    server: string;
    token: string;
  }>();

  const [currentConnection, setCurrentConnection] =
    useState<CurrentConnection | null>(null);

  const [savedNet, setSavedNet] =
    useState<{ networkName: string; homeIP: string } | null>(null);

  const [haClient, setHAClient] = useState<HA | null>(null);
  const [states, setStates] = useState<HATypes.GetStatesEndpoint>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const conn = await loadCurrentConnection();
        setCurrentConnection(conn);

        const networkName =
          (await LocalStorage.getItem("networkName")) ?? "";
        const homeIP = (await LocalStorage.getItem("homeIP")) ?? "";

        setSavedNet({
          networkName: String(networkName),
          homeIP: String(homeIP),
        });
      } catch (err) {
        showToast({
          title: "Failed to load network info",
          message: String(err),
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!currentConnection || !savedNet) return;
    let ip = server;
    if (
      currentConnection.name === savedNet.networkName &&
      savedNet.homeIP.length > 0
    ) {
      ip = savedNet.homeIP;
    }

    const client = new HA(ip, token);
    setHAClient(client);

    setIsLoading(true);
    client
      .getStates()
      .then((data) =>
        setStates(data as HATypes.GetStatesEndpoint),
      )
      .catch((err) =>
        showToast({
          title: "Failed to load states",
          message: String(err),
        }),
      )
      .finally(() => setIsLoading(false));
  }, [currentConnection, savedNet, server, token]);

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchBarPlaceholder="Search entities..."
    >
      <List.Section title="Entities">
        {states
          .filter((state) => {
            const domain = state.entity_id.split(".")[0];
            const allowed = [
              "light",
              "switch",
              "climate",
              "cover",
              "fan",
              "lock",
              "media_player",
              "script",
            ];
            return (
              allowed.includes(domain) &&
              state.state !== "unavailable"
            );
          })
          .map((state) => (
            <List.Item
              key={state.entity_id}
              title={
                state.attributes.friendly_name ??
                state.entity_id
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Toggle"
                    onAction={async () => {
                      if (!haClient) return;

                      const domain =
                        state.entity_id.split(".")[0];

                      await haClient.toggleItem(
                        domain,
                        state.entity_id,
                      );

                      const updated =
                        (await haClient.getStates(
                          state.entity_id,
                        )) as HATypes.GetStatesEntityEndpoint;

                      setStates((prev) =>
                        prev.map((s) =>
                          s.entity_id === updated.entity_id
                            ? updated
                            : s,
                        ),
                      );
                    }}
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  isLoading={isLoading}
                  markdown={`### ${
                    state.attributes.friendly_name ??
                    state.entity_id
                  }\n\n**State:** ${state.state}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {Object.entries(
                        state.attributes,
                      ).map(([k, v]) => (
                        <List.Item.Detail.Metadata.Label
                          key={k}
                          title={k}
                          text={String(v)}
                        />
                      ))}
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
