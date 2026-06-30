import { Decode, Encode, DownloadData } from './functions.js';

let dgFileName = "user1.dat";
let currentSaveObj = null;

// ==========================================
// DADOS BASE PARA INTERFACE (100% PT-BR)
// ==========================================
const amuletosNomes = [
    "Enxame Coletor",          // 1
    "Bússola Desorientada",    // 2
    "Canção das Larvas",       // 3
    "Casco Resistente",        // 4
    "Casco de Baldur",         // 5
    "Fúria dos Caídos",        // 6
    "Foco Rápido",             // 7
    "Coração de Sangue Vital", // 8
    "Núcleo de Sangue Vital",  // 9
    "Brasão do Defensor",      // 10
    "Ninho de Flukes",         // 11
    "Espinhos da Agonia",      // 12
    "Marca do Orgulho",        // 13
    "Corpo Estável",           // 14
    "Golpe Pesado",            // 15
    "Sombra Afiada",           // 16
    "Cogumelo de Esporos",     // 17
    "Unha Longa",              // 18
    "Pedra do Xamã",           // 19
    "Capturador de Alma",      // 20
    "Devorador de Alma",       // 21
    "Ventre Luminoso",         // 22
    "Coração Frágil",          // 23
    "Ganância Frágil",         // 24
    "Força Frágil",            // 25
    "Glória do Mestre da Unha",// 26
    "Bênção de Joni",          // 27
    "Forma de Unn",            // 28
    "Sangue da Colmeia",       // 29
    "Portador dos Sonhos",     // 30
    "Mestre do Dash",          // 31
    "Corte Rápido",            // 32
    "Torcedor de Feitiços",    // 33
    "Foco Profundo",           // 34
    "Elegia da Grubberfly",    // 35
    "Alma do Rei / Coração do Vazio", // 36
    "Mestre da Corrida",       // 37
    "Escudo dos Sonhos",       // 38
    "Canção dos Tecelões",     // 39
    "Filho de Grimm / Melodia Despreocupada" // 40
];

const habilidadesMap = [
    // Movimento e Extras
    { type: 'bool', key: 'hasDash', label: 'Manto de Asa de Mariposa' },
    { type: 'bool', key: 'hasShadowDash', label: 'Manto Sombrio' },
    { type: 'bool', key: 'hasWalljump', label: 'Garra de Louva-a-Deus' },
    { type: 'bool', key: 'hasSuperDash', label: 'Coração de Cristal' },
    { type: 'bool', key: 'hasDoubleJump', label: 'Asas do Monarca' },
    { type: 'bool', key: 'hasAcidArmour', label: 'Lágrima de Isma' },
    { type: 'bool', key: 'hasDreamNail', label: 'Ferrão dos Sonhos' },
    { type: 'bool', key: 'hasDreamGate', label: 'Portal dos Sonhos' },
    { type: 'bool', key: 'hasWorldSense', label: 'Sentido do Mundo' },
    
    // Artes da Unha
    { type: 'bool', key: 'hasNailArt', label: 'Grande Corte' },
    { type: 'bool', key: 'hasDashSlash', label: 'Corte do Dash' },
    { type: 'bool', key: 'hasCyclone', label: 'Corte Ciclone' },

    // Feitiços
    { type: 'spell', key: 'fireballLevel', label: 'Feitiço de Fogo', opt1: 'Espírito Vingativo', opt2: 'Alma Sombria' },
    { type: 'spell', key: 'quakeLevel', label: 'Feitiço de Mergulho', opt1: 'Mergulho Desolador', opt2: 'Mergulho Sombrio' },
    { type: 'spell', key: 'screamLevel', label: 'Feitiço de Grito', opt1: 'Espectros Uivantes', opt2: 'Grito do Abismo' }
];

// ==========================================
// SELETORES DO DOM
// ==========================================
const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const editorBox = document.getElementById('editorBox');
const manualEditor = document.getElementById('manualEditor');

const btnToggleAdvanced = document.getElementById('btnToggleAdvanced');
const advancedEditor = document.getElementById('advancedEditor');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const inpGeo = document.getElementById('inpGeo');
const inpVida = document.getElementById('inpVida');
const inpDano = document.getElementById('inpDano');
const inpCharmSlots = document.getElementById('inpCharmSlots');

const skillsContainer = document.getElementById('skillsContainer');
const charmsContainer = document.getElementById('charmsContainer');
const searchAmuletos = document.getElementById('searchAmuletos');

