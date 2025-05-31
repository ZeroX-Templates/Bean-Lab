import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Coffee, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "#customize", label: "Customize" },
    { href: "#brewing", label: "Brewing Guide" },
    { href: "#tracking", label: "Health Stats" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Coffee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Bean Lab</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{user?.username || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="text-left text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                  >
                    {item.label}
                  </button>
                ))}
                
                {isAuthenticated ? (
                  <div className="space-y-2 mt-4">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      {user?.username || 'User'}
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
