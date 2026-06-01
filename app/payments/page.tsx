'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: '',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/invoices'),
      ]);
      const paymentsData = await paymentsRes.json();
      const invoicesData = await invoicesRes.json();
      setPayments(paymentsData.data || []);
      setInvoices(invoicesData.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: 'org-placeholder',
          invoice_id: formData.invoice_id,
          payment_date: formData.payment_date,
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          payment_method: formData.payment_method || null,
          reference_number: formData.reference_number || null,
          notes: formData.notes || null,
          recorded_by: 'user-placeholder',
        }),
      });

      if (res.ok) {
        setFormData({
          invoice_id: '',
          payment_date: new Date().toISOString().split('T')[0],
          amount: '',
          payment_method: '',
          reference_number: '',
          notes: '',
        });
        setShowForm(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  }

  const invoiceById = useMemo(
    () => new Map(invoices.map((invoice) => [invoice.id, invoice.invoice_number])),
    [invoices]
  );

  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    return (
      invoiceById.get(payment.invoice_id)?.toLowerCase().includes(term) ||
      payment.reference_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Record and track invoice payments"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            Record Payment
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Invoice *</label>
                  <select
                    required
                    value={formData.invoice_id}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select an invoice</option>
                    {invoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Input
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    placeholder="Bank transfer, cash, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reference Number</label>
                  <Input
                    value={formData.reference_number}
                    onChange={(e) =>
                      setFormData({ ...formData, reference_number: e.target.value })
                    }
                    placeholder="Reference or transaction ID"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this payment..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Record Payment</Button>
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
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'invoice_id',
            label: 'Invoice',
            render: (value) => invoiceById.get(value) || '-',
          },
          { key: 'payment_date', label: 'Date' },
          { key: 'amount', label: 'Amount', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
          { key: 'payment_method', label: 'Method' },
          { key: 'reference_number', label: 'Reference' },
        ]}
        data={filteredPayments}
        loading={loading}
        emptyMessage="No payments found"
      />
    </div>
  );
}
