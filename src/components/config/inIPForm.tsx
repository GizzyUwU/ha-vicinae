import {
  Action,
  ActionPanel,
  useNavigation,
  Cache,
  Form,
  showToast,
  Toast
} from "@vicinae/api";
import Config from "../../config"
export default function ListDetail() {
  const { push } = useNavigation();
  const cache = new Cache();
  return (
    <Form actions={
      <ActionPanel>
        <Action.SubmitForm title="Submit" onSubmit={async (value) => {
          const { ip } = value;
          await showToast({ title: 'Please provide the Home Assistant IP', style: Toast.Style.Failure });
          if(!ip) return;
          cache.set("inIP", String(ip))
          await showToast({ title: 'Internal Network configured.' });
          return push(<Config />)
        }}/>
      </ActionPanel>
    }>
      <Form.TextField
        id="ip"
        title="Home Assistant IP"
      ></Form.TextField>
    </Form>
  );
}
