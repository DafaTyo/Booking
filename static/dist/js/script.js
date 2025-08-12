// kodingan untuk slider => menggunakan library swiper.js

// slider yang berada di home, daftar, masuk
function swiper1() {
  new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
      clickable: true,
    },
    autoplay: {
      delay: 1500,
      disableOnInteraction: false,
    },
    // Kontrol lebar slide
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 1,
        spaceBetween: 30,
      },
    },
  });
}

// slider yang berada di detail lapangan => ulasan
function swiper2() {
  new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    // Kontrol lebar slide
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      640: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 2,
      },
    },
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Detail Lapangan

// kodingan untuk membuka tutup pilihan booking => button jadwal tersedia
function jadwalLapangan() {
  const jadwal_lapangan = document.getElementById("jadwalLapangan");

  // Toggle the content's max-height for smooth opening and closing
  if (
    jadwal_lapangan.style.maxHeight &&
    jadwal_lapangan.style.maxHeight !== "0px"
  ) {
    jadwal_lapangan.style.maxHeight = "0";
  } else {
    jadwal_lapangan.style.maxHeight = jadwal_lapangan.scrollHeight + "px";
  }
}

// kodingan untuk membuat tanggal agar sesuai dengan tanggal sekarang
function buatTanggal() {
const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const container = document.getElementById("containerTanggal");
const jadwal_lapangan = document.getElementById("jadwalLapangan");

const today = new Date();

for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() + i);

  const dayName = days[date.getDay()];
  const dateNum = date.getDate();
  const monthName = months[date.getMonth()]; // ✅ ambil nama bulan
  
  const dayFormatted = dateNum.toString().padStart(2, '0');
  const formattedDate = `${dayFormatted}-${monthName}-${date.getFullYear()}`;

  const defaultClasses =
    "btnTanggal w-16 h-16 me-5 text-[13px] rounded-md flex text-center items-center justify-center hover:bg-[#0C359E] hover:text-white";
  const textColor = i === 0 ? "text-white bg-[#0C359E]" : "text-black";

  container.innerHTML += ` 
    <button 
      data-tanggal="${formattedDate}" 
      class="${defaultClasses} ${textColor}"
    >${dayName}<br>${dayFormatted} ${monthName}</button>
  `;
}
  // Add click event listeners
  document.querySelectorAll(".btnTanggal").forEach((button) => {
    button.addEventListener("click", function () {
      // Remove selected style from all buttons
      document.querySelectorAll(".btnTanggal").forEach((btn) => {
        btn.classList.remove("text-white", "bg-[#0C359E]");
        btn.classList.add("text-black");
      });

      // Add selected style to clicked button
      this.classList.remove("text-black");
      this.classList.add("text-white", "bg-[#0C359E]");

      // membuat ulang pilihan slot
      jadwal_lapangan.style.maxHeight = "0";

      setTimeout(() => {
        buatPilihanSlot(function () {
          setTimeout(() => {
            jadwal_lapangan.style.maxHeight =
              jadwal_lapangan.scrollHeight + "px";
          }, 300);
        });
      }, 300);
    });
  });
}

// kodingan untuk membuat pilihan lapangan yang ada di dataLapangan agar sesuai database
function buatPilihanLapangan() {
  const container = document.getElementById("lapanganMenu");

  $("#daftarLapangan").text(DaftarLapangan[0])

  DaftarLapangan.forEach((lapangan) => {
    container.innerHTML += `
        <li class="cursor-pointer select-none text-black p-2 ps-4 hover:bg-[#0C359E] hover:text-white text-sm" data-value="${lapangan}">${lapangan}</li>
      `;
  });

  const lapanganButton = document.getElementById("lapanganButton");
  const lapanganMenu = document.getElementById("lapanganMenu");
  const daftar_Lapangan = document.getElementById("daftarLapangan");
  const jadwal_lapangan = document.getElementById("jadwalLapangan");

  lapanganButton.addEventListener("click", () => {
    lapanganMenu.classList.toggle("hidden");
  });

  lapanganMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
      const lapangan = event.target.getAttribute("data-value");
      daftar_Lapangan.textContent = lapangan;
      lapanganMenu.classList.add("hidden");

      // membuat ulang pilihan slot
      jadwal_lapangan.style.maxHeight = "0";

      setTimeout(() => {
        buatPilihanSlot(function () {
          setTimeout(() => {
            jadwal_lapangan.style.maxHeight =
              jadwal_lapangan.scrollHeight + "px";
          }, 300);
        });
      }, 300);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !lapanganButton.contains(event.target) &&
      !lapanganMenu.contains(event.target)
    ) {
      lapanganMenu.classList.add("hidden");
    }
  });
}

// kodingan untuk menggenerate pilihan yang sudah disortir berdasarkan tanggal dan pilihan lapangan
function buatPilihanSlot(callback) {
  const selectedDate = $(".btnTanggal.bg-\\[\\#0C359E\\]").attr("data-tanggal");
  const selectedLapangan = $("#daftarLapangan").html();
  const nama_lapangan = $("#namaLapangan").html();

  $.ajax({
    url: "/cek_ketersediaan_slot",
    method: "POST",
    data: {
      tanggal: selectedDate,
      detail_lapangan: selectedLapangan,
      nama_lapangan: nama_lapangan,
    },
    success: function (response) {
      $("#jadwalLapangan").empty();
      response.forEach((slot) => {
        let waktuMulai = slot.jam;
        let waktu = new Date(`1970-01-01T${waktuMulai}:00`);
        waktu.setHours(waktu.getHours() + 1);
        let waktuSelesai = waktu.toTimeString().substr(0, 5);

        const button = $(
          `<label class="jadwal_list relative block h-[5.5rem] cursor-pointer overflow-hidden rounded-lg">
                        <input 
                            class="jadwal_check peer absolute opacity-0 w-full h-full cursor-pointer"
                            type="checkbox" 
                            data-lapangan="${slot.lapangan}"
                            data-lapangan_detail="${slot.lapanganDetail}"
                            data-harga="${slot.harga}"
                            data-tanggal="${slot.tanggal}"
                            data-jam="${waktuMulai}" 
                            ${slot.is_booked ? "disabled" : ""}
                        >
                        <div class="flex flex-col gap-1 items-center justify-center h-full w-full">
                            <p class="text-xs font-semibold">60 Menit</p>
                            <p class="text-[0.85rem] font-semibold">${waktuMulai} - ${waktuSelesai}</p>
                            <p class="text-[0.85rem] font-semibold">${
                              "Rp " +
                              slot.harga
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }</p>
                        </div>
                    </label>`
        );
        $("#jadwalLapangan").append(button);
      });

      // memanggil function yang harus dipanggil
      autoPilih();
      maxPilihan();

      if (callback) {
        callback(); // Panggil callback setelah semua operasi selesai
      }
    },
  });
}

