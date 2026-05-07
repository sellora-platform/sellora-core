import React from "react";

export const ButtonBlockSchema = {
  name: "Button",
  settings: [
    {
      id: "label",
      type: "text",
      label: "Button Label",
      default: "Click Me",
    },
    {
      id: "url",
      type: "text",
      label: "Link URL",
      default: "#",
    },
  ],
};

interface ButtonBlockProps {
  settings: {
    label: string;
    url: string;
  };
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ settings }) => {
  return (
    <a
      href={settings.url}
      style={{
        display: "inline-block",
        marginTop: "20px",
        padding: "12px 24px",
        backgroundColor: "white",
        color: "black",
        textDecoration: "none",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "1rem",
      }}
    >
      {settings.label}
    </a>
  );
};
