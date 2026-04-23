import { Decode, Encode, DownloadData } from './functions.js';

let dgSaveOriginalTexto = ""; 
let dgFileName = "user1.dat";
let valoresIniciais = {}; 

const listaHabilidades = [
    'hasDash', 'hasWalljump', 'hasSuperDash', 
    'hasDoubleJump', 'hasAcidArmour', 'hasDreamNail', 'hasShadowDash'
];

const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

// 1. SINCRONIZAÇÃO EM TEMPO REAL (Cores e Textos)
function sincronizarBotoes() {
    try {
        const data = JSON.parse(manualEditor.value);
        const pData = data.playerData ? data.playerData : data;

        // GEO
        const btnGeo = document.getElementById('btnDinheiro');
        if (pData.geo > 50000) {
            btnGeo.className = "btn-reset";
            btnGeo.innerText = "🔄 Reverter Dinheiro";
        } else {
            btnGeo.className = "btn-preset";
            btnGeo.innerText = "💰 Geo Infinito";
        }

        // VIDA
        const btnVida = document.getElementById('btnVida');
        if (pData.maxHealthBase > 20) {
            btnVida.className = "btn-reset";
            btnVida.innerText = "🔄 Reverter Vida";
        } else {
            btnVida.className = "btn-preset";
            btnVida.innerText = "❤️ Vida Máxima";
        }

        // HIT KILL
        const btnHit = document.getElementById('btnHitKill');
        if (pData.nailDamage >= 2500) {
            btnHit.className = "btn-reset";
            btnHit.innerText = "🔄 Reverter Hit Kill";
        } else {
            btnHit.className = "btn-preset";
            btnHit.innerText = "🗡️ Hit Kill";
        }

        // AMULETOS (Olha para o custo do amuleto 1 pra saber se ativou o cheat)
        const btnAmu = document.getElementById('btnAmuletos');
        if (pData.charmCost_1 === 0) {
            btnAmu.className = "btn-reset";
            btnAmu.innerText = "🔄 Reverter Amuletos";
        } else {
            btnAmu.className = "btn-preset";
            btnAmu.innerText = "📿 Amuletos (Sem Bússola)";
        }

        // HABILIDADES
        const btnHab = document.getElementById('btnHabilidades');
        const temHab = listaHabilidades.some(h => pData[h] === true);
        if (temHab) {
            btnHab.className = "btn-reset";
            btnHab.innerText = "🔄 Reverter Habilidades";
        } else {
            btnHab.className = "btn-preset";
            btnHab.innerText = "✨ Todas Habilidades";
        }

    } catch (e) { /* Ignora se estiver digitando algo errado */ }
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
        
        // Memória blindada do save original
        valoresIniciais = JSON.parse(dgSaveOriginalTexto); 

        statusText.innerText = "✅ Save pronto!";
        editorBox.style.display = "block";
        sincronizarBotoes();
    } catch (err) {
        statusText.innerText = "❌ Erro ao ler arquivo .dat";
    }
});

manualEditor.addEventListener('input', sincronizarBotoes);

// 3. LÓGICA DE APLICAÇÃO E REVERSÃO
function aplicarToggle(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData ? save.playerData : save;
        let pOrig = valoresIniciais.playerData ? valoresIniciais.playerData : valoresIniciais;

        callback(pData, pOrig);

        manualEditor.value = JSON.stringify(save, null, 2);
        sincronizarBotoes();
    } catch (e) {
        alert("❌ Erro no JSON! Conserte as vírgulas ou aspas antes de clicar.");
    }
}

// BOTÕES
document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarToggle((p, o) => {
        if (p.geo > 50000) p.geo = o.hasOwnProperty('geo') ? o.geo : 100;
        else p.geo = 9999999;
    });
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarToggle((p, o) => {
        if (p.maxHealthBase > 20) {
            p.maxHealthBase = o.hasOwnProperty('maxHealthBase') ? o.maxHealthBase : 5;
            p.maxHealth = o.hasOwnProperty('maxHealth') ? o.maxHealth : 5;
            p.health = o.hasOwnProperty('health') ? o.health : 5;
        } else {
            p.maxHealthBase = 999; p.maxHealth = 999; p.health = 999;
        }
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarToggle((p, o) => {
        if (p.nailDamage >= 2500) p.nailDamage = o.hasOwnProperty('nailDamage') ? o.nailDamage : 5;
        else p.nailDamage = 2500;
    });
});

document.getElementById('btnHabilidades').addEventListener('click', () => {
    aplicarToggle((p, o) => {
        // Se já tiver alguma habilidade, reverte. Senão, ativa.
        const ativar = !listaHabilidades.some(h => p[h] === true);
        listaHabilidades.forEach(h => {
            if (ativar) {
                p[h] = true;
            } else {
                if (o.hasOwnProperty(h)) p[h] = o[h];
                else delete p[h]; // Apaga se não tinha
            }
        });
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarToggle((p, o) => {
        if (p.charmCost_1 === 0) {
            // REVERTER
            for(let i=1; i<=40; i++) {
                ['gotCharm_', 'newCharm_', 'charmCost_', 'equippedCharm_'].forEach(prefix => {
                    let key = prefix + i;
                    if (o.hasOwnProperty(key)) p[key] = o[key];
                    else delete p[key]; // Se o cara não tinha o amuleto, deleta ele do save
                });
            }
            p.charmSlots = o.hasOwnProperty('charmSlots') ? o.charmSlots : 3;
            p.fragileHealth_unbreakable = o.hasOwnProperty('fragileHealth_unbreakable') ? o.fragileHealth_unbreakable : false;
            p.fragileGreed_unbreakable = o.hasOwnProperty('fragileGreed_unbreakable') ? o.fragileGreed_unbreakable : false;
            p.fragileStrength_unbreakable = o.hasOwnProperty('fragileStrength_unbreakable') ? o.fragileStrength_unbreakable : false;
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

// 4. RESET E DOWNLOAD
document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Deseja resetar tudo para o original do arquivo?")) {
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
