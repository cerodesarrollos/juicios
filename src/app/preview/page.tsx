"use client";

import React from "react";

// Simple icon components
function Scale({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18m-9-6l3-9h12l3 9M3 15h6m6 0h6"/></svg> }
function Target({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
function DollarSign({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20m5-17H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7"/></svg> }
function Folder({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg> }
function MessageSquare({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> }
function Calendar({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> }

const currentCase = {
    title: "Toro, Franco Chaves s/ Estafa y Defraudacion",
    status: "En investigacion",
    plaintiff: { name: "Matias Rodriguez" },
    defendant: { name: "Franco Chaves (Toro)" },
    totalDebt: 45000,
    totalPaid: 15000,
    evidenceCount: 124,
    transcriptionCount: 12,
    dateRange: "Mar 2023 - Presente",
    caseType: "Penal Económico",
};

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] ${className}`}>
            {children}
        </div>
    );
}

function GlassBadge({ children, color = "cyan" }: { children: React.ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
        purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
        green: "bg-green-500/15 text-green-400 border-green-500/20",
        red: "bg-red-500/15 text-red-400 border-red-500/20",
        blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
        white: "bg-white/[0.06] text-white/60 border-white/10",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${colors[color] || colors.cyan}`}>
            {children}
        </span>
    );
}

export default function PreviewPage() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-[#f0f0f0]">
            {/* Aurora */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-[600px] h-[600px] rounded-full top-[-200px] left-[-100px] blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
                <div className="absolute w-[500px] h-[500px] rounded-full bottom-[-150px] right-[-100px] blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', animation: 'float 12s ease-in-out infinite -4s' }} />
                <div className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)', animation: 'float 12s ease-in-out infinite -8s' }} />
            </div>

            {/* Grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }} />

            <div className="relative z-10 p-6 max-w-6xl mx-auto space-y-6">
                {/* Hero */}
                <GlassCard className="p-8 border-l-[3px] border-l-blue-500/50">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Scale className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center space-x-3 mb-4">
                            <GlassBadge color="blue">{currentCase.status}</GlassBadge>
                            <GlassBadge color="white">{currentCase.caseType}</GlassBadge>
                            <span className="text-sm text-white/40">{currentCase.dateRange}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            {currentCase.title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-white/50 mb-6">
                            <p><strong className="text-white/70">Actor:</strong> {currentCase.plaintiff.name}</p>
                            <p><strong className="text-white/70">Demandado:</strong> {currentCase.defendant.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-6">
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3),0_0_60px_rgba(168,85,247,0.15)] hover:-translate-y-0.5">
                                <Scale className="w-4 h-4 mr-2" />
                                Ir a Estrategia
                            </button>
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 font-semibold text-sm transition-all duration-300 hover:bg-white/[0.1] hover:border-white/20">
                                <Target className="w-4 h-4 mr-2" />
                                Iniciar Simulación
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Deuda", value: formatCurrency(currentCase.totalDebt), Icon: DollarSign, accent: "border-l-red-500/50", textColor: "text-red-400", iconColor: "text-red-400/60" },
                        { label: "Total Pagado", value: formatCurrency(currentCase.totalPaid), Icon: DollarSign, accent: "border-l-green-500/50", textColor: "text-green-400", iconColor: "text-green-400/60" },
                        { label: "Evidencia", value: currentCase.evidenceCount, Icon: Folder, accent: "border-l-blue-500/50", textColor: "text-blue-400", iconColor: "text-blue-400/60" },
                        { label: "Transcripciones", value: currentCase.transcriptionCount, Icon: MessageSquare, accent: "border-l-purple-500/50", textColor: "text-purple-400", iconColor: "text-purple-400/60" },
                    ].map((s, i) => (
                        <GlassCard key={i} className={`p-5 border-l-[3px] ${s.accent} group`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white/40 text-xs uppercase tracking-wider">{s.label}</h3>
                                <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
                            </div>
                            <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Activity + Embargos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-white/90">Actividad Reciente</h2>
                        <GlassCard className="p-6">
                            <div className="space-y-6">
                                {[
                                    { Icon: Folder, bg: "bg-blue-500/10", ic: "text-blue-400", title: "Nuevos PDF procesados", desc: "Se ingresaron 14 PDFs sobre estado de cuenta bancaria", time: "Hace 2 horas" },
                                    { Icon: Scale, bg: "bg-purple-500/10", ic: "text-purple-400", title: "Actualización de estrategia", desc: "El cargo de 'Usura' fue actualizado con nueva evidencia", time: "Ayer" },
                                    { Icon: MessageSquare, bg: "bg-green-500/10", ic: "text-green-400", title: "Transcripción completada", desc: "Audio WhatsApp #14 procesado exitosamente", time: "Hace 2 días" },
                                    { Icon: Calendar, bg: "bg-white/[0.05]", ic: "text-white/50", title: "Cambio de estado", desc: "El caso pasó a Fase de Ejecución", time: "Hace 3 días" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${item.bg}`}>
                                            <item.Icon className={`w-5 h-5 ${item.ic}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/80">{item.title}</p>
                                            <p className="text-sm text-white/40 mt-0.5">{item.desc}</p>
                                            <p className="text-xs text-white/25 mt-2">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white/90">Estado de Embargos</h2>
                        <GlassCard className="p-6 border-l-[3px] border-l-yellow-500/50">
                            <h3 className="font-semibold text-yellow-400 mb-2">Acción Requerida</h3>
                            <p className="text-sm text-yellow-400/60 mb-4">
                                Tenés 2 cuentas bancarias pendientes de embargo y no fueron localizadas por el sistema oficial.
                            </p>
                            <button className="w-full px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium transition-all duration-300 hover:bg-yellow-500/20 hover:border-yellow-500/30 hover:shadow-[0_0_16px_rgba(234,179,8,0.1)]">
                                Corregir Oficios
                            </button>
                        </GlassCard>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
            `}</style>
        </div>
    );
}