// kodingan untuk memberikan maksimal terhadap pemilihan jadwal
function maxPilihan() {
  $(".jadwal_check")
    .off("change")
    .on("change", function () {
      const selected = $(".jadwal_check:checked").length;

      if (selected > 4) {
        callAllert("error", "Anda hanya dapat memilih maksimal 4 opsi.");
        this.checked = false;
      } else {
        buatSession();
      }
    });
}

// kodingan agar ketika halaman di refresh pilihan tidak hilang
function autoPilih() {
  const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];

  $(".jadwal_check").each(function () {
    const checkbox = $(this);
    const lapangan = checkbox.data("lapangan");
    const tanggal = checkbox.data("tanggal");
    const jam = checkbox.data("jam");
    const lapanganDetail = checkbox.data("lapangan_detail");

    const isChecked = storedData.some(
      (item) =>
        item.lapangan === lapangan &&
        item.tanggal === tanggal &&
        item.jam === jam &&
        item.lapanganDetail === lapanganDetail
    );

    checkbox.prop("checked", isChecked);
  });

  cart();
}

// kodingan untuk mensupport function autopilih() dengan membuat session pada halaman web
function buatSession() {
  const selectedCheckboxes = [];

  $(".jadwal_check:checked").each(function () {
    const checkbox = $(this);
    selectedCheckboxes.push({
      lapangan: checkbox.data("lapangan"),
      lapanganDetail: checkbox.data("lapangan_detail"),
      harga: checkbox.data("harga"),
      tanggal: checkbox.data("tanggal"),
      jam: checkbox.data("jam"),
      harga: checkbox.data("harga"),
    });
  });

  sessionStorage.setItem("selectedItems", JSON.stringify(selectedCheckboxes)
  );

  cart();
  sideCart();
}

// kodingan untuk mengrefresh angka pada icon keranjang
function cart() {
  const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];

  $("#cartItems").html(`(${storedData.length})`);

  if ($("#lanjutPembayaran").length) {
    if (storedData.length > 0) {
      $("#lanjutPembayaran").css("maxHeight",$("#lanjutPembayaran")[0].scrollHeight + 24 + "px");
    } else {
      $("#lanjutPembayaran").css("maxHeight", "0px");
    }
  }
}

// kodingan untuk sidebar cart => button keranjang di klik
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (sidebar.classList.contains("translate-x-full")) {
    sidebar.classList.remove("translate-x-full");
    sidebar.classList.add("translate-x-0");
  } else {
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("translate-x-full");
  }
}

// kodingan untuk mengatur isi dari sidebar cart
function sideCart() {
  const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const container = $("#containerCart");

  container.empty();
  storedData.forEach((data) => {
    // Membuat elemen HTML dan menambahkannya ke container
    container.append(`
      <div class="itemsCart border rounded-lg p-4 mb-4">
        <div class="flex justify-between items-start mb-2">
            <div>
                <h3 class="text-lg font-semibold">${data.lapangan}</h3>
                <p class="text-sm text-gray-600">${data.lapanganDetail}</p>
                <p class="text-sm text-gray-600">${data.tanggal} • ${data.jam}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" onclick="removeItem('${data.lapangan}', '${data.lapanganDetail}', '${data.tanggal}', '${data.jam}')">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3094 2.25002H13.6908C13.9072 2.24988 14.0957 2.24976 14.2737 2.27819C14.977 2.39049 15.5856 2.82915 15.9146 3.46084C15.9978 3.62073 16.0573 3.79961 16.1256 4.00494L16.2373 4.33984C16.2562 4.39653 16.2616 4.41258 16.2661 4.42522C16.4413 4.90933 16.8953 5.23659 17.4099 5.24964C17.4235 5.24998 17.44 5.25004 17.5001 5.25004H20.5001C20.9143 5.25004 21.2501 5.58582 21.2501 6.00004C21.2501 6.41425 20.9143 6.75004 20.5001 6.75004H3.5C3.08579 6.75004 2.75 6.41425 2.75 6.00004C2.75 5.58582 3.08579 5.25004 3.5 5.25004H6.50008C6.56013 5.25004 6.5767 5.24998 6.59023 5.24964C7.10488 5.23659 7.55891 4.90936 7.73402 4.42524C7.73863 4.41251 7.74392 4.39681 7.76291 4.33984L7.87452 4.00496C7.94281 3.79964 8.00233 3.62073 8.08559 3.46084C8.41453 2.82915 9.02313 2.39049 9.72643 2.27819C9.90445 2.24976 10.093 2.24988 10.3094 2.25002ZM9.00815 5.25004C9.05966 5.14902 9.10531 5.04404 9.14458 4.93548C9.1565 4.90251 9.1682 4.86742 9.18322 4.82234L9.28302 4.52292C9.37419 4.24941 9.39519 4.19363 9.41601 4.15364C9.52566 3.94307 9.72853 3.79686 9.96296 3.75942C10.0075 3.75231 10.067 3.75004 10.3553 3.75004H13.6448C13.9331 3.75004 13.9927 3.75231 14.0372 3.75942C14.2716 3.79686 14.4745 3.94307 14.5842 4.15364C14.605 4.19363 14.626 4.2494 14.7171 4.52292L14.8169 4.82216L14.8556 4.9355C14.8949 5.04405 14.9405 5.14902 14.992 5.25004H9.00815Z" fill="#000000"/>
                    <path d="M5.91509 8.45015C5.88754 8.03685 5.53016 7.72415 5.11686 7.7517C4.70357 7.77925 4.39086 8.13663 4.41841 8.54993L4.88186 15.5017C4.96736 16.7844 5.03642 17.8205 5.19839 18.6336C5.36679 19.4789 5.65321 20.185 6.2448 20.7385C6.8364 21.2919 7.55995 21.5308 8.4146 21.6425C9.23662 21.7501 10.275 21.7501 11.5606 21.75H12.4395C13.7251 21.7501 14.7635 21.7501 15.5856 21.6425C16.4402 21.5308 17.1638 21.2919 17.7554 20.7385C18.347 20.185 18.6334 19.4789 18.8018 18.6336C18.9638 17.8206 19.0328 16.7844 19.1183 15.5017L19.5818 8.54993C19.6093 8.13663 19.2966 7.77925 18.8833 7.7517C18.47 7.72415 18.1126 8.03685 18.0851 8.45015L17.6251 15.3493C17.5353 16.6971 17.4713 17.6349 17.3307 18.3406C17.1943 19.025 17.004 19.3873 16.7306 19.6431C16.4572 19.8989 16.083 20.0647 15.391 20.1552C14.6776 20.2485 13.7376 20.25 12.3868 20.25H11.6134C10.2626 20.25 9.32255 20.2485 8.60915 20.1552C7.91715 20.0647 7.54299 19.8989 7.26958 19.6431C6.99617 19.3873 6.80583 19.025 6.66948 18.3406C6.52892 17.6349 6.46489 16.6971 6.37503 15.3493L5.91509 8.45015Z" fill="#000000"/>
                    <path d="M9.42546 10.2538C9.83762 10.2125 10.2052 10.5133 10.2464 10.9254L10.7464 15.9254C10.7876 16.3376 10.4869 16.7051 10.0747 16.7463C9.66256 16.7875 9.29503 16.4868 9.25381 16.0747L8.75381 11.0747C8.7126 10.6625 9.01331 10.295 9.42546 10.2538Z" fill="#000000"/>
                    <path d="M14.5747 10.2538C14.9869 10.295 15.2876 10.6625 15.2464 11.0747L14.7464 16.0747C14.7052 16.4868 14.3376 16.7875 13.9255 16.7463C13.5133 16.7051 13.2126 16.3376 13.2538 15.9254L13.7538 10.9254C13.795 10.5133 14.1626 10.2125 14.5747 10.2538Z" fill="#000000"/>
                </svg>
            </button>
        </div>
        <p class="text-base font-semibold text-gray-800">${"Rp " + data.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
      </div>
    `);
  });
}

