import React, { useState } from 'react';
import { getStoredUser, setAuthToken, setStoredUser } from './api';
import AuthPage from './pages/AuthPage';
import SchedulePage from './pages/SchedulePage';
import ExamFormPage from './pages/ExamFormPage';

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [currentPage, setCurrentPage] = useState(() => (getStoredUser() ? 'schedule' : 'auth'));
  const [editingExam, setEditingExam] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('schedule');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
    setEditingExam(null);
    setCurrentPage('auth');
  };

  const handleNavigateToCreate = () => {
    setEditingExam(null);
    setCurrentPage('form');
  };

  const handleNavigateToEdit = (exam) => {
    setEditingExam(exam);
    setCurrentPage('form');
  };

  const handleSaveSuccess = () => {
    setEditingExam(null);
    setCurrentPage('schedule');
  };

  const handleCancelForm = () => {
    setEditingExam(null);
    setCurrentPage('schedule');
  };

  return (
    <div className="app-root">
      {currentPage === 'auth' && (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentPage === 'schedule' && (
        <SchedulePage
          user={user}
          onNavigateToCreate={handleNavigateToCreate}
          onNavigateToEdit={handleNavigateToEdit}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'form' && (
        <ExamFormPage
          examToEdit={editingExam}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
