'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyAndCheckInTicket } from '@/actions/registration';
import { QrCode, ArrowLeft, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScannedRegistration {
  id: string;
  ticketCode: string;
  user: { name: string; email?: string };
  event: { title: string };
}

export default function AdminScannerPage() {
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    registration?: ScannedRegistration;
  } | null>(null);

  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedHistory, setScannedHistory] = useState<ScannedRegistration[]>([]);

  // Synthesize instant audio beep for operational validation
  const playSound = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        // High pleasant ding
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        // Low double buzz
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not permitted yet
    }
  };

  const handleTicketVerification = async (ticketCode: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me');
      const user = await userRes.json();
      const res = await verifyAndCheckInTicket(ticketCode.trim(), user?.id);

      playSound(res.success);
      setScanResult(res);

      if (res.success && res.registration) {
        setScannedHistory((prev) => [res.registration, ...prev]);
        toast.success(`Check-in verified: ${res.registration.user.name}`);
      } else {
        toast.error(res.message);
      }
    } catch {
      playSound(false);
      setScanResult({ success: false, message: 'Verification network error' });
    } finally {
      setLoading(false);
    }
  };

  const verificationRef = React.useRef(handleTicketVerification);
  useEffect(() => {
    verificationRef.current = handleTicketVerification;
  });

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    try {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          let code = decodedText;
          try {
            const parsed = JSON.parse(decodedText);
            if (parsed.ticketCode) code = parsed.ticketCode;
            if (parsed.ticket) code = parsed.ticket;
          } catch {
            // Raw string code
          }
          verificationRef.current(code);
        },
        () => {
          // ignore scan frame misses
        }
      );
    } catch (err) {
      console.warn('Camera scanner initialization failed:', err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleTicketVerification(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <QrCode className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Webcam Gate Check-In Scanner
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Physical gate accreditation tool. Stream camera to scan attendee passes or input ticket code manually.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-md font-mono">
          <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Audio Feedback Active</span>
        </div>
      </div>

      {/* Main Grid: Scanner on Left, Status on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Scanner Viewport */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 overflow-hidden shadow-xs">
            <div id="qr-reader" className="w-full text-zinc-900 dark:text-zinc-100 overflow-hidden rounded-lg"></div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2 shadow-xs">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Or enter ticket code manually (e.g. TC26-AIW-001)..."
              className="flex-1 px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-xs focus:border-violet-600 outline-none uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Live Validation Result & Recent Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Result Banner */}
          {scanResult ? (
            <div
              className={`p-5 rounded-xl border space-y-3 shadow-xs ${
                scanResult.success
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {scanResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{scanResult.success ? 'CHECK-IN CONFIRMED' : 'VALIDATION FAILED'}</span>
              </div>

              <p className="text-xs">{scanResult.message}</p>

              {scanResult.registration && (
                <div className="border-t border-emerald-200 dark:border-emerald-800/80 pt-3 space-y-1 text-xs text-zinc-800 dark:text-zinc-200">
                  <p><span className="text-zinc-500 dark:text-zinc-400 font-mono">Attendee:</span> {scanResult.registration.user.name}</p>
                  <p><span className="text-zinc-500 dark:text-zinc-400 font-mono">Event:</span> {scanResult.registration.event.title}</p>
                  <p><span className="text-zinc-500 dark:text-zinc-400 font-mono">Ticket:</span> {scanResult.registration.ticketCode}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center text-xs text-zinc-500 space-y-2 shadow-xs">
              <QrCode className="h-8 w-8 mx-auto text-zinc-400 dark:text-zinc-600" />
              <p className="font-medium text-zinc-700 dark:text-zinc-400">Scanner Ready</p>
              <p>Point camera at participant QR pass or type ticket code.</p>
            </div>
          )}

          {/* Recent Scanned Queue */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono text-zinc-700 dark:text-zinc-400 tracking-wider">
              Recent Gate Check-Ins ({scannedHistory.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scannedHistory.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono">No scans in this session yet.</p>
              ) : (
                scannedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center text-xs shadow-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-200">{item.user.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{item.ticketCode}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-medium">
                      ✓ In
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
