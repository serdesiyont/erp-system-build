'use client';

import { useEffect, useState } from 'react';
import { DUMMY_ORG_ID } from '@/lib/constants';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  account_subtype?: string;
  balance?: number;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    account_number: '',
    account_name: '',
    account_type: 'asset',
    account_subtype: '',
    description: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: DUMMY_ORG_ID,
          account_number: formData.account_number,
          account_name: formData.account_name,
          account_type: formData.account_type,
          account_subtype: formData.account_subtype || null,
          description: formData.description || null,
        }),
      });

      if (res.ok) {
        setFormData({
          account_number: '',
          account_name: '',
          account_type: 'asset',
          account_subtype: '',
          description: '',
        });
        setShowForm(false);
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const term = searchTerm.toLowerCase();
    return (
      account.account_number.toLowerCase().includes(term) ||
      account.account_name.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Manage your chart of accounts"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            New Account
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account Number *</label>
                  <Input
                    required
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Name *</label>
                  <Input
                    required
                    value={formData.account_name}
                    onChange={(e) =>
                      setFormData({ ...formData, account_name: e.target.value })
                    }
                    placeholder="Cash"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type *</label>
                  <select
                    required
                    value={formData.account_type}
                    onChange={(e) =>
                      setFormData({ ...formData, account_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Subtype</label>
                  <Input
                    value={formData.account_subtype}
                    onChange={(e) =>
                      setFormData({ ...formData, account_subtype: e.target.value })
                    }
                    placeholder="Current Asset, Bank, etc."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this account..."
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Account</Button>
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
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'account_number', label: 'Number' },
          { key: 'account_name', label: 'Name' },
          { key: 'account_type', label: 'Type' },
          { key: 'account_subtype', label: 'Subtype' },
          { key: 'balance', label: 'Balance', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
        ]}
        data={filteredAccounts}
        loading={loading}
        emptyMessage="No accounts found"
      />
    </div>
  );
}
