import { FlowDisplayVariant, INode } from "~/types";

export const URLS = {
  BASE: "/",
  LAB: "/lab",
  BORIS: "/boris",
  AUTH: {
    LOGIN: "/auth/login",
  },
  EXAMPLES: {
    EDITOR: "/examples/edit",
    IMAGE: "/examples/image",
  },
  ERRORS: {
    NOT_FOUND: "/lost",
    BACKEND_DOWN: "/oopsie",
  },
  NODE_URL: (id: INode["id"] | string) => `/post${id}`,
  PROFILE_PAGE: (username: string) => `/profile/${username}`,
  SETTINGS: {
    BASE: "/settings",
    NOTES: "/settings/notes",
    TRASH: "/settings/trash",
  },
  NOTES: "/notes/",
  NOTE: (id: number) => `/notes/${id}`,
};

export const ImagePresets = {
  "1600": "1600",
  "600": "600",
  "300": "300",
  cover: "cover",
  small_hero: "small_hero",
  avatar: "avatar",
  flow_square: "flow_square",
  flow_vertical: "flow_vertical",
  flow_horizontal: "flow_horizontal",
} as const;

export const flowDisplayToPreset: Record<
  FlowDisplayVariant,
  typeof ImagePresets[keyof typeof ImagePresets]
> = {
  single: "flow_square",
  quadro: "flow_square",
  vertical: "flow_vertical",
  horizontal: "flow_horizontal",
};
