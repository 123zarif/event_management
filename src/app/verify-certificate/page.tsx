import React from 'react';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface VerifyPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function VerifyCertificatePage({ searchParams }: VerifyPageProps) {
  const { code } = await searchParams;

  const certificate = code
    ? await prisma.certificate.findFirst({
        where: {
          OR: [
            { code: { equals: code.trim(), mode: 'insensitive' } },
            { verificationHash: { equals: code.trim(), mode: 'insensitive' } },
          ],
        },
      })
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 mb-2">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Official Credential Verification
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
          Verify the authenticity of digital certificates issued by Dhaka Residential Model College IT Club.
        </p>
      </div>

      {/* Lookup Bar */}
      <form method="GET" action="/verify-certificate" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            name="code"
            defaultValue={code || ''}
            placeholder="Enter Certificate Code (e.g. CERT-DRMC-2026-0089) or Hash..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs font-mono focus:border-violet-600 outline-none shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
        >
          Verify
        </button>
      </form>

      {/* Verification Result Card */}
      {code && (
        <div>
          {certificate ? (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-zinc-950 p-8 shadow-md dark:shadow-2xl relative overflow-hidden space-y-6">
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-mono">
                    Authentic Verified Credential
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {certificate.code}
                </span>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-4 py-4">
                <p className="text-xs uppercase font-mono text-zinc-500 tracking-widest">
                  This certifies that
                </p>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {certificate.recipientName}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  has officially participated in and successfully achieved recognition at the{' '}
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">{certificate.eventName}</span> during the{' '}
                  <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{certificate.festName}</span>.
                </p>
              </div>

              {/* Security & Verification Metadata */}
              <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-mono text-zinc-500">Date of Issuance</p>
                  <p className="font-medium text-zinc-800 dark:text-zinc-300 mt-0.5">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-zinc-500">Verification Hash</p>
                  <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{certificate.verificationHash}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 space-y-2">
              <p className="font-semibold text-sm">Certificate Record Not Found</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                No official credential matched code &ldquo;{code}&rdquo;. Please verify the serial number or contact the organizers.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
