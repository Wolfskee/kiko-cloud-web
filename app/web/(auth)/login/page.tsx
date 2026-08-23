import { GoogleLoginBtn } from '@/features/auth/components/GoogleLoginBtn';
import { Cloud, ShieldCheck, Zap, HardDrive, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-zinc-950 text-slate-100">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Card Wrapper with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-zinc-900/60 border border-white/15 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          {/* Logo & Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-lg shadow-indigo-500/25 mb-2">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              KikoCloud
            </h1>
            <p className="text-sm text-slate-300/80 font-normal max-w-xs mx-auto">
              Serverless Edge Cloud Storage with Direct MinIO Acceleration
            </p>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-white/10 dark:border-zinc-800">
            <div className="p-2 space-y-1">
              <Zap className="w-4 h-4 mx-auto text-cyan-400" />
              <p className="text-[11px] font-medium text-slate-300">Direct Upload</p>
            </div>
            <div className="p-2 space-y-1">
              <ShieldCheck className="w-4 h-4 mx-auto text-indigo-400" />
              <p className="text-[11px] font-medium text-slate-300">Google Auth</p>
            </div>
            <div className="p-2 space-y-1">
              <HardDrive className="w-4 h-4 mx-auto text-purple-400" />
              <p className="text-[11px] font-medium text-slate-300">Zero Proxy</p>
            </div>
          </div>

          {/* Login Actions */}
          <div className="space-y-4">
            <GoogleLoginBtn />

            {/* Quick Demo Access Link */}
            <div className="pt-2">
              <Link
                href="/web"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-all group"
              >
                <span>Enter Demo Mode (No Auth Needed)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[11px] text-slate-400/60">
            Protected by Supabase PKCE OAuth 2.0 &amp; Serverless Edge Security
          </p>
        </div>
      </div>
    </div>
  );
}
