import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, customer, employee } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  let dashboardData = null;

  if (session.user.userType === "CUSTOMER") {
    const [customerData] = await db
      .select()
      .from(customer)
      .where(eq(customer.userId, session.user.id!));

    if (customerData) {
      const recentOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.cusId, customerData.cusId))
        .limit(5);

      dashboardData = {
        type: "customer",
        orders: recentOrders,
      };
    }
  } else if (session.user.userType === "EMPLOYEE") {
    const [employeeData] = await db
      .select()
      .from(employee)
      .where(eq(employee.userId, session.user.id!));

    if (employeeData) {
      const pendingOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "PENDING"))
        .limit(5);

      dashboardData = {
        type: "employee",
        pendingOrders,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {session.user.name}
        </div>
      </div>

      {dashboardData?.type === "customer" && dashboardData?.orders && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
            {dashboardData.orders.length > 0 ? (
              <ul className="divide-y">
                {dashboardData.orders.map((order) => (
                  <li key={order.orderId} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          Status: {order.status}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent orders</p>
            )}
          </div>
        </div>
      )}

      {dashboardData?.type === "employee" && dashboardData?.pendingOrders && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Pending Orders</h2>
            {dashboardData.pendingOrders.length > 0 ? (
              <ul className="divide-y">
                {dashboardData.pendingOrders.map((order) => (
                  <li key={order.orderId} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          Type: {order.orderType}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No pending orders</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-[20vh]">
        <Link
          href="/items"
          className="group flex flex-col items-center gap-4 p-8 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="rounded-full bg-primary/10 p-6">
            <ArrowRight className="h-12 w-12 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Check Out Our Items Page</h2>
            <p className="text-muted-foreground mt-2">
              Create, manage, and track your items with our new item management system
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
