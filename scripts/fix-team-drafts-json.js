// scripts/fix-team-drafts-json.js
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function fixField(field) {
  // 取出所有内容
  const res = await pool.query(`SELECT id, ${field} FROM team_drafts`);
  for (const row of res.rows) {
    let value = row[field];
    let needsFix = false;
    try {
      if (typeof value !== 'string') value = String(value);
      JSON.parse(value);
    } catch {
      needsFix = true;
    }
    if (needsFix || value === '' || value === null) {
      await pool.query(
        `UPDATE team_drafts SET ${field} = '[]' WHERE id = $1`,
        [row.id]
      );
      console.log(`Fixed ${field} for draft id: ${row.id}`);
    }
  }
}

async function main() {
  await fixField('team_a_athletes');
  await fixField('team_b_athletes');
  await pool.end();
  console.log('All broken JSON fields fixed!');
}

main();