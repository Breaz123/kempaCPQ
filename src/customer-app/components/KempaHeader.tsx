/**
 * Kempa Header Component
 * 
 * Header component matching Kempa's website style:
 * - Dark grey background
 * - Logo on left: K monogram icon with "kempa" text below
 * - Navigation items on right: styled with Kempa colors
 */

import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KempaHeader() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-[#262626] text-[#F6EFEB] sticky top-0 z-50 border-b border-[#4a4a4a]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex flex-col items-start gap-1 hover:opacity-90 transition-opacity"
          >
            <img
              src="/images/logos/kempa-monogram-nude.svg"
              alt="Kempa K"
              className="h-10 w-auto"
            />
            <span className="text-[#F6EFEB] font-serif text-sm lowercase tracking-wide">
              kempa
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button 
                variant="default" 
                size="lg" 
                className="flex items-center gap-2 rounded-[99px] bg-[#2D5A4A] hover:bg-[#1f3f33] text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Configurator</span>
                <span className="md:hidden">CPQ</span>
              </Button>
            </Link>
            <Link to="/mdf-poederlakken">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`
                  hover:bg-[#3a3a3a] hover:text-white transition-colors
                  ${isActive('/mdf-poederlakken') ? 'text-white bg-[#3a3a3a]' : 'text-[#F6EFEB]'}
                `}
              >
                MDF Poederlakken
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
