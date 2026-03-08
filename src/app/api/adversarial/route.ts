import { NextRequest, NextResponse } from 'next/server'
import { AdversarialRound, AdversarialSession } from '@/lib/types'

function mockRound(number: number): AdversarialRound {
  const rounds: AdversarialRound[] = [
    {
      number: 1,
      prosecution: {
        argument: 'El demandado recibio transferencias bancarias por un total de USD 45,000 entre marzo y julio de 2024, segun consta en los comprobantes de transferencia adjuntos. Cada transferencia fue realizada desde la cuenta del demandante con concepto explicito de "prestamo personal", lo cual constituye prueba directa de la obligacion de devolucion.',
        evidence_refs: ['Comprobantes de transferencia P-001 a P-015', 'Extractos bancarios del demandante'],
        legal_articles: ['Art. 1525 CCyC - Contrato de mutuo', 'Art. 1527 CCyC - Obligacion del mutuario'],
        strength: 8,
      },
      defense: {
        counterargument: 'Las transferencias bancarias por si solas no prueban la existencia de un contrato de mutuo. El concepto "prestamo personal" fue colocado unilateralmente por el transferente. No existe contrato firmado, ni testigos del acuerdo, ni comunicacion previa donde se pacten condiciones de devolucion. Las transferencias podrian responder a pagos por servicios, regalos, o aportes societarios informales.',
        evidence_refs: ['Ausencia de contrato escrito', 'Historial de mensajes sin mencion a prestamo'],
        legal_articles: ['Art. 1019 CCyC - Medios de prueba', 'Art. 1020 CCyC - Prueba de los contratos formales'],
        strength: 6,
      },
      round_winner: 'prosecution',
    },
    {
      number: 2,
      prosecution: {
        argument: 'Existen mensajes de WhatsApp donde el demandado reconoce expresamente la deuda y solicita plazos para la devolucion. En fecha 15/08/2024 el demandado escribio: "Ya se que te debo, dame hasta fin de mes". Este reconocimiento constituye prueba confesoria extrajudicial conforme la legislacion vigente.',
        evidence_refs: ['Capturas de WhatsApp certificadas notarialmente', 'Certificacion notarial de fecha 20/09/2024'],
        legal_articles: ['Art. 733 CCyC - Reconocimiento de la obligacion', 'Art. 319 CCyC - Valor probatorio de correspondencia'],
        strength: 9,
      },
      defense: {
        counterargument: 'Las capturas de pantalla de WhatsApp presentadas carecen de certificacion pericial informatica que garantice su integridad. La frase "ya se que te debo" es ambigua y podria referirse a una deuda moral, un favor pendiente, o cualquier otra obligacion no dineraria. Sin peritaje informatico forense, estas pruebas no deberian ser admitidas como confesion extrajudicial.',
        evidence_refs: ['Falta de peritaje informatico', 'Ambiguedad del mensaje citado'],
        legal_articles: ['Art. 287 CCyC - Instrumentos privados y particulares', 'Art. 319 CCyC - Valor probatorio'],
        strength: 5,
      },
      round_winner: 'prosecution',
    },
    {
      number: 3,
      prosecution: {
        argument: 'El demandado no ha podido justificar el origen licito de los fondos recibidos ni demostrar contraprestacion alguna por las sumas transferidas. La carga de la prueba recae sobre quien alega un hecho modificativo o extintivo de la obligacion. El silencio y la falta de justificacion refuerzan la posicion acusatoria.',
        evidence_refs: ['Informe BCRA sobre movimientos del demandado', 'Declaraciones juradas de AFIP'],
        legal_articles: ['Art. 710 CCyC - Carga de la prueba', 'Art. 1028 CCyC - Interpretacion contra el predisponente'],
        strength: 7,
      },
      defense: {
        counterargument: 'La inversion de la carga probatoria no opera automaticamente. Es el demandante quien debe probar la existencia del contrato de mutuo con todos sus elementos: consentimiento, objeto y causa. La mera transferencia de dinero no presupone obligacion de devolucion. Ademas, el demandado ha mantenido una relacion comercial con el demandante que podria explicar los movimientos de fondos.',
        evidence_refs: ['Relacion comercial preexistente', 'Facturas de servicios entre las partes'],
        legal_articles: ['Art. 1013 CCyC - Causa del contrato', 'Art. 710 CCyC - Principio general de carga probatoria'],
        strength: 7,
      },
      round_winner: 'draw',
    },
  ]
  return rounds[(number - 1) % rounds.length]
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { case_id, action, user_input } = body

  if (!case_id || !action) {
    return NextResponse.json({ error: 'case_id y action son requeridos' }, { status: 400 })
  }

  // Mock session — real AI integration comes later
  if (action === 'init') {
    const round1 = mockRound(1)
    const session: AdversarialSession = {
      id: crypto.randomUUID(),
      case_id,
      rounds: [round1],
      overall_score: {
        prosecution: round1.prosecution.strength,
        defense: round1.defense.strength,
        unresolved_points: 2,
        resolved_points: 1,
      },
      status: 'active',
    }
    return NextResponse.json(session)
  }

  if (action === 'auto') {
    const roundNum = (body.current_rounds ?? 0) + 1
    const round = mockRound(roundNum)
    return NextResponse.json({ round })
  }

  if (action === 'counter') {
    const round: AdversarialRound = {
      number: (body.current_rounds ?? 0) + 1,
      prosecution: {
        argument: user_input || 'Argumento manual del usuario.',
        evidence_refs: [],
        legal_articles: [],
        strength: 6,
      },
      defense: {
        counterargument: 'El argumento presentado carece de sustento probatorio suficiente. No se han aportado elementos nuevos que modifiquen la posicion de la defensa. Se solicita que se desestime por falta de fundamentacion adecuada y se mantenga la posicion defensiva establecida en rondas anteriores.',
        evidence_refs: ['Argumentos previos de la defensa'],
        legal_articles: ['Art. 1019 CCyC - Medios de prueba'],
        strength: 5,
      },
      round_winner: 'prosecution',
    }
    return NextResponse.json({ round })
  }

  if (action === 'evaluate') {
    return NextResponse.json({
      evaluation: {
        overall_strength: 7.5,
        prosecution_score: 8,
        defense_score: 6,
        summary: 'La posicion acusatoria presenta una fortaleza considerable basada en evidencia documental solida (transferencias bancarias) y reconocimiento parcial de la deuda via mensajeria. Los puntos debiles de la acusacion se centran en la falta de un contrato formal de mutuo. La defensa tiene argumentos validos sobre la ambiguedad de las pruebas digitales, pero el conjunto probatorio favorece al demandante.',
        strong_points: [
          'Comprobantes de transferencia con concepto explicito',
          'Reconocimiento parcial via WhatsApp',
          'Falta de justificacion del demandado sobre el destino de fondos',
        ],
        weak_points: [
          'Ausencia de contrato formal de mutuo',
          'Capturas de WhatsApp sin peritaje informatico forense',
          'Posible relacion comercial que justifique transferencias',
        ],
        recommendation: 'Se recomienda obtener peritaje informatico de las conversaciones de WhatsApp y solicitar informes bancarios completos del demandado para fortalecer la posicion acusatoria. Considerar la posibilidad de mediacion dado el reconocimiento parcial de la deuda.',
      },
    })
  }

  return NextResponse.json({ error: 'Accion no reconocida' }, { status: 400 })
}
