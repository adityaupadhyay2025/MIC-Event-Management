// ====================================================================
// FITCORE PRO - GYM MANAGEMENT SYSTEM (DA-2 CLIENT ENGINE)
// Architecture: REST API with intelligent in-browser LocalStorage fallback
// Features: Full CRUD (6 Tables), 10 DA2 Queries, PL/SQL Simulator, Charts
// ====================================================================

const API_BASE = '/api';
let isBackendConnected = false;
let activePage = 'dashboard';
let chartsInstances = {};

// Fallback seed data matching DA1 sheets exactly
const INITIAL_DATABASE = {
  members: [
    { MEMBER_ID: 'M001', MEMBER_NAME: 'Priya Sharma', AGE: 18, GENDER: 'Female', PHONE: '9876543210', MEMBERSHIP_TYPE: 'Premium', JOIN_DATE: '2024-01-10' },
    { MEMBER_ID: 'M002', RAHUL: true, MEMBER_NAME: 'Rahul Kumar', AGE: 22, GENDER: 'Male', PHONE: '9876543211', MEMBERSHIP_TYPE: 'Basic', JOIN_DATE: '2024-02-15' },
    { MEMBER_ID: 'M003', MEMBER_NAME: 'Sneha Patel', AGE: 21, GENDER: 'Female', PHONE: '9876543212', MEMBERSHIP_TYPE: 'Premium', JOIN_DATE: '2024-03-01' },
    { MEMBER_ID: 'M004', MEMBER_NAME: 'Arjun Singh', AGE: 19, GENDER: 'Male', PHONE: '9876543213', MEMBERSHIP_TYPE: 'Standard', JOIN_DATE: '2024-03-20' },
    { MEMBER_ID: 'M005', MEMBER_NAME: 'Rakesh Verma', AGE: 23, GENDER: 'Male', PHONE: '9901567814', MEMBERSHIP_TYPE: 'Premium', JOIN_DATE: '2024-04-05' },
    { MEMBER_ID: 'M006', MEMBER_NAME: 'Ananya Rao', AGE: 20, GENDER: 'Female', PHONE: '9876543215', MEMBERSHIP_TYPE: 'Standard', JOIN_DATE: '2024-04-18' },
    { MEMBER_ID: 'M007', MEMBER_NAME: 'Vikram Joshi', AGE: 25, GENDER: 'Male', PHONE: '9876543216', MEMBERSHIP_TYPE: 'Premium', JOIN_DATE: '2024-05-12' },
    { MEMBER_ID: 'M008', MEMBER_NAME: 'Meera Nair', AGE: 24, GENDER: 'Female', PHONE: '9876543217', MEMBERSHIP_TYPE: 'Basic', JOIN_DATE: '2024-06-01' }
  ],
  trainers: [
    { TRAINER_ID: 'T001', TRAINER_NAME: 'Karan Mehta', PHONE: '9998270111', SPECIALIZATION: 'Strength', EXPERIENCE: '6 years' },
    { TRAINER_ID: 'T002', TRAINER_NAME: 'Rakesh Nair', PHONE: '9998370112', SPECIALIZATION: 'Cardio', EXPERIENCE: '4 years' },
    { TRAINER_ID: 'T003', TRAINER_NAME: 'Allen Walker', PHONE: '9998470114', SPECIALIZATION: 'Weight Loss', EXPERIENCE: '5 years' },
    { TRAINER_ID: 'T004', TRAINER_NAME: 'Neha Kapoor', PHONE: '9998570115', SPECIALIZATION: 'Yoga & Core', EXPERIENCE: '3 years' }
  ],
  equipment: [
    { EQUIPMENT_ID: 'E101', EQUIPMENT_NAME: 'Treadmill Commercial X9', CATEGORY: 'Cardio', BRAND: 'Alpha', PURCHASE_DATE: '2024-01-15', CONDITION: 'Good', STATUS: 'Available' },
    { EQUIPMENT_ID: 'E102', EQUIPMENT_NAME: 'Olympic Bench Press', CATEGORY: 'Strength', BRAND: 'Rogue', PURCHASE_DATE: '2023-10-11', CONDITION: 'Good', STATUS: 'Available' },
    { EQUIPMENT_ID: 'E103', EQUIPMENT_NAME: 'Hex Dumbbell Set (2.5-30kg)', CATEGORY: 'Free Weight', BRAND: 'Precor', PURCHASE_DATE: '2024-03-20', CONDITION: 'Fair', STATUS: 'Available' },
    { EQUIPMENT_ID: 'E104', EQUIPMENT_NAME: 'Upright Exercise Bike', CATEGORY: 'Cardio', BRAND: 'Matrix', PURCHASE_DATE: '2022-09-18', CONDITION: 'Fair', STATUS: 'Maintenance' },
    { EQUIPMENT_ID: 'E105', EQUIPMENT_NAME: 'Lat Pulldown & Low Row', CATEGORY: 'Strength', BRAND: 'Alpha', PURCHASE_DATE: '2023-07-05', CONDITION: 'Good', STATUS: 'Available' },
    { EQUIPMENT_ID: 'E106', EQUIPMENT_NAME: 'Concept2 Rower Ergometer', CATEGORY: 'Cardio', BRAND: 'Concept2', PURCHASE_DATE: '2024-04-10', CONDITION: 'Good', STATUS: 'Available' }
  ],
  usage: [
    { USAGE_ID: 'U001', MEMBER_ID: 'M001', EQUIPMENT_ID: 'E101', TRAINER_ID: 'T002', USAGE_DATE: '2024-07-20', DURATION: '30 mins' },
    { USAGE_ID: 'U002', MEMBER_ID: 'M002', EQUIPMENT_ID: 'E103', TRAINER_ID: 'T001', USAGE_DATE: '2024-07-20', DURATION: '60 mins' },
    { USAGE_ID: 'U003', MEMBER_ID: 'M003', EQUIPMENT_ID: 'E102', TRAINER_ID: 'T001', USAGE_DATE: '2024-07-21', DURATION: '30 mins' },
    { USAGE_ID: 'U004', MEMBER_ID: 'M004', EQUIPMENT_ID: 'E105', TRAINER_ID: 'T003', USAGE_DATE: '2024-06-22', DURATION: '45 mins' },
    { USAGE_ID: 'U005', MEMBER_ID: 'M005', EQUIPMENT_ID: 'E101', TRAINER_ID: 'T002', USAGE_DATE: '2024-05-23', DURATION: '60 mins' },
    { USAGE_ID: 'U006', MEMBER_ID: 'M001', EQUIPMENT_ID: 'E106', TRAINER_ID: 'T002', USAGE_DATE: '2024-08-10', DURATION: '40 mins' },
    { USAGE_ID: 'U007', MEMBER_ID: 'M007', EQUIPMENT_ID: 'E102', TRAINER_ID: 'T001', USAGE_DATE: '2024-08-12', DURATION: '50 mins' }
  ],
  maintenance: [
    { MAINTENANCE_ID: 'MT001', EQUIPMENT_ID: 'E104', MAINTENANCE_DATE: '2024-10-07', TECHNICIAN_NAME: 'Rajesh Sharma', COST: 2500, REMARKS: 'Drive belt replacement and recalibration' },
    { MAINTENANCE_ID: 'MT002', EQUIPMENT_ID: 'E102', MAINTENANCE_DATE: '2024-05-25', TECHNICIAN_NAME: 'Suresh Patel', COST: 1200, REMARKS: 'Collar lubrication and bench upholstery fix' },
    { MAINTENANCE_ID: 'MT003', EQUIPMENT_ID: 'E101', MAINTENANCE_DATE: '2024-05-18', TECHNICIAN_NAME: 'Amit Verma', COST: 1800, REMARKS: 'Motor check, belt alignment & sensor cleaning' },
    { MAINTENANCE_ID: 'MT004', EQUIPMENT_ID: 'E105', MAINTENANCE_DATE: '2024-08-15', TECHNICIAN_NAME: 'Rajesh Sharma', COST: 950, REMARKS: 'High-tensile cable inspection and pulley grease' }
  ],
  payments: [
    { PAYMENT_ID: 'P001', MEMBER_ID: 'M001', AMOUNT: 12000, PAYMENT_DATE: '2024-05-01', PAYMENT_MODE: 'UPI', STATUS: 'Paid' },
    { PAYMENT_ID: 'P002', MEMBER_ID: 'M002', AMOUNT: 8000, PAYMENT_DATE: '2024-06-03', PAYMENT_MODE: 'Card', STATUS: 'Paid' },
    { PAYMENT_ID: 'P003', MEMBER_ID: 'M003', AMOUNT: 12000, PAYMENT_DATE: '2024-07-04', PAYMENT_MODE: 'Cash', STATUS: 'Pending' },
    { PAYMENT_ID: 'P004', MEMBER_ID: 'M004', AMOUNT: 9500, PAYMENT_DATE: '2024-07-10', PAYMENT_MODE: 'UPI', STATUS: 'Paid' },
    { PAYMENT_ID: 'P005', MEMBER_ID: 'M005', AMOUNT: 12000, PAYMENT_DATE: '2024-08-01', PAYMENT_MODE: 'Card', STATUS: 'Paid' },
    { PAYMENT_ID: 'P006', MEMBER_ID: 'M006', AMOUNT: 9500, PAYMENT_DATE: '2024-08-15', PAYMENT_MODE: 'UPI', STATUS: 'Paid' },
    { PAYMENT_ID: 'P007', MEMBER_ID: 'M007', AMOUNT: 12000, PAYMENT_DATE: '2024-08-20', PAYMENT_MODE: 'Net Banking', STATUS: 'Paid' },
    { PAYMENT_ID: 'P008', MEMBER_ID: 'M008', AMOUNT: 8000, PAYMENT_DATE: '2024-09-01', PAYMENT_MODE: 'Cash', STATUS: 'Pending' }
  ]
};

