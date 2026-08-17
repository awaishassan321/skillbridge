import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

/* ============================================================================
   SkillBridge — Admin Dashboard
   Redesigned UI/UX only. All API calls, endpoints, auth, and business logic
   are unchanged from the original implementation.
   ============================================================================ */

/* ---------- Design tokens (maroon & beige brand, kept from original) ------- */
const COLORS = {
    primary: '#800000',
    primaryDark: '#600000',
    primarySoft: '#a00000',
    gold: '#a16207',
    bg: '#fdf8f0',
    surface: '#ffffff',
    surfaceMuted: '#f5ede0',
    border: '#fbd5d5',
    text: '#374151',
    textMuted: '#6b7280',
    success: '#2e7d32',
    successBg: '#e8f5e9',
    danger: '#c62828',
    dangerBg: '#fdecea',
    warning: '#b8860b',
    warningBg: '#fdf3d9',
    info: '#1565c0',
    infoBg: '#e8f1fb',
};

/* --------------------------------- Icons ----------------------------------
   Small hand-rolled SVG icon set — no external icon dependency required. */
const Icon = ({ children, size = 18, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {children}
    </svg>
);
const IconDashboard = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Icon>;
const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.2c2.9.3 5 2.6 5 5.8" /></Icon>;
const IconSkills = (p) => <Icon {...p}><path d="M14.7 6.3 17.7 3.3a2.1 2.1 0 0 1 3 3l-3 3" /><path d="M9.3 17.7 6.3 20.7a2.1 2.1 0 0 1-3-3l3-3" /><path d="m15.5 5.5-14 14" strokeOpacity="0" /><path d="M13 8 8 13" /><path d="m11.3 4.7 8 8-2.6 2.6-8-8Z" /></Icon>;
const IconRequests = (p) => <Icon {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>;
const IconChevron = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
const IconMenu = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17 21 12 16 7" /><path d="M21 12H9" /></Icon>;
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
const IconX = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
const IconDownload = (p) => <Icon {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" /></Icon>;
const IconAlert = (p) => <Icon {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></Icon>;
const IconInbox = (p) => <Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.4 5H18.6a2 2 0 0 1 1.9 1.4L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l1.5-5.6A2 2 0 0 1 5.4 5Z" /></Icon>;

/* ------------------------------ Small helpers ------------------------------ */
const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
};

const StatusBadge = ({ status }) => {
    const map = {
        accepted: { bg: COLORS.successBg, fg: COLORS.success },
        rejected: { bg: COLORS.dangerBg, fg: COLORS.danger },
        pending: { bg: COLORS.warningBg, fg: COLORS.warning },
        admin: { bg: '#f1e6fb', fg: '#6a1b9a' },
        provider: { bg: COLORS.successBg, fg: COLORS.success },
        seeker: { bg: COLORS.infoBg, fg: COLORS.info },
    };
    const c = map[status] || { bg: COLORS.surfaceMuted, fg: COLORS.textMuted };
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ backgroundColor: c.bg, color: c.fg }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.fg }} />
            {status}
        </span>
    );
};

/* --------------------------------- Toasts ----------------------------------- */
const ToastStack = ({ toasts, onDismiss }) => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-80">
        {toasts.map((t) => (
            <div
                key={t.id}
                role="status"
                className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border bg-white animate-[fadeIn_0.15s_ease-out]"
                style={{ borderColor: t.type === 'error' ? COLORS.danger : COLORS.success }}
            >
                <div
                    className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: t.type === 'error' ? COLORS.dangerBg : COLORS.successBg,
                        color: t.type === 'error' ? COLORS.danger : COLORS.success,
                    }}
                >
                    {t.type === 'error' ? <IconX size={12} /> : <IconCheck size={12} />}
                </div>
                <p className="text-sm text-gray-700 flex-1">{t.message}</p>
                <button onClick={() => onDismiss(t.id)} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
                    <IconX size={14} />
                </button>
            </div>
        ))}
    </div>
);

/* ------------------------------ Confirm modal -------------------------------- */
const ConfirmModal = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: COLORS.dangerBg, color: COLORS.danger }}
                >
                    <IconAlert size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1.5">{message}</p>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: COLORS.danger }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --------------------------------- Skeletons ---------------------------------- */