// kodingan untuk membatalkan pemilihan dengan cara menghapus session lalu mengrefesh
function removeItem(lapangan, detail, tanggal, jam) {
  const storedData =
    JSON.parse(sessionStorage.getItem("selectedItems")) || [];

  NewstoredData = storedData.filter(
    (item) =>
      !(
        item.lapangan === lapangan &&
        item.lapanganDetail === detail &&
        item.tanggal === tanggal &&
        item.jam === jam
      )
  );
  sessionStorage.setItem("selectedItems", JSON.stringify(NewstoredData));

  const checkbox = document.querySelector(`.jadwal_check:checked[data-lapangan="${lapangan}"][data-lapangan_detail="${detail}"][data-tanggal="${tanggal}"][data-jam="${jam}"]`);
  if (checkbox) {  
    checkbox.checked = false;
  }

  cart();
  sideCart();
  checkItems()
}

// kodingan untuk navigasi yang berada di halaman web sekaligus animasi pada navigasi tersebut
function navigasiDetailLapangan() {
  const daftarNavLapangan = document.querySelectorAll("#daftar_nav_lapangan");
  const ulasan = document.getElementById("ulasan");
  const jadwal = document.getElementById("jadwal");
  const informasi = document.getElementById("informasi");
  const jadwal_lapangan = document.getElementById("jadwalLapangan");

  jadwal_lapangan.style.maxHeight = jadwal_lapangan.scrollHeight + "px";

  ulasan.style.maxHeight = "0";
  informasi.style.maxHeight = "0";
  jadwal.style.maxHeight = jadwal.scrollHeight + "px";

  daftarNavLapangan.forEach((daftar, index) => {
    daftar.addEventListener("click", function () {
      // Reset semua elemen
      ulasan.style.maxHeight = "0";
      informasi.style.maxHeight = "0";
      jadwal.style.maxHeight = "0";

      // Tentukan elemen yang akan ditampilkan berdasarkan index
      const sections = [jadwal, ulasan, informasi];
      const selectedSection = sections[index];

      setTimeout(() => {
        jadwal_lapangan.style.maxHeight = jadwal_lapangan.scrollHeight + "px";

        if (selectedSection) {
          selectedSection.style.maxHeight = selectedSection.scrollHeight + "px";
        }

        // Update kelas warna untuk navigasi
        daftarNavLapangan.forEach((nav, navIndex) => {
          nav.classList.toggle("text-[#0C359E]", navIndex === index);
        });
      }, 1100);
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// kodingan untuk mengatur tampilan pembayaran
function pembayaran() {
  $('#pembayaran1, #payment1').addClass('hidden');
  $('#pembayaran2, #payment2').removeClass('hidden');
  payment()
}

// kodingan untuk memastikan pilihan yang dipilih user sebelum pembayaran
function checkItems() {
  const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const container = $("#containerItems");

  container.empty();

  if (storedData.length > 0) {
    storedData.forEach((data) => {
      // Membuat elemen HTML dan menambahkannya ke container
      
      container.append(`
              <div class="border rounded-lg p-4 mb-4">
                  <div class="flex justify-between items-center">
                      <div>
                          <h3 class="text-lg font-semibold">${data.lapangan}</h3>
                          <p class="text-gray-500">${data.lapanganDetail}</p>
                          <p class="text-gray-500">${data.tanggal} • ${data.jam}</p>
                      </div>
                      <div class="text-right flex flex-col items-end">
                          <p class="text-xl font-semibold text-gray-700">${"Rp " + data.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
                          <button class="text-[red] hover:text-red-700 font-semibold flex mt-5" onclick="removeItem('${data.lapangan}', '${data.lapanganDetail}', '${data.tanggal}', '${data.jam}')">
                              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3094 2.25002H13.6908C13.9072 2.24988 14.0957 2.24976 14.2737 2.27819C14.977 2.39049 15.5856 2.82915 15.9146 3.46084C15.9978 3.62073 16.0573 3.79961 16.1256 4.00494L16.2373 4.33984C16.2562 4.39653 16.2616 4.41258 16.2661 4.42522C16.4413 4.90933 16.8953 5.23659 17.4099 5.24964C17.4235 5.24998 17.44 5.25004 17.5001 5.25004H20.5001C20.9143 5.25004 21.2501 5.58582 21.2501 6.00004C21.2501 6.41425 20.9143 6.75004 20.5001 6.75004H3.5C3.08579 6.75004 2.75 6.41425 2.75 6.00004C2.75 5.58582 3.08579 5.25004 3.5 5.25004H6.50008C6.56013 5.25004 6.5767 5.24998 6.59023 5.24964C7.10488 5.23659 7.55891 4.90936 7.73402 4.42524C7.73863 4.41251 7.74392 4.39681 7.76291 4.33984L7.87452 4.00496C7.94281 3.79964 8.00233 3.62073 8.08559 3.46084C8.41453 2.82915 9.02313 2.39049 9.72643 2.27819C9.90445 2.24976 10.093 2.24988 10.3094 2.25002ZM9.00815 5.25004C9.05966 5.14902 9.10531 5.04404 9.14458 4.93548C9.1565 4.90251 9.1682 4.86742 9.18322 4.82234L9.28302 4.52292C9.37419 4.24941 9.39519 4.19363 9.41601 4.15364C9.52566 3.94307 9.72853 3.79686 9.96296 3.75942C10.0075 3.75231 10.067 3.75004 10.3553 3.75004H13.6448C13.9331 3.75004 13.9927 3.75231 14.0372 3.75942C14.2716 3.79686 14.4745 3.94307 14.5842 4.15364C14.605 4.19363 14.626 4.2494 14.7171 4.52292L14.8169 4.82216L14.8556 4.9355C14.8949 5.04405 14.9405 5.14902 14.992 5.25004H9.00815Z" fill="red"/>
                                  <path d="M5.91509 8.45015C5.88754 8.03685 5.53016 7.72415 5.11686 7.7517C4.70357 7.77925 4.39086 8.13663 4.41841 8.54993L4.88186 15.5017C4.96736 16.7844 5.03642 17.8205 5.19839 18.6336C5.36679 19.4789 5.65321 20.185 6.2448 20.7385C6.8364 21.2919 7.55995 21.5308 8.4146 21.6425C9.23662 21.7501 10.275 21.7501 11.5606 21.75H12.4395C13.7251 21.7501 14.7635 21.7501 15.5856 21.6425C16.4402 21.5308 17.1638 21.2919 17.7554 20.7385C18.347 20.185 18.6334 19.4789 18.8018 18.6336C18.9638 17.8206 19.0328 16.7844 19.1183 15.5017L19.5818 8.54993C19.6093 8.13663 19.2966 7.77925 18.8833 7.7517C18.47 7.72415 18.1126 8.03685 18.0851 8.45015L17.6251 15.3493C17.5353 16.6971 17.4713 17.6349 17.3307 18.3406C17.1943 19.025 17.004 19.3873 16.7306 19.6431C16.4572 19.8989 16.083 20.0647 15.391 20.1552C14.6776 20.2485 13.7376 20.25 12.3868 20.25H11.6134C10.2626 20.25 9.32255 20.2485 8.60915 20.1552C7.91715 20.0647 7.54299 19.8989 7.26958 19.6431C6.99617 19.3873 6.80583 19.025 6.66948 18.3406C6.52892 17.6349 6.46489 16.6971 6.37503 15.3493L5.91509 8.45015Z" fill="red"/>
                                  <path d="M9.42546 10.2538C9.83762 10.2125 10.2052 10.5133 10.2464 10.9254L10.7464 15.9254C10.7876 16.3376 10.4869 16.7051 10.0747 16.7463C9.66256 16.7875 9.29503 16.4868 9.25381 16.0747L8.75381 11.0747C8.7126 10.6625 9.01331 10.295 9.42546 10.2538Z" fill="red"/>
                                  <path d="M14.5747 10.2538C14.9869 10.295 15.2876 10.6625 15.2464 11.0747L14.7464 16.0747C14.7052 16.4868 14.3376 16.7875 13.9255 16.7463C13.5133 16.7051 13.2126 16.3376 13.2538 15.9254L13.7538 10.9254C13.795 10.5133 14.1626 10.2125 14.5747 10.2538Z" fill="red"/>
                              </svg>
                              Hapus
                          </button>
                      </div>
                  </div>
              </div>
      `);
    }); 
    $("#payment1").css("maxHeight",$("#payment1")[0].scrollHeight + 24 + "px");
  }else{
    container.append(`
      <h1 class="text-center">
        Anda belum memesan lapangan
      </h1>
    `)
    $("#payment1").css("maxHeight", "0px");
  }
}

// kodingan untuk menampilkan detail pembayaran 
function payment() {
  const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];
  const container = $("#containerPayment");
  let hargaTotal = 6000

  container.empty();
  storedData.forEach((data) => {
    // Membuat elemen HTML dan menambahkannya ke container
    hargaTotal += data.harga
    container.append(`
            <div class="border-b mb-3 pb-3">
                <h2 class="text-xl font-semibold text-gray-800">${data.lapangan}</h2>
                <p class="text-gray-500">${data.lapanganDetail}</p>
                <p class="text-green-600 font-semibold mt-2">${data.tanggal} • ${data.jam}</p>
                
                <div class="mt-4 flex justify-between items-center">
                    <p class="text-gray-800 font-semibold">Harga Lapangan:</p>
                    <p class="text-gray-800 font-semibold text-right">Rp ${Intl.NumberFormat("id-ID").format(data.harga)} </p>
                </div>
            </div>
    `);
  });
  container.append(`
            <div class="mt-4 flex justify-between items-center">
                <p class="text-gray-800">Platform Fee:</p>
                <p class="text-gray-800 text-right">Rp 6,000</p>
            </div>
            <div class="mt-4 border-t pt-4 flex justify-between items-center">
                <div>    
                    <p class="text-gray-800">Total Bayar</p>
                    <p class="text-red-600 font-semibold">Bayar Penuh</p>
                </div>
                <p id="totalHarga" class="text-red-600 text-right text-xl font-bold">Rp ${Intl.NumberFormat("id-ID").format(hargaTotal)}</p>
            </div>
  `);
}

// kodingan untuk mengeksekusi pembayaran dan mengarahkan ke database
function pembayaranAkhir(){
  Swal.fire({
    title: "Apakah Anda yakin?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Bayar",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch('/get-session')
      .then(response => response.json())
      .then(data => {
          if (data.no_telp == '') {
            allertBayar('warning', 'harap melengkapi profil');
          }else{
            const storedData = JSON.parse(sessionStorage.getItem("selectedItems")) || [];

            $.ajax({
              url: "/pembayaran",
              method: "POST",
              data: {
                "nama": data.nama,
                "no_telp": data.no_telp,
                "email": data.email,
                "nama_lapangan": storedData[0]['lapangan'],
                "detail_lapangan": storedData[0]['lapanganDetail'],
                "tanggal": storedData[0]['tanggal'],
                "jam": storedData.map(item => item.jam).join(", "),
                "harga_lapangan": storedData[0]['harga'],
                "harga_total": parseInt($('#totalHarga').text().replace("Rp ", "").replace(".", ""))
              },
              success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Pembayaran Berhasil',
                    text: 'Klik tombol di bawah untuk melihat riwayat.',
                    confirmButtonText: 'Lihat Riwayat',
                    showCancelButton: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        sessionStorage.removeItem("selectedItems");
                        window.location.href = '/profile/riwayat';
                    }
                });

              }
            })
          }
      });
    }
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Profile

// kodingan untuk mengatur tampilan halaman profile
function profile() {
  const navProfile = $(".navProfile");
  const profilSections = $("#profil1, #profil2, #profil3");
  if (page == "riwayat") {
    profilSections.addClass("hidden");
    profilSections.eq(1).removeClass("hidden");
    navProfile.removeClass("text-white bg-[#0C359E]");
    navProfile.eq(1).addClass("text-white bg-[#0C359E]");
  }
  navProfile.each(function (index) {
    $(this).on("click", function () {
      // Tampilkan konten sesuai index tombol
      profilSections.addClass("hidden");
      profilSections.eq(index).removeClass("hidden");

      // Tambahkan highlight pada tombol aktif
      navProfile.removeClass("text-white bg-[#0C359E]");
      $(this).addClass("text-white bg-[#0C359E]");
    });
  });

  profileDetail()
}

// kodingan untuk mengatur tampilan detail dari halaman profile
function profileDetail() {
  $.ajax({
    url: '/get-booking',
    method: "POST",
    success: function(data) {
      $("#containerRiwayat").empty();
      $("#containerPemesanan").empty();
      if (data.length > 0) {
        const [selesai, belumSelesai] = [data.filter(item => item.status.toLowerCase() === 'selesai'), data.filter(item => item.status.toLowerCase() === 'belum selesai')];
        
        if (selesai.length > 0) {
          selesai.forEach(data => {
            $("#containerRiwayat").append(`
              <div class="mb-4 bg-white rounded-xl border border-gray-100 overflow-hidden p-6" style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;">
                <div class="space-y-4">
                  <!-- Booking ID -->
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="text-gray-500 text-sm">123456789XCVB-22102024</div>
                      <h2 class="text-4xl my-3 font-semibold text-black">Lapangan Smash 78</h2>
                      <!-- Timestamps -->
                      <div class="space-y-1 text-sm text-gray-600">
                        <div class="flex">
                          <span class="w-40">Tanggal Pemesanan</span>
                          <span>: ${new Date(data.tanggal_pemesanan.split("-").reverse().join("-")).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div class="flex">
                          <span class="w-40">Tanggal Booking</span>
                          <span>: ${new Date(data.tanggal.split("-").reverse().join("-")).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div class="flex">
                          <span class="w-40">Waktu Booking</span>
                          <span>: ${data.jam}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col items-end">
                      <div
                        class="bg-[#0C9E2E] text-white px-4 py-2 rounded-full text-xs"
                      >
                        Selesai
                      </div>
                      <div class="mt-2 font-semibold">${"Rp " + data.harga_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
                    </div>
                  </div>
                </div>
              </div>
            `)
          });
        }else{
          $("#containerRiwayat").append(`
            <h1 class="text-center mt-10">Anda belum pernah melakukan pemesanan</h1>
          `)
        }
        if (belumSelesai.length > 0) {
          belumSelesai.forEach(data => {
            $("#containerPemesanan").append(`
              <div class="mb-4 bg-white rounded-xl border border-gray-100 overflow-hidden p-6" style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;">
                <div class="space-y-4">
                  <!-- Booking ID -->
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="text-gray-500 text-sm">123456789XCVB-22102024</div>
                      <h2 class="text-4xl my-3 font-semibold text-black">Lapangan Smash 78</h2>
                      <!-- Timestamps -->
                      <div class="space-y-1 text-sm text-gray-600">
                        <div class="flex">
                          <span class="w-40">Tanggal Pemesanan</span>
                          <span>: ${new Date(data.tanggal_pemesanan.split("-").reverse().join("-")).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div class="flex">
                          <span class="w-40">Tanggal Booking</span>
                          <span>: ${new Date(data.tanggal.split("-").reverse().join("-")).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div class="flex">
                          <span class="w-40">Waktu Booking</span>
                          <span>: ${data.jam}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col items-end">
                      <div class="bg-[#0C9E2E] text-white px-4 py-2 rounded-full text-xs">
                        Terbayarkan
                      </div>
                      <div class="mt-2 font-semibold me-1">${"Rp " + data.harga_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
                    </div>
                  </div>
                </div>
              </div>
            `)
          });
        } else {
          $("#containerPemesanan").append(`
            <h1 class="text-center mt-10">Anda belum pernah melakukan pemesanan</h1>
        `)
        }
      }else{
          $("#containerRiwayat").append(`
              <h1 class="text-center mt-10">Anda belum pernah melakukan pemesanan</h1>
          `)
      }
    }
  })

  
}

function editProfile(){
  // Upload dan preview gambar
  $('#uploadButton').click(function() {
      $('#profileImage').click();
  });

  $('#profileImage').change(function(e) {
      const file = e.target.files[0];
      if (file) {
          // Validasi ukuran file (maksimal 2MB)
          if (file.size > 2 * 1024 * 1024) {
              Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Ukuran file terlalu besar! Maksimal 2MB'
              });
              return;
          }

          // Validasi tipe file
          if (!file.type.match('image.*')) {
              Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'File harus berupa gambar!'
              });
              return;
          }

          const reader = new FileReader();
          reader.onload = function(e) {
              $('#imagePreview').attr('src', e.target.result).show();
          }
          reader.readAsDataURL(file);
      }
  });

  // Handle form submission
  $('#profil1').submit(function(e) {
    e.preventDefault();

    // Validasi form
    if (!$('#profileImage').val()) {
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Silakan upload foto profile terlebih dahulu!'
        });
        return;
    }

    // Buat FormData untuk mengirimkan data termasuk file
    const formData = new FormData(this);

    // Tambahkan file gambar ke FormData
    const file = $('#profileImage')[0].files[0];
    if (file) {
        formData.append('profileImage', file);
    }

    for (const [key, value] of formData.entries()) {
      console.log(`Key: ${key}, Value: ${value}`);
    }

    // Kirim data ke Flask menggunakan AJAX
    $.ajax({
        url: '/profile/edit',
        method: 'POST',
        data: formData,
        processData: false, 
        contentType: false, 
        beforeSend: function() {
            Swal.fire({
                title: 'Mohon tunggu...',
                text: 'Sedang memproses data',
                didOpen: () => {
                    Swal.showLoading();
                },
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            });
        },
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data pengguna berhasil ditambahkan',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                $('#profil1')[0].reset();
                $('#imagePreview').hide();
                window.location.href = '/profile';
            });
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: err.responseJSON.message
            });
        }
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Daftar Lapangan

