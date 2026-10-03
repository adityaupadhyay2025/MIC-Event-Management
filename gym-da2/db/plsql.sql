-- ====================================================================
-- FITCORE GYM MANAGEMENT SYSTEM - DA2 PL/SQL IMPLEMENTATION
-- Includes:
--   1. STORED PROCEDURE (with Exception Handling & Validation)
--   2. STORED FUNCTION (Financial calculation)
--   3. DATABASE TRIGGER (Automatic equipment status update on maintenance)
--   4. EXPLICIT CURSOR (Trainer performance report using loop & %NOTFOUND)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. STORED PROCEDURE: SP_REGISTER_MEMBER
-- Safely registers a new member, enforces minimum age restriction (>=14),
-- and handles duplicate key exceptions (DUP_VAL_ON_INDEX).
-- --------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_REGISTER_MEMBER(
    p_member_id       IN VARCHAR2,
    p_member_name     IN VARCHAR2,
    p_age             IN NUMBER,
    p_gender          IN VARCHAR2,
    p_phone           IN VARCHAR2,
    p_membership_type IN VARCHAR2
) AS
    ex_underage EXCEPTION;
BEGIN
    -- Business rule validation
    IF p_age < 14 THEN
        RAISE ex_underage;
    END IF;

    INSERT INTO MEMBER (MEMBER_ID, MEMBER_NAME, AGE, GENDER, PHONE, MEMBERSHIP_TYPE, JOIN_DATE)
    VALUES (p_member_id, p_member_name, p_age, p_gender, p_phone, p_membership_type, SYSDATE);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Success: Member ' || p_member_name || ' (' || p_member_id || ') registered successfully.');

EXCEPTION
    WHEN ex_underage THEN
        RAISE_APPLICATION_ERROR(-20001, 'Validation Error: Member must be at least 14 years old to join.');
    WHEN DUP_VAL_ON_INDEX THEN
        RAISE_APPLICATION_ERROR(-20002, 'Duplicate Error: Member ID or Phone Number already exists.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20003, 'Database Error: ' || SQLERRM);
END;
/

-- Test Call:
-- EXEC SP_REGISTER_MEMBER('M009', 'Rohan Gupta', 22, 'Male', '9876543299', 'Premium');


-- --------------------------------------------------------------------
-- 2. STORED FUNCTION: FN_GET_MEMBER_TOTAL_PAID
-- Takes a Member_ID as input parameter and computes the cumulative
-- sum of all verified 'Paid' transactions for that member.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_GET_MEMBER_TOTAL_PAID(
    p_member_id IN VARCHAR2
) RETURN NUMBER AS
    v_total_paid NUMBER(10,2) := 0;
    v_member_exists NUMBER := 0;
BEGIN
    -- Check if member exists
    SELECT COUNT(*) INTO v_member_exists 
    FROM MEMBER 
    WHERE MEMBER_ID = p_member_id;

    IF v_member_exists = 0 THEN
        RETURN -1; -- Indicator for non-existent member
    END IF;

    -- Calculate total paid amount
    SELECT NVL(SUM(AMOUNT), 0) INTO v_total_paid
    FROM PAYMENT
    WHERE MEMBER_ID = p_member_id AND STATUS = 'Paid';

    RETURN v_total_paid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Test Call:
-- SELECT MEMBER_ID, MEMBER_NAME, FN_GET_MEMBER_TOTAL_PAID(MEMBER_ID) AS TOTAL_PAID FROM MEMBER;


-- --------------------------------------------------------------------
-- 3. DATABASE TRIGGER: TRG_EQUIPMENT_MAINT_STATUS
-- Automatically flips the EQUIPMENT status to 'Maintenance' whenever
-- a new maintenance work order is inserted into the MAINTENANCE table.
-- --------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_EQUIPMENT_MAINT_STATUS
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    UPDATE EQUIPMENT
    SET STATUS = 'Maintenance'
    WHERE EQUIPMENT_ID = :NEW.EQUIPMENT_ID;

    DBMS_OUTPUT.PUT_LINE('Trigger Activated: Equipment ' || :NEW.EQUIPMENT_ID || ' status set to Maintenance.');
END;
/


-- --------------------------------------------------------------------
-- 4. EXPLICIT CURSOR & ANONYMOUS BLOCK: TRAINER WORKLOAD AUDIT
-- Iterates through trainers using an explicit cursor, fetches workout
-- session counts, and prints formatted summary via DBMS_OUTPUT.
-- --------------------------------------------------------------------
DECLARE
    -- Cursor declaration
    CURSOR cur_trainers IS
        SELECT 
            t.TRAINER_ID,
            t.TRAINER_NAME,
            t.SPECIALIZATION,
            COUNT(u.USAGE_ID) AS TOTAL_SESSIONS
        FROM TRAINER t
        LEFT JOIN EQUIPMENT_USAGE u ON t.TRAINER_ID = u.TRAINER_ID
        GROUP BY t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION
        ORDER BY TOTAL_SESSIONS DESC;

    -- Record variable matching cursor
    v_rec cur_trainers%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('====================================================');
    DBMS_OUTPUT.PUT_LINE('FITCORE GYM - TRAINER PERFORMANCE & AUDIT REPORT');
    DBMS_OUTPUT.PUT_LINE('====================================================');

    -- Open cursor
    OPEN cur_trainers;

    LOOP
        FETCH cur_trainers INTO v_rec;
        EXIT WHEN cur_trainers%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE('Trainer ID    : ' || v_rec.TRAINER_ID);
        DBMS_OUTPUT.PUT_LINE('Name          : ' || v_rec.TRAINER_NAME);
        DBMS_OUTPUT.PUT_LINE('Specialization: ' || v_rec.SPECIALIZATION);
        DBMS_OUTPUT.PUT_LINE('Supervised    : ' || v_rec.TOTAL_SESSIONS || ' workout session(s)');
        DBMS_OUTPUT.PUT_LINE('----------------------------------------------------');
    END LOOP;

    -- Close cursor
    CLOSE cur_trainers;
    DBMS_OUTPUT.PUT_LINE('Report Generation Completed.');
END;
/
