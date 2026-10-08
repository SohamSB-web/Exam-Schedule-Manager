import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function SchedulePage({ user, onNavigateToCreate, onNavigateToEdit, onLogout }) {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [summary, setSummary] = useState({ total: 0, upcoming: 0, completed: 0, subjectsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'all' | 'upcoming' | 'completed'
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getExams();
      setExams(data.exams || []);
      setSubjects(data.subjects || []);
      setSummary(data.summary || { total: 0, upcoming: 0, completed: 0, subjectsCount: 0 });
    } catch (err) {
      setFeedbackMsg({ text: err.message || 'Failed to load exam schedule.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const showToast = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
  };

  const handleToggleStatus = async (exam) => {
    const nextStatus = exam.status === 'Completed' ? 'Upcoming' : 'Completed';
    try {
      await api.saveExam({
        id: exam.id,
        subject_id: exam.subject_id,
        exam_title: exam.exam_title,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        venue_hall: exam.venue_hall,
        seat_number: exam.seat_number,
        notes: exam.notes,
        status: nextStatus
      });
      showToast(`Exam marked as ${nextStatus}!`);
      fetchSchedule();
    } catch (err) {
      showToast(err.message || 'Failed to update exam status.', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from your schedule?`)) {
      return;
    }

    try {
      await api.deleteExam(id);
      showToast(`"${title}" deleted successfully.`);
      fetchSchedule();
    } catch (err) {
      showToast(err.message || 'Failed to delete exam.', 'error');
    }
  };

  // Find the next upcoming exam for countdown
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExams = exams
    .filter((e) => e.status === 'Upcoming' && e.exam_date >= todayStr)
    .sort((a, b) => (a.exam_date + a.start_time).localeCompare(b.exam_date + b.start_time));
  
  const nextExam = upcomingExams[0] || null;

  // Filter exams for display
  const filteredExams = exams.filter((e) => {
    if (filter === 'upcoming') return e.status === 'Upcoming';
    if (filter === 'completed') return e.status === 'Completed';
    return true;
  });

  const getDaysLeft = (dateStr) => {
    const examDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Passed';
  };

  return (
    <div className="page-container fade-in">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🎓</span>
          <div>
            <span className="app-title">Exam Schedule Manager</span>
            <div className="student-badge">
              <span className="badge-name">{user?.name || 'Student'}</span>
              {user?.student_id && <span className="badge-id">{user.student_id}</span>}
              <span className="badge-phone">{user?.phone}</span>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn btn-primary" onClick={onNavigateToCreate}>
            + Schedule Exam
          </button>
          <button className="btn btn-outline" onClick={onLogout} title="Log Out">
            Log Out
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {feedbackMsg.text && (
        <div className={`alert alert-${feedbackMsg.type} fade-in`} style={{ margin: '16px 0' }}>
          <span>{feedbackMsg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Hero Next Exam Countdown Banner */}
      {nextExam && (
        <div className="next-exam-banner">
          <div className="banner-left">
            <span className="banner-tag">NEXT UPCOMING EXAM</span>
            <h2>{nextExam.subject_name} ({nextExam.subject_code})</h2>
            <p className="banner-details">
              📅 <strong>{nextExam.exam_date}</strong> • ⏰ {nextExam.start_time} - {nextExam.end_time}
            </p>
            <p className="banner-venue">
              📍 <strong>Venue:</strong> {nextExam.venue_hall} {nextExam.seat_number && `• Seat: ${nextExam.seat_number}`}
            </p>
          </div>
          <div className="banner-countdown">
            <div className="countdown-pill">
              <span className="countdown-number">{getDaysLeft(nextExam.exam_date)}</span>
              <span className="countdown-label">{nextExam.exam_title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Scheduled</span>
          <span className="metric-val">{summary.total}</span>
        </div>
        <div className="metric-card metric-upcoming">
          <span className="metric-label">Upcoming</span>
          <span className="metric-val">{summary.upcoming}</span>
        </div>
        <div className="metric-card metric-completed">
          <span className="metric-label">Completed</span>
          <span className="metric-val">{summary.completed}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Courses / Subjects</span>
          <span className="metric-val">{summary.subjectsCount || subjects.length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <div className="tabs">
          <button
            className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({summary.upcoming})
          </button>
          <button
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Exams ({summary.total})
          </button>
          <button
            className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({summary.completed})
          </button>
        </div>

        <span className="filter-count">Showing {filteredExams.length} exams</span>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner"></div>
          <p>Loading exam timetable...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No exams found in this view</h3>
          <p>
            {filter === 'upcoming'
              ? 'No upcoming exams right now! You can add your next exam schedule.'
              : 'Start by organizing your semester exam dates and venue locations.'}
          </p>
          <button className="btn btn-primary" onClick={onNavigateToCreate} style={{ marginTop: '14px' }}>
            + Schedule an Exam
          </button>
        </div>
      ) : (
        <div className="exams-grid">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <div className="card-top">
                <div
                  className="subject-pill"
                  style={{ backgroundColor: `${exam.subject_color}22`, color: exam.subject_color, borderColor: `${exam.subject_color}55` }}
                >
                  <span className="subject-code">{exam.subject_code}</span>
                  <span className="subject-dept">{exam.subject_department}</span>
                </div>

                <span className={`status-pill status-${exam.status.toLowerCase()}`}>
                  {exam.status}
                </span>
              </div>

              <h3 className="exam-subject-name">{exam.subject_name}</h3>
              <p className="exam-type-title">{exam.exam_title}</p>

              <div className="card-info-list">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span className="info-text">
                    <strong>{exam.exam_date}</strong> ({getDaysLeft(exam.exam_date)})
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-icon">⏰</span>
                  <span className="info-text">
                    {exam.start_time} - {exam.end_time}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span className="info-text">
                    <strong>Hall:</strong> {exam.venue_hall}
                  </span>
                </div>

                {exam.seat_number && (
                  <div className="info-item">
                    <span className="info-icon">🪑</span>
                    <span className="info-text">
                      <strong>Seat:</strong> {exam.seat_number}
                    </span>
                  </div>
                )}
              </div>

              {exam.notes && (
                <div className="exam-notes">
                  <strong>Notes:</strong> {exam.notes}
                </div>
              )}

              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleStatus(exam)}
                  title={exam.status === 'Completed' ? 'Mark as Upcoming' : 'Mark as Completed'}
                >
                  {exam.status === 'Completed' ? '↺ Mark Upcoming' : '✓ Mark Completed'}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onNavigateToEdit(exam)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => handleDelete(exam.id, exam.subject_name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
