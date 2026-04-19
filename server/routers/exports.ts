import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

/**
 * Convert array of objects to CSV format
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

export const exportsRouter = router({
  // Export sales data (orders with totals)
  exportSalesData: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const orders = await db.getOrdersByStoreId(input.storeId);

      const salesData = orders.map((order: any) => ({
        "Order ID": order.orderNumber,
        "Order Date": new Date(order.createdAt).toISOString().split("T")[0],
        "Customer Email": order.customerEmail,
        Subtotal: parseFloat(order.subtotal.toString()).toFixed(2),
        Tax: parseFloat(order.tax.toString()).toFixed(2),
        Shipping: parseFloat(order.shipping.toString()).toFixed(2),
        Discount: parseFloat(order.discount.toString()).toFixed(2),
        Total: parseFloat(order.total.toString()).toFixed(2),
        Status: order.status,
      }));

      return {
        csv: convertToCSV(salesData),
        filename: `sales-data-${new Date().toISOString().split("T")[0]}.csv`,
        rowCount: salesData.length,
      };
    }),

  // Export customer data
  exportCustomerData: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const orders = await db.getOrdersByStoreId(input.storeId);

      // Extract unique customers with aggregated data
      const customerMap = new Map<
        string,
        {
          email: string;
          orderCount: number;
          totalSpent: number;
          firstOrder: string;
          lastOrder: string;
        }
      >();

      orders.forEach((order: any) => {
        const email = order.customerEmail;
        const existing = customerMap.get(email);
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        const total = parseFloat(order.total.toString());

        if (existing) {
          customerMap.set(email, {
            ...existing,
            orderCount: existing.orderCount + 1,
            totalSpent: existing.totalSpent + total,
            lastOrder: orderDate,
          });
        } else {
          customerMap.set(email, {
            email,
            orderCount: 1,
            totalSpent: total,
            firstOrder: orderDate,
            lastOrder: orderDate,
          });
        }
      });

      const customerData = Array.from(customerMap.values()).map((customer) => ({
        Email: customer.email,
        "Order Count": customer.orderCount,
        "Total Spent": customer.totalSpent.toFixed(2),
        "First Order": customer.firstOrder,
        "Last Order": customer.lastOrder,
        "Average Order Value": (customer.totalSpent / customer.orderCount).toFixed(2),
      }));

      return {
        csv: convertToCSV(customerData),
        filename: `customer-data-${new Date().toISOString().split("T")[0]}.csv`,
        rowCount: customerData.length,
      };
    }),

  // Export order details with line items
  exportOrderDetails: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const orders = await db.getOrdersByStoreId(input.storeId);
      const orderDetails: any[] = [];

      for (const order of orders) {
        const items = await db.getOrderItemsByOrderId(order.id);

        items.forEach((item: any) => {
          orderDetails.push({
            "Order ID": order.orderNumber,
            "Order Date": new Date(order.createdAt).toISOString().split("T")[0],
            "Customer Email": order.customerEmail,
            "Product Name": item.title,
            SKU: item.sku || "N/A",
            Quantity: item.quantity,
            "Unit Price": parseFloat(item.price.toString()).toFixed(2),
            "Line Total": (parseFloat(item.price.toString()) * item.quantity).toFixed(2),
            Status: order.status,
          });
        });
      }

      return {
        csv: convertToCSV(orderDetails),
        filename: `order-details-${new Date().toISOString().split("T")[0]}.csv`,
        rowCount: orderDetails.length,
      };
    }),

  // Export product inventory
  exportProductInventory: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const products = await db.getProductsByStoreId(input.storeId);

      const inventoryData = products.map((product: any) => ({
        "Product ID": product.id,
        "Product Name": product.name,
        SKU: product.sku || "N/A",
        Price: parseFloat(product.price.toString()).toFixed(2),
        "Stock Quantity": product.quantity || 0,
        "Created Date": new Date(product.createdAt).toISOString().split("T")[0],
        "Last Updated": new Date(product.updatedAt).toISOString().split("T")[0],
      }));

      return {
        csv: convertToCSV(inventoryData),
        filename: `product-inventory-${new Date().toISOString().split("T")[0]}.csv`,
        rowCount: inventoryData.length,
      };
    }),

  // Export discount usage
  exportDiscountUsage: protectedProcedure
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const store = await db.getStoreByMerchantId(ctx.user.id);
      if (!store || store.id !== input.storeId) {
        throw new Error("Unauthorized");
      }

      const discounts = await db.getDiscountsByStoreId(input.storeId);

      const discountData = discounts.map((discount: any) => ({
        Code: discount.code,
        Type: discount.type === "percentage" ? "Percentage" : "Fixed Amount",
        Value: discount.value,
        "Times Used": discount.usageCount || 0,
        "Max Uses": discount.maxUses || "Unlimited",
        "Created Date": new Date(discount.createdAt).toISOString().split("T")[0],
      }));

      return {
        csv: convertToCSV(discountData),
        filename: `discount-usage-${new Date().toISOString().split("T")[0]}.csv`,
        rowCount: discountData.length,
      };
    }),
});
