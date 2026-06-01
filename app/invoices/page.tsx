'use client';

import { useEffect, useMemo, useState } from 'react';
import { DUMMY_USER_ID, DUMMY_ORG_ID } from '@/lib/constants';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  customer_id?: string | null;
  supplier_id?: string | null;
  invoice_date: string;
  due_date: string;
  status: string;
  total: number;
  paid_amount: number;
}

interface Customer {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_type: 'sales',
    customer_id: '',
    supplier_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    subtotal: '',
    tax: '',
    total: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [invoicesRes, customersRes, suppliersRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
        fetch('/api/suppliers'),
      ]);
      const invoicesData = await invoicesRes.json();
      const customersData = await customersRes.json();
      const suppliersData = await suppliersRes.json();
      setInvoices(invoicesData.data || []);
      setCustomers(customersData.data || []);
      setSuppliers(suppliersData.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: DUMMY_ORG_ID,
          invoice_number: formData.invoice_number,
          invoice_type: formData.invoice_type,
          customer_id: formData.invoice_type === 'sales' ? formData.customer_id || null : null,
          supplier_id: formData.invoice_type === 'purchase' ? formData.supplier_id || null : null,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date || null,
          status: formData.status,
          subtotal: formData.subtotal ? parseFloat(formData.subtotal) : 0,
          tax: formData.tax ? parseFloat(formData.tax) : 0,
          total: formData.total ? parseFloat(formData.total) : 0,
          notes: formData.notes || null,
          created_by: DUMMY_USER_ID,
        }),
      });

      if (res.ok) {
        setFormData({
          invoice_number: '',
          invoice_type: 'sales',
          customer_id: '',
          supplier_id: '',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: '',
          status: 'draft',
          subtotal: '',
          tax: '',
          total: '',
          notes: '',
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  }

  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers]
  );
  const supplierById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier.name])),
    [suppliers]
  );

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(term) ||
      (invoice.customer_id ? customerById.get(invoice.customer_id)?.toLowerCase().includes(term) : false) ||
      (invoice.supplier_id ? supplierById.get(invoice.supplier_id)?.toLowerCase().includes(term) : false)
    );
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Create and track customer and supplier invoices"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            New Invoice
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Invoice Number *</label>
                  <Input
                    required
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_number: e.target.value })
                    }
                    placeholder="INV-1001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Invoice Type *</label>
                  <select
                    required
                    value={formData.invoice_type}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="sales">Sales Invoice</option>
                    <option value="purchase">Purchase Invoice</option>
                  </select>
                </div>
                {formData.invoice_type === 'sales' && (
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.invoice_type === 'purchase' && (
                  <div>
                    <label className="text-sm font-medium">Supplier</label>
                    <select
                      value={formData.supplier_id}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Invoice Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="issued">Issued</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="void">Void</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subtotal</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.subtotal}
                    onChange={(e) =>
                      setFormData({ ...formData, subtotal: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this invoice..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Invoice</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'invoice_number', label: 'Invoice #' },
          { key: 'invoice_type', label: 'Type' },
          {
            key: 'customer_id',
            label: 'Customer',
            render: (value) => (value ? customerById.get(value) || '-' : '-'),
          },
          {
            key: 'supplier_id',
            label: 'Supplier',
            render: (value) => (value ? supplierById.get(value) || '-' : '-'),
          },
          { key: 'invoice_date', label: 'Date' },
          { key: 'due_date', label: 'Due Date' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => <StatusBadge status={status} />,
          },
          { key: 'total', label: 'Total', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
          {
            key: 'paid_amount',
            label: 'Paid',
            render: (val) => `$${val?.toFixed(2) || '0.00'}`,
          },
        ]}
        data={filteredInvoices}
        loading={loading}
        emptyMessage="No invoices found"
      />
    </div>
  );
}