// kodingan untuk mencari lapangan berdasarkan kata kunci yang dicari
function cariLapangan() {
  const inputPencarian = document.getElementById("cari_lapangan");
  const hasilDiv = document.getElementById("daftar_cari_lapangan");
  const query = inputPencarian.value;

  const formData = new FormData();
  formData.append("query", query);

  fetch("/cari_lapangan", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      hasilDiv.innerHTML = "";

      if (data.length > 0) {
        data.forEach((lapangan) => {
          // Ambil harga terendah dari array lapangan
          const hargaMinimal = Math.min(
            ...lapangan.lapangan.map((l) => parseInt(l.harga))
          );
          const hargaMaximal = Math.max(
            ...lapangan.lapangan.map((l) => parseInt(l.harga))
          );

          const itemLapangan = document.createElement("div");
          itemLapangan.classList.add("item-lapangan");
          itemLapangan.innerHTML = `
            <div class="mb-8">
              <div class="overflow-hidden rounded-lg mb-4">
                <a href="/detail_lapangan/${lapangan.nama.replace(/ /g, "_")}">
                  <img class="aspect-[9/11] max-w-full transform transition-transform duration-300 hover:scale-110" 
                       src="/static/dist/img/gambarLapangan/${
                         lapangan.banner
                       }" alt="">
                </a>
              </div>
              <p class="font-semibold mb-0.5 text-base">${lapangan.nama}</p>
              <p class="font-medium text-gray-600">${lapangan.lokasi}</p>
              <p class="font-medium text-gray-600">Rp <span class="text-[#0C359E]">${Intl.NumberFormat(
                "id-ID"
              ).format(hargaMinimal)} - ${Intl.NumberFormat("id-ID").format(
            hargaMaximal
          )}</span>/jam</p>
            </div>
          `;
          hasilDiv.appendChild(itemLapangan);
        });
      } else {
        hasilDiv.innerHTML = "<p>Lapangan tidak ditemukan</p>";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      hasilDiv.innerHTML = "<p>Terjadi kesalahan</p>";
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Home

// kodingan untuk accordion yang berada di halaman home
function toggleAccordion(index) {
  const content = document.getElementById(`content-${index}`);
  const icon = document.getElementById(`icon-${index}`);
  const header = document.getElementById(`header-${index}`);
  
  // Toggle the content's max-height for smooth opening and closing
  if (content.style.maxHeight && content.style.maxHeight !== "0px") {
    content.style.maxHeight = "0";
    header.style.color = "black";
    icon.style.color = "black";
    icon.style.transform = "rotate(45deg)";
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    header.style.color = "#0C359E";
    icon.style.color = "#0C359E";
    icon.style.transform = "rotate(-45deg)";
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

// kodingan untuk membuat allert
function callAllert(type, pesan) {
  Swal.fire({
    text: pesan,
    icon: type,
  });
}

// kodingan untuk membuat allert yang sudah diatur khusus untuk pembayaran
function allertBayar(type, pesan) {
  Swal.fire({
    text: pesan,
    icon: type,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/profile';
    }
  });
}

// kodingan untuk membuat allert yang sudah diatur agar membuat konfirmasi sebelum logout
function confirmLogout(url) {
  Swal.fire({
    title: "Apakah Anda yakin ingin logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, logout",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = url;
    }
  });
}

// kodingan untuk membuat allert yang sudah diatur agar membuat konfirmasi sebelum mennghapus data
function konfirmasiHapus(url) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success",
      }).then(() => {
        window.location.href = url;
      });
    }
  });
}

