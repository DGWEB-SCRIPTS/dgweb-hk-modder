import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

const listaHabilidadesBooleans = [
    'hasDash', 'hasWalljump', 'hasSuperDash', 'hasDoubleJump', 
    'hasAcidArmour', 'hasDreamNail', 'hasShadowDash',
    'hasSpell1', 'hasNailArt', 'hasCyclone', 'hasDashSlash', 
    'hasUpwardSlash', 'hasAllNailArts',
    'canDash', 'canBackDash', 'canWallJump', 'canSuperDash', 'canShadowDash'
];

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

function sincronizarBotoes() {
    try {
        const data = JSON.parse(manualEditor.value);
        const pData = data.playerData ? data.playerData : data;

        const btnGeo = document.getElementById('btnDinheiro');
        if (pData.geo > 50000) {
            btnGeo.className = "btn-reset";
            btnGeo.innerText = "🔄 Reverter Dinheiro";
        } else {
            btnGeo.className = "btn-preset";
            btnGeo.innerText = "💰 Geo Infinito";
        }

        const btnVida = document.getElementById('btnVida');
        if (pData.maxHealthBase > 20) {
            btnVida.className = "btn-reset";
            btnVida.innerText = "🔄 Reverter Vida";
        } else {
            btnVida.className = "btn-preset";
            btnVida.innerText = "❤️ Vida Máxima";
        }

        const btnHit = document.getElementById('btnHitKill');
        if (pData.nailDamage >= 2500) {
            btnHit.className = "btn-reset";
            btnHit.innerText = "🔄 Reverter Hit Kill";
        } else {
            btnHit.className = "btn-preset";
            btnHit.innerText = "🗡️ Hit Kill";
        }

        const btnAmu = document.getElementById('btnAmuletos');
        if (pData.charmCost_1 === 0) {
            btnAmu.className = "btn-reset";
            btnAmu.innerText = "🔄 Reverter Amuletos";
        } else {
            btnAmu.className = "btn-preset";
            btnAmu.innerText = "📿 Amuletos (Sem Bússola)";
        }

        const btnHab = document.getElementById('btnHabilidades');
        const temHab = pData.fireballLevel === 2 || pData.hasAllNailArts === true;
        if (temHab) {
            btnHab.className = "btn-reset";
            btnHab.innerText = "🔄 Reverter Habilidades/Magias";
        } else {
            btnHab.className = "btn-preset";
            btnHab.innerText = "✨ Hab. + Magias FULL";
        }

    } catch (e) {}
}

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
        
        statusText.innerText = "✅ Save pronto!";
        editorBox.style.display = "block";
        sincronizarBotoes();
    } catch (err) {
        statusText.innerText = "❌ Erro ao ler arquivo .dat";
    }
});

manualEditor.addEventListener('input', sincronizarBotoes);

function aplicarMudanca(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData ? save.playerData : save;

        callback(pData); 

        manualEditor.value = JSON.stringify(save, null, 2);
        sincronizarBotoes(); 
    } catch (e) {
        alert("❌ Erro no JSON! Conserte as vírgulas ou aspas antes de clicar.");
    }
}

document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.geo > 50000) p.geo = 100; 
        else p.geo = 9999999;           
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.maxHealthBase > 20) {
            p.maxHealthBase = 5; 
            p.maxHealth = 5;
            p.health = 5;
        } else {
            p.maxHealthBase = 999; 
            p.maxHealth = 999;
            p.health = 999;
        }
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.nailDamage >= 2500) p.nailDamage = 5; 
        else p.nailDamage = 2500;                   
    });
});

document.getElementById('btnHabilidades').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const temHab = p.fireballLevel === 2 || p.hasAllNailArts === true;
        if (temHab) {
            listaHabilidadesBooleans.forEach(h => p[h] = false);
            p.fireballLevel = 0;
            p.quakeLevel = 0;
            p.screamLevel = 0;
        } else {
            listaHabilidadesBooleans.forEach(h => p[h] = true);
            p.fireballLevel = 2;
            p.quakeLevel = 2;
            p.screamLevel = 2;
        }
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.charmCost_1 === 0) {
            for(let i=1; i<=40; i++) {
                p[`gotCharm_${i}`] = false;
                p[`equippedCharm_${i}`] = false;
                p[`charmCost_${i}`] = 1;
            }
            p.charmSlots = 3;
            p.fragileHealth_unbreakable = false;
            p.fragileGreed_unbreakable = false;
            p.fragileStrength_unbreakable = false;
        } else {
            for(let i=1; i<=40; i++) {
                p[`equippedCharm_${i}`] = false; 
                if (i === 2) {
                    p[`gotCharm_${i}`] = false; 
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
});

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
        const objeto = JSON.parse(manualEditor.value);
        const minificado = JSON.stringify(objeto);
        DownloadData(Encode(minificado), dgFileName);
    } catch(e) { 
        alert("❌ Erro ao gerar arquivo: JSON inválido."); 
    }
});
