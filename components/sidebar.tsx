'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import {
  BarChart3,
  Boxes,
  ShoppingCart,
  Package,
  Tags,
  Wrench,
  DollarSign,
  Users,
  Menu,
  X,
  Truck,
  FileText,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Users,
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Warehouses',
    href: '/warehouses',
    icon: Boxes,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    label: 'Purchasing',
    href: '/purchasing',
    icon: Package,
  },
  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Purchase Orders',
    href: '/purchase-orders',
    icon: FileText,
  },
  {
    label: 'Production',
    href: '/production',
    icon: Wrench,
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: DollarSign,
  },
  {
    label: 'Invoices',
    href: '/invoices',
    icon: FileText,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: Wallet,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  
  // Hide sidebar on home, auth, and 404 pages
  const shouldHideSidebar = useMemo(() => {
    return pathname === '/' || pathname.startsWith('/auth/');
  }, [pathname]);
  const [isOpen, setIsOpen] = useState(true);

  if (shouldHideSidebar) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 lg:translate-x-0 z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="pt-8 px-4">
          <h1 className="text-2xl font-bold mb-8">ERP System</h1>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
