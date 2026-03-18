import { useState, useEffect } from "react";

var CSS = [
  ".bp section{background:oklch(20% .01 250);border:1px solid oklch(30% .02 250);border-radius:6px;padding:6px;display:grid;gap:6px}",
  ".bp h3{line-height:1.2;padding-block-end:3px;border-block-end:1px solid oklch(30% .02 250);color:oklch(92% .01 250);font-size:14px}",
  ".bp p{max-inline-size:65ch;color:oklch(92% .01 250);font-size:12px;line-height:1.5}",
  ".bp label{cursor:pointer;color:oklch(92% .01 250);font-size:12px;display:flex;align-items:center;gap:5px}",
  ".bp button,.bp input,.bp textarea{border:1px solid oklch(30% .02 250);border-radius:3px;background:oklch(16% .01 250);color:oklch(92% .01 250);padding:3px 6px;font:inherit;font-size:12px}",
  ".bp button{cursor:pointer;font-weight:600;background:oklch(20% .01 250);display:inline-flex;align-items:center;justify-content:center;gap:3px}",
  ".bp textarea{resize:vertical}",
  ".bp input[type=checkbox]{width:14px;height:14px;padding:0;cursor:pointer;accent-color:oklch(58% .14 250)}",
  '.bp [data-skin~="emphasis"]{background:oklch(58% .14 250);color:oklch(98% .01 250);border-color:oklch(58% .14 250)}',
  '.bp [data-skin~="ghost"]{background:transparent;border-color:transparent}',
  '.bp [data-skin~="square"]{aspect-ratio:1;padding:3px}',
  // A+R1: 8-col grid with element defaults
  '.bp [data-grid="8"]{grid-template-columns:repeat(8,1fr)}',
  '.bp [data-grid="8"]>h3,.bp [data-grid="8"]>p,.bp [data-grid="8"]>label,.bp [data-grid="8"]>textarea{grid-column:span 8}',
  '.bp [data-grid="8"]>input:not([type=checkbox]){grid-column:span 8}',
  '.bp [data-grid="8"]>[data-skin~="square"]{grid-column:span 1}',
  ".bp [data-span='1']{grid-column:span 1!important}",
  ".bp [data-span='2']{grid-column:span 2!important}",
  ".bp [data-span='3']{grid-column:span 3!important}",
  ".bp [data-span='4']{grid-column:span 4!important}",
  ".bp [data-span='5']{grid-column:span 5!important}",
  ".bp [data-span='7']{grid-column:span 7!important}",
  ".bp [data-span='8']{grid-column:span 8!important}",
  // R3: row containers
  ".bp [data-row]{display:grid;gap:6px;grid-column:1/-1}",
  '.bp [data-row="1"]{grid-template-columns:1fr}',
  '.bp [data-row="2"]{grid-template-columns:repeat(2,1fr)}',
  '.bp [data-row="3"]{grid-template-columns:repeat(3,1fr)}',
  '.bp [data-row="4"]{grid-template-columns:repeat(4,1fr)}',
  '.bp [data-row="8"]{grid-template-columns:repeat(8,1fr)}',
  '.bp [data-row="7-1"]{grid-template-columns:7fr 1fr}',
  '.bp [data-row="1-5-2"]{grid-template-columns:1fr 5fr 2fr}',
  // C+R1: parent cols + defaults + child override
  '.bp [data-skin~="cols-2"]{grid-template-columns:repeat(2,1fr)}',
  '.bp [data-skin~="cols-4"]{grid-template-columns:repeat(4,1fr)}',
  '.bp [data-skin~="cols-8"]{grid-template-columns:repeat(8,1fr)}',
  '.bp [data-skin~="cols-3"]{grid-template-columns:repeat(3,1fr)}',
].join("\n");

var C = {
  bg: "#0e0f13",
  surface: "#16171d",
  border: "#2a2b35",
  text: "#e8e8ed",
  mute: "#8b8b9e",
  accent: "#7c7cf5",
  green: "#4ade80",
  amber: "#fbbf24",
  red: "#f87171",
  cyan: "#22d3ee",
};

var Pl = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
};
var Ex = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
};
var Ck = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
};
var St = function () {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
};
var Ed = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
};
var Tr = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    </svg>
  );
};
var Cp = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
};
var Sr = function () {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
};
var Ch = function () {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
};

