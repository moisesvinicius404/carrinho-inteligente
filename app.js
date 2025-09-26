const produtos = [];
let total = 0;

const video = document.getElementById("camera");
const listaProdutos = document.getElementById("produtos");
const totalElement = document.getElementById("total");
const tirarFotoBtn = document.getElementById("tirarFotoBtn");

// ✅ Função para iniciar câmera com foco automático e ambiente traseira
async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        focusMode: "continuous", // tenta manter o foco automático
      },
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Erro ao acessar a câmera: " + err.message);
  }
}

// ✅ Atualiza o carrinho visualmente
function atualizarCarrinho() {
  listaProdutos.innerHTML = produtos
    .map((v, i) => `<li class="flex justify-between text-green-400">
        <span>Produto ${i + 1}</span> 
        <span>R$ ${v.toFixed(2)}</span>
      </li>`)
    .join("");
  totalElement.innerText = total.toFixed(2);
}

// ✅ Adiciona produto com verificação
function adicionarProduto(valor) {
  if (isNaN(valor) || valor <= 0) {
    alert("Preço inválido!");
    return;
  }

  // Evita duplicar valores consecutivos iguais (erros de leitura)
  if (produtos[produtos.length - 1] === valor) {
    alert("Esse valor já foi adicionado!");
    return;
  }

  produtos.push(valor);
  total += valor;
  atualizarCarrinho();
}

// ✅ Captura imagem e reconhece preço
tirarFotoBtn.addEventListener("click", async () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  // 🔹 Captura apenas a região central da tela (para evitar ruídos)
  const corteX = canvas.width * 0.25;
  const corteY = canvas.height * 0.35;
  const corteLargura = canvas.width * 0.5;
  const corteAltura = canvas.height * 0.3;

  ctx.drawImage(
    video,
    corteX,
    corteY,
    corteLargura,
    corteAltura,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 🔹 Mostra indicador visual (pode adicionar overlay no HTML se quiser)
  tirarFotoBtn.disabled = true;
  tirarFotoBtn.innerText = "Lendo preço...";

  try {
    const { data: { text } } = await Tesseract.recognize(canvas, "por");
    console.log("Texto reconhecido:", text);

    // Regex mais precisa (aceita 1.234,56 ou 2,50)
    const match = text.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/);

    if (match) {
      const valor = parseFloat(match[1].replace(".", "").replace(",", "."));
      adicionarProduto(valor);
    } else {
      alert("Não foi possível identificar o preço. Tente aproximar a câmera.");
    }
  } catch (err) {
    alert("Erro ao processar imagem: " + err.message);
  } finally {
    tirarFotoBtn.disabled = false;
    tirarFotoBtn.innerText = "Tirar foto";
  }
});

// Inicializa tudo
iniciarCamera();
