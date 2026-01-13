import {
  Action,
  ActionPanel,
  List,
  useNavigation,
  Cache,
  getPreferenceValues,
} from "@vicinae/api";
import NMCLI from "./components/config/nmcli";
import INIPForm from "./components/config/inIPForm"

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
                      return push(<INIPForm />);
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
