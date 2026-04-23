import Link from 'next/link';
import { ShoppingBag, Mail, ShieldCheck, MessageSquare, HeartHandshake } from 'lucide-react';

const quickLinks = [
  { href: '/dashboard', label: 'Browse Items' },
  { href: '/post-item', label: 'Post an Item' },
  { href: '/my-items', label: 'My Listings' },
];

const supportLinks = [
  { href: '/messages', label: 'Messages' },
  { href: '/profile', label: 'Profile' },
  { href: '/cart', label: 'Saved Cart' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="page-container px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 shadow-[0_8px_20px_rgba(249,115,22,0.18)]">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">College Freecycle Market</h3>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-600">
              A campus-first marketplace for buying, selling, and donating useful items without leaving the RKNEC community.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-orange-50 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                Verified access
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <HeartHandshake className="h-4 w-4 text-orange-500" />
                Sustainable sharing
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Marketplace</h4>
            <div className="space-y-3 text-sm text-slate-600">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-orange-600">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Support</h4>
            <div className="space-y-3 text-sm text-slate-600">
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-orange-600">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">Community Pulse</h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.4rem] border border-slate-200 bg-orange-50 p-4">
                <p className="font-medium text-slate-900">Stay ready for the next pickup</p>
                <p className="mt-2 text-sm text-slate-600">
                  Keep notifications on so replies and new listings never slip past.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-700">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Real-time buyer and seller chat
              </div>
              <div className="inline-flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-orange-500" />
                College email verification enabled
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 College Freecycling Market. Built for a more reusable campus.</p>
          <div className="flex gap-4">
            <span>Secure listings</span>
            <span>Responsive messaging</span>
            <span>Student-first design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
