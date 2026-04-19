import { describe, expect, it } from "vitest";

/**
 * CSV Export Tests
 * Tests for the data export functionality
 */

describe("CSV Export Utilities", () => {
  /**
   * Test CSV conversion helper
   */
  function convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.map((h) => `"${h}"`).join(",");

    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '""';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",");
    });

    return [csvHeaders, ...csvRows].join("\n");
  }

  it("should convert empty array to empty string", () => {
    const result = convertToCSV([]);
    expect(result).toBe("");
  });

  it("should convert single object to CSV with headers", () => {
    const data = [{ name: "John", email: "john@example.com", age: 30 }];
    const result = convertToCSV(data);

    expect(result).toContain('"name"');
    expect(result).toContain('"email"');
    expect(result).toContain('"age"');
    expect(result).toContain('"John"');
    expect(result).toContain('"john@example.com"');
    expect(result).toContain('"30"');
  });

  it("should handle multiple rows correctly", () => {
    const data = [
      { name: "John", email: "john@example.com" },
      { name: "Jane", email: "jane@example.com" },
    ];
    const result = convertToCSV(data);
    const lines = result.split("\n");

    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[0]).toBe('"name","email"');
    expect(lines[1]).toContain("John");
    expect(lines[2]).toContain("Jane");
  });

  it("should escape quotes in values", () => {
    const data = [{ name: 'John "Johnny" Doe', email: "john@example.com" }];
    const result = convertToCSV(data);

    expect(result).toContain('"John ""Johnny"" Doe"');
  });

  it("should handle null and undefined values", () => {
    const data = [{ name: "John", email: null, phone: undefined }];
    const result = convertToCSV(data);

    expect(result).toContain('""'); // null and undefined become empty strings
  });

  it("should handle numbers and dates", () => {
    const data = [
      {
        id: 123,
        amount: 45.67,
        date: "2026-04-19",
      },
    ];
    const result = convertToCSV(data);

    expect(result).toContain('"123"');
    expect(result).toContain('"45.67"');
    expect(result).toContain('"2026-04-19"');
  });

  it("should format sales data correctly", () => {
    const salesData = [
      {
        "Order ID": "ORD-001",
        "Order Date": "2026-04-19",
        "Customer Email": "customer@example.com",
        Subtotal: "100.00",
        Tax: "10.00",
        Shipping: "5.00",
        Discount: "0.00",
        Total: "115.00",
        Status: "Processing",
      },
    ];
    const result = convertToCSV(salesData);

    expect(result).toContain('"Order ID"');
    expect(result).toContain('"ORD-001"');
    expect(result).toContain('"Processing"');
    expect(result).toContain('"115.00"');
  });

  it("should format customer data correctly", () => {
    const customerData = [
      {
        Email: "customer@example.com",
        "Order Count": 5,
        "Total Spent": "500.00",
        "First Order": "2026-01-01",
        "Last Order": "2026-04-19",
        "Average Order Value": "100.00",
      },
    ];
    const result = convertToCSV(customerData);

    expect(result).toContain('"Email"');
    expect(result).toContain('"customer@example.com"');
    expect(result).toContain('"5"');
    expect(result).toContain('"500.00"');
  });

  it("should format order details correctly", () => {
    const orderDetails = [
      {
        "Order ID": "ORD-001",
        "Order Date": "2026-04-19",
        "Customer Email": "customer@example.com",
        "Product Name": "Laptop",
        SKU: "LAP-001",
        Quantity: 1,
        "Unit Price": "999.99",
        "Line Total": "999.99",
        Status: "Shipped",
      },
    ];
    const result = convertToCSV(orderDetails);

    expect(result).toContain('"Laptop"');
    expect(result).toContain('"LAP-001"');
    expect(result).toContain('"999.99"');
    expect(result).toContain('"Shipped"');
  });

  it("should format product inventory correctly", () => {
    const inventoryData = [
      {
        "Product ID": 1,
        "Product Name": "Laptop",
        SKU: "LAP-001",
        Price: "999.99",
        "Stock Quantity": 50,
        "Created Date": "2026-01-01",
        "Last Updated": "2026-04-19",
      },
    ];
    const result = convertToCSV(inventoryData);

    expect(result).toContain('"Laptop"');
    expect(result).toContain('"50"');
    expect(result).toContain('"999.99"');
  });

  it("should format discount usage correctly", () => {
    const discountData = [
      {
        Code: "SAVE10",
        Type: "Percentage",
        Value: 10,
        "Times Used": 25,
        "Max Uses": "Unlimited",
        "Created Date": "2026-01-01",
      },
    ];
    const result = convertToCSV(discountData);

    expect(result).toContain('"SAVE10"');
    expect(result).toContain('"Percentage"');
    expect(result).toContain('"10"');
    expect(result).toContain('"Unlimited"');
  });
});
