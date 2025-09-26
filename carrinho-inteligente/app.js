
const produtos = []
let total = 0

const video = document.getElementById('camera')

// Acessa a câmera do dispositivo
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
.then(stream => {
    video.srcObject = stream
})
.catch(err => {
    alert('Erro ao acessar a câmera: ' + err)
})

// Função parra atualizar carrinho
function adicionarProduto(valor) {
    produtos.push(valor)
    total += valor
    document.getElementById('produtos').innerHTML = produtos.map(v => `<li>R$ ${v.toFixed(2)}</li>`).join('')
    document.getElementById('total').innerText = total.toFixed(2)
}

// Captura frame da câmera e rconhece preço com OCR 
document.getElementById('tirarFotoBtn').addEventListener('click', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const { data: { text } } = await Tesseract.recognize(canvas, 'por')
    console.log('Texto reconhecido:', text)
    
    // Regex para capturar preços tipo 2,50 ou 3.50
    const match = text.match(/(\d+[.,]\d{2})/)
    if (match) {
        let valor = parseFloat(match[1].replace(',', '.'))
        adicionarProduto(valor)
    } else {
        alert('Não foi possível identificar preço')
    }
})
