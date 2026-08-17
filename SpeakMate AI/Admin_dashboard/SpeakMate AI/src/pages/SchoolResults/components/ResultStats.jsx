import React from 'react';
import { SUMMARY_STATS } from '../data/resultsMockData';

const ResultStats = () => {
  const cards = [
    {
      id: 'total-students',
      title: 'Total Students',
      value: SUMMARY_STATS.totalStudents,
      description: 'Enrolled in Standard 1-10',
      badgeText: '+12% YOY',
      badgeClass: 'badge-emerald',
      iconTheme: 'icon-indigo',
      iconSvg: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'avg-score',
      title: 'Average English Score',
      value: SUMMARY_STATS.avgEnglishScore,
      description: 'Mean score across all standards',
      badgeText: '+4.2% Growth',
      badgeClass: 'badge-emerald',
      iconTheme: 'icon-emerald',
      iconSvg: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      id: 'highest-std',
      title: 'Highest Performing Standard',
      value: SUMMARY_STATS.highestPerformingStandard,
      description: 'Lead class with 93% average',
      badgeText: 'Top Performer',
      badgeClass: 'badge-purple',
      iconTheme: 'icon-purple',
      iconSvg: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      id: 'pass-rate',
      title: 'Overall Pass Rate',
      value: SUMMARY_STATS.overallPassRate,
      description: 'Scored 50% or above in English',
      badgeText: '98% in Std 10',
      badgeClass: 'badge-blue',
      iconTheme: 'icon-blue',
      iconSvg: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="kpi-cards-grid">
      {cards.map((card) => (
        <div key={card.id} className="kpi-card">
          <div className="kpi-card-header">
            <div className={`kpi-icon-pill ${card.iconTheme}`}>
              {card.iconSvg}
            </div>
            <span className={`kpi-badge ${card.badgeClass}`}>
              {card.badgeText}
            </span>
          </div>

          <div className="kpi-card-body">
            <span className="kpi-title">{card.title}</span>
            <div className="kpi-value">{card.value}</div>
            <p className="kpi-description">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultStats;