// kodingan ketika avatar profile di klik memunculkan dropdown
function avatarClick() {
  const avatarButton = document.getElementById("avatarButton");
  const userDropdown = document.getElementById("userDropdown");
  let isOpen = false;

  if (avatarButton) {
  
    function resetDropdownStyles() {
      userDropdown.style.transition = "";
      userDropdown.classList.remove("opacity-0", "opacity-100", "translate-x-0");
      userDropdown.classList.add("translate-x-full");
    }

    function toggleDropdown(event) {
      event.stopPropagation();

      if (!isOpen) {
        // Reset styles terlebih dahulu
        resetDropdownStyles();

        // Show dropdown
        userDropdown.classList.remove("hidden");
        userDropdown.style.transition = "transform 0.3s ease-out";

        requestAnimationFrame(() => {
          userDropdown.classList.remove("translate-x-full");
          userDropdown.classList.add("translate-x-0");
        });
      } else {
        // Hide dengan fade
        userDropdown.style.transition = "opacity 0.3s ease-in-out";
        userDropdown.classList.add("opacity-0");

        setTimeout(() => {
          userDropdown.classList.add("hidden");
          resetDropdownStyles();
        }, 300);
      }

      isOpen = !isOpen;
    }

    // Toggle dropdown saat avatar diklik
    avatarButton.addEventListener("click", toggleDropdown);

    // Tutup dropdown saat klik di luar
    document.addEventListener("click", (event) => {
      if (
        isOpen &&
        !userDropdown.contains(event.target) &&
        !avatarButton.contains(event.target)
      ) {
        toggleDropdown(event);
      }
    });

    // Tutup dropdown saat tekan tombol Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) {
        toggleDropdown(event);
      }
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Universal

// kodingan untuk mengatur tampilan halaman home
function home() {
  const style = document.createElement("style");
  style.textContent = `
  .no-scroll {
    overflow: hidden !important;
    }
    `;
  document.head.appendChild(style);

  // Fungsi untuk menonaktifkan scroll
  function disableScroll() {
    document.body.classList.add("no-scroll");
    document.addEventListener("wheel", preventDefault, { passive: false });
    document.addEventListener("touchmove", preventDefault, { passive: false });
    document.addEventListener("keydown", preventDefaultForScrollKeys, {
      passive: false,
    });
  }

  // Fungsi untuk mengaktifkan scroll kembali
  function enableScroll() {
    document.body.classList.remove("no-scroll");
    document.removeEventListener("wheel", preventDefault);
    document.removeEventListener("touchmove", preventDefault);
    document.removeEventListener("keydown", preventDefaultForScrollKeys);
  }

  // Fungsi prevent default untuk event scroll
  function preventDefault(e) {
    e.preventDefault();
  }

  // Fungsi untuk mencegah scrolling menggunakan tombol keyboard
  function preventDefaultForScrollKeys(e) {
    const keys = {
      ArrowUp: 1,
      ArrowDown: 1,
      Space: 1,
      PageUp: 1,
      PageDown: 1,
      Home: 1,
      End: 1,
    };

    if (keys[e.key]) {
      preventDefault(e);
      return false;
    }
  }

  // Nonaktifkan scroll
  disableScroll();
      
  // Aktifkan kembali scroll setelah 6 detik
  setTimeout(() => {
    enableScroll()
    swiper1()
  }, 6000);
}
//////////////////////////////////////////////////////////////////////////////////////////////

// admin
// kodingan untuk mengatur tampilan halaman admin 
function admin() {

  // TOGGLE SIDEBAR
  const menuBar = document.querySelector('#content nav .bx.bx-menu');
  const sidebar = document.getElementById('sidebar');

  menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
  })

  if(window.innerWidth < 768) {
    sidebar.classList.add('hide');
  }

  const switchMode = document.getElementById('switch-mode');

  switchMode.addEventListener('change', function () {
    if(this.checked) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  })
}

