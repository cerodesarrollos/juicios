import { NextRequest, NextResponse } from 'next/server'
import { getEmbeddedCount } from '@/lib/evidence-search'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const case_id = searchParams.get('case_id')

  if (!case_id) {
    return NextResponse.json({ error: 'case_id requerido' }, { status: 400 })
  }

  const count = await getEmbeddedCount(case_id)
  return NextResponse.json({ count })
}
