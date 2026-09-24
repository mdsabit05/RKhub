TRUNCATE resources, units, subjects, courses, semesters, academic_years RESTART IDENTITY CASCADE;

INSERT INTO academic_years(year_no,name) VALUES
(1,'1st Year'),(2,'2nd Year'),(3,'3rd Year');

INSERT INTO semesters(year_no,semester_no,name) VALUES
(1,1,'1st Sem'),(1,2,'2nd Sem'),
(2,3,'3rd Sem'),(2,4,'4th Sem'),
(3,5,'5th Sem'),(3,6,'6th Sem');

INSERT INTO courses(code,name) VALUES
('BCA','Bachelor of Computer Applications'),
('BBA','Bachelor of Business Administration');

INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'CC-101','Mathematics Foundations to Computer Science - I','CC',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'SEC-101','Problem Solving Techniques','SEC',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'CC-102','Computer Architecture','CC',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'AEC-101','General English - I','AEC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'MDE-101','Indian Knowledge System','MDE',5 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'VAC-101','Environmental Science and Sustainability','VAC',6 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-103','Mathematics Foundations to Computer Science - II','CC',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-104','Data Structures','CC',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-105','Operating Systems','CC',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'SEC-102','Object Oriented Programming using Java','SEC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'SEC-103','Web Technologies','SEC',5 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'VAC-102','Indian Constitution','VAC',6 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-201','Probability and Statistics','CC',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-202','Data Base Management System','CC',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'SEC-201','Python Programming','SEC',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-203','Software Engineering','CC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'DSE-201','Professional Elective - I','DSE',5 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'VAC-201','Disaster Management','VAC',6 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-204','Entrepreneurship and Startup Ecosystem','CC',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-205','Computer Networks','CC',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-206','Design and Analysis of Algorithm','CC',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-207','Artificial Intelligence','CC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'DSE-202','Professional Elective - II','DSE',5 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'SEC-202','Design Thinking and Innovation','SEC',6 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-301','Professional Elective - III','DSE',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-302','Professional Elective - IV','DSE',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-303','Professional Elective - V','DSE',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'SEC-301','Quantitative Techniques','SEC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'SEC-302','Internship/capstone Project','SEC',5 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'CC-301','Generative AI','CC',1 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'DSE-304','Professional Elective - VI','DSE',2 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'DSE-305','Professional Elective - VII','DSE',3 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'AEC-301','Soft Skills','AEC',4 FROM courses WHERE code='BCA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'CC-101','Principles and Practices of Management','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'AEC-101','Business Communication-I','AEC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'CC-102','Financial Accounting','CC',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'CC-103','Business Statistics and Logic','CC',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'AEC-102','General English','AEC',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'MDE-101','Indian Knowledge System','MDE',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'VAC-101','Environmental Science and Sustainability','VAC',7 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,1,'AEC-103','Additional Course - Indian or Foreign Language','AEC',8 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-201','Human Behaviour and Organization','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-202','Marketing Management','CC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'CC-203','Business Economics','CC',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'SEC-201','Emerging Technologies and application','SEC',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'MDE-201','Media Literacy and Critical Thinking','MDE',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'VAC-201','Indian Constitution','VAC',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'AEC-201','Business Communication-II','AEC',7 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,1,2,'AEC-202','Additional Course - Indian or Foreign Language','AEC',8 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-301','Cost and Management Accounting','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-302','Legal and Ethical issues in business','CC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'CC-303','Human Resource Management','CC',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'MDE-301','Indian Systems of Health and Wellness','MDE',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'SEC-301','Management Information System (MIS)','SEC',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,3,'VAC-301','Yoga/Sports/NCC/NSS/Disaster Management','VAC',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-401','Entrepreneurship and Startup Ecosystem','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-402','Operations Management','CC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-403','Financial Management','CC',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-404','Business Research methodology','CC',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'VAC-401','Business environment and public policy / Enterprise System and platforms / Geo Politics and impact on business / Public Health and management','VAC',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'CC-405','International Business','CC',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,2,4,'SEC-401','Design Thinking and Innovation','SEC',7 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'CC-501','Strategic Management','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'CC-502','Logistics and Supply Chain Management','CC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-501','Discipline Specific Electives - I','DSE',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-502','Discipline Specific Electives - II','DSE',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'SEC-501','Internship / Capstone Project','SEC',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'SEC-502','Major Project','SEC',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,5,'DSE-*','Discipline Specific Elective (Audit Course)','DSE',7 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'CC-601','Project Management','CC',1 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'CC-602','Business Taxation','CC',2 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'DSE-601','Discipline Specific Electives - III','DSE',3 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'DSE-602','Discipline Specific Electives - IV','DSE',4 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'SEC-601','Corporate Governance','SEC',5 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'SEC-602','Major Project (Initiated in 5th Semester)','SEC',6 FROM courses WHERE code='BBA';
INSERT INTO subjects(course_id,year_no,semester_no,code,name,subject_type,display_order) SELECT id,3,6,'DSE-XX*','Discipline Specific Elective (Audit Course)','DSE',7 FROM courses WHERE code='BBA';

INSERT INTO units(subject_id,unit_no,name)
SELECT id,u.unit_no,'UNIT - ' || u.unit_no
FROM subjects
CROSS JOIN (VALUES (1),(2),(3),(4)) AS u(unit_no);

-- Demo resources: replace URLs with real stored PDFs/links later.
INSERT INTO resources(resource_type,subject_id,unit_id,year_no,semester_no,title,description,file_url)
SELECT 'notes',s.id,u.id,s.year_no,s.semester_no,
       s.code || ' - Unit ' || u.unit_no || ' Notes',
       'Demo PDF resource',
       'https://example.com/rkhub/demo-notes.pdf'
FROM subjects s JOIN units u ON u.subject_id=s.id
WHERE s.code='CC-202' AND u.unit_no=1;

INSERT INTO resources(resource_type,subject_id,unit_id,year_no,semester_no,title,description,file_url)
SELECT 'pyq',s.id,u.id,s.year_no,s.semester_no,
       '2025 ' || s.name || ' PYQ - Unit ' || u.unit_no,
       'Demo PYQ PDF',
       'https://example.com/rkhub/demo-pyq.pdf'
FROM subjects s JOIN units u ON u.subject_id=s.id
WHERE s.code='CC-202' AND u.unit_no=1;

INSERT INTO resources(resource_type,subject_id,year_no,semester_no,title,description,file_url)
SELECT 'syllabus',s.id,s.year_no,s.semester_no,
       s.name || ' Syllabus','Demo syllabus PDF',
       'https://example.com/rkhub/demo-syllabus.pdf'
FROM subjects s
WHERE s.code='CC-202';

INSERT INTO resources(resource_type,subject_id,unit_id,year_no,semester_no,title,description,external_url)
SELECT 'reference',s.id,u.id,s.year_no,s.semester_no,
       s.name || ' Unit ' || u.unit_no || ' Reference',
       'Demo reference link',
       'https://example.com/reference'
FROM subjects s JOIN units u ON u.subject_id=s.id
WHERE s.code='CC-202' AND u.unit_no=1;
