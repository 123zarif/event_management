'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ExternalLink } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPrintWindow = () => {
    if (!containerRef.current) return;
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;

    const htmlContent = containerRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Accreditation Badges — ${eventTitle}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #fff;
              color: #000;
              margin: 0;
              padding: 0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .badge-card {
              border: 2px dashed #4b5563;
              border-radius: 8px;
              padding: 18px;
              height: 250px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              break-inside: avoid;
              background: #fff;
            }
            .top-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .fest-title {
              font-size: 10px;
              font-family: monospace;
              font-weight: bold;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .event-title {
              font-size: 13px;
              font-weight: 700;
              color: #111827;
              margin: 2px 0 0 0;
            }
            .role-badge {
              font-size: 10px;
              font-family: monospace;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 4px;
              background: #f3f4f6;
              color: #111827;
              border: 1px solid #d1d5db;
            }
            .middle {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: auto 0;
              gap: 16px;
            }
            .name {
              font-size: 17px;
              font-weight: 800;
              color: #000;
              margin: 0 0 4px 0;
            }
            .team {
              font-size: 12px;
              font-weight: 600;
              color: #4f46e5;
              margin: 0 0 4px 0;
            }
            .institution {
              font-size: 11px;
              color: #4b5563;
              margin: 0 0 4px 0;
            }
            .ticket-id {
              font-size: 10px;
              font-family: monospace;
              color: #6b7280;
              margin: 0;
            }
            .qr-box {
              padding: 6px;
              background: #fff;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              flex-shrink: 0;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              font-family: monospace;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Header controls (strictly hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 no-print shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Accreditation Badges ({badges.length} Attendees)
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Printable 2-column A4 grid with cut guides and QR tokens for {eventTitle}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenPrintWindow}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Standalone Print Window</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Badges Now</span>
          </button>
        </div>
      </div>

      {/* Badges Container */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 w-full"
      >
        {badges.length === 0 ? (
          <div className="col-span-2 p-8 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-500 shadow-xs">
            No confirmed or checked-in attendees for this competition yet.
          </div>
        ) : (
          badges.map((b) => (
            <div
              key={b.ticketCode}
              className="badge-card print-badge-item rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5 print:border-black print:bg-white print:text-black flex flex-col justify-between h-64 relative overflow-hidden shadow-xs"
            >
              {/* Top Bar */}
              <div className="top-bar flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 print:border-gray-300 pb-2">
                <div>
                  <p className="fest-title text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 print:text-gray-700 font-bold">
                    {b.festTitle}
                  </p>
                  <p className="event-title text-xs font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {b.eventTitle}
                  </p>
                </div>
                <span className="role-badge text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 print:bg-gray-100 text-zinc-800 dark:text-zinc-300 print:text-black font-semibold border border-zinc-200 dark:border-zinc-700">
                  {b.role}
                </span>
              </div>

              {/* Middle: Name & QR */}
              <div className="middle flex items-center justify-between gap-4 my-auto">
                <div className="space-y-1">
                  <h3 className="name text-base font-bold text-zinc-900 dark:text-zinc-100 print:text-black leading-tight">
                    {b.name}
                  </h3>
                  {b.teamName && (
                    <p className="team text-xs text-violet-600 dark:text-violet-400 print:text-gray-800 font-semibold">
                      Team: {b.teamName}
                    </p>
                  )}
                  <p className="institution text-[11px] text-zinc-500 dark:text-zinc-400 print:text-gray-600 truncate max-w-[200px]">
                    {b.institution || 'Dhaka Residential Model College'}
                  </p>
                  <p className="ticket-id text-[10px] font-mono text-zinc-400 dark:text-zinc-500 print:text-gray-500 pt-1">
                    ID: {b.ticketCode}
                  </p>
                </div>

                {/* QR Code */}
                <div className="qr-box p-1.5 bg-white rounded border border-zinc-200 dark:border-zinc-700 print:border-gray-400 flex-shrink-0 shadow-xs">
                  <QRCodeSVG
                    value={JSON.stringify({ ticket: b.ticketCode, name: b.name })}
                    size={80}
                    level="M"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="footer border-t border-zinc-200 dark:border-zinc-800 print:border-gray-300 pt-1.5 flex justify-between items-center text-[9px] font-mono text-zinc-500 print:text-gray-600">
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