const SkeletonBlock = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200/80 rounded ${className}`} />
);
const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl border p-5" style={{ borderColor: COLORS.border }}>
        <SkeletonBlock className="h-4 w-24 mb-3" />
        <SkeletonBlock className="h-8 w-16" />
    </div>
);
const TableSkeleton = ({ rows = 6, cols = 6 }) => (
    <div className="p-4">
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
                {Array.from({ length: cols }).map((__, c) => (
                    <SkeletonBlock key={c} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

/* ---------------------------- Lightweight charts -------------------------------
   Hand-built inline SVG charts from real fetched data — no charting dependency. */
const DonutChart = ({ data, size = 150 }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = size / 2 - 14;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="flex items-center gap-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
                    <circle r={r} fill="none" stroke={COLORS.surfaceMuted} strokeWidth="16" />
                    {data.map((d, i) => {
                        const frac = d.value / total;
                        const dash = frac * c;
                        const circle = (
                            <circle
                                key={i}
                                r={r}
                                fill="none"
                                stroke={d.color}
                                strokeWidth="16"
                                strokeDasharray={`${dash} ${c - dash}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="butt"
                            />
                        );
                        offset += dash;
                        return circle;
                    })}
                </g>
                <text x="50%" y="47%" textAnchor="middle" fontSize="20" fontWeight="700" fill={COLORS.text}>
                    {total}
                </text>
                <text x="50%" y="61%" textAnchor="middle" fontSize="10" fill={COLORS.textMuted}>
                    total
                </text>
            </svg>
            <div className="flex flex-col gap-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-gray-600 capitalize">{d.label}</span>
                        <span className="font-semibold text-gray-800">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChart = ({ data, height = 180 }) => {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
        <div className="flex items-end gap-3" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span className="text-xs font-semibold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.value}
                    </span>
                    <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                            height: `${Math.max(4, (d.value / max) * (height - 30))}px`,
                            backgroundColor: COLORS.primary,
                            opacity: 0.85,
                        }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span className="text-[11px] text-gray-500 mt-2 text-center leading-tight line-clamp-2" title={d.label}>
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ---------------------------------- Sidebar ------------------------------------ */
const NAV_ITEMS = [
    { id: 'stats', label: 'Dashboard', icon: IconDashboard },
    { id: 'users', label: 'Users', icon: IconUsers },
    { id: 'skills', label: 'Skills', icon: IconSkills },
    { id: 'requests', label: 'Requests', icon: IconRequests },
];

