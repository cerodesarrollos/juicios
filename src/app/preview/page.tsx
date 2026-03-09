"use client";

import React, { useState } from "react";

/* ── SVG Icons (stroke-based, monochrome) ── */
function IconCloud({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 32V20m0 0l-5 5m5-5l5 5" />
            <path d="M16 36h16a10 10 0 001-19.95A12 12 0 109 24a10 10 0 007 12z" />
        </svg>
    );
}

function IconScale({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 6v36M6 18l6-12h24l6 12M6 18h12M30 18h12" />
            <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
            <circle cx="36" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function IconFolder({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 14v20a4 4 0 004 4h28a4 4 0 004-4V18a4 4 0 00-4-4H24l-4-4H10a4 4 0 00-4 4z" />
        </svg>
    );
}

function IconChat({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M42 30a4 4 0 01-4 4H14l-8 8V10a4 4 0 014-4h28a4 4 0 014 4z" />
        </svg>
    );
}

function IconDollar({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 4v40m10-34H19a7 7 0 000 14h10a7 7 0 010 14H14" />
        </svg>
    );
}

function IconTarget({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="20" />
            <circle cx="24" cy="24" r="12" />
            <circle cx="24" cy="24" r="4" />
        </svg>
    );
}

function IconCalendar({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="8" width="36" height="36" rx="4" />
            <path d="M32 4v8M16 4v8M6 20h36" />
        </svg>
    );
}

function IconAlert({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 18v8m0 6h.02" />
            <path d="M21.17 6.98L3.87 36a3 3 0 002.63 4.5h34.5a3 3 0 002.63-4.5L26.83 6.98a3 3 0 00-5.66 0z" />
        </svg>
    );
}

/* ── Components ── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/[0.08] bg-[#161618] ${className}`}>
            {children}
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest">{label}</span>
                <div className="text-white/20">{icon}</div>
            </div>
            <p className="text-[28px] font-semibold text-white/90 leading-none">{value}</p>
        </Card>
    );
}

function ActivityItem({ icon, title, desc, time }: { icon: React.ReactNode; title: string; desc: string; time: string }) {
    return (
        <div className="flex gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
            <div className="mt-0.5 p-2.5 rounded-xl bg-white/[0.04] shrink-0 text-white/30">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-medium text-white/80">{title}</p>
                <p className="text-[13px] text-white/30 mt-0.5">{desc}</p>
                <p className="text-[11px] text-white/15 mt-1.5">{time}</p>
            </div>
        </div>
    );
}

/* ── Page ── */

const currentCase = {
    title: "Toro, Franco Chaves s/ Estafa y Defraudacion",
    status: "En investigacion",
    plaintiff: "Matias Rodriguez",
    defendant: "Franco Chaves (Toro)",
    totalDebt: 45000,
    totalPaid: 15000,
    evidenceCount: 124,
    transcriptionCount: 12,
    dateRange: "Mar 2023 - Presente",
    caseType: "Penal Económico",
};

export default function PreviewPage() {
    const fmt = (n: number) => `US$ ${n.toLocaleString("es-AR")}`;

    return (
        <div className="min-h-screen bg-[#0e0e10] text-white antialiased">
            <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-5">

                {/* ── Hero ── */}
                <Card className="p-7 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-[0.03]">
                        <IconScale className="w-44 h-44" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium bg-white/[0.06] text-white/50">
                                {currentCase.status}
                            </span>
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium bg-white/[0.04] text-white/30">
                                {currentCase.caseType}
                            </span>
                            <span className="text-[12px] text-white/20 ml-1">{currentCase.dateRange}</span>
                        </div>

                        <h1 className="text-[26px] font-bold text-white/95 tracking-tight mb-3">
                            {currentCase.title}
                        </h1>

                        <div className="flex items-center gap-8 text-[13px] text-white/35 mb-7">
                            <span><span className="text-white/55">Actor:</span> {currentCase.plaintiff}</span>
                            <span><span className="text-white/55">Demandado:</span> {currentCase.defendant}</span>
                        </div>

                        <div className="flex gap-3">
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white/90 text-[#0e0e10] font-semibold text-[13px] hover:bg-white transition-colors">
                                <IconScale className="w-4 h-4 mr-2" />
                                Ir a Estrategia
                            </button>
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl border border-white/[0.1] text-white/50 font-medium text-[13px] hover:bg-white/[0.04] transition-colors">
                                <IconTarget className="w-4 h-4 mr-2" />
                                Iniciar Simulacion
                            </button>
                        </div>
                    </div>
                </Card>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Deuda" value={fmt(currentCase.totalDebt)} icon={<IconDollar className="w-4 h-4" />} />
                    <StatCard label="Total Pagado" value={fmt(currentCase.totalPaid)} icon={<IconDollar className="w-4 h-4" />} />
                    <StatCard label="Evidencia" value="124" icon={<IconFolder className="w-4 h-4" />} />
                    <StatCard label="Transcripciones" value="12" icon={<IconChat className="w-4 h-4" />} />
                </div>

                {/* ── Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Activity */}
                    <div className="lg:col-span-3 space-y-3">
                        <h2 className="text-[15px] font-semibold text-white/70 pl-1">Actividad Reciente</h2>
                        <Card className="px-6 py-2">
                            <ActivityItem
                                icon={<IconFolder className="w-[18px] h-[18px]" />}
                                title="Nuevos PDF procesados"
                                desc="Se ingresaron 14 PDFs sobre estado de cuenta bancaria"
                                time="Hace 2 horas"
                            />
                            <ActivityItem
                                icon={<IconScale className="w-[18px] h-[18px]" />}
                                title="Actualizacion de estrategia"
                                desc="El cargo de 'Usura' fue actualizado con nueva evidencia"
                                time="Ayer"
                            />
                            <ActivityItem
                                icon={<IconChat className="w-[18px] h-[18px]" />}
                                title="Transcripcion completada"
                                desc="Audio WhatsApp #14 procesado exitosamente"
                                time="Hace 2 dias"
                            />
                            <ActivityItem
                                icon={<IconCalendar className="w-[18px] h-[18px]" />}
                                title="Cambio de estado"
                                desc="El caso paso a Fase de Ejecucion"
                                time="Hace 3 dias"
                            />
                        </Card>
                    </div>

                    {/* Embargos */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-[15px] font-semibold text-white/70 pl-1">Estado de Embargos</h2>
                        <Card className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/[0.04] shrink-0 text-white/30">
                                    <IconAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-semibold text-white/80">Accion Requerida</h3>
                                    <p className="text-[13px] text-white/30 mt-1.5 leading-relaxed">
                                        Tenes 2 cuentas bancarias pendientes de embargo y no fueron localizadas por el sistema oficial.
                                    </p>
                                </div>
                            </div>
                            <button className="w-full mt-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors">
                                Corregir Oficios
                            </button>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