var ic8 = [Pl, Ex, Ck, St, Ed, Tr, Cp, Sr];

function Lbl(props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "4px",
        marginTop: "2px",
      }}
    >
      <span
        style={{
          background: C.accent + "22",
          color: C.accent,
          fontSize: "9px",
          fontWeight: 700,
          padding: "0 4px",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      >
        {props.n}
      </span>
      <span style={{ fontSize: "9.5px", color: C.mute, lineHeight: 1.4 }}>
        {props.children}
      </span>
    </div>
  );
}

/* ─── A+R1: 8-col with defaults ─── */
function AR1_1() {
  return (
    <section data-grid="8">
      <h3 data-span="7" style={{ borderBottom: "none", paddingBottom: 0 }}>
        Task Manager
      </h3>
      <button data-span="1" data-skin="ghost square">
        <Ch />
      </button>
      {ic8.map(function (Ic, i) {
        return (
          <button key={i} data-skin="square">
            <Ic />
          </button>
        );
      })}
      <label
        data-span="1"
        style={{ alignSelf: "center", justifySelf: "center" }}
      >
        <Sr />
      </label>
      <input data-span="5" type="search" placeholder="Search tasks..." />
      <button data-span="2">Find</button>
      <p>
        Manage your tasks efficiently. Add items, set priorities, and track
        completion.
      </p>
      <button>New</button>
      <button>Import</button>
      <button>Export</button>
      <button data-skin="emphasis">Sync</button>
      <button data-span="3">Delete</button>
      <button data-span="3">Archive</button>
      <button data-skin="emphasis">Move</button>
      <button data-span="4" data-skin="ghost">
        Cancel
      </button>
      <button data-span="4" data-skin="emphasis">
        Save All
      </button>
      <button data-span="8" data-skin="emphasis">
        Create New Task
      </button>
    </section>
  );
}

function AR1_2() {
  return (
    <section data-grid="8">
      <h3>New Task</h3>
      <label>Task name</label>
      <input type="text" placeholder="Enter task name" />
      <input data-span="4" type="text" placeholder="Category" />
      <input data-span="4" type="text" placeholder="Priority" />
      <label>Notes</label>
      <textarea rows={4} placeholder="Add details about this task..." />
      <label>
        <input type="checkbox" defaultChecked /> High priority
      </label>
      <label>
        <input type="checkbox" /> Notify on due date
      </label>
      <label>
        <input type="checkbox" defaultChecked /> Add to calendar
      </label>
      <label>
        <input type="checkbox" /> Require approval
      </label>
      <button data-span="4" data-skin="ghost">
        Discard
      </button>
      <button data-span="4" data-skin="emphasis">
        Add Task
      </button>
    </section>
  );
}

/* ─── R3: mandatory row containers ─── */
function R3_1() {
  return (
    <section>
      <div data-row="7-1">
        <h3 style={{ borderBottom: "none", paddingBottom: 0 }}>Task Manager</h3>
        <button data-skin="ghost square">
          <Ch />
        </button>
      </div>
      <div data-row="8">
        {ic8.map(function (Ic, i) {
          return (
            <button key={i} data-skin="square">
              <Ic />
            </button>
          );
        })}
      </div>
      <div data-row="1-5-2">
        <label style={{ alignSelf: "center", justifySelf: "center" }}>
          <Sr />
        </label>
        <input type="search" placeholder="Search tasks..." />
        <button data-skin="emphasis">Find</button>
      </div>
      <div data-row="1">
        <p>
          Manage your tasks efficiently. Add items, set priorities, and track
          completion.
        </p>
      </div>
      <div data-row="4">
        <button>New</button>
        <button>Import</button>
        <button>Export</button>
        <button data-skin="emphasis">Sync</button>
      </div>
      <div data-row="3">
        <button>Delete</button>
        <button>Archive</button>
        <button data-skin="emphasis">Move</button>
      </div>
      <div data-row="2">
        <button data-skin="ghost">Cancel</button>
        <button data-skin="emphasis">Save All</button>
      </div>
      <div data-row="1">
        <button data-skin="emphasis">Create New Task</button>
      </div>
    </section>
  );
}

function R3_2() {
  return (
    <section>
      <div data-row="1">
        <h3>New Task</h3>
      </div>
      <div data-row="1">
        <label>Task name</label>
      </div>
      <div data-row="1">
        <input type="text" placeholder="Enter task name" />
      </div>
      <div data-row="2">
        <input type="text" placeholder="Category" />
        <input type="text" placeholder="Priority" />
      </div>
      <div data-row="1">
        <label>Notes</label>
      </div>
      <div data-row="1">
        <textarea rows={4} placeholder="Add details about this task..." />
      </div>
      <div data-row="1">
        <label>
          <input type="checkbox" defaultChecked /> High priority
        </label>
      </div>
      <div data-row="1">
        <label>
          <input type="checkbox" /> Notify on due date
        </label>
      </div>
      <div data-row="1">
        <label>
          <input type="checkbox" defaultChecked /> Add to calendar
        </label>
      </div>
      <div data-row="1">
        <label>
          <input type="checkbox" /> Require approval
        </label>
      </div>
      <div data-row="2">
        <button data-skin="ghost">Discard</button>
        <button data-skin="emphasis">Add Task</button>
      </div>
    </section>
  );
}

/* ─── C+R1: combo with defaults ─── */
function CR1_1() {
  return (
    <section data-skin="cols-8">
      <h3 data-span="7" style={{ borderBottom: "none", paddingBottom: 0 }}>
        Task Manager
      </h3>
      <button data-skin="ghost square">
        <Ch />
      </button>
      {ic8.map(function (Ic, i) {
        return (
          <button key={i} data-skin="square">
            <Ic />
          </button>
        );
      })}
      <label
        data-span="1"
        style={{ alignSelf: "center", justifySelf: "center" }}
      >
        <Sr />
      </label>
      <input data-span="5" type="search" placeholder="Search tasks..." />
      <button data-span="2" data-skin="emphasis">
        Find
      </button>
      <p data-span="8">
        Manage your tasks efficiently. Add items, set priorities, and track
        completion.
      </p>
      <button data-span="2">New</button>
      <button data-span="2">Import</button>
      <button data-span="2">Export</button>
      <button data-span="2" data-skin="emphasis">
        Sync
      </button>
      <button data-span="3">Delete</button>
      <button data-span="3">Archive</button>
      <button data-span="2" data-skin="emphasis">
        Move
      </button>
      <button data-span="4" data-skin="ghost">
        Cancel
      </button>
      <button data-span="4" data-skin="emphasis">
        Save All
      </button>
      <button data-span="8" data-skin="emphasis">
        Create New Task
      </button>
    </section>
  );
}

function CR1_2() {
  return (
    <section>
      <h3>New Task</h3>
      <label>Task name</label>
      <input type="text" placeholder="Enter task name" />
      <section
        data-skin="cols-2"
        style={{ border: "none", padding: 0, background: "transparent" }}
      >
        <input type="text" placeholder="Category" />
        <input type="text" placeholder="Priority" />
      </section>
      <label>Notes</label>
      <textarea rows={4} placeholder="Add details about this task..." />
      <label>
        <input type="checkbox" defaultChecked /> High priority
      </label>
      <label>
        <input type="checkbox" /> Notify on due date
      </label>
      <label>
        <input type="checkbox" defaultChecked /> Add to calendar
      </label>
      <label>
        <input type="checkbox" /> Require approval
      </label>
      <section
        data-skin="cols-2"
        style={{ border: "none", padding: 0, background: "transparent" }}
      >
        <button data-skin="ghost">Discard</button>
        <button data-skin="emphasis">Add Task</button>
      </section>
    </section>
  );
}

