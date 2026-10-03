# DIGITAL ASSIGNMENT 2 (DA-2) PROJECT REPORT
## SYSTEM: FITCORE - GYM MANAGEMENT & EQUIPMENT TRACKING SYSTEM
**Course:** Database Management Systems (DBMS)  
**Submission Deadline:** October 11  
**Evaluation Mode:** Individual Submission & Review  

---

## 1. PROJECT OBJECTIVE & SYSTEM OVERVIEW
The **FitCore Gym Management System** is a full-stack, normalized relational database management system designed to streamline fitness club operations. The database systematically maintains records of gym members, certified trainers, equipment inventory, daily supervised workout usage logs, machinery servicing/maintenance, and membership payment subscriptions.

### Key Objectives:
1. **Relational Integrity:** Implement normalized schemas with primary key, foreign key, unique, and check constraints.
2. **Interactive Front-End:** Provide a modern web interface to perform **INSERT**, **UPDATE**, and **DELETE** operations directly into the database.
3. **Complex Analytical Queries:** Formulate and execute at least 10 domain-specific SQL queries (including multi-table joins, aggregations with HAVING, nested correlated subqueries, set operations, and window functions).
4. **PL/SQL Implementation:** Develop robust PL/SQL stored procedures with exception handling, stored functions, database triggers, and explicit cursors.

---

## 2. RELATIONAL DATABASE SCHEMA & CONSTRAINTS (DA-1 ALIGNED)

The database schema directly maps to the Entity-Relationship (ER) and Extended Entity-Relationship (EER) models developed in DA-1:

### 1. `MEMBER` Table
Stores registered gym athletes, personal demographics, contact phone, and membership tier.
- **Attributes:**
  - `MEMBER_ID` (VARCHAR(10), PRIMARY KEY)
  - `MEMBER_NAME` (VARCHAR(60), NOT NULL)
  - `AGE` (INT, CHECK (AGE >= 14))
  - `GENDER` (VARCHAR(10), CHECK (GENDER IN ('Male', 'Female', 'Other')))
  - `PHONE` (VARCHAR(15), UNIQUE, NOT NULL)
  - `MEMBERSHIP_TYPE` (VARCHAR(20), NOT NULL, CHECK (MEMBERSHIP_TYPE IN ('Basic', 'Standard', 'Premium')))
  - `JOIN_DATE` (DATE)

### 2. `TRAINER` Table
Stores certified personal fitness trainers, contact details, specializations, and years of coaching experience.
- **Attributes:**
  - `TRAINER_ID` (VARCHAR(10), PRIMARY KEY)
  - `TRAINER_NAME` (VARCHAR(60), NOT NULL)
  - `PHONE` (VARCHAR(15), UNIQUE, NOT NULL)
  - `SPECIALIZATION` (VARCHAR(50), NOT NULL)
  - `EXPERIENCE` (VARCHAR(30), NOT NULL)

### 3. `EQUIPMENT` Table
Tracks gym machinery, purchase date, physical working condition, and operational availability.
- **Attributes:**
  - `EQUIPMENT_ID` (VARCHAR(10), PRIMARY KEY)
  - `EQUIPMENT_NAME` (VARCHAR(60), NOT NULL)
  - `CATEGORY` (VARCHAR(30), NOT NULL, CHECK (CATEGORY IN ('Cardio', 'Strength', 'Free Weight')))
  - `BRAND` (VARCHAR(40), NOT NULL)
  - `PURCHASE_DATE` (DATE, NOT NULL)
  - `CONDITION` (VARCHAR(20), NOT NULL, CHECK (CONDITION IN ('Good', 'Fair', 'Poor')))
  - `STATUS` (VARCHAR(20), NOT NULL, CHECK (STATUS IN ('Available', 'Maintenance', 'Unavailable')))

### 4. `EQUIPMENT_USAGE` Table
Logs member workout sessions on specific equipment supervised by certified trainers (1:M Relationship).
- **Attributes:**
  - `USAGE_ID` (VARCHAR(10), PRIMARY KEY)
  - `MEMBER_ID` (VARCHAR(10), FOREIGN KEY → MEMBER(MEMBER_ID))
  - `EQUIPMENT_ID` (VARCHAR(10), FOREIGN KEY → EQUIPMENT(EQUIPMENT_ID))
  - `TRAINER_ID` (VARCHAR(10), FOREIGN KEY → TRAINER(TRAINER_ID))
  - `USAGE_DATE` (DATE, NOT NULL)
  - `DURATION` (VARCHAR(30), NOT NULL)

