"use client";

import React from "react";

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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-[#2a2a35] bg-[#141420] ${className}`}>
            {children}
        </div>
    );
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-500/20 text-blue-400",
        gray: "bg-white/[0.06] text-white/60",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colors[color] || colors.blue}`}>
            {children}
        </span>
    );
}

export default function PreviewPage() {
    const fmt = (n: number) => `US$ ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n)}`;

    return (
        <div className="min-h-screen bg-[#0c0c14] text-[#e8e8ef] p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Hero */}
                <Card className="p-8 relative overflow-hidden">
                    <div className="absolute top-4 right-6 opacity-[0.04]">
                        <Scale className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge color="blue">{currentCase.status}</Badge>
                            <Badge color="gray">{currentCase.caseType}</Badge>
                            <span className="text-sm text-white/35">{currentCase.dateRange}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{currentCase.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-white/50 mb-6">
                            <p><strong className="text-white/70">Actor:</strong> {currentCase.plaintiff.name}</p>
                            <p><strong className="text-white/70">Demandado:</strong> {currentCase.defendant.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors">
                                <Scale className="w-4 h-4 mr-2" />
                                Ir a Estrategia
                            </button>
                            <button className="inline-flex items-center px-5 py-2.5 rounded-xl border border-[#2a2a35] text-white/70 font-medium text-sm hover:bg-white/[0.05] transition-colors">
                                <Target className="w-4 h-4 mr-2" />
                                Iniciar Simulación
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "TOTAL DEUDA", value: fmt(currentCase.totalDebt), Icon: DollarSign, border: "border-t-red-500", text: "text-red-400", icon: "text-red-400/40" },
                        { label: "TOTAL PAGADO", value: fmt(currentCase.totalPaid), Icon: DollarSign, border: "border-t-green-500", text: "text-green-400", icon: "text-green-400/40" },
                        { label: "EVIDENCIA", value: "124", Icon: Folder, border: "border-t-blue-500", text: "text-white", icon: "text-blue-400/40" },
                        { label: "TRANSCRIPCIONES", value: "12", Icon: MessageSquare, border: "border-t-purple-500", text: "text-white", icon: "text-purple-400/40" },
                    ].map((s, i) => (
                        <Card key={i} className={`p-5 border-t-2 ${s.border}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{s.label}</h3>
                                <s.Icon className={`w-4 h-4 ${s.icon}`} />
                            </div>
                            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                        </Card>
                    ))}
                </div>

                {/* Activity + Embargos */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="text-lg font-bold text-white">Actividad Reciente</h2>
                        <Card className="p-6">
                            <div className="space-y-6">
                                {[
                                    { Icon: Folder, bg: "bg-blue-500/10", ic: "text-blue-400", title: "Nuevos PDF procesados", desc: "Se ingresaron 14 PDFs sobre estado de cuenta bancaria", time: "Hace 2 horas" },
                                    { Icon: Scale, bg: "bg-purple-500/10", ic: "text-purple-400", title: "Actualización de estrategia", desc: "El cargo de 'Usura' fue actualizado con nueva evidencia", time: "Ayer" },
                                    { Icon: MessageSquare, bg: "bg-green-500/10", ic: "text-green-400", title: "Transcripción completada", desc: "Audio WhatsApp #14 procesado exitosamente", time: "Hace 2 días" },
                                    { Icon: Calendar, bg: "bg-white/[0.05]", ic: "text-white/40", title: "Cambio de estado", desc: "El caso pasó a Fase de Ejecución", time: "Hace 3 días" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${item.bg}`}>
                                            <item.Icon className={`w-5 h-5 ${item.ic}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/85">{item.title}</p>
                                            <p className="text-sm text-white/40 mt-0.5">{item.desc}</p>
                                            <p className="text-xs text-white/25 mt-2">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-white">Estado de Embargos</h2>
                        <Card className="p-6 border-l-2 border-l-yellow-500/60">
                            <h3 className="font-bold text-yellow-400 mb-2">Acción Requerida</h3>
                            <p className="text-sm text-white/45 mb-6 leading-relaxed">
                                Tenés 2 cuentas bancarias pendientes de embargo y no fueron localizadas por el sistema oficial.
                            </p>
                            <button className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#2a2a35] text-white/80 text-sm font-medium hover:bg-white/[0.08] transition-colors">
                                Corregir Oficios
                            </button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
