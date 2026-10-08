const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, 'exam_schedule.db');
const db = new DatabaseSync(dbPath);

// Initialize SQLite Schema (Strictly 3 Models: users, subjects, exams)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Student',
    student_id TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    exam_title TEXT NOT NULL,
    exam_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    venue_hall TEXT NOT NULL,
    seat_number TEXT DEFAULT '',
    status TEXT DEFAULT 'Upcoming',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );
`);

// Seed default subjects if none exist
const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get().count;
if (subjectCount === 0) {
  const seedStmt = db.prepare(`
    INSERT INTO subjects (code, name, department, color)
    VALUES (?, ?, ?, ?)
  `);

  const initialSubjects = [
    ['CS-301', 'Data Structures & Algorithms', 'Computer Science', '#4f46e5'],
    ['MA-204', 'Applied Statistics & Probability', 'Mathematics', '#0284c7'],
    ['CS-305', 'Database Management Systems', 'Computer Science', '#059669'],
    ['EC-202', 'Digital Logic & Microprocessors', 'Electronics', '#d97706'],
    ['SE-340', 'Software Architecture & Testing', 'Software Eng', '#7c3aed'],
    ['HU-101', 'Ethics & Technical Writing', 'Humanities', '#db2777']
  ];

  for (const s of initialSubjects) {
    seedStmt.run(s[0], s[1], s[2], s[3]);
  }
}

// User Helpers
function getUserByPhone(phone) {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
}

function getUserById(id) {
  return db.prepare('SELECT id, phone, name, student_id, created_at FROM users WHERE id = ?').get(id);
}

function createUser(phone, name, studentId = '') {
  const stmt = db.prepare('INSERT INTO users (phone, name, student_id) VALUES (?, ?, ?)');
  const res = stmt.run(phone, name, studentId);
  return getUserById(Number(res.lastInsertRowid));
}

// Subject Helpers
function getAllSubjects() {
  return db.prepare('SELECT * FROM subjects ORDER BY code ASC').all();
}

function getSubjectById(id) {
  return db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
}

// Exam Helpers
function getExamsByUserId(userId) {
  return db.prepare(`
    SELECT 
      e.id,
      e.user_id,
      e.subject_id,
      e.exam_title,
      e.exam_date,
      e.start_time,
      e.end_time,
      e.venue_hall,
      e.seat_number,
      e.status,
      e.notes,
      e.created_at,
      s.code AS subject_code,
      s.name AS subject_name,
      s.department AS subject_department,
      s.color AS subject_color
    FROM exams e
    JOIN subjects s ON e.subject_id = s.id
    WHERE e.user_id = ?
    ORDER BY e.exam_date ASC, e.start_time ASC
  `).all(userId);
}

function getExamByIdAndUser(id, userId) {
  return db.prepare(`
    SELECT 
      e.*,
      s.code AS subject_code,
      s.name AS subject_name,
      s.department AS subject_department,
      s.color AS subject_color
    FROM exams e
    JOIN subjects s ON e.subject_id = s.id
    WHERE e.id = ? AND e.user_id = ?
  `).get(id, userId);
}

function createExam({ userId, subjectId, examTitle, examDate, startTime, endTime, venueHall, seatNumber, notes, status }) {
  const stmt = db.prepare(`
    INSERT INTO exams (
      user_id, subject_id, exam_title, exam_date, start_time, end_time, venue_hall, seat_number, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(
    userId,
    subjectId,
    examTitle,
    examDate,
    startTime,
    endTime,
    venueHall,
    seatNumber || '',
    notes || '',
    status || 'Upcoming'
  );
  return getExamByIdAndUser(Number(res.lastInsertRowid), userId);
}

function updateExam(id, userId, { subjectId, examTitle, examDate, startTime, endTime, venueHall, seatNumber, notes, status }) {
  const stmt = db.prepare(`
    UPDATE exams 
    SET 
      subject_id = COALESCE(?, subject_id),
      exam_title = COALESCE(?, exam_title),
      exam_date = COALESCE(?, exam_date),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      venue_hall = COALESCE(?, venue_hall),
      seat_number = COALESCE(?, seat_number),
      notes = COALESCE(?, notes),
      status = COALESCE(?, status)
    WHERE id = ? AND user_id = ?
  `);
  stmt.run(
    subjectId ?? null,
    examTitle ?? null,
    examDate ?? null,
    startTime ?? null,
    endTime ?? null,
    venueHall ?? null,
    seatNumber ?? null,
    notes ?? null,
    status ?? null,
    id,
    userId
  );
  return getExamByIdAndUser(id, userId);
}

function deleteExam(id, userId) {
  const stmt = db.prepare('DELETE FROM exams WHERE id = ? AND user_id = ?');
  const res = stmt.run(id, userId);
  return res.changes > 0;
}

module.exports = {
  db,
  getUserByPhone,
  getUserById,
  createUser,
  getAllSubjects,
  getSubjectById,
  getExamsByUserId,
  getExamByIdAndUser,
  createExam,
  updateExam,
  deleteExam
};