### 5. `MAINTENANCE` Table
Maintains machinery repair work orders, technician names, servicing costs, and remarks (1:M Relationship).
- **Attributes:**
  - `MAINTENANCE_ID` (VARCHAR(10), PRIMARY KEY)
  - `EQUIPMENT_ID` (VARCHAR(10), FOREIGN KEY → EQUIPMENT(EQUIPMENT_ID))
  - `MAINTENANCE_DATE` (DATE, NOT NULL)
  - `TECHNICIAN_NAME` (VARCHAR(60), NOT NULL)
  - `COST` (DECIMAL(10,2), NOT NULL, CHECK (COST >= 0))
  - `REMARKS` (VARCHAR(150))

### 6. `PAYMENT` Table
Tracks membership subscription billing, transaction mode, and settlement status (1:N Relationship).
- **Attributes:**
  - `PAYMENT_ID` (VARCHAR(10), PRIMARY KEY)
  - `MEMBER_ID` (VARCHAR(10), FOREIGN KEY → MEMBER(MEMBER_ID))
  - `AMOUNT` (DECIMAL(10,2), NOT NULL, CHECK (AMOUNT > 0))
  - `PAYMENT_DATE` (DATE, NOT NULL)
  - `PAYMENT_MODE` (VARCHAR(20), CHECK (PAYMENT_MODE IN ('UPI', 'Card', 'Cash', 'Net Banking')))
  - `STATUS` (VARCHAR(20), CHECK (STATUS IN ('Paid', 'Pending', 'Failed')))

---

## 3. NORMALIZATION PROOF (1NF TO BCNF)
*(Reiterating and confirming the mathematical decomposition established in DA-1)*

### 1. First Normal Form (1NF)
- **Condition:** All column values must be atomic, and there must be no repeating groups.
- **Proof:** In all relations (`MEMBER`, `TRAINER`, `EQUIPMENT`, `EQUIPMENT_USAGE`, `MAINTENANCE`, `PAYMENT`), every field holds a single, indivisible scalar value. Attributes such as `Phone` and `Address` are not stored as arrays or composite strings. Hence, the system is in **1NF**.

### 2. Second Normal Form (2NF)
- **Condition:** Relation must be in 1NF and no non-prime attribute should be partially dependent on any proper subset of a candidate key.
- **Proof:** Every relation in the schema uses a single-attribute primary key (`MEMBER_ID`, `TRAINER_ID`, `EQUIPMENT_ID`, `USAGE_ID`, `MAINTENANCE_ID`, `PAYMENT_ID`). Since every primary key consists of exactly one attribute, partial dependency is mathematically impossible. Therefore, the database is in **2NF**.

### 3. Third Normal Form (3NF)
- **Condition:** Relation must be in 2NF and there must be no transitive functional dependency (i.e. non-prime attributes must not depend on other non-prime attributes: $X \to Y$ and $Y \to Z$).
- **Decomposition:**
  - In an unnormalized usage log: $\text{Usage\_ID} \to \text{Member\_ID} \to \text{Member\_Name}$ (violating 3NF).
  - Decomposed by isolating `MEMBER(Member_ID, Member_Name, ...)` and retaining only the foreign key `Member_ID` in `EQUIPMENT_USAGE`.
  - The same decomposition was applied to isolate `EQUIPMENT` and `TRAINER`.
  - Hence, all transitive dependencies are eliminated and the schema is in **3NF**.

### 4. Boyce-Codd Normal Form (BCNF)
- **Condition:** For every non-trivial functional dependency $X \to Y$, determinant $X$ must be a candidate key (super key).
- **Proof:** In each decomposed relation, the only determinants are the candidate keys themselves:
  - $\text{MEMBER\_ID} \to \{\text{MEMBER\_NAME}, \text{AGE}, \text{GENDER}, \text{PHONE}, \text{MEMBERSHIP\_TYPE}\}$
  - $\text{TRAINER\_ID} \to \{\text{TRAINER\_NAME}, \text{PHONE}, \text{SPECIALIZATION}, \text{EXPERIENCE}\}$
  - $\text{EQUIPMENT\_ID} \to \{\text{EQUIPMENT\_NAME}, \text{CATEGORY}, \text{BRAND}, \text{PURCHASE\_DATE}, \text{CONDITION}, \text{STATUS}\}$
  - $\text{USAGE\_ID} \to \{\text{MEMBER\_ID}, \text{EQUIPMENT\_ID}, \text{TRAINER\_ID}, \text{USAGE\_DATE}, \text{DURATION}\}$
  - $\text{MAINTENANCE\_ID} \to \{\text{EQUIPMENT\_ID}, \text{MAINTENANCE\_DATE}, \text{TECHNICIAN\_NAME}, \text{COST}, \text{REMARKS}\}$
  - $\text{PAYMENT\_ID} \to \{\text{MEMBER\_ID}, \text{AMOUNT}, \text{PAYMENT\_DATE}, \text{PAYMENT\_MODE}, \text{STATUS}\}$
