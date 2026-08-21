import { useEffect, useRef, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("register");

  return (
    <div className="app">
      <header className="top-header">
        <div>
          <h1>MIC</h1>
          <p>Open Mic Event Management</p>
        </div>
        <span className="online">● System Online</span>
      </header>

      <nav className="nav-buttons">
        <button
          className={page === "register" ? "active" : ""}
          onClick={() => setPage("register")}
        >
          Register
        </button>

        <button
          className={page === "scanner" ? "active" : ""}
          onClick={() => setPage("scanner")}
        >
          QR Scanner
        </button>

        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "queue" ? "active" : ""}
          onClick={() => setPage("queue")}
        >
          Performance Queue
        </button>
      </nav>

      {page === "register" && <Registration />}
      {page === "scanner" && <Scanner />}
      {page === "dashboard" && <Dashboard />}
      {page === "queue" && <Queue />}
    </div>
  );
}

function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Singing");
  const [performanceTitle, setPerformanceTitle] = useState("");
  const [duration, setDuration] = useState("5");
  const [qrCode, setQrCode] = useState("");
  const [registration, setRegistration] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (e) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setMessage("Please enter a valid name.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!performanceTitle.trim()) {
      setMessage("Please enter your performance title.");
      return;
    }

    setLoading(true);
    setMessage("");
    setQrCode("");
    setRegistration(null);

    try {
      const response = await axios.post(
        `${API}/api/events/1/register`,
        {
          name: name.trim(),
          email: email.trim(),
          category,
          performanceTitle: performanceTitle.trim(),
          duration: Number(duration)
        }
      );

      const data = response.data.registration;
      const qrImage = await QRCode.toDataURL(data.qrToken);

      setRegistration(data);
      setQrCode(qrImage);
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Registration failed."
      );
    }

    setLoading(false);
  };

  return (
    <main>
      <section className="card registration-card">
        <div className="section-heading">
          <span className="eyebrow">PERFORMER REGISTRATION</span>
          <h2>Register for MIC Open Mic</h2>
          <p>Reserve your place and receive your unique event QR.</p>
        </div>

        <form onSubmit={register}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Performance Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Singing</option>
            <option>Dance</option>
            <option>Poetry</option>
            <option>Stand-up</option>
            <option>Instrumental</option>
            <option>Other</option>
          </select>

          <label>Performance Title</label>
          <input
            type="text"
            placeholder="e.g. Bang Bang Dance Performance"
            value={performanceTitle}
            onChange={(e) => setPerformanceTitle(e.target.value)}
          />

          <label>Performance Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="3">3 minutes</option>
            <option value="5">5 minutes</option>
            <option value="7">7 minutes</option>
            <option value="10">10 minutes</option>
          </select>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register for Event"}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {registration && qrCode && (
          <div className="qr-section">
            <div className="success-icon">✓</div>

            <h3>You're Registered!</h3>

            <p className="registration-id">
              Registration #{registration.registrationId}
            </p>

            <div className="performance-summary">
              <strong>{registration.performanceTitle}</strong>
              <span>{registration.category} · {registration.duration} min</span>
            </div>

            <img src={qrCode} alt="Unique event QR code" />

            <p className="qr-note">
              Show this QR code at the event entrance.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function Scanner() {
  const scannerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [attendee, setAttendee] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setMessage("Requesting camera access...");
    setAttendee(null);

    try {
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        setMessage("No camera was found on this device.");
        return;
      }

      setScanning(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await processQRCode(decodedText);
        },
        () => {}
      );

      setMessage("Camera active. Scan an attendee QR code.");
    } catch (error) {
      console.error(error);
      setScanning(false);
      setMessage("Camera could not start.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }

    setScanning(false);
  };

  const processQRCode = async (qrToken) => {
    await stopScanner();
    setMessage("Verifying registration...");
    setAttendee(null);

    try {
      const response = await axios.post(`${API}/api/checkin`, {
        qrToken
      });

      setMessage(response.data.message);
      setAttendee(response.data.checkIn);
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Check-in failed."
      );
    }
  };

  return (
    <main>
      <section className="card scanner-card">
        <div className="section-heading">
          <span className="eyebrow">ORGANIZER MODE</span>
          <h2>Event QR Scanner</h2>
          <p>Verify performers and manage entrance check-ins.</p>
        </div>

        {!scanning && !attendee && (
          <button className="primary-button" onClick={startScanner}>
            Start Camera Scanner
          </button>
        )}

        {scanning && (
          <>
            <div id="qr-reader"></div>

            <div className="scanner-status">
              {message}
            </div>

            <button className="secondary-button" onClick={stopScanner}>
              Stop Scanner
            </button>
          </>
        )}

        {!scanning && message && !attendee && (
          <div className="message">
            {message}
          </div>
        )}

        {attendee && (
          <div className="attendee-result success-result">
            <div className="success-icon">✓</div>

            <h3>Entry Verified</h3>

            <h2>{attendee.attendeeName}</h2>

            <div className="result-grid">
              <div>
                <span>Category</span>
                <strong>{attendee.category}</strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>{attendee.duration} min</strong>
              </div>

              <div>
                <span>Performance</span>
                <strong>{attendee.performanceTitle}</strong>
              </div>

              <div>
                <span>Event</span>
                <strong>{attendee.eventName}</strong>
              </div>
            </div>

            <button className="primary-button" onClick={startScanner}>
              Scan Another QR
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");

  const loadDashboard = async () => {
    try {
      const [statsResponse, participantsResponse] = await Promise.all([
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/participants`)
      ]);

      setStats(statsResponse.data);
      setParticipants(participantsResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filtered = participants.filter((person) =>
    `${person.name} ${person.email} ${person.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">ORGANIZER DASHBOARD</span>
          <h2>Event Overview</h2>
        </div>

        <button className="secondary-button" onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Registrations</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <span>Checked In</span>
            <strong>{stats.checkedIn}</strong>
          </div>

          <div className="stat-card">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>

          <div className="stat-card">
            <span>Attendance</span>
            <strong>{stats.attendanceRate}%</strong>
          </div>
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Participants</h3>
            <p>Live registration and check-in records</p>
          </div>

          <input
            className="search-input"
            placeholder="Search participant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Performance</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((person) => (
                <tr key={person.registrationId}>
                  <td>
                    <strong>{person.name}</strong>
                    <small>{person.email}</small>
                  </td>
                  <td>{person.category}</td>
                  <td>{person.performanceTitle}</td>
                  <td>{person.duration} min</td>
                  <td>
                    <span className={`status ${person.checkedIn ? "checked" : "waiting"}`}>
                      {person.checkedIn ? "Checked In" : person.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="empty-state">
              No participants found.
            </div>
          )}
        </div>
      </section>

      {stats && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Performance Categories</h3>
              <p>Current registration distribution</p>
            </div>
          </div>

          <div className="category-list">
            {stats.categories.map((item) => (
              <div className="category-row" key={item.category}>
                <span>{item.category}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Queue() {
  const [participants, setParticipants] = useState([]);

  const loadQueue = async () => {
    try {
      const response = await axios.get(`${API}/api/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/participants/${id}/status`, {
        status
      });

      loadQueue();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">LIVE EVENT MODE</span>
          <h2>Performance Queue</h2>
        </div>

        <button className="secondary-button" onClick={loadQueue}>
          Refresh
        </button>
      </div>

      <section className="queue-list">
        {participants.map((person, index) => (
          <div className={`queue-card ${person.status}`} key={person.registrationId}>
            <div className="queue-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="queue-info">
              <span>{person.category}</span>
              <h3>{person.name}</h3>
              <p>{person.performanceTitle}</p>
            </div>

            <div className="queue-duration">
              {person.duration} min
            </div>

            <div className="queue-actions">
              <button
                onClick={() =>
                  updateStatus(person.registrationId, "live")
                }
              >
                Start
              </button>

              <button
                onClick={() =>
                  updateStatus(person.registrationId, "completed")
                }
              >
                Complete
              </button>

              <button
                onClick={() =>
                  updateStatus(person.registrationId, "skipped")
                }
              >
                Skip
              </button>
            </div>

            <span className={`queue-status ${person.status}`}>
              {person.status}
            </span>
          </div>
        ))}

        {!participants.length && (
          <div className="empty-state">
            No performers registered yet.
          </div>
        )}
      </section>
    </main>
  );
}

export default App;