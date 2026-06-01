export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex">
          {/* Left side - Gradient background */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-accent to-primary/80 p-8 flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary-foreground">ERP Pro</h1>
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-primary-foreground leading-tight">Manage Your Business Better</h2>
              <p className="text-primary-foreground/80 text-lg">Join thousands of companies using ERP Pro to streamline operations and scale efficiently.</p>
              <div className="pt-4 space-y-3">
                <p className="text-primary-foreground/90">✓ Inventory management</p>
                <p className="text-primary-foreground/90">✓ Sales & purchasing</p>
                <p className="text-primary-foreground/90">✓ Production planning</p>
                <p className="text-primary-foreground/90">✓ Financial reporting</p>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
