/**
 * Kempa Footer Component
 * 
 * Footer component matching Kempa's website style:
 * - Dark grey background (#262626)
 * - Logo with K monogram and "kempa" text
 * - Sections: Openingsuren, Adres, Nieuwsbrief
 * - Social media icons
 * - Light cream text (#F6EFEB)
 */

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function KempaFooter() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-[#262626] text-[#F6EFEB]">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Slogan */}
          <div className="lg:col-span-1">
            <Link 
              to="/" 
              className="flex flex-col items-start gap-2 mb-6 hover:opacity-90 transition-opacity"
            >
              <img
                src="/images/logos/kempa-monogram-nude.svg"
                alt="Kempa K"
                className="h-12 w-auto"
              />
              <span className="text-[#F6EFEB] font-serif text-base lowercase tracking-wide">
                kempa
              </span>
            </Link>
            <p className="text-sm text-[#F6EFEB]/80 font-sans">
              Uw partner voor hoogwaardige poederlakkerij en interieurafwerking
            </p>
          </div>

          {/* Openingsuren */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-serif font-bold text-[#F6EFEB] mb-4">
              Openingsuren
            </h3>
            <div className="space-y-3 text-sm font-sans text-[#F6EFEB]/80">
              <div>
                <p className="font-medium mb-1">Maandag – donderdag:</p>
                <p className="ml-4">08u00 – 12u00</p>
                <p className="ml-4">12u30 – 17u00</p>
              </div>
              <div>
                <p className="font-medium mb-1">Vrijdag</p>
                <p className="ml-4">08u00 – 12u00</p>
                <p className="ml-4">12u30 – 16u00</p>
              </div>
              <div>
                <p className="font-medium mb-1">Zaterdag – zondag</p>
                <p className="ml-4">Gesloten</p>
              </div>
            </div>
          </div>

          {/* Adres */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-serif font-bold text-[#F6EFEB] mb-4">
              Adres
            </h3>
            <div className="space-y-3 text-sm font-sans text-[#F6EFEB]/80">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Dikberd 48</p>
                  <p>2200 Herentals</p>
                  <p>België</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+3214882014" className="hover:text-white transition-colors">
                  +32 14 88 20 14
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:order@kempa.be" className="hover:text-white transition-colors">
                  order@kempa.be
                </a>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-[#F6EFEB]/70">BTW: BE0407.201.941</p>
              </div>
            </div>
          </div>

          {/* Nieuwsbrief */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-serif font-bold text-[#F6EFEB] mb-4">
              Nieuwsbrief
            </h3>
            <p className="text-sm font-sans text-[#F6EFEB]/80 mb-4">
              Blijf op de hoogte van onze nieuwste ontwikkelingen en aanbiedingen
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Uw e-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border border-white/20 text-[#F6EFEB] placeholder:text-[#F6EFEB]/50 focus:border-white/40 focus:ring-white/20"
                required
              />
              <Button
                type="submit"
                className="w-full bg-[#2D5A4A] hover:bg-[#1f3f33] text-white border-0 flex items-center justify-center gap-2"
              >
                Inschrijven
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-sans text-[#F6EFEB]/70">
              <Link to="/" className="hover:text-[#F6EFEB] transition-colors">
                JOBS
              </Link>
              <Link to="/" className="hover:text-[#F6EFEB] transition-colors">
                BLOG
              </Link>
              <Link to="/mdf-poederlakken" className="hover:text-[#F6EFEB] transition-colors">
                MDF Poederlakken
              </Link>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/kempa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#6A3E5C] hover:bg-[#7a4e6c] flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/kempa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#6A3E5C] hover:bg-[#7a4e6c] flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.64c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kempa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#6A3E5C] hover:bg-[#7a4e6c] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center text-sm font-sans text-[#F6EFEB]/60">
            <p>&copy; {new Date().getFullYear()} Kempa. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