// ==========================================
// CONSTRUÇÃO DA INTERFACE AVANÇADA
// ==========================================
function initAdvancedUI() {
    skillsContainer.innerHTML = '';
    habilidadesMap.forEach(hab => {
        const div = document.createElement('div');
        div.className = 'checkbox-card';
        
        if (hab.type === 'bool') {
            div.innerHTML = `
                <div class="title">${hab.label}</div>
                <label class="check-label">
                    <input type="checkbox" data-key="${hab.key}"> Desbloqueado
                </label>
            `;
        } else if (hab.type === 'spell') {
            div.innerHTML = `
                <div class="title">${hab.label}</div>
                <select data-key="${hab.key}" style="margin-top: 8px;">
                    <option value="0">Não possui</option>
                    <option value="1">✨ ${hab.opt1}</option>
                    <option value="2">🔥 ${hab.opt2} (Máx)</option>
                </select>
            `;
        }
        
        skillsContainer.appendChild(div);
    });

    charmsContainer.innerHTML = '';
    amuletosNomes.forEach((nome, index) => {
        const i = index + 1;
        const div = document.createElement('div');
        div.className = 'checkbox-card charm-item';
        
        let nomeVisual = nome;
        let extraHTML = '';
        
        if (i === 36) {
            extraHTML = `
                <select data-key="royalCharmState" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="3">👑 Alma do Rei (Nível 3)</option>
                    <option value="4">🖤 Coração do Vazio (Nível 4)</option>
                </select>
            `;
        } else if (i === 40) {
            extraHTML = `
                <select data-key="grimmChildLevel" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="1">🦇 Filho de Grimm Nvl 1</option>
                    <option value="2">🦇 Filho de Grimm Nvl 2</option>
                    <option value="3">🦇 Filho de Grimm Nvl 3</option>
                    <option value="4">🦇 Filho de Grimm Máx</option>
                    <option value="5">🎵 Melodia Despreocupada</option>
                </select>
            `;
        } else if (i === 23 || i === 24 || i === 25) {
            const keyStr = i === 23 ? 'fragileHealth_unbreakable' : i === 24 ? 'fragileGreed_unbreakable' : 'fragileStrength_unbreakable';
            extraHTML = `
                <label class="check-label" style="margin-top: 8px; color: var(--primary);">
                    <input type="checkbox" data-key="${keyStr}"> 🛡️ Tornar Inquebrável
                </label>
            `;
        }

        div.dataset.name = nomeVisual.toLowerCase();
        div.innerHTML = `
            <div class="title">${i}. ${nomeVisual}</div>
            <label class="check-label">
                <input type="checkbox" data-key="gotCharm_${i}"> Possui no Inventário
            </label>
            <label class="check-label">
                <input type="checkbox" data-key="equippedCharm_${i}"> Equipado
            </label>
            ${extraHTML}
        `;
        charmsContainer.appendChild(div);
    });

    document.querySelectorAll('#advancedEditor input:not(.search-bar), #advancedEditor select').forEach(input => {
        input.addEventListener('change', (e) => {
            if (!currentSaveObj) return;
            const pData = currentSaveObj.playerData ? currentSaveObj.playerData : currentSaveObj;
            const key = e.target.dataset.key;
            
            if (e.target.type === 'number') {
                const mapKey = e.target.id === 'inpGeo' ? 'geo' : 
                               e.target.id === 'inpVida' ? 'maxHealthBase' : 
                               e.target.id === 'inpDano' ? 'nailDamage' : 'charmSlots';
                pData[mapKey] = parseInt(e.target.value) || 0;
            } else if (e.target.type === 'checkbox') {
                pData[key] = e.target.checked;
            } else if (e.target.tagName === 'SELECT') {
                pData[key] = parseInt(e.target.value) || 0;
            }
            
            manualEditor.value = JSON.stringify(currentSaveObj, null, 2);
            syncUI();
        });
    });
}

// ==========================================
// SINCRONIZAÇÃO (JSON <-> UI)
// ==========================================
function syncUI() {
    try {
        currentSaveObj = JSON.parse(manualEditor.value);
        const pData = currentSaveObj.playerData ? currentSaveObj.playerData : currentSaveObj;

        togglePresetBtn('btnDinheiro', pData.geo > 50000, "🔄 Reverter Dinheiro", "💰 Geo Infinito");
        togglePresetBtn('btnVida', pData.maxHealthBase > 20, "🔄 Reverter Vida", "❤️ Vida Máxima");
        togglePresetBtn('btnHitKill', pData.nailDamage >= 2500, "🔄 Reverter Dano", "🗡️ Golpe Fatal");
        togglePresetBtn('btnAmuletos', pData.charmCost_1 === 0, "🔄 Reverter Amuletos", "📿 Todos os Amuletos");
        const temHab = pData.fireballLevel === 2 || pData.hasDash === true;
        togglePresetBtn('btnHabilidades', temHab, "🔄 Reverter Habilidades", "✨ Todas as Habilidades");

        inpGeo.value = pData.geo || 0;
        inpVida.value = pData.maxHealthBase || 5;
        inpDano.value = pData.nailDamage || 5;
        inpCharmSlots.value = pData.charmSlots || 3;

        document.querySelectorAll('#advancedEditor input[type="checkbox"]').forEach(chk => {
            const key = chk.dataset.key;
            if (key !== undefined) {
                chk.checked = !!pData[key];
            }
        });

        document.querySelectorAll('#advancedEditor select').forEach(sel => {
            const key = sel.dataset.key;
            if (pData[key] !== undefined) {
                sel.value = pData[key];
            }
        });

    } catch (e) {
        // Ignora erros temporários de digitação no JSON
    }
}

