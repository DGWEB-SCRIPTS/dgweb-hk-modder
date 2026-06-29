import { Decode, Encode, DownloadData } from './functions.js';

let dgFileName = "user1.dat";
let currentSaveObj = null;

// ==========================================
// DADOS BASE PARA INTERFACE
// ==========================================
const amuletosNomes = [
    "Wayward Compass", "Gathering Swarm", "Stalwart Shell", "Soul Catcher", "Shaman Stone",
    "Soul Eater", "Dashmaster", "Sprintmaster", "Grubsong", "Grubberfly's Elegy",
    "Fragile Heart", "Fragile Greed", "Fragile Strength", "Spell Twister", "Steady Body",
    "Heavy Blow", "Quick Slash", "Longnail", "Mark of Pride", "Fury of the Fallen",
    "Thorns of Agony", "Baldur Shell", "Flukenest", "Defender's Crest", "Glowing Womb",
    "Quick Focus", "Deep Focus", "Lifeblood Heart", "Lifeblood Core", "Joni's Blessing",
    "Hiveblood", "Spore Shroom", "Sharp Shadow", "Shape of Unn", "Nailmaster's Glory",
    "Weaversong", "Dream Wielder", "Dreamshield", "Grimmchild", "Carefree Melody"
];

// O novo mapa de habilidades suporta "bool" (checkboxes) e "spell" (selects de nível)
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
    // 1. Gerar Habilidades
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
                    <option value="2">🔥 ${hab.opt2} (Max)</option>
                </select>
            `;
        }
        
        skillsContainer.appendChild(div);
    });

    // 2. Gerar Amuletos
    charmsContainer.innerHTML = '';
    amuletosNomes.forEach((nome, index) => {
        const i = index + 1;
        const div = document.createElement('div');
        div.className = 'checkbox-card charm-item';
        
        let nomeVisual = nome;
        let extraHTML = '';
        
        if (i === 36) {
            nomeVisual = "Kingsoul / Void Heart";
            extraHTML = `
                <select data-key="royalCharmState" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="3">👑 Kingsoul (Nível 3)</option>
                    <option value="4">🖤 Void Heart (Nível 4)</option>
                </select>
            `;
        } else if (i === 40) {
            nomeVisual = "Grimmchild / Carefree Melody";
            extraHTML = `
                <select data-key="grimmChildLevel" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="1">🦇 Grimmchild Nvl 1</option>
                    <option value="2">🦇 Grimmchild Nvl 2</option>
                    <option value="3">🦇 Grimmchild Nvl 3</option>
                    <option value="4">🦇 Grimmchild Max</option>
                    <option value="5">🎵 Carefree Melody</option>
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

    // 3. Listener Global para Inputs Avançados
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

        // Atualiza Presets
        togglePresetBtn('btnDinheiro', pData.geo > 50000, "🔄 Reverter Dinheiro", "💰 Geo Infinito");
        togglePresetBtn('btnVida', pData.maxHealthBase > 20, "🔄 Reverter Vida", "❤️ Vida Máxima");
        togglePresetBtn('btnHitKill', pData.nailDamage >= 2500, "🔄 Reverter Hit Kill", "🗡️ Hit Kill");
        togglePresetBtn('btnAmuletos', pData.charmCost_1 === 0, "🔄 Reverter Amuletos", "📿 Todos os Amuletos");
        const temHab = pData.fireballLevel === 2 || pData.hasDash === true;
        togglePresetBtn('btnHabilidades', temHab, "🔄 Reverter Habilidades", "✨ Hab. + Magias FULL");

        // Atualiza Inputs
        inpGeo.value = pData.geo || 0;
        inpVida.value = pData.maxHealthBase || 5;
        inpDano.value = pData.nailDamage || 5;
        inpCharmSlots.value = pData.charmSlots || 3;

        // Atualiza Checkboxes
        document.querySelectorAll('#advancedEditor input[type="checkbox"]').forEach(chk => {
            const key = chk.dataset.key;
            if (key !== undefined) {
                chk.checked = !!pData[key];
            }
        });

        // Atualiza Selects
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
        
        // Ativa variáveis de física também
        ['canDash', 'canBackDash', 'canWallJump', 'canSuperDash', 'canShadowDash', 'hasAllNailArts'].forEach(k => p[k] = !temHab);
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const reverter = p.charmCost_1 === 0;
        for(let i = 1; i <= 40; i++) {
            p[`equippedCharm_${i}`] = false;
            p[`charmCost_${i}`] = reverter ? 1 : 0;
            if (!reverter && i !== 2) {
                p[`gotCharm_${i}`] = true;
                p[`newCharm_${i}`] = false;
            } else if (reverter) {
                p[`gotCharm_${i}`] = false;
            }
        }
        p.charmSlots = reverter ? 3 : 11;
        p.fragileHealth_unbreakable = p.fragileGreed_unbreakable = p.fragileStrength_unbreakable = !reverter;
        p.royalCharmState = reverter ? 0 : 4; 
        p.grimmChildLevel = reverter ? 0 : 5; 
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
       const i = index + 1;
        const div = document.createElement('div');
        div.className = 'checkbox-card charm-item';
        
        let nomeVisual = nome;
        let extraHTML = '';
        
        // Tratamento: Kingsoul ou Void Heart (Slot 36)
        if (i === 36) {
            nomeVisual = "Kingsoul / Void Heart";
            extraHTML = `
                <select data-key="royalCharmState" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="3">👑 Kingsoul (Nível 3)</option>
                    <option value="4">🖤 Void Heart (Nível 4)</option>
                </select>
            `;
        } 
        // Tratamento: Grimmchild ou Carefree Melody (Slot 40)
        else if (i === 40) {
            nomeVisual = "Grimmchild / Carefree Melody";
            extraHTML = `
                <select data-key="grimmChildLevel" style="margin-top: 8px;">
                    <option value="0">Estado Padrão</option>
                    <option value="1">🦇 Grimmchild Nvl 1</option>
                    <option value="2">🦇 Grimmchild Nvl 2</option>
                    <option value="3">🦇 Grimmchild Nvl 3</option>
                    <option value="4">🦇 Grimmchild Max</option>
                    <option value="5">🎵 Carefree Melody</option>
                </select>
            `;
        }
        // Tratamento: Amuletos Frágeis/Inquebráveis (Slots 23, 24, 25)
        else if (i === 23 || i === 24 || i === 25) {
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

    // 3. Listener Global para Inputs Avançados
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

        // Atualiza estilo dos Presets
        togglePresetBtn('btnDinheiro', pData.geo > 50000, "🔄 Reverter Dinheiro", "💰 Geo Infinito");
        togglePresetBtn('btnVida', pData.maxHealthBase > 20, "🔄 Reverter Vida", "❤️ Vida Máxima");
        togglePresetBtn('btnHitKill', pData.nailDamage >= 2500, "🔄 Reverter Hit Kill", "🗡️ Hit Kill");
        togglePresetBtn('btnAmuletos', pData.charmCost_1 === 0, "🔄 Reverter Amuletos", "📿 Todos os Amuletos");
        const temHab = pData.fireballLevel === 2 || pData.hasAllNailArts === true;
        togglePresetBtn('btnHabilidades', temHab, "🔄 Reverter Habilidades", "✨ Hab. + Magias FULL");

        // Atualiza Inputs Numéricos
        inpGeo.value = pData.geo || 0;
        inpVida.value = pData.maxHealthBase || 5;
        inpDano.value = pData.nailDamage || 5;
        inpCharmSlots.value = pData.charmSlots || 3;

        // Atualiza Checkboxes
        document.querySelectorAll('#advancedEditor input[type="checkbox"]').forEach(chk => {
            const key = chk.dataset.key;
            if (key !== undefined) {
                chk.checked = !!pData[key];
            }
        });

        // Atualiza Selects
        document.querySelectorAll('#advancedEditor select').forEach(sel => {
            const key = sel.dataset.key;
            if (pData[key] !== undefined) {
                sel.value = pData[key];
            }
        });

    } catch (e) {
        // Erro silencioso para não interromper a digitação no textarea do JSON
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

// Importação do Save
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

// Sincronização ao digitar no JSON
manualEditor.addEventListener('input', syncUI);

// Alternar abas
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Alternar painel avançado
btnToggleAdvanced.addEventListener('click', () => {
    advancedEditor.classList.toggle('hidden');
    if (advancedEditor.classList.contains('hidden')) {
        btnToggleAdvanced.innerHTML = "⚙️ Configuração Completa";
    } else {
        btnToggleAdvanced.innerHTML = "❌ Fechar Configuração";
    }
});

// Busca de amuletos
searchAmuletos.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.charm-item').forEach(item => {
        item.style.display = item.dataset.name.includes(term) ? 'flex' : 'none';
    });
});

