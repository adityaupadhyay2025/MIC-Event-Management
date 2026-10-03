-- ========================================================
-- FITCORE GYM MANAGEMENT SYSTEM - SEED DATA
-- Populates all 6 relational tables with sample records
-- matching DA1 assignment sheets.
-- ========================================================

-- 1. POPULATE MEMBER TABLE (Matching DA1 Sample Records)
INSERT INTO MEMBER (MEMBER_ID, MEMBER_NAME, AGE, GENDER, PHONE, MEMBERSHIP_TYPE, JOIN_DATE) VALUES
('M001', 'Priya Sharma', 18, 'Female', '9876543210', 'Premium', '2024-01-10'),
('M002', 'Rahul Kumar', 22, 'Male', '9876543211', 'Basic', '2024-02-15'),
('M003', 'Sneha Patel', 21, 'Female', '9876543212', 'Premium', '2024-03-01'),
('M004', 'Arjun Singh', 19, 'Male', '9876543213', 'Standard', '2024-03-20'),
('M005', 'Rakesh Verma', 23, 'Male', '9901567814', 'Premium', '2024-04-05'),
('M006', 'Ananya Rao', 20, 'Female', '9876543215', 'Standard', '2024-04-18'),
('M007', 'Vikram Joshi', 25, 'Male', '9876543216', 'Premium', '2024-05-12'),
('M008', 'Meera Nair', 24, 'Female', '9876543217', 'Basic', '2024-06-01');

-- 2. POPULATE TRAINER TABLE (Matching DA1 Sample Records)
INSERT INTO TRAINER (TRAINER_ID, TRAINER_NAME, PHONE, SPECIALIZATION, EXPERIENCE) VALUES
('T001', 'Karan Mehta', '9998270111', 'Strength', '6 years'),
('T002', 'Rakesh Nair', '9998370112', 'Cardio', '4 years'),
('T003', 'Allen Walker', '9998470114', 'Weight Loss', '5 years'),
('T004', 'Neha Kapoor', '9998570115', 'Yoga & Core', '3 years');

-- 3. POPULATE EQUIPMENT TABLE (Matching DA1 Sample Records)
INSERT INTO EQUIPMENT (EQUIPMENT_ID, EQUIPMENT_NAME, CATEGORY, BRAND, PURCHASE_DATE, CONDITION, STATUS) VALUES
('E101', 'Treadmill Commercial X9', 'Cardio', 'Alpha', '2024-01-15', 'Good', 'Available'),
('E102', 'Olympic Bench Press', 'Strength', 'Rogue', '2023-10-11', 'Good', 'Available'),
('E103', 'Hex Dumbbell Set (2.5-30kg)', 'Free Weight', 'Precor', '2024-03-20', 'Fair', 'Available'),
('E104', 'Upright Exercise Bike', 'Cardio', 'Matrix', '2022-09-18', 'Fair', 'Maintenance'),
('E105', 'Lat Pulldown & Low Row', 'Strength', 'Alpha', '2023-07-05', 'Good', 'Available'),
('E106', 'Concept2 Rower Ergometer', 'Cardio', 'Concept2', '2024-04-10', 'Good', 'Available');

-- 4. POPULATE EQUIPMENT_USAGE TABLE (Matching DA1 Sample Records)
INSERT INTO EQUIPMENT_USAGE (USAGE_ID, MEMBER_ID, EQUIPMENT_ID, TRAINER_ID, USAGE_DATE, DURATION) VALUES
('U001', 'M001', 'E101', 'T002', '2024-07-20', '30 mins'),
('U002', 'M002', 'E103', 'T001', '2024-07-20', '60 mins'),
('U003', 'M003', 'E102', 'T001', '2024-07-21', '30 mins'),
('U004', 'M004', 'E105', 'T003', '2024-06-22', '45 mins'),
('U005', 'M005', 'E101', 'T002', '2024-05-23', '60 mins'),
('U006', 'M001', 'E106', 'T002', '2024-08-10', '40 mins'),
('U007', 'M007', 'E102', 'T001', '2024-08-12', '50 mins');

-- 5. POPULATE MAINTENANCE TABLE (Matching DA1 Sample Records)
INSERT INTO MAINTENANCE (MAINTENANCE_ID, EQUIPMENT_ID, MAINTENANCE_DATE, TECHNICIAN_NAME, COST, REMARKS) VALUES
('MT001', 'E104', '2024-10-07', 'Rajesh Sharma', 2500.00, 'Drive belt replacement and console recalibration'),
('MT002', 'E102', '2024-05-25', 'Suresh Patel', 1200.00, 'Barbell collar lubrication and bench upholstery fix'),
('MT003', 'E101', '2024-05-18', 'Amit Verma', 1800.00, 'Motor check, belt alignment & speed sensor cleaning'),
('MT004', 'E105', '2024-08-15', 'Rajesh Sharma', 950.00, 'High-tensile cable inspection and pulley grease');

-- 6. POPULATE PAYMENT TABLE (Matching DA1 Sample Records)
INSERT INTO PAYMENT (PAYMENT_ID, MEMBER_ID, AMOUNT, PAYMENT_DATE, PAYMENT_MODE, STATUS) VALUES
('P001', 'M001', 12000.00, '2024-05-01', 'UPI', 'Paid'),
('P002', 'M002', 8000.00, '2024-06-03', 'Card', 'Paid'),
('P003', 'M003', 12000.00, '2024-07-04', 'Cash', 'Pending'),
('P004', 'M004', 9500.00, '2024-07-10', 'UPI', 'Paid'),
('P005', 'M005', 12000.00, '2024-08-01', 'Card', 'Paid'),
('P006', 'M006', 9500.00, '2024-08-15', 'UPI', 'Paid'),
('P007', 'M007', 12000.00, '2024-08-20', 'Net Banking', 'Paid'),
('P008', 'M008', 8000.00, '2024-09-01', 'Cash', 'Pending');
