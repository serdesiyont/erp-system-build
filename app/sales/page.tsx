'use client';

import { useEffect, useState } from 'react';
import { DUMMY_USER_ID, DUMMY_ORG_ID } from '@/lib/constants';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  total: number;
  item_count: number;
}

interface Customer {
  id: string;
  name: string;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    order_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [ordersRes, customersRes] = await Promise.all([
        fetch('/api/sales-orders'),
        fetch('/api/customers'),
      ]);

      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();

      setOrders(ordersData.data || []);
      setCustomers(customersData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organization_id: DUMMY_ORG_ID,
          created_by: DUMMY_USER_ID,
        }),
      });

      if (res.ok) {
        setFormData({
          customer_id: '',
          order_date: new Date().toISOString().split('T')[0],
          due_date: '',
          status: 'draft',
          notes: '',
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating sales order:', error);
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        description="Manage customer sales orders and track fulfillment"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            New Order
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Sales Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this order..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Order</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
          <Input
            placeholder="Search orders or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'order_number', label: 'Order #' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'order_date', label: 'Date' },
          { key: 'item_count', label: 'Items' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />,
          },
          { key: 'total', label: 'Total', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
          {
            key: 'id',
            label: 'Actions',
            render: (id) => (
              <Link href={`/sales/${id}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            ),
          },
        ]}
        data={filteredOrders}
        loading={loading}
        emptyMessage="No sales orders yet"
      />
    </div>
  );
}
