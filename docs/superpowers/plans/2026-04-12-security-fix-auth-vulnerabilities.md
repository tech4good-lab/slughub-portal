# Security Fix: Auth Vulnerabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two high-severity security vulnerabilities: (1) unauthenticated club deletion and (2) privilege escalation via request-body override in the admin access-request approval flow.

**Architecture:** Both fixes are surgical — add auth guards to the unprotected DELETE handler using the same `getServerSession` + `verifyAccess` pattern already used by GET and POST in that file, and lock down the approve route to use only database-sourced values for the `clubMember` upsert.

**Tech Stack:** Next.js 14 App Router (API routes), NextAuth (`getServerSession`), Prisma ORM, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `app/api/leader/clubs/[clubId]/route.ts` | Add session check + `verifyAccess` call to `DELETE` handler |
| `app/api/admin/access-requests/[id]/approve/route.ts` | Remove body overrides for `clubId` / `requesterUserId` |

> Note: There is also a duplicate route at `app/api/admin/access-requests/[requestId]/approve/route.ts` — Task 2 covers both.

---

## Task 1: Protect the DELETE club endpoint with authentication + authorization

**Files:**
- Modify: `app/api/leader/clubs/[clubId]/route.ts:143-166`

**Context:**

The `GET` and `POST` handlers on lines 26 and 69 both start with this guard pattern:

```ts
const session = await getServerSession(authOptions);
const userId = (session as any)?.userId;
const role = (session as any)?.role;

if (!userId)
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (role !== "leader" && role !== "admin")
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });

const { clubId } = await params;

const hasAccess = await verifyAccess(userId, clubId, role);
if (!hasAccess)
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

The `DELETE` handler (line 143) skips all of this.

- [ ] **Step 1: Replace the DELETE handler body**

Open `app/api/leader/clubs/[clubId]/route.ts` and replace the entire `DELETE` function (lines 143–166) with:

```ts
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "leader" && role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clubId } = await params;

  const hasAccess = await verifyAccess(userId, clubId, role);
  if (!hasAccess)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.$transaction([
      prisma.clubMember.deleteMany({ where: { clubId } }),
      prisma.accessRequest.deleteMany({ where: { clubId } }),
      prisma.clubEvent.deleteMany({ where: { clubId } }),
      prisma.club.delete({ where: { id: clubId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Could not delete club. Ensure you have permission." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Manually verify the fix looks correct**

Open the file and confirm:
- `getServerSession(authOptions)` is called at the top of `DELETE`
- `userId` and `role` are extracted from the session
- 401 is returned when `!userId`
- 403 is returned when the role is neither `leader` nor `admin`
- `verifyAccess(userId, clubId, role)` is called before the destructive transaction
- The `$transaction` block is unchanged

- [ ] **Step 3: Commit**

```bash
git add app/api/leader/clubs/\[clubId\]/route.ts
git commit -m "security: require auth + club ownership check on DELETE /api/leader/clubs/[clubId]"
```

---

## Task 2: Remove request-body overrides for `clubId` / `requesterUserId` in approve routes

**Files:**
- Modify: `app/api/admin/access-requests/[id]/approve/route.ts:34-37`
- Modify: `app/api/admin/access-requests/[requestId]/approve/route.ts` (check if same pattern exists)

**Context:**

After fetching the `accessRequest` row from the database, lines 34–37 allow the caller's request body to silently replace the database values:

```ts
// BEFORE (vulnerable)
const clubId = String(body.clubId ?? accessRequest.clubId);
const userId = String(
  body.requesterUserId ?? accessRequest.requesterUserId,
);
```

These values are then used on line 62 to upsert a `clubMember` record. Because any admin (or a request that reaches this endpoint) can supply arbitrary `clubId` and `requesterUserId`, this grants leader access to whoever the body specifies — not necessarily the person who submitted the access request.

The fix is to use only the database-sourced values.

- [ ] **Step 1: Fix `app/api/admin/access-requests/[id]/approve/route.ts`**

Replace lines 34–37:

```ts
// BEFORE
const clubId = String(body.clubId ?? accessRequest.clubId);
const userId = String(
  body.requesterUserId ?? accessRequest.requesterUserId,
);
```

With:

```ts
// AFTER
const clubId = String(accessRequest.clubId);
const userId = String(accessRequest.requesterUserId);
```

No other lines in this file need to change.

- [ ] **Step 2: Check and fix the duplicate route**

Read `app/api/admin/access-requests/[requestId]/approve/route.ts`. If it contains the same `body.clubId ??` / `body.requesterUserId ??` pattern, apply the identical fix:

```ts
// AFTER
const clubId = String(accessRequest.clubId);
const userId = String(accessRequest.requesterUserId);
```

If it does not contain the pattern, no change needed.

- [ ] **Step 3: Manually verify both files**

For each changed file confirm:
- `clubId` is derived solely from `accessRequest.clubId`
- `userId` is derived solely from `accessRequest.requesterUserId`
- The `clubMember` upsert on the lines that follow still uses these same variables
- `body.reviewNotes` and `body.clubName` (fallback display name only) are still read from the body — these are non-security fields and are intentional

- [ ] **Step 4: Commit**

```bash
git add "app/api/admin/access-requests/[id]/approve/route.ts"
git add "app/api/admin/access-requests/[requestId]/approve/route.ts"
git commit -m "security: use db-only values for clubId/userId in access-request approval"
```

---

## Self-Review

**Spec coverage:**
- Vuln 1 (unauthenticated DELETE): covered by Task 1 ✓
- Vuln 2 (body override privilege escalation): covered by Task 2 ✓

**Placeholder scan:** None found. All steps contain concrete code.

**Type consistency:** `clubId` and `userId` are `string` throughout both tasks — consistent with the surrounding Prisma call signatures.
