import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";
let valoresIniciais = {}; // Memória do save original

const listaHabilidades = [
    'hasDash', 'hasWalljump', 'hasSuperDash', 
    'hasDoubleJump', 'hasAcidArmour', 'hasDreamNail', 'hasShadowDash'
];

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// Atalho para pegar os botões
const getBtn = (id) => document.getElementById(id);

// 1. SINCRONIZAÇÃO EM TEMPO REAL (Cores e Textos)
function sincronizarBotoes() {
    try {
        const data = JSON.parse(manualEditor.value);
        const pData = data.playerData || data;

        // GEO: Se > 50 mil ou no valor do cheat, mostra Reverter
        const btnGeo = getBtn('btnDinheiro');
        if (pData.geo > 50000) {
            btnGeo.className = "btn-reset";
            btnGeo.innerText = "🔄 Reverter Dinheiro";
        } else {
            btnGeo.className = "btn-preset";
            btnGeo.innerText = "💰 Geo Infinito";
        }

        // VIDA: Se > 20 máscaras, mostra Reverter
        const btnVida = getBtn('btnVida');
        if (pData.maxHealthBase > 20) {
            btnVida.className = "btn-reset";
            btnVida.innerText = "🔄 Reverter Vida";
        } else {
            btnVida.className = "btn-preset";
            btnVida.innerText = "❤️ Vida Máxima";
        }

        // HIT KILL: Se dano >= 2500, mostra Reverter
        const btnHit = getBtn('btnHitKill');
        if (pData.nailDamage >= 2500) {
            btnHit.className = "btn-reset";
            btnHit.innerText = "🔄 Reverter Hit Kill";
        } else {
            btnHit.className = "btn-preset";
            btnHit.innerText = "🗡️ Hit Kill";
        }

        // AMULETOS: Se slots for 11, mostra Reverter
        const btnAmu = getBtn('btnAmuletos');
        if (pData.charmSlots === 11) {
            btnAmu.className = "btn-reset";
            btnAmu.innerText = "🔄 Reverter Amuletos";
        } else {
            btnAmu.className = "btn-preset";
            btnAmu.innerText = "📿 Amuletos (Sem Bússola)";
        }

        // HABILIDADES: Se tiver qualquer uma das principais
        const btnHab = getBtn('btnHabilidades');
        const temHab = listaHabilidades.some(h => pData[h] === true);
        if (temHab) {
            btnHab.className = "btn-reset";
            btnHab.innerText = "🔄 Reverter Habilidades";
        } else {
            btnHab.className = "btn-preset";
            btnHab.innerText = "✨ Todas Habilidades";
        }

    } catch (e) { /* Ignora erro de sintaxe enquanto digita */ }
}

// 2. CARREGAR E SALVAR ESTADO
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dgFileName = file.name;
    statusText.innerText = "Lendo save...";
    
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
        const json = Decode(bytes);
        const obj = JSON.parse(json);
        dgSaveOriginalTexto = JSON.stringify(obj, null, 2);
        manualEditor.value = dgSaveOriginalTexto;
        
        // Salva cópia profunda para reversão
        valoresIniciais = JSON.parse(dgSaveOriginalTexto); 

        statusText.innerText = "✅ Save pronto!";
        editorBox.style.display = "block";
        sincronizarBotoes();
    } catch (err) {
        statusText.innerText = "❌ Erro ao ler arquivo .dat";
    }
});

// Listener para mudanças manuais na tela
manualEditor.addEventListener('input', sincronizarBotoes);

// 3. LÓGICA DE APLICAÇÃO E REVERSÃO (TOGGLE)
function aplicarToggle(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData || save;
        let pOrig = (valoresIniciais.playerData || valoresIniciais);

        callback(pData, pOrig);

        manualEditor.value = JSON.stringify(save, null, 2);
        sincronizarBotoes();
    } catch (e) {
        alert("Erro no JSON! Conserte as vírgulas ou aspas.");
    }
}

// BOTÕES COM LÓGICA DE REVERTER
getBtn('btnDinheiro').onclick = () => aplicarToggle((p, o) => {
    if (p.geo > 50000) p.geo = (o.geo <= 50000 ? o.geo : 100);
    else p.geo = 9999999;
});

getBtn('btnVida').onclick = () => aplicarToggle((p, o) => {
    if (p.maxHealthBase > 20) {
        p.maxHealthBase = (o.maxHealthBase <= 20 ? o.maxHealthBase : 5);
        p.maxHealth = (o.maxHealth <= 20 ? o.maxHealth : 5);
        p.health = (o.health <= 20 ? o.health : 5);
    } else {
        p.maxHealthBase = 999; p.maxHealth = 999; p.health = 999;
    }
});

getBtn('btnHitKill').onclick = () => aplicarToggle((p, o) => {
    if (p.nailDamage >= 2500) p.nailDamage = (o.nailDamage < 2500 ? o.nailDamage : 5);
    else p.nailDamage = 2500;
});

getBtn('btnHabilidades').onclick = () => aplicarToggle((p, o) => {
    const ativar = !listaHabilidades.some(h => p[h] === true);
    listaHabilidades.forEach(h => p[h] = ativar ? true : o[h]);
});

getBtn('btnAmuletos').onclick = () => aplicarToggle((p, o) => {
    if (p.charmSlots === 11) {
        // Reverter
        for(let i=1; i<=40; i++) {
            p[`gotCharm_${i}`] = o[`gotCharm_${i}`];
            p[`newCharm_${i}`] = o[`newCharm_${i}`];
            p[`charmCost_${i}`] = o[`charmCost_${i}`];
            p[`equippedCharm_${i}`] = o[`equippedCharm_${i}`];
        }
        p.charmSlots = o.charmSlots;
        p.fragileHealth_unbreakable = o.fragileHealth_unbreakable;
        p.fragileGreed_unbreakable = o.fragileGreed_unbreakable;
        p.fragileStrength_unbreakable = o.fragileStrength_unbreakable;
    } else {
        // Aplicar Cheat: Pega tudo menos a Bússola (ID 2) e desequipa tudo
        for(let i=1; i<=40; i++) {
            p[`equippedCharm_${i}`] = false; // Previne bug de amuleto fantasma
            if (i === 2) {
                p[`gotCharm_${i}`] = false; // Bússola Falsa para você comprar
            } else {
                p[`gotCharm_${i}`] = true;
                p[`newCharm_${i}`] = false;
                p[`charmCost_${i}`] = 0;
            }
        }
        p.charmSlots = 11;
        p.fragileHealth_unbreakable = true;
        p.fragileGreed_unbreakable = true;
        p.fragileStrength_unbreakable = true;
    }
});

// 4. RESET E DOWNLOAD
getBtn('btnReset').onclick = () => {
    if(confirm("Deseja resetar tudo para o original do arquivo?")) {
        manualEditor.value = dgSaveOriginalTexto;
        sincronizarBotoes();
    }
};

document.getElementById('btnDownTexto').onclick = () => {
    DownloadData(manualEditor.value, dgFileName + ".txt");
};

document.getElementById('btnDownJogo').onclick = () => {
    try {
        const objeto = JSON.parse(manualEditor.value);
        const minificado = JSON.stringify(objeto);
        DownloadData(Encode(minificado), dgFileName);
    } catch(e) { alert("Erro ao gerar arquivo: JSON inválido."); }
};
