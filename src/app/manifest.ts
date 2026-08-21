import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hunch",
    short_name: "Hunch",
    description: "Predictions with friends.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ff",
    theme_color: "#7457d9",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
