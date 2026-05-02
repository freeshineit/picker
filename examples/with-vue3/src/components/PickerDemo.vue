<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import "@skax/picker/dist/style/css.js";
import Picker from "@skax/picker";
import type { PickerPlacement } from "@skax/picker";

const pickerTarget = ref<HTMLElement | null>(null);
const picker = ref<InstanceType<typeof Picker> | null>(null);
const pickerOpen = ref(false);
const pickerReady = ref(false);
const logs = ref<string[]>([]);

const form = reactive({
  placement: "bottom" as PickerPlacement,
  trigger: "click" as "click" | "hover",
  triggerClose: false,
  isMobile: false,
  disabled: false,
  offsetX: 0,
  offsetY: 8,
  contentHtml: "<div><strong>Picker Content</strong><p>You can edit this HTML in the textarea.</p></div>",
});

function pushLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.unshift("[" + timestamp + "] " + message);
  logs.value = logs.value.slice(0, 8);
}

function rebuildPicker() {
  destroyPicker();
  if (!pickerTarget.value) return;
  const instance = new Picker(() => pickerTarget.value!, {
    placement: form.placement,
    trigger: form.trigger,
    triggerClose: form.triggerClose,
    isMobile: form.isMobile,
    offset: [Number(form.offsetX) || 0, Number(form.offsetY) || 0],
    content: form.contentHtml,
    onOpenChange: (open: boolean) => {
      pickerOpen.value = !!open;
      pushLog("onOpenChange -> " + !!open);
    },
  });
  instance.disabled = !!form.disabled;
  picker.value = instance;
  pickerReady.value = true;
  pushLog("picker rebuilt");
}

function openPicker(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (!picker.value) return;
  picker.value.open = true;
}

function closePicker(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (!picker.value) return;
  picker.value.open = false;
}

function togglePicker(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (!picker.value) return;
  picker.value.open = !picker.value.open;
}

function updateContent() {
  if (!picker.value) return;
  picker.value.innerHTML(form.contentHtml);
  pushLog("content updated by innerHTML");
}

function destroyPicker() {
  if (!picker.value) {
    pickerReady.value = false;
    pickerOpen.value = false;
    return;
  }
  picker.value.destroy();
  picker.value = null;
  pickerReady.value = false;
  pickerOpen.value = false;
  pushLog("picker destroyed");
}

onMounted(() => {
  rebuildPicker();
});

onUnmounted(() => {
  destroyPicker();
});
</script>

<template>
  <div class="demo-page">
    <h2>Picker Vue3 Demo</h2>

    <div class="control-panel">
      <label>
        placement
        <select v-model="form.placement">
          <option value="top">top</option>
          <option value="tl">tl</option>
          <option value="tr">tr</option>
          <option value="bottom">bottom</option>
          <option value="bl">bl</option>
          <option value="br">br</option>
        </select>
      </label>

      <label>
        trigger
        <select v-model="form.trigger">
          <option value="click">click</option>
          <option value="hover">hover</option>
        </select>
      </label>

      <label>
        offsetX
        <input v-model.number="form.offsetX" type="number" />
      </label>

      <label>
        offsetY
        <input v-model.number="form.offsetY" type="number" />
      </label>

      <label class="check-item">
        <input v-model="form.triggerClose" type="checkbox" />
        triggerClose
      </label>

      <label class="check-item">
        <input v-model="form.isMobile" type="checkbox" />
        isMobile
      </label>

      <label class="check-item">
        <input v-model="form.disabled" type="checkbox" />
        disabled
      </label>
    </div>

    <label class="content-label">
      panel html
      <textarea v-model="form.contentHtml" rows="4"></textarea>
    </label>

    <div class="button-row">
      <button @click="rebuildPicker">Rebuild</button>
      <button @click="openPicker">Open</button>
      <button @click="closePicker">Close</button>
      <button @click="togglePicker">Toggle</button>
      <button @click="updateContent">Update Content</button>
      <button @click="destroyPicker">Destroy</button>
    </div>

    <div class="preview-area">
      <button ref="pickerTarget" class="target-btn">Open Picker</button>
      <div class="state">
        <span>picker: {{ pickerReady ? "ready" : "destroyed" }}</span>
        <span>open: {{ pickerOpen ? "true" : "false" }}</span>
      </div>
    </div>

    <div class="log-panel">
      <div class="log-title">event log</div>
      <ul>
        <li v-for="(item, idx) in logs" :key="idx">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style>
.demo-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.control-panel label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.check-item {
  min-height: 66px;
}

.check-item input {
  margin-right: 6px;
}

.content-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.content-label textarea,
.control-panel input,
.control-panel select {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 6px 8px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.button-row button,
.target-btn {
  border: 1px solid #111;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px 12px;
}

.preview-area {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.state {
  display: flex;
  gap: 14px;
  font-size: 13px;
  color: #333;
}

.log-panel {
  border: 1px solid #ececec;
  border-radius: 8px;
  padding: 10px 12px;
}

.log-title {
  font-size: 13px;
  margin-bottom: 6px;
  color: #666;
}

.log-panel ul {
  margin: 0;
  padding-left: 20px;
}

.log-panel li {
  font-size: 12px;
  line-height: 1.6;
}

.epicker-body {
  padding: 14px;
  background-color: #fff;
}

.check-item {
  flex-direction: row !important;
  align-items: center;
}

.epicker-body {
  background-color: #fff;
}
</style>
