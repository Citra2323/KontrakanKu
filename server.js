const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initSchema, all, get, run } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Frontend ada di dalam folder backend/public — tidak perlu keluar folder
const FRONTEND = path.join(__dirname, 'public');
app.use(express.static(FRONTEND));

function camelUnit(u) {
  return { id:u.id, kompleksId:u.kompleks_id, nama:u.nama, harga:u.harga, status:u.status, penyewa:u.penyewa, telp:u.telp, tglMasuk:u.tgl_masuk, jatuhTempo:u.jatuh_tempo, terakhirBayar:u.terakhir_bayar, statusBayar:u.status_bayar };
}

app.get('/api/kompleks', async (req, res) => { res.json(await all('SELECT * FROM kompleks ORDER BY nama')); });
app.get('/api/kompleks/:id', async (req, res) => { const r=await get('SELECT * FROM kompleks WHERE id=$1',[req.params.id]); if(!r) return res.status(404).json({error:'tidak ditemukan'}); res.json(r); });
app.post('/api/kompleks', async (req, res) => { const {nama,alamat}=req.body; if(!nama||!alamat) return res.status(400).json({error:'nama dan alamat wajib'}); const id='k'+Date.now(); await run('INSERT INTO kompleks(id,nama,alamat)VALUES($1,$2,$3)',[id,nama,alamat]); res.status(201).json({id,nama,alamat}); });
app.put('/api/kompleks/:id', async (req, res) => { const {nama,alamat}=req.body; await run('UPDATE kompleks SET nama=$1,alamat=$2 WHERE id=$3',[nama,alamat,req.params.id]); res.json({id:req.params.id,nama,alamat}); });
app.delete('/api/kompleks/:id', async (req, res) => { await run('DELETE FROM kompleks WHERE id=$1',[req.params.id]); res.json({message:'dihapus'}); });

app.get('/api/unit', async (req, res) => { const {kompleksId}=req.query; const rows=kompleksId?await all('SELECT * FROM unit WHERE kompleks_id=$1 ORDER BY nama',[kompleksId]):await all('SELECT * FROM unit ORDER BY kompleks_id,nama'); res.json(rows.map(camelUnit)); });
app.get('/api/unit/:id', async (req, res) => { const r=await get('SELECT * FROM unit WHERE id=$1',[req.params.id]); if(!r) return res.status(404).json({error:'tidak ditemukan'}); res.json(camelUnit(r)); });
app.post('/api/unit', async (req, res) => { const {kompleksId,nama,harga,status,penyewa,telp,tglMasuk,jatuhTempo,terakhirBayar,statusBayar}=req.body; if(!kompleksId||!nama||!harga) return res.status(400).json({error:'data wajib kurang'}); const id='u'+Date.now(); await run('INSERT INTO unit(id,kompleks_id,nama,harga,status,penyewa,telp,tgl_masuk,jatuh_tempo,terakhir_bayar,status_bayar)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,kompleksId,nama,harga,status||'Available',penyewa||'-',telp||'-',tglMasuk||'-',jatuhTempo||'-',terakhirBayar||'-',statusBayar||'-']); res.status(201).json(camelUnit(await get('SELECT * FROM unit WHERE id=$1',[id]))); });
app.put('/api/unit/:id', async (req, res) => { const {nama,harga,status,penyewa,telp,tglMasuk,jatuhTempo,terakhirBayar,statusBayar}=req.body; await run('UPDATE unit SET nama=$1,harga=$2,status=$3,penyewa=$4,telp=$5,tgl_masuk=$6,jatuh_tempo=$7,terakhir_bayar=$8,status_bayar=$9,updated_at=CURRENT_TIMESTAMP WHERE id=$10',[nama,harga,status,penyewa,telp,tglMasuk,jatuhTempo,terakhirBayar,statusBayar,req.params.id]); res.json(camelUnit(await get('SELECT * FROM unit WHERE id=$1',[req.params.id]))); });
app.delete('/api/unit/:id', async (req, res) => { await run('DELETE FROM unit WHERE id=$1',[req.params.id]); res.json({message:'dihapus'}); });

app.get('/api/stats', async (req, res) => {
  const tK=Number((await get('SELECT COUNT(*) as c FROM kompleks')).c);
  const tU=Number((await get('SELECT COUNT(*) as c FROM unit')).c);
  const tI=Number((await get("SELECT COUNT(*) as c FROM unit WHERE status='Full'")).c);
  const bB=Number((await get("SELECT COUNT(*) as c FROM unit WHERE status_bayar IN ('Belum Bayar','Menunggak')")).c);
  const rows=await all("SELECT harga,status_bayar FROM unit WHERE status='Full'");
  let pB=0,tT=0; rows.forEach(u=>{ if(u.status_bayar==='Menunggak') tT+=u.harga; else pB+=u.harga; });
  res.json({totalKompleks:tK,totalUnit:tU,unitTerisi:tI,unitKosong:tU-tI,penyewaAktif:tI,belumBayar:bB,pendapatanBulanan:pB,pendapatanTahunan:pB*12,totalTunggakan:tT,occupancyRate:tU>0?+((tI/tU)*100).toFixed(1):0});
});

app.get('*', (_, res) => { res.sendFile(path.join(FRONTEND, 'index.html')); });

initSchema().then(() => {
  app.listen(PORT, () => console.log(`🚀 KontrakanKu running at http://localhost:${PORT}`));
}).catch(err => { console.error('❌ DB init failed:', err); process.exit(1); });
