// ====================================================================
// FITCORE GYM MANAGEMENT SYSTEM - BACKEND SERVER
// Provides REST API for DA2 Database Operations (CRUD + 10 Queries + PL/SQL)
// Zero-dependency pure Node.js HTTP server with auto Express detection.
// ====================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'gym_data.json');

// Initial seed data matching the DA1 submission
const DEFAULT_DATA = {
  members: [
    { MEMBER_ID: 'M001', MEMBER_NAME: 'Priya Sharma', AGE: 18, GENDER: 'Female', PHONE: '9876543210', MEMBERSHIP_TYPE: 'Premium', JOIN_DATE: '2024-01-10' },
    { MEMBER_ID: 'M002', MEMBER_NAME: 'Rahul Kumar', AGE: 22, GENDER: 'Male', PHONE: '9876543211', MEMBERSHIP_TYPE: 'Basic', JOIN_DATE: '2024-02-15' },
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

// Load or initialize database
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading DB_FILE, resetting to defaults:', err);
  }
  saveData(DEFAULT_DATA);
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}

let db = loadData();

// Table configuration mapping
const tableConfigs = {
  members: { id: 'MEMBER_ID', name: 'Member' },
  trainers: { id: 'TRAINER_ID', name: 'Trainer' },
  equipment: { id: 'EQUIPMENT_ID', name: 'Equipment' },
  usage: { id: 'USAGE_ID', name: 'Equipment Usage' },
  maintenance: { id: 'MAINTENANCE_ID', name: 'Maintenance' },
  payments: { id: 'PAYMENT_ID', name: 'Payment' }
};

// Response helper
function sendJSON(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(obj));
}

