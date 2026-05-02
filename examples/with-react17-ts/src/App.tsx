import React, { useCallback, useEffect, useRef, useState } from "react";
import "@skax/picker/dist/style";
import Picker from "@skax/picker";
import "./App.css";

type Placement = "top" | "tl" | "tr" | "bottom" | "bl" | "br";
type TriggerType = "click" | "hover";

interface DemoForm {
  placement: Placement;
  trigger: TriggerType;
  triggerClose: boolean;
  isMobile: boolean;
  disabled: boolean;
  offsetX: number;
  offsetY: number;
  contentHtml: string;
}

const defaultForm: DemoForm = {
  placement: "bottom",
  trigger: "click",
  triggerClose: false,
  isMobile: false,
  disabled: false,
  offsetX: 0,
  offsetY: 8,
  contentHtml: "<div><strong>Picker Content</strong><p>You can edit this HTML in the textarea.</p></div>",
};

function App() {
  const pickerRef = useRef<Picker | null>(null);
  const targetRef = useRef<HTMLButtonElement | null>(null);

  const [form, setForm] = useState<DemoForm>(defaultForm);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerReady, setPickerReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const pushLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 8));
  }, []);

  const destroyPicker = useCallback(() => {
    if (!pickerRef.current) {
      setPickerOpen(false);
      setPickerReady(false);
      return;
    }
    pickerRef.current.destroy();
    pickerRef.current = null;
    setPickerOpen(false);
    setPickerReady(false);
    pushLog("picker destroyed");
  }, [pushLog]);

  const rebuildPicker = useCallback(() => {
    if (!targetRef.current) return;
    destroyPicker();

    pickerRef.current = new Picker(targetRef.current, {
      placement: form.placement,
      trigger: form.trigger,
      triggerClose: form.triggerClose,
      isMobile: form.isMobile,
      offset: [Number(form.offsetX) || 0, Number(form.offsetY) || 0],
      content: form.contentHtml,
      onOpenChange: (open) => {
        setPickerOpen(!!open);
        pushLog(`onOpenChange -> ${!!open}`);
      },
    });

    pickerRef.current.disabled = !!form.disabled;
    setPickerReady(true);
    pushLog("picker rebuilt");
  }, [destroyPicker, form, pushLog]);

  const updateForm = <K extends keyof DemoForm>(key: K, value: DemoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openPicker = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pickerRef.current) return;
    pickerRef.current.open = true;
  }, []);

  const closePicker = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pickerRef.current) return;
    pickerRef.current.open = false;
  }, []);

  const togglePicker = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pickerRef.current) return;
    pickerRef.current.open = !pickerRef.current.open;
  }, []);

  const updateContent = useCallback(() => {
    if (!pickerRef.current) return;
    pickerRef.current.innerHTML(form.contentHtml);
    pushLog("content updated by innerHTML");
  }, [form.contentHtml, pushLog]);

  useEffect(() => {
    rebuildPicker();
    return () => {
      if (!pickerRef.current) return;
      pickerRef.current.destroy();
      pickerRef.current = null;
    };
  }, [rebuildPicker]);

  return (
    <div className="demo-page">
      <h2>Picker React17 + TS Demo</h2>

      <div className="control-panel">
        <label>
          placement
          <select value={form.placement} onChange={(e) => updateForm("placement", e.target.value as Placement)}>
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
          <select value={form.trigger} onChange={(e) => updateForm("trigger", e.target.value as TriggerType)}>
            <option value="click">click</option>
            <option value="hover">hover</option>
          </select>
        </label>

        <label>
          offsetX
          <input type="number" value={form.offsetX} onChange={(e) => updateForm("offsetX", Number(e.target.value) || 0)} />
        </label>

        <label>
          offsetY
          <input type="number" value={form.offsetY} onChange={(e) => updateForm("offsetY", Number(e.target.value) || 0)} />
        </label>

        <label className="check-item">
          <input type="checkbox" checked={form.triggerClose} onChange={(e) => updateForm("triggerClose", e.target.checked)} />
          triggerClose
        </label>

        <label className="check-item">
          <input type="checkbox" checked={form.isMobile} onChange={(e) => updateForm("isMobile", e.target.checked)} />
          isMobile
        </label>

        <label className="check-item">
          <input type="checkbox" checked={form.disabled} onChange={(e) => updateForm("disabled", e.target.checked)} />
          disabled
        </label>
      </div>

      <label className="content-label">
        panel html
        <textarea rows={4} value={form.contentHtml} onChange={(e) => updateForm("contentHtml", e.target.value)} />
      </label>

      <div className="button-row">
        <button onClick={rebuildPicker}>Rebuild</button>
        <button onClick={openPicker}>Open</button>
        <button onClick={closePicker}>Close</button>
        <button onClick={togglePicker}>Toggle</button>
        <button onClick={updateContent}>Update Content</button>
        <button onClick={destroyPicker}>Destroy</button>
      </div>

      <div className="preview-area">
        <button ref={targetRef} className="target-btn">
          Open Picker
        </button>
        <div className="state">
          <span>picker: {pickerReady ? "ready" : "destroyed"}</span>
          <span>open: {pickerOpen ? "true" : "false"}</span>
        </div>
      </div>

      <div className="log-panel">
        <div className="log-title">event log</div>
        <ul>
          {logs.map((item, idx) => (
            <li key={`${idx}-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
