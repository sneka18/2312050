# Stage 1: Notification System Design & REST API Contracts

This document outlines the architectural design, API contracts, database structures, and performance optimizations for the AffordMed Notification System.

## Core System Actions & API Endpoints

The notification system supports fetching notifications, real-time streaming, marking notifications as read, and managing user preferences.

### 1. Fetch Notifications Feed
*   **Endpoint:** `GET /api/notifications`
*   **Purpose:** Retrieves paginated notifications with optional filtering by type.
*   **Headers:**
    ```http
    Accept: application/json
    ```
*   **Query Parameters:**
    *   `page` (integer, default: 1): Page number.
    *   `limit` (integer, default: 10): Number of records per page.
    *   `notification_type` (string, optional): One of `Placement`, `Result`, `Event`.
*   **Response Schema (200 OK):**
    ```json
    {
      "notifications": [
        {
          "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
          "Type": "Result",
          "Message": "mid-sem results published",
          "Timestamp": "2026-04-22 17:51:30"
        }
      ],
      "total": 125,
      "page": 1,
      "totalPages": 13
    }
    ```

### 2. Fetch Priority Inbox
*   **Endpoint:** `GET /api/notifications/priority`
*   **Purpose:** Returns the top `n` most important unread notifications first, ordered by weight (Placement > Result > Event) and recency.
*   **Headers:**
    ```http
    Accept: application/json
    ```
*   **Query Parameters:**
    *   `limit` (integer, default: 10): Number of priority items to return.
*   **Response Schema (200 OK):**
    ```json
    {
      "notifications": [
        {
          "ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
          "Type": "Placement",
          "Message": "CSX Corporation hiring drive active",
          "Timestamp": "2026-04-22 17:51:18"
        }
      ],
      "limit": 10,
      "total": 1
    }
    ```

### 3. Log Client Event
*   **Endpoint:** `POST /api/logs`
*   **Purpose:** Receives client-side diagnostic/application logs to centralize debugging and tracing.
*   **Headers:**
    ```http
    Content-Type: application/json
    ```
*   **Request Schema:**
    ```json
    {
      "timestamp": "2026-07-02T06:08:45.000Z",
      "stack": "Error: ...",
      "level": "INFO",
      "packageName": "frontend.dashboard",
      "message": "User viewed notifications dashboard"
    }
    ```
*   **Response Schema (201 Created):**
    ```json
    {
      "success": true
    }
    ```

---

## Real-Time Notification Mechanism: Server-Sent Events (SSE)

For delivery of real-time notifications to connected clients, **Server-Sent Events (SSE)** is the chosen technology.

### Rationale
*   **Unidirectional Flow:** Notifications flow exclusively from the server to the client. WebSockets (which support full-duplex communication) introduce unnecessary protocol overhead, socket connection management, and port mapping challenges.
*   **Standard HTTP:** SSE operates over standard HTTP/1.1 or HTTP/2 protocols, making it firewall-friendly and compatible with standard reverse proxies (Nginx, Cloudflare) out of the box.
*   **Automatic Reconnection:** The SSE standard specifies automatic client-side reconnection with exponential backoff, which the browser handles natively.
*   **Lightweight:** Natively supported in JavaScript via the `EventSource` interface, requiring no additional client-side libraries.

---

# Stage 2: Persistent Storage Design & Scale Strategy

## Suggested Database: PostgreSQL (Relational)

For a database growing to 5,000,000+ records, we suggest a relational database such as **PostgreSQL**.

### Rationale
1.  **Transactional Consistency:** Notifications require integrity (e.g., ensuring a read status is exactly updated and atomic).
2.  **Rich Indexing capabilities:** PostgreSQL supports complex index combinations (B-Trees, Partial Indexes, Expression Indexes) which are critical to optimize complex searches.
3.  **Partitioning:** PostgreSQL provides native Declarative Table Partitioning, allowing us to easily segment data by `createdAt` (time range partition) or `studentID` (hash partition).

## DB Schema Design (SQL)

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optimization indexes
CREATE INDEX idx_notifications_student_unread 
ON notifications(student_id) 
WHERE is_read = FALSE;

