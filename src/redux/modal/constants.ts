import { ValueOf } from "~/redux/types";
import { HorizontalExample } from "~/containers/examples/HorizontalExample";
import { ExampleDialog } from "~/containers/dialogs/ExampleDialog";

export const MODAL_ACTIONS = {
  SET_SHOWN: "MODAL.SET_SHOWN",
  SET_DIALOG: "SET_DIALOG",
  SHOW_DIALOG: "SHOW_DIALOG"
};

export const DIALOGS = {
  TEST: "TEST"
};

export const DIALOG_CONTENT = {
  [DIALOGS.TEST]: ExampleDialog
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
