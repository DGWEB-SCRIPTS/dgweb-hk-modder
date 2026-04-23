import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

// Lista com os nomes exatos das habilidades no código do jogo
const listaHabilidades = [
    'hasDash', 'hasWalljump', 'hasSuperDash', 
    'hasDoubleJump', 'hasAcidArmour', 'hasDreamNail', 'hasShadowDash'
];

let valoresIniciais = {
    geo: 100, nailDamage: 5, maxHealthBase: 5, maxHealth: 5, health: 5,
    charmSlots: 3, charms: {}, habilidades: {},
    fragileHealth: false, fragileGreed: false, fragileStrength: false
};

let cheatsAtivos = {
    amuletos: false, habilidades: false, hitKill: false, vida: false, dinheiro: false
};

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// 1. LER ARQUIVO E SALVAR "COOKIES"
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
        let alvo = objetoJson.playerData ? objetoJson.playerData : objetoJson;

        // Salva os status principais
        valoresIniciais.geo = alvo.geo || 100;
        valoresIniciais.nailDamage = alvo.nailDamage || 5;
        valoresIniciais.maxHealthBase = alvo.maxHealthBase || 5;
        valoresIniciais.maxHealth = alvo.maxHealth || 5;
        valoresIniciais.health = alvo.health || 5;
        valoresIniciais.charmSlots = alvo.charmSlots || 3;
        valoresIniciais.fragileHealth = alvo.fragileHealth_unbreakable || false;
        valoresIniciais.fragileGreed = alvo.fragileGreed_unbreakable || false;
        valoresIniciais.fragileStrength = alvo.fragileStrength_unbreakable || false;

        // Salva o estado exato de cada amuleto (se tem, se tá novo, custo e se tá equipado)
        for(let i = 1; i <= 40; i++) {
            valoresIniciais.charms[i] = {
                got: alvo[`gotCharm_${i}`] || false,
                new: alvo[`newCharm_${i}`] || false,
                cost: alvo[`charmCost_${i}`] !== undefined ? alvo[`charmCost_${i}`] : 1,
                equipped: alvo[`equippedCharm_${i}`] || false
            };
        }

        // Salva as habilidades que você já tinha
        listaHabilidades.forEach(hab => {
            valoresIniciais.habilidades[hab] = alvo[hab] || false;
        });
        
        dgSaveOriginalTexto = JSON.stringify(objetoJson, null, 2); 
        manualEditor.value = dgSaveOriginalTexto;
        
        statusText.innerText = "✅ Save carregado! Edite na tela ou use os botões.";
        statusText.style.color = "#7ee787";
        editorBox.style.display = "block"; 
        
        cheatsAtivos = { amuletos: false, habilidades: false, hitKill: false, vida: false, dinheiro: false };
        atualizarVisualBotoes();

    } catch (erro) {
        statusText.innerText = "❌ Erro ao ler. Arquivo corrompido ou inválido.";
        statusText.style.color = "#ff7b72";
    }
});

function atualizarVisualBotoes() {
    const btnAmuletos = document.getElementById('btnAmuletos');
    const btnHabilidades = document.getElementById('btnHabilidades');
    const btnHitKill = document.getElementById('btnHitKill');
    const btnVida = document.getElementById('btnVida');
    const btnDinheiro = document.getElementById('btnDinheiro');

    btnAmuletos.className = cheatsAtivos.amuletos ? "btn-reset" : "btn-preset";
    btnAmuletos.innerText = cheatsAtivos.amuletos ? "🔄 Reverter Amuletos" : "📿 Amuletos (Sem Bússola)";

    btnHabilidades.className = cheatsAtivos.habilidades ? "btn-reset" : "btn-preset";
    btnHabilidades.innerText = cheatsAtivos.habilidades ? "🔄 Reverter Habilidades" : "✨ Todas Habilidades";

    btnHitKill.className = cheatsAtivos.hitKill ? "btn-reset" : "btn-preset";
    btnHitKill.innerText = cheatsAtivos.hitKill ? "🔄 Reverter Hit Kill" : "🗡️ Hit Kill";

    btnVida.className = cheatsAtivos.vida ? "btn-reset" : "btn-preset";
    btnVida.innerText = cheatsAtivos.vida ? "🔄 Reverter Vida" : "❤️ Vida Máxima";

    btnDinheiro.className = cheatsAtivos.dinheiro ? "btn-reset" : "btn-preset";
    btnDinheiro.innerText = cheatsAtivos.dinheiro ? "🔄 Reverter Dinheiro" : "💰 Geo Infinito";
}

