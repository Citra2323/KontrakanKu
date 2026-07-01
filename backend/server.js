// server.js - KontrakanKu REST API Server (PostgreSQL / Render-ready)
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initSchema, all, get, run } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/public')));

function camelUnit(u) {
  return {
    id:            u.id,
    kompleksId:    u.kompleks_id,
    nama:          u.nama,
    harga:         u.harga,
    status:        u.status,
    penyewa:       u.penyewa,
    telp:          u.telp,
    tglMasuk:      u.tgl_masuk,
    jatuhTempo:    u.jatuh_tempo,
    terakhirBayar: u.terakhir_bayar,
    statusBayar:   u.status_bayar,
  };
}

// ─────────────────────────────────────────────
//  ROUTES: KOMPLEKS
// ─────────────────────────────────────────────
app.get('/api/kompleks', async (req, res) => {
  res.json(await all('SELECT * FROM kompleks ORDER BY nama'));
});

app.get('/api/kompleks/:id', async (req, res) => {
  const row = await get('SELECT * FROM kompleks WHERE id = $1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Kompleks tidak ditemukan' });
  res.json(row);
});

app.post('/api/kompleks', async (req, res) => {
  const { nama, alamat } = req.body;
  if (!nama || !alamat) return res.status(400).json({ error: 'nama dan alamat wajib diisi' });
  const id = 'k' + Date.now();
  await run('INSERT INTO kompleks (id, nama, alamat) VALUES ($1, $2, $3)', [id, nama, alamat]);
  res.status(201).json({ id, nama, alamat });
});

app.put('/api/kompleks/:id', async (req, res) => {
  const { nama, alamat } = req.body;
  const result = await run('UPDATE kompleks SET nama=$1, alamat=$2 WHERE id=$3', [nama, alamat, req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Kompleks tidak ditemukan' });
  res.json({ id: req.params.id, nama, alamat });
});

app.delete('/api/kompleks/:id', async (req, res) => {
  const result = await run('DELETE FROM kompleks WHERE id=$1', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Kompleks tidak ditemukan' });
  res.json({ message: 'Kompleks berhasil dihapus' });
});

// ─────────────────────────────────────────────
//  ROUTES: UNIT
// ─────────────────────────────────────────────
app.get('/api/unit', async (req, res) => {
  const { kompleksId } = req.query;
  const rows = kompleksId
    ? await all('SELECT * FROM unit WHERE kompleks_id = $1 ORDER BY nama', [kompleksId])
    : await all('SELECT * FROM unit ORDER BY kompleks_id, nama');
  res.json(rows.map(camelUnit));
});

app.get('/api/unit/:id', async (req, res) => {
  const row = await get('SELECT * FROM unit WHERE id = $1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Unit tidak ditemukan' });
  res.json(camelUnit(row));
});

app.post('/api/unit', async (req, res) => {
  const { kompleksId, nama, harga, status, penyewa, telp, tglMasuk, jatuhTempo, terakhirBayar, statusBayar } = req.body;
  if (!kompleksId || !nama || !harga) return res.status(400).json({ error: 'kompleksId, nama, dan harga wajib diisi' });

  const id = 'u' + Date.now();
  await run(`
    INSERT INTO unit (id, kompleks_id, nama, harga, status, penyewa, telp, tgl_masuk, jatuh_tempo, terakhir_bayar, status_bayar)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    id, kompleksId, nama, harga,
    status || 'Available',
    penyewa || '-',
    telp || '-',
    tglMasuk || '-',
    jatuhTempo || '-',
    terakhirBayar || '-',
    statusBayar || '-',
  ]);
  res.status(201).json(camelUnit(await get('SELECT * FROM unit WHERE id=$1', [id])));
});

app.put('/api/unit/:id', async (req, res) => {
  const { nama, harga, status, penyewa, telp, tglMasuk, jatuhTempo, terakhirBayar, statusBayar } = req.body;
  const result = await run(`
    UPDATE unit SET
      nama=$1, harga=$2, status=$3, penyewa=$4, telp=$5,
      tgl_masuk=$6, jatuh_tempo=$7, terakhir_bayar=$8, status_bayar=$9,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$10
  `, [nama, harga, status, penyewa, telp, tglMasuk, jatuhTempo, terakhirBayar, statusBayar, req.params.id]);

  if (result.changes === 0) return res.status(404).json({ error: 'Unit tidak ditemukan' });
  res.json(camelUnit(await get('SELECT * FROM unit WHERE id=$1', [req.params.id])));
});

app.delete('/api/unit/:id', async (req, res) => {
  const result = await run('DELETE FROM unit WHERE id=$1', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Unit tidak ditemukan' });
  res.json({ message: 'Unit berhasil dihapus' });
});

// ─────────────────────────────────────────────
//  ROUTES: DASHBOARD STATS
// ─────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const totalKompleks = (await get('SELECT COUNT(*) as c FROM kompleks')).c;
  const totalUnit      = (await get('SELECT COUNT(*) as c FROM unit')).c;
  const unitTerisi     = (await get("SELECT COUNT(*) as c FROM unit WHERE status='Full'")).c;
  const unitKosong     = totalUnit - unitTerisi;
  const belumBayar     = (await get("SELECT COUNT(*) as c FROM unit WHERE status_bayar IN ('Belum Bayar','Menunggak')")).c;

  const pendapatanRows = await all("SELECT harga, status_bayar FROM unit WHERE status='Full'");
  let pendapatanBulanan = 0;
  let totalTunggakan    = 0;
  pendapatanRows.forEach(u => {
    if (u.status_bayar === 'Menunggak') totalTunggakan += u.harga;
    else pendapatanBulanan += u.harga;
  });

  const occupancyRate = totalUnit > 0 ? +((unitTerisi / totalUnit) * 100).toFixed(1) : 0;

  res.json({
    totalKompleks: Number(totalKompleks),
    totalUnit: Number(totalUnit),
    unitTerisi: Number(unitTerisi),
    unitKosong: Number(unitKosong),
    penyewaAktif: Number(unitTerisi),
    belumBayar: Number(belumBayar),
    pendapatanBulanan,
    pendapatanTahunan: pendapatanBulanan * 12,
    totalTunggakan,
    occupancyRate,
  });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// ─────────────────────────────────────────────
//  START SERVER (after schema is ready)
// ─────────────────────────────────────────────
initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 KontrakanKu server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