// kodingan untuk mengatur tampilan halaman admin bagian home
function adminHome(){
  const container = document.querySelector("tbody") 
  // console.log(booking)
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Lapangan

let editMode = false;

// Function to add court input fields
function addCourtInput() {
    courtCount++;
    const courtDiv = document.createElement('div');
    courtDiv.className = 'form-group court-input';
    courtDiv.setAttribute('data-court-id', courtCount);
    
    courtDiv.innerHTML = `
        <div class="court-row">
            <input type="text" placeholder="Nama Lapangan" class="court-name form-input" required>
            <input type="number" placeholder="Harga" class="court-price form-input" required min="0">
            <button type="button" class="trash-icon" onclick="removeCourtInput(${courtCount})">
                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.75 6.16667C2.75 5.70644 3.09538 5.33335 3.52143 5.33335L6.18567 5.3329C6.71502 5.31841 7.18202 4.95482 7.36214 4.41691C7.36688 4.40277 7.37232 4.38532 7.39185 4.32203L7.50665 3.94993C7.5769 3.72179 7.6381 3.52303 7.72375 3.34536C8.06209 2.64349 8.68808 2.1561 9.41147 2.03132C9.59457 1.99973 9.78848 1.99987 10.0111 2.00002H13.4891C13.7117 1.99987 13.9056 1.99973 14.0887 2.03132C14.8121 2.1561 15.4381 2.64349 15.7764 3.34536C15.8621 3.52303 15.9233 3.72179 15.9935 3.94993L16.1083 4.32203C16.1279 4.38532 16.1333 4.40277 16.138 4.41691C16.3182 4.95482 16.8778 5.31886 17.4071 5.33335H19.9786C20.4046 5.33335 20.75 5.70644 20.75 6.16667C20.75 6.62691 20.4046 7 19.9786 7H3.52143C3.09538 7 2.75 6.62691 2.75 6.16667Z" fill="red"/>
                  <path d="M11.6068 21.9998H12.3937C15.1012 21.9998 16.4549 21.9998 17.3351 21.1366C18.2153 20.2734 18.3054 18.8575 18.4855 16.0256L18.745 11.945C18.8427 10.4085 18.8916 9.6402 18.45 9.15335C18.0084 8.6665 17.2628 8.6665 15.7714 8.6665H8.22905C6.73771 8.6665 5.99204 8.6665 5.55047 9.15335C5.10891 9.6402 5.15777 10.4085 5.25549 11.945L5.515 16.0256C5.6951 18.8575 5.78515 20.2734 6.66534 21.1366C7.54553 21.9998 8.89927 21.9998 11.6068 21.9998Z" fill="red"/>
                </svg>
            </button>
        </div>
    `;
    document.getElementById('courtInputs').appendChild(courtDiv);
}

// Function to remove court input
function removeCourtInput(id) {
    const courtDiv = document.querySelector(`[data-court-id="${id}"]`);
    if (courtDiv) {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Data lapangan akan dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                courtDiv.remove();
            }
        });
    }
}

