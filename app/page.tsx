'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DashboardData = {
  kpis: Record<string, number>;
  monthly: Array<{ month: string; revenue: number; profit: number; orders: number }>;
  city: Array<{ Delivery_City: string; Revenue: number; Orders: number; AvgDelivery: number; DelayRate: number }>;
  cuisine: Array<{ Cuisine: string; Revenue: number; Orders: number; CancelRate: number }>;
  traffic: Array<{ Traffic_Level: string; AvgDelivery: number; AvgDelay: number; Orders: number }>;
  weather: Array<{ Weather: string; AvgDelivery: number; AvgRating: number; Orders: number }>;
  topRestaurants: Array<{ Restaurant_Name: string; Revenue: number; Orders: number }>;
  insights: Array<{ title: string; observation: string; impact: string; recommendation: string }>;
};

const colors = ['#2f7d68', '#4f9b85', '#6b8f71', '#9bbf9f', '#78a99a', '#b7d4c8'];

function money(value: number) {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

function StateCard({ title, message }: { title: string; message: string }) {
  return (
    <main className="state-shell">
      <section className="state-card" role="status" aria-live="polite">
        <p className="eyebrow">Analytics Portfolio</p>
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/dashboard-data.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Dashboard data failed with ${response.status}`);
        return response.json() as Promise<DashboardData>;
      })
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const executiveSignal = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Revenue', value: money(data.kpis.revenue), delta: '+18.4% modeled growth' },
      { label: 'Delay Risk', value: `${data.kpis.delayedRate ?? data.kpis.delayRate ?? 0}%`, delta: 'traffic + weather driver' },
      { label: 'Profit', value: money(data.kpis.profit), delta: 'margin quality KPI' },
    ];
  }, [data]);

  if (error) return <StateCard title="Data pipeline unavailable" message={`Could not load dashboard-data.json. ${error}`} />;
  if (!data) return <StateCard title="Loading analytics suite" message="Preparing executive KPIs, delivery performance, customer signals, and restaurant intelligence." />;

  return (
    <main className="shell">
      <div className="grid" />
      <nav className="nav" aria-label="Dashboard navigation">
        <a className="brand" href="#top">FD Analytics</a>
        <div className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#operations">Operations</a>
          <a href="#insights">Insights</a>
          <a href="https://github.com/shivammhjn1302/food-delivery-performance-analytics-dashboard-" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </nav>

      <section id="top" className="hero">
        <div>
          <p className="eyebrow">Operations BI · Customer Analytics · Delivery Performance</p>
          <h1>Food delivery analytics for operational clarity.</h1>
          <p>
            A production-style analytics dashboard built from 25,000+ delivery orders, combining KPI modeling,
            SQL analysis, Python data cleaning, business recommendations, and Vercel-ready executive visuals.
          </p>
        </div>
        <aside className="hero-card" aria-label="Executive signal summary">
          <span className="status-pill">Portfolio case study</span>
          {executiveSignal.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.delta}</small>
            </div>
          ))}
        </aside>
      </section>

      <section id="overview" className="kpis" aria-label="Key performance indicators">
        <Card label="Total Revenue" value={money(data.kpis.revenue)} hint="Cleaned order revenue" />
        <Card label="Total Orders" value={data.kpis.orders.toLocaleString('en-IN')} hint="Delivered + cancelled + refunded" />
        <Card label="AOV" value={money(data.kpis.aov)} hint="Average order value" />
        <Card label="Avg Delivery" value={`${data.kpis.avgDelivery} min`} hint="Operational speed KPI" />
        <Card label="Cancel Rate" value={`${data.kpis.cancelRate}%`} hint="Experience risk" />
        <Card label="Rating" value={`${data.kpis.rating}/5`} hint="Customer satisfaction" />
      </section>

      <section className="panel wide">
        <div className="panel-head"><h2>Revenue & Profit Trend</h2><span>Monthly performance</span></div>
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart data={data.monthly}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2f7d68" stopOpacity={0.82}/><stop offset="95%" stopColor="#2f7d68" stopOpacity={0}/></linearGradient>
              <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6b8f71" stopOpacity={0.72}/><stop offset="95%" stopColor="#6b8f71" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(47,125,104,.12)" />
            <XAxis dataKey="month" stroke="#71827b" tick={{fontSize: 11}} interval={2} />
            <YAxis stroke="#71827b" tickFormatter={(v) => `₹${Math.round(Number(v)/100000)}L`} />
            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(47,125,104,.20)', color: '#16211d', borderRadius: 14 }} formatter={(v) => money(Number(v))} />
            <Area type="monotone" dataKey="revenue" stroke="#2f7d68" fill="url(#rev)" strokeWidth={3} />
            <Area type="monotone" dataKey="profit" stroke="#6b8f71" fill="url(#profit)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section id="operations" className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>City Revenue</h2><span>Top markets</span></div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.city} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(47,125,104,.12)" />
              <XAxis type="number" stroke="#71827b" hide />
              <YAxis type="category" dataKey="Delivery_City" stroke="#71827b" width={90} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(47,125,104,.20)', borderRadius: 14 }} formatter={(v) => money(Number(v))} />
              <Bar dataKey="Revenue" radius={[0, 10, 10, 0]}>{data.city.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Delivery Time by Traffic</h2><span>Delay root cause</span></div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(47,125,104,.12)" />
              <XAxis dataKey="Traffic_Level" stroke="#71827b" />
              <YAxis stroke="#71827b" />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(47,125,104,.20)', borderRadius: 14 }} />
              <Line type="monotone" dataKey="AvgDelivery" stroke="#2f7d68" strokeWidth={4} dot={{ r: 5, fill: '#6b8f71' }} />
              <Line type="monotone" dataKey="AvgDelay" stroke="#b86f52" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>Cuisine Revenue Mix</h2><span>Restaurant strategy</span></div>
          <div className="rank-list">{data.cuisine.map((x, i) => <div key={x.Cuisine}><b>#{i+1} {x.Cuisine}</b><span>{money(x.Revenue)} · {x.Orders.toLocaleString('en-IN')} orders</span></div>)}</div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Top Restaurants</h2><span>Revenue leaders</span></div>
          <div className="rank-list">{data.topRestaurants.map((x, i) => <div key={x.Restaurant_Name}><b>#{i+1} {x.Restaurant_Name}</b><span>{money(x.Revenue)} · {x.Orders.toLocaleString('en-IN')} orders</span></div>)}</div>
        </div>
      </section>

      <section id="insights" className="insights">
        <div className="panel-head"><h2>Business Insights</h2><span>Observation → Impact → Recommendation</span></div>
        <div className="insight-grid">{data.insights.map((x) => <article className="insight" key={x.title}><h3>{x.title}</h3><p><b>Observation:</b> {x.observation}</p><p><b>Impact:</b> {x.impact}</p><p><b>Recommendation:</b> {x.recommendation}</p></article>)}</div>
      </section>
    </main>
  );
}
