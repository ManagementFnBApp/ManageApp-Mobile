export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  Pending:   { bg: "#fff7ed", text: "#f97316" },
  Preparing: { bg: "#eff6ff", text: "#3b82f6" },
  Ready:     { bg: "#f0fdf4", text: "#22c55e" },
  Completed: { bg: "#f3f4f6", text: "#6b7280" },
  Cancelled: { bg: "#fef2f2", text: "#ef4444" },
};

export const ACTIVE_STATUSES: OrderStatus[] = ["Pending", "Preparing", "Ready"];

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type FilterTab = "All" | "Active" | "Completed";

export type Order = {
  id: string;
  orderId: string;
  customer: string | null;
  table: string | null;
  time: string;
  total: number;
  status: OrderStatus;
};

export const getAllOrders = async () => {
    return orders;
}

const orders: Order[] = [
  { id: "1", orderId: "ORD-1234", customer: null, table: "Table 05", time: "12:45 PM", total: 42.5, status: "Pending" },
  { id: "2", orderId: "ORD-1233", customer: "John Doe", table: null, time: "12:30 PM", total: 18.2, status: "Preparing" },
  { id: "3", orderId: "ORD-1230", customer: null, table: "Table 12", time: "12:15 PM", total: 85.0, status: "Ready" },
  { id: "4", orderId: "ORD-1225", customer: "Sarah Smith", table: null, time: "11:45 AM", total: 34.9, status: "Completed" },
  { id: "5", orderId: "ORD-1220", customer: null, table: "Table 02", time: "10:30 AM", total: 0.0, status: "Cancelled" },
];