/* ─── Annotations ─── */
var ann = {
  "AR1-1": [
    {
      n: "1",
      t: "h3 still needs span=7 override (default=8, but chevron steals 1)",
    },
    { n: "2", t: "8 icons: square skin implies span=1. ZERO attrs." },
    { n: "3", t: "Search: label[1] + input[5] + btn[2]. 3 overrides." },
    { n: "4", t: "Text: p defaults to span=8. ZERO attrs." },
    {
      n: "5",
      t: "4 btns: button has no default span\u2014auto-places 1-wide. Occupies 4 cells, leaves 4 empty. WRONG.",
    },
    { n: "6", t: "3 btns: span=3,3,2. Still asymmetric." },
    { n: "7", t: "2 btns: span=4,4. Override needed." },
    { n: "8", t: "1 btn: span=8 override (or 'full' skin)." },
  ],
  "AR1-2": [
    { n: "9", t: "h3 defaults span=8. ZERO attrs." },
    { n: "10", t: "label+input both default span=8. ZERO attrs." },
    { n: "11", t: "2 inputs: span=4 override on each." },
    { n: "12", t: "textarea defaults span=8. ZERO attrs." },
    { n: "13", t: "Checklist: labels default span=8. ZERO attrs." },
  ],
  "R3-1": [
    {
      n: "1",
      t: 'row="7-1" defines exact proportion. Children just fill. ZERO child attrs.',
    },
    {
      n: "2",
      t: 'row="8" \u2014 8 cells. Children auto-fill. ZERO child attrs.',
    },
    { n: "3", t: 'row="1-5-2" \u2014 custom proportions. ZERO child attrs.' },
    { n: "4", t: 'row="1" \u2014 single cell. Full width. ZERO child attrs.' },
    { n: "5", t: 'row="4" \u2014 4 cells. ZERO child attrs.' },
    {
      n: "6",
      t: 'row="3" \u2014 3 cells. No awkward division. ZERO child attrs.',
    },
    { n: "7", t: 'row="2" \u2014 2 cells. ZERO child attrs.' },
    { n: "8", t: 'row="1" \u2014 full width. ZERO child attrs.' },
  ],
  "R3-2": [
    {
      n: "9",
      t: 'row="1" for everything single-width. Verbose but consistent.',
    },
    { n: "10", t: "Two separate row=1 for label and input. Verbose." },
    { n: "11", t: 'row="2" for side-by-side inputs. ZERO child attrs.' },
    { n: "12", t: 'row="1" for textarea. Verbose.' },
    { n: "13", t: 'row="1" x4 for checklist items. 4 wrappers for 4 items.' },
  ],
  "CR1-1": [
    { n: "1", t: "h3[span=7] in cols-8 parent. 1 child attr." },
    { n: "2", t: "8 icons: auto-fill 1 col each. ZERO child attrs." },
    { n: "3", t: "Search: label[1]+input[5]+btn[2]. 3 child attrs." },
    { n: "4", t: "p needs span=8 (multi-col parent). No default help here." },
    { n: "5", t: "4 btns: span=2 each. 4 child attrs." },
    { n: "6", t: "3 btns: 3+3+2. 3 child attrs." },
    { n: "7", t: "2 btns: span=4 each. 2 child attrs." },
    { n: "8", t: "1 btn: span=8. 1 child attr." },
  ],
  "CR1-2": [
    { n: "9", t: "Default 1-col section. h3 fills naturally. ZERO attrs." },
    { n: "10", t: "label+input fill naturally. ZERO attrs." },
    { n: "11", t: "Inner section[cols-2]. 1 nesting, zero child attrs." },
    { n: "12", t: "textarea fills naturally. ZERO attrs." },
    { n: "13", t: "Labels fill naturally. ZERO attrs." },
  ],
};

var costs = {
  "A+R1": {
    spans: 14,
    rows: 0,
    inner: 0,
    depth: "3",
    wrappers: 0,
    note: "Defaults eliminate content attrs. Buttons still need spans. The 4-button row exposes the core problem: button has no good default width in an 8-col grid.",
  },
  R3: {
    spans: 0,
    rows: 19,
    inner: 0,
    depth: "4 always",
    wrappers: 19,
    note: "ZERO child attributes across all 13 patterns. Every layout decision moves to the row. But 11 row=1 wrappers for single items is a 58% overhead tax. The form section is almost comically verbose.",
  },
  "C+R1": {
    spans: 14,
    rows: 0,
    inner: 2,
    depth: "3 (2 breaks)",
    wrappers: 0,
    note: "Section 1 (cols-8) still needs 14 child spans. Section 2 (default 1-col) is pristine. The 2 inner sections are the only structural cost. Same as C from before\u2014R1 defaults don't help in a multi-col parent.",
  },
};

