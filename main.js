import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// 1. LER E DESCRIPTOGRAFAR
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dgFileName = file.name;
    statusText.innerText = "Descriptografando o save...";
    statusText.style.color = "#58a6ff";

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
        const jsonPuro = Decode(bytes); 
        const objetoJson = JSON.parse(jsonPuro);
        
        dgSaveOriginalTexto = JSON.stringify(objetoJson, null, 2); 
        manualEditor.value = dgSaveOriginalTexto;
        
        statusText.innerText = "✅ Save carregado! Pode editar manualmente ou usar os botões.";
        statusText.style.color = "#7ee787";
        editorBox.style.display = "block"; 
    } catch (erro) {
        statusText.innerText = "❌ Erro ao ler. Arquivo corrompido ou inválido.";
        statusText.style.color = "#ff7b72";
        console.error("Erro Decode:", erro);
    }
});

// FUNÇÃO PARA ATUALIZAR O TEXTAREA COM OS PRESETS
function aplicarPreset(modificarObjeto) {
    try {
        let saveAtual = JSON.parse(manualEditor.value); 
        modificarObjeto(saveAtual); 
        manualEditor.value = JSON.stringify(saveAtual, null, 2); 
        alert("Preset aplicado com sucesso pela DgWeb Dev!");
    } catch (e) {
        alert("❌ Erro de sintaxe no editor manual. Clique em 'Resetar Alterações' e tente novamente.");
    }
}

// 2. PRESETS DA DGWEB
document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarPreset((save) => {
        // Libera os 40 amuletos, tira o status de "novo" e coloca o custo no 0
        for(let i = 1; i <= 40; i++) {
            save[`gotCharm_${i}`] = true;
            save[`newCharm_${i}`] = false;
            save[`charmCost_${i}`] = 0;
        }
        // Dá espaço infinito para equipar todos de uma vez
        save["charmSlots"] = 40; 
        
        // Torna os amuletos frágeis inquebráveis
        save["fragileHealth_unbreakable"] = true;
        save["fragileGreed_unbreakable"] = true;
        save["fragileStrength_unbreakable"] = true;
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarPreset((save) => {
        if(save.hasOwnProperty('nailDamage')) save.nailDamage = 9999;
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarPreset((save) => {
        if(save.hasOwnProperty('maxHealthBase')) save.maxHealthBase = 99;
    });
});

document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarPreset((save) => {
        if(save.hasOwnProperty('geo')) save.geo = 9999999;
    });
});

// 3. BOTÃO DE RESET
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Tem certeza? Isso vai desfazer TODAS as edições e voltar ao save original que você upou.")) {
        manualEditor.value = dgSaveOriginalTexto;
    }
});

// 4. DOWNLOADS
document.getElementById('btnDownTexto').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); 
        DownloadData(manualEditor.value, dgFileName + ".txt");
    } catch (e) {
        alert("❌ Erro no JSON. Você apagou alguma aspa ou vírgula no editor.");
    }
});

document.getElementById('btnDownJogo').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); 
        const novosBytes = Encode(manualEditor.value); 
        DownloadData(novosBytes, dgFileName);
    } catch (e) {
        alert("❌ Erro no JSON. Corrija o texto antes de criptografar para o jogo.");
    }
});
