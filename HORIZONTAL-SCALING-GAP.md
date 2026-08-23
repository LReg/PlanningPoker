# PlanningPoker Backend — Horizontal Scaling

Gap analysis (2026-08-23) and the record of how each gap was closed. Reference implementations
read in full before writing this: `~/git/musik-star`'s `backend/src/common/redis-io.adapter.ts`
and `backend/src/game/session-cleanup.service.ts`, and `~/git/huntcontrol-fullstack`'s
`backend/src/config/Redis.ts` and its own `HORIZONTAL-SCALING-GAP.md`.

**Status: implemented in source, not yet deployed.** Everything below is in the tree, but
infra's `image.tag` for this app is still pinned to a pre-scaling build — see "What infra must
set before scaling" at the end.

## The difference from musik-star/huntcontrol

Those two apps already had their game state in MongoDB, so their gap was purely a
*coordination* problem — Redis was bolted on for Socket.io fan-out and locks, and stays
optional (`REDIS_URL` unset falls back to single-instance, process-local behaviour).

This app had **no database at all**. Every session, player, chat-routing table and kick timer
lived in a single `Session[]` array and a couple of plain JS objects inside one process. Redis
had to become the *primary* datastore here, not an add-on — so it's a required dependency now,
not optional, and the diff is a real rewrite of the storage layer, not just a coordination
layer bolted on top of an existing one.

## Verdict up front

Running this backend at more than one replica **broke user-visible behaviour completely**, not
just performance — a session created on one pod was invisible to any request that landed on a
different pod.

| # | Topic | Effect at replicas > 1 | Where it's fixed |
|---|-------|------------------------|-------------------|
| A | `sessions: Session[]` was a process-local array | A session created on pod A didn't exist on pod B — any request landing elsewhere 404d | `services/sessionStore.ts`, `services/sessionService.ts` |
| B | No Socket.io adapter | Room/socket broadcasts only reached sockets on the same pod | `services/socket/socketService.ts` |
| C | `socketPlayers` player→socket map was a plain object | A pod couldn't resolve a socket that connected via another pod | `services/socket/socketDataService.ts` |
| D | Kick/kick-warning timers were live `setTimeout` handles stored inside the Player object | Not serializable into Redis at all, and pod-pinned even if left alone | `services/cleanupSweep.ts` |
| E | Session-deletion timer, same shape | Same problem, for "delete an empty session after 20 days" | `services/sessionStore.ts` (Redis TTL) |
| F | No HPA machinery in the chart | Nothing to scale with even once the app was safe to | `deploy/helm/planning-poker/templates/backend-hpa.yaml` |
| G | No dedicated Redis in infra | — | `infra/deploy/k8s/planning-poker{,-dev}/` |
| H | gitops Applications had 2 sources | No place for the new k8s manifests to sync from | `infra/gitops/apps/planning-poker-{dev,prod}.yaml` |
| I | Express 4 doesn't catch async route rejections | Every route became `async` under this work; an unhandled rejection used to crash the process | `routers/asyncHandler.ts` |

## A. Session/player state → Redis

