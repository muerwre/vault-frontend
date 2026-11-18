import { createContext } from 'react';

/**
 * A backdrop supplied by whoever hosts the dialog, used when the dialog sets
 * none of its own. Lets related dialogs share one scene while switching.
 */
export const DialogBackdropContext = createContext<JSX.Element | undefined>(
  undefined,
);