// kodingan untuk menghapus data lapangan
function adminLapanganHapus(element) {
  Swal.fire({
    title: 'Apakah anda yakin?',
    text: "Data lapangan akan dihapus!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    $.ajax({
      url: "/admin/lapangan/hapus",
      method: "POST",
      data: {
        "id": element.getAttribute('data-id')
      },
      success: function () {
        window.location.href = '/admin/lapangan';
      }
    })
  });
}

function editClick(element) {
  adminEditLapangan(element.getAttribute('data-id'))
  editMode = true
  console.log(editMode)
}

function adminEditLapangan(kode) {
  courtCount = 0;
  const userForm = document.getElementById('userForm');
  const profileImage = document.getElementById('profileImageLapangan');

  $('#userForm')[0].reset();
  $('#courtInputs').html('')
  $('#imagePreview').attr('src', '')
  $('#modalContainer').fadeIn(300);
  $('body').css('overflow', 'hidden'); // Prevent body scroll when modal is open

  $.ajax({
    url: '/get-lapangan',
    method: 'GET',
    data: { id: kode },
    success: function(dataLapangan) {
      $('#imagePreview').attr('src', `/static/dist/img/gambarLapangan/${dataLapangan.banner}`).show();
      $('#nama').val(dataLapangan.nama);
      $('#lokasi').val(dataLapangan.lokasi);
      $('#kontak').val(dataLapangan.kontak);
      
      // Add courts dynamically
      dataLapangan.lapangan.forEach(data => {
        courtCount++;
        const courtDiv = document.createElement('div');
        courtDiv.className = 'form-group court-input';
        courtDiv.setAttribute('data-court-id', courtCount);
        
        courtDiv.innerHTML = `
            <div class="court-row">
                <input type="text" value="${data.namaLapangan}" placeholder="Nama Lapangan" class="court-name form-input" required>
                <input type="number"  value="${data.harga}" placeholder="Harga" class="court-price form-input" required min="0">
                <button type="button" class="trash-icon" onclick="removeCourtInput(${courtCount})">
                    <svg width="25px" height="25px" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.75 6.16667C2.75 5.70644 3.09538 5.33335 3.52143 5.33335L6.18567 5.3329C6.71502 5.31841 7.18202 4.95482 7.36214 4.41691C7.36688 4.40277 7.37232 4.38532 7.39185 4.32203L7.50665 3.94993C7.5769 3.72179 7.6381 3.52303 7.72375 3.34536C8.06209 2.64349 8.68808 2.1561 9.41147 2.03132C9.59457 1.99973 9.78848 1.99987 10.0111 2.00002H13.4891C13.7117 1.99987 13.9056 1.99973 14.0887 2.03132C14.8121 2.1561 15.4381 2.64349 15.7764 3.34536C15.8621 3.52303 15.9233 3.72179 15.9935 3.94993L16.1083 4.32203C16.1279 4.38532 16.1333 4.40277 16.138 4.41691C16.3182 4.95482 16.8778 5.31886 17.4071 5.33335H19.9786C20.4046 5.33335 20.75 5.70644 20.75 6.16667C20.75 6.62691 20.4046 7 19.9786 7H3.52143C3.09538 7 2.75 6.62691 2.75 6.16667Z" fill="red"/>
                      <path d="M11.6068 21.9998H12.3937C15.1012 21.9998 16.4549 21.9998 17.3351 21.1366C18.2153 20.2734 18.3054 18.8575 18.4855 16.0256L18.745 11.945C18.8427 10.4085 18.8916 9.6402 18.45 9.15335C18.0084 8.6665 17.2628 8.6665 15.7714 8.6665H8.22905C6.73771 8.6665 5.99204 8.6665 5.55047 9.15335C5.10891 9.6402 5.15777 10.4085 5.25549 11.945L5.515 16.0256C5.6951 18.8575 5.78515 20.2734 6.66534 21.1366C7.54553 21.9998 8.89927 21.9998 11.6068 21.9998Z" fill="red"/>
                    </svg>
                </button>
            </div>
        `;
        document.getElementById('courtInputs').appendChild(courtDiv);
      });
    }
  });  

  // Collect court data
  function getCourtData() {
      const courts = [];
      document.querySelectorAll('.court-input').forEach(court => {
          courts.push({
              namaLapangan: court.querySelector('.court-name').value,
              harga: parseInt(court.querySelector('.court-price').value)
          });
      });
      return courts;
  }

  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const courts = getCourtData();
    if (courts.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Silakan tambahkan minimal satu lapangan!'
        });
        return;
    }

    const formData = new FormData(userForm);
    formData.append('courts', JSON.stringify(courts));
    
    if (profileImage.files[0]) {
        formData.append('profileImageLapangan', profileImage.files[0]);
      }
     formData.append('id', kode);
      
    

    $.ajax({
      url: '/admin/lapangan/edit',
      method: 'POST',
      data: formData,
      processData: false, 
      contentType: false, 
      beforeSend: function() {
          Swal.fire({
              title: 'Mohon tunggu...',
              text: 'Sedang memproses data',
              didOpen: () => {
                  Swal.showLoading();
              },
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false
          });
      },
      success: function() {
          Swal.fire({
              icon: 'success',
              title: 'Berhasil!',
              text: 'Data pengguna berhasil diubah!',
              showConfirmButton: false,
              timer: 1500
          }).then(() => {
              $('#userForm')[0].reset();
              $('#imagePreview').hide();
              window.location.href = '/admin/lapangan';
          });
      },
      error: function(err) {
          // Swal.fire({
          //     icon: 'error',
          //     title: 'Gagal!',
          //     text: err.responseJSON.message
          // });
          console.log(err)
      }
    });
  });
};


