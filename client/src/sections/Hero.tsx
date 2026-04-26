import React from "react";

export const HeroSchema = {
  name: "Hero Banner",
  settings: [
    {
      id: "heading",
      type: "text",
      label: "Heading Text",
      default: "Welcome to Sellora",
    },
    {
      id: "subheading",
      type: "text",
      label: "Subheading Text",
      default: "The ultimate eCommerce platform",
    },
    {
      id: "bgColor",
      type: "color",
      label: "Background Color",
      default: "#008060",
    },
  ],
};

interface HeroProps {
  settings: {
    heading: string;
    subheading: string;
    bgColor: string;
  };
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  return (
    <section
      style={{
        backgroundColor: settings.bgColor,
        padding: "80px 20px",
        textAlign: "center",
        color: "white",
        fontFamily: "sans-serif",
        transition: "background-color 0.3s ease",
      }}
    >
      <h1 style={{ fontSize: "3rem", margin: "0 0 10px 0" }}>{settings.heading}</h1>
      <p style={{ fontSize: "1.5rem", margin: "0" }}>{settings.subheading}</p>
    </section>
  );
};
