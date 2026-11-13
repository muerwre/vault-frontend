export enum SidebarName {
  Settings = 'settings',
  Tag = 'tag',
}

/**
 * Wide enough for sidebar stack cards to sit beside the menu instead of
 * covering it. Mirrors the `sidebar_stack_limit` mixin.
 */
export const SIDEBAR_STACK_SIDE_BY_SIDE_QUERY = '(min-width: 1001px)';
