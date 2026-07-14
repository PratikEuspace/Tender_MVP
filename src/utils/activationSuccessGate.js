/**
 * Transient one-shot flag for the post-activation success card.
 * In-memory only — never persisted. Survives only until Continue or process death.
 */

let pending = false;
/** ISO timestamp when activation succeeded on this device (start-date fallback). */
let activatedAtIso = null;

export const markActivationSuccessPending = () => {
  pending = true;
  activatedAtIso = new Date().toISOString();
};

export const isActivationSuccessPending = () => pending;

export const getActivationSuccessActivatedAt = () => activatedAtIso;

export const clearActivationSuccessPending = () => {
  pending = false;
  activatedAtIso = null;
};
