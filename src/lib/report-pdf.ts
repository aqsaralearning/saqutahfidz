import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { predicateFromScore } from "./quran";

export function generateRaporPDF(s: any, ziy: any[], mur: any[], tas: any[], exams: any[]) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, w, 30, "F");
  doc.setTextColor(255);
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("RAPOR TAHFIDZ AL-QUR'AN", w / 2, 13, { align: "center" });
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Sekolah Alam Al-Qudsiyyah (SAQU)", w / 2, 22, { align: "center" });

  doc.setTextColor(0);
  doc.setFontSize(11);
  let y = 42;
  const info: [string, string][] = [
    ["Nama Santri", s.full_name],
    ["NIS", s.nis],
    ["Kelas", `Kelas ${s.class_level}`],
    ["Jenis Kelamin", s.gender === "L" ? "Laki-laki" : "Perempuan"],
    ["Target Hafalan", `Juz ${s.target_juz}`],
    ["Tanggal Cetak", new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })],
  ];
  info.forEach(([k, v]) => { doc.text(`${k}`, 15, y); doc.text(`: ${v}`, 55, y); y += 6; });

  y += 4;
  doc.setFont("helvetica", "bold"); doc.text("Ringkasan Setoran", 15, y); y += 2;
  autoTable(doc, {
    startY: y + 2,
    head: [["Jenis", "Jumlah", "Rata-rata Nilai"]],
    body: [
      ["Ziyadah", ziy.length, avg(ziy)],
      ["Muroja'ah", mur.length, avg(mur)],
      ["Tasmi'", tas.length, avg(tas)],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold"); doc.text("Hasil Ujian Tahfidz", 15, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Tgl", "Juz", "Makhroj", "Mad", "Ghunnah", "Qolqolah", "Lancar", "Nilai", "Predikat"]],
    body: exams.map((e) => [
      e.date, e.juz, e.score_makhroj ?? "-", e.score_mad ?? "-", e.score_ghunnah ?? "-",
      e.score_qolqolah ?? "-", e.score_kelancaran ?? "-", e.final_score ?? "-",
      e.predicate ? predicateFromScore(Number(e.final_score) || 0).label : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 8 },
  });

  y = (doc as any).lastAutoTable.finalY + 20;
  const half = w / 2;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text("Mengetahui,", 30, y); doc.text("Musyrif Tahfidz,", half + 30, y);
  doc.text("Kepala Sekolah", 30, y + 25); doc.text("(___________________)", half + 30, y + 25);
  doc.text("(___________________)", 30, y + 30);

  doc.save(`Rapor-Tahfidz-${s.full_name.replace(/\s+/g, "_")}.pdf`);
}

function avg(rows: any[]): string {
  const nums = rows.map((r) => r.score).filter((n) => typeof n === "number");
  if (!nums.length) return "-";
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export function generateSertifikatPDF(s: any, juz: number, score: number) {
  const doc = new jsPDF({ orientation: "landscape" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(37, 99, 235); doc.setLineWidth(2); doc.rect(10, 10, w - 20, h - 20);
  doc.setDrawColor(245, 158, 11); doc.setLineWidth(1); doc.rect(14, 14, w - 28, h - 28);
  doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(37, 99, 235);
  doc.text("SERTIFIKAT TAHFIDZ", w / 2, 40, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "normal");
  doc.text("Diberikan kepada", w / 2, 60, { align: "center" });
  doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129);
  doc.text(s.full_name, w / 2, 78, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "normal");
  doc.text(`atas keberhasilan menyelesaikan hafalan Juz ${juz}`, w / 2, 95, { align: "center" });
  doc.text(`dengan nilai ${score.toFixed(1)} — Predikat ${predicateFromScore(score).label}`, w / 2, 105, { align: "center" });
  doc.text(new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), w / 2, 125, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Kepala Sekolah", w / 2 - 50, h - 30, { align: "center" });
  doc.text("Musyrif Tahfidz", w / 2 + 50, h - 30, { align: "center" });
  doc.save(`Sertifikat-Juz-${juz}-${s.full_name.replace(/\s+/g, "_")}.pdf`);
}
