'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_name: string;
  warehouse_name: string;
  sku: string;
  quantity_on_hand: number;
  reserved_quantity: number;
  available_quantity: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity_on_hand: 0,
    reserved_quantity: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [invRes, prodRes, whRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products'),
        fetch('/api/warehouses'),
      ]);

      const invData = await invRes.json();
      const prodData = await prodRes.json();
      const whData = await whRes.json();

      setInventory(invData.data || []);
      setProducts(prodData.data || []);
      setWarehouses(whData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          product_id: '',
          warehouse_id: '',
          quantity_on_hand: 0,
          reserved_quantity: 0,
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Track and manage product inventory across warehouses"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            Add Stock
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add/Update Inventory</CardTitle>
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
                  <label className="text-sm font-medium">Warehouse *</label>
                  <select
                    required
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select a warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity on Hand</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity_on_hand}
                    onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reserved Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.reserved_quantity}
                    onChange={(e) => setFormData({ ...formData, reserved_quantity: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update Inventory</Button>
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
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'product_name', label: 'Product' },
          { key: 'warehouse_name', label: 'Warehouse' },
          { key: 'quantity_on_hand', label: 'On Hand' },
          { key: 'reserved_quantity', label: 'Reserved' },
          { key: 'available_quantity', label: 'Available' },
        ]}
        data={filteredInventory}
        loading={loading}
        emptyMessage="No inventory items found"
      />
    </div>
  );
}