const Sidebar = ({ activeTab, setActiveTab, collapsed, mobileOpen, setMobileOpen, pendingCount }) => (
    <>
        {mobileOpen && (
            <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
        <aside
            className={`fixed lg:sticky top-0 left-0 h-screen z-40 flex flex-col transition-all duration-200
                ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'} w-64
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{ backgroundColor: COLORS.primaryDark }}
        >
            <div className="h-16 flex items-center gap-3 px-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: COLORS.gold, color: '#3a2a00' }}
                >
                    SB
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight truncate">SkillBridge</p>
                        <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>Admin Panel</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Overview
                    </p>
                )}
                {NAV_ITEMS.map((item) => {
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                            title={collapsed ? item.label : undefined}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative"
                            style={{
                                backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                            }}
                        >
                            {active && (
                                <span
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                                    style={{ backgroundColor: COLORS.gold }}
                                />
                            )}
                            <item.icon size={18} />
                            {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                            {!collapsed && item.id === 'requests' && pendingCount > 0 && (
                                <span
                                    className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: COLORS.gold, color: '#3a2a00' }}
                                >
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <IconLogout size={18} />
                    {!collapsed && <span>Log out</span>}
                </button>
            </div>
        </aside>
    </>
);

/* ---------------------------------- Header -------------------------------------- */
const Header = ({ pageTitle, search, onSearchChange, showSearch, onMenuClick, onCollapseClick, pendingCount, recentRequests }) => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    return (
        <header
            className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 shrink-0"
            style={{ backgroundColor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}
        >
            <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700" aria-label="Open menu">
                <IconMenu size={22} />
            </button>
            <button onClick={onCollapseClick} className="hidden lg:flex text-gray-400 hover:text-gray-600" aria-label="Toggle sidebar">
                <IconMenu size={20} />
            </button>

            <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate" style={{ color: COLORS.text }}>{pageTitle}</h1>
                <p className="text-xs hidden sm:block" style={{ color: COLORS.textMuted }}>Admin / {pageTitle}</p>
            </div>

            <div className="flex-1" />

            {showSearch && (
                <div className="relative hidden md:block w-64">
                    <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: COLORS.border, '--tw-ring-color': `${COLORS.primary}33` }}
                    />
                </div>
            )}

            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    aria-label="Notifications"
                >
                    <IconBell size={19} />
                    {pendingCount > 0 && (
                        <span
                            className="absolute top-1 right-1.5 w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS.danger }}
                        />
                    )}
                </button>
                {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border z-30" style={{ borderColor: COLORS.border }}>
                        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
                            <p className="font-semibold text-sm text-gray-800">Notifications</p>
                            {pendingCount > 0 && <span className="text-xs" style={{ color: COLORS.textMuted }}>{pendingCount} pending</span>}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                            {recentRequests.length === 0 ? (
                                <p className="text-sm text-gray-400 px-4 py-6 text-center">No recent activity</p>
                            ) : (
                                recentRequests.map((r) => (
                                    <div key={r.request_id} className="px-4 py-3 border-b last:border-0 flex gap-3" style={{ borderColor: COLORS.border }}>
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                                            style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.primary }}
                                        >
                                            {initials(r.sender?.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700 truncate">
                                                <span className="font-medium">{r.sender?.name || 'Someone'}</span> requested{' '}
                                                <span className="font-medium">{r.skill_name}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(r.created_at)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        A
                    </div>
                    <IconChevron size={14} className="text-gray-400 hidden sm:block" />
                </button>
                {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border py-1 z-30" style={{ borderColor: COLORS.border }}>
                        <div className="px-4 py-2.5 border-b" style={{ borderColor: COLORS.border }}>
                            <p className="text-sm font-medium text-gray-800">Administrator</p>
                            <p className="text-xs text-gray-400">SkillBridge</p>
                        </div>
                        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                            <IconSettings size={15} /> Settings
                        </button>
                        <button
                            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                            style={{ color: COLORS.danger }}
                        >
                            <IconLogout size={15} /> Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

/* ------------------------------ Stat card -------------------------------------- */
const StatCard = ({ title, value, icon: IconComp, color, sub }) => (
    <div
        className="bg-white rounded-xl p-5 transition-shadow hover:shadow-md"
        style={{ border: `1px solid ${COLORS.border}` }}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>{title}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1.5" style={{ color: COLORS.text }}>{value}</p>
                {sub && <p className="text-xs mt-1.5" style={{ color: COLORS.textMuted }}>{sub}</p>}
            </div>
            <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18`, color }}
            >
                <IconComp size={20} />
            </div>
        </div>
    </div>
);

/* ------------------------------- Empty state ------------------------------------ */
const EmptyState = ({ label = 'No data found' }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.textMuted }}>
            <IconInbox size={22} />
        </div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
    </div>
);

/* --------------------------------- Pagination ------------------------------------ */
const Pagination = ({ page, totalPages, onChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;
    const start = (page - 1) * itemsPerPage + 1;
    const end = Math.min(page * itemsPerPage, totalItems);
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t" style={{ borderColor: COLORS.border }}>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>
                Showing <span className="font-medium text-gray-600">{start}–{end}</span> of{' '}
                <span className="font-medium text-gray-600">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: COLORS.border }}
                >
                    Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium" style={{ color: COLORS.text }}>
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ borderColor: COLORS.border }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

/* ====================================================================================
   MAIN COMPONENT
   ==================================================================================== */
