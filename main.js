import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// FUNÇÃO PARA ATUALIZAR A COR E O TEXTO DOS BOTÕES
function atualizarBotoes() {
    try {
        let obj = JSON.parse(manualEditor.value);
        let alvo = obj.playerData ? obj.playerData : obj;

        const btnAmuletos = document.getElementById('btnAmuletos');
        const btnHitKill = document.getElementById('btnHitKill');
        const btnVida = document.getElementById('btnVida');
        const btnDinheiro = document.getElementById('btnDinheiro');

        // Dinheiro
        if (alvo.geo > 5000) {
            btnDinheiro.className = "btn-reset";
            btnDinheiro.innerText = "🔄 Reverter Dinheiro";
        } else {
            btnDinheiro.className = "btn-preset";
            btnDinheiro.innerText = "💰 Geo Infinito";
        }

        // Vida
        if (alvo.maxHealthBase > 20) {
            btnVida.className = "btn-reset";
            btnVida.innerText = "🔄 Reverter Vida";
        } else {
            btnVida.className = "btn-preset";
            btnVida.innerText = "❤️ Vida Máxima";
        }

        // Hit Kill
        if (alvo.nailDamage >= 2500) {
            btnHitKill.className = "btn-reset";
            btnHitKill.innerText = "🔄 Reverter Hit Kill";
        } else {
            btnHitKill.className = "btn-preset";
            btnHitKill.innerText = "🗡️ Hit Kill";
        }

        // Amuletos (Checa pelo limite de slots modificado)
        if (alvo.charmSlots === 11) {
            btnAmuletos.className = "btn-reset";
            btnAmuletos.innerText = "🔄 Reverter Amuletos";
        } else {
            btnAmuletos.className = "btn-preset";
            btnAmuletos.innerText = "📿 Amuletos + Custo 0";
        }
    } catch (e) {
        // Se o JSON quebrar enquanto digita, ignora até consertar
    }
}

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
        
        statusText.innerText = "✅ Save carregado! Edite na tela ou clique nos botões.";
        statusText.style.color = "#7ee787";
        editorBox.style.display = "block"; 
        
        atualizarBotoes(); // Verifica como os botões devem nascer
    } catch (erro) {
        statusText.innerText = "❌ Erro ao ler. Arquivo corrompido ou inválido.";
        statusText.style.color = "#ff7b72";
    }
});

// FAZ OS BOTÕES MUDAREM SE VOCÊ DIGITAR MANUALMENTE NO TEXTO
manualEditor.addEventListener('input', atualizarBotoes);

// 2. PRESETS COM SISTEMA DE LIGA/DESLIGA (TOGGLE)
function alternarCheat(aplicarCheatFunc, reverterCheatFunc) {
    try {
        let obj = JSON.parse(manualEditor.value);
        let alvo = obj.playerData ? obj.playerData : obj;
        
        let origObj = JSON.parse(dgSaveOriginalTexto);
        let origAlvo = origObj.playerData ? origObj.playerData : origObj;

        // A função que vamos passar decide se liga ou desliga
        aplicarCheatFunc(alvo, origAlvo);
        
        manualEditor.value = JSON.stringify(obj, null, 2);
        atualizarBotoes();
    } catch (e) {
        alert("❌ Erro de sintaxe. Conserte o texto antes de clicar.");
    }
}

document.getElementById('btnAmuletos').addEventListener('click', () => {
    alternarCheat((alvo, orig) => {
        if (alvo.charmSlots === 11) { // Está com cheat, vamos reverter
            for(let i = 1; i <= 40; i++) {
                alvo[`gotCharm_${i}`] = orig[`gotCharm_${i}`];
                alvo[`newCharm_${i}`] = orig[`newCharm_${i}`];
                alvo[`charmCost_${i}`] = orig[`charmCost_${i}`];
            }
            alvo.charmSlots = orig.charmSlots;
            alvo.fragileHealth_unbreakable = orig.fragileHealth_unbreakable;
            alvo.fragileGreed_unbreakable = orig.fragileGreed_unbreakable;
            alvo.fragileStrength_unbreakable = orig.fragileStrength_unbreakable;
        } else { // Liga o cheat
            for(let i = 1; i <= 40; i++) {
                alvo[`gotCharm_${i}`] = true;
                alvo[`newCharm_${i}`] = false;
                alvo[`charmCost_${i}`] = 0;
            }
            alvo.charmSlots = 11;
            alvo.fragileHealth_unbreakable = true;
            alvo.fragileGreed_unbreakable = true;
            alvo.fragileStrength_unbreakable = true;
        }
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    alternarCheat((alvo, orig) => {
        if (alvo.nailDamage >= 2500) alvo.nailDamage = orig.nailDamage;
        else alvo.nailDamage = 2500;
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    alternarCheat((alvo, orig) => {
        if (alvo.maxHealthBase > 20) {
            alvo.maxHealthBase = orig.maxHealthBase;
            alvo.maxHealth = orig.maxHealth;
            alvo.health = orig.health;
        } else {
            alvo.maxHealthBase = 999;
            alvo.maxHealth = 999;
            alvo.health = 999;
        }
    });
});

document.getElementById('btnDinheiro').addEventListener('click', () => {
    alternarCheat((alvo, orig) => {
        if (alvo.geo > 5000) alvo.geo = orig.geo;
        else alvo.geo = 9999999;
    });
});

// 3. BOTÃO DE RESET TOTAL
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Tem certeza? Isso vai desfazer todas as edições no texto.")) {
        manualEditor.value = dgSaveOriginalTexto;
        atualizarBotoes();
    }
});

// 4. DOWNLOADS
document.getElementById('btnDownTexto').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); 
        DownloadData(manualEditor.value, dgFileName + ".txt");
    } catch (e) {
        alert("❌ Erro de sintaxe. Você apagou aspas ou vírgula sem querer.");
    }
});

document.getElementById('btnDownJogo').addEventListener('click', () => {
    try {
        const objetoLimpo = JSON.parse(manualEditor.value); 
        const jsonMinificado = JSON.stringify(objetoLimpo); 
        const novosBytes = Encode(jsonMinificado); 
        DownloadData(novosBytes, dgFileName);
    } catch (e) {
        alert("❌ Erro de sintaxe no texto. Não dá pra gerar o save.");
    }
});
