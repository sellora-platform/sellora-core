import React from "react";

interface RenderFieldProps {
  setting: {
    id: string;
    type: string;
    label: string;
  };
  value: any;
  onChange: (id: string, newValue: any) => void;
}

export const RenderField: React.FC<RenderFieldProps> = ({ setting, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(setting.id, e.target.value);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "0.9rem",
          color: "#333",
        }}
      >
        {setting.label}
      </label>

      {setting.type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      )}

      {setting.type === "color" && (
        <input
          type="color"
          value={value || "#000000"}
          onChange={handleChange}
          style={{
            width: "100%",
            height: "40px",
            padding: "2px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
};
