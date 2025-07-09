async function getDiscordUser(token) {
      const res = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return await res.json();
    }

    async function handleAuth() {
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.slice(1));
        const token = params.get("access_token");

        try {
          const userData = await getDiscordUser(token);
          localStorage.setItem("discordUser", JSON.stringify(userData));
          localStorage.setItem("discordToken", token);
          window.location.hash = "";
          location.reload();
        } catch (error) {
          alert("No se pudo autenticar con Discord.");
        }
      } else {
        const storedUser = localStorage.getItem("discordUser");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          document.querySelector(".login-btn").style.display = "none";
        }
      }
    }

    function loginWithDiscord() {
      window.location.href = "https://discord.com/oauth2/authorize?client_id=1377488695799582811&response_type=token&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Findex.html&scope=identify";
    }

    handleAuth();

// FUNCIONES ESTABLES QUE NO AFECTAN EL LAYOUT
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      sidebar.classList.add("open");
      overlay.classList.add("active");
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    sidebar.classList.remove("open");
    sidebar.classList.add("closing");
    overlay.classList.remove("active");

    setTimeout(() => {
      sidebar.classList.remove("closing");
    }, 300);
  }

  function logout() {
    localStorage.removeItem("discordUser");
    localStorage.removeItem("discordToken");
    location.reload();
  }

  function loginWithDiscord() {
    const clientId = "1377488695799582811";
    const redirectUri = encodeURIComponent("http://127.0.0.1:3000/apelar.html");
    const scope = "identify";
    const responseType = "token";
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  async function getDiscordUser(token) {
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  }

  async function handleAuth() {
    // Mostrar botón de login si no hay usuario
    if (!localStorage.getItem("discordUser")) {
      document.getElementById("sidebarLogin").style.display = "block";
    }
    
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get("access_token");

      try {
        const userData = await getDiscordUser(token);
        localStorage.setItem("discordUser", JSON.stringify(userData));
        localStorage.setItem("discordToken", token);
        window.location.hash = "";
        location.reload();
      } catch (error) {
        alert("No se pudo autenticar con Discord.");
      }
    } else {
      const storedUser = localStorage.getItem("discordUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const avatarFormat = user.avatar?.startsWith("a_") ? "gif" : "png";
        const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarFormat}`;
        const bannerURL = user.banner
          ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "png"}?size=512`
          : "https://i.pinimg.com/736x/0c/eb/2d/0ceb2d1ba310dbeb1fc7fe9286b165ff.jpg";

        document.getElementById("sidebarAvatar").src = avatarURL;
        document.getElementById("sidebarUsername").textContent = user.username;
        document.getElementById("sidebarBanner").style.backgroundImage = `url('${bannerURL}')`;
        document.getElementById("sidebarLogout").style.display = "block";
        document.getElementById("sidebarLogin").style.display = "none";
      }
    }
  }

  // INICIALIZACIÓN ESTABLE
  window.addEventListener('DOMContentLoaded', () => {
    handleAuth();
    
    // Manejar el envío del formulario de apelación
    document.getElementById("formulario").addEventListener("submit", e => {
      e.preventDefault();

      // Verificar si el usuario está autenticado
      const storedUser = localStorage.getItem("discordUser");
      if (!storedUser) {
        alert("❌ Debes iniciar sesión con Discord antes de enviar una apelación");
        return;
      }

      const user = JSON.parse(storedUser);
      const correo = document.getElementById("correo").value;
      const razonBan = document.getElementById("razon_ban").value;
      const apelacion = document.getElementById("apelacion").value;

      // Validar campos requeridos
      if (!correo || !razonBan || !apelacion) {
        alert("❌ Completa todos los campos antes de enviar la apelación");
        return;
      }

      // Obtener avatar del usuario
      const avatarFormat = user.avatar.startsWith("a_") ? "gif" : "png";
      const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarFormat}`;

      // Enviar apelación al webhook de Discord
      fetch("https://discord.com/api/webhooks/1392343229856223445/4rN3E1-Hp5grQT26aZFqTTEUtf_nFp7HjTfy-Lr9njlkyYK3SIfntCR_ZwGChUbAGJC5", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "content": "Ha llegado una nueva apelación de baneo <:Paimonasesina:970216558897025064>",
          embeds: [
            {
              title: "Nueva apelación de ban",
              color: 0xed4245,
              fields: [
                { name: "👤 Usuario", value: `${user.username} (ID: ${user.id})`, inline: false },
                { name: "📧 Correo", value: correo || "No proporcionado", inline: true },
                { name: "🔴 Razón del baneo", value: razonBan || "No especificada", inline: false },
                { name: "📝 Apelación", value: apelacion || "No especificada", inline: false }
              ],
              thumbnail: { url: avatarUrl },
              footer: { text: `ID del usuario: ${user.id}` },
              timestamp: new Date().toISOString()
            }
          ]
        })
      }).then(() => {
        // Mostrar mensaje de éxito
        document.getElementById("formulario").style.display = "none";
        document.getElementById("decoracion").style.display = "none";

        const mensajeGracias = document.createElement("div");
        mensajeGracias.style.textAlign = "center";
        mensajeGracias.style.marginTop = "2rem";
        mensajeGracias.innerHTML = `
          <h2>¡Apelación enviada con éxito!</h2>
          <p>Tu solicitud ha sido recibida y será revisada por nuestro equipo.</p>
          <img src="https://s3.getstickerpack.com/storage/uploads/sticker-pack/genshin-impact-paimon-1/sticker_13.png?647046bbdaac1ca3728c9de02ad210dc&d=200x200" 
               alt="Paimon Gracias" 
               style="margin-top: 1rem; width: 200px; height: 200px;" />
        `;

        document.getElementById("contenido").appendChild(mensajeGracias);
      }).catch(error => {
        alert("❌ Ocurrió un error al enviar tu apelación. Por favor intenta nuevamente.");
        console.error("Error al enviar apelación:", error);
      });
    });

    // Resaltar enlace activo
    const path = window.location.pathname.split("/").pop();
    if (path === "postulacion.html") {
      document.getElementById("link-postulacion").classList.add("active");
    } else if (path === "apelar.html") {
      document.getElementById("link-apelar").classList.add("active");
    }
  });
