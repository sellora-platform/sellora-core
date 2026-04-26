export const mockTheme = {
  sections: [
    {
      id: "hero-1",
      type: "hero",
      settings: {
        heading: "Welcome to Sellora",
        subheading: "The ultimate eCommerce platform",
        bgColor: "#008060",
      },
    },
  ],
};

export type Theme = typeof mockTheme;
