export interface SectionData {
  id: string;
  type: string;
  settings: Record<string, any>;
}

export interface Theme {
  templates: {
    home: {
      sections: Record<string, SectionData>;
      order: string[];
    };
  };
}

export const mockTheme: Theme = {
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
        },
        "hero-2": {
          id: "hero-2",
          type: "hero",
          settings: {
            heading: "Modern Storefronts",
            subheading: "Built for performance",
            bgColor: "#1a1a1a",
          },
        },
      },
      order: ["hero-1", "hero-2"],
    },
  },
};
