const express = require("express");
const cors = require("cors");
const db = require("./database");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "MIC Event Check-In Backend is running!" });
});

app.post("/api/events", (req, res) => {
    const { name, date, capacity } = req.body;

    if (!name || !date || !capacity || capacity <= 0) {
        return res.status(400).json({
            error: "Valid name, date and capacity are required."
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO events (name, date, capacity)
            VALUES (?, ?, ?)
        `).run(name, date, capacity);

        res.status(201).json({
            message: "Event created successfully!",
            event: {
                id: result.lastInsertRowid,
                name,
                date,
                capacity
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create event." });
    }
});

app.get("/api/events", (req, res) => {
    try {
        const events = db.prepare(`
            SELECT * FROM events
            ORDER BY date ASC
        `).all();

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch events." });
    }
});

app.post("/api/events/:eventId/register", (req, res) => {
    const eventId = Number(req.params.eventId);
    const {
        name,
        email,
        category = "Other",
        performanceTitle = "Open Mic Performance",
        duration = 5
    } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Name and email are required."
        });
    }

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({
            error: "Invalid event ID."
        });
    }

    try {
        const registerAttendee = db.transaction(() => {
            const event = db.prepare(`
                SELECT id, name, capacity
                FROM events
                WHERE id = ?
            `).get(eventId);

            if (!event) throw new Error("EVENT_NOT_FOUND");

            let attendee = db.prepare(`
                SELECT id, name, email
                FROM attendees
                WHERE email = ?
            `).get(email);

            if (!attendee) {
                const result = db.prepare(`
                    INSERT INTO attendees (name, email, role)
                    VALUES (?, ?, 'attendee')
                `).run(name, email);

                attendee = {
                    id: result.lastInsertRowid,
                    name,
                    email
                };
            } else {
                db.prepare(`
                    UPDATE attendees
                    SET name = ?
                    WHERE id = ?
                `).run(name, attendee.id);
            }

            const existing = db.prepare(`
                SELECT id
                FROM registrations
                WHERE event_id = ? AND attendee_id = ?
            `).get(eventId, attendee.id);

            if (existing) throw new Error("ALREADY_REGISTERED");

            const count = db.prepare(`
                SELECT COUNT(*) AS count
                FROM registrations
                WHERE event_id = ?
            `).get(eventId).count;

            if (count >= event.capacity) throw new Error("EVENT_FULL");

            const qrToken = randomUUID();

            const result = db.prepare(`
                INSERT INTO registrations
                (
                    event_id,
                    attendee_id,
                    qr_token,
                    category,
                    performance_title,
                    duration,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 'waiting')
            `).run(
                eventId,
                attendee.id,
                qrToken,
                category,
                performanceTitle,
                Number(duration)
            );

            return {
                registrationId: result.lastInsertRowid,
                attendeeId: attendee.id,
                eventId,
                name: attendee.name,
                email: attendee.email,
                category,
                performanceTitle,
                duration: Number(duration),
                qrToken
            };
        }).immediate();

        res.status(201).json({
            message: "Registration successful!",
            registration: registerAttendee
        });

    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ error: "Event not found." });
        }

        if (error.message === "ALREADY_REGISTERED") {
            return res.status(409).json({
                error: "This attendee is already registered for this event."
            });
        }

        if (error.message === "EVENT_FULL") {
            return res.status(409).json({
                error: "This event is full."
            });
        }

        console.error(error);
        res.status(500).json({ error: "Registration failed." });
    }
});

app.get("/api/participants", (req, res) => {
    try {
        const participants = db.prepare(`
            SELECT
                r.id AS registrationId,
                a.name,
                a.email,
                r.category,
                r.performance_title AS performanceTitle,
                r.duration,
                r.status,
                r.registered_at AS registeredAt,
                CASE
                    WHEN c.id IS NOT NULL THEN 1
                    ELSE 0
                END AS checkedIn,
                c.checked_in_at AS checkInTime
            FROM registrations r
            JOIN attendees a ON a.id = r.attendee_id
            LEFT JOIN check_ins c ON c.registration_id = r.id
            ORDER BY r.registered_at DESC
        `).all();

        res.json(participants);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch participants."
        });
    }
});

app.get("/api/stats", (req, res) => {
    try {
        const total = db.prepare(`
            SELECT COUNT(*) AS count FROM registrations
        `).get().count;

        const checkedIn = db.prepare(`
            SELECT COUNT(*) AS count FROM check_ins
        `).get().count;

        const pending = total - checkedIn;

        const categories = db.prepare(`
            SELECT category, COUNT(*) AS count
            FROM registrations
            GROUP BY category
            ORDER BY count DESC
        `).all();

        res.json({
            total,
            checkedIn,
            pending,
            attendanceRate: total ? Math.round((checkedIn / total) * 100) : 0,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch statistics." });
    }
});

app.post("/api/checkin", (req, res) => {
    const { qrToken } = req.body;

    if (!qrToken) {
        return res.status(400).json({
            error: "QR token is required."
        });
    }

    try {
        const checkIn = db.transaction(() => {
            const registration = db.prepare(`
                SELECT
                    r.id AS registration_id,
                    r.event_id,
                    r.category,
                    r.performance_title,
                    r.duration,
                    a.name,
                    a.email,
                    e.name AS event_name
                FROM registrations r
                JOIN attendees a ON a.id = r.attendee_id
                JOIN events e ON e.id = r.event_id
                WHERE r.qr_token = ?
            `).get(qrToken);

            if (!registration) throw new Error("INVALID_QR");

            const existing = db.prepare(`
                SELECT id, checked_in_at
                FROM check_ins
                WHERE registration_id = ?
            `).get(registration.registration_id);

            if (existing) throw new Error("ALREADY_CHECKED_IN");

            const result = db.prepare(`
                INSERT INTO check_ins (registration_id)
                VALUES (?)
            `).run(registration.registration_id);

            db.prepare(`
                UPDATE registrations
                SET status = 'checked-in'
                WHERE id = ?
            `).run(registration.registration_id);

            return {
                checkInId: result.lastInsertRowid,
                registrationId: registration.registration_id,
                eventId: registration.event_id,
                eventName: registration.event_name,
                attendeeName: registration.name,
                attendeeEmail: registration.email,
                category: registration.category,
                performanceTitle: registration.performance_title,
                duration: registration.duration
            };
        }).immediate();

        res.status(201).json({
            message: "Check-in successful!",
            checkIn
        });

    } catch (error) {
        if (error.message === "INVALID_QR") {
            return res.status(404).json({
                error: "Invalid QR code."
            });
        }

        if (error.message === "ALREADY_CHECKED_IN") {
            return res.status(409).json({
                error: "This attendee has already checked in."
            });
        }

        console.error(error);
        res.status(500).json({
            error: "Check-in failed."
        });
    }
});

app.put("/api/participants/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const allowed = ["waiting", "live", "completed", "skipped", "checked-in"];

    if (!allowed.includes(status)) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    try {
        const result = db.prepare(`
            UPDATE registrations
            SET status = ?
            WHERE id = ?
        `).run(status, id);

        if (!result.changes) {
            return res.status(404).json({
                error: "Participant not found."
            });
        }

        res.json({
            message: "Status updated successfully."
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update status."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});