'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Save, Palette, Type, Building2 } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export default function AgencySettingsPage() {
  const [agencyName, setAgencyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [pdfTheme, setPdfTheme] = useState('dark');
  const [footerText, setFooterText] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/agency-settings`);
        const data = await res.json();
        if (data) {
          setAgencyName(data.agencyName || '');
          setLogoUrl(data.logoUrl || '');
          setPrimaryColor(data.primaryColor || '#6366F1');
          setSecondaryColor(data.secondaryColor || '#10B981');
          setFontFamily(data.fontFamily || 'Inter');
          setPdfTheme(data.pdfTheme || 'dark');
          setFooterText(data.footerText || '');
          setSupportEmail(data.supportEmail || '');
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/agency-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName, logoUrl, primaryColor, secondaryColor, fontFamily, pdfTheme, footerText, supportEmail })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('White-Label settings saved!');
    } catch (err) {
      // ✅ GUARANTEED FIX: Narrowing 'err' to 'Error'
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-6 font-['Inter']">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">White-Label Studio</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="space-y-5 p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Agency Details</h2>
            </div>
            <div>
              <label className="text-sm text-neutral-400 block mb-2">Agency Name</label>
              <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-400 block mb-2">Logo URL (Paste Image Link)</label>
              <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://youragency.com/logo.png" className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-400 block mb-2">Support Email</label>
              <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Palette size={20} className="text-emerald-400" />
              <h2 className="text-xl font-semibold">Branding & Theme</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Primary Color</label>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 cursor-pointer" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Secondary Color</label>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 cursor-pointer" />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-neutral-400 block mb-2">Font Style</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none">
                <option value="Inter">Inter (Modern)</option>
                <option value="Times New Roman">Serif (Classic)</option>
                <option value="Courier New">Monospace (Tech)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-neutral-400 block mb-2">PDF Theme</label>
              <select value={pdfTheme} onChange={(e) => setPdfTheme(e.target.value)} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none">
                <option value="dark">Dark (Premium)</option>
                <option value="light">Light (Corporate)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-2">Footer Text</label>
              <textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={2} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 focus:border-indigo-500 outline-none" />
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all flex items-center justify-center gap-2">
              {saving ? 'Saving...' : <><Save size={20} /> Save White-Label Settings</>}
            </button>
          </div>

          {/* Live Preview */}
          <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <div className="flex items-center gap-2 mb-4">
              <Type size={20} className="text-purple-400" />
              <h2 className="text-xl font-semibold">Live Preview</h2>
            </div>
            <div className="p-6 rounded-xl border border-neutral-700" style={{ background: pdfTheme === 'dark' ? '#111' : '#fff', fontFamily }}>
              <div className="flex items-center gap-3 mb-4">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded" />}
                <div>
                  <h1 className="text-xl font-bold" style={{ color: pdfTheme === 'dark' ? '#fff' : '#000' }}>{agencyName}</h1>
                  <p className="text-xs" style={{ color: primaryColor }}>Premium SEO Intelligence</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-1/2 rounded" style={{ background: primaryColor }}></div>
                <div className="h-2 w-3/4 rounded bg-neutral-600"></div>
                <div className="h-2 w-1/3 rounded bg-neutral-600"></div>
              </div>
              <p className="text-xs mt-4" style={{ color: pdfTheme === 'dark' ? '#888' : '#666' }}>{footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
