'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { DataTable } from '@/components/data-table';
import { BarChart3, Package, ShoppingCart, DollarSign, Boxes } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalProducts: number;
  totalInventory: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInventory: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/products').catch(() => ({ json: async () => ({ data: [] }) })),
        fetch('/api/sales-orders').catch(() => ({ json: async () => ({ data: [] }) })),
        fetch('/api/inventory').catch(() => ({ json: async () => ({ data: [] }) })),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const inventoryData = await inventoryRes.json();

      const products = productsData.data || [];
      const orders = ordersData.data || [];
      const inventory = inventoryData.data || [];

      // Calculate stats
      const totalRevenue = orders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      setStats({
        totalProducts: products.length,
        totalInventory: inventory.reduce((sum: number, i: any) => sum + (i.quantity_on_hand || 0), 0),
        totalOrders: orders.length,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
        lowStockProducts: products.filter((p: any) => p.reorder_level && p.reorder_level > 0).slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalProducts: 0,
        totalInventory: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        lowStockProducts: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to your ERP system. Here&apos;s an overview of your business."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="text-blue-600" size={24} />}
          description="Active products in inventory"
        />
        <KpiCard
          title="Inventory Value"
          value={`${stats.totalInventory} units`}
          icon={<Boxes className="text-green-600" size={24} />}
          description="Total items in stock"
        />
        <KpiCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="text-orange-600" size={24} />}
          description="All sales orders"
        />
        <KpiCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="text-green-700" size={24} />}
          description="Completed orders only"
        />
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Link href="/sales">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <DataTable
          columns={[
            { key: 'order_number', label: 'Order #' },
            { key: 'customer_name', label: 'Customer' },
            { key: 'order_date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'total', label: 'Total', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
          ]}
          data={stats.recentOrders}
          loading={loading}
          emptyMessage="No orders yet"
        />
      </div>

      {/* Low Stock Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Low Stock Products</h2>
          <Link href="/inventory">
            <Button variant="outline">Manage Inventory</Button>
          </Link>
        </div>
        <DataTable
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'name', label: 'Product' },
            { key: 'reorder_level', label: 'Reorder Level' },
            { key: 'selling_price', label: 'Price', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
          ]}
          data={stats.lowStockProducts}
          loading={loading}
          emptyMessage="All products well stocked"
        />
      </div>
    </div>
  );
}
