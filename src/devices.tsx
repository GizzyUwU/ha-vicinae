import { useEffect, useState } from "react";
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  getPreferenceValues,
} from "@vicinae/api";
import HA from "./lib/ha";
import * as HATypes from "./lib/ha.d";

export default function ListDetail() {
  const { server, token } = getPreferenceValues<{
    server: string;
    token: string;
  }>();

  function useHAStates(server: string, token: string) {
    const [states, setStates] = useState<HATypes.GetStatesEndpoint>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [haClient, setHA] = useState<HA | null>(null);

    if (!haClient) {
      const client = new HA(server, token);
      setHA(client);

      client
        .getStates()
        .then((data) => setStates(data as HATypes.GetStatesEndpoint))
        .catch((err) =>
          showToast({ title: "Failed to load states", message: String(err) }),
        )
        .finally(() => setIsLoading(false));
    }

    return { states, isLoading, haClient, setStates };
  }

  const { states, isLoading, haClient, setStates } = useHAStates(server, token);

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
            const deviceDomains = [
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
              deviceDomains.includes(domain) && state.state !== "unavailable"
            );
          })
          .map((state) => (
            <List.Item
              key={state.entity_id}
              title={state.attributes.friendly_name || state.entity_id}
              actions={
                <ActionPanel>
                  <Action
                    title="Toggle"
                    onAction={async () => {
                      if (!haClient) return;
                      const domain = state.entity_id.split(".")[0];
                      await haClient.toggleItem(domain, state.entity_id);
                      const updated = (await haClient.getStates(
                        state.entity_id,
                      )) as HATypes.GetStatesEntityEndpoint;

                      setStates((prev) => {
                        return prev.map((s) =>
                          s.entity_id === updated.entity_id ? updated : s,
                        );
                      });
                    }}
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  isLoading={isLoading}
                  markdown={`### ${state.attributes.friendly_name || state.entity_id}\n\n**State:** ${state.state}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {Object.entries(state.attributes).map(([key, value]) => (
                        <List.Item.Detail.Metadata.Label
                          key={key}
                          title={key}
                          text={String(value)}
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
