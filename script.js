const $ = selector => document.querySelector(selector);

function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function primerNombre(texto = "") {
  return normalizar(texto).split(" ")[0];
}

function buscarInvitado(nombre) {
  const completo = normalizar(nombre);
  const primero = primerNombre(nombre);

  return INVITADOS.filter(invitado => {
    const invitadoCompleto = normalizar(invitado);
    const invitadoPrimero = primerNombre(invitado);

    return invitadoCompleto === completo ||
           invitadoPrimero === completo ||
           invitadoPrimero === primero;
  });
}

function mostrarPantalla(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

function cargarDatos() {
  document.querySelectorAll("[data-evento]").forEach(element => {
    element.textContent = EVENTO[element.dataset.evento] || "";
  });

  document.querySelectorAll("[data-padre]").forEach(element => {
    element.textContent = EVENTO.padres[Number(element.dataset.padre)] || "";
  });

  $("#mapsButton").href = EVENTO.mapsUrl;

  EVENTO.regalos.forEach(regalo => {
    const item = document.createElement("div");
    item.textContent = `🍯 ${regalo}`;
    $("#giftList").appendChild(item);
  });
}

function iniciarContador() {
  const destino = new Date(EVENTO.fechaISO).getTime();

  const actualizar = () => {
    const diferencia = Math.max(0, destino - Date.now());

    $("#days").textContent =
      String(Math.floor(diferencia / 86400000)).padStart(2,"0");

    $("#hours").textContent =
      String(Math.floor((diferencia % 86400000) / 3600000)).padStart(2,"0");

    $("#minutes").textContent =
      String(Math.floor((diferencia % 3600000) / 60000)).padStart(2,"0");

    $("#seconds").textContent =
      String(Math.floor((diferencia % 60000) / 1000)).padStart(2,"0");
  };

  actualizar();
  setInterval(actualizar,1000);
}

window.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  iniciarContador();

  setTimeout(() => $("#loader").style.opacity = "0", 1100);
  setTimeout(() => $("#loader").style.display = "none", 1700);

  $("#openAccess").addEventListener("click", () => {
    mostrarPantalla("acceso");
  });

  $("#guestForm").addEventListener("submit", event => {
    event.preventDefault();

    const nombre = $("#guestName").value.trim();
    const coincidencias = buscarInvitado(nombre);

    if (!nombre) {
      $("#accessMessage").textContent = "Escribe tu nombre para continuar.";
      return;
    }

    if (!coincidencias.length) {
      $("#accessMessage").textContent =
        "No encontramos ese nombre en la lista.";
      return;
    }

    const invitado = coincidencias[0];

    $("#accessMessage").textContent = "";
    $("#welcomeName").textContent =
      `¡Hola, ${invitado.split(" ")[0]}! 💛`;

    const textoWhatsApp = encodeURIComponent(
      `Hola, soy ${invitado}. Confirmo mi asistencia al Baby Shower de ${EVENTO.nombreCorto}.`
    );

    $("#whatsappButton").href =
      `https://wa.me/${EVENTO.whatsapp}?text=${textoWhatsApp}`;

    mostrarPantalla("invitacion");
  });

  $("#giftButton").addEventListener("click", () => {
    $("#giftModal").classList.add("open");
    $("#giftModal").setAttribute("aria-hidden","false");
  });

  $("#closeGiftModal").addEventListener("click", () => {
    $("#giftModal").classList.remove("open");
    $("#giftModal").setAttribute("aria-hidden","true");
  });

  $("#giftModal").addEventListener("click", event => {
    if (event.target.id === "giftModal") {
      $("#closeGiftModal").click();
    }
  });
});


/* ===== Premium 1.0: parallax suave, sin interacción de personajes ===== */
window.addEventListener("pointermove", event => {
  if (window.matchMedia("(max-width: 700px)").matches) return;

  const x = (event.clientX / window.innerWidth - 0.5);
  const y = (event.clientY / window.innerHeight - 0.5);

  const items = [
    [".page1-main", 10],
    [".page1-tigger", 16],
    [".page1-piglet", 13],
    [".page2-main", 9],
    [".page3-header", 7],
    [".page3-bottom", 5]
  ];

  items.forEach(([selector, strength]) => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.style.transform =
      `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  });
});

window.addEventListener("pointerleave", () => {
  [
    ".page1-main",
    ".page1-tigger",
    ".page1-piglet",
    ".page2-main",
    ".page3-header",
    ".page3-bottom"
  ].forEach(selector => {
    const element = document.querySelector(selector);
    if (element) element.style.transform = "translate3d(0,0,0)";
  });
});