// kodingan untuk menambahkan data lapangan
function adminLapanganTambah() {
  courtCount = 0;
  const modalContainer = document.getElementById('modalContainer');
  const userForm = document.getElementById('userForm');
  const imagePreview = document.getElementById('imagePreview');
  const profileImage = document.getElementById('profileImageLapangan');


  $('#openModalBtn').click(function() {
    $('#userForm')[0].reset();
    $('#courtInputs').html('')
    $('#imagePreview').attr('src', '')
    $('#modalContainer').fadeIn(300);
    $('body').css('overflow', 'hidden'); // Prevent body scroll when modal is open
  });
  
  // Handle image upload
  function handleImageUpload(file) {
      if (!file) return;
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ukuran file terlalu besar! Maksimal 2MB'
          });
          return false;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'File harus berupa gambar!'
          });
          return false;
      }
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
      return true;
  }
  
  // Collect court data
  function getCourtData() {
      const courts = [];
      document.querySelectorAll('.court-input').forEach(court => {
          courts.push({
              namaLapangan: court.querySelector('.court-name').value,
              harga: parseInt(court.querySelector('.court-price').value)
          });
      });
      return courts;
  }

  document.getElementById('uploadButton').addEventListener('click', () => {
      profileImage.click();
  });
  
  profileImage.addEventListener('change', (e) => {
      handleImageUpload(e.target.files[0]);
  });
  
    // Form submission
    userForm.addEventListener('submit', async (e) => {
      if (editMode == false) {
        
        e.preventDefault();
        
        if (!profileImage.files[0] && !editMode) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Silakan upload foto profile terlebih dahulu!'
            });
            return;
        }
        
        const courts = getCourtData();
        if (courts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Silakan tambahkan minimal satu lapangan!'
            });
            return;
        }
  
        const formData = new FormData(userForm);
        formData.append('courts', JSON.stringify(courts));
        
        if (profileImage.files[0]) {
            formData.append('profileImageLapangan', profileImage.files[0]);
        }
        
        for (const [key, value] of formData.entries()) {
          console.log(`Key: ${key}, Value: ${value}`);
        }
  
        $.ajax({
          url: '/admin/lapangan/tambah',
          method: 'POST',
          data: formData,
          processData: false, 
          contentType: false, 
          beforeSend: function() {
              Swal.fire({
                  title: 'Mohon tunggu...',
                  text: 'Sedang memproses data',
                  didOpen: () => {
                      Swal.showLoading();
                  },
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  allowEnterKey: false
              });
          },
          success: function() {
              Swal.fire({
                  icon: 'success',
                  title: 'Berhasil!',
                  text: 'Data pengguna berhasil ditambahkan',
                  showConfirmButton: false,
                  timer: 1500
              }).then(() => {
                  $('#userForm')[0].reset();
                  $('#imagePreview').hide();
                  window.location.href = '/admin/lapangan';
              });
          },
          error: function(err) {
              Swal.fire({
                  icon: 'error',
                  title: 'Gagal!',
                  text: err.responseJSON.message
              });
          }
      });
    }
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Pengguna

// kodingan untuk menambahkan data pengguna
function adminPenggunaTambah() {
  $('#openModalBtn').click(function() {
      $('#modalContainer').fadeIn(300);
      $('body').css('overflow', 'hidden'); // Prevent body scroll when modal is open
  });

  // Tutup modal
  function closeModal() {
      $('#modalContainer').fadeOut(300);
      $('body').css('overflow', ''); // Restore body scroll
  }

  $('#closeModalBtn').click(function() {
      closeModal();
  });

  // Tutup modal ketika klik di luar
  $('#modalContainer').click(function(event) {
      if (event.target === this) {
          closeModal();
      }
  });

  // Upload dan preview gambar
  $('#uploadButton').click(function() {
      $('#profileImage').click();
  });

  $('#profileImage').change(function(e) {
      const file = e.target.files[0];
      if (file) {
          // Validasi ukuran file (maksimal 2MB)
          if (file.size > 2 * 1024 * 1024) {
              Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Ukuran file terlalu besar! Maksimal 2MB'
              });
              return;
          }

          // Validasi tipe file
          if (!file.type.match('image.*')) {
              Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'File harus berupa gambar!'
              });
              return;
          }

          const reader = new FileReader();
          reader.onload = function(e) {
              $('#imagePreview').attr('src', e.target.result).show();
          }
          reader.readAsDataURL(file);
      }
  });

  // Handle form submission
  $('#userForm').submit(function(e) {
    e.preventDefault();

    // Validasi form
    if (!$('#profileImage').val()) {
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Silakan upload foto profile terlebih dahulu!'
        });
        return;
    }

    // Buat FormData untuk mengirimkan data termasuk file
    const formData = new FormData(this);

    // Tambahkan file gambar ke FormData
    const file = $('#profileImage')[0].files[0];
    if (file) {
        formData.append('profileImage', file);
    }

    // Kirim data ke Flask menggunakan AJAX
    $.ajax({
        url: '/admin/pengguna/tambah',
        method: 'POST',
        data: formData,
        processData: false, 
        contentType: false, 
        beforeSend: function() {
            Swal.fire({
                title: 'Mohon tunggu...',
                text: 'Sedang memproses data',
                didOpen: () => {
                    Swal.showLoading();
                },
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            });
        },
        success: function(response) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data pengguna berhasil ditambahkan',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                $('#userForm')[0].reset();
                $('#imagePreview').hide();
                window.location.href = '/admin/pengguna';
            });
        },
        error: function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: err.responseJSON.message
            });
        }
    });
  });
}

// kodingan untuk menghapus data pengguna
function adminPenggunaHapus(element) {
  $.ajax({
    url: "/admin/pengguna/hapus",
    method: "POST",
    data: {
      "id": element.getAttribute('data-id')
    },
    success: function () {
      window.location.href = '/admin/pengguna';
    }
  })
}

//////////////////////////////////////////////////////////////////////////////////////////////

// Pemesanan

// kodingan untuk menyelesaikan data pemesanan lapangan
function pemesananAdmin(element) {
  $.ajax({
    url: "/admin/pemesanan",
    method: "POST",
    data: {
      "id": element.getAttribute('data-id')
    },
    success: function () {
      window.location.href = '/admin/pemesanan';
    }
  })
}