- Because every determinant is a super key, the entire schema is in **BCNF (3.5NF)**.

---

## 4. THE 10 REQUIRED SQL QUERIES WITH RESULTS

### Query 1: Multi-Table JOIN (4 Tables)
**Objective:** Produce a complete workout session audit displaying Member Name, Equipment Name, Category, supervising Trainer Name, Date, and Duration.
```sql
SELECT 
    u.USAGE_ID,
    m.MEMBER_NAME,
    m.MEMBERSHIP_TYPE,
    e.EQUIPMENT_NAME,
    e.CATEGORY AS EQUIPMENT_CATEGORY,
    t.TRAINER_NAME,
    t.SPECIALIZATION AS TRAINER_SPECIALTY,
    u.USAGE_DATE,
    u.DURATION
FROM EQUIPMENT_USAGE u
JOIN MEMBER m ON u.MEMBER_ID = m.MEMBER_ID
JOIN EQUIPMENT e ON u.EQUIPMENT_ID = e.EQUIPMENT_ID
JOIN TRAINER t ON u.TRAINER_ID = t.TRAINER_ID
ORDER BY u.USAGE_DATE DESC;
```
*Result Summary:* Successfully retrieves audit trail across 4 interrelated tables with sorted timestamps.

---

### Query 2: Aggregate Function with GROUP BY & HAVING
**Objective:** Identify equipment categories whose total maintenance cost exceeds ₹2,000, along with service count and average cost.
```sql
SELECT 
    e.CATEGORY,
    COUNT(m.MAINTENANCE_ID) AS TOTAL_SERVICINGS,
    SUM(m.COST) AS TOTAL_MAINTENANCE_COST,
    ROUND(AVG(m.COST), 2) AS AVERAGE_COST_PER_SERVICE
FROM EQUIPMENT e
JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
GROUP BY e.CATEGORY
HAVING SUM(m.COST) > 2000.00
ORDER BY TOTAL_MAINTENANCE_COST DESC;
```
*Output:*
- `Cardio` | Total Servicings: 2 | Total Cost: ₹4,300.00 | Average: ₹2,150.00

---

### Query 3: Correlated Subquery with NOT EXISTS
**Objective:** Find dormant/inactive members who have never logged any workout session.
```sql
SELECT 
    m.MEMBER_ID,
    m.MEMBER_NAME,
    m.PHONE,
    m.MEMBERSHIP_TYPE,
    m.AGE
FROM MEMBER m
WHERE NOT EXISTS (
    SELECT 1 
    FROM EQUIPMENT_USAGE u 
    WHERE u.MEMBER_ID = m.MEMBER_ID
)
ORDER BY m.MEMBER_ID;
```
*Output:* Identifies members `M006` (Ananya Rao) and `M008` (Meera Nair) for retention marketing.

---

### Query 4: Conditional Aggregation & CASE Statement
**Objective:** Summarize revenue collected vs pending receivables grouped by Membership Tier.
```sql
SELECT 
    m.MEMBERSHIP_TYPE,
    COUNT(DISTINCT m.MEMBER_ID) AS TOTAL_MEMBERS,
    SUM(CASE WHEN p.STATUS = 'Paid' THEN p.AMOUNT ELSE 0 END) AS REVENUE_COLLECTED,
    SUM(CASE WHEN p.STATUS = 'Pending' THEN p.AMOUNT ELSE 0 END) AS PENDING_RECEIVABLES
FROM MEMBER m
LEFT JOIN PAYMENT p ON m.MEMBER_ID = p.MEMBER_ID
GROUP BY m.MEMBERSHIP_TYPE
ORDER BY REVENUE_COLLECTED DESC;
```
*Output:*
- `Premium` | Members: 4 | Collected: ₹36,000 | Pending: ₹12,000
- `Standard` | Members: 2 | Collected: ₹19,000 | Pending: ₹0
- `Basic` | Members: 2 | Collected: ₹8,000 | Pending: ₹8,000

---

### Query 5: Subquery with Comparison to Global Average
**Objective:** Retrieve equipment repairs where the single service cost was higher than the gym-wide average repair cost.
```sql
SELECT 
    e.EQUIPMENT_ID,
    e.EQUIPMENT_NAME,
    e.CATEGORY,
    m.TECHNICIAN_NAME,
    m.COST AS INCIDENT_COST,
    m.REMARKS
FROM EQUIPMENT e
JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
WHERE m.COST > (
    SELECT AVG(COST) 
    FROM MAINTENANCE
)
ORDER BY m.COST DESC;
```
*Output:*
- `E104` (Exercise Bike) | Cost: ₹2,500 | Belt replacement
- `E101` (Treadmill) | Cost: ₹1,800 | Motor check

