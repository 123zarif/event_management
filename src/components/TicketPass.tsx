'use client';

import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Printer, WifiOff, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import confetti from 'canvas-confetti';

interface TicketPassProps {
  registration: {
    id: string;
    ticketCode: string;
    status: string;
    qrCodeData: string;
    checkedInAt?: Date | string | null;
    createdAt: Date | string;
    user: {
      name: string;
      email: string;
      institution?: string | null;
    };
    event: {
      title: string;
      category: string;
      venue: string;
      eventDate: Date | string;
      fest: {
        title: string;
        location: string;
      };
    };
    team?: {
      name: string;
      inviteCode: string;
    } | null;
  };
  triggerConfetti?: boolean;
}

export function TicketPass({ registration, triggerConfetti = false }: TicketPassProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Trigger celebratory confetti if newly registered
    if (triggerConfetti) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#3b82f6', '#10b981'],
        });
      } catch {
        // ignore
      }
    }

    // 2. Cache ticket in LocalStorage for offline auditorium access
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `clubsphere_pass_${registration.ticketCode}`,
          JSON.stringify(registration)
        );
      }
    } catch {
      // ignore
    }
  }, [registration, triggerConfetti]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIcs = () => {
    const event = registration.event;
    const dateObj = new Date(event.eventDate);
    const startStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endStr = new Date(dateObj.getTime() + 4 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClubSphere//DRMC Tech Carnival//EN',
      'BEGIN:VEVENT',
      `UID:${registration.ticketCode}@drmcitclub.org`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${event.title} - ${event.fest.title}`,
      `DESCRIPTION:Accreditation Pass: ${registration.ticketCode} - ${registration.user.name}`,
      `LOCATION:${event.venue}, ${event.fest.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${registration.ticketCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Offline sync note */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-4 no-print">
        <WifiOff className="h-3 w-3 text-emerald-500" />
        <span>Cached locally: this pass displays offline without internet connection.</span>
      </div>

      {/* Main E-Ticket Card */}
      <div
        ref={cardRef}
        className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-md dark:shadow-2xl relative overflow-hidden transition-colors"
      >
        {/* Ticket Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400 font-bold">
                {registration.event.fest.title}
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {registration.event.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Ticket: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{registration.ticketCode}</span>
            </p>
          </div>
          <StatusBadge status={registration.status} />
        </div>

        {/* Middle Section: Attendee details & QR code */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center mb-6">
          <div className="sm:col-span-3 space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500">Attendee Name</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">{registration.user.name}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{registration.user.email}</p>
              {registration.user.institution && (
                <p className="text-zinc-500 text-[11px] truncate">{registration.user.institution}</p>
              )}
            </div>

            {registration.team && (
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Team</p>
                <p className="font-medium text-violet-600 dark:text-violet-400">
                  {registration.team.name}
                  <span className="text-zinc-500 font-mono text-[10px] ml-2">
                    ({registration.team.inviteCode})
                  </span>
                </p>
              </div>
            )}

            <div className="pt-1">
              <p className="text-[10px] uppercase font-mono text-zinc-500 mb-0.5">Date & Venue</p>
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>{formatDateTime(registration.event.eventDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>{registration.event.venue}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="sm:col-span-2 flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
            <div className="p-2 bg-white rounded-md shadow-xs">
              <QRCodeSVG
                value={registration.qrCodeData}
                size={120}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-2 text-center">
              Scan at Venue Gate
            </p>
          </div>
        </div>

        {/* Check-in status footer */}
        {registration.checkedInAt && (
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3 text-[11px] text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Checked in on {formatDateTime(registration.checkedInAt)}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-6 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <Printer className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          Print E-Ticket
        </button>

        <button
          onClick={handleDownloadIcs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          Add to iCal / Google Calendar
        </button>
      </div>
    </div>
  );
}