const Admin = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [skills, setSkills] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState({ open: false });
    const itemsPerPage = 10;

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, selectedStatus, selectedRole, selectedCategory]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchUsers(), fetchSkills(), fetchRequests()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/skills', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSkills(res.data.skills);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------------------- Toasts (replaces inline banners) --------------- */
    const addToast = (type, message) => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, type, message }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    };
    const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));
    const showSuccess = (msg) => addToast('success', msg);
    const showError = (msg) => addToast('error', msg);

    /* ------------------------------ Mutations (unchanged logic) ------------------ */
    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showSuccess('User deleted successfully');
            fetchUsers();
            fetchStats();
        } catch (err) {
            showError('Failed to delete user');
        }
    };

    const deleteSkill = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/skills/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showSuccess('Skill deleted successfully');
            fetchSkills();
            fetchStats();
        } catch (err) {
            showError('Failed to delete skill');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/requests/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccess(`Request ${status} successfully`);
            fetchRequests();
        } catch (err) {
            showError('Failed to update status');
        }
    };

    const askDeleteUser = (u) =>
        setConfirmState({
            open: true,
            title: 'Delete this user?',
            message: `${u.name} will be permanently removed. This action cannot be undone.`,
            onConfirm: () => { deleteUser(u.user_id); setConfirmState({ open: false }); },
        });

    const askDeleteSkill = (s) =>
        setConfirmState({
            open: true,
            title: 'Delete this skill?',
            message: `"${s.skill_name}" will be permanently removed. This action cannot be undone.`,
            onConfirm: () => { deleteSkill(s.skill_id); setConfirmState({ open: false }); },
        });

    const exportToCSV = (type) => {
        let data = [];
        let filename = '';

        if (type === 'users') {
            data = filteredUsers.map((u) => ({ Name: u.name, Email: u.email, Role: u.role, Location: u.location || 'N/A', Joined: u.created_at }));
            filename = 'users_export.csv';
        } else if (type === 'skills') {
            data = filteredSkills.map((s) => ({ Skill: s.skill_name, Category: s.category, Provider: s.provider?.name, Rate: s.hourly_rate }));
            filename = 'skills_export.csv';
        } else if (type === 'requests') {
            data = filteredRequests.map((r) => ({ Skill: r.skill_name, From: r.sender?.name, To: r.receiver?.name, Status: r.status, Date: r.created_at }));
            filename = 'requests_export.csv';
        }

        if (data.length === 0) {
            showError('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map((header) => `"${row[header] || ''}"`);
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        showSuccess(`${type.toUpperCase()} exported successfully`);
    };

    /* --------------------------------- Filtering (unchanged) ---------------------- */
    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const filteredSkills = skills.filter((s) => {
        const matchesSearch =
            s.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            r.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const paginate = (data) => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };
    const totalPages = (data) => Math.ceil(data.length / itemsPerPage) || 1;

    const categories = ['all', ...new Set(skills.map((s) => s.category).filter(Boolean))];

    /* ------------------------------- Derived dashboard data ----------------------- */
    const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);

    const recentRequests = useMemo(
        () =>
            [...requests]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 5),
        [requests]
    );

    const recentUsers = useMemo(
        () =>
            [...users]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 5),
        [users]
    );

    const requestStatusData = useMemo(() => {
        const counts = { pending: 0, accepted: 0, rejected: 0 };
        requests.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
        return [
            { label: 'accepted', value: counts.accepted, color: COLORS.success },
            { label: 'pending', value: counts.pending, color: COLORS.warning },
            { label: 'rejected', value: counts.rejected, color: COLORS.danger },
        ];
    }, [requests]);

    const skillsByCategoryData = useMemo(() => {
        const counts = {};
        skills.forEach((s) => {
            const cat = s.category || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value]) => ({ label, value }));
    }, [skills]);

    const pageTitles = { stats: 'Dashboard', users: 'Users', skills: 'Skills', requests: 'Requests' };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: COLORS.bg }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px);} to { opacity: 1; transform: translateY(0);} }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>

            <ToastStack toasts={toasts} onDismiss={dismissToast} />
            <ConfirmModal {...confirmState} onCancel={() => setConfirmState({ open: false })} />

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={sidebarCollapsed}
                mobileOpen={mobileNavOpen}
                setMobileOpen={setMobileNavOpen}
                pendingCount={pendingCount}
            />

            <div className="flex-1 min-w-0 flex flex-col">
                <Header
                    pageTitle={pageTitles[activeTab]}
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    showSearch={activeTab !== 'stats'}
                    onMenuClick={() => setMobileNavOpen(true)}
                    onCollapseClick={() => setSidebarCollapsed((v) => !v)}
                    pendingCount={pendingCount}
                    recentRequests={recentRequests}
                />

                <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
                    {/* ---------------------------- DASHBOARD ---------------------------- */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {loading || !stats ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <StatCard title="Total Users" value={stats.totalUsers} icon={IconUsers} color={COLORS.primary} sub={`${users.length} loaded`} />
                                    <StatCard title="Total Providers" value={stats.totalProviders || 0} icon={IconSkills} color={COLORS.success} sub="Active skill providers" />
                                    <StatCard title="Total Skills" value={stats.totalSkills} icon={IconSkills} color={COLORS.warning} sub={`${categories.length - 1} categories`} />
                                    <StatCard title="Total Requests" value={stats.totalRequests} icon={IconRequests} color={COLORS.info} sub={`${pendingCount} pending`} />
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                                <div className="lg:col-span-3 bg-white rounded-xl p-5" style={{ border: `1px solid ${COLORS.border}` }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-sm" style={{ color: COLORS.text }}>Skills by category</h3>
                                    </div>
                                    {loading ? (
                                        <SkeletonBlock className="h-44 w-full" />
                                    ) : skillsByCategoryData.length ? (
                                        <BarChart data={skillsByCategoryData} />
                                    ) : (
                                        <EmptyState label="No skills yet" />
                                    )}
                                </div>

                                <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ border: `1px solid ${COLORS.border}` }}>
                                    <h3 className="font-semibold text-sm mb-4" style={{ color: COLORS.text }}>Request status</h3>
                                    {loading ? (
                                        <SkeletonBlock className="h-36 w-full" />
                                    ) : requests.length ? (
                                        <DonutChart data={requestStatusData} />
                                    ) : (
                                        <EmptyState label="No requests yet" />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: COLORS.border }}>
                                        <h3 className="font-semibold text-sm" style={{ color: COLORS.text }}>Recent users</h3>
                                        <button onClick={() => setActiveTab('users')} className="text-xs font-medium" style={{ color: COLORS.primary }}>
                                            View all
                                        </button>
                                    </div>
                                    {loading ? (
                                        <TableSkeleton rows={4} cols={2} />
                                    ) : recentUsers.length === 0 ? (
                                        <EmptyState label="No users yet" />
                                    ) : (
                                        <ul>
                                            {recentUsers.map((u) => (
                                                <li key={u.user_id} className="flex items-center gap-3 px-5 py-3 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.primary }}>
                                                        {initials(u.name)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                    </div>
                                                    <StatusBadge status={u.role} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: COLORS.border }}>
                                        <h3 className="font-semibold text-sm" style={{ color: COLORS.text }}>Recent activity</h3>
                                        <button onClick={() => setActiveTab('requests')} className="text-xs font-medium" style={{ color: COLORS.primary }}>
                                            View all
                                        </button>
                                    </div>
                                    {loading ? (
                                        <TableSkeleton rows={4} cols={2} />
                                    ) : recentRequests.length === 0 ? (
                                        <EmptyState label="No activity yet" />
                                    ) : (
                                        <ul>
                                            {recentRequests.map((r) => (
                                                <li key={r.request_id} className="flex items-center gap-3 px-5 py-3 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.primary }}>
                                                        {initials(r.sender?.name)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-700 truncate">
                                                            <span className="font-medium">{r.sender?.name || 'Someone'}</span> → <span className="font-medium">{r.skill_name}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400">{timeAgo(r.created_at)}</p>
                                                    </div>
                                                    <StatusBadge status={r.status} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ------------------------------ TOOLBAR (non-dashboard) --------------- */}
                    {activeTab !== 'stats' && (
                        <div className="bg-white rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center justify-between" style={{ border: `1px solid ${COLORS.border}` }}>
                            <div className="relative flex-1 min-w-[200px] md:hidden">
                                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none"
                                    style={{ borderColor: COLORS.border }}
                                />
                            </div>
                            <div className="flex flex-wrap gap-3 items-center ml-auto">
                                {activeTab === 'users' && (
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-lg border focus:outline-none"
                                        style={{ borderColor: COLORS.border }}
                                    >
                                        <option value="all">All roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="provider">Provider</option>
                                        <option value="seeker">Seeker</option>
                                    </select>
                                )}
                                {activeTab === 'skills' && (
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-lg border focus:outline-none"
                                        style={{ borderColor: COLORS.border }}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
                                        ))}
                                    </select>
                                )}
                                {activeTab === 'requests' && (
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-lg border focus:outline-none"
                                        style={{ borderColor: COLORS.border }}
                                    >
                                        <option value="all">All status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                )}
                                <button
                                    onClick={() => exportToCSV(activeTab)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <IconDownload size={15} /> Export
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --------------------------------- USERS TABLE ------------------------- */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr style={{ backgroundColor: COLORS.surfaceMuted }}>
                                                    {['#', 'Name', 'Email', 'Location', 'Role', 'Joined', ''].map((h, i) => (
                                                        <th
                                                            key={i}
                                                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === '' ? 'text-center' : 'text-left'}`}
                                                            style={{ color: COLORS.textMuted }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginate(filteredUsers).map((u, index) => (
                                                    <tr key={u.user_id} className="border-t hover:bg-gray-50/80 transition-colors" style={{ borderColor: COLORS.border }}>
                                                        <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.primary }}>
                                                                    {initials(u.name)}
                                                                </div>
                                                                <span className="font-medium text-gray-800">{u.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                                        <td className="px-4 py-3 text-gray-500">{u.location || '—'}</td>
                                                        <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                                                        <td className="px-4 py-3 text-gray-500">{u.created_at ? timeAgo(u.created_at) : '—'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {u.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => askDeleteUser(u)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                                                                    style={{ backgroundColor: COLORS.danger }}
                                                                >
                                                                    <IconTrash size={13} /> Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredUsers.length === 0 ? (
                                        <EmptyState label="No users found" />
                                    ) : (
                                        <Pagination page={currentPage} totalPages={totalPages(filteredUsers)} onChange={setCurrentPage} totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} />
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* --------------------------------- SKILLS TABLE ------------------------- */}
                    {activeTab === 'skills' && (
                        <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr style={{ backgroundColor: COLORS.surfaceMuted }}>
                                                    {['#', 'Skill', 'Category', 'Provider', 'Rate', 'Posted', ''].map((h, i) => (
                                                        <th
                                                            key={i}
                                                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === '' ? 'text-center' : 'text-left'}`}
                                                            style={{ color: COLORS.textMuted }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginate(filteredSkills).map((s, index) => (
                                                    <tr key={s.skill_id} className="border-t hover:bg-gray-50/80 transition-colors" style={{ borderColor: COLORS.border }}>
                                                        <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{s.skill_name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: COLORS.surfaceMuted, color: COLORS.textMuted }}>
                                                                {s.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">{s.provider?.name}</td>
                                                        <td className="px-4 py-3 font-semibold" style={{ color: COLORS.primary }}>Rs. {s.hourly_rate}</td>
                                                        <td className="px-4 py-3 text-gray-500">{s.created_at ? timeAgo(s.created_at) : '—'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => askDeleteSkill(s)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                                                                style={{ backgroundColor: COLORS.danger }}
                                                            >
                                                                <IconTrash size={13} /> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredSkills.length === 0 ? (
                                        <EmptyState label="No skills found" />
                                    ) : (
                                        <Pagination page={currentPage} totalPages={totalPages(filteredSkills)} onChange={setCurrentPage} totalItems={filteredSkills.length} itemsPerPage={itemsPerPage} />
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* -------------------------------- REQUESTS TABLE ------------------------ */}
                    {activeTab === 'requests' && (
                        <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                            {loading ? (
                                <TableSkeleton cols={7} />
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr style={{ backgroundColor: COLORS.surfaceMuted }}>
                                                    {['#', 'Skill', 'From', 'To', 'Message', 'Status', 'Date', ''].map((h, i) => (
                                                        <th
                                                            key={i}
                                                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === '' ? 'text-center' : 'text-left'}`}
                                                            style={{ color: COLORS.textMuted }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginate(filteredRequests).map((r, index) => (
                                                    <tr key={r.request_id} className="border-t hover:bg-gray-50/80 transition-colors" style={{ borderColor: COLORS.border }}>
                                                        <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{r.skill_name}</td>
                                                        <td className="px-4 py-3 text-gray-600">{r.sender?.name}</td>
                                                        <td className="px-4 py-3 text-gray-600">{r.receiver?.name}</td>
                                                        <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate" title={r.message}>{r.message || '—'}</td>
                                                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                                        <td className="px-4 py-3 text-gray-500">{r.created_at ? timeAgo(r.created_at) : '—'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {r.status === 'pending' && (
                                                                <div className="flex gap-2 justify-center">
                                                                    <button
                                                                        onClick={() => updateStatus(r.request_id, 'accepted')}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                                                                        style={{ backgroundColor: COLORS.success }}
                                                                    >
                                                                        <IconCheck size={13} /> Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateStatus(r.request_id, 'rejected')}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                                                                        style={{ backgroundColor: COLORS.danger }}
                                                                    >
                                                                        <IconX size={13} /> Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredRequests.length === 0 ? (
                                        <EmptyState label="No requests found" />
                                    ) : (
                                        <Pagination page={currentPage} totalPages={totalPages(filteredRequests)} onChange={setCurrentPage} totalItems={filteredRequests.length} itemsPerPage={itemsPerPage} />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Admin;
