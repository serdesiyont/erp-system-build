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

interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  quantity_ordered: number;
  quantity_produced: number;
  status: string;
  start_date: string;
  completion_date: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_ordered: 0,
    start_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    status: 'planned',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData.data || []);
      setOrders([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: DUMMY_ORG_ID,
          product_id: formData.product_id,
          quantity_ordered: formData.quantity_ordered,
          start_date: formData.start_date,
          completion_date: formData.completion_date || null,
          status: formData.status,
          notes: formData.notes || null,
          created_by: DUMMY_USER_ID,
        }),
      });

      if (res.ok) {
        setFormData({
          product_id: '',
          quantity_ordered: 0,
          start_date: new Date().toISOString().split('T')[0],
          completion_date: '',
          status: 'planned',
          notes: '',
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating production order:', error);
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Production Orders"
        description="Manage manufacturing and production scheduling"
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
            <CardTitle>Create New Production Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product *</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity to Produce *</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity_ordered}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity_ordered: parseInt(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Completion</label>
                  <Input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) =>
                      setFormData({ ...formData, completion_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
            placeholder="Search production orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'order_number', label: 'Order #' },
          { key: 'product_id', label: 'Product' },
          { key: 'quantity_ordered', label: 'Ordered' },
          { key: 'quantity_produced', label: 'Produced' },
          { key: 'start_date', label: 'Start Date' },
          { key: 'completion_date', label: 'Target Completion' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />,
          },
        ]}
        data={filteredOrders}
        loading={loading}
        emptyMessage="No production orders yet"
      />
    </div>
  );
}