// LocalStorage database management
function getLocalDB() {
  const stored = localStorage.getItem('fitcore_db');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error('Corrupt localStorage, resetting:', e); }
  }
  localStorage.setItem('fitcore_db', JSON.stringify(INITIAL_DATABASE));
  return JSON.parse(JSON.stringify(INITIAL_DATABASE));
}

function saveLocalDB(data) {
  localStorage.setItem('fitcore_db', JSON.stringify(data));
}

// 10 Academic SQL Queries Specifications
const QUERIES_META = [
  {
    id: 1,
    title: 'Multi-Table JOIN (4 Tables)',
    concept: 'INNER JOIN across EQUIPMENT_USAGE, MEMBER, EQUIPMENT, and TRAINER',
    sql: `SELECT u.USAGE_ID, m.MEMBER_NAME, m.MEMBERSHIP_TYPE, e.EQUIPMENT_NAME,
       e.CATEGORY AS EQUIPMENT_CATEGORY, t.TRAINER_NAME, t.SPECIALIZATION AS TRAINER_SPECIALTY,
       u.USAGE_DATE, u.DURATION
FROM EQUIPMENT_USAGE u
JOIN MEMBER m ON u.MEMBER_ID = m.MEMBER_ID
JOIN EQUIPMENT e ON u.EQUIPMENT_ID = e.EQUIPMENT_ID
JOIN TRAINER t ON u.TRAINER_ID = t.TRAINER_ID
ORDER BY u.USAGE_DATE DESC;`,
    desc: 'Audits workout sessions by displaying which member trained with which equipment under which supervising trainer.'
  },
  {
    id: 2,
    title: 'Aggregate with GROUP BY & HAVING (> ₹2,000)',
    concept: 'SUM, COUNT, AVG, GROUP BY, and HAVING clause filtering',
    sql: `SELECT e.CATEGORY, COUNT(m.MAINTENANCE_ID) AS TOTAL_SERVICINGS,
       SUM(m.COST) AS TOTAL_MAINTENANCE_COST,
       ROUND(AVG(m.COST), 2) AS AVERAGE_COST_PER_SERVICE
FROM EQUIPMENT e
JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
GROUP BY e.CATEGORY
HAVING SUM(m.COST) > 2000.00
ORDER BY TOTAL_MAINTENANCE_COST DESC;`,
    desc: 'Identifies equipment categories that have accrued high maintenance overhead exceeding ₹2,000.'
  },
  {
    id: 3,
    title: 'Correlated Subquery with NOT EXISTS',
    concept: 'Subquery with NOT EXISTS (Identifying Inactive Members)',
    sql: `SELECT m.MEMBER_ID, m.MEMBER_NAME, m.PHONE, m.MEMBERSHIP_TYPE, m.AGE
FROM MEMBER m
WHERE NOT EXISTS (
    SELECT 1 FROM EQUIPMENT_USAGE u WHERE u.MEMBER_ID = m.MEMBER_ID
)
ORDER BY m.MEMBER_ID;`,
    desc: 'Finds registered members who have never logged any workout session, useful for gym retention outreach.'
  },
  {
    id: 4,
    title: 'Conditional Aggregation & CASE Statement',
    concept: 'LEFT JOIN, CASE WHEN expression, and GROUP BY rollup',
    sql: `SELECT m.MEMBERSHIP_TYPE, COUNT(DISTINCT m.MEMBER_ID) AS TOTAL_MEMBERS,
       SUM(CASE WHEN p.STATUS = 'Paid' THEN p.AMOUNT ELSE 0 END) AS REVENUE_COLLECTED,
       SUM(CASE WHEN p.STATUS = 'Pending' THEN p.AMOUNT ELSE 0 END) AS PENDING_RECEIVABLES
FROM MEMBER m
LEFT JOIN PAYMENT p ON m.MEMBER_ID = p.MEMBER_ID
GROUP BY m.MEMBERSHIP_TYPE
ORDER BY REVENUE_COLLECTED DESC;`,
    desc: 'Summarizes cash collected versus pending receivables broken down by membership tiers.'
  },
  {
    id: 5,
    title: 'Subquery with Comparison to Global Average',
    concept: 'WHERE COST > (SELECT AVG(COST) FROM MAINTENANCE)',
    sql: `SELECT e.EQUIPMENT_ID, e.EQUIPMENT_NAME, e.CATEGORY, e.BRAND,
       m.TECHNICIAN_NAME, m.COST AS INCIDENT_COST, m.REMARKS
FROM EQUIPMENT e
JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
WHERE m.COST > (SELECT AVG(COST) FROM MAINTENANCE)
ORDER BY m.COST DESC;`,
    desc: 'Detects major breakdown repairs whose individual cost exceeded the gym facility average.'
  },
  {
    id: 6,
    title: 'Trainer Workload & Reach Analysis',
    concept: 'COUNT(DISTINCT) client engagement & sorting',
    sql: `SELECT t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION, t.EXPERIENCE,
       COUNT(u.USAGE_ID) AS SESSIONS_SUPERVISED,
       COUNT(DISTINCT u.MEMBER_ID) AS UNIQUE_CLIENTS_COACHED
FROM TRAINER t
LEFT JOIN EQUIPMENT_USAGE u ON t.TRAINER_ID = u.TRAINER_ID
GROUP BY t.TRAINER_ID, t.TRAINER_NAME, t.SPECIALIZATION, t.EXPERIENCE
ORDER BY SESSIONS_SUPERVISED DESC;`,
    desc: 'Evaluates trainer productivity and client reach based on usage log sessions.'
  },
  {
    id: 7,
    title: 'Financial Defaulters & Outstanding Balances',
    concept: 'Filtering by payment status and due dates',
    sql: `SELECT p.PAYMENT_ID, m.MEMBER_ID, m.MEMBER_NAME, m.PHONE,
       m.MEMBERSHIP_TYPE, p.AMOUNT AS DUE_AMOUNT,
       p.PAYMENT_DATE AS DUE_DATE, p.PAYMENT_MODE
FROM PAYMENT p
JOIN MEMBER m ON p.MEMBER_ID = m.MEMBER_ID
WHERE p.STATUS = 'Pending'
ORDER BY p.PAYMENT_DATE ASC;`,
    desc: 'Provides front-desk reception with a contact sheet for pending membership dues.'
  },
  {
    id: 8,
    title: 'Asset Health & Cumulative Repair Expense',
    concept: 'COALESCE, LEFT JOIN, and asset lifecycle tracking',
    sql: `SELECT e.EQUIPMENT_ID, e.EQUIPMENT_NAME, e.CATEGORY,
       e.STATUS AS CURRENT_STATUS, e.CONDITION,
       COALESCE(SUM(m.COST), 0) AS CUMULATIVE_REPAIR_COST
FROM EQUIPMENT e
LEFT JOIN MAINTENANCE m ON e.EQUIPMENT_ID = m.EQUIPMENT_ID
GROUP BY e.EQUIPMENT_ID, e.EQUIPMENT_NAME, e.CATEGORY, e.STATUS, e.CONDITION
ORDER BY CUMULATIVE_REPAIR_COST DESC;`,
    desc: 'Tracks total lifecycle repair investment for each physical machine in the facility.'
  },
  {
    id: 9,
    title: 'UNION Set Operation (Unified Directory)',
    concept: 'UNION ALL across heterogeneous entities (Members & Trainers)',
    sql: `SELECT MEMBER_ID AS ENTITY_ID, MEMBER_NAME AS CONTACT_NAME, PHONE, 'Member' AS ROLE, MEMBERSHIP_TYPE AS DETAILS
FROM MEMBER
UNION ALL
SELECT TRAINER_ID AS ENTITY_ID, TRAINER_NAME AS CONTACT_NAME, PHONE, 'Trainer' AS ROLE, SPECIALIZATION AS DETAILS
FROM TRAINER
ORDER BY ROLE DESC, CONTACT_NAME ASC;`,
    desc: 'Combines members and staff into a single master contact directory.'
  },
  {
    id: 10,
    title: 'Analytical Window Function (DENSE_RANK)',
    concept: 'DENSE_RANK() OVER (PARTITION BY CATEGORY ORDER BY COUNT)',
    sql: `SELECT e.CATEGORY, e.EQUIPMENT_NAME, e.BRAND,
       COUNT(u.USAGE_ID) AS USAGE_COUNT,
       DENSE_RANK() OVER (PARTITION BY e.CATEGORY ORDER BY COUNT(u.USAGE_ID) DESC) AS POPULARITY_RANK
FROM EQUIPMENT e
LEFT JOIN EQUIPMENT_USAGE u ON e.EQUIPMENT_ID = u.EQUIPMENT_ID
GROUP BY e.CATEGORY, e.EQUIPMENT_NAME, e.BRAND
ORDER BY e.CATEGORY, POPULARITY_RANK;`,
    desc: 'Ranks machines by usage frequency within each equipment category.'
  }
];

