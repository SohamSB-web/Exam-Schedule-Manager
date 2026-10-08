import React, { useState } from 'react';
import { api, setAuthToken, setStoredUser } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1 = Phone input, 2 = OTP input
  const [phone, setPhone] = useState('+91');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setErrorMessage('Please enter a valid phone number with country code (e.g., +919876543210)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(trimmedPhone);
      setSuccessMessage(res.message || 'Verification code sent via Minimoth!');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch OTP. Please check the phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp({
        phone: phone.trim(),
        code: otpCode.trim(),
        name: name.trim(),
        student_id: studentId.trim()
      });

      if (res.token && res.user) {
        setAuthToken(res.token);
        setStoredUser(res.user);
        onLoginSuccess(res.user);
      } else {
        setErrorMessage('Authentication response was incomplete.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-card">
        {/* Header Badge */}
        <div className="auth-brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h1>Exam Schedule Manager</h1>
            <p className="subtitle">Secure Academic Exam Timetable Portal</p>
          </div>
        </div>

        <div className="minimoth-badge">
          <span className="dot-pulse"></span>
          <span>Powered by Minimoth OTP Auth</span>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number (with country code)</label>
              <input
                id="phone"
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
              <span className="field-hint">Include country code (e.g. +91 for India, +1 for US)</span>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name (Optional)</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Student ID / Roll No (Optional)</label>
              <input
                id="studentId"
                type="text"
                placeholder="e.g. CS2026-084"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending OTP via Minimoth...' : 'Send Verification OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="verify-target">
              <span>Code sent to: <strong>{phone}</strong></span>
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setStep(1);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                Change Phone
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="otpCode">6-Digit Verification Code</label>
              <input
                id="otpCode"
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                autoFocus
                className="otp-input"
              />
              <span className="field-hint">
                💡 Sandbox Note: You can enter <strong>123456</strong> or the SMS code received.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP & Log In →'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSendOtp}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>Single-Sign On with Zero Passwords</span>
        </div>
      </div>
    </div>
  );
}
