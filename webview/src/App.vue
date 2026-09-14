<template>
  <main class="wallpaper-panel">
    <header><span class="mark">▣</span><div><h1>vscode_desginbackground</h1><p>Local wallpaper controls</p></div></header>
    <section class="preview" :class="{ empty: !state.preview }">
      <img v-if="state.preview" :src="state.preview" alt="Current wallpaper preview">
      <span v-else>No wallpaper selected</span>
    </section>
    <p class="path" :title="state.imagePath">{{ state.imagePath || 'Select a local image to begin' }}</p>
    <div class="actions"><button class="primary" @click="action(1)">Choose image</button><button @click="action(7)">Clear</button></div>
    <section class="controls">
      <label>Opacity <output>{{ Math.round(state.opacity * 100) }}%</output><input v-model.number="state.opacity" type="range" min="0" max="0.8" step="0.01" @change="save('opacity', state.opacity)"></label>
      <label>Blur <output>{{ state.blur }} px</output><input v-model.number="state.blur" type="range" min="0" max="100" step="1" @change="save('blur', state.blur)"></label>
      <label>Image fit<select v-model="state.sizeModel" @change="save('sizeModel', state.sizeModel)"><option value="cover">Cover</option><option value="contain">Contain</option><option value="repeat">Repeat</option><option value="center">Center</option></select></label>
      <label>Blend mode<select v-model="state.blendModel" @change="save('blendModel', state.blendModel)"><option value="auto">Auto</option><option value="multiply">Multiply</option><option value="lighten">Lighten</option></select></label>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useBridge } from './composables/useBridge';
const bridge = useBridge();
const state = reactive({ imagePath: '', preview: '', opacity: 0.2, blur: 0, sizeModel: 'cover', blendModel: 'auto' });
bridge.on('state', message => Object.assign(state, message.data || {}));
function action(value: number) { bridge.post({ type: 'action', action: value }); }
function save(key: string, value: string | number) { bridge.post({ type: 'setConfig', key, value }); }
onMounted(() => bridge.post({ type: 'ready' }));
</script>

<style scoped>
.wallpaper-panel{padding:16px;color:var(--vscode-foreground);font:13px var(--vscode-font-family);max-width:460px;margin:auto}header{display:flex;gap:10px;align-items:center;margin-bottom:16px}.mark{font-size:25px;color:var(--vscode-button-background)}h1{font-size:16px;margin:0}p{margin:3px 0;color:var(--vscode-descriptionForeground)}.preview{height:180px;display:grid;place-items:center;background:var(--vscode-editor-background);border:1px solid var(--vscode-widget-border);border-radius:7px;overflow:hidden}.preview img{width:100%;height:100%;object-fit:cover}.path{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:8px 2px}.actions{display:flex;gap:8px;margin-bottom:18px}button{border:1px solid var(--vscode-button-border,transparent);border-radius:4px;padding:7px 11px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);cursor:pointer}.primary{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}.controls{display:grid;gap:16px;padding-top:12px;border-top:1px solid var(--vscode-widget-border)}label{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center}input,select{grid-column:1 / -1;width:100%;accent-color:var(--vscode-button-background)}select{padding:5px;background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground);border:1px solid var(--vscode-dropdown-border)}output{color:var(--vscode-descriptionForeground)}
</style>
