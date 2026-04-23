import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";

const listaHabilidades = [
    'hasDash', 'hasWalljump', 'hasSuperDash', 
    'hasDoubleJump', 'hasAcidArmour', 'hasDreamNail', 'hasShadowDash'
];

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// 1. SINCRONIZAÇÃO EM TEMPO REAL (As cores que já estão funcionando)
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
        const temHab = listaHabilidades.some(h => pData[h] === true);
        if (temHab) {
            btnHab.className = "btn-reset";
            btnHab.innerText = "🔄 Reverter Habilidades";
        } else {
            btnHab.className = "btn-preset";
            btnHab.innerText = "✨ Todas Habilidades";
        }

    } catch (e) { /* Ignora erro enquanto digita */ }
}

// 2. LER ARQUIVO
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

// 3. APLICAÇÃO BRUTA DOS VALORES (Sem Cookies)
function aplicarMudanca(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData ? save.playerData : save;

        callback(pData); // Modifica os dados

        manualEditor.value = JSON.stringify(save, null, 2);
        sincronizarBotoes(); // Atualiza a cor do botão na hora
    } catch (e) {
        alert("❌ Erro no JSON! Conserte as vírgulas ou aspas antes de clicar.");
    }
}

// BOTÕES COM VALORES FIXOS DA BASE
document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.geo > 50000) p.geo = 100; // Valor Base
        else p.geo = 9999999;           // Cheat
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.maxHealthBase > 20) {
            p.maxHealthBase = 5; // Valores Base
            p.maxHealth = 5;
            p.health = 5;
        } else {
            p.maxHealthBase = 999; // Cheat
            p.maxHealth = 999;
            p.health = 999;
        }
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.nailDamage >= 2500) p.nailDamage = 5; // Valor Base
        else p.nailDamage = 2500;                   // Cheat
    });
});

document.getElementById('btnHabilidades').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const temHab = listaHabilidades.some(h => p[h] === true);
        if (temHab) {
            // Reverter (Desliga tudo)
            listaHabilidades.forEach(h => p[h] = false);
        } else {
            // Cheat (Liga tudo)
            listaHabilidades.forEach(h => p[h] = true);
        }
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        if (p.charmCost_1 === 0) {
            // REVERTER BRUTO: Tira tudo de você e reseta o custo
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
            // APLICAR CHEAT
            for(let i=1; i<=40; i++) {
                p[`equippedCharm_${i}`] = false; // Desequipa tudo
                if (i === 2) {
                    p[`gotCharm_${i}`] = false; // Bloqueia Bússola
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

// 4. RESET GERAL E DOWNLOAD
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Deseja resetar tudo para o original do arquivo que você upou?")) {
        manualEditor.value = dgSaveOriginalTexto;
        sincronizarBotoes();
        alert("✅ Arquivo resetado para o original com sucesso!");
    }
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
