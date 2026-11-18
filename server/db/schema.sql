CREATE DATABASE IF NOT EXISTS job_tracker;
USE job_tracker;

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(120) NOT NULL,
  role VARCHAR(120) NOT NULL,
  status ENUM('Applied','Interview','Selected','Rejected') NOT NULL DEFAULT 'Applied',
  applied_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO applications (company, role, status, applied_date, notes) VALUES
('Acme Technologies', 'Frontend Developer Intern', 'Interview', '2026-11-10', 'Technical round scheduled'),
('Northstar Systems', 'Software Engineer', 'Applied', '2026-11-12', 'Applied through careers page');