---

### Query 6: Trainer Workload & Client Reach Analysis
**Objective:** Calculate total sessions supervised and distinct athletes coached per trainer.
```sql
SELECT 
    t.TRAINER_ID,
    t.TRAINER_NAME,
    t.SPECIALIZATION,
    t.EXPERIENCE,
    COUNT(u.USAGE_ID) AS SESSIONS_SUPERVISED,
    COUNT(DISTINCT u.MEMBER_ID) AS UNIQUE_CLIENTS_COACHED
FROM TRAINER t
LEFT JOIN EQUIPMENT_USAGE u ON t.TRAINER_ID = u.TRAINER_ID
GROUP BY t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION, t.EXPERIENCE
ORDER BY SESSIONS_SUPERVISED DESC;
```
*Output:* Highlights Coach Karan Mehta and Coach Rakesh Nair as highest workload trainers.

---

### Query 7: Financial Defaulters / Pending Dues Report
**Objective:** Pull all pending dues with athlete contact numbers for reception follow-up.
```sql
SELECT 
    p.PAYMENT_ID,
    m.MEMBER_ID,
    m.MEMBER_NAME,
    m.PHONE,
    m.MEMBERSHIP_TYPE,
    p.AMOUNT AS DUE_AMOUNT,
    p.PAYMENT_DATE AS DUE_DATE,
    p.PAYMENT_MODE
FROM PAYMENT p
JOIN MEMBER m ON p.MEMBER_ID = m.MEMBER_ID
WHERE p.STATUS = 'Pending'
ORDER BY p.PAYMENT_DATE ASC;
```
*Output:* Lists pending payments for `M003` (₹12,000) and `M008` (₹8,000).

---

### Query 8: Asset Health & Cumulative Maintenance Expense
**Objective:** Calculate total cumulative repair investment for every equipment unit.
```sql
SELECT 
    e.EQUIPMENT_ID,
    e.EQUIPMENT_NAME,
    e.CATEGORY,
    e.STATUS AS CURRENT_STATUS,
    e.CONDITION,
    COALESCE(SUM(m.COST), 0) AS CUMULATIVE_REPAIR_COST
FROM EQUIPMENT e
LEFT JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
GROUP BY e.EQUIPMENT_ID, e.EQUIPMENT_NAME, e.CATEGORY, e.STATUS, e.CONDITION
ORDER BY CUMULATIVE_REPAIR_COST DESC;
```
*Output:* Provides complete equipment lifecycle cost metrics.

---

### Query 9: Set Operation (UNION ALL) - Master Directory
**Objective:** Consolidate gym staff and enrolled members into a single unified contact roster.
```sql
SELECT 
    MEMBER_ID AS ENTITY_ID,
    MEMBER_NAME AS CONTACT_NAME,
    PHONE,
    'Member' AS ROLE,
    MEMBERSHIP_TYPE AS DETAILS
FROM MEMBER

UNION ALL

SELECT 
    TRAINER_ID AS ENTITY_ID,
    TRAINER_NAME AS CONTACT_NAME,
    PHONE,
    'Trainer' AS ROLE,
    SPECIALIZATION AS DETAILS
FROM TRAINER
ORDER BY ROLE DESC, CONTACT_NAME ASC;
```

---

### Query 10: Analytical Window Function (DENSE_RANK)
**Objective:** Rank equipment units by workout utilization frequency within their category.
```sql
SELECT 
    e.CATEGORY,
    e.EQUIPMENT_NAME,
    e.BRAND,
    COUNT(u.USAGE_ID) AS USAGE_COUNT,
    DENSE_RANK() OVER (
        PARTITION BY e.CATEGORY 
        ORDER BY COUNT(u.USAGE_ID) DESC
    ) AS CATEGORY_POPULARITY_RANK
FROM EQUIPMENT e
LEFT JOIN EQUIPMENT_USAGE u ON e.EQUIPMENT_ID = u.EQUIPMENT_ID
GROUP BY e.CATEGORY, e.EQUIPMENT_NAME, e.BRAND
ORDER BY e.CATEGORY, CATEGORY_POPULARITY_RANK;
```

---

## 5. PL/SQL IMPLEMENTATION

