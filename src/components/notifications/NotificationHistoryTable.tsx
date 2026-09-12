'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { NotificationHistoryRecord, NotificationChannel, NotificationType } from '@/types/notificationSystem';
import { notificationService } from '@/lib/notifications/notificationService';

export interface NotificationHistoryTableProps {
  title?: string;
  showFilters?: boolean;
  defaultLimit?: number;
}

export const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({
  title = 'Multi-Channel Dispatch Audit Trail',
  showFilters = true,
  defaultLimit = 15,
}) => {
  const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'sms' | 'email'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = () => {
    setRefreshing(true);
    const records = notificationService.getHistory();
    setHistory(records);
    setTimeout(() => setRefreshing(false), 400);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = history.filter((item) => {
    if (selectedChannel !== 'all' && item.channel !== selectedChannel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.user_name?.toLowerCase().includes(q);
      const matchType = item.notification_type.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      const matchTarget = (item.user_phone || item.user_email || '').toLowerCase().includes(q);
      if (!matchName && !matchType && !matchMsg && !matchTarget) return false;
    }
    return true;
  });

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid rgba(82, 183, 136, 0.25)',
        padding: '22px',
        boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
      }}
    >
      {/* Table Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B4332', margin: '0 0 4px' }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#52796F', margin: 0 }}>
            Real-time delivery verification for SMS and Email notifications dispatched to farmers & vets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Channel Filter */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
            {(['all', 'sms', 'email'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedChannel === ch ? '#2D6A4F' : 'transparent',
                  color: selectedChannel === ch ? '#FFFFFF' : '#475569',
                  textTransform: 'uppercase',
                }}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Search recipient or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                width: '180px',
              }}
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadHistory}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.76rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
              <th style={{ padding: '10px 12px' }}>Channel</th>
              <th style={{ padding: '10px 12px' }}>Notification Type</th>
              <th style={{ padding: '10px 12px' }}>Recipient</th>
              <th style={{ padding: '10px 12px' }}>Target Identifier</th>
              <th style={{ padding: '10px 12px' }}>Message Preview</th>
              <th style={{ padding: '10px 12px' }}>Status</th>
              <th style={{ padding: '10px 12px' }}>Dispatched At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8' }}>
                  No notification logs found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((record) => {
                const isSms = record.channel === 'sms';
                const isSuccess = record.delivery_status === 'SENT' || record.delivery_status === 'DELIVERED';
                const formattedTime = new Date(record.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <tr key={record.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          background: isSms ? '#EFF6FF' : '#F5F3FF',
                          color: isSms ? '#1D4ED8' : '#6D28D9',
                        }}
                      >
                        {isSms ? <Smartphone size={13} /> : <Mail size={13} />}
                        <span>{record.channel.toUpperCase()}</span>
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>
                        {record.notification_type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{record.user_name || 'Anonymous User'}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'capitalize' }}>
                        {record.user_type}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569', fontFamily: 'monospace' }}>
                      {isSms ? record.user_phone || 'N/A' : record.user_email || 'N/A'}
                    </td>

                    <td style={{ padding: '10px 12px', maxWidth: '320px' }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#334155',
                        }}
                        title={record.message}
                      >
                        {record.subject ? `[${record.subject}] ` : ''}
                        {record.message}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: isSuccess ? '#DCFCE7' : '#FEE2E2',
                          color: isSuccess ? '#15803D' : '#B91C1C',
                        }}
                      >
                        {isSuccess ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        <span>{record.delivery_status}</span>
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#64748B', fontSize: '0.72rem' }}>
                      {formattedTime}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
