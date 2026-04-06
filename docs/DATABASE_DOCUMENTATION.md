# Database Documentation & Architecture

The database architecture is built upon the **Supabase PostgreSQL** infrastructure. It enforces data integrity via Foreign Keys, and secures queries using Row Level Security (RLS) policies.

***

## 1. Entity Relationship Diagram (ERD) Text-Representation

Below is a textual representation of the relations connecting the fundamental tables:

```text
[ users ] (Managed by Supabase Auth)
   | 1
   |
   | 1..1 (Strict Mapping via UUID)
[ ahli ] ---------+
   | 1            | 1
   |              |
   | 0..*         | 0..*
[ yuran ]      [ logs ]
   |              |
 (Payments)     (Audit Trail)
```

> **Note on `kehadiran`**: The `kehadiran` (attendance) table was originally drafted in preliminary phases but formally decommissioned and dropped securely to optimize payload and operational focus, making this system lighter and exceedingly robust.

***

## 2. Table Definitions

### A. Table: `ahli` (Member Profiles)
Stores the biometric, contact, and structural hierarchy of registered system users.

| Column Name  | Data Type | Constraints               | Description |
| :---         | :---      | :---                      | :---        |
| `id`         | `uuid`    | **PRIMARY KEY**           | Maps 1:1 to `auth.users.id` |
| `no_ic`      | `text`    | UNIQUE, NOT NULL          | National Identifier. |
| `nama_penuh` | `text`    | NOT NULL                  | Official legal name. |
| `email`      | `text`    | UNIQUE                    | Contact and login alias. |
| `no_tel`     | `text`    | -                         | Mobile number. |
| `role`       | `text`    | DEFAULT 'student'         | Distinguishes between `superadmin`, `admin`, and `student`. |

### B. Table: `yuran` (Financial Registries)
Tracks historical fee remittances to dictate active or arrears status on member profiles.

| Column Name     | Data Type | Constraints                         | Description |
| :---            | :---      | :---                                | :---        |
| `id`            | `uuid`    | **PRIMARY KEY**                     | Unique payment identifier. |
| `id_ahli`       | `uuid`    | FOREIGN KEY (`ahli.id`) CASCADE     | Linked member. `ON DELETE CASCADE` prevents orphaned metrics. |
| `jumlah`        | `numeric` | NOT NULL                            | Total paid amount (MYR). |
| `bulan`         | `int`     | NOT NULL                            | Target month of payment. |
| `tahun`         | `int`     | NOT NULL                            | Target year of payment. |
| `tarikh_bayar`  | `date`    | DEFAULT `now()`                     | Official timestamp of transaction. |
| `bukti_bayaran` | `text`    | -                                   | Cloud URL pointing to absolute storage of receipt. |

### C. Table: `logs` (Administrative CCTV / Audit Trail)
An invisible observer table strictly meant for forensic analysis tracking modifications made by administrators.

| Column Name  | Data Type | Constraints                     | Description |
| :---         | :---      | :---                            | :---        |
| `id`         | `uuid`    | **PRIMARY KEY**                 | Unique log identifier. |
| `action`     | `text`    | NOT NULL                        | System action (e.g., "DELETE STUDENT", "GRANT ADMIN"). |
| `done_by`    | `uuid`    | FOREIGN KEY (`ahli.id`) CASCADE | The admin who executed it. |
| `target_id`  | `uuid`    | -                               | The ID of the manipulated record. |
| `created_at` | `timestamp`| DEFAULT `now()`                 | Forensic timestamp of the event. |

***

## 3. Row Level Security (RLS) Operations
The database utilizes PostgreSQL RLS. The rule-sets function natively inside Supabase:
1. **Students** can only `SELECT` rows in `yuran` if `auth.uid() = id_ahli`.
2. **Admins** (`role IN ('admin', 'superadmin')`) bypass basic filters and have `SELECT`, `UPDATE` grants globally.
3. Operations directly onto the `logs` table restrict standard `admin` from performing `DELETE`, reserving `DROP` or `DELETE` capabilities only to the supreme database administrator to ensure forensic integrity.
