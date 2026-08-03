// Route names + helpers for the Works tab stack (list + nested workflow).

export const WORKS_ROUTES = {
  LIST: 'WorksList',
  WORKFLOW: 'Workflow',
};

/**
 * Open the workflow navigator at the Add Work hub with a fresh child stack.
 * Avoids reopening a stale nested step from a previous session.
 */
export const openWorkflowHubParams = (addWorkRouteName) => ({
  state: {
    routes: [{ name: addWorkRouteName }],
    index: 0,
  },
});