export default function App() {
  var [ap, setAp] = useState("A+R1");

  useEffect(function () {
    var id = "bp-css-r";
    if (!document.getElementById(id)) {
      var el = document.createElement("style");
      el.id = id;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
  }, []);

  var tabs = [
    { key: "A+R1", label: "A + R1", desc: "8-col + defaults", color: C.green },
    { key: "R3", label: "R3", desc: "Mandatory rows", color: C.cyan },
    { key: "C+R1", label: "C + R1", desc: "Combo + defaults", color: C.accent },
  ];

  var s1fn = ap === "A+R1" ? AR1_1 : ap === "R3" ? R3_1 : CR1_1;
  var s2fn = ap === "A+R1" ? AR1_2 : ap === "R3" ? R3_2 : CR1_2;
  var k1 = ap === "A+R1" ? "AR1-1" : ap === "R3" ? "R3-1" : "CR1-1";
  var k2 = ap === "A+R1" ? "AR1-2" : ap === "R3" ? "R3-2" : "CR1-2";
  var co = costs[ap];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "-apple-system,system-ui,sans-serif",
        padding: "12px 10px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "17px",
          fontWeight: 800,
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
        }}
      >
        R-Options Compared
      </h1>
      <p
        style={{
          fontSize: "11px",
          color: C.mute,
          margin: "0 0 12px",
          lineHeight: 1.5,
        }}
      >
        Same 13 patterns, 2 sections. Three refinement strategies.
      </p>

      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "12px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: C.bg,
          padding: "6px 0",
        }}
      >
        {tabs.map(function (t) {
          var on = ap === t.key;
          return (
            <button
              key={t.key}
              onClick={function () {
                setAp(t.key);
              }}
              style={{
                flex: 1,
                padding: "7px 4px 5px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "center",
                background: on ? t.color + "18" : "transparent",
                border: "1.5px solid " + (on ? t.color : C.border),
                borderRadius: "6px",
                color: on ? t.color : C.mute,
              }}
            >
              <div style={{ fontSize: "11.5px", fontWeight: 700 }}>
                {t.label}
              </div>
              <div style={{ fontSize: "9px", marginTop: "1px", opacity: 0.8 }}>
                {t.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Section 1 */}
      <div
        style={{
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid " + C.border,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700 }}>
            Toolbar + Actions
          </span>
          <span style={{ fontSize: "10px", color: C.mute }}>1\u20138</span>
        </div>
        <div
          className="bp"
          style={{
            padding: "8px",
            background: C.bg,
            fontFamily: "system-ui,sans-serif",
            fontSize: "12px",
            color: C.text,
          }}
        >
          {s1fn()}
        </div>
        <div
          style={{
            padding: "6px 12px 8px",
            borderTop: "1px solid " + C.border,
          }}
        >
          {ann[k1].map(function (a) {
            return (
              <Lbl key={a.n} n={a.n}>
                {a.t}
              </Lbl>
            );
          })}
        </div>
      </div>

      {/* Section 2 */}
      <div
        style={{
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid " + C.border,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700 }}>Form</span>
          <span style={{ fontSize: "10px", color: C.mute }}>9\u201313</span>
        </div>
        <div
          className="bp"
          style={{
            padding: "8px",
            background: C.bg,
            fontFamily: "system-ui,sans-serif",
            fontSize: "12px",
            color: C.text,
          }}
        >
          {s2fn()}
        </div>
        <div
          style={{
            padding: "6px 12px 8px",
            borderTop: "1px solid " + C.border,
          }}
        >
          {ann[k2].map(function (a) {
            return (
              <Lbl key={a.n} n={a.n}>
                {a.t}
              </Lbl>
            );
          })}
        </div>
      </div>

      {/* Cost panel */}
      <div
        style={{
          padding: "12px",
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
          Cost
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          {[
            ["data-span", co.spans],
            ["data-row", co.rows],
            ["inner sect.", co.inner],
            ["wrappers", co.wrappers],
          ].map(function (r) {
            var col = r[1] > 10 ? C.red : r[1] > 0 ? C.amber : C.green;
            return (
              <div key={r[0]} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: col }}>
                  {r[1]}
                </div>
                <div
                  style={{ fontSize: "9px", color: C.mute, lineHeight: 1.3 }}
                >
                  {r[0]}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: "10px", color: C.mute, marginBottom: "6px" }}>
          Max depth: <strong style={{ color: C.text }}>{co.depth}</strong>
        </div>
        <div style={{ fontSize: "11px", color: C.mute, lineHeight: 1.6 }}>
          {co.note}
        </div>
      </div>

      {/* Big comparison */}
      <div
        style={{
          padding: "12px",
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
          All Options
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid " + C.border }}>
              <th
                style={{ textAlign: "left", padding: "4px 0", color: C.mute }}
              >
                Metric
              </th>
              <th
                style={{ textAlign: "center", padding: "4px", color: C.green }}
              >
                A+R1
              </th>
              <th
                style={{ textAlign: "center", padding: "4px", color: C.cyan }}
              >
                R3
              </th>
              <th
                style={{ textAlign: "center", padding: "4px", color: C.accent }}
              >
                C+R1
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Child attrs", 14, 0, 14],
              ["Row wrappers", 0, 19, 0],
              ["Inner sections", 0, 0, 2],
              ["Max depth", 3, 4, 3],
              ["Depth violations", 0, 0, 0],
              ["Form attrs needed", 4, 0, 0],
              ["Toolbar attrs needed", 10, 0, 14],
              ["Total DOM nodes (sec1)", "~23", "~31", "~25"],
              ["Total DOM nodes (sec2)", "~14", "~25", "~16"],
              ["LLM decisions/element", "0\u20131", "0\u20131", "0\u20131"],
            ].map(function (r) {
              return (
                <tr
                  key={r[0]}
                  style={{ borderBottom: "1px solid " + C.border + "33" }}
                >
                  <td style={{ padding: "3px 0", color: C.mute }}>{r[0]}</td>
                  {[r[1], r[2], r[3]].map(function (v, i) {
                    var col = C.text;
                    if (typeof v === "number") {
                      col = v === 0 ? C.green : v <= 4 ? C.amber : C.red;
                    }
                    return (
                      <td
                        key={i}
                        style={{
                          textAlign: "center",
                          color: col,
                          fontWeight: typeof v === "number" ? 700 : 400,
                        }}
                      >
                        {v}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Analysis */}
      <div
        style={{
          padding: "12px",
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
          Analysis
        </div>
        <div style={{ fontSize: "11px", color: C.mute, lineHeight: 1.7 }}>
          <strong style={{ color: C.green }}>A+R1</strong> cuts A's 31 attrs to
          14 via defaults. Form section drops from 17 to 4 attrs. Toolbar
          section barely improves (13\u219210) because buttons have no stable
          default width. The core R1 problem:{" "}
          <strong style={{ color: C.text }}>
            defaults only help elements that are ALWAYS the same width
          </strong>
          . Text, labels, textareas = always full. Buttons = contextual. Inputs
          = usually full, sometimes half.
          {"\n\n"}
          <strong style={{ color: C.cyan }}>R3</strong> achieves zero child
          attributes by moving ALL layout decisions to the row container. Every
          row is a self-contained grid declaration. Children just fill. The
          cost: <strong style={{ color: C.text }}>19 wrapper divs</strong> for
          13 patterns. 11 of those are row="1" wrapping a single element. The
          form section has 11 rows for 11 items \u2014 1:1 wrapper ratio. This
          is the table-row tax: structurally pure but verbally expensive.
          {"\n\n"}
          <strong style={{ color: C.accent }}>C+R1</strong> is unchanged from C
          \u2014 R1 defaults don't help inside a multi-col parent because the
          parent's grid overrides element defaults. Section 2 is clean because
          it's default 1-col. The 2 inner sections for cols-2 rows are minor but
          exist.
          {"\n\n"}
          <strong style={{ color: C.text }}>The deeper question:</strong> Is the
          LLM tax from data-span="4" on a button greater or less than the LLM
          tax from wrapping every element in a data-row="1" div? Both are
          mechanical. Neither requires judgment. But span attrs are{" "}
          <em>already on the element</em> (no new DOM node). Row wrappers add{" "}
          <em>new nodes</em> that the LLM must always generate, even for trivial
          content.
          {"\n\n"}
          <strong style={{ color: C.text }}>Missing option?</strong> R3 with a
          twist: rows are only mandatory for multi-element rows. Single elements
          become direct section children (no row wrapper). Multi-element rows
          get data-row="N". This cuts 19 wrappers to ~8. It's R3 for the 40% of
          rows that need layout + default-1-col for the 60% that don't. Call it{" "}
          <strong style={{ color: C.amber }}>R3-lite</strong>.
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          textAlign: "center",
          fontSize: "10px",
          color: C.mute,
          padding: "8px 0",
        }}
      >
        Blueprint R-Options Comparison
      </div>
    </div>
  );
}