function executarToggle(chaveCheat, modificadorFunc) {
    try {
        let obj = JSON.parse(manualEditor.value);
        let alvo = obj.playerData ? obj.playerData : obj;
        
        cheatsAtivos[chaveCheat] = !cheatsAtivos[chaveCheat]; 
        modificadorFunc(alvo, cheatsAtivos[chaveCheat]); 
        
        manualEditor.value = JSON.stringify(obj, null, 2); 
        atualizarVisualBotoes();
    } catch (e) {
        alert("❌ Erro no texto! Verifique se apagou alguma vírgula.");
    }
}

// TOGGLE AMULETOS (Com a sua lógica de desbug)
document.getElementById('btnAmuletos').addEventListener('click', () => {
    executarToggle('amuletos', (alvo, ligado) => {
        if (ligado) {
            for(let i = 1; i <= 40; i++) {
                alvo[`equippedCharm_${i}`] = false; // Desequipa tudo pra desbugar
                
                if (i === 2) { 
                    // Bússola bloqueada (pra você ir lá comprar e liberar o mapa)
                    alvo[`gotCharm_${i}`] = false; 
                } else {
                    alvo[`gotCharm_${i}`] = true;
                    alvo[`newCharm_${i}`] = false;
                    alvo[`charmCost_${i}`] = 0;
                }
            }
            alvo.charmSlots = 11;
            alvo.fragileHealth_unbreakable = true;
            alvo.fragileGreed_unbreakable = true;
            alvo.fragileStrength_unbreakable = true;
        } else {
            for(let i = 1; i <= 40; i++) {
                alvo[`gotCharm_${i}`] = valoresIniciais.charms[i].got;
                alvo[`newCharm_${i}`] = valoresIniciais.charms[i].new;
                alvo[`charmCost_${i}`] = valoresIniciais.charms[i].cost;
                alvo[`equippedCharm_${i}`] = valoresIniciais.charms[i].equipped;
            }
            alvo.charmSlots = valoresIniciais.charmSlots;
            alvo.fragileHealth_unbreakable = valoresIniciais.fragileHealth;
            alvo.fragileGreed_unbreakable = valoresIniciais.fragileGreed;
            alvo.fragileStrength_unbreakable = valoresIniciais.fragileStrength;
        }
    });
});

// TOGGLE HABILIDADES
document.getElementById('btnHabilidades').addEventListener('click', () => {
    executarToggle('habilidades', (alvo, ligado) => {
        listaHabilidades.forEach(hab => {
            alvo[hab] = ligado ? true : valoresIniciais.habilidades[hab];
        });
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    executarToggle('hitKill', (alvo, ligado) => {
        alvo.nailDamage = ligado ? 2500 : valoresIniciais.nailDamage;
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    executarToggle('vida', (alvo, ligado) => {
        alvo.maxHealthBase = ligado ? 999 : valoresIniciais.maxHealthBase;
        alvo.maxHealth = ligado ? 999 : valoresIniciais.maxHealth;
        alvo.health = ligado ? 999 : valoresIniciais.health;
    });
});

document.getElementById('btnDinheiro').addEventListener('click', () => {
    executarToggle('dinheiro', (alvo, ligado) => {
        alvo.geo = ligado ? 9999999 : valoresIniciais.geo;
    });
});

document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Tem certeza? Isso vai voltar tudo pro arquivo original e desligar os botões.")) {
        manualEditor.value = dgSaveOriginalTexto;
        cheatsAtivos = { amuletos: false, habilidades: false, hitKill: false, vida: false, dinheiro: false };
        atualizarVisualBotoes();
    }
});

// DOWNLOADS
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
