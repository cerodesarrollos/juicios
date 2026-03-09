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

/* ── Card: gradient border trick via padding + rounded clip ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d] ${className}`}>
            <div className="rounded-[19px] bg-[#161619] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
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
                    <span className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.14em]">{label}</span>
                    <div className="text-white/15">{icon}</div>
                </div>
                <p className="text-[26px] font-bold text-white/90 leading-none tracking-tight">{value}</p>
            </div>
        </Card>
    );
}

function ActivityItem({ icon, title, desc, time, last = false }: { icon: React.ReactNode; title: string; desc: string; time: string; last?: boolean }) {
    return (
        <div className={`flex gap-4 py-[18px] ${!last ? "border-b border-white/[0.05]" : ""}`}>
            <div className="mt-0.5 w-10 h-10 rounded-[14px] bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center text-white/30">
                {icon}
            </div>
            <div className="min-w-0 pt-0.5">
                <p className="text-[13px] font-semibold text-white/85 leading-snug">{title}</p>
                <p className="text-[13px] text-white/30 mt-1 leading-relaxed">{desc}</p>
                <p className="text-[11px] text-white/15 mt-1.5 font-medium">{time}</p>
            </div>
        </div>
    );
}

/* ── Data ── */
const c = {
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
        <div className="min-h-screen bg-[#0c0c0f] text-white antialiased">
            {/* Subtle top vignette */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(255,255,255,0.012) 0%, transparent 100%)"
            }} />
            {/* Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "128px 128px"
            }} />

            <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 space-y-5">

                {/* ── Hero ── */}
                <Card>
                    <div className="p-8 relative overflow-hidden">
                        <div className="absolute -top-6 -right-4 opacity-[0.02]">
                            <IconScale className="w-48 h-48" />
                        </div>
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="rounded-full px-3.5 py-1 text-[11px] font-semibold bg-white/[0.07] text-white/55 border border-white/[0.08]">
                                    {c.status}
                                </span>
                                <span className="rounded-full px-3.5 py-1 text-[11px] font-medium bg-white/[0.03] text-white/30 border border-white/[0.05]">
                                    {c.caseType}
                                </span>
                                <span className="text-[12px] text-white/18 ml-1">{c.dateRange}</span>
                            </div>

                            <h1 className="text-[28px] font-bold text-white tracking-tight mb-3 leading-tight">
                                {c.title}
                            </h1>

                            <div className="flex items-center gap-8 text-[13px] text-white/35 mb-8">
                                <span><span className="text-white/55 font-medium">Actor:</span> {c.plaintiff}</span>
                                <span><span className="text-white/55 font-medium">Demandado:</span> {c.defendant}</span>
                            </div>

                            <div className="flex gap-3">
                                <button className="group inline-flex items-center px-6 py-2.5 rounded-[14px] bg-white text-[#0c0c0f] font-bold text-[13px] transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]">
                                    <IconScale className="w-4 h-4 mr-2 opacity-50" />
                                    Ir a Estrategia
                                </button>
                                <button className="group inline-flex items-center px-6 py-2.5 rounded-[14px] border border-white/[0.1] text-white/50 font-semibold text-[13px] transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white/65">
                                    <IconTarget className="w-4 h-4 mr-2 opacity-40" />
                                    Iniciar Simulacion
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Deuda" value={fmt(c.totalDebt)} icon={<IconDollar className="w-[18px] h-[18px]" />} />
                    <StatCard label="Total Pagado" value={fmt(c.totalPaid)} icon={<IconDollar className="w-[18px] h-[18px]" />} />
                    <StatCard label="Evidencia" value="124" icon={<IconFolder className="w-[18px] h-[18px]" />} />
                    <StatCard label="Transcripciones" value="12" icon={<IconChat className="w-[18px] h-[18px]" />} />
                </div>

                {/* ── Content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-3 space-y-3">
                        <h2 className="text-[14px] font-bold text-white/50 pl-1">Actividad Reciente</h2>
                        <Card>
                            <div className="px-6 py-1">
                                <ActivityItem icon={<IconFolder className="w-[18px] h-[18px]" />} title="Nuevos PDF procesados" desc="Se ingresaron 14 PDFs sobre estado de cuenta bancaria" time="Hace 2 horas" />
                                <ActivityItem icon={<IconScale className="w-[18px] h-[18px]" />} title="Actualizacion de estrategia" desc="El cargo de 'Usura' fue actualizado con nueva evidencia" time="Ayer" />
                                <ActivityItem icon={<IconChat className="w-[18px] h-[18px]" />} title="Transcripcion completada" desc="Audio WhatsApp #14 procesado exitosamente" time="Hace 2 dias" />
                                <ActivityItem icon={<IconCalendar className="w-[18px] h-[18px]" />} title="Cambio de estado" desc="El caso paso a Fase de Ejecucion" time="Hace 3 dias" last />
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-[14px] font-bold text-white/50 pl-1">Estado de Embargos</h2>
                        <Card>
                            <div className="p-6">
                                <div className="flex items-start gap-3.5 mb-5">
                                    <div className="w-10 h-10 rounded-[14px] bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center text-white/30">
                                        <IconAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-bold text-white/85">Accion Requerida</h3>
                                        <p className="text-[13px] text-white/30 mt-1.5 leading-relaxed">
                                            Tenes 2 cuentas bancarias pendientes de embargo y no fueron localizadas por el sistema oficial.
                                        </p>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-3 rounded-[14px] bg-white/[0.05] border border-white/[0.07] text-white/55 text-[13px] font-semibold transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white/70">
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
