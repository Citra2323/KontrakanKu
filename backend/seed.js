// seed.js - Populate database with initial data (PostgreSQL)
const { pool, initSchema, run } = require('./db');

(async () => {
  console.log('🌱 Seeding database...');
  await initSchema();

  await run('DELETE FROM unit');
  await run('DELETE FROM kompleks');

  const kompleksData = [
    ['k1', 'Taktakan Hills',   'Kec. Taktakan, Kota Serang'],
    ['k2', 'Green Residence',  'Cipocok Jaya, Serang'],
    ['k3', 'Serang Indah',     'Pusat Kota Serang, Banten'],
  ];

  for (const row of kompleksData) {
    await run('INSERT INTO kompleks (id, nama, alamat) VALUES ($1, $2, $3)', row);
  }

  const unitData = [
    ['u1','k1','Kontrakan 1',1200000,'Full',  'Andi Saputra','081234567890','10 Jan 2025','10 Jul 2026','10 Juni 2026','Lunas'],
    ['u2','k1','Kontrakan 2',1200000,'Full',  'Budi Pratama','087711223344','15 Mar 2025','15 Jun 2026','15 Mei 2026', 'Belum Bayar'],
    ['u3','k1','Kontrakan 3',1300000,'Available','-','-','-','-','-','-'],
    ['u4','k2','Kontrakan 1',1500000,'Full',  'Siti Rahma','085299887766','01 Feb 2025','01 Jul 2026','01 Juni 2026','Jatuh Tempo Dekat'],
    ['u5','k2','Kontrakan 2',1500000,'Available','-','-','-','-','-','-'],
    ['u6','k3','Kontrakan 1',1800000,'Full',  'Rian Hidayat','081944556677','20 May 2025','20 Mei 2026','20 April 2026','Menunggak'],
    ['u7','k3','Kontrakan 2',1800000,'Full',  'Eka Wijaya','083877662211','05 Jun 2025','05 Jul 2026','05 Juni 2026','Lunas'],
  ];

  for (const row of unitData) {
    await run(`
      INSERT INTO unit
        (id, kompleks_id, nama, harga, status, penyewa, telp, tgl_masuk, jatuh_tempo, terakhir_bayar, status_bayar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, row);
  }

  console.log(`✅ Seeded ${kompleksData.length} kompleks & ${unitData.length} unit.`);
  await pool.end();
  process.exit(0);
})().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
