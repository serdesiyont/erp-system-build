'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  city?: string;
  capacity?: number;
  manager_name?: string;
  phone?: string;
  email?: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    capacity: '',
    manager_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    try {
      setLoading(true);
      const res = await fetch('/api/warehouses');
      const data = await res.json();
      setWarehouses(data.data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: 'org-placeholder',
          name: formData.name,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          postal_code: formData.postal_code || null,
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
          manager_name: formData.manager_name || null,
          phone: formData.phone || null,
          email: formData.email || null,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          capacity: '',
          manager_name: '',
          phone: '',
          email: '',
        });
        setShowForm(false);
        await fetchWarehouses();
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
    }
  }

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const term = searchTerm.toLowerCase();
    return (
      warehouse.name.toLowerCase().includes(term) ||
      warehouse.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description="Manage storage locations and warehouse details"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            New Warehouse
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Warehouse Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter warehouse name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Manager</label>
                  <Input
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    placeholder="Manager name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contact phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contact email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter street address..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Warehouse</Button>
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
            placeholder="Search warehouses by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Warehouse' },
          { key: 'city', label: 'City' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'manager_name', label: 'Manager' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
        ]}
        data={filteredWarehouses}
        loading={loading}
        emptyMessage="No warehouses found"
      />
    </div>
  );
}
