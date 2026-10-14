'use client';

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TokenConfig } from '@/lib/tokens';

type Timeframe = '7D' | '30D' | '90D';

const timeframes: { key: Timeframe; label: string; interval: string; count: string }[] = [
  { key: '7D', label: '7D', interval: '1h', count: '168' },
  { key: '30D', label: '30D', interval: '4h', count: '180' },
  { key: '90D', label: '90D', interval: '1d', count: '90' },
];

export default function PriceChart({ token }: { token: TokenConfig }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [data, setData] = useState<{ time: number; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef('');

  useEffect(() => {
    const key = `${token.crypto_id}:${timeframe}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    const tf = timeframes.find((t) => t.key === timeframe)!;
    setLoading(true);

    fetch(`/api/price-history?crypto_id=${token.crypto_id}&interval=${tf.interval}&count=${tf.count}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.data ?? []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [timeframe, token.crypto_id]);

  const chartData = data.map((d) => ({
    date: new Date(d.time * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: d.price,
  }));

  return (
    <div className="bg-surface border border-border3/50 rounded-2xl p-5">
      <div className="flex items-center gap-1 mb-4">
        {timeframes.map((tf) => (
          <button
            key={tf.key}
            onClick={() => setTimeframe(tf.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              timeframe === tf.key
                ? 'bg-white/[0.08] text-white/80'
                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {loading && data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-xs text-white/30">Loading chart...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-xs text-white/30">No price data available</span>
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={(v: number) => '$' + v.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(11,11,15,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'white',
                }}
                formatter={(value: any) => ['$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 }), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#6C5CE7"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
