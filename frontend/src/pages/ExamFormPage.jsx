import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function ExamFormPage({ examToEdit, onSaveSuccess, onCancel }) {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    subject_id: examToEdit?.subject_id ? String(examToEdit.subject_id) : '',
    exam_title: examToEdit?.exam_title || 'Midterm Assessment',
    exam_date: examToEdit?.exam_date || '',
    start_time: examToEdit?.start_time || '09:30 AM',
    end_time: examToEdit?.end_time || '12:30 PM',
    venue_hall: examToEdit?.venue_hall || '',
    seat_number: examToEdit?.seat_number || '',
    status: examToEdit?.status || 'Upcoming',
    notes: examToEdit?.notes || ''
  });

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.getExams();
        const subList = res.subjects || [];
        setSubjects(subList);
        // Default to first subject if creating new and none selected
        if (!formData.subject_id && subList.length > 0) {
          setFormData((prev) => ({ ...prev, subject_id: String(subList[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyTimePreset = (start, end) => {
    setFormData((prev) => ({
      ...prev,
      start_time: start,
      end_time: end
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.subject_id) {
      setErrorMessage('Please select a course / subject.');
      return;
    }
    if (!formData.exam_title.trim()) {
      setErrorMessage('Please provide an exam title (e.g., Midterm Assessment).');
      return;
    }
    if (!formData.exam_date) {
      setErrorMessage('Please select the exam date.');
      return;
    }
    if (!formData.venue_hall.trim()) {
      setErrorMessage('Please specify the exam hall or venue.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        subject_id: Number(formData.subject_id),
        id: examToEdit ? examToEdit.id : undefined
      };
      await api.saveExam(payload);
      onSaveSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save exam schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <button className="btn btn-outline btn-sm" onClick={onCancel} style={{ marginRight: '10px' }}>
            ← Back
          </button>
          <span className="app-title">
            {examToEdit ? 'Edit Exam Schedule' : 'Schedule New Exam'}
          </span>
        </div>
      </header>

      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <h2>{examToEdit ? 'Update Exam Details' : 'New Examination Entry'}</h2>
            <p className="subtitle">Configure date, timing, hall location, and syllabus guidelines</p>
          </div>

          {errorMessage && (
            <div className="alert alert-error" style={{ marginBottom: '18px' }}>
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="exam-form">
            {/* Subject Selector */}
            <div className="form-group">
              <label htmlFor="subject_id">Course / Subject *</label>
              {loadingSubjects ? (
                <p className="field-hint">Loading subjects catalog...</p>
              ) : (
                <select
                  id="subject_id"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name} ({sub.department})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Exam Title */}
            <div className="form-group">
              <label htmlFor="exam_title">Exam Title / Type *</label>
              <input
                id="exam_title"
                name="exam_title"
                type="text"
                placeholder="e.g. Midterm Assessment, Final Assessment, Lab Practical"
                value={formData.exam_title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Exam Date */}
            <div className="form-group">
              <label htmlFor="exam_date">Exam Date *</label>
              <input
                id="exam_date"
                name="exam_date"
                type="date"
                value={formData.exam_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Time Presets & Inputs */}
            <div className="form-group">
              <label>Time Slot & Duration *</label>
              <div className="preset-buttons">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => applyTimePreset('09:30 AM', '12:30 PM')}
                >
                  🌅 Morning (09:30 AM - 12:30 PM)
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => applyTimePreset('02:00 PM', '05:00 PM')}
                >
                  ☀️ Afternoon (02:00 PM - 05:00 PM)
                </button>
              </div>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <div className="form-col">
                  <label htmlFor="start_time" className="sub-label">Start Time</label>
                  <input
                    id="start_time"
                    name="start_time"
                    type="text"
                    placeholder="09:30 AM"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-col">
                  <label htmlFor="end_time" className="sub-label">End Time</label>
                  <input
                    id="end_time"
                    name="end_time"
                    type="text"
                    placeholder="12:30 PM"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Venue & Seat */}
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="venue_hall">Exam Hall / Venue *</label>
                  <input
                    id="venue_hall"
                    name="venue_hall"
                    type="text"
                    placeholder="e.g. Hall 302, Academic Block A"
                    value={formData.venue_hall}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-col">
                <div className="form-group">
                  <label htmlFor="seat_number">Assigned Seat / Desk (Optional)</label>
                  <input
                    id="seat_number"
                    name="seat_number"
                    type="text"
                    placeholder="e.g. Desk B-14"
                    value={formData.seat_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Exam Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Notes, Syllabus or Checklist (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                placeholder="e.g. Bring scientific calculator and student ID card. Covers Chapters 1 to 6."
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : examToEdit ? 'Save Changes' : 'Schedule Exam →'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