### 1. Stored Procedure with Exception Handling (`SP_REGISTER_MEMBER`)
```sql
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
    IF p_age < 14 THEN
        RAISE ex_underage;
    END IF;

    INSERT INTO MEMBER (MEMBER_ID, MEMBER_NAME, AGE, GENDER, PHONE, MEMBERSHIP_TYPE, JOIN_DATE)
    VALUES (p_member_id, p_member_name, p_age, p_gender, p_phone, p_membership_type, SYSDATE);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Success: Member ' || p_member_name || ' registered successfully.');
EXCEPTION
    WHEN ex_underage THEN
        RAISE_APPLICATION_ERROR(-20001, 'Validation Error: Member must be at least 14 years old to join.');
    WHEN DUP_VAL_ON_INDEX THEN
        RAISE_APPLICATION_ERROR(-20002, 'Duplicate Error: Member ID or Phone Number already exists.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20003, 'Database Error: ' || SQLERRM);
END;
/
```

### 2. Stored Function (`FN_GET_MEMBER_TOTAL_PAID`)
```sql
CREATE OR REPLACE FUNCTION FN_GET_MEMBER_TOTAL_PAID(
    p_member_id IN VARCHAR2
) RETURN NUMBER AS
    v_total_paid NUMBER(10,2) := 0;
BEGIN
    SELECT NVL(SUM(AMOUNT), 0) INTO v_total_paid
    FROM PAYMENT
    WHERE MEMBER_ID = p_member_id AND STATUS = 'Paid';

    RETURN v_total_paid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/
```

### 3. Database Trigger (`TRG_EQUIPMENT_MAINT_STATUS`)
```sql
CREATE OR REPLACE TRIGGER TRG_EQUIPMENT_MAINT_STATUS
AFTER INSERT ON MAINTENANCE
FOR EACH ROW
BEGIN
    UPDATE EQUIPMENT
    SET STATUS = 'Maintenance'
    WHERE EQUIPMENT_ID = :NEW.EQUIPMENT_ID;
END;
/
```

### 4. Explicit Cursor & Anonymous Block (`CUR_TRAINER_WORKLOAD`)
```sql
DECLARE
    CURSOR cur_trainers IS
        SELECT t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION, COUNT(u.USAGE_ID) AS SESSIONS
        FROM TRAINER t
        LEFT JOIN EQUIPMENT_USAGE u ON t.TRAINER_ID = u.TRAINER_ID
        GROUP BY t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION
        ORDER BY SESSIONS DESC;
    v_rec cur_trainers%ROWTYPE;
BEGIN
    OPEN cur_trainers;
    LOOP
        FETCH cur_trainers INTO v_rec;
        EXIT WHEN cur_trainers%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE('Trainer: ' || v_rec.TRAINER_NAME || ' | Supervised: ' || v_rec.SESSIONS || ' sessions');
    END LOOP;
    CLOSE cur_trainers;
END;
/
```

---

## 6. FRONT-END INTERFACE DEMO FLOW (FOR REVIEW EVALUATION)

1. **Dashboard:**
   - Real-time KPI counters (Members, Trainers, Equipment, Revenue).
   - Dynamic charts displaying Membership Tier proportions and monthly cashflow vs maintenance costs.
   - Equipment Fleet Readiness indicators.
2. **Data Manipulation (INSERT, UPDATE, DELETE):**
   - Click **+ Add Member** to perform an **INSERT** operation with age validation ($Age \ge 14$).
   - Click **Edit** on any row to open the modal dialog and execute a SQL **UPDATE**.
   - Click **Delete** to trigger a modal confirmation and execute a SQL **DELETE**.
   - Immediate feedback via animated toasts and instant table reload.
3. **Operations:**
   - **Equipment Usage:** Dynamic selection of Member, Equipment, and Supervising Trainer.
   - **Maintenance:** Entering a servicing record automatically executes the trigger behavior setting machine status to `'Maintenance'`.
   - **Payments:** Instant 1-click **Mark Paid** action updates payment status to `'Paid'`.
4. **Interactive SQL Studio:**
   - Evaluator can click **▶ Execute Query** on any of the 10 pre-loaded queries to observe execution time, SQL syntax, and tabular output.
   - Evaluator can type custom SQL into the Query Studio runner box to test arbitrary queries.
5. **Interactive PL/SQL Test Bench:**
   - Test procedure `SP_REGISTER_MEMBER` with valid and invalid (age < 14 or duplicate ID) inputs to observe handled exceptions in the simulated DBMS_OUTPUT console.
   - Test function `FN_GET_MEMBER_TOTAL_PAID` with real member selection.
   - Run explicit cursor to view iterative trainer logs.

---
*Report Prepared for Academic Review & Evaluation.*
