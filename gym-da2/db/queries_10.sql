-- ====================================================================
-- FITCORE GYM MANAGEMENT SYSTEM - DA2 SQL QUERIES (10 REQUIRED QUERIES)
-- Topic: Gym Management & Equipment Database
-- ====================================================================

-- --------------------------------------------------------------------
-- QUERY 1: MULTI-TABLE JOIN (4 TABLES)
-- Retrieve comprehensive workout audit trail including Member Name,
-- Equipment Name, Category, supervising Trainer Name, Date, and Duration.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 2: AGGREGATE FUNCTION WITH GROUP BY & HAVING CLAUSE
-- Find equipment categories whose total maintenance expenditure exceeds
-- 2,000, along with incident count and average cost per servicing.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 3: CORRELATED SUBQUERY WITH NOT EXISTS
-- Find members who have registered in the gym but have NEVER logged
-- any equipment usage session (identifying dormant/inactive members).
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 4: CONDITIONAL AGGREGATION & CASE EXPRESSION
-- Revenue and member status summary by Membership Tier, showing total
-- paid collections, pending receivables, and total enrolled members.
-- --------------------------------------------------------------------
SELECT 
    m.MEMBERSHIP_TYPE,
    COUNT(DISTINCT m.MEMBER_ID) AS TOTAL_MEMBERS,
    SUM(CASE WHEN p.STATUS = 'Paid' THEN p.AMOUNT ELSE 0 END) AS REVENUE_COLLECTED,
    SUM(CASE WHEN p.STATUS = 'Pending' THEN p.AMOUNT ELSE 0 END) AS PENDING_RECEIVABLES
FROM MEMBER m
LEFT JOIN PAYMENT p ON m.MEMBER_ID = p.MEMBER_ID
GROUP BY m.MEMBERSHIP_TYPE
ORDER BY REVENUE_COLLECTED DESC;

-- --------------------------------------------------------------------
-- QUERY 5: SUBQUERY WITH COMPARISON TO AN AGGREGATE (ABOVE AVERAGE)
-- Retrieve equipment that has cost more in single maintenance than the
-- overall average maintenance cost across the entire gym facility.
-- --------------------------------------------------------------------
SELECT 
    e.EQUIPMENT_ID,
    e.EQUIPMENT_NAME,
    e.CATEGORY,
    e.BRAND,
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

-- --------------------------------------------------------------------
-- QUERY 6: TRAINER WORKLOAD & CLIENT REACH ANALYSIS
-- Measure trainer engagement by calculating distinct members trained,
-- total workout sessions supervised, and trainer experience.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 7: FINANCIAL DEFAULTERS / PENDING DUES REPORT
-- Identify members with pending payments, their contact details,
-- amount due, and due payment dates for gym front-desk recovery.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 8: ASSET HEALTH & MAINTENANCE OVERHEAD
-- List all equipment items with current status, condition, and total
-- cumulative repair expenditure incurred since purchase.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 9: SET OPERATION (UNION) - UNIFIED GYM CONTACT DIRECTORY
-- Combines contacts of both Gym Members and Certified Trainers into a
-- single searchable roster with their designated organizational role.
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- QUERY 10: ANALYTICAL WINDOW FUNCTION / DENSE_RANK()
-- Rank equipment items within each category based on total usage
-- frequency to highlight highest and lowest utilized gym assets.
-- --------------------------------------------------------------------
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
