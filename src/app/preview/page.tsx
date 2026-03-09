"use client";

import React from "react";

/* ── SVG Icons ── */
function IconScale({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 6v36M6 18l6-12h24l6 12M6 18h12M30 18h12" /><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="36" cy="18" r="1" fill="currentColor" stroke="none" /></svg>;
}
function IconTarget({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="20" /><circle cx="24" cy="24" r="12" /><circle cx="24" cy="24" r="4" /></svg>;
}
function IconFolder({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14v20a4 4 0 004 4h28a4 4 0 004-4V18a4 4 0 00-4-4H24l-4-4H10a4 4 0 00-4 4z" /></svg>;
}
function IconChat({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M42 30a4 4 0 01-4 4H14l-8 8V10a4 4 0 014-4h28a4 4 0 014 4z" /></svg>;
}
function IconDollar({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4v40m10-34H19a7 7 0 000 14h10a7 7 0 010 14H14" /></svg>;
}
function IconCalendar({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="36" height="36" rx="4" /><path d="M32 4v8M16 4v8M6 20h36" /></svg>;
}
function IconAlert({ className = "" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 18v8m0 6h.02" /><path d="M21.17 6.98L3.87 36a3 3 0 002.63 4.5h34.5a3 3 0 002.63-4.5L26.83 6.98a3 3 0 00-5.66 0z" /></svg>;
}

/* ── Premium Card with gradient border + inner glow ── */
function Card({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
    return (
        <div className={`relative rounded-2xl ${className}`}>
            {/* Gradient border layer */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] pointer-events-none" />
            {/* Card body */}
            <div className={`relative rounded-2xl bg-gradient-to-b from-[#1a1a1f] to-[#141417] ${glow ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.03),0_8px_40px_-12px_rgba(0,0,0,0.7)]" : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.03),0_4px_24px_-8px_rgba(0,0,0,0.5)]"}`}>
                {children}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <Card>
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-medium text-white/25 uppercase tracking-[0.12em]">{label}</span>
                    <div className="text-white/15">{icon}</div>
                </div>
                <p className="text-[26px] font-semibold text-white/90 leading-none tracking-tight">{value}</p>
            </div>
        </Card>
    );
}

function ActivityItem({ icon, title, desc, time, last = false }: { icon: React.ReactNode; title: string; desc: string; time: string; last?: boolean }) {
    return (
        <div className={`flex gap-4 py-4 ${!last ? "border-b border-white/[0.04]" : ""}`}>
            <div className="mt-0.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0 text-white/25">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-medium text-white/80 leading-snug">{title}</p>
                <p className="text-[13px] text-white/25 mt-1">{desc}</p>
                <p className="text-[11px] text-white/10 mt-1.5 font-medium">{time}</p>
            </div>
        </div>
    );
}

/* ── Data ── */
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
    caseType: "Penal Economico",
};

export default function PreviewPage() {
    const fmt = (n: number) => `US$ ${n.toLocaleString("es-AR")}`;

    return (
        <div className="min-h-screen bg-[#0b0b0e] text-white antialiased selection:bg-white/10">
            {/* Subtle radial gradient on bg */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.015) 0%, transparent 100%)"
            }} />
            {/* Noise texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px 128px"
            }} />

            <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 space-y-5">

                {/* ── Hero ── */}
                <Card glow>
                    <div className="p-8 relative overflow-hidden">
                        <div className="absolute -top-6 -right-4 opacity-[0.025]">
                            <IconScale className="w-48 h-48" />
                        </div>
                        {/* Subtle top highlight */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium bg-white/[0.06] text-white/50 border border-white/[0.06]">
                                    {currentCase.status}
                                </span>
                                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium bg-white/[0.03] text-white/25 border border-white/[0.04]">
                                    {currentCase.caseType}
                                </span>
                                <span className="text-[12px] text-white/15 ml-1">{currentCase.dateRange}</span>
                            </div>

                            <h1 className="text-[28px] font-bold text-white/95 tracking-tight mb-3 leading-tight">
                                {currentCase.title}
                            </h1>

                            <div className="flex items-center gap-8 text-[13px] text-white/30 mb-8">
                                <span><span className="text-white/50 font-medium">Actor:</span> {currentCase.plaintiff}</span>
                                <span><span className="text-white/50 font-medium">Demandado:</span> {currentCase.defendant}</span>
                            </div>

                            <div className="flex gap-3">
                                <button className="group inline-flex items-center px-5 py-2.5 rounded-xl bg-white/90 text-[#0b0b0e] font-semibold text-[13px] transition-all duration-200 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <IconScale className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-80 transition-opacity" />
                                    Ir a Estrategia
                                </button>
                                <button className="group inline-flex items-center px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/45 font-medium text-[13px] transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-white/60">
                                    <IconTarget className="w-4 h-4 mr-2 opacity-40 group-hover:opacity-60 transition-opacity" />
                                    Iniciar Simulacion
                                </button>
                            </div>
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

                {/* ── Content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-3 space-y-3">
                        <h2 className="text-[14px] font-semibold text-white/50 pl-1 tracking-wide">Actividad Reciente</h2>
                        <Card>
                            <div className="px-6 py-2">
                                {/* Top highlight line */}
                                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                                <ActivityItem icon={<IconFolder className="w-[18px] h-[18px]" />} title="Nuevos PDF procesados" desc="Se ingresaron 14 PDFs sobre estado de cuenta bancaria" time="Hace 2 horas" />
                                <ActivityItem icon={<IconScale className="w-[18px] h-[18px]" />} title="Actualizacion de estrategia" desc="El cargo de 'Usura' fue actualizado con nueva evidencia" time="Ayer" />
                                <ActivityItem icon={<IconChat className="w-[18px] h-[18px]" />} title="Transcripcion completada" desc="Audio WhatsApp #14 procesado exitosamente" time="Hace 2 dias" />
                                <ActivityItem icon={<IconCalendar className="w-[18px] h-[18px]" />} title="Cambio de estado" desc="El caso paso a Fase de Ejecucion" time="Hace 3 dias" last />
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-[14px] font-semibold text-white/50 pl-1 tracking-wide">Estado de Embargos</h2>
                        <Card>
                            <div className="p-6">
                                <div className="flex items-start gap-3.5 mb-5">
                                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0 text-white/25">
                                        <IconAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-semibold text-white/80">Accion Requerida</h3>
                                        <p className="text-[13px] text-white/25 mt-1.5 leading-relaxed">
                                            Tenes 2 cuentas bancarias pendientes de embargo y no fueron localizadas por el sistema oficial.
                                        </p>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 text-[13px] font-medium transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.1] hover:text-white/70">
                                    Corregir Oficios
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