// Unified Data Access Layer (handles both HTTP REST and LocalStorage seamlessly)
const DB = {
  async checkBackend() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        isBackendConnected = true;
        updateConnectionStatus(true);
        return true;
      }
    } catch (e) {
      // Backend not running; fallback to LocalStorage
    }
    isBackendConnected = false;
    updateConnectionStatus(false);
    return false;
  },

  async getTable(table) {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${table}`);
        if (res.ok) return await res.json();
      } catch (e) { console.warn('Backend fetch failed, falling back to local:', e); }
    }
    const local = getLocalDB();
    return local[table] || [];
  },

  async insert(table, record) {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Insert failed');
        return data;
      } catch (e) {
        if (!e.message.includes('failed')) throw e;
      }
    }
    // Local fallback
    const local = getLocalDB();
    const idKeys = {
      members: 'MEMBER_ID', trainers: 'TRAINER_ID', equipment: 'EQUIPMENT_ID',
      usage: 'USAGE_ID', maintenance: 'MAINTENANCE_ID', payments: 'PAYMENT_ID'
    };
    const idKey = idKeys[table];
    if (local[table].some(x => x[idKey] === record[idKey])) {
      throw new Error(`Duplicate Key: ${idKey} '${record[idKey]}' already exists.`);
    }

    // Trigger behavior: If inserting maintenance, set equipment status to Maintenance
    if (table === 'maintenance' && record.EQUIPMENT_ID) {
      const eq = local.equipment.find(e => e.EQUIPMENT_ID === record.EQUIPMENT_ID);
      if (eq) eq.STATUS = 'Maintenance';
    }

    local[table].unshift(record);
    saveLocalDB(local);
    return { message: 'Record inserted successfully (Local DB)' };
  },

  async update(table, id, record) {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${table}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        return data;
      } catch (e) {
        if (!e.message.includes('failed')) throw e;
      }
    }
    // Local fallback
    const local = getLocalDB();
    const idKeys = {
      members: 'MEMBER_ID', trainers: 'TRAINER_ID', equipment: 'EQUIPMENT_ID',
      usage: 'USAGE_ID', maintenance: 'MAINTENANCE_ID', payments: 'PAYMENT_ID'
    };
    const idKey = idKeys[table];
    const idx = local[table].findIndex(x => String(x[idKey]) === String(id));
    if (idx === -1) throw new Error('Record not found');
    local[table][idx] = { ...local[table][idx], ...record };
    saveLocalDB(local);
    return { message: 'Record updated successfully (Local DB)' };
  },

  async delete(table, id) {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/${table}/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Delete failed');
        return data;
      } catch (e) {
        if (!e.message.includes('failed')) throw e;
      }
    }
    // Local fallback
    const local = getLocalDB();
    const idKeys = {
      members: 'MEMBER_ID', trainers: 'TRAINER_ID', equipment: 'EQUIPMENT_ID',
      usage: 'USAGE_ID', maintenance: 'MAINTENANCE_ID', payments: 'PAYMENT_ID'
    };
    const idKey = idKeys[table];
    local[table] = local[table].filter(x => String(x[idKey]) !== String(id));
    saveLocalDB(local);
    return { message: 'Record deleted successfully (Local DB)' };
  },

  async getDashboardStats() {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/dashboard`);
        if (res.ok) return await res.json();
      } catch (e) { /* fallback */ }
    }
    const local = getLocalDB();
    const totalMembers = local.members.length;
    const totalTrainers = local.trainers.length;
    const totalEquipment = local.equipment.length;
    const totalRevenue = local.payments
      .filter(p => p.STATUS === 'Paid')
      .reduce((s, p) => s + Number(p.AMOUNT || 0), 0);
    const pendingRevenue = local.payments
      .filter(p => p.STATUS === 'Pending')
      .reduce((s, p) => s + Number(p.AMOUNT || 0), 0);
    const maintenanceCount = local.equipment
      .filter(e => String(e.STATUS).toLowerCase() === 'maintenance').length;
    const availableCount = local.equipment
      .filter(e => String(e.STATUS).toLowerCase() === 'available').length;

    return {
      MEMBERS: totalMembers,
      TRAINERS: totalTrainers,
      EQUIPMENT: totalEquipment,
      PAID_AMOUNT: totalRevenue,
      PENDING_AMOUNT: pendingRevenue,
      MAINTENANCE: maintenanceCount,
      AVAILABLE: availableCount
    };
  },

  async runQuery(queryId) {
    const start = performance.now();
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/reports/${queryId}`);
        if (res.ok) return await res.json();
      } catch (e) { /* fallback */ }
    }
    // Local client-side query execution
    const local = getLocalDB();
    let data = [];
    switch (Number(queryId)) {
      case 1:
        data = local.usage.map(u => {
          const m = local.members.find(x => x.MEMBER_ID === u.MEMBER_ID) || {};
          const e = local.equipment.find(x => x.EQUIPMENT_ID === u.EQUIPMENT_ID) || {};
          const t = local.trainers.find(x => x.TRAINER_ID === u.TRAINER_ID) || {};
          return {
            USAGE_ID: u.USAGE_ID,
            MEMBER_NAME: m.MEMBER_NAME || u.MEMBER_ID,
            MEMBERSHIP_TYPE: m.MEMBERSHIP_TYPE || 'Standard',
            EQUIPMENT_NAME: e.EQUIPMENT_NAME || u.EQUIPMENT_ID,
            EQUIPMENT_CATEGORY: e.CATEGORY || 'General',
            TRAINER_NAME: t.TRAINER_NAME || u.TRAINER_ID,
            TRAINER_SPECIALTY: t.SPECIALIZATION || 'General',
            USAGE_DATE: u.USAGE_DATE,
            DURATION: u.DURATION
          };
        });
        break;
      case 2:
        const catMap = {};
        local.maintenance.forEach(m => {
          const eq = local.equipment.find(e => e.EQUIPMENT_ID === m.EQUIPMENT_ID);
          const cat = eq ? eq.CATEGORY : 'Unknown';
          if (!catMap[cat]) catMap[cat] = { count: 0, cost: 0 };
          catMap[cat].count += 1;
          catMap[cat].cost += Number(m.COST || 0);
        });
        data = Object.entries(catMap)
          .filter(([_, v]) => v.cost > 2000)
          .map(([cat, v]) => ({
            CATEGORY: cat,
            TOTAL_SERVICINGS: v.count,
            TOTAL_MAINTENANCE_COST: '₹' + v.cost.toLocaleString('en-IN'),
            AVERAGE_COST_PER_SERVICE: '₹' + (v.cost / v.count).toFixed(2)
          }));
        break;
      case 3:
        const usedIds = new Set(local.usage.map(u => u.MEMBER_ID));
        data = local.members.filter(m => !usedIds.has(m.MEMBER_ID)).map(m => ({
          MEMBER_ID: m.MEMBER_ID,
          MEMBER_NAME: m.MEMBER_NAME,
          PHONE: m.PHONE,
          MEMBERSHIP_TYPE: m.MEMBERSHIP_TYPE,
          AGE: m.AGE
        }));
        break;
      case 4:
        const tiers = {};
        local.members.forEach(m => {
          if (!tiers[m.MEMBERSHIP_TYPE]) tiers[m.MEMBERSHIP_TYPE] = { members: 0, paid: 0, pending: 0 };
          tiers[m.MEMBERSHIP_TYPE].members += 1;
        });
        local.payments.forEach(p => {
          const mem = local.members.find(m => m.MEMBER_ID === p.MEMBER_ID);
          if (mem && tiers[mem.MEMBERSHIP_TYPE]) {
            if (p.STATUS === 'Paid') tiers[mem.MEMBERSHIP_TYPE].paid += Number(p.AMOUNT);
            else if (p.STATUS === 'Pending') tiers[mem.MEMBERSHIP_TYPE].pending += Number(p.AMOUNT);
          }
        });
        data = Object.entries(tiers).map(([tier, v]) => ({
          MEMBERSHIP_TYPE: tier,
          TOTAL_MEMBERS: v.members,
          REVENUE_COLLECTED: '₹' + v.paid.toLocaleString('en-IN'),
          PENDING_RECEIVABLES: '₹' + v.pending.toLocaleString('en-IN')
        }));
        break;
      case 5:
        const avg = local.maintenance.reduce((s, m) => s + Number(m.COST), 0) / (local.maintenance.length || 1);
        data = local.maintenance.filter(m => Number(m.COST) > avg).map(m => {
          const eq = local.equipment.find(e => e.EQUIPMENT_ID === m.EQUIPMENT_ID) || {};
          return {
            EQUIPMENT_ID: m.EQUIPMENT_ID,
            EQUIPMENT_NAME: eq.EQUIPMENT_NAME || 'Unknown',
            CATEGORY: eq.CATEGORY || 'General',
            TECHNICIAN_NAME: m.TECHNICIAN_NAME,
            INCIDENT_COST: '₹' + Number(m.COST).toLocaleString('en-IN'),
            REMARKS: m.REMARKS
          };
        });
        break;
      case 6:
        data = local.trainers.map(t => {
          const sessions = local.usage.filter(u => u.TRAINER_ID === t.TRAINER_ID);
          const clients = new Set(sessions.map(u => u.MEMBER_ID)).size;
          return {
            TRAINER_ID: t.TRAINER_ID,
            TRAINER_NAME: t.TRAINER_NAME,
            SPECIALIZATION: t.SPECIALIZATION,
            EXPERIENCE: t.EXPERIENCE,
            SESSIONS_SUPERVISED: sessions.length,
            UNIQUE_CLIENTS_COACHED: clients
          };
        }).sort((a, b) => b.SESSIONS_SUPERVISED - a.SESSIONS_SUPERVISED);
        break;
      case 7:
        data = local.payments.filter(p => p.STATUS === 'Pending').map(p => {
          const m = local.members.find(x => x.MEMBER_ID === p.MEMBER_ID) || {};
          return {
            PAYMENT_ID: p.PAYMENT_ID,
            MEMBER_ID: p.MEMBER_ID,
            MEMBER_NAME: m.MEMBER_NAME || 'Unknown',
            PHONE: m.PHONE || 'N/A',
            MEMBERSHIP_TYPE: m.MEMBERSHIP_TYPE || 'Standard',
            DUE_AMOUNT: '₹' + Number(p.AMOUNT).toLocaleString('en-IN'),
            DUE_DATE: p.PAYMENT_DATE,
            PAYMENT_MODE: p.PAYMENT_MODE
          };
        });
        break;
      case 8:
        data = local.equipment.map(e => {
          const rep = local.maintenance
            .filter(m => m.EQUIPMENT_ID === e.EQUIPMENT_ID)
            .reduce((s, m) => s + Number(m.COST || 0), 0);
          return {
            EQUIPMENT_ID: e.EQUIPMENT_ID,
            EQUIPMENT_NAME: e.EQUIPMENT_NAME,
            CATEGORY: e.CATEGORY,
            CURRENT_STATUS: e.STATUS,
            CONDITION: e.CONDITION,
            CUMULATIVE_REPAIR_COST: '₹' + rep.toLocaleString('en-IN')
          };
        });
        break;
      case 9:
        data = [
          ...local.trainers.map(t => ({ ENTITY_ID: t.TRAINER_ID, CONTACT_NAME: t.TRAINER_NAME, PHONE: t.PHONE, ROLE: 'Trainer', DETAILS: t.SPECIALIZATION })),
          ...local.members.map(m => ({ ENTITY_ID: m.MEMBER_ID, CONTACT_NAME: m.MEMBER_NAME, PHONE: m.PHONE, ROLE: 'Member', DETAILS: m.MEMBERSHIP_TYPE }))
        ].sort((a, b) => a.ROLE.localeCompare(b.ROLE) || a.CONTACT_NAME.localeCompare(b.CONTACT_NAME));
        break;
      case 10:
        const usageCounts = {};
        local.usage.forEach(u => { usageCounts[u.EQUIPMENT_ID] = (usageCounts[u.EQUIPMENT_ID] || 0) + 1; });
        data = local.equipment.map(e => ({
          CATEGORY: e.CATEGORY,
          EQUIPMENT_NAME: e.EQUIPMENT_NAME,
          BRAND: e.BRAND,
          USAGE_COUNT: usageCounts[e.EQUIPMENT_ID] || 0
        })).sort((a, b) => b.USAGE_COUNT - a.USAGE_COUNT);
        break;
    }
    const end = performance.now();
    return {
      queryId,
      executionTime: (end - start).toFixed(2) + ' ms',
      rowCount: data.length,
      data
    };
  }
};

// Update Topbar Connection Pill
function updateConnectionStatus(connected) {
  const pill = document.getElementById('connectionPill');
  if (!pill) return;
  if (connected) {
    pill.className = 'status-pill';
    pill.innerHTML = `<span class="status-dot"></span><span>Node/Oracle Connected</span>`;
  } else {
    pill.className = 'status-pill offline';
    pill.innerHTML = `<span class="status-dot"></span><span>Local DB Active (Offline Mode)</span>`;
  }
}

// Navigation Handler
function navigateTo(pageId) {
  activePage = pageId;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Update Topbar Titles
  const titles = {
    dashboard: ['Dashboard', 'Executive overview of gym operations & assets'],
    members: ['Gym Members', 'Manage registered athletes, demographics & membership tiers'],
    trainers: ['Fitness Trainers', 'Manage certified personal trainers & specializations'],
    equipment: ['Equipment Inventory', 'Track machinery, working condition & operational status'],
    usage: ['Equipment Usage Logs', 'Track daily workout sessions and supervising coaches'],
    maintenance: ['Equipment Maintenance', 'Manage servicing records, repair costs & technicians'],
    payments: ['Billing & Payments', 'Track membership subscriptions, transaction modes & revenue'],
    sql: ['DA-2 SQL Studio', 'Interactive execution of all 10 academic requirement queries'],
    plsql: ['PL/SQL Demonstrator', 'Procedures, Functions, Triggers, and Cursors with live test runner'],
    report: ['DA-2 Lab Report', 'Full Entity-Relationship analysis, Normalization proof & viva review summary']
  };

  const [title, sub] = titles[pageId] || ['FitCore Pro', 'Gym Management System'];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-subtitle').textContent = sub;

  // Refresh page data
  if (pageId === 'dashboard') loadDashboard();
  else if (['members', 'trainers', 'equipment', 'usage', 'maintenance', 'payments'].includes(pageId)) loadTable(pageId);
  else if (pageId === 'sql') loadSQLStudio();
  else if (pageId === 'plsql') initPLSQLView();
  else if (pageId === 'report') renderReportView();
}

// ====================================================================
// 1. DASHBOARD CONTROLLER
// ====================================================================
async function loadDashboard() {
  try {
    const stats = await DB.getDashboardStats();
    document.getElementById('kpi-members').textContent = stats.MEMBERS;
    document.getElementById('kpi-trainers').textContent = stats.TRAINERS;
    document.getElementById('kpi-equipment').textContent = stats.EQUIPMENT;
    document.getElementById('kpi-revenue').textContent = '₹' + Number(stats.PAID_AMOUNT || 0).toLocaleString('en-IN');
    document.getElementById('kpi-pending').textContent = '₹' + Number(stats.PENDING_AMOUNT || 0).toLocaleString('en-IN') + ' pending';

    // Update equipment breakdown bars
    const totalEq = stats.EQUIPMENT || 1;
    const avail = stats.AVAILABLE || 0;
    const maint = stats.MAINTENANCE || 0;
    const unavail = Math.max(0, totalEq - avail - maint);

    document.getElementById('bar-available').style.width = `${(avail / totalEq) * 100}%`;
    document.getElementById('count-available').textContent = `${avail} (${Math.round((avail / totalEq) * 100)}%)`;

    document.getElementById('bar-maintenance').style.width = `${(maint / totalEq) * 100}%`;
    document.getElementById('count-maintenance').textContent = `${maint} (${Math.round((maint / totalEq) * 100)}%)`;

    document.getElementById('bar-unavailable').style.width = `${(unavail / totalEq) * 100}%`;
    document.getElementById('count-unavailable').textContent = `${unavail} (${Math.round((unavail / totalEq) * 100)}%)`;

    // Render Recent Members Widget
    const members = await DB.getTable('members');
    const recentMembers = members.slice(0, 5);
    const tbody = document.getElementById('dashboard-recent-members');
    tbody.innerHTML = recentMembers.map(m => `
      <tr>
        <td>
          <div class="table-identity">
            <div class="avatar-circle ${getAvatarColor(m.MEMBERSHIP_TYPE)}">${getInitials(m.MEMBER_NAME)}</div>
            <div>
              <div class="identity-name">${escapeHTML(m.MEMBER_NAME)}</div>
              <div class="identity-sub">${m.MEMBER_ID} · ${m.PHONE}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-${m.MEMBERSHIP_TYPE.toLowerCase()}"><span class="badge-dot"></span>${m.MEMBERSHIP_TYPE}</span></td>
        <td><span class="badge badge-available"><span class="badge-dot"></span>Active</span></td>
      </tr>
    `).join('');

    // Render Charts
    renderDashboardCharts(members, stats);
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function renderDashboardCharts(members, stats) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Membership Tier Distribution (Doughnut)
  const tierCounts = { Premium: 0, Standard: 0, Basic: 0 };
  members.forEach(m => {
    if (tierCounts[m.MEMBERSHIP_TYPE] !== undefined) tierCounts[m.MEMBERSHIP_TYPE]++;
  });

  const ctxTier = document.getElementById('chart-membership-tier');
  if (ctxTier) {
    if (chartsInstances.tier) chartsInstances.tier.destroy();
    chartsInstances.tier = new Chart(ctxTier, {
      type: 'doughnut',
      data: {
        labels: ['Premium', 'Standard', 'Basic'],
        datasets: [{
          data: [tierCounts.Premium, tierCounts.Standard, tierCounts.Basic],
          backgroundColor: ['#a855f7', '#3b82f6', '#94a3b8'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
        },
        cutout: '72%'
      }
    });
  }

  // Chart 2: Revenue Collections
  const ctxRev = document.getElementById('chart-revenue-overview');
  if (ctxRev) {
    if (chartsInstances.rev) chartsInstances.rev.destroy();
    chartsInstances.rev = new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Collections (₹)',
            data: [12000, 8000, 12000, 33500, 8000],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Maintenance (₹)',
            data: [3000, 0, 0, 950, 2500],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
        }
      }
    });
  }
}

// ====================================================================
// 2. GENERIC CRUD TABLES CONTROLLER
// ====================================================================
async function loadTable(tableKey) {
  const container = document.getElementById(`table-body-${tableKey}`);
  if (!container) return;
  container.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-dim);">Loading records...</td></tr>`;

  try {
    const records = await DB.getTable(tableKey);
    renderTableRows(tableKey, records);
    updateFilterCounts(tableKey, records.length);
  } catch (err) {
    showToast(`Failed to load ${tableKey}: ${err.message}`, 'error');
  }
}