`services/sessionStore.ts` is now the only file that talks to Redis for session data.
`getSession`/a session's JSON blob under `session:{token}`; `withSession(token, fn)` is the only
way anything mutates one — it takes a short Redis lock (`SET ... PX 3000 NX`, released by a
compare-and-delete Lua script, same shape as musik-star's `SessionCleanupService` lock), loads
the session, hands it to `fn` for the exact same in-memory field mutation the old code did,
saves the result, releases the lock. This replaced every inline `session.foo = bar` /
`player.foo = bar` across `routers/sessionRouter.ts`'s ~15 handlers.

One handler needed more than a mechanical `await` added — `PUT /makeAdmin/...` used to mutate
`Player` objects returned by `getPlayerByToken`/`getPlayerById`, which were references into the
live shared array; those calls now return detached copies from a Redis read, so the mutation
had to move inside `withSession` or it would silently not persist. Caught by an end-to-end smoke
test against a real Redis before this was called done (see Verification).

Two small indexes replace what used to be `Array.find`/loop scans: `player:{token} ->
sessionToken` (was `getSessionTokenByPlayerToken`'s O(n) walk) and a `planning-poker:sessions`
Set of live tokens (what the cleanup sweep below iterates, instead of a `KEYS`/`SCAN` pattern).

## B. Socket.io Redis adapter

`socketService.ts`: `attachRedisAdapter()` wires `@socket.io/redis-adapter` over two dedicated
`ioredis` connections (a subscriber connection can issue no other commands). `index.ts`'s
bootstrap awaits it before `server.listen()` — a socket accepted before the adapter attaches
would be invisible to the other pods, same requirement huntcontrol's doc calls out. Once
attached, `io.to(anyToken)` — used throughout `socketSendService.ts` for both room tokens and
raw socket IDs — already works cluster-wide with no further changes: a socket's own ID is an
implicit room every adapter-connected node can address.

## C. Cross-pod player→socket lookup

`socketDataService.ts` keeps its exact function signatures (`getPlayerTokenFromSocketId`,
`storePlayerToken`), now `async` and Redis-backed instead of a plain object — a forward key
(`socket-player:{playerToken}`) and a reverse key (`player-socket:{socketId}`), both set/cleared
together, so the disconnect handler's reverse lookup stays O(1) instead of an `Object.keys` scan.

## D/E. Timers → Redis TTL + a leader-locked sweep

Two entirely different mechanisms replaced the old per-object `setTimeout`s, matching what each
one actually needs:

- **Empty-session deletion** (20 days) is now a Redis `EXPIRE`/`PERSIST` on the session key
  itself — set when a session's player count hits 0, cleared when someone joins. Simpler than a
  timer and, unlike the old one, survives a pod restart instead of silently cancelling the
  pending deletion.
- **Idle-player kick** (warn at 55min, kick at 60min) needed an actual action fired, not just an
  expiry, so it's `services/cleanupSweep.ts` — a `setInterval` where every pod attempts a Redis
  lock each tick and only the winner does anything, exactly `SessionCleanupService`'s shape. It
  iterates the `planning-poker:sessions` index and compares each player's `lastAction` (a field
  that already existed, just wasn't being read for logic before) against now. A missed tick just
  means the next one (≤60s later) catches it, instead of a pod restart silently dropping the
  kick/warning entirely.

## F. Chart

`deploy/helm/planning-poker/` now mirrors musik-star/huntcontrol's shape:

| | |
|---|---|
| `templates/backend-hpa.yaml` | New. Same CPU-target/stabilization-window shape, guarded to `fail` if `autoscaling.enabled` is set without `redis.host` — a template error instead of a silent bug class. |
| `redis.*` values block | New — `host`/`port`/`user`/`credentialsSecretName`, same shape as musik-star's. |
| `REDIS_URL`/`REDIS_PASSWORD` | Same `$(VAR)` Secret-expansion trick as musik-star's `MONGODB_URI`. Unlike musik-star, this is wired unconditionally (no optional branch) — there's no in-memory fallback for this app to degrade to. |
| `autoscaling.*` values block | New, **disabled by default**. |
| replicas guard | `{{- if not .Values.autoscaling.enabled }}` around the backend Deployment's `replicas:`, so Helm doesn't fight the HPA on sync. Frontend is untouched — it doesn't scale. |

Not adopted: health probes (`/health` doesn't exist in this backend yet — out of scope for this
pass), `PodDisruptionBudget`, `topologySpreadConstraints` — same "not adopted" list huntcontrol's
doc carries.

## What infra must set before scaling

1. Redis for the namespace: `infra/deploy/k8s/planning-poker{,-dev}/` (StatefulSet + Service +
   ACL-provisioning Job, same shape as musik-star's). **Already in place.**
2. `infra/deploy/helm/planning-poker/values-{dev,prod}.yaml`: `redis.host`/`user`/
   `credentialsSecretName`. **Already set.**
3. A PlanningPoker image actually built from this work — `image.tag` in those same values files
   is still pinned to the pre-scaling build as of this writing.
4. Only then `autoscaling.enabled: true` (or `replicaCount > 1`). The chart refuses the former
   without `redis.host` already, but that doesn't protect against enabling it against an *old*
   image that doesn't have any of this code — that's a human checklist item, not something the
   chart can guard.

## Verification

- `npx tsc --noEmit`: clean.
- `helm template`, both namespaces' infra values: clean. `--set autoscaling.enabled=true`
  without `redis.host`: fails with the guard's message, as intended. With `redis.host` set: HPA
  renders, backend Deployment's `replicas:` correctly disappears, frontend Deployment's does not.
- End-to-end smoke test against a real (throwaway) Redis: `newSession` → `joinSession` →
  `estimate` → `openSession` → `makeAdmin` → `isOwner` → `leaveSession`, inspecting Redis keys
  directly afterward to confirm no leaked lock keys and correct index cleanup. This is what
  caught the `makeAdmin` detached-reference bug under "A" above.
- No test suite exists for this backend (unlike huntcontrol's `test:scaling`) — nothing to
  extend; a from-scratch suite wasn't in scope for this pass.
- Not yet verified: two replicas against one Redis, live in `planning-poker-dev`, with an actual
  cross-pod Socket.io broadcast watched end-to-end. That needs a deployed image and is item 3
  above.
