let statusPilihan = "ikut";
let peserta = [];

function setStatus(val) {
  statusPilihan = val;
  const btnIkut = document.getElementById("btnIkut");
  const btnTidak = document.getElementById("btnTidak");
  const alasanBox = document.getElementById("alasanBox");
  const submitBtn = document.getElementById("submitBtn");

  btnIkut.className = "status-btn" + (val === "ikut" ? " active-ikut" : "");
  btnTidak.className = "status-btn" + (val === "tidak" ? " active-tidak" : "");

  if (val === "tidak") {
    alasanBox.classList.add("show");
    submitBtn.textContent = "✉️ Kirim Ketidakhadiran";
    submitBtn.className = "submit-btn tidak";
  } else {
    alasanBox.classList.remove("show");
    submitBtn.textContent = "🌿 Konfirmasi Kehadiran";
    submitBtn.className = "submit-btn";
  }
}

async function submitForm() {
  const nama = document.getElementById("nama").value.trim();
  const nim = document.getElementById("nim").value.trim();
  const alasan = document.getElementById("alasan").value.trim();

  if (!nama) {
    shakeFocus("nama");
    return;
  }

  if (!nim) {
    shakeFocus("nim");
    return;
  }

  if (statusPilihan === "tidak" && !alasan) {
    shakeFocus("alasan");
    return;
  }

  const form = new FormData();
  form.append("nama", nama);
  form.append("nim", nim);
  form.append("status", statusPilihan);
  form.append("alasan", statusPilihan === "tidak" ? alasan : "Ikut");
  console.log(form);

  try {
    const data = await fetch("https://api.rdevelabs.biz.id/post", {
      method: "POST",
      body: form,
    });

    const response = await data.text();
    if (response === "ok") {
      showSuccess(nama);
    } else if (response === "duplikat") {
      alert("Anda sudah mengisi form ini");
    }
  } catch (e) {
    console.log("ada error" + e);
  }
}

function showSuccess(nama) {
  renderDaftar();
  const overlay = document.getElementById("successOverlay");
  const form = document.getElementById("formContent");

  form.style.display = "none";
  overlay.classList.add("show");
  document.getElementById("successName").textContent = nama;

  if (statusPilihan === "ikut") {
    document.getElementById("successIcon").textContent = "🎉";
    document.getElementById("successIcon").className = "success-icon ikut";
    document.getElementById("successTitle").textContent =
      "Yeay, kamu terdaftar!";
    document.getElementById("successMsg").innerHTML =
      'Terima kasih <span class="name-highlight">' +
      nama +
      "</span>!<br>Sampai jumpa di Villa Bogor! 🌳";
  } else {
    document.getElementById("successIcon").textContent = "😔";
    document.getElementById("successIcon").className = "success-icon tidak";
    document.getElementById("successTitle").textContent = "Absensimu tercatat";
    document.getElementById("successMsg").innerHTML =
      'Sayang kamu tidak bisa ikut <span class="name-highlight">' +
      nama +
      "</span>.<br>Semoga lain kali bisa bareng ya!";
  }
}

function shakeFocus(id) {
  const el = document.getElementById(id);
  el.style.borderColor = "#D85A30";
  el.style.animation = "none";
  el.focus();
  setTimeout(() => {
    el.style.borderColor = "";
  }, 2000);
}

function resetForm() {
  window.location.reload(true);
}

async function renderDaftar() {
  try {
    const list = document.getElementById("daftarList");
    const data = await fetch("https://api.rdevelabs.biz.id/data");
    const response = await data.json();

    const ikutCount = response.ikut.length;
    const tidakCount = response.tidakIkut.length;

    document.getElementById("countIkut").textContent = "Ikut: " + ikutCount;
    document.getElementById("countTidak").textContent = "Tidak: " + tidakCount;
    const listPeserta = [...response.ikut, ...response.tidakIkut];

    if (!listPeserta.length) {
      list.innerHTML =
        '<div class="empty-state"><div class="big">📋</div>Belum ada yang mengisi form.<br>Jadilah yang pertama!</div>';
      return;
    }


    document.getElementById("daftarList").innerHTML = listPeserta
      .map((d, index) => {
        const nama = d.nama.replace(/\b[a-z]/g, (match) => match.toUpperCase());
        return `
      <div class="item-row" style="animation-delay: ${index * 0.04}s">
        <div class="avatar ${d.status}">${d.nama.charAt(0)}</div> 
        <div class="item-info">
          <div class="item-nama">${nama}</div>
          <div class="item-nim">NIM: ${d.nim}</div>
          ${d.alasan ? `<div class="item-alasan">"${d.alasan}"</div>` : ""}
        </div>
        <span class="status-badge ${d.status}">
          ${d.status === "ikut" ? "Ikut ✅" : "Tidak ❌"}
        </span>
      </div>
    `;
      })
      .join("");
  } catch (e) {
    console.log(e);
  }
}

renderDaftar();

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') submitForm();
});
