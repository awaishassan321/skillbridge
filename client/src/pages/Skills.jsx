import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sort, setSort] = useState('newest');
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [requestSkill, setRequestSkill] = useState(null);
  const [requestData, setRequestData] = useState({ details: '', date: '', budget: '' });
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/skills`);
      setSkills(res.data.skills || []);
    } catch {
      setNotice({ type: 'error', text: 'Skills could not be loaded. Please try again.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const categories = useMemo(() => [...new Set(skills.map((skill) => skill.category).filter(Boolean))].sort(), [skills]);
  const locations = useMemo(() => [...new Set(skills.map((skill) => skill.location).filter(Boolean))].sort(), [skills]);
  const filtered = useMemo(() => skills
    .filter((skill) => {
      const content = `${skill.skill_name} ${skill.description} ${skill.name}`.toLowerCase();
      return (!query || content.includes(query.toLowerCase())) &&
        (!category || skill.category === category) &&
        (!location || skill.location === location) &&
        (!maxRate || Number(skill.hourly_rate) <= Number(maxRate));
    })
    .sort((a, b) => {
      if (sort === 'price-low') return Number(a.hourly_rate) - Number(b.hourly_rate);
      if (sort === 'price-high') return Number(b.hourly_rate) - Number(a.hourly_rate);
      if (sort === 'rating') return Number(b.average_rating) - Number(a.average_rating);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }), [skills, query, category, location, maxRate, sort]);

  const clearFilters = () => { setQuery(''); setCategory(''); setLocation(''); setMaxRate(''); setSort('newest'); setRecommendations([]); };
  const runAiSearch = async () => {
    if (!query.trim()) return setNotice({ type: 'error', text: 'Please describe the service you need first.' });
    setAiLoading(true);
    try {
      const res = await axios.post(`${API}/recommend`, { query });
      setRecommendations(res.data.recommendations || []);
    } catch { setNotice({ type: 'error', text: 'AI search is unavailable right now.' }); }
    finally { setAiLoading(false); }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const message = [requestData.details, requestData.date && `Preferred date: ${requestData.date}`, requestData.budget && `Budget: Rs. ${requestData.budget}`].filter(Boolean).join('\n');
      await axios.post(`${API}/requests`, { receiver_id: requestSkill.user_id, skill_id: requestSkill.skill_id, message }, { headers: { Authorization: `Bearer ${token}` } });
      setRequestSkill(null); setRequestData({ details: '', date: '', budget: '' });
      setNotice({ type: 'success', text: `Request sent to ${requestSkill.name}. You can track it from your dashboard.` });
    } catch (err) { setNotice({ type: 'error', text: err.response?.data?.message || 'Request could not be sent.' }); }
  };

  const SkillCard = ({ skill, featured = false }) => (
    <article className={`rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${featured ? 'border-2 border-primary' : 'border border-maroon-100'}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-maroon-100 px-3 py-1 text-xs font-semibold text-primary">{skill.category}</span>
        <span className="whitespace-nowrap font-bold text-primary">Rs. {skill.hourly_rate}/hr</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{skill.skill_name}</h2>
      <p className="mt-2 min-h-10 text-sm leading-6 text-gray-600">{skill.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon-100 text-xs font-bold text-primary">{initials(skill.name)}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-800">{skill.name}</p><p className="truncate text-xs text-gray-500">{skill.location || 'Pakistan'} · {Number(skill.average_rating || 0) ? `${skill.average_rating} ★ (${skill.review_count})` : 'New provider'}</p></div>
        </div>
        <button onClick={() => setRequestSkill(skill)} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">Request</button>
      </div>
    </article>
  );

  return <main className="min-h-screen bg-light">
    <section className="bg-primary px-4 py-14 text-center text-white"><p className="mb-2 text-sm font-semibold text-maroon-200">LOCAL PROFESSIONALS, TRUSTED CONNECTIONS</p><h1 className="text-4xl font-extrabold sm:text-5xl">Find the right skill for your need</h1><p className="mx-auto mt-3 max-w-xl text-maroon-100">Search verified community professionals by skill, location, price and rating.</p></section>
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {notice && <div role="status" className={`mb-5 flex items-center justify-between rounded-xl border p-4 text-sm ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}><span>{notice.text}</span><button aria-label="Dismiss notification" onClick={() => setNotice(null)} className="font-bold">×</button></div>}
      <div className="rounded-2xl border border-maroon-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row"><label className="sr-only" htmlFor="skill-search">Search skills</label><input id="skill-search" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runAiSearch()} placeholder="What do you need? e.g. Maths tutor, AC repair" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-maroon-100"/><button onClick={runAiSearch} disabled={aiLoading} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">{aiLoading ? 'Finding matches…' : 'AI match'}</button></div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by location" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5"><option value="">All locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select><input aria-label="Maximum hourly rate" type="number" min="0" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} placeholder="Max rate (Rs./hr)" className="rounded-lg border border-gray-300 px-3 py-2.5"/><select aria-label="Sort skills" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5"><option value="newest">Newest first</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
      </div>
      {recommendations.length > 0 && <section className="mt-9"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-2xl font-bold text-primary">AI recommendations</h2><p className="text-sm text-gray-500">Matches based on your description</p></div><button onClick={() => setRecommendations([])} className="text-sm font-semibold text-primary hover:underline">Clear</button></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{recommendations.map((skill, i) => <SkillCard key={`${skill.skill_id}-${i}`} skill={skill} featured />)}</div></section>}
      <section className="mt-9"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-2xl font-bold text-primary">Browse services</h2><p className="text-sm text-gray-500">{loading ? 'Loading services…' : `${filtered.length} service${filtered.length === 1 ? '' : 's'} found`}</p></div>{(query || category || location || maxRate) && <button onClick={clearFilters} className="text-sm font-semibold text-primary hover:underline">Clear filters</button>}</div>{loading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((x) => <div key={x} className="h-64 animate-pulse rounded-2xl bg-white"/>)}</div> : filtered.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((skill) => <SkillCard key={skill.skill_id} skill={skill} />)}</div> : <div className="rounded-2xl border border-dashed border-maroon-200 bg-white px-6 py-16 text-center"><h3 className="text-lg font-bold text-gray-800">No services match these filters</h3><p className="mt-2 text-sm text-gray-500">Try a different skill, location, or price range.</p><button onClick={clearFilters} className="mt-5 rounded-lg bg-primary px-4 py-2 font-semibold text-white">Clear filters</button></div>}</section>
    </section>
    {requestSkill && <div role="dialog" aria-modal="true" aria-labelledby="request-title" className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="Close request form" onClick={() => setRequestSkill(null)} className="absolute inset-0 bg-black/50"/><form onSubmit={submitRequest} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="request-title" className="text-xl font-bold text-primary">Request {requestSkill.skill_name}</h2><p className="mt-1 text-sm text-gray-500">Tell {requestSkill.name} what you need.</p></div><button type="button" onClick={() => setRequestSkill(null)} aria-label="Close" className="text-2xl text-gray-500">×</button></div><label className="mt-5 block text-sm font-semibold text-gray-700">Your requirement<textarea required value={requestData.details} onChange={(e) => setRequestData({...requestData, details: e.target.value})} className="mt-1.5 min-h-24 w-full rounded-lg border border-gray-300 p-3 font-normal focus:border-primary focus:outline-none" placeholder="Describe the work, level or specific requirements…" /></label><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Preferred date<input type="date" value={requestData.date} onChange={(e) => setRequestData({...requestData, date: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-300 p-3 font-normal" /></label><label className="text-sm font-semibold text-gray-700">Budget (optional)<input type="number" min="0" value={requestData.budget} onChange={(e) => setRequestData({...requestData, budget: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-300 p-3 font-normal" placeholder="Rs." /></label></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setRequestSkill(null)} className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700">Cancel</button><button className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white">Send request</button></div></form></div>}
  </main>;
}

export default Skills;