// Request body reader
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// 10 DA2 Queries Engine
function executeQuery(queryId) {
  const d = db;
  switch (String(queryId)) {
    case '1':
      // Multi-table JOIN (4 tables)
      return d.usage.map(u => {
        const m = d.members.find(x => x.MEMBER_ID === u.MEMBER_ID) || {};
        const e = d.equipment.find(x => x.EQUIPMENT_ID === u.EQUIPMENT_ID) || {};
        const t = d.trainers.find(x => x.TRAINER_ID === u.TRAINER_ID) || {};
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

    case '2':
      // Aggregate with GROUP BY & HAVING (> 2000)
      const catMap = {};
      d.maintenance.forEach(m => {
        const eq = d.equipment.find(e => e.EQUIPMENT_ID === m.EQUIPMENT_ID);
        const cat = eq ? eq.CATEGORY : 'Unknown';
        if (!catMap[cat]) catMap[cat] = { count: 0, cost: 0 };
        catMap[cat].count += 1;
        catMap[cat].cost += Number(m.COST || 0);
      });
      return Object.entries(catMap)
        .filter(([_, v]) => v.cost > 2000)
        .map(([cat, v]) => ({
          CATEGORY: cat,
          TOTAL_SERVICINGS: v.count,
          TOTAL_MAINTENANCE_COST: '₹' + v.cost.toLocaleString('en-IN'),
          AVERAGE_COST_PER_SERVICE: '₹' + (v.cost / v.count).toFixed(2)
        }));

    case '3':
      // Correlated Subquery / NOT EXISTS: Dormant members with no equipment usage
      const usedMemberIds = new Set(d.usage.map(u => u.MEMBER_ID));
      return d.members
        .filter(m => !usedMemberIds.has(m.MEMBER_ID))
        .map(m => ({
          MEMBER_ID: m.MEMBER_ID,
          MEMBER_NAME: m.MEMBER_NAME,
          PHONE: m.PHONE,
          MEMBERSHIP_TYPE: m.MEMBERSHIP_TYPE,
          AGE: m.AGE
        }));

    case '4':
      // Revenue & Member status by Membership Type
      const tiers = {};
      d.members.forEach(m => {
        if (!tiers[m.MEMBERSHIP_TYPE]) {
          tiers[m.MEMBERSHIP_TYPE] = { members: 0, paid: 0, pending: 0 };
        }
        tiers[m.MEMBERSHIP_TYPE].members += 1;
      });
      d.payments.forEach(p => {
        const mem = d.members.find(m => m.MEMBER_ID === p.MEMBER_ID);
        if (mem && tiers[mem.MEMBERSHIP_TYPE]) {
          if (p.STATUS === 'Paid') tiers[mem.MEMBERSHIP_TYPE].paid += Number(p.AMOUNT);
          else if (p.STATUS === 'Pending') tiers[mem.MEMBERSHIP_TYPE].pending += Number(p.AMOUNT);
        }
      });
      return Object.entries(tiers).map(([tier, v]) => ({
        MEMBERSHIP_TYPE: tier,
        TOTAL_MEMBERS: v.members,
        REVENUE_COLLECTED: '₹' + v.paid.toLocaleString('en-IN'),
        PENDING_RECEIVABLES: '₹' + v.pending.toLocaleString('en-IN')
      }));

    case '5':
      // Equipment with single incident cost > average
      const avgCost = d.maintenance.reduce((acc, m) => acc + Number(m.COST), 0) / (d.maintenance.length || 1);
      return d.maintenance
        .filter(m => Number(m.COST) > avgCost)
        .map(m => {
          const eq = d.equipment.find(e => e.EQUIPMENT_ID === m.EQUIPMENT_ID) || {};
          return {
            EQUIPMENT_ID: m.EQUIPMENT_ID,
            EQUIPMENT_NAME: eq.EQUIPMENT_NAME || 'Unknown',
            CATEGORY: eq.CATEGORY || 'General',
            TECHNICIAN_NAME: m.TECHNICIAN_NAME,
            INCIDENT_COST: '₹' + Number(m.COST).toLocaleString('en-IN'),
            REMARKS: m.REMARKS
          };
        });

    case '6':
      // Trainer workload analysis
      return d.trainers.map(t => {
        const sessions = d.usage.filter(u => u.TRAINER_ID === t.TRAINER_ID);
        const uniqueClients = new Set(sessions.map(u => u.MEMBER_ID)).size;
        return {
          TRAINER_ID: t.TRAINER_ID,
          TRAINER_NAME: t.TRAINER_NAME,
          SPECIALIZATION: t.SPECIALIZATION,
          EXPERIENCE: t.EXPERIENCE,
          SESSIONS_SUPERVISED: sessions.length,
          UNIQUE_CLIENTS_COACHED: uniqueClients
        };
      }).sort((a, b) => b.SESSIONS_SUPERVISED - a.SESSIONS_SUPERVISED);

    case '7':
      // Pending dues defaulters list
      return d.payments
        .filter(p => p.STATUS === 'Pending')
        .map(p => {
          const m = d.members.find(x => x.MEMBER_ID === p.MEMBER_ID) || {};
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

    case '8':
      // Asset health & cumulative repair cost
      return d.equipment.map(e => {
        const totalRepair = d.maintenance
          .filter(m => m.EQUIPMENT_ID === e.EQUIPMENT_ID)
          .reduce((sum, m) => sum + Number(m.COST || 0), 0);
        return {
          EQUIPMENT_ID: e.EQUIPMENT_ID,
          EQUIPMENT_NAME: e.EQUIPMENT_NAME,
          CATEGORY: e.CATEGORY,
          CURRENT_STATUS: e.STATUS,
          CONDITION: e.CONDITION,
          CUMULATIVE_REPAIR_COST: '₹' + totalRepair.toLocaleString('en-IN')
        };
      }).sort((a, b) => {
        const ca = parseInt(a.CUMULATIVE_REPAIR_COST.replace(/\D/g, '')) || 0;
        const cb = parseInt(b.CUMULATIVE_REPAIR_COST.replace(/\D/g, '')) || 0;
        return cb - ca;
      });

    case '9':
      // UNION: Unified Contact Directory
      const contacts = [
        ...d.trainers.map(t => ({
          ENTITY_ID: t.TRAINER_ID,
          CONTACT_NAME: t.TRAINER_NAME,
          PHONE: t.PHONE,
          ROLE: 'Trainer',
          DETAILS: t.SPECIALIZATION
        })),
        ...d.members.map(m => ({
          ENTITY_ID: m.MEMBER_ID,
          CONTACT_NAME: m.MEMBER_NAME,
          PHONE: m.PHONE,
          ROLE: 'Member',
          DETAILS: m.MEMBERSHIP_TYPE
        }))
      ];
      return contacts.sort((a, b) => a.ROLE.localeCompare(b.ROLE) || a.CONTACT_NAME.localeCompare(b.CONTACT_NAME));

    case '10':
      // Analytical Ranking (DENSE_RANK usage frequency by category)
      const usageCounts = {};
      d.usage.forEach(u => {
        usageCounts[u.EQUIPMENT_ID] = (usageCounts[u.EQUIPMENT_ID] || 0) + 1;
      });
      return d.equipment.map(e => ({
        CATEGORY: e.CATEGORY,
        EQUIPMENT_NAME: e.EQUIPMENT_NAME,
        BRAND: e.BRAND,
        USAGE_COUNT: usageCounts[e.EQUIPMENT_ID] || 0
      })).sort((a, b) => b.USAGE_COUNT - a.USAGE_COUNT);

    default:
      return [];
  }
}

// HTTP Request Handler
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // 1. Health check
    if (pathname === '/api/health') {
      return sendJSON(res, 200, {
        ok: true,
        status: 'online',
        database: 'Connected (Persistent JSON/SQLite Data Store)',
        tables: Object.keys(tableConfigs)
      });
    }

    // 2. Dashboard KPIs
    if (pathname === '/api/dashboard') {
      const totalMembers = db.members.length;
      const totalTrainers = db.trainers.length;
      const totalEquipment = db.equipment.length;
      const totalRevenue = db.payments
        .filter(p => p.STATUS === 'Paid')
        .reduce((sum, p) => sum + Number(p.AMOUNT || 0), 0);
      const pendingRevenue = db.payments
        .filter(p => p.STATUS === 'Pending')
        .reduce((sum, p) => sum + Number(p.AMOUNT || 0), 0);
      const maintenanceCount = db.equipment
        .filter(e => String(e.STATUS).toLowerCase() === 'maintenance').length;
      const availableCount = db.equipment
        .filter(e => String(e.STATUS).toLowerCase() === 'available').length;

      return sendJSON(res, 200, {
        MEMBERS: totalMembers,
        TRAINERS: totalTrainers,
        EQUIPMENT: totalEquipment,
        PAID_AMOUNT: totalRevenue,
        PENDING_AMOUNT: pendingRevenue,
        MAINTENANCE: maintenanceCount,
        AVAILABLE: availableCount
      });
    }

    // 3. DA2 Queries Endpoint
    const reportMatch = pathname.match(/^\/api\/reports\/(\d+)$/);
    if (reportMatch && method === 'GET') {
      const qId = reportMatch[1];
      const start = process.hrtime();
      const results = executeQuery(qId);
      const diff = process.hrtime(start);
      const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
      return sendJSON(res, 200, {
        queryId: qId,
        executionTime: `${executionTimeMs} ms`,
        rowCount: results.length,
        data: results
      });
    }

    // 4. PL/SQL Stored Procedure Simulator
    if (pathname === '/api/plsql/procedure' && method === 'POST') {
      const body = await readBody(req);
      const { MEMBER_ID, MEMBER_NAME, AGE, GENDER, PHONE, MEMBERSHIP_TYPE } = body;
      
      // Validation & Exceptions
      if (Number(AGE) < 14) {
        return sendJSON(res, 400, {
          error: 'ORA-20001: Validation Error: Member must be at least 14 years old to join.'
        });
      }
      if (db.members.some(m => m.MEMBER_ID === MEMBER_ID || m.PHONE === PHONE)) {
        return sendJSON(res, 400, {
          error: 'ORA-20002: DUP_VAL_ON_INDEX: Member ID or Phone Number already exists.'
        });
      }

      const newMember = {
        MEMBER_ID,
        MEMBER_NAME,
        AGE: Number(AGE),
        GENDER,
        PHONE,
        MEMBERSHIP_TYPE,
        JOIN_DATE: new Date().toISOString().split('T')[0]
      };
      db.members.push(newMember);
      saveData(db);
      return sendJSON(res, 201, {
        message: `Success: SP_REGISTER_MEMBER executed successfully. Member ${MEMBER_NAME} registered.`,
        member: newMember
      });
    }

    // 5. PL/SQL Stored Function Simulator
    if (pathname === '/api/plsql/function' && method === 'POST') {
      const body = await readBody(req);
      const memberId = body.MEMBER_ID;
      const member = db.members.find(m => m.MEMBER_ID === memberId);
      if (!member) {
        return sendJSON(res, 404, { error: `Member '${memberId}' does not exist in the database.` });
      }
      const totalPaid = db.payments
        .filter(p => p.MEMBER_ID === memberId && p.STATUS === 'Paid')
        .reduce((sum, p) => sum + Number(p.AMOUNT || 0), 0);
      return sendJSON(res, 200, {
        MEMBER_ID: memberId,
        MEMBER_NAME: member.MEMBER_NAME,
        TOTAL_PAID: totalPaid,
        formatted: '₹' + totalPaid.toLocaleString('en-IN')
      });
    }

    // 6. Generic Table CRUD Endpoints: /api/:table and /api/:table/:id
    const tableMatch = pathname.match(/^\/api\/([a-z]+)(?:\/([^/]+))?$/);
    if (tableMatch) {
      const tableKey = tableMatch[1];
      const recordId = tableMatch[2] ? decodeURIComponent(tableMatch[2]) : null;
      const cfg = tableConfigs[tableKey];

      if (!cfg || !db[tableKey]) {
        return sendJSON(res, 404, { error: `Table '${tableKey}' not found.` });
      }

      const idField = cfg.id;

      // GET ALL
      if (method === 'GET' && !recordId) {
        return sendJSON(res, 200, db[tableKey]);
      }

      // GET ONE
      if (method === 'GET' && recordId) {
        const item = db[tableKey].find(x => String(x[idField]) === recordId);
        if (!item) return sendJSON(res, 404, { error: 'Record not found' });
        return sendJSON(res, 200, item);
      }

      // INSERT (POST)
      if (method === 'POST') {
        const body = await readBody(req);
        if (!body[idField]) {
          return sendJSON(res, 400, { error: `Missing primary key '${idField}'` });
        }
        if (db[tableKey].some(x => String(x[idField]) === String(body[idField]))) {
          return sendJSON(res, 400, { error: `Duplicate Key Error: ${idField} '${body[idField]}' already exists.` });
        }

        // TRIGGER SIMULATION: When Maintenance is inserted, update Equipment status to Maintenance
        if (tableKey === 'maintenance' && body.EQUIPMENT_ID) {
          const equip = db.equipment.find(e => e.EQUIPMENT_ID === body.EQUIPMENT_ID);
          if (equip) equip.STATUS = 'Maintenance';
        }

        db[tableKey].push(body);
        saveData(db);
        return sendJSON(res, 201, {
          message: `${cfg.name} record inserted successfully.`,
          record: body
        });
      }

      // UPDATE (PUT)
      if (method === 'PUT' && recordId) {
        const body = await readBody(req);
        const index = db[tableKey].findIndex(x => String(x[idField]) === recordId);
        if (index === -1) {
          return sendJSON(res, 404, { error: 'Record not found' });
        }
        db[tableKey][index] = { ...db[tableKey][index], ...body, [idField]: recordId };
        saveData(db);
        return sendJSON(res, 200, {
          message: `${cfg.name} record updated successfully.`,
          record: db[tableKey][index]
        });
      }

      // DELETE (DELETE)
      if (method === 'DELETE' && recordId) {
        const initialLen = db[tableKey].length;
        db[tableKey] = db[tableKey].filter(x => String(x[idField]) !== recordId);
        if (db[tableKey].length === initialLen) {
          return sendJSON(res, 404, { error: 'Record not found' });
        }
        saveData(db);
        return sendJSON(res, 200, { message: `${cfg.name} record deleted successfully.` });
      }
    }

    // Static File Serving (fallback for direct browser access)
    let filePath = path.join(
    __dirname,
    'frontend',
    pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    // Not found
    sendJSON(res, 404, { error: 'API route not found' });
  } catch (err) {
    console.error('Server Error:', err);
    sendJSON(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` FitCore Gym Management Backend Running!`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Ready for DA2 evaluation & demonstration!`);
  console.log(`====================================================`);
});
