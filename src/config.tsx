import {
  Action,
  ActionPanel,
  List,
  useNavigation,
  Cache
} from "@vicinae/api";
import Nmcli from "./components/config/networks"; // Capital N

export default function ListDetail() {
  const { push, pop } = useNavigation();
  const cache = new Cache()
  return (
    <List isShowingDetail searchBarPlaceholder="Search for options...">
      <List.Section title="Configuration">
        <List.Item
          key="home-network"
          title="Set a Home Network"
          actions={
            <ActionPanel>
              <Action
                title="Enter"
                onAction={() => push(<Nmcli cache={cache} />)}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
