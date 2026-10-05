'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface AttendeeBadge {
  ticketCode: string;
  name: string;
  email: string;
  institution?: string | null;
  role: string;
  eventTitle: string;
  festTitle: string;
  teamName?: string | null;
}

interface PrintBadgeSheetProps {
  badges: AttendeeBadge[];
  eventTitle: string;
}

export function PrintBadgeSheet({ badges, eventTitle }: PrintBadgeSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header controls (hidden when printing) */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 no-print shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Printable Accreditation Badges ({badges.length} Attendees)
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Standard A4 badge grid with cut lines for lanyards and plastic sleeves for {eventTitle}.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print Badge Sheets
        </button>
      </div>

      {/* Printable Grid: 2 columns on A4 paper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
        {badges.length === 0 ? (
          <div className="col-span-2 p-8 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-500 shadow-xs">
            No confirmed or checked-in attendees for this competition yet.
          </div>
        ) : (
          badges.map((b) => (
            <div
              key={b.ticketCode}
              className="rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5 print:border-black print:bg-white print:text-black flex flex-col justify-between h-64 relative overflow-hidden shadow-xs"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 print:border-gray-300 pb-2">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 print:text-gray-700 font-bold">
                    {b.festTitle}
                  </p>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 print:text-black">
                    {b.eventTitle}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 print:bg-gray-100 text-zinc-800 dark:text-zinc-300 print:text-black font-semibold">
                  {b.role}
                </span>
              </div>

              {/* Middle: Name & QR */}
              <div className="flex items-center justify-between gap-4 my-auto">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 print:text-black leading-tight">
                    {b.name}
                  </h3>
                  {b.teamName && (
                    <p className="text-xs text-violet-600 dark:text-violet-400 print:text-gray-800 font-medium">
                      Team: {b.teamName}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 print:text-gray-600 truncate max-w-[200px]">
                    {b.institution || 'Dhaka Residential Model College'}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 print:text-gray-500 pt-1">
                    ID: {b.ticketCode}
                  </p>
                </div>

                {/* QR Code */}
                <div className="p-1.5 bg-white rounded border border-zinc-200 dark:border-zinc-800 print:border-gray-400 flex-shrink-0 shadow-xs">
                  <QRCodeSVG
                    value={JSON.stringify({ ticket: b.ticketCode, name: b.name })}
                    size={80}
                    level="M"
                  />
                </div>
              </div>

              {/* Footer with DRMC branding */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 print:border-gray-300 pt-1.5 flex justify-between items-center text-[9px] font-mono text-zinc-500 print:text-gray-600">
                <span>DRMC IT CLUB · ACCREDITED PARTICIPANT</span>
                <span>OCTOBER 2026</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