// ==========================================
// LÓGICA DOS PRESETS (Ações Rápidas)
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
        const temHab = p.fireballLevel === 2 || p.hasAllNailArts === true;
        habilidadesMap.forEach(h => p[h.key] = !temHab);
        p.fireballLevel = p.quakeLevel = p.screamLevel = temHab ? 0 : 2;
        ['canDash', 'canBackDash', 'canWallJump', 'canSuperDash', 'canShadowDash'].forEach(k => p[k] = !temHab);
    });
});

document.getElementById('btnAmuletos').addEventListener('click', () => {
    aplicarMudanca((p) => {
        const reverter = p.charmCost_1 === 0;
        for(let i = 1; i <= 40; i++) {
            p[`equippedCharm_${i}`] = false;
            p[`charmCost_${i}`] = reverter ? 1 : 0;
            if (!reverter && i !== 2) {
                p[`gotCharm_${i}`] = true;
                p[`newCharm_${i}`] = false;
            } else if (reverter) {
                p[`gotCharm_${i}`] = false;
            }
        }
        p.charmSlots = reverter ? 3 : 11;
        p.fragileHealth_unbreakable = p.fragileGreed_unbreakable = p.fragileStrength_unbreakable = !reverter;
        p.royalCharmState = reverter ? 0 : 4; 
        p.grimmChildLevel = reverter ? 0 : 5; 
    });
});

// ==========================================
// EXPORTAÇÃO (Download)
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

// Iniciar blocos dinâmicos ao carregar
initAdvancedUI();
