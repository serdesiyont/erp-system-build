'use client';

import { useEffect, useMemo, useState } from 'react';
import { DUMMY_ORG_ID } from '@/lib/constants';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id: string;
  unit_price?: number;
  cost_price?: number;
  reorder_level?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_price: '',
    cost_price: '',
    reorder_level: '',
    lead_time_days: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: DUMMY_ORG_ID,
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category_id: formData.category_id,
          unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
          reorder_level: formData.reorder_level ? parseInt(formData.reorder_level, 10) : null,
          lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days, 10) : null,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          sku: '',
          description: '',
          category_id: '',
          unit_price: '',
          cost_price: '',
          reorder_level: '',
          lead_time_days: '',
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  }

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Products"
        description="Create and manage your product catalog"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            New Product
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU *</label>
                  <Input
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cost Price</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reorder Level</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lead Time (Days)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a product description..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Product</Button>
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
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Product' },
          {
            key: 'category_id',
            label: 'Category',
            render: (value) => categoryById.get(value) || '-',
          },
          {
            key: 'unit_price',
            label: 'Unit Price',
            render: (value) =>
              value != null && value !== ''
                ? `$${Number(value).toFixed(2)}`
                : '-',
          },
          {
            key: 'reorder_level',
            label: 'Reorder Level',
            render: (value) => (value != null && value !== '' ? String(value) : '-'),
          },
        ]}
        data={filteredProducts}
        loading={loading}
        emptyMessage="No products found"
      />
    </div>
  );
}
