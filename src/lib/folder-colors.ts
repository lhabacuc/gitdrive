import { FolderColorName } from "@/types";

export interface FolderColorPalette {
  shadow: string;
  back: string;
  front: string;
  highlight: string;
}

export const FOLDER_COLOR_PALETTES: Record<FolderColorName, FolderColorPalette> = {
  blue: {
    shadow: "#1a5fb4",
    back: "#3584e4",
    front: "#62a0ea",
    highlight: "#99c1f1",
  },
  green: {
    shadow: "#26a269",
    back: "#33d17a",
    front: "#57e389",
    highlight: "#8ff0a4",
  },
  red: {
    shadow: "#a51d2d",
    back: "#e01b24",
    front: "#ed333b",
    highlight: "#f66151",
  },
  orange: {
    shadow: "#c64600",
    back: "#e66100",
    front: "#ff7800",
    highlight: "#ffa348",
  },
  yellow: {
    shadow: "#ae7b03",
    back: "#e5a50a",
    front: "#f6d32d",
    highlight: "#f9e45b",
  },
  purple: {
    shadow: "#613583",
    back: "#9141ac",
    front: "#c061cb",
    highlight: "#dc8add",
  },
  pink: {
    shadow: "#a2145c",
    back: "#d6268e",
    front: "#e55ca0",
    highlight: "#f08db6",
  },
  teal: {
    shadow: "#0d7377",
    back: "#12a5a5",
    front: "#2ec4b6",
    highlight: "#6edcd5",
  },
  brown: {
    shadow: "#63452c",
    back: "#865e3c",
    front: "#a0784a",
    highlight: "#c09a6b",
  },
  gray: {
    shadow: "#5e5c64",
    back: "#77767b",
    front: "#9a9996",
    highlight: "#c0bfbc",
  },
};

export const FOLDER_COLOR_NAMES: FolderColorName[] = [
  "blue",
  "green",
  "red",
  "orange",
  "yellow",
  "purple",
  "pink",
  "teal",
  "brown",
  "gray",
];