CREATE INDEX idx_notifications_lookup 
ON notifications(student_id, is_read, created_at DESC);
```

## Scaling Challenges & Solutions

As database volume increases past 10,000,000+ records:
1.  **Index Overhead:** B-Tree index sizing exceeds RAM. Writes (`INSERT`s) become disk-I/O bound.
    *   *Solution:* **Partial Indexes** (e.g., indexing only `WHERE is_read = FALSE`). Since the majority of notifications are quickly read, the index size remains small and memory-resident.
2.  **Offset Pagination Degradation:** `OFFSET 1000000 LIMIT 10` forces the database to read and discard 1 million rows before returning 10.
    *   *Solution:* **Keyset Pagination (Cursor-based)**. Use queries like `WHERE created_at < :last_seen_timestamp AND id != :last_seen_id ORDER BY created_at DESC LIMIT 10`. This resolves offset latency to $O(\log N)$ lookup.
3.  **Read Latency:** Excessive parallel requests from active students.
    *   *Solution:* Implement a **Redis Caching Layer** that stores unread notification IDs or JSON fragments, avoiding hitting the primary database on every page load.

---

# Stage 3: Query Analysis & Query Optimization

## Evaluation of Current Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is this query accurate?
**Yes.** The query accurately retrieves all unread (`isRead = false`) notifications for a specific student (`studentID = 1042`) sorted by date from oldest to newest (`ORDER BY createdAt ASC`).

### Why is this slow?
1.  **Full Table Scan:** If there are no indexes on `studentID` or `isRead`, the database engine must scan all 5,000,000 rows to filter the matches.
2.  **File Sorting:** Without an index that naturally provides chronological order, the database must sort all matching rows in memory or temp files on disk.

### Optimization Solution
We should add a **Composite Partial Index**:
```sql
CREATE INDEX idx_student_unread_chronological 
ON notifications (studentID, createdAt ASC) 
WHERE isRead = false;
```
*   **Why this works:** It targets only unread notifications (keeping index size very small) and pre-sorts them by `createdAt`. The database can fetch results directly in $O(\log N)$ index lookup time.
*   **Computation Cost:**
    *   *Original Cost:* $O(N)$ where $N$ is total rows (5,000,000).
    *   *Optimized Cost:* $O(\log N + K)$ where $K$ is the number of unread notifications for that student.

### Critique on Indexing Every Column
**Adding indexes on every column is counter-productive.**
*   **Write Degradation:** Every index must be updated on data changes. Write throughput drops significantly.
*   **Storage Overhead:** Indexes consume significant RAM and disk space.
*   **Query Optimizer Confusion:** The planner may perform unnecessary index merges instead of optimal indexing lookups.

## Query: Placement Notifications in the Last 7 Days
```sql
SELECT DISTINCT student_id 
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4: High-Scale DB Load Optimization

## 1. Caching with Redis
*   **Strategy:** Cache active/unread notification lists in Redis.
*   **Tradeoffs:*
    *   *Pros:* Low latency, reduces DB read pressure.
    *   *Cons:* Requires cache synchronization/invalidation logic.

## 2. Server-Sent Events (Push Model)
*   **Strategy:** Establish a persistent connection to push notifications instantly.
*   **Tradeoffs:*
    *   *Pros:* Avoids database queries on page refreshes.
    *   *Cons:* Requires system socket connection management.

## 3. HTTP Caching with ETags / Conditional Requests
*   **Strategy:** Return a 304 response if the notifications list has not changed.
*   **Tradeoffs:*
    *   *Pros:* Reduces bandwidth consumption.
    *   *Cons:* Server must still check changes in background.

---

# Stage 5: Notify All (HR Broadcast) Optimization

## Observed Shortcomings in Pseudocode
1.  **Blocking Loop:** Running synchronous API requests in a loop of 50,000 will block execution and timeout.
2.  **Lack of Retry Logic:** A failure at index 201 will crash the execution, leaving the rest unnotified with no resumption path.
3.  **DB Locking:** 50,000 separate DB writes sequentially will lead to write queuing and connection timeouts.

## Redesign: Queue Broker and Bulk Insert
*   **Queue Decoupling:** Save in chunks to DB, then push jobs to BullMQ/RabbitMQ to be processed asynchronously by parallel workers.

## Revised Pseudocode
```python
def handle_notify_all_request(student_ids, message):
    chunk_size = 1000
    for i in range(0, len(student_ids), chunk_size):
        chunk = student_ids[i:i + chunk_size]
        bulk_save_to_db(chunk, message)
        
    for student_id in student_ids:
        message_queue.enqueue("send_notification_job", {
            "student_id": student_id,
            "message": message,
            "retry_count": 0
        })
    return {"status": "processing"}

def process_queue_job(job):
    student_id = job.data["student_id"]
    message = job.data["message"]
    try:
        send_email(student_id, message)
        push_to_app(student_id, message)
    except Exception as e:
        if job.data["retry_count"] < 3:
            job.data["retry_count"] += 1
            message_queue.enqueue(job, delay=30)
        else:
            log_failed_notification(student_id, message, error=str(e))
```

---

# Stage 6: Priority Inbox Algorithm & Approach

## Sorting Weight & Recency
*   **Weights:** `Placement` (3) > `Result` (2) > `Event` (1).
*   **Sorting Rule:** Sort by Type Weight descending, then by Timestamp descending (most recent first). This ensures high-weight placements show first, with chronological sorting among equal weights.

## Efficiently Maintaining the Top 10
When new notifications arrive continuously, sorting the entire array every time is inefficient ($O(N \log N)$). 
To maintain the top 10 efficiently:
1.  **Min-Heap (Priority Queue):** We maintain a Min-Heap of size $k = 10$. The heap is ordered by our Priority Rule (lowest priority at the root).
2.  **Insertion ($O(\log k)$):** When a new notification arrives, we compare it to the root of the Min-Heap. If its priority is higher than the root, we pop the root and push the new notification. 
3.  **Result:** This ensures we always have the top 10 priorities in memory in $O(N \log k)$ time for initial loads and strictly $O(\log k)$ time per new notification, making it highly scalable for real-time streams.
