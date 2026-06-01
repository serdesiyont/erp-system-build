'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Package, ShoppingCart, Zap, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">ERP Pro</div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#benefits" className="text-foreground hover:text-primary transition-colors">Benefits</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance leading-tight">
              Run Your Business Like a <span className="text-primary">Pro</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Complete enterprise resource planning software designed for modern businesses. Manage inventory, sales, purchasing, production, and finances all in one powerful platform.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline">Watch Demo</Button>
            </div>
            <p className="text-sm text-muted-foreground">No credit card required. 14-day free trial.</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Powerful Features Built for Growth</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to streamline operations and scale your business efficiently.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Package, title: 'Inventory Management', desc: 'Track stock across multiple warehouses with real-time updates' },
              { icon: ShoppingCart, title: 'Sales Orders', desc: 'Process customer orders and manage order-to-delivery lifecycle' },
              { icon: Users, title: 'Customer Management', desc: 'Maintain detailed customer profiles and interaction history' },
              { icon: BarChart3, title: 'Production Planning', desc: 'Optimize manufacturing with bill of materials and scheduling' },
              { icon: TrendingUp, title: 'Financial Reporting', desc: 'Generate invoices, track payments, and manage accounts' },
              { icon: Zap, title: 'Supplier Management', desc: 'Manage purchase orders and supplier relationships seamlessly' },
            ].map((feature, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { number: '10k+', label: 'Active Users' },
            { number: '99.9%', label: 'Uptime' },
            { number: '500M+', label: 'Transactions' },
            { number: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">{stat.number}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose ERP Pro?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                'Reduce operational costs by up to 40%',
                'Improve inventory accuracy and reduce waste',
                'Automate repetitive tasks and save time',
                'Real-time insights and analytics dashboards',
                'Seamless integration with your existing tools',
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-lg text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Launch in Minutes</h3>
              <p className="text-muted-foreground mb-6">No complex setup or expensive implementation. Start managing your business immediately with our intuitive interface.</p>
              <div className="space-y-3">
                <p className="text-sm font-medium">✓ Pre-built templates</p>
                <p className="text-sm font-medium">✓ One-click deployment</p>
                <p className="text-sm font-medium">✓ Guided onboarding</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground">Join thousands of companies using ERP Pro to streamline operations.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight size={20} />
              </Button>
            </Link>
            <Button size="lg" variant="outline">Schedule Demo</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-foreground transition">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 ERP Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