function togglePresetBtn(id, condition, textRevert, textNormal) {
    const btn = document.getElementById(id);
    if (condition) {
        btn.className = "btn-preset active-preset";
        btn.innerText = textRevert;
    } else {
        btn.className = "btn-preset";
        btn.innerText = textNormal;
    }
}

function aplicarMudanca(callback) {
    try {
        let save = JSON.parse(manualEditor.value);
        let pData = save.playerData ? save.playerData : save;
        callback(pData); 
        manualEditor.value = JSON.stringify(save, null, 2);
        syncUI(); 
    } catch (e) {
        alert("❌ Erro no JSON! Verifique a aba 'JSON Bruto' antes de clicar.");
    }
}

// ==========================================
// EVENTOS PRINCIPAIS
// ==========================================

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    dgFileName = file.name;
    statusText.innerText = "Descriptografando save...";
    
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
        const json = Decode(bytes);
        currentSaveObj = JSON.parse(json);
        manualEditor.value = JSON.stringify(currentSaveObj, null, 2);
        
        statusText.innerHTML = `<span style="color:var(--success)">✅ Arquivo <b>${dgFileName}</b> carregado com sucesso!</span>`;
        editorBox.classList.remove('hidden');
        syncUI();
    } catch (err) {
        statusText.innerHTML = `<span style="color:var(--danger)">❌ Falha ao descriptografar. O arquivo .dat está corrompido ou é inválido.</span>`;
    }
});

manualEditor.addEventListener('input', syncUI);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

btnToggleAdvanced.addEventListener('click', () => {
    advancedEditor.classList.toggle('hidden');
    if (advancedEditor.classList.contains('hidden')) {
        btnToggleAdvanced.innerHTML = "⚙️ Configuração Completa";
    } else {
        btnToggleAdvanced.innerHTML = "❌ Fechar Configuração";
    }
});

searchAmuletos.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.charm-item').forEach(item => {
        item.style.display = item.dataset.name.includes(term) ? 'flex' : 'none';
    });
});

// ==========================================
// LÓGICA DOS PRESETS
// ==========================================

document.getElementById('btnDinheiro').addEventListener('click', () => {
    aplicarMudanca(p => p.geo = (p.geo > 50000) ? 100 : 9999999);
});

document.getElementById('btnVida').addEventListener('click', () => {
    aplicarMudanca(p => {
        const val = p.maxHealthBase > 20 ? 5 : 999;
        p.maxHealthBase = p.maxHealth = p.health = val;
    });
});

document.getElementById('btnHitKill').addEventListener('click', () => {
    aplicarMudanca(p => p.nailDamage = p.nailDamage >= 2500 ? 5 : 2500);
});

document.getElementById('btnHabilidades').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const temHab = p.fireballLevel === 2 || p.hasDash === true;
        
        habilidadesMap.forEach(h => {
            if(h.type === 'bool') p[h.key] = !temHab;
            if(h.type === 'spell') p[h.key] = temHab ? 0 : 2;
        });
        
        ['canDash', 'canBackDash', 'canWallJump', 'canSuperDash', 'canShadowDash', 'hasAllNailArts'].forEach(k => p[k] = !temHab);
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const reverter = p.charmCost_1 === 0; 
        
        for(let i = 1; i <= 40; i++) {
            // Ignorar completamente a Bússola Desorientada (ID 2)
            if (i === 2) continue; 

            p[`equippedCharm_${i}`] = false;
            
            if (!reverter) {
                p[`gotCharm_${i}`] = true;
                p[`newCharm_${i}`] = false;
                p[`charmCost_${i}`] = 0; // Custo zero
            } else {
                p[`gotCharm_${i}`] = false;
                p[`charmCost_${i}`] = 1; // Valor genérico ao reverter
            }
        }
        
        if (!reverter) {
            p.charmSlots = 11;
            p.fragileHealth_unbreakable = true;
            p.fragileGreed_unbreakable = true;
            p.fragileStrength_unbreakable = true;
            p.royalCharmState = 4; // Coração do Vazio (Máximo)
            p.grimmChildLevel = 5; // Melodia Despreocupada (Máximo)
        } else {
            p.charmSlots = 3;
            p.fragileHealth_unbreakable = false;
            p.fragileGreed_unbreakable = false;
            p.fragileStrength_unbreakable = false;
            p.royalCharmState = 0; 
            p.grimmChildLevel = 0; 
        }
    });
});

// ==========================================
// EXPORTAÇÃO
// ==========================================

document.getElementById('btnDownTexto').addEventListener('click', () => {
    try {
        JSON.parse(manualEditor.value); 
        DownloadData(manualEditor.value, dgFileName + ".txt");
    } catch (e) {
        alert("❌ Erro de sintaxe no JSON. Corrija na aba 'JSON Bruto'.");
    }
});

document.getElementById('btnDownJogo').addEventListener('click', () => {
    try {
        const objeto = JSON.parse(manualEditor.value);
        DownloadData(Encode(JSON.stringify(objeto)), dgFileName);
    } catch(e) { 
        alert("❌ Erro ao compilar. O JSON contém erros de estrutura."); 
    }
});

initAdvancedUI();
