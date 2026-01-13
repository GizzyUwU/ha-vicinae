import {
  Action,
  ActionPanel,
  List,
  useNavigation,
  Cache,
  getPreferenceValues,
} from "@vicinae/api";
import NMCLI from "./components/config/nmcli";

export default function ListDetail() {
  const { networktool } = getPreferenceValues();
  const { push } = useNavigation();
  return (
    <List isShowingDetail searchBarPlaceholder="Search for options...">
      <List.Section title="Configuration">
        <List.Item
          key="internal-network"
          title="Configure a internal network"
          actions={
            <ActionPanel>
              <Action
                title="Enter"
                onAction={() => {
                  switch (networktool) {
                    case "nmcli":
                      return push(<NMCLI />);
                  }
                }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
