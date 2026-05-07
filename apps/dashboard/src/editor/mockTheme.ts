export interface BlockData {
  id: string;
  type: string;
  settings: Record<string, any>;
}

export interface SectionData {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks: Record<string, BlockData>;
  block_order: string[];
}

export interface Theme {
  schemaVersion: number;
  templates: {
    home: {
      sections: Record<string, SectionData>;
      order: string[];
    };
  };
}

export const mockTheme: Theme = {
  schemaVersion: 1,
  templates: {
    home: {
      sections: {
        "hero-1": {
          id: "hero-1",
          type: "hero",
          settings: {
            heading: "Welcome to Sellora",
            subheading: "The ultimate eCommerce platform",
            bgColor: "#008060",
          },
          blocks: {
            "btn-1": {
              id: "btn-1",
              type: "button",
              settings: {
                label: "Get Started",
                url: "/shop",
              },
            },
          },
          block_order: ["btn-1"],
        },
        "hero-2": {
          id: "hero-2",
          type: "hero",
          settings: {
            heading: "Modern Storefronts",
            subheading: "Built for performance",
            bgColor: "#1a1a1a",
          },
          blocks: {},
          block_order: [],
        },
      },
      order: ["hero-1", "hero-2"],
    },
  },
};
