function generarURL() {
  const meta = document.getElementById("metaInput").value;
  if (!meta || parseInt(meta) <= 0) {
    alert("Ingresá un número válido.");
    return;
  }
  const url = `${window.location.origin}/widget.html?meta=${meta}`;
  document.getElementById("resultado").innerHTML = `
    <strong>URL generada:</strong> <br>
    <a href="${url}" target="_blank">${url}</a>
  `;
}
