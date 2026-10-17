import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Run only against the disposable local Postgres cluster on port 55432.
const connection = ["-h", "127.0.0.1", "-p", "55432", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"];
const start = "((now() at time zone 'Asia/Jakarta')::date + interval '3 days 11 hours') at time zone 'Asia/Jakarta'";
const sql = `begin; set role authenticated; set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111'; select public.create_booking('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc',${start},'Concurrent Test'); select pg_sleep(2); commit;`;

function run(sqlText) {
  return new Promise(resolve => {
    const child = spawn("psql", [...connection, "-c", sqlText], { windowsHide: true });
    let output = "";
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    child.on("close", code => resolve({ code, output }));
  });
}

const results = await Promise.all([run(sql), run(sql)]);
assert.equal(results.filter(item => item.code === 0).length, 1, JSON.stringify(results));
assert.equal(results.filter(item => item.output.includes("bookings_no_overlap")).length, 1, JSON.stringify(results));
console.log("Concurrent requests: one committed, one rejected by bookings_no_overlap.");
