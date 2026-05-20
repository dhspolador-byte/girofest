const GOOGLE_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

    const form = document.getElementById("registrationForm");
    const statusBox = document.getElementById("formStatus");

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      statusBox.className = "status";
      statusBox.textContent = "";

      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("COLE_AQUI")) {
        statusBox.className = "status error";
        statusBox.textContent = "Configure a URL do Google Apps Script antes de enviar inscrições.";
        return;
      }

      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";

      try {
        const formData = new FormData(form);
        const file = formData.get("comprovante");

        const payload = {};
        formData.forEach((value, key) => {
          if (key !== "comprovante") payload[key] = value;
        });

        if (file && file.size > 0) {
          payload.comprovante_nome = file.name;
          payload.comprovante_tipo = file.type;
          payload.comprovante_base64 = await fileToBase64(file);
        }

        payload.data_envio = new Date().toISOString();
        payload.evento = "GiroFest 2026";

        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.ok) {
          throw new Error(result.message || "Erro ao enviar inscrição.");
        }

        statusBox.className = "status ok";
        statusBox.textContent = "Inscrição enviada com sucesso! A organização irá validar o pagamento e confirmar sua participação.";
        form.reset();
      } catch (error) {
        statusBox.className = "status error";
        statusBox.textContent = "Não foi possível enviar a inscrição. Verifique os dados e tente novamente. Detalhe: " + error.message;
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar inscrição";
      }
    });