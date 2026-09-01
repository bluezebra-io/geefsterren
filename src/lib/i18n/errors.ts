import 'server-only';

import { getMessages } from './locale';
import type { Messages } from './messages/en';

/**
 * Translated failure messages for Server Actions.
 *
 * Action error strings used to be English literals, so a Dutch operator got
 * "Could not create this campaign" — a sentence that is both in the wrong language
 * and says nothing they can act on. Actions run on the server with the request's
 * cookies available, so the catalogue is simply read here.
 */
export async function actionErrors(): Promise<Messages['errors']> {
  return (await getMessages()).errors;
}