function renderTableRows(tableKey, rows) {
  const container = document.getElementById(`table-body-${tableKey}`);
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-dim);">No records found. Click '+ Add' to create one!</td></tr>`;
    return;
  }

  container.innerHTML = rows.map(r => generateRowHTML(tableKey, r)).join('');
}

function generateRowHTML(tableKey, r) {
  switch (tableKey) {
    case 'members':
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.MEMBER_ID}</strong></td>
          <td>
            <div class="table-identity">
              <div class="avatar-circle ${getAvatarColor(r.MEMBERSHIP_TYPE)}">${getInitials(r.MEMBER_NAME)}</div>
              <div>
                <div class="identity-name">${escapeHTML(r.MEMBER_NAME)}</div>
                <div class="identity-sub">Joined: ${r.JOIN_DATE || '2024'}</div>
              </div>
            </div>
          </td>
          <td>${r.AGE} yrs</td>
          <td>${r.GENDER}</td>
          <td>${r.PHONE}</td>
          <td><span class="badge badge-${r.MEMBERSHIP_TYPE.toLowerCase()}"><span class="badge-dot"></span>${r.MEMBERSHIP_TYPE}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="table-btn edit" onclick="openEditModal('members', '${r.MEMBER_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('members', '${r.MEMBER_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    case 'trainers':
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.TRAINER_ID}</strong></td>
          <td>
            <div class="table-identity">
              <div class="avatar-circle avatar-blue">${getInitials(r.TRAINER_NAME)}</div>
              <div class="identity-name">${escapeHTML(r.TRAINER_NAME)}</div>
            </div>
          </td>
          <td>${r.PHONE}</td>
          <td><span class="badge badge-standard"><span class="badge-dot"></span>${r.SPECIALIZATION}</span></td>
          <td><strong>${r.EXPERIENCE}</strong></td>
          <td>
            <div class="action-btn-group">
              <button class="table-btn edit" onclick="openEditModal('trainers', '${r.TRAINER_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('trainers', '${r.TRAINER_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    case 'equipment':
      const st = (r.STATUS || 'Available').toLowerCase();
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.EQUIPMENT_ID}</strong></td>
          <td>
            <div>
              <div class="identity-name">${escapeHTML(r.EQUIPMENT_NAME)}</div>
              <div class="identity-sub">Brand: ${r.BRAND}</div>
            </div>
          </td>
          <td><span class="badge badge-basic">${r.CATEGORY}</span></td>
          <td>${r.PURCHASE_DATE}</td>
          <td><strong>${r.CONDITION}</strong></td>
          <td><span class="badge badge-${st}"><span class="badge-dot"></span>${r.STATUS}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="table-btn edit" onclick="toggleEquipmentStatus('${r.EQUIPMENT_ID}')">Toggle Status</button>
              <button class="table-btn edit" onclick="openEditModal('equipment', '${r.EQUIPMENT_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('equipment', '${r.EQUIPMENT_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    case 'usage':
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.USAGE_ID}</strong></td>
          <td><strong>${r.MEMBER_ID}</strong></td>
          <td>${r.EQUIPMENT_ID}</td>
          <td>${r.TRAINER_ID}</td>
          <td>${r.USAGE_DATE}</td>
          <td><span class="badge badge-standard">${r.DURATION}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="table-btn edit" onclick="openEditModal('usage', '${r.USAGE_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('usage', '${r.USAGE_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    case 'maintenance':
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.MAINTENANCE_ID}</strong></td>
          <td><strong>${r.EQUIPMENT_ID}</strong></td>
          <td>${r.MAINTENANCE_DATE}</td>
          <td>${escapeHTML(r.TECHNICIAN_NAME)}</td>
          <td><strong style="color:var(--accent-amber);">₹${Number(r.COST).toLocaleString('en-IN')}</strong></td>
          <td><small style="color:var(--text-muted);">${escapeHTML(r.REMARKS || 'N/A')}</small></td>
          <td>
            <div class="action-btn-group">
              <button class="table-btn edit" onclick="openEditModal('maintenance', '${r.MAINTENANCE_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('maintenance', '${r.MAINTENANCE_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    case 'payments':
      const ps = (r.STATUS || 'Paid').toLowerCase();
      return `
        <tr>
          <td><strong style="color:var(--accent-cyan);">${r.PAYMENT_ID}</strong></td>
          <td><strong>${r.MEMBER_ID}</strong></td>
          <td><strong style="color:var(--accent-neon); font-size:14px;">₹${Number(r.AMOUNT).toLocaleString('en-IN')}</strong></td>
          <td>${r.PAYMENT_DATE}</td>
          <td><span class="badge badge-basic">${r.PAYMENT_MODE}</span></td>
          <td><span class="badge badge-${ps}"><span class="badge-dot"></span>${r.STATUS}</span></td>
          <td>
            <div class="action-btn-group">
              ${r.STATUS === 'Pending' ? `<button class="table-btn edit" onclick="markPaymentPaid('${r.PAYMENT_ID}')">Mark Paid</button>` : ''}
              <button class="table-btn edit" onclick="openEditModal('payments', '${r.PAYMENT_ID}')">Edit</button>
              <button class="table-btn delete" onclick="confirmDelete('payments', '${r.PAYMENT_ID}')">Delete</button>
            </div>
          </td>
        </tr>`;

    default:
      return '';
  }
}

