import { NextResponse } from 'next/server';
import { createEarnKitContext, exploreVaults } from '@circle-fin/earn-kit';

export async function GET() {
  try {
    const context = createEarnKitContext();
    const result = await exploreVaults(context, {
      chain: 'Arc',
      sortBy: 'apy',
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[earn-vaults] error:', err);
    return NextResponse.json({ error: 'Failed to fetch vaults' }, { status: 500 });
  }
}
