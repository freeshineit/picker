<template>
  <div class="demo-page">
    <h2>Picker Vue2.5 Demo</h2>

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

<script>
import "@skax/picker/dist/style/css.js";
import Picker from "@skax/picker";

export default {
  name: "PickerDemo",
  data() {
    return {
      picker: null,
      pickerOpen: false,
      pickerReady: false,
      logs: [],
      form: {
        placement: "bottom",
        trigger: "click",
        triggerClose: false,
        isMobile: false,
        disabled: false,
        offsetX: 0,
        offsetY: 8,
        contentHtml: "<div><strong>Picker Content</strong><p>You can edit this HTML in the textarea.</p></div>",
      },
    };
  },
  mounted() {
    this.rebuildPicker();
  },
  beforeDestroy() {
    this.destroyPicker();
  },
  methods: {
    pushLog(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.unshift("[" + timestamp + "] " + message);
      this.logs = this.logs.slice(0, 8);
    },
    rebuildPicker() {
      this.destroyPicker();
      this.picker = new Picker(() => this.$refs.pickerTarget, {
        placement: this.form.placement,
        trigger: this.form.trigger,
        triggerClose: this.form.triggerClose,
        isMobile: this.form.isMobile,
        offset: [Number(this.form.offsetX) || 0, Number(this.form.offsetY) || 0],
        content: this.form.contentHtml,
        onOpenChange: (open) => {
          this.pickerOpen = !!open;
          this.pushLog("onOpenChange -> " + !!open);
        },
      });

      this.picker.disabled = !!this.form.disabled;
      this.pickerReady = true;
      this.pushLog("picker rebuilt");
    },
    openPicker(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.picker) return;
      this.picker.open = true;
    },
    closePicker(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.picker) return;
      this.picker.open = false;
    },
    togglePicker(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.picker) return;
      this.picker.open = !this.picker.open;
    },
    updateContent() {
      if (!this.picker) return;
      this.picker.innerHTML(this.form.contentHtml);
      this.pushLog("content updated by innerHTML");
    },
    destroyPicker() {
      if (!this.picker) {
        this.pickerReady = false;
        this.pickerOpen = false;
        return;
      }
      this.picker.destroy();
      this.picker = null;
      this.pickerReady = false;
      this.pickerOpen = false;
      this.pushLog("picker destroyed");
    },
  },
};
</script>

<style lang="css">
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
</style>