// Client-Side Search and Filtering
function filterTable(tableKey) {
  const searchVal = (document.getElementById(`search-${tableKey}`)?.value || '').toLowerCase();
  const selectVal = (document.getElementById(`filter-${tableKey}`)?.value || '').toLowerCase();

  const rows = document.querySelectorAll(`#table-body-${tableKey} tr`);
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchesSearch = !searchVal || text.includes(searchVal);
    const matchesSelect = !selectVal || selectVal === 'all' || text.includes(selectVal);
    row.style.display = matchesSearch && matchesSelect ? '' : 'none';
  });
}

function updateFilterCounts(tableKey, count) {
  const el = document.getElementById(`count-badge-${tableKey}`);
  if (el) el.textContent = `${count} total`;
  const navBadge = document.getElementById(`nav-badge-${tableKey}`);
  if (navBadge) navBadge.textContent = count;
}

// ====================================================================
// 3. MODAL & CRUD ACTIONS (INSERT, UPDATE, DELETE)
// ====================================================================
let currentModalTable = null;
let currentEditId = null;

const MODAL_CONFIGS = {
  members: {
    title: 'Member',
    idField: 'MEMBER_ID',
    fields: [
      { key: 'MEMBER_ID', label: 'Member ID', type: 'text', placeholder: 'M009', required: true },
      { key: 'MEMBER_NAME', label: 'Full Name', type: 'text', placeholder: 'Aarav Sharma', required: true },
      { key: 'AGE', label: 'Age (Min 14)', type: 'number', placeholder: '21', min: 14, required: true },
      { key: 'GENDER', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { key: 'PHONE', label: 'Phone Number', type: 'text', placeholder: '9876543218', required: true },
      { key: 'MEMBERSHIP_TYPE', label: 'Membership Tier', type: 'select', options: ['Basic', 'Standard', 'Premium'], required: true },
      { key: 'JOIN_DATE', label: 'Join Date', type: 'date', required: true }
    ]
  },
  trainers: {
    title: 'Trainer',
    idField: 'TRAINER_ID',
    fields: [
      { key: 'TRAINER_ID', label: 'Trainer ID', type: 'text', placeholder: 'T005', required: true },
      { key: 'TRAINER_NAME', label: 'Trainer Name', type: 'text', placeholder: 'Vikram Rajput', required: true },
      { key: 'PHONE', label: 'Contact Phone', type: 'text', placeholder: '9998887771', required: true },
      { key: 'SPECIALIZATION', label: 'Specialization', type: 'text', placeholder: 'CrossFit & HIIT', required: true },
      { key: 'EXPERIENCE', label: 'Experience (Years)', type: 'text', placeholder: '5 years', required: true }
    ]
  },
  equipment: {
    title: 'Equipment',
    idField: 'EQUIPMENT_ID',
    fields: [
      { key: 'EQUIPMENT_ID', label: 'Equipment ID', type: 'text', placeholder: 'E107', required: true },
      { key: 'EQUIPMENT_NAME', label: 'Equipment Name', type: 'text', placeholder: 'Incline Dumbbell Bench', required: true },
      { key: 'CATEGORY', label: 'Category', type: 'select', options: ['Cardio', 'Strength', 'Free Weight'], required: true },
      { key: 'BRAND', label: 'Manufacturer / Brand', type: 'text', placeholder: 'Hammer Strength', required: true },
      { key: 'PURCHASE_DATE', label: 'Purchase Date', type: 'date', required: true },
      { key: 'CONDITION', label: 'Condition', type: 'select', options: ['Good', 'Fair', 'Poor'], required: true },
      { key: 'STATUS', label: 'Operational Status', type: 'select', options: ['Available', 'Maintenance', 'Unavailable'], required: true }
    ]
  },
  usage: {
    title: 'Equipment Usage Log',
    idField: 'USAGE_ID',
    fields: [
      { key: 'USAGE_ID', label: 'Usage ID', type: 'text', placeholder: 'U008', required: true },
      { key: 'MEMBER_ID', label: 'Member ID', type: 'select', dynamic: 'members', required: true },
      { key: 'EQUIPMENT_ID', label: 'Equipment ID', type: 'select', dynamic: 'equipment', required: true },
      { key: 'TRAINER_ID', label: 'Supervising Trainer ID', type: 'select', dynamic: 'trainers', required: true },
      { key: 'USAGE_DATE', label: 'Workout Date', type: 'date', required: true },
      { key: 'DURATION', label: 'Duration', type: 'text', placeholder: '45 mins', required: true }
    ]
  },
  maintenance: {
    title: 'Maintenance Log',
    idField: 'MAINTENANCE_ID',
    fields: [
      { key: 'MAINTENANCE_ID', label: 'Maintenance ID', type: 'text', placeholder: 'MT005', required: true },
      { key: 'EQUIPMENT_ID', label: 'Equipment ID', type: 'select', dynamic: 'equipment', required: true },
      { key: 'MAINTENANCE_DATE', label: 'Service Date', type: 'date', required: true },
      { key: 'TECHNICIAN_NAME', label: 'Technician Name', type: 'text', placeholder: 'Suresh Patel', required: true },
      { key: 'COST', label: 'Cost (₹)', type: 'number', placeholder: '1500', required: true },
      { key: 'REMARKS', label: 'Servicing Remarks', type: 'text', placeholder: 'Replaced bearing and lubricated track', full: true }
    ]
  },
  payments: {
    title: 'Payment Invoice',
    idField: 'PAYMENT_ID',
    fields: [
      { key: 'PAYMENT_ID', label: 'Payment ID', type: 'text', placeholder: 'P009', required: true },
      { key: 'MEMBER_ID', label: 'Member ID', type: 'select', dynamic: 'members', required: true },
      { key: 'AMOUNT', label: 'Amount (₹)', type: 'number', placeholder: '12000', required: true },
      { key: 'PAYMENT_DATE', label: 'Transaction Date', type: 'date', required: true },
      { key: 'PAYMENT_MODE', label: 'Payment Mode', type: 'select', options: ['UPI', 'Card', 'Cash', 'Net Banking'], required: true },
      { key: 'STATUS', label: 'Payment Status', type: 'select', options: ['Paid', 'Pending'], required: true }
    ]
  }
};

async function openAddModal(tableKey) {
  currentModalTable = tableKey;
  currentEditId = null;
  const cfg = MODAL_CONFIGS[tableKey];
  document.getElementById('modalTitle').textContent = `Add New ${cfg.title}`;
  document.getElementById('modalSubmitBtn').textContent = `Save ${cfg.title}`;

  await buildModalForm(cfg);
  document.getElementById('crudModal').classList.add('show');
}

async function openEditModal(tableKey, id) {
  currentModalTable = tableKey;
  currentEditId = id;
  const cfg = MODAL_CONFIGS[tableKey];
  document.getElementById('modalTitle').textContent = `Edit ${cfg.title} (${id})`;
  document.getElementById('modalSubmitBtn').textContent = `Update ${cfg.title}`;

  const records = await DB.getTable(tableKey);
  const record = records.find(r => String(r[cfg.idField]) === String(id));
  if (!record) return showToast('Record not found', 'error');

  await buildModalForm(cfg, record);
  document.getElementById('crudModal').classList.add('show');
}

async function buildModalForm(cfg, existingRecord = null) {
  const container = document.getElementById('modalFormBody');
  const local = getLocalDB();

  let html = `<div class="form-grid-2">`;
  for (const f of cfg.fields) {
    const isFull = f.full ? 'full' : '';
    const val = existingRecord ? existingRecord[f.key] ?? '' : (f.type === 'date' ? new Date().toISOString().split('T')[0] : '');
    const isReadonly = existingRecord && f.key === cfg.idField ? 'readonly' : '';

    html += `<div class="form-group ${isFull}">`;
    html += `<label for="f_${f.key}">${f.label}</label>`;

    if (f.type === 'select') {
      let options = f.options || [];
      if (f.dynamic) {
        const dynTable = local[f.dynamic] || [];
        const idKey = f.dynamic === 'members' ? 'MEMBER_ID' : (f.dynamic === 'equipment' ? 'EQUIPMENT_ID' : 'TRAINER_ID');
        const nameKey = f.dynamic === 'members' ? 'MEMBER_NAME' : (f.dynamic === 'equipment' ? 'EQUIPMENT_NAME' : 'TRAINER_NAME');
        options = dynTable.map(item => `${item[idKey]} - ${item[nameKey]}`);
      }

      html += `<select id="f_${f.key}" class="custom-select" ${f.required ? 'required' : ''}>`;
      options.forEach(opt => {
        const optVal = opt.split(' - ')[0];
        const selected = String(val) === optVal || String(val) === opt ? 'selected' : '';
        html += `<option value="${optVal}" ${selected}>${opt}</option>`;
      });
      html += `</select>`;
    } else {
      html += `<input id="f_${f.key}" type="${f.type}" value="${escapeHTML(String(val))}" placeholder="${f.placeholder || ''}" ${f.min ? `min="${f.min}"` : ''} ${isReadonly} class="custom-input" ${f.required ? 'required' : ''}>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function closeCrudModal() {
  document.getElementById('crudModal').classList.remove('show');
  currentModalTable = null;
  currentEditId = null;
}

async function handleModalSubmit(event) {
  event.preventDefault();
  const cfg = MODAL_CONFIGS[currentModalTable];
  const payload = {};

  for (const f of cfg.fields) {
    const el = document.getElementById(`f_${f.key}`);
    if (el) payload[f.key] = el.value.trim();
  }

  // Frontend Constraints validation
  if (currentModalTable === 'members' && Number(payload.AGE) < 14) {
    return showToast('Constraint Violation: Member must be at least 14 years old (CHECK AGE >= 14)', 'error');
  }

  try {
    if (currentEditId) {
      await DB.update(currentModalTable, currentEditId, payload);
      showToast(`${cfg.title} updated successfully! (UPDATE)`, 'success');
    } else {
      await DB.insert(currentModalTable, payload);
      showToast(`${cfg.title} created successfully! (INSERT)`, 'success');
    }
    closeCrudModal();
    loadTable(currentModalTable);
    if (currentModalTable === 'maintenance') loadTable('equipment'); // Trigger update
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmDelete(tableKey, id) {
  const cfg = MODAL_CONFIGS[tableKey];
  if (!confirm(`Are you sure you want to delete ${cfg.title} record '${id}'?\n\nThis will execute a SQL DELETE operation.`)) {
    return;
  }
  try {
    await DB.delete(tableKey, id);
    showToast(`${cfg.title} record deleted successfully! (DELETE)`, 'success');
    loadTable(tableKey);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleEquipmentStatus(equipId) {
  try {
    const equipList = await DB.getTable('equipment');
    const eq = equipList.find(e => e.EQUIPMENT_ID === equipId);
    if (!eq) return;
    const nextStatus = eq.STATUS === 'Available' ? 'Maintenance' : 'Available';
    await DB.update('equipment', equipId, { STATUS: nextStatus });
    showToast(`Status updated: ${eq.EQUIPMENT_NAME} is now ${nextStatus}`, 'success');
    loadTable('equipment');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function markPaymentPaid(paymentId) {
  try {
    await DB.update('payments', paymentId, { STATUS: 'Paid' });
    showToast(`Payment ${paymentId} marked as Paid!`, 'success');
    loadTable('payments');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ====================================================================
// 4. SQL STUDIO CONTROLLER (10 DA-2 QUERIES)
// ====================================================================
function loadSQLStudio() {
  const container = document.getElementById('queryGrid');
  if (!container) return;

  container.innerHTML = QUERIES_META.map(q => `
    <div class="query-card">
      <div class="query-card-top">
        <div class="query-number">Query ${q.id} · DA-2 Requirement</div>
        <h4>${q.title}</h4>
        <p>${q.desc}</p>
        <div style="font-size:11px; color:var(--accent-amber); margin-bottom:8px; font-weight:600;">Concept: ${q.concept}</div>
        <pre class="code-snippet"><code>${escapeHTML(q.sql)}</code></pre>
      </div>
      <div class="query-card-actions">
        <button class="btn-secondary" onclick="copyQuerySQL(${q.id})">📋 Copy SQL</button>
        <button class="btn-primary" onclick="executeStudioQuery(${q.id})">▶ Execute Query</button>
      </div>
      <div id="query-result-${q.id}" class="query-result-modal"></div>
    </div>
  `).join('');
}

async function executeStudioQuery(queryId) {
  const resultBox = document.getElementById(`query-result-${queryId}`);
  resultBox.style.display = 'block';
  resultBox.innerHTML = `<div style="color:var(--text-muted); padding:10px;">Executing query on dataset...</div>`;

  try {
    const res = await DB.runQuery(queryId);
    if (!res.data || res.data.length === 0) {
      resultBox.innerHTML = `<div style="color:var(--text-dim); padding:10px;">Query returned 0 rows. (${res.executionTime})</div>`;
      return;
    }

    const cols = Object.keys(res.data[0]);
    let tableHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px; color:var(--accent-neon);">
        <span>✓ Query executed in <b>${res.executionTime}</b></span>
        <span><b>${res.rowCount}</b> row(s) returned</span>
      </div>
      <div class="table-container" style="max-height: 200px;">
        <table class="data-table">
          <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>
            ${res.data.map(row => `<tr>${cols.map(c => `<td>${escapeHTML(String(row[c] ?? ''))}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
    resultBox.innerHTML = tableHTML;
    showToast(`Query ${queryId} executed in ${res.executionTime}`, 'success');
  } catch (err) {
    resultBox.innerHTML = `<div style="color:var(--accent-rose); padding:10px;">Execution Error: ${err.message}</div>`;
  }
}

function copyQuerySQL(queryId) {
  const q = QUERIES_META.find(x => x.id === queryId);
  if (q) {
    navigator.clipboard.writeText(q.sql);
    showToast(`SQL for Query ${queryId} copied to clipboard!`, 'success');
  }
}

// Custom SQL Query Runner
function runCustomSQL() {
  const rawSQL = document.getElementById('customSqlInput').value.trim();
  const output = document.getElementById('customSqlOutput');
  output.style.display = 'block';

  if (!rawSQL) {
    output.innerHTML = `<span style="color:var(--accent-amber);">Please type a SQL query to execute.</span>`;
    return;
  }

  // Parse simple table query
  const lower = rawSQL.toLowerCase();
  const start = performance.now();
  const local = getLocalDB();

  let targetTable = null;
  if (lower.includes('from member')) targetTable = 'members';
  else if (lower.includes('from trainer')) targetTable = 'trainers';
  else if (lower.includes('from equipment_usage') || lower.includes('from usage')) targetTable = 'usage';
  else if (lower.includes('from equipment')) targetTable = 'equipment';
  else if (lower.includes('from maintenance')) targetTable = 'maintenance';
  else if (lower.includes('from payment')) targetTable = 'payments';

  if (!targetTable) {
    output.innerHTML = `<div style="color:var(--accent-amber); padding:10px;">Notice: Running general query simulator. For best results, query FROM MEMBER, TRAINER, EQUIPMENT, EQUIPMENT_USAGE, MAINTENANCE, or PAYMENT.</div>`;
    targetTable = 'members';
  }

  let rows = local[targetTable];
  if (lower.includes('where')) {
    // Simple mock filter
    if (lower.includes('premium')) rows = rows.filter(r => JSON.stringify(r).includes('Premium'));
    else if (lower.includes('male')) rows = rows.filter(r => r.GENDER === 'Male');
    else if (lower.includes('female')) rows = rows.filter(r => r.GENDER === 'Female');
    else if (lower.includes('available')) rows = rows.filter(r => r.STATUS === 'Available');
  }

  const end = performance.now();
  const time = (end - start).toFixed(2) + ' ms';
  const cols = Object.keys(rows[0] || {});

  output.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px; color:var(--accent-neon);">
      <span>✓ Status: SUCCESS (${time})</span>
      <span>Rows fetched: ${rows.length}</span>
    </div>
    <div class="table-container" style="max-height: 250px;">
      <table class="data-table">
        <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(row => `<tr>${cols.map(c => `<td>${escapeHTML(String(row[c] ?? ''))}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ====================================================================
// 5. PL/SQL DEMONSTRATOR & SIMULATOR
// ====================================================================
function initPLSQLView() {
  // Populate dropdown for Function tester
  const local = getLocalDB();
  const sel = document.getElementById('fnMemberSelect');
  if (sel) {
    sel.innerHTML = local.members.map(m => `<option value="${m.MEMBER_ID}">${m.MEMBER_ID} - ${m.MEMBER_NAME}</option>`).join('');
  }
}

// Test SP_REGISTER_MEMBER procedure
async function testProcedure() {
  const mId = document.getElementById('sp_id').value.trim();
  const mName = document.getElementById('sp_name').value.trim();
  const mAge = Number(document.getElementById('sp_age').value);
  const mGender = document.getElementById('sp_gender').value;
  const mPhone = document.getElementById('sp_phone').value.trim();
  const mType = document.getElementById('sp_type').value;

  const consoleEl = document.getElementById('plsql-console-proc');
  consoleEl.innerHTML = `> EXEC SP_REGISTER_MEMBER('${mId}', '${mName}', ${mAge}, '${mGender}', '${mPhone}', '${mType}');\n`;

  // Exception 1: Underage Check
  if (mAge < 14) {
    consoleEl.innerHTML += `<span style="color:#ef4444;">ORA-20001: Validation Error: Member must be at least 14 years old to join.\nPL/SQL procedure successfully completed with handled exception.</span>`;
    return showToast('PL/SQL Exception Handled: Underage (Age < 14)', 'error');
  }

  // Exception 2: DUP_VAL_ON_INDEX Check
  const local = getLocalDB();
  if (local.members.some(m => m.MEMBER_ID === mId || m.PHONE === mPhone)) {
    consoleEl.innerHTML += `<span style="color:#ef4444;">ORA-20002: DUP_VAL_ON_INDEX: Member ID or Phone Number already exists.\nPL/SQL procedure completed with handled exception.</span>`;
    return showToast('PL/SQL Exception: Duplicate Key', 'error');
  }

  // Success
  await DB.insert('members', {
    MEMBER_ID: mId,
    MEMBER_NAME: mName,
    AGE: mAge,
    GENDER: mGender,
    PHONE: mPhone,
    MEMBERSHIP_TYPE: mType,
    JOIN_DATE: new Date().toISOString().split('T')[0]
  });

  consoleEl.innerHTML += `<span style="color:#34d399;">Success: Member ${mName} (${mId}) registered successfully.\nCommit completed.\nPL/SQL procedure successfully executed.</span>`;
  showToast('PL/SQL Procedure executed successfully!', 'success');
}

// Test FN_GET_MEMBER_TOTAL_PAID function
function testFunction() {
  const mId = document.getElementById('fnMemberSelect').value;
  const local = getLocalDB();
  const member = local.members.find(m => m.MEMBER_ID === mId);
  const total = local.payments
    .filter(p => p.MEMBER_ID === mId && p.STATUS === 'Paid')
    .reduce((s, p) => s + Number(p.AMOUNT || 0), 0);

  const consoleEl = document.getElementById('plsql-console-fn');
  consoleEl.innerHTML = `> SELECT FN_GET_MEMBER_TOTAL_PAID('${mId}') AS TOTAL_PAID FROM DUAL;\n`;
  consoleEl.innerHTML += `----------------------------------------------------\n`;
  consoleEl.innerHTML += `MEMBER_ID : ${mId} (${member ? member.MEMBER_NAME : 'Unknown'})\n`;
  consoleEl.innerHTML += `TOTAL_PAID: ₹${total.toLocaleString('en-IN')}.00\n`;
  consoleEl.innerHTML += `----------------------------------------------------\n`;
  consoleEl.innerHTML += `<span style="color:#34d399;">Function returned successfully: ${total}</span>`;
  showToast(`Function FN_GET_MEMBER_TOTAL_PAID returned ₹${total}`, 'success');
}

// Test Explicit Cursor
function testCursor() {
  const local = getLocalDB();
  const consoleEl = document.getElementById('plsql-console-cur');
  consoleEl.innerHTML = `> DECLARE CURSOR cur_trainers IS ... BEGIN OPEN; LOOP; FETCH; CLOSE; END;\n`;
  consoleEl.innerHTML += `====================================================\n`;
  consoleEl.innerHTML += `FITCORE GYM - TRAINER PERFORMANCE & AUDIT REPORT\n`;
  consoleEl.innerHTML += `====================================================\n`;

  local.trainers.forEach(t => {
    const sessions = local.usage.filter(u => u.TRAINER_ID === t.TRAINER_ID).length;
    consoleEl.innerHTML += `Trainer ID    : ${t.TRAINER_ID}\n`;
    consoleEl.innerHTML += `Name          : ${t.TRAINER_NAME}\n`;
    consoleEl.innerHTML += `Specialization: ${t.SPECIALIZATION}\n`;
    consoleEl.innerHTML += `Supervised    : ${sessions} workout session(s)\n`;
    consoleEl.innerHTML += `----------------------------------------------------\n`;
  });

  consoleEl.innerHTML += `<span style="color:#34d399;">Report Generation Completed. Explicit cursor closed.</span>`;
  showToast('Explicit cursor loop finished with DBMS_OUTPUT!', 'success');
}

// ====================================================================
// 6. REPORT VIEWER & PRINT ENGINE
// ====================================================================
function renderReportView() {
  // Sets current timestamp for report
  const dateEl = document.getElementById('report-timestamp');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
}

function printReport() {
  window.print();
}

// ====================================================================
// UTILITIES & HELPERS
// ====================================================================
function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function getInitials(name) {
  if (!name) return 'FC';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function getAvatarColor(tier) {
  if (tier === 'Premium') return 'avatar-purple';
  if (tier === 'Standard') return 'avatar-blue';
  return 'avatar-amber';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${escapeHTML(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  showToast(`Switched to ${isLight ? 'Light' : 'Obsidian Dark'} Theme`);
}

// Global Quick Action Handler
function openQuickAction(action) {
  switch (action) {
    case 'member': openAddModal('members'); break;
    case 'usage': openAddModal('usage'); break;
    case 'payment': openAddModal('payments'); break;
    case 'maintenance': openAddModal('maintenance'); break;
  }
}

// Keyboard Shortcut: Ctrl + K for quick search
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    document.getElementById('globalSearch')?.focus();
  }
});

// App Initialization
window.addEventListener('DOMContentLoaded', async () => {
  await DB.checkBackend();
  navigateTo('dashboard');

  // Check periodically for backend connectivity
  setInterval(() => DB.checkBackend(), 5000);
});
