'use client';

import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
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

const colors = ['#00f5ff', '#ff2bd6', '#f9f871', '#7b2cff', '#23ff9a', '#ff7a18'];

function money(value: number) {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <article className="kpi-card"><span>{label}</span><strong>{value}</strong><p>{hint}</p></article>;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/dashboard-data.json').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <main className="loading">Loading analytics command center...</main>;

  return (
    <main className="shell">
      <div className="grid" />
      <nav className="nav">
        <div><b>FD://ANALYTICS</b><span>Food Delivery Performance Dashboard</span></div>
        <a href="https://github.com/shivammhjn1302/food-delivery-performance-analytics-dashboard-" target="_blank">GitHub Repo</a>
      </nav>

      <section className="hero">
        <p className="eyebrow">Executive BI · Customer Analytics · Delivery Operations</p>
        <h1>Food Delivery Performance & Customer Analytics</h1>
        <p>Production-style analytics dashboard built from 28,000 synthetic delivery orders with SQL analysis, Python cleaning, business reports, and Vercel-ready executive visuals.</p>
      </section>

      <section className="kpis">
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
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f5ff" stopOpacity={0.8}/><stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/></linearGradient>
              <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff2bd6" stopOpacity={0.6}/><stop offset="95%" stopColor="#ff2bd6" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
            <XAxis dataKey="month" stroke="#9fb3d9" tick={{fontSize: 11}} interval={2} />
            <YAxis stroke="#9fb3d9" tickFormatter={(v) => `₹${Math.round(Number(v)/100000)}L`} />
            <Tooltip contentStyle={{ background: '#0d1023', border: '1px solid #00f5ff', color: 'white' }} formatter={(v) => money(Number(v))} />
            <Area type="monotone" dataKey="revenue" stroke="#00f5ff" fill="url(#rev)" strokeWidth={3} />
            <Area type="monotone" dataKey="profit" stroke="#ff2bd6" fill="url(#profit)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>City Revenue</h2><span>Top markets</span></div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.city} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.09)" />
              <XAxis type="number" stroke="#9fb3d9" hide />
              <YAxis type="category" dataKey="Delivery_City" stroke="#9fb3d9" width={90} />
              <Tooltip contentStyle={{ background: '#0d1023', border: '1px solid #ff2bd6' }} formatter={(v) => money(Number(v))} />
              <Bar dataKey="Revenue" radius={[0, 10, 10, 0]}>{data.city.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Delivery Time by Traffic</h2><span>Delay root cause</span></div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.traffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.09)" />
              <XAxis dataKey="Traffic_Level" stroke="#9fb3d9" />
              <YAxis stroke="#9fb3d9" />
              <Tooltip contentStyle={{ background: '#0d1023', border: '1px solid #00f5ff' }} />
              <Line type="monotone" dataKey="AvgDelivery" stroke="#00f5ff" strokeWidth={4} dot={{ r: 6, fill: '#ff2bd6' }} />
              <Line type="monotone" dataKey="AvgDelay" stroke="#f9f871" strokeWidth={3} />
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

      <section className="insights">
        <div className="panel-head"><h2>Business Insights</h2><span>Observation → Impact → Recommendation</span></div>
        <div className="insight-grid">{data.insights.map((x) => <article className="insight" key={x.title}><h3>{x.title}</h3><p><b>Observation:</b> {x.observation}</p><p><b>Impact:</b> {x.impact}</p><p><b>Recommendation:</b> {x.recommendation}</p></article>)}</div>
      </section>
    </main>
  );
}
