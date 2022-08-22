var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function noop() {
}
__name(noop, "noop");
const identity = /* @__PURE__ */ __name((x) => x, "identity");
function assign(tar, src) {
  for (const k in src)
    tar[k] = src[k];
  return tar;
}
__name(assign, "assign");
function run(fn) {
  return fn();
}
__name(run, "run");
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
__name(blank_object, "blank_object");
function run_all(fns) {
  fns.forEach(run);
}
__name(run_all, "run_all");
function is_function(thing) {
  return typeof thing === "function";
}
__name(is_function, "is_function");
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
__name(safe_not_equal, "safe_not_equal");
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement("a");
  }
  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}
__name(src_url_equal, "src_url_equal");
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
__name(is_empty, "is_empty");
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
__name(subscribe, "subscribe");
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
__name(get_store_value, "get_store_value");
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
__name(component_subscribe, "component_subscribe");
function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}
__name(create_slot, "create_slot");
function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
__name(get_slot_context, "get_slot_context");
function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    const lets = definition[2](fn(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
__name(get_slot_changes, "get_slot_changes");
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
__name(update_slot_base, "update_slot_base");
function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    const dirty = [];
    const length = $$scope.ctx.length / 32;
    for (let i = 0; i < length; i++) {
      dirty[i] = -1;
    }
    return dirty;
  }
  return -1;
}
__name(get_all_dirty_from_scope, "get_all_dirty_from_scope");
function set_store_value(store, ret, value) {
  store.set(value);
  return ret;
}
__name(set_store_value, "set_store_value");
function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
__name(action_destroyer, "action_destroyer");
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
__name(run_tasks, "run_tasks");
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
__name(loop, "loop");
function append(target, node) {
  target.appendChild(node);
}
__name(append, "append");
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
__name(get_root_for_style, "get_root_for_style");
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
__name(append_empty_stylesheet, "append_empty_stylesheet");
function append_stylesheet(node, style) {
  append(node.head || node, style);
}
__name(append_stylesheet, "append_stylesheet");
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
__name(insert, "insert");
function detach(node) {
  node.parentNode.removeChild(node);
}
__name(detach, "detach");
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
__name(destroy_each, "destroy_each");
function element(name) {
  return document.createElement(name);
}
__name(element, "element");
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
__name(svg_element, "svg_element");
function text(data) {
  return document.createTextNode(data);
}
__name(text, "text");
function space() {
  return text(" ");
}
__name(space, "space");
function empty() {
  return text("");
}
__name(empty, "empty");
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
__name(listen, "listen");
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
}
__name(prevent_default, "prevent_default");
function stop_propagation(fn) {
  return function(event) {
    event.stopPropagation();
    return fn.call(this, event);
  };
}
__name(stop_propagation, "stop_propagation");
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
__name(attr, "attr");
function to_number(value) {
  return value === "" ? null : +value;
}
__name(to_number, "to_number");
function children(element2) {
  return Array.from(element2.childNodes);
}
__name(children, "children");
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
__name(set_data, "set_data");
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
__name(set_input_value, "set_input_value");
function set_style(node, key, value, important) {
  if (value === null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value, important ? "important" : "");
  }
}
__name(set_style, "set_style");
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
__name(select_option, "select_option");
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
__name(select_value, "select_value");
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
__name(custom_event, "custom_event");
class HtmlTag {
  constructor(is_svg = false) {
    this.is_svg = false;
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  c(html) {
    this.h(html);
  }
  m(html, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(target.nodeName);
      else
        this.e = element(target.nodeName);
      this.t = target;
      this.c(html);
    }
    this.i(anchor);
  }
  h(html) {
    this.e.innerHTML = html;
    this.n = Array.from(this.e.childNodes);
  }
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  p(html) {
    this.d();
    this.h(html);
    this.i(this.a);
  }
  d() {
    this.n.forEach(detach);
  }
}
__name(HtmlTag, "HtmlTag");
const managed_styles = /* @__PURE__ */ new Map();
let active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
__name(hash, "hash");
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
__name(create_style_information, "create_style_information");
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
__name(create_rule, "create_rule");
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
__name(delete_rule, "delete_rule");
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info) => {
      const { stylesheet } = info;
      let i = stylesheet.cssRules.length;
      while (i--)
        stylesheet.deleteRule(i);
      info.rules = {};
    });
    managed_styles.clear();
  });
}
__name(clear_rules, "clear_rules");
let current_component;
function set_current_component(component) {
  current_component = component;
}
__name(set_current_component, "set_current_component");
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
__name(get_current_component, "get_current_component");
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
__name(onDestroy, "onDestroy");
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
  return context;
}
__name(setContext, "setContext");
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
__name(getContext, "getContext");
function bubble(component, event) {
  const callbacks = component.$$.callbacks[event.type];
  if (callbacks) {
    callbacks.slice().forEach((fn) => fn.call(this, event));
  }
}
__name(bubble, "bubble");
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
__name(schedule_update, "schedule_update");
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
__name(add_render_callback, "add_render_callback");
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
__name(add_flush_callback, "add_flush_callback");
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
__name(flush, "flush");
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
__name(update, "update");
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
__name(wait, "wait");
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
__name(dispatch, "dispatch");
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
__name(group_outros, "group_outros");
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
__name(check_outros, "check_outros");
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
__name(transition_in, "transition_in");
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
__name(transition_out, "transition_out");
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  __name(cleanup, "cleanup");
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(t, 1 - t);
        }
      }
      return running;
    });
  }
  __name(go, "go");
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
__name(create_in_transition, "create_in_transition");
function create_out_transition(node, fn, params) {
  let config = fn(node, params);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(1 - t, t);
        }
      }
      return running;
    });
  }
  __name(go, "go");
  if (is_function(config)) {
    wait().then(() => {
      config = config();
      go();
    });
  } else {
    go();
  }
  return {
    end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
__name(create_out_transition, "create_out_transition");
function destroy_block(block, lookup) {
  block.d(1);
  lookup.delete(block.key);
}
__name(destroy_block, "destroy_block");
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
  let o = old_blocks.length;
  let n = list.length;
  let i = o;
  const old_indexes = {};
  while (i--)
    old_indexes[old_blocks[i].key] = i;
  const new_blocks = [];
  const new_lookup = /* @__PURE__ */ new Map();
  const deltas = /* @__PURE__ */ new Map();
  i = n;
  while (i--) {
    const child_ctx = get_context(ctx, list, i);
    const key = get_key(child_ctx);
    let block = lookup.get(key);
    if (!block) {
      block = create_each_block2(key, child_ctx);
      block.c();
    } else if (dynamic) {
      block.p(child_ctx, dirty);
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes)
      deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  const will_move = /* @__PURE__ */ new Set();
  const did_move = /* @__PURE__ */ new Set();
  function insert2(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }
  __name(insert2, "insert");
  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.key;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert2(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert2(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block.key))
      destroy(old_block, lookup);
  }
  while (n)
    insert2(new_blocks[n - 1]);
  return new_blocks;
}
__name(update_keyed_each, "update_keyed_each");
function get_spread_update(levels, updates) {
  const update2 = {};
  const to_null_out = {};
  const accounted_for = { $$scope: 1 };
  let i = levels.length;
  while (i--) {
    const o = levels[i];
    const n = updates[i];
    if (n) {
      for (const key in o) {
        if (!(key in n))
          to_null_out[key] = 1;
      }
      for (const key in n) {
        if (!accounted_for[key]) {
          update2[key] = n[key];
          accounted_for[key] = 1;
        }
      }
      levels[i] = n;
    } else {
      for (const key in o) {
        accounted_for[key] = 1;
      }
    }
  }
  for (const key in to_null_out) {
    if (!(key in update2))
      update2[key] = void 0;
  }
  return update2;
}
__name(get_spread_update, "get_spread_update");
function get_spread_object(spread_props) {
  return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
}
__name(get_spread_object, "get_spread_object");
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}
__name(bind, "bind");
function create_component(block) {
  block && block.c();
}
__name(create_component, "create_component");
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
__name(mount_component, "mount_component");
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
__name(destroy_component, "destroy_component");
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
__name(make_dirty, "make_dirty");
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
__name(init, "init");
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
__name(SvelteComponent, "SvelteComponent");
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
__name(readable, "readable");
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  __name(set2, "set");
  function update2(fn) {
    set2(fn(value));
  }
  __name(update2, "update");
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  __name(subscribe2, "subscribe");
  return { set: set2, update: update2, subscribe: subscribe2 };
}
__name(writable, "writable");
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set2) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = /* @__PURE__ */ __name(() => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set2);
      if (auto) {
        set2(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    }, "sync");
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return /* @__PURE__ */ __name(function stop() {
      run_all(unsubscribers);
      cleanup();
    }, "stop");
  });
}
__name(derived, "derived");
const s_UUIDV4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (globalThis.crypto || globalThis.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
__name(uuidv4, "uuidv4");
uuidv4.isValid = (uuid) => s_UUIDV4_REGEX.test(uuid);
const s_REGEX = /(\d+)\s*px/;
function styleParsePixels(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const isPixels = s_REGEX.test(value);
  const number = parseInt(value);
  return isPixels && Number.isFinite(number) ? number : void 0;
}
__name(styleParsePixels, "styleParsePixels");
const applicationShellContract = ["elementRoot"];
Object.freeze(applicationShellContract);
function isApplicationShell(component) {
  if (component === null || component === void 0) {
    return false;
  }
  let compHasContract = true;
  let protoHasContract = true;
  for (const accessor of applicationShellContract) {
    const descriptor = Object.getOwnPropertyDescriptor(component, accessor);
    if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) {
      compHasContract = false;
    }
  }
  const prototype = Object.getPrototypeOf(component);
  for (const accessor of applicationShellContract) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, accessor);
    if (descriptor === void 0 || descriptor.get === void 0 || descriptor.set === void 0) {
      protoHasContract = false;
    }
  }
  return compHasContract || protoHasContract;
}
__name(isApplicationShell, "isApplicationShell");
function isHMRProxy(comp) {
  const instanceName = comp?.constructor?.name;
  if (typeof instanceName === "string" && (instanceName.startsWith("Proxy<") || instanceName === "ProxyComponent")) {
    return true;
  }
  const prototypeName = comp?.prototype?.constructor?.name;
  return typeof prototypeName === "string" && (prototypeName.startsWith("Proxy<") || prototypeName === "ProxyComponent");
}
__name(isHMRProxy, "isHMRProxy");
function isSvelteComponent(comp) {
  if (comp === null || comp === void 0 || typeof comp !== "function") {
    return false;
  }
  const prototypeName = comp?.prototype?.constructor?.name;
  if (typeof prototypeName === "string" && (prototypeName.startsWith("Proxy<") || prototypeName === "ProxyComponent")) {
    return true;
  }
  return typeof window !== void 0 ? typeof comp.prototype.$destroy === "function" && typeof comp.prototype.$on === "function" : typeof comp.render === "function";
}
__name(isSvelteComponent, "isSvelteComponent");
async function outroAndDestroy(instance2) {
  return new Promise((resolve) => {
    if (instance2.$$.fragment && instance2.$$.fragment.o) {
      group_outros();
      transition_out(instance2.$$.fragment, 0, 0, () => {
        instance2.$destroy();
        resolve();
      });
      check_outros();
    } else {
      instance2.$destroy();
      resolve();
    }
  });
}
__name(outroAndDestroy, "outroAndDestroy");
function parseSvelteConfig(config, thisArg = void 0) {
  if (typeof config !== "object") {
    throw new TypeError(`parseSvelteConfig - 'config' is not an object:
${JSON.stringify(config)}.`);
  }
  if (!isSvelteComponent(config.class)) {
    throw new TypeError(
      `parseSvelteConfig - 'class' is not a Svelte component constructor for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.hydrate !== void 0 && typeof config.hydrate !== "boolean") {
    throw new TypeError(
      `parseSvelteConfig - 'hydrate' is not a boolean for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.intro !== void 0 && typeof config.intro !== "boolean") {
    throw new TypeError(
      `parseSvelteConfig - 'intro' is not a boolean for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.target !== void 0 && typeof config.target !== "string" && !(config.target instanceof HTMLElement) && !(config.target instanceof ShadowRoot) && !(config.target instanceof DocumentFragment)) {
    throw new TypeError(
      `parseSvelteConfig - 'target' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.anchor !== void 0 && typeof config.anchor !== "string" && !(config.anchor instanceof HTMLElement) && !(config.anchor instanceof ShadowRoot) && !(config.anchor instanceof DocumentFragment)) {
    throw new TypeError(
      `parseSvelteConfig - 'anchor' is not a string, HTMLElement, ShadowRoot, or DocumentFragment for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.context !== void 0 && typeof config.context !== "function" && !(config.context instanceof Map) && typeof config.context !== "object") {
    throw new TypeError(
      `parseSvelteConfig - 'context' is not a Map, function or object for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.selectorTarget !== void 0 && typeof config.selectorTarget !== "string") {
    throw new TypeError(
      `parseSvelteConfig - 'selectorTarget' is not a string for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.options !== void 0 && typeof config.options !== "object") {
    throw new TypeError(
      `parseSvelteConfig - 'options' is not an object for config:
${JSON.stringify(config)}.`
    );
  }
  if (config.options !== void 0) {
    if (config.options.injectApp !== void 0 && typeof config.options.injectApp !== "boolean") {
      throw new TypeError(
        `parseSvelteConfig - 'options.injectApp' is not a boolean for config:
${JSON.stringify(config)}.`
      );
    }
    if (config.options.injectEventbus !== void 0 && typeof config.options.injectEventbus !== "boolean") {
      throw new TypeError(
        `parseSvelteConfig - 'options.injectEventbus' is not a boolean for config:
${JSON.stringify(config)}.`
      );
    }
    if (config.options.selectorElement !== void 0 && typeof config.options.selectorElement !== "string") {
      throw new TypeError(
        `parseSvelteConfig - 'selectorElement' is not a string for config:
${JSON.stringify(config)}.`
      );
    }
  }
  const svelteConfig = { ...config };
  delete svelteConfig.options;
  let externalContext = {};
  if (typeof svelteConfig.context === "function") {
    const contextFunc = svelteConfig.context;
    delete svelteConfig.context;
    const result = contextFunc.call(thisArg);
    if (typeof result === "object") {
      externalContext = { ...result };
    } else {
      throw new Error(`parseSvelteConfig - 'context' is a function that did not return an object for config:
${JSON.stringify(config)}`);
    }
  } else if (svelteConfig.context instanceof Map) {
    externalContext = Object.fromEntries(svelteConfig.context);
    delete svelteConfig.context;
  } else if (typeof svelteConfig.context === "object") {
    externalContext = svelteConfig.context;
    delete svelteConfig.context;
  }
  svelteConfig.props = s_PROCESS_PROPS(svelteConfig.props, thisArg, config);
  if (Array.isArray(svelteConfig.children)) {
    const children2 = [];
    for (let cntr = 0; cntr < svelteConfig.children.length; cntr++) {
      const child = svelteConfig.children[cntr];
      if (!isSvelteComponent(child.class)) {
        throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for child[${cntr}] for config:
${JSON.stringify(config)}`);
      }
      child.props = s_PROCESS_PROPS(child.props, thisArg, config);
      children2.push(child);
    }
    if (children2.length > 0) {
      externalContext.children = children2;
    }
    delete svelteConfig.children;
  } else if (typeof svelteConfig.children === "object") {
    if (!isSvelteComponent(svelteConfig.children.class)) {
      throw new Error(`parseSvelteConfig - 'class' is not a Svelte component for children object for config:
${JSON.stringify(config)}`);
    }
    svelteConfig.children.props = s_PROCESS_PROPS(svelteConfig.children.props, thisArg, config);
    externalContext.children = [svelteConfig.children];
    delete svelteConfig.children;
  }
  if (!(svelteConfig.context instanceof Map)) {
    svelteConfig.context = /* @__PURE__ */ new Map();
  }
  svelteConfig.context.set("external", externalContext);
  return svelteConfig;
}
__name(parseSvelteConfig, "parseSvelteConfig");
function s_PROCESS_PROPS(props, thisArg, config) {
  if (typeof props === "function") {
    const result = props.call(thisArg);
    if (typeof result === "object") {
      return result;
    } else {
      throw new Error(`parseSvelteConfig - 'props' is a function that did not return an object for config:
${JSON.stringify(config)}`);
    }
  } else if (typeof props === "object") {
    return props;
  } else if (props !== void 0) {
    throw new Error(
      `parseSvelteConfig - 'props' is not a function or an object for config:
${JSON.stringify(config)}`
    );
  }
  return {};
}
__name(s_PROCESS_PROPS, "s_PROCESS_PROPS");
function debounce(callback, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
__name(debounce, "debounce");
function hasGetter(object, accessor) {
  if (object === null || object === void 0) {
    return false;
  }
  const iDescriptor = Object.getOwnPropertyDescriptor(object, accessor);
  if (iDescriptor !== void 0 && iDescriptor.get !== void 0) {
    return true;
  }
  for (let o = Object.getPrototypeOf(object); o; o = Object.getPrototypeOf(o)) {
    const descriptor = Object.getOwnPropertyDescriptor(o, accessor);
    if (descriptor !== void 0 && descriptor.get !== void 0) {
      return true;
    }
  }
  return false;
}
__name(hasGetter, "hasGetter");
function set(obj, key, val) {
  if (typeof val.value === "object")
    val.value = klona(val.value);
  if (!val.enumerable || val.get || val.set || !val.configurable || !val.writable || key === "__proto__") {
    Object.defineProperty(obj, key, val);
  } else
    obj[key] = val.value;
}
__name(set, "set");
function klona(x) {
  if (typeof x !== "object")
    return x;
  var i = 0, k, list, tmp, str = Object.prototype.toString.call(x);
  if (str === "[object Object]") {
    tmp = Object.create(x.__proto__ || null);
  } else if (str === "[object Array]") {
    tmp = Array(x.length);
  } else if (str === "[object Set]") {
    tmp = /* @__PURE__ */ new Set();
    x.forEach(function(val) {
      tmp.add(klona(val));
    });
  } else if (str === "[object Map]") {
    tmp = /* @__PURE__ */ new Map();
    x.forEach(function(val, key) {
      tmp.set(klona(key), klona(val));
    });
  } else if (str === "[object Date]") {
    tmp = new Date(+x);
  } else if (str === "[object RegExp]") {
    tmp = new RegExp(x.source, x.flags);
  } else if (str === "[object DataView]") {
    tmp = new x.constructor(klona(x.buffer));
  } else if (str === "[object ArrayBuffer]") {
    tmp = x.slice(0);
  } else if (str.slice(-6) === "Array]") {
    tmp = new x.constructor(x);
  }
  if (tmp) {
    for (list = Object.getOwnPropertySymbols(x); i < list.length; i++) {
      set(tmp, list[i], Object.getOwnPropertyDescriptor(x, list[i]));
    }
    for (i = 0, list = Object.getOwnPropertyNames(x); i < list.length; i++) {
      if (Object.hasOwnProperty.call(tmp, k = list[i]) && tmp[k] === x[k])
        continue;
      set(tmp, k, Object.getOwnPropertyDescriptor(x, k));
    }
  }
  return tmp || x;
}
__name(klona, "klona");
const s_TAG_OBJECT = "[object Object]";
function deepMerge(target = {}, ...sourceObj) {
  if (Object.prototype.toString.call(target) !== s_TAG_OBJECT) {
    throw new TypeError(`deepMerge error: 'target' is not an 'object'.`);
  }
  for (let cntr = 0; cntr < sourceObj.length; cntr++) {
    if (Object.prototype.toString.call(sourceObj[cntr]) !== s_TAG_OBJECT) {
      throw new TypeError(`deepMerge error: 'sourceObj[${cntr}]' is not an 'object'.`);
    }
  }
  return _deepMerge(target, ...sourceObj);
}
__name(deepMerge, "deepMerge");
function isIterable(value) {
  if (value === null || value === void 0 || typeof value !== "object") {
    return false;
  }
  return typeof value[Symbol.iterator] === "function";
}
__name(isIterable, "isIterable");
function isObject(value) {
  return value !== null && typeof value === "object";
}
__name(isObject, "isObject");
function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== s_TAG_OBJECT) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
__name(isPlainObject, "isPlainObject");
function safeAccess(data, accessor, defaultValue = void 0) {
  if (typeof data !== "object") {
    return defaultValue;
  }
  if (typeof accessor !== "string") {
    return defaultValue;
  }
  const access = accessor.split(".");
  for (let cntr = 0; cntr < access.length; cntr++) {
    if (typeof data[access[cntr]] === "undefined" || data[access[cntr]] === null) {
      return defaultValue;
    }
    data = data[access[cntr]];
  }
  return data;
}
__name(safeAccess, "safeAccess");
function safeSet(data, accessor, value, operation = "set", createMissing = true) {
  if (typeof data !== "object") {
    throw new TypeError(`safeSet Error: 'data' is not an 'object'.`);
  }
  if (typeof accessor !== "string") {
    throw new TypeError(`safeSet Error: 'accessor' is not a 'string'.`);
  }
  const access = accessor.split(".");
  for (let cntr = 0; cntr < access.length; cntr++) {
    if (Array.isArray(data)) {
      const number = +access[cntr];
      if (!Number.isInteger(number) || number < 0) {
        return false;
      }
    }
    if (cntr === access.length - 1) {
      switch (operation) {
        case "add":
          data[access[cntr]] += value;
          break;
        case "div":
          data[access[cntr]] /= value;
          break;
        case "mult":
          data[access[cntr]] *= value;
          break;
        case "set":
          data[access[cntr]] = value;
          break;
        case "set-undefined":
          if (typeof data[access[cntr]] === "undefined") {
            data[access[cntr]] = value;
          }
          break;
        case "sub":
          data[access[cntr]] -= value;
          break;
      }
    } else {
      if (createMissing && typeof data[access[cntr]] === "undefined") {
        data[access[cntr]] = {};
      }
      if (data[access[cntr]] === null || typeof data[access[cntr]] !== "object") {
        return false;
      }
      data = data[access[cntr]];
    }
  }
  return true;
}
__name(safeSet, "safeSet");
function _deepMerge(target = {}, ...sourceObj) {
  for (let cntr = 0; cntr < sourceObj.length; cntr++) {
    const obj = sourceObj[cntr];
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (prop.startsWith("-=")) {
          delete target[prop.slice(2)];
          continue;
        }
        target[prop] = Object.prototype.hasOwnProperty.call(target, prop) && target[prop]?.constructor === Object && obj[prop]?.constructor === Object ? _deepMerge({}, target[prop], obj[prop]) : obj[prop];
      }
    }
  }
  return target;
}
__name(_deepMerge, "_deepMerge");
class DynReducerUtils {
  static arrayEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let cntr = a.length; --cntr >= 0; ) {
      if (a[cntr] !== b[cntr]) {
        return false;
      }
    }
    return true;
  }
  static hashString(str, seed = 0) {
    let h1 = 3735928559 ^ seed, h2 = 1103547991 ^ seed;
    for (let ch, i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  static hashUnknown(value) {
    if (value === null || value === void 0) {
      return 0;
    }
    let result = 0;
    switch (typeof value) {
      case "boolean":
        result = value ? 1 : 0;
        break;
      case "bigint":
        result = Number(BigInt.asIntN(64, value));
        break;
      case "function":
        result = this.hashString(value.name);
        break;
      case "number":
        result = Number.isFinite(value) ? value : 0;
        break;
      case "object":
        break;
      case "string":
        result = this.hashString(value);
        break;
      case "symbol":
        result = this.hashString(Symbol.keyFor(value));
        break;
    }
    return result;
  }
  static hasPrototype(target, Prototype) {
    if (typeof target !== "function") {
      return false;
    }
    if (target === Prototype) {
      return true;
    }
    for (let proto = Object.getPrototypeOf(target); proto; proto = Object.getPrototypeOf(proto)) {
      if (proto === Prototype) {
        return true;
      }
    }
    return false;
  }
  static isIterable(data) {
    return data !== null && data !== void 0 && typeof data === "object" && typeof data[Symbol.iterator] === "function";
  }
}
__name(DynReducerUtils, "DynReducerUtils");
class AdapterDerived {
  #hostData;
  #DerivedReducerCtor;
  #parentIndex;
  #derived = /* @__PURE__ */ new Map();
  #destroyed = false;
  constructor(hostData, parentIndex, DerivedReducerCtor) {
    this.#hostData = hostData;
    this.#parentIndex = parentIndex;
    this.#DerivedReducerCtor = DerivedReducerCtor;
    Object.freeze(this);
  }
  create(options) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.create error: this instance has been destroyed.`);
    }
    let name;
    let rest = {};
    let ctor;
    const DerivedReducerCtor = this.#DerivedReducerCtor;
    if (typeof options === "string") {
      name = options;
      ctor = DerivedReducerCtor;
    } else if (typeof options === "function" && DynReducerUtils.hasPrototype(options, DerivedReducerCtor)) {
      ctor = options;
    } else if (typeof options === "object" && options !== null) {
      ({ name, ctor = DerivedReducerCtor, ...rest } = options);
    } else {
      throw new TypeError(`AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
    }
    if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor)) {
      throw new TypeError(`AdapterDerived.create error: 'ctor' is not a '${DerivedReducerCtor?.name}'.`);
    }
    name = name ?? ctor?.name;
    if (typeof name !== "string") {
      throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`);
    }
    const derivedReducer = new ctor(this.#hostData, this.#parentIndex, rest);
    this.#derived.set(name, derivedReducer);
    return derivedReducer;
  }
  clear() {
    if (this.#destroyed) {
      return;
    }
    for (const reducer of this.#derived.values()) {
      reducer.destroy();
    }
    this.#derived.clear();
  }
  delete(name) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.delete error: this instance has been destroyed.`);
    }
    const reducer = this.#derived.get(name);
    if (reducer) {
      reducer.destroy();
    }
    return this.#derived.delete(name);
  }
  destroy() {
    if (this.#destroyed) {
      return;
    }
    this.clear();
    this.#hostData = [null];
    this.#parentIndex = null;
    this.#destroyed = true;
  }
  get(name) {
    if (this.#destroyed) {
      throw Error(`AdapterDerived.get error: this instance has been destroyed.`);
    }
    return this.#derived.get(name);
  }
  update(force = false) {
    if (this.#destroyed) {
      return;
    }
    for (const reducer of this.#derived.values()) {
      reducer.index.update(force);
    }
  }
}
__name(AdapterDerived, "AdapterDerived");
class AdapterFilters {
  #filtersData;
  #indexUpdate;
  #mapUnsubscribe = /* @__PURE__ */ new Map();
  constructor(indexUpdate, filtersAdapter) {
    this.#indexUpdate = indexUpdate;
    this.#filtersData = filtersAdapter;
    Object.freeze(this);
  }
  get length() {
    return this.#filtersData.filters.length;
  }
  *[Symbol.iterator]() {
    if (this.#filtersData.filters.length === 0) {
      return;
    }
    for (const entry of this.#filtersData.filters) {
      yield { ...entry };
    }
  }
  add(...filters) {
    let subscribeCount = 0;
    for (const filter of filters) {
      const filterType = typeof filter;
      if (filterType !== "function" && (filterType !== "object" || filter === null)) {
        throw new TypeError(`AdapterFilters error: 'filter' is not a function or object.`);
      }
      let data = void 0;
      let subscribeFn = void 0;
      if (filterType === "function") {
        data = {
          id: void 0,
          filter,
          weight: 1
        };
        subscribeFn = filter.subscribe;
      } else if (filterType === "object") {
        if ("filter" in filter) {
          if (typeof filter.filter !== "function") {
            throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
          }
          if (filter.weight !== void 0 && typeof filter.weight !== "number" || (filter.weight < 0 || filter.weight > 1)) {
            throw new TypeError(`AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
          }
          data = {
            id: filter.id !== void 0 ? filter.id : void 0,
            filter: filter.filter,
            weight: filter.weight || 1
          };
          subscribeFn = filter.filter.subscribe ?? filter.subscribe;
        } else {
          throw new TypeError(`AdapterFilters error: 'filter' attribute is not a function.`);
        }
      }
      const index = this.#filtersData.filters.findIndex((value) => {
        return data.weight < value.weight;
      });
      if (index >= 0) {
        this.#filtersData.filters.splice(index, 0, data);
      } else {
        this.#filtersData.filters.push(data);
      }
      if (typeof subscribeFn === "function") {
        const unsubscribe = subscribeFn(this.#indexUpdate);
        if (typeof unsubscribe !== "function") {
          throw new TypeError("AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.");
        }
        if (this.#mapUnsubscribe.has(data.filter)) {
          throw new Error("AdapterFilters error: Filter added already has an unsubscribe function registered.");
        }
        this.#mapUnsubscribe.set(data.filter, unsubscribe);
        subscribeCount++;
      }
    }
    if (subscribeCount < filters.length) {
      this.#indexUpdate();
    }
  }
  clear() {
    this.#filtersData.filters.length = 0;
    for (const unsubscribe of this.#mapUnsubscribe.values()) {
      unsubscribe();
    }
    this.#mapUnsubscribe.clear();
    this.#indexUpdate();
  }
  remove(...filters) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    for (const data of filters) {
      const actualFilter = typeof data === "function" ? data : data !== null && typeof data === "object" ? data.filter : void 0;
      if (!actualFilter) {
        continue;
      }
      for (let cntr = this.#filtersData.filters.length; --cntr >= 0; ) {
        if (this.#filtersData.filters[cntr].filter === actualFilter) {
          this.#filtersData.filters.splice(cntr, 1);
          let unsubscribe = void 0;
          if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === "function") {
            unsubscribe();
            this.#mapUnsubscribe.delete(actualFilter);
          }
        }
      }
    }
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
  removeBy(callback) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    if (typeof callback !== "function") {
      throw new TypeError(`AdapterFilters error: 'callback' is not a function.`);
    }
    this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
      const remove = callback.call(callback, { ...data });
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.filter);
        }
      }
      return !remove;
    });
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
  removeById(...ids) {
    const length = this.#filtersData.filters.length;
    if (length === 0) {
      return;
    }
    this.#filtersData.filters = this.#filtersData.filters.filter((data) => {
      let remove = 0;
      for (const id of ids) {
        remove |= data.id === id ? 1 : 0;
      }
      if (!!remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.filter);
        }
      }
      return !remove;
    });
    if (length !== this.#filtersData.filters.length) {
      this.#indexUpdate();
    }
  }
}
__name(AdapterFilters, "AdapterFilters");
class AdapterIndexer {
  derivedAdapter;
  filtersData;
  hostData;
  hostUpdate;
  indexData;
  sortData;
  sortFn;
  destroyed = false;
  constructor(hostData, hostUpdate, parentIndexer) {
    this.hostData = hostData;
    this.hostUpdate = hostUpdate;
    this.indexData = { index: null, hash: null, reversed: false, parent: parentIndexer };
  }
  get active() {
    return this.filtersData.filters.length > 0 || this.sortData.compareFn !== null || this.indexData.parent?.active === true;
  }
  get length() {
    return this.indexData.index ? this.indexData.index.length : 0;
  }
  get reversed() {
    return this.indexData.reversed;
  }
  set reversed(reversed) {
    this.indexData.reversed = reversed;
  }
  calcHashUpdate(oldIndex, oldHash, force = false) {
    const actualForce = typeof force === "boolean" ? force : false;
    let newHash = null;
    const newIndex = this.indexData.index;
    if (newIndex) {
      for (let cntr = newIndex.length; --cntr >= 0; ) {
        newHash ^= DynReducerUtils.hashUnknown(newIndex[cntr]) + 2654435769 + (newHash << 6) + (newHash >> 2);
      }
    }
    this.indexData.hash = newHash;
    if (actualForce || (oldHash === newHash ? !DynReducerUtils.arrayEquals(oldIndex, newIndex) : true)) {
      this.hostUpdate();
    }
  }
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.indexData.index = null;
    this.indexData.hash = null;
    this.indexData.reversed = null;
    this.indexData.parent = null;
    this.destroyed = true;
  }
  initAdapters(filtersData, sortData, derivedAdapter) {
    this.filtersData = filtersData;
    this.sortData = sortData;
    this.derivedAdapter = derivedAdapter;
    this.sortFn = this.createSortFn();
  }
}
__name(AdapterIndexer, "AdapterIndexer");
class AdapterSort {
  #sortData;
  #indexUpdate;
  #unsubscribe;
  constructor(indexUpdate, sortData) {
    this.#indexUpdate = indexUpdate;
    this.#sortData = sortData;
    Object.freeze(this);
  }
  clear() {
    const oldCompareFn = this.#sortData.compareFn;
    this.#sortData.compareFn = null;
    if (typeof this.#unsubscribe === "function") {
      this.#unsubscribe();
      this.#unsubscribe = void 0;
    }
    if (typeof oldCompareFn === "function") {
      this.#indexUpdate();
    }
  }
  set(data) {
    if (typeof this.#unsubscribe === "function") {
      this.#unsubscribe();
      this.#unsubscribe = void 0;
    }
    let compareFn = void 0;
    let subscribeFn = void 0;
    switch (typeof data) {
      case "function":
        compareFn = data;
        subscribeFn = data.subscribe;
        break;
      case "object":
        if (data === null) {
          break;
        }
        if (typeof data.compare !== "function") {
          throw new TypeError(`AdapterSort error: 'compare' attribute is not a function.`);
        }
        compareFn = data.compare;
        subscribeFn = data.compare.subscribe ?? data.subscribe;
        break;
    }
    if (typeof compareFn === "function") {
      this.#sortData.compareFn = compareFn;
    } else {
      const oldCompareFn = this.#sortData.compareFn;
      this.#sortData.compareFn = null;
      if (typeof oldCompareFn === "function") {
        this.#indexUpdate();
      }
      return;
    }
    if (typeof subscribeFn === "function") {
      this.#unsubscribe = subscribeFn(this.#indexUpdate);
      if (typeof this.#unsubscribe !== "function") {
        throw new Error(`AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
      }
    } else {
      this.#indexUpdate();
    }
  }
}
__name(AdapterSort, "AdapterSort");
class IndexerAPI {
  #indexData;
  active;
  length;
  update;
  constructor(adapterIndexer) {
    this.#indexData = adapterIndexer.indexData;
    this.update = adapterIndexer.update.bind(adapterIndexer);
    Object.defineProperties(this, {
      active: { get: () => adapterIndexer.active },
      length: { get: () => adapterIndexer.length }
    });
    Object.freeze(this);
  }
  get hash() {
    return this.#indexData.hash;
  }
  *[Symbol.iterator]() {
    const indexData = this.#indexData;
    if (!indexData.index) {
      return;
    }
    const reversed = indexData.reversed;
    const length = indexData.index.length;
    if (reversed) {
      for (let cntr = length; --cntr >= 0; ) {
        yield indexData.index[cntr];
      }
    } else {
      for (let cntr = 0; cntr < length; cntr++) {
        yield indexData.index[cntr];
      }
    }
  }
}
__name(IndexerAPI, "IndexerAPI");
class DerivedAPI {
  clear;
  create;
  delete;
  destroy;
  get;
  constructor(adapterDerived) {
    this.clear = adapterDerived.clear.bind(adapterDerived);
    this.create = adapterDerived.create.bind(adapterDerived);
    this.delete = adapterDerived.delete.bind(adapterDerived);
    this.destroy = adapterDerived.destroy.bind(adapterDerived);
    this.get = adapterDerived.get.bind(adapterDerived);
    Object.freeze(this);
  }
}
__name(DerivedAPI, "DerivedAPI");
class Indexer$1 extends AdapterIndexer {
  createSortFn() {
    return (a, b) => this.sortData.compareFn(this.hostData[0][a], this.hostData[0][b]);
  }
  reduceImpl() {
    const data = [];
    const array = this.hostData[0];
    if (!array) {
      return data;
    }
    const filters = this.filtersData.filters;
    let include = true;
    const parentIndex = this.indexData.parent;
    if (DynReducerUtils.isIterable(parentIndex) && parentIndex.active) {
      for (const adjustedIndex of parentIndex) {
        const value = array[adjustedIndex];
        include = true;
        for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
          if (!filters[filCntr].filter(value)) {
            include = false;
            break;
          }
        }
        if (include) {
          data.push(adjustedIndex);
        }
      }
    } else {
      for (let cntr = 0, length = array.length; cntr < length; cntr++) {
        include = true;
        for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++) {
          if (!filters[filCntr].filter(array[cntr])) {
            include = false;
            break;
          }
        }
        if (include) {
          data.push(cntr);
        }
      }
    }
    return data;
  }
  update(force = false) {
    if (this.destroyed) {
      return;
    }
    const oldIndex = this.indexData.index;
    const oldHash = this.indexData.hash;
    const array = this.hostData[0];
    const parentIndex = this.indexData.parent;
    if (this.filtersData.filters.length === 0 && !this.sortData.compareFn || this.indexData.index && array?.length !== this.indexData.index.length) {
      this.indexData.index = null;
    }
    if (this.filtersData.filters.length > 0) {
      this.indexData.index = this.reduceImpl();
    }
    if (!this.indexData.index && parentIndex?.active) {
      this.indexData.index = [...parentIndex];
    }
    if (this.sortData.compareFn && Array.isArray(array)) {
      if (!this.indexData.index) {
        this.indexData.index = [...Array(array.length).keys()];
      }
      this.indexData.index.sort(this.sortFn);
    }
    this.calcHashUpdate(oldIndex, oldHash, force);
    this.derivedAdapter?.update(force);
  }
}
__name(Indexer$1, "Indexer$1");
class DerivedArrayReducer {
  #array;
  #derived;
  #derivedPublicAPI;
  #filters;
  #filtersData = { filters: [] };
  #index;
  #indexPublicAPI;
  #reversed = false;
  #sort;
  #sortData = { compareFn: null };
  #subscriptions = [];
  #destroyed = false;
  constructor(array, parentIndex, options) {
    this.#array = array;
    this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this), parentIndex);
    this.#indexPublicAPI = new IndexerAPI(this.#index);
    this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
    this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
    this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
    this.#derivedPublicAPI = new DerivedAPI(this.#derived);
    this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
    let filters = void 0;
    let sort = void 0;
    if (options !== void 0 && ("filters" in options || "sort" in options)) {
      if (options.filters !== void 0) {
        if (DynReducerUtils.isIterable(options.filters)) {
          filters = options.filters;
        } else {
          throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
        }
      }
      if (options.sort !== void 0) {
        if (typeof options.sort === "function") {
          sort = options.sort;
        } else if (typeof options.sort === "object" && options.sort !== null) {
          sort = options.sort;
        } else {
          throw new TypeError(`DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
        }
      }
    }
    if (filters) {
      this.filters.add(...filters);
    }
    if (sort) {
      this.sort.set(sort);
    }
    this.initialize();
  }
  get data() {
    return this.#array[0];
  }
  get derived() {
    return this.#derivedPublicAPI;
  }
  get filters() {
    return this.#filters;
  }
  get index() {
    return this.#indexPublicAPI;
  }
  get destroyed() {
    return this.#destroyed;
  }
  get length() {
    const array = this.#array[0];
    return this.#index.active ? this.index.length : array ? array.length : 0;
  }
  get reversed() {
    return this.#reversed;
  }
  get sort() {
    return this.#sort;
  }
  set reversed(reversed) {
    if (typeof reversed !== "boolean") {
      throw new TypeError(`DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
    }
    this.#reversed = reversed;
    this.#index.reversed = reversed;
    this.index.update(true);
  }
  destroy() {
    this.#destroyed = true;
    this.#array = [null];
    this.#index.update(true);
    this.#subscriptions.length = 0;
    this.#derived.destroy();
    this.#index.destroy();
    this.#filters.clear();
    this.#sort.clear();
  }
  initialize() {
  }
  *[Symbol.iterator]() {
    const array = this.#array[0];
    if (this.#destroyed || array === null || array?.length === 0) {
      return;
    }
    if (this.#index.active) {
      for (const entry of this.index) {
        yield array[entry];
      }
    } else {
      if (this.reversed) {
        for (let cntr = array.length; --cntr >= 0; ) {
          yield array[cntr];
        }
      } else {
        for (let cntr = 0; cntr < array.length; cntr++) {
          yield array[cntr];
        }
      }
    }
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  #updateSubscribers() {
    for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
      this.#subscriptions[cntr](this);
    }
  }
}
__name(DerivedArrayReducer, "DerivedArrayReducer");
class DynArrayReducer {
  #array = [null];
  #derived;
  #derivedPublicAPI;
  #filters;
  #filtersData = { filters: [] };
  #index;
  #indexPublicAPI;
  #reversed = false;
  #sort;
  #sortData = { compareFn: null };
  #subscriptions = [];
  #destroyed = false;
  constructor(data) {
    let dataIterable = void 0;
    let filters = void 0;
    let sort = void 0;
    if (data === null) {
      throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
    }
    if (data !== void 0 && typeof data !== "object" && !DynReducerUtils.isIterable(data)) {
      throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
    }
    if (data !== void 0 && Symbol.iterator in data) {
      dataIterable = data;
    } else if (data !== void 0 && ("data" in data || "filters" in data || "sort" in data)) {
      if (data.data !== void 0 && !DynReducerUtils.isIterable(data.data)) {
        throw new TypeError(`DynArrayReducer error (DataDynArray): 'data' attribute is not iterable.`);
      }
      dataIterable = data.data;
      if (data.filters !== void 0) {
        if (DynReducerUtils.isIterable(data.filters)) {
          filters = data.filters;
        } else {
          throw new TypeError(`DynArrayReducer error (DataDynArray): 'filters' attribute is not iterable.`);
        }
      }
      if (data.sort !== void 0) {
        if (typeof data.sort === "function") {
          sort = data.sort;
        } else if (typeof data.sort === "object" && data.sort !== null) {
          sort = data.sort;
        } else {
          throw new TypeError(`DynArrayReducer error (DataDynArray): 'sort' attribute is not a function or object.`);
        }
      }
    }
    if (dataIterable) {
      this.#array[0] = Array.isArray(dataIterable) ? dataIterable : [...dataIterable];
    }
    this.#index = new Indexer$1(this.#array, this.#updateSubscribers.bind(this));
    this.#indexPublicAPI = new IndexerAPI(this.#index);
    this.#filters = new AdapterFilters(this.#indexPublicAPI.update, this.#filtersData);
    this.#sort = new AdapterSort(this.#indexPublicAPI.update, this.#sortData);
    this.#derived = new AdapterDerived(this.#array, this.#indexPublicAPI, DerivedArrayReducer);
    this.#derivedPublicAPI = new DerivedAPI(this.#derived);
    this.#index.initAdapters(this.#filtersData, this.#sortData, this.#derived);
    if (filters) {
      this.filters.add(...filters);
    }
    if (sort) {
      this.sort.set(sort);
    }
    this.initialize();
  }
  get data() {
    return this.#array[0];
  }
  get derived() {
    return this.#derivedPublicAPI;
  }
  get filters() {
    return this.#filters;
  }
  get index() {
    return this.#indexPublicAPI;
  }
  get destroyed() {
    return this.#destroyed;
  }
  get length() {
    const array = this.#array[0];
    return this.#index.active ? this.#indexPublicAPI.length : array ? array.length : 0;
  }
  get reversed() {
    return this.#reversed;
  }
  get sort() {
    return this.#sort;
  }
  set reversed(reversed) {
    if (typeof reversed !== "boolean") {
      throw new TypeError(`DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
    }
    this.#reversed = reversed;
    this.#index.reversed = reversed;
    this.index.update(true);
  }
  destroy() {
    if (this.#destroyed) {
      return;
    }
    this.#destroyed = true;
    this.#derived.destroy();
    this.#array = [null];
    this.index.update(true);
    this.#subscriptions.length = 0;
    this.#index.destroy();
    this.#filters.clear();
    this.#sort.clear();
  }
  initialize() {
  }
  setData(data, replace = false) {
    if (data !== null && !DynReducerUtils.isIterable(data)) {
      throw new TypeError(`DynArrayReducer.setData error: 'data' is not iterable.`);
    }
    if (typeof replace !== "boolean") {
      throw new TypeError(`DynArrayReducer.setData error: 'replace' is not a boolean.`);
    }
    const array = this.#array[0];
    if (!Array.isArray(array) || replace) {
      if (data) {
        this.#array[0] = Array.isArray(data) ? data : [...data];
      }
    } else {
      if (data) {
        array.length = 0;
        array.push(...data);
      } else {
        this.#array[0] = null;
      }
    }
    this.index.update(true);
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  #updateSubscribers() {
    for (let cntr = 0; cntr < this.#subscriptions.length; cntr++) {
      this.#subscriptions[cntr](this);
    }
  }
  *[Symbol.iterator]() {
    const array = this.#array[0];
    if (this.#destroyed || array === null || array?.length === 0) {
      return;
    }
    if (this.#index.active) {
      for (const entry of this.index) {
        yield array[entry];
      }
    } else {
      if (this.reversed) {
        for (let cntr = array.length; --cntr >= 0; ) {
          yield array[cntr];
        }
      } else {
        for (let cntr = 0; cntr < array.length; cntr++) {
          yield array[cntr];
        }
      }
    }
  }
}
__name(DynArrayReducer, "DynArrayReducer");
function isUpdatableStore(store) {
  if (store === null || store === void 0) {
    return false;
  }
  switch (typeof store) {
    case "function":
    case "object":
      return typeof store.subscribe === "function" && typeof store.update === "function";
  }
  return false;
}
__name(isUpdatableStore, "isUpdatableStore");
function isWritableStore(store) {
  if (store === null || store === void 0) {
    return false;
  }
  switch (typeof store) {
    case "function":
    case "object":
      return typeof store.subscribe === "function" && typeof store.set === "function";
  }
  return false;
}
__name(isWritableStore, "isWritableStore");
function subscribeIgnoreFirst(store, update2) {
  let firedFirst = false;
  return store.subscribe((value) => {
    if (!firedFirst) {
      firedFirst = true;
    } else {
      update2(value);
    }
  });
}
__name(subscribeIgnoreFirst, "subscribeIgnoreFirst");
function writableDerived(origins, derive, reflect, initial) {
  var childDerivedSetter, originValues, blockNextDerive = false;
  var reflectOldValues = "withOld" in reflect;
  var wrappedDerive = /* @__PURE__ */ __name((got, set2) => {
    childDerivedSetter = set2;
    if (reflectOldValues) {
      originValues = got;
    }
    if (!blockNextDerive) {
      let returned = derive(got, set2);
      if (derive.length < 2) {
        set2(returned);
      } else {
        return returned;
      }
    }
    blockNextDerive = false;
  }, "wrappedDerive");
  var childDerived = derived(origins, wrappedDerive, initial);
  var singleOrigin = !Array.isArray(origins);
  var sendUpstream = /* @__PURE__ */ __name((setWith) => {
    if (singleOrigin) {
      blockNextDerive = true;
      origins.set(setWith);
    } else {
      setWith.forEach((value, i) => {
        blockNextDerive = true;
        origins[i].set(value);
      });
    }
    blockNextDerive = false;
  }, "sendUpstream");
  if (reflectOldValues) {
    reflect = reflect.withOld;
  }
  var reflectIsAsync = reflect.length >= (reflectOldValues ? 3 : 2);
  var cleanup = null;
  function doReflect(reflecting) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (reflectOldValues) {
      var returned = reflect(reflecting, originValues, sendUpstream);
    } else {
      var returned = reflect(reflecting, sendUpstream);
    }
    if (reflectIsAsync) {
      if (typeof returned == "function") {
        cleanup = returned;
      }
    } else {
      sendUpstream(returned);
    }
  }
  __name(doReflect, "doReflect");
  var tryingSet = false;
  function update2(fn) {
    var isUpdated, mutatedBySubscriptions, oldValue, newValue;
    if (tryingSet) {
      newValue = fn(get_store_value(childDerived));
      childDerivedSetter(newValue);
      return;
    }
    var unsubscribe = childDerived.subscribe((value) => {
      if (!tryingSet) {
        oldValue = value;
      } else if (!isUpdated) {
        isUpdated = true;
      } else {
        mutatedBySubscriptions = true;
      }
    });
    newValue = fn(oldValue);
    tryingSet = true;
    childDerivedSetter(newValue);
    unsubscribe();
    tryingSet = false;
    if (mutatedBySubscriptions) {
      newValue = get_store_value(childDerived);
    }
    if (isUpdated) {
      doReflect(newValue);
    }
  }
  __name(update2, "update");
  return {
    subscribe: childDerived.subscribe,
    set(value) {
      update2(() => value);
    },
    update: update2
  };
}
__name(writableDerived, "writableDerived");
function propertyStore(origin, propName) {
  if (!Array.isArray(propName)) {
    return writableDerived(
      origin,
      (object) => object[propName],
      { withOld(reflecting, object) {
        object[propName] = reflecting;
        return object;
      } }
    );
  } else {
    let props = propName.concat();
    return writableDerived(
      origin,
      (value) => {
        for (let i = 0; i < props.length; ++i) {
          value = value[props[i]];
        }
        return value;
      },
      { withOld(reflecting, object) {
        let target = object;
        for (let i = 0; i < props.length - 1; ++i) {
          target = target[props[i]];
        }
        target[props[props.length - 1]] = reflecting;
        return object;
      } }
    );
  }
}
__name(propertyStore, "propertyStore");
const storeState = writable(void 0);
const gameState = {
  subscribe: storeState.subscribe,
  get: () => game
};
Object.freeze(gameState);
Hooks.once("ready", () => storeState.set(game));
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
__name(cubicOut, "cubicOut");
function lerp$5(start, end, amount) {
  return (1 - amount) * start + amount * end;
}
__name(lerp$5, "lerp$5");
function degToRad(deg) {
  return deg * (Math.PI / 180);
}
__name(degToRad, "degToRad");
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
if (!Math.hypot)
  Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };
function create$6() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
__name(create$6, "create$6");
function create$5() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
__name(create$5, "create$5");
function clone$5(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(clone$5, "clone$5");
function copy$5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(copy$5, "copy$5");
function fromValues$5(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
__name(fromValues$5, "fromValues$5");
function set$5(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
__name(set$5, "set$5");
function identity$2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(identity$2, "identity$2");
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
__name(transpose, "transpose");
function invert$2(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
__name(invert$2, "invert$2");
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
__name(adjoint, "adjoint");
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
__name(determinant, "determinant");
function multiply$5(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
__name(multiply$5, "multiply$5");
function translate$1(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
__name(translate$1, "translate$1");
function scale$5(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
__name(scale$5, "scale$5");
function rotate$1(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
__name(rotate$1, "rotate$1");
function rotateX$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
__name(rotateX$3, "rotateX$3");
function rotateY$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
__name(rotateY$3, "rotateY$3");
function rotateZ$3(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
__name(rotateZ$3, "rotateZ$3");
function fromTranslation$1(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromTranslation$1, "fromTranslation$1");
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromScaling, "fromScaling");
function fromRotation$1(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromRotation$1, "fromRotation$1");
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromXRotation, "fromXRotation");
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromYRotation, "fromYRotation");
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromZRotation, "fromZRotation");
function fromRotationTranslation$1(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromRotationTranslation$1, "fromRotationTranslation$1");
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation$1(out, a, translation);
  return out;
}
__name(fromQuat2, "fromQuat2");
function getTranslation$1(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
__name(getTranslation$1, "getTranslation$1");
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
__name(getScaling, "getScaling");
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
__name(getRotation, "getRotation");
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
__name(fromRotationTranslationScale, "fromRotationTranslationScale");
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
__name(fromRotationTranslationScaleOrigin, "fromRotationTranslationScaleOrigin");
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
__name(fromQuat, "fromQuat");
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
__name(frustum, "frustum");
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
__name(perspectiveNO, "perspectiveNO");
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
__name(perspectiveZO, "perspectiveZO");
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
__name(perspectiveFromFieldOfView, "perspectiveFromFieldOfView");
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
__name(orthoNO, "orthoNO");
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
__name(orthoZO, "orthoZO");
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity$2(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
__name(lookAt, "lookAt");
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
__name(targetTo, "targetTo");
function str$5(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
__name(str$5, "str$5");
function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
__name(frob, "frob");
function add$5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
__name(add$5, "add$5");
function subtract$3(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
__name(subtract$3, "subtract$3");
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
__name(multiplyScalar, "multiplyScalar");
function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
__name(multiplyScalarAndAdd, "multiplyScalarAndAdd");
function exactEquals$5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
__name(exactEquals$5, "exactEquals$5");
function equals$5(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
__name(equals$5, "equals$5");
var mul$5 = multiply$5;
var sub$3 = subtract$3;
var mat4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$5,
  clone: clone$5,
  copy: copy$5,
  fromValues: fromValues$5,
  set: set$5,
  identity: identity$2,
  transpose,
  invert: invert$2,
  adjoint,
  determinant,
  multiply: multiply$5,
  translate: translate$1,
  scale: scale$5,
  rotate: rotate$1,
  rotateX: rotateX$3,
  rotateY: rotateY$3,
  rotateZ: rotateZ$3,
  fromTranslation: fromTranslation$1,
  fromScaling,
  fromRotation: fromRotation$1,
  fromXRotation,
  fromYRotation,
  fromZRotation,
  fromRotationTranslation: fromRotationTranslation$1,
  fromQuat2,
  getTranslation: getTranslation$1,
  getScaling,
  getRotation,
  fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin,
  fromQuat,
  frustum,
  perspectiveNO,
  perspective,
  perspectiveZO,
  perspectiveFromFieldOfView,
  orthoNO,
  ortho,
  orthoZO,
  lookAt,
  targetTo,
  str: str$5,
  frob,
  add: add$5,
  subtract: subtract$3,
  multiplyScalar,
  multiplyScalarAndAdd,
  exactEquals: exactEquals$5,
  equals: equals$5,
  mul: mul$5,
  sub: sub$3
});
function create$4() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
__name(create$4, "create$4");
function clone$4(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
__name(clone$4, "clone$4");
function length$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
__name(length$4, "length$4");
function fromValues$4(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
__name(fromValues$4, "fromValues$4");
function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
__name(copy$4, "copy$4");
function set$4(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
__name(set$4, "set$4");
function add$4(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
__name(add$4, "add$4");
function subtract$2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
__name(subtract$2, "subtract$2");
function multiply$4(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
__name(multiply$4, "multiply$4");
function divide$2(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
__name(divide$2, "divide$2");
function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
__name(ceil$2, "ceil$2");
function floor$2(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
__name(floor$2, "floor$2");
function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
__name(min$2, "min$2");
function max$2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
__name(max$2, "max$2");
function round$2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
__name(round$2, "round$2");
function scale$4(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
__name(scale$4, "scale$4");
function scaleAndAdd$2(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
__name(scaleAndAdd$2, "scaleAndAdd$2");
function distance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
__name(distance$2, "distance$2");
function squaredDistance$2(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
__name(squaredDistance$2, "squaredDistance$2");
function squaredLength$4(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
__name(squaredLength$4, "squaredLength$4");
function negate$2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
__name(negate$2, "negate$2");
function inverse$2(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
__name(inverse$2, "inverse$2");
function normalize$4(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
__name(normalize$4, "normalize$4");
function dot$4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
__name(dot$4, "dot$4");
function cross$2(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
__name(cross$2, "cross$2");
function lerp$4(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
__name(lerp$4, "lerp$4");
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
__name(hermite, "hermite");
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
__name(bezier, "bezier");
function random$3(out, scale) {
  scale = scale || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
__name(random$3, "random$3");
function transformMat4$2(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
__name(transformMat4$2, "transformMat4$2");
function transformMat3$1(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
__name(transformMat3$1, "transformMat3$1");
function transformQuat$1(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a[0], y = a[1], z = a[2];
  var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
  var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
__name(transformQuat$1, "transformQuat$1");
function rotateX$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateX$2, "rotateX$2");
function rotateY$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateY$2, "rotateY$2");
function rotateZ$2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
__name(rotateZ$2, "rotateZ$2");
function angle$1(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot$4(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
__name(angle$1, "angle$1");
function zero$2(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
__name(zero$2, "zero$2");
function str$4(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
__name(str$4, "str$4");
function exactEquals$4(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
__name(exactEquals$4, "exactEquals$4");
function equals$4(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
__name(equals$4, "equals$4");
var sub$2 = subtract$2;
var mul$4 = multiply$4;
var div$2 = divide$2;
var dist$2 = distance$2;
var sqrDist$2 = squaredDistance$2;
var len$4 = length$4;
var sqrLen$4 = squaredLength$4;
var forEach$2 = function() {
  var vec = create$4();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();
var vec3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  create: create$4,
  clone: clone$4,
  length: length$4,
  fromValues: fromValues$4,
  copy: copy$4,
  set: set$4,
  add: add$4,
  subtract: subtract$2,
  multiply: multiply$4,
  divide: divide$2,
  ceil: ceil$2,
  floor: floor$2,
  min: min$2,
  max: max$2,
  round: round$2,
  scale: scale$4,
  scaleAndAdd: scaleAndAdd$2,
  distance: distance$2,
  squaredDistance: squaredDistance$2,
  squaredLength: squaredLength$4,
  negate: negate$2,
  inverse: inverse$2,
  normalize: normalize$4,
  dot: dot$4,
  cross: cross$2,
  lerp: lerp$4,
  hermite,
  bezier,
  random: random$3,
  transformMat4: transformMat4$2,
  transformMat3: transformMat3$1,
  transformQuat: transformQuat$1,
  rotateX: rotateX$2,
  rotateY: rotateY$2,
  rotateZ: rotateZ$2,
  angle: angle$1,
  zero: zero$2,
  str: str$4,
  exactEquals: exactEquals$4,
  equals: equals$4,
  sub: sub$2,
  mul: mul$4,
  div: div$2,
  dist: dist$2,
  sqrDist: sqrDist$2,
  len: len$4,
  sqrLen: sqrLen$4,
  forEach: forEach$2
});
function create$3() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
__name(create$3, "create$3");
function normalize$3(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
__name(normalize$3, "normalize$3");
(function() {
  var vec = create$3();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
})();
function create$2() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
__name(create$2, "create$2");
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
__name(setAxisAngle, "setAxisAngle");
function slerp(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
__name(slerp, "slerp");
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
__name(fromMat3, "fromMat3");
var normalize$2 = normalize$3;
(function() {
  var tmpvec3 = create$4();
  var xUnitVec3 = fromValues$4(1, 0, 0);
  var yUnitVec3 = fromValues$4(0, 1, 0);
  return function(out, a, b) {
    var dot = dot$4(a, b);
    if (dot < -0.999999) {
      cross$2(tmpvec3, xUnitVec3, a);
      if (len$4(tmpvec3) < 1e-6)
        cross$2(tmpvec3, yUnitVec3, a);
      normalize$4(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross$2(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize$2(out, out);
    }
  };
})();
(function() {
  var temp1 = create$2();
  var temp2 = create$2();
  return function(out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
})();
(function() {
  var matr = create$6();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
})();
function create() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}
__name(create, "create");
(function() {
  var vec = create();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }
    return a;
  };
})();
class AnimationControl {
  #animationData;
  #finishedPromise;
  #willFinish;
  static #voidControl = new AnimationControl(null);
  static get voidControl() {
    return this.#voidControl;
  }
  constructor(animationData, willFinish = false) {
    this.#animationData = animationData;
    this.#willFinish = willFinish;
    if (animationData !== null && typeof animationData === "object") {
      animationData.control = this;
    }
  }
  get finished() {
    if (!(this.#finishedPromise instanceof Promise)) {
      this.#finishedPromise = this.#willFinish ? new Promise((resolve) => this.#animationData.resolve = resolve) : Promise.resolve();
    }
    return this.#finishedPromise;
  }
  get isActive() {
    return this.#animationData.active;
  }
  get isFinished() {
    return this.#animationData.finished;
  }
  cancel() {
    const animationData = this.#animationData;
    if (animationData === null || animationData === void 0) {
      return;
    }
    animationData.cancelled = true;
  }
}
__name(AnimationControl, "AnimationControl");
class AnimationManager {
  static activeList = [];
  static newList = [];
  static current;
  static add(data) {
    const now2 = performance.now();
    data.start = now2 + (AnimationManager.current - now2);
    AnimationManager.newList.push(data);
  }
  static animate() {
    const current = AnimationManager.current = performance.now();
    if (AnimationManager.activeList.length === 0 && AnimationManager.newList.length === 0) {
      globalThis.requestAnimationFrame(AnimationManager.animate);
      return;
    }
    if (AnimationManager.newList.length) {
      for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
        const data = AnimationManager.newList[cntr];
        if (data.cancelled) {
          AnimationManager.newList.splice(cntr, 1);
          data.cleanup(data);
        }
        if (data.active) {
          AnimationManager.newList.splice(cntr, 1);
          AnimationManager.activeList.push(data);
        }
      }
    }
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.cancelled || data.el !== void 0 && !data.el.isConnected) {
        AnimationManager.activeList.splice(cntr, 1);
        data.cleanup(data);
        continue;
      }
      data.current = current - data.start;
      if (data.current >= data.duration) {
        for (let dataCntr = data.keys.length; --dataCntr >= 0; ) {
          const key = data.keys[dataCntr];
          data.newData[key] = data.destination[key];
        }
        data.position.set(data.newData);
        AnimationManager.activeList.splice(cntr, 1);
        data.cleanup(data);
        continue;
      }
      const easedTime = data.ease(data.current / data.duration);
      for (let dataCntr = data.keys.length; --dataCntr >= 0; ) {
        const key = data.keys[dataCntr];
        data.newData[key] = data.interpolate(data.initial[key], data.destination[key], easedTime);
      }
      data.position.set(data.newData);
    }
    globalThis.requestAnimationFrame(AnimationManager.animate);
  }
  static cancel(position) {
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.position === position) {
        AnimationManager.activeList.splice(cntr, 1);
        data.cancelled = true;
        data.cleanup(data);
      }
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      if (data.position === position) {
        AnimationManager.newList.splice(cntr, 1);
        data.cancelled = true;
        data.cleanup(data);
      }
    }
  }
  static cancelAll() {
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      data.cancelled = true;
      data.cleanup(data);
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      data.cancelled = true;
      data.cleanup(data);
    }
    AnimationManager.activeList.length = 0;
    AnimationManager.newList.length = 0;
  }
  static getScheduled(position) {
    const results = [];
    for (let cntr = AnimationManager.activeList.length; --cntr >= 0; ) {
      const data = AnimationManager.activeList[cntr];
      if (data.position === position) {
        results.push(data.control);
      }
    }
    for (let cntr = AnimationManager.newList.length; --cntr >= 0; ) {
      const data = AnimationManager.newList[cntr];
      if (data.position === position) {
        results.push(data.control);
      }
    }
    return results;
  }
}
__name(AnimationManager, "AnimationManager");
AnimationManager.animate();
const animateKeys = /* @__PURE__ */ new Set([
  "left",
  "top",
  "maxWidth",
  "maxHeight",
  "minWidth",
  "minHeight",
  "width",
  "height",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "translateX",
  "translateY",
  "translateZ",
  "zIndex",
  "rotation"
]);
const transformKeys = ["rotateX", "rotateY", "rotateZ", "scale", "translateX", "translateY", "translateZ"];
Object.freeze(transformKeys);
const relativeRegex = /^([-+*])=(-?[\d]*\.?[\d]+)$/;
const numericDefaults = {
  height: 0,
  left: 0,
  maxHeight: null,
  maxWidth: null,
  minHeight: null,
  minWidth: null,
  top: 0,
  transformOrigin: null,
  width: 0,
  zIndex: null,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  rotation: 0
};
Object.freeze(numericDefaults);
function setNumericDefaults(data) {
  if (data.rotateX === null) {
    data.rotateX = 0;
  }
  if (data.rotateY === null) {
    data.rotateY = 0;
  }
  if (data.rotateZ === null) {
    data.rotateZ = 0;
  }
  if (data.translateX === null) {
    data.translateX = 0;
  }
  if (data.translateY === null) {
    data.translateY = 0;
  }
  if (data.translateZ === null) {
    data.translateZ = 0;
  }
  if (data.scale === null) {
    data.scale = 1;
  }
  if (data.rotation === null) {
    data.rotation = 0;
  }
}
__name(setNumericDefaults, "setNumericDefaults");
const transformKeysBitwise = {
  rotateX: 1,
  rotateY: 2,
  rotateZ: 4,
  scale: 8,
  translateX: 16,
  translateY: 32,
  translateZ: 64
};
Object.freeze(transformKeysBitwise);
const transformOriginDefault = "top left";
const transformOrigins = [
  "top left",
  "top center",
  "top right",
  "center left",
  "center",
  "center right",
  "bottom left",
  "bottom center",
  "bottom right"
];
Object.freeze(transformOrigins);
function convertRelative(positionData, position) {
  for (const key in positionData) {
    if (animateKeys.has(key)) {
      const value = positionData[key];
      if (typeof value !== "string") {
        continue;
      }
      if (value === "auto" || value === "inherit") {
        continue;
      }
      const regexResults = relativeRegex.exec(value);
      if (!regexResults) {
        throw new Error(
          `convertRelative error: malformed relative key (${key}) with value (${value})`
        );
      }
      const current = position[key];
      switch (regexResults[1]) {
        case "-":
          positionData[key] = current - parseFloat(regexResults[2]);
          break;
        case "+":
          positionData[key] = current + parseFloat(regexResults[2]);
          break;
        case "*":
          positionData[key] = current * parseFloat(regexResults[2]);
          break;
      }
    }
  }
}
__name(convertRelative, "convertRelative");
class AnimationAPI {
  #data;
  #position;
  #instanceCount = 0;
  #cleanup;
  constructor(position, data) {
    this.#position = position;
    this.#data = data;
    this.#cleanup = this.#cleanupInstance.bind(this);
  }
  get isScheduled() {
    return this.#instanceCount > 0;
  }
  #addAnimation(initial, destination, duration, el, delay, ease, interpolate) {
    setNumericDefaults(initial);
    setNumericDefaults(destination);
    for (const key in initial) {
      if (!Number.isFinite(initial[key])) {
        delete initial[key];
      }
    }
    const keys = Object.keys(initial);
    const newData = Object.assign({ immediateElementUpdate: true }, initial);
    if (keys.length === 0) {
      return AnimationControl.voidControl;
    }
    const animationData = {
      active: true,
      cleanup: this.#cleanup,
      cancelled: false,
      control: void 0,
      current: 0,
      destination,
      duration: duration * 1e3,
      ease,
      el,
      finished: false,
      initial,
      interpolate,
      keys,
      newData,
      position: this.#position,
      resolve: void 0,
      start: void 0
    };
    if (delay > 0) {
      animationData.active = false;
      setTimeout(() => {
        if (!animationData.cancelled) {
          animationData.active = true;
          const now2 = performance.now();
          animationData.start = now2 + (AnimationManager.current - now2);
        }
      }, delay * 1e3);
    }
    this.#instanceCount++;
    AnimationManager.add(animationData);
    return new AnimationControl(animationData, true);
  }
  cancel() {
    AnimationManager.cancel(this.#position);
  }
  #cleanupInstance(data) {
    this.#instanceCount--;
    data.active = false;
    data.finished = true;
    if (typeof data.resolve === "function") {
      data.resolve(data.cancelled);
    }
  }
  getScheduled() {
    return AnimationManager.getScheduled(this.#position);
  }
  from(fromData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp$5 } = {}) {
    if (!isObject(fromData)) {
      throw new TypeError(`AnimationAPI.from error: 'fromData' is not an object.`);
    }
    const position = this.#position;
    const parent = position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.from error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.from error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.from error: 'ease' is not a function.`);
    }
    if (typeof interpolate !== "function") {
      throw new TypeError(`AnimationAPI.from error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in fromData) {
      if (data[key] !== void 0 && fromData[key] !== data[key]) {
        initial[key] = fromData[key];
        destination[key] = data[key];
      }
    }
    convertRelative(initial, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
  }
  fromTo(fromData, toData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp$5 } = {}) {
    if (!isObject(fromData)) {
      throw new TypeError(`AnimationAPI.fromTo error: 'fromData' is not an object.`);
    }
    if (!isObject(toData)) {
      throw new TypeError(`AnimationAPI.fromTo error: 'toData' is not an object.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.fromTo error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.fromTo error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.fromTo error: 'ease' is not a function.`);
    }
    if (typeof interpolate !== "function") {
      throw new TypeError(`AnimationAPI.fromTo error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in fromData) {
      if (toData[key] === void 0) {
        console.warn(
          `AnimationAPI.fromTo warning: key ('${key}') from 'fromData' missing in 'toData'; skipping this key.`
        );
        continue;
      }
      if (data[key] !== void 0) {
        initial[key] = fromData[key];
        destination[key] = toData[key];
      }
    }
    convertRelative(initial, data);
    convertRelative(destination, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
  }
  to(toData, { delay = 0, duration = 1, ease = cubicOut, interpolate = lerp$5 } = {}) {
    if (!isObject(toData)) {
      throw new TypeError(`AnimationAPI.to error: 'toData' is not an object.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return AnimationControl.voidControl;
    }
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    if (!Number.isFinite(delay) || delay < 0) {
      throw new TypeError(`AnimationAPI.to error: 'delay' is not a positive number.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.to error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.to error: 'ease' is not a function.`);
    }
    if (typeof interpolate !== "function") {
      throw new TypeError(`AnimationAPI.to error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key in toData) {
      if (data[key] !== void 0 && toData[key] !== data[key]) {
        destination[key] = toData[key];
        initial[key] = data[key];
      }
    }
    convertRelative(destination, data);
    return this.#addAnimation(initial, destination, duration, el, delay, ease, interpolate);
  }
  quickTo(keys, { duration = 1, ease = cubicOut, interpolate = lerp$5 } = {}) {
    if (!isIterable(keys)) {
      throw new TypeError(`AnimationAPI.quickTo error: 'keys' is not an iterable list.`);
    }
    const parent = this.#position.parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      throw new Error(`AnimationAPI.quickTo error: 'parent' is not positionable.`);
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError(`AnimationAPI.quickTo error: 'duration' is not a positive number.`);
    }
    if (typeof ease !== "function") {
      throw new TypeError(`AnimationAPI.quickTo error: 'ease' is not a function.`);
    }
    if (typeof interpolate !== "function") {
      throw new TypeError(`AnimationAPI.quickTo error: 'interpolate' is not a function.`);
    }
    const initial = {};
    const destination = {};
    const data = this.#data;
    for (const key of keys) {
      if (typeof key !== "string") {
        throw new TypeError(`AnimationAPI.quickTo error: key is not a string.`);
      }
      if (!animateKeys.has(key)) {
        throw new Error(`AnimationAPI.quickTo error: key ('${key}') is not animatable.`);
      }
      if (data[key] !== void 0) {
        destination[key] = data[key];
        initial[key] = data[key];
      }
    }
    const keysArray = [...keys];
    Object.freeze(keysArray);
    const newData = Object.assign({ immediateElementUpdate: true }, initial);
    const animationData = {
      active: true,
      cleanup: this.#cleanup,
      cancelled: false,
      control: void 0,
      current: 0,
      destination,
      duration: duration * 1e3,
      ease,
      el: void 0,
      finished: true,
      initial,
      interpolate,
      keys,
      newData,
      position: this.#position,
      resolve: void 0,
      start: void 0
    };
    const quickToCB = /* @__PURE__ */ __name((...args) => {
      const argsLength = args.length;
      if (argsLength === 0) {
        return;
      }
      for (let cntr = keysArray.length; --cntr >= 0; ) {
        const key = keysArray[cntr];
        if (data[key] !== void 0) {
          initial[key] = data[key];
        }
      }
      if (isObject(args[0])) {
        const objData = args[0];
        for (const key in objData) {
          if (destination[key] !== void 0) {
            destination[key] = objData[key];
          }
        }
      } else {
        for (let cntr = 0; cntr < argsLength && cntr < keysArray.length; cntr++) {
          const key = keysArray[cntr];
          if (destination[key] !== void 0) {
            destination[key] = args[cntr];
          }
        }
      }
      convertRelative(destination, data);
      setNumericDefaults(initial);
      setNumericDefaults(destination);
      const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
      animationData.el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
      if (animationData.finished) {
        animationData.finished = false;
        animationData.active = true;
        animationData.current = 0;
        this.#instanceCount++;
        AnimationManager.add(animationData);
      } else {
        const now2 = performance.now();
        animationData.start = now2 + (AnimationManager.current - now2);
        animationData.current = 0;
      }
    }, "quickToCB");
    quickToCB.keys = keysArray;
    quickToCB.options = ({ duration: duration2, ease: ease2, interpolate: interpolate2 } = {}) => {
      if (duration2 !== void 0 && (!Number.isFinite(duration2) || duration2 < 0)) {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'duration' is not a positive number.`);
      }
      if (ease2 !== void 0 && typeof ease2 !== "function") {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'ease' is not a function.`);
      }
      if (interpolate2 !== void 0 && typeof interpolate2 !== "function") {
        throw new TypeError(`AnimationAPI.quickTo.options error: 'interpolate' is not a function.`);
      }
      if (duration2 >= 0) {
        animationData.duration = duration2 * 1e3;
      }
      if (ease2) {
        animationData.ease = ease2;
      }
      if (interpolate2) {
        animationData.interpolate = interpolate2;
      }
      return quickToCB;
    };
    return quickToCB;
  }
}
__name(AnimationAPI, "AnimationAPI");
class AnimationGroupControl {
  #animationControls;
  #finishedPromise;
  static #voidControl = new AnimationGroupControl(null);
  static get voidControl() {
    return this.#voidControl;
  }
  constructor(animationControls) {
    this.#animationControls = animationControls;
  }
  get finished() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return Promise.resolve();
    }
    if (!(this.#finishedPromise instanceof Promise)) {
      const promises = [];
      for (let cntr = animationControls.length; --cntr >= 0; ) {
        promises.push(animationControls[cntr].finished);
      }
      this.#finishedPromise = Promise.all(promises);
    }
    return this.#finishedPromise;
  }
  get isActive() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return false;
    }
    for (let cntr = animationControls.length; --cntr >= 0; ) {
      if (animationControls[cntr].isActive) {
        return true;
      }
    }
    return false;
  }
  get isFinished() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return true;
    }
    for (let cntr = animationControls.length; --cntr >= 0; ) {
      if (!animationControls[cntr].isFinished) {
        return false;
      }
    }
    return false;
  }
  cancel() {
    const animationControls = this.#animationControls;
    if (animationControls === null || animationControls === void 0) {
      return;
    }
    for (let cntr = this.#animationControls.length; --cntr >= 0; ) {
      this.#animationControls[cntr].cancel();
    }
  }
}
__name(AnimationGroupControl, "AnimationGroupControl");
class AnimationGroupAPI {
  static #isPosition(object) {
    return object !== null && typeof object === "object" && object.animate instanceof AnimationAPI;
  }
  static cancel(position) {
    if (isIterable(position)) {
      let index = -1;
      for (const entry of position) {
        index++;
        const actualPosition = this.#isPosition(entry) ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.cancel warning: No Position instance found at index: ${index}.`);
          continue;
        }
        AnimationManager.cancel(actualPosition);
      }
    } else {
      const actualPosition = this.#isPosition(position) ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.cancel warning: No Position instance found.`);
        return;
      }
      AnimationManager.cancel(actualPosition);
    }
  }
  static cancelAll() {
    AnimationManager.cancelAll();
  }
  static getScheduled(position) {
    const results = [];
    if (isIterable(position)) {
      let index = -1;
      for (const entry of position) {
        index++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found at index: ${index}.`);
          continue;
        }
        const controls = AnimationManager.getScheduled(actualPosition);
        results.push({ position: actualPosition, data: isPosition ? void 0 : entry, controls });
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.getScheduled warning: No Position instance found.`);
        return results;
      }
      const controls = AnimationManager.getScheduled(actualPosition);
      results.push({ position: actualPosition, data: isPosition ? void 0 : position, controls });
    }
    return results;
  }
  static from(position, fromData, options) {
    if (!isObject(fromData) && typeof fromData !== "function") {
      throw new TypeError(`AnimationGroupAPI.from error: 'fromData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.from error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index = -1;
    let callbackOptions;
    const hasDataCallback = typeof fromData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasDataCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index, position: void 0, data: void 0 };
    }
    let actualFromData = fromData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.from warning: No Position instance found at index: ${index}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasDataCallback) {
          actualFromData = fromData(callbackOptions);
          if (actualFromData === null || actualFromData === void 0) {
            continue;
          }
          if (typeof actualFromData !== "object") {
            throw new TypeError(`AnimationGroupAPI.from error: fromData callback function iteration(${index}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.from error: options callback function iteration(${index}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.from warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasDataCallback) {
        actualFromData = fromData(callbackOptions);
        if (typeof actualFromData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.from error: fromData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.from error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.from(actualFromData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static fromTo(position, fromData, toData, options) {
    if (!isObject(fromData) && typeof fromData !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'fromData' is not an object or function.`);
    }
    if (!isObject(toData) && typeof toData !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'toData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.fromTo error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index = -1;
    let callbackOptions;
    const hasFromCallback = typeof fromData === "function";
    const hasToCallback = typeof toData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasFromCallback || hasToCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index, position: void 0, data: void 0 };
    }
    let actualFromData = fromData;
    let actualToData = toData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found at index: ${index}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasFromCallback) {
          actualFromData = fromData(callbackOptions);
          if (actualFromData === null || actualFromData === void 0) {
            continue;
          }
          if (typeof actualFromData !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: fromData callback function iteration(${index}) failed to return an object.`);
          }
        }
        if (hasToCallback) {
          actualToData = toData(callbackOptions);
          if (actualToData === null || actualToData === void 0) {
            continue;
          }
          if (typeof actualToData !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: toData callback function iteration(${index}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.fromTo error: options callback function iteration(${index}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.fromTo warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasFromCallback) {
        actualFromData = fromData(callbackOptions);
        if (typeof actualFromData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: fromData callback function failed to return an object.`
          );
        }
      }
      if (hasToCallback) {
        actualToData = toData(callbackOptions);
        if (typeof actualToData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: toData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.fromTo error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.fromTo(actualFromData, actualToData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static to(position, toData, options) {
    if (!isObject(toData) && typeof toData !== "function") {
      throw new TypeError(`AnimationGroupAPI.to error: 'toData' is not an object or function.`);
    }
    if (options !== void 0 && !isObject(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.to error: 'options' is not an object or function.`);
    }
    const animationControls = [];
    let index = -1;
    let callbackOptions;
    const hasDataCallback = typeof toData === "function";
    const hasOptionCallback = typeof options === "function";
    const hasCallback = hasDataCallback || hasOptionCallback;
    if (hasCallback) {
      callbackOptions = { index, position: void 0, data: void 0 };
    }
    let actualToData = toData;
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.to warning: No Position instance found at index: ${index}.`);
          continue;
        }
        if (hasCallback) {
          callbackOptions.index = index;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : entry;
        }
        if (hasDataCallback) {
          actualToData = toData(callbackOptions);
          if (actualToData === null || actualToData === void 0) {
            continue;
          }
          if (typeof actualToData !== "object") {
            throw new TypeError(`AnimationGroupAPI.to error: toData callback function iteration(${index}) failed to return an object.`);
          }
        }
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.to error: options callback function iteration(${index}) failed to return an object.`);
          }
        }
        animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.to warning: No Position instance found.`);
        return AnimationGroupControl.voidControl;
      }
      if (hasCallback) {
        callbackOptions.index = 0;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : position;
      }
      if (hasDataCallback) {
        actualToData = toData(callbackOptions);
        if (typeof actualToData !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.to error: toData callback function failed to return an object.`
          );
        }
      }
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.to error: options callback function failed to return an object.`
          );
        }
      }
      animationControls.push(actualPosition.animate.to(actualToData, actualOptions));
    }
    return new AnimationGroupControl(animationControls);
  }
  static quickTo(position, keys, options) {
    if (!isIterable(keys)) {
      throw new TypeError(`AnimationGroupAPI.quickTo error: 'keys' is not an iterable list.`);
    }
    if (options !== void 0 && !isObject(options) && typeof options !== "function") {
      throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
    }
    const quickToCallbacks = [];
    let index = -1;
    const hasOptionCallback = typeof options === "function";
    const callbackOptions = { index, position: void 0, data: void 0 };
    let actualOptions = options;
    if (isIterable(position)) {
      for (const entry of position) {
        index++;
        const isPosition = this.#isPosition(entry);
        const actualPosition = isPosition ? entry : entry.position;
        if (!this.#isPosition(actualPosition)) {
          console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found at index: ${index}.`);
          continue;
        }
        callbackOptions.index = index;
        callbackOptions.position = position;
        callbackOptions.data = isPosition ? void 0 : entry;
        if (hasOptionCallback) {
          actualOptions = options(callbackOptions);
          if (actualOptions === null || actualOptions === void 0) {
            continue;
          }
          if (typeof actualOptions !== "object") {
            throw new TypeError(`AnimationGroupAPI.quickTo error: options callback function iteration(${index}) failed to return an object.`);
          }
        }
        quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
      }
    } else {
      const isPosition = this.#isPosition(position);
      const actualPosition = isPosition ? position : position.position;
      if (!this.#isPosition(actualPosition)) {
        console.warn(`AnimationGroupAPI.quickTo warning: No Position instance found.`);
        return () => null;
      }
      callbackOptions.index = 0;
      callbackOptions.position = position;
      callbackOptions.data = isPosition ? void 0 : position;
      if (hasOptionCallback) {
        actualOptions = options(callbackOptions);
        if (typeof actualOptions !== "object") {
          throw new TypeError(
            `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`
          );
        }
      }
      quickToCallbacks.push(actualPosition.animate.quickTo(keys, actualOptions));
    }
    const keysArray = [...keys];
    Object.freeze(keysArray);
    const quickToCB = /* @__PURE__ */ __name((...args) => {
      const argsLength = args.length;
      if (argsLength === 0) {
        return;
      }
      if (typeof args[0] === "function") {
        const dataCallback = args[0];
        index = -1;
        let cntr = 0;
        if (isIterable(position)) {
          for (const entry of position) {
            index++;
            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;
            if (!this.#isPosition(actualPosition)) {
              continue;
            }
            callbackOptions.index = index;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : entry;
            const toData = dataCallback(callbackOptions);
            if (toData === null || toData === void 0) {
              continue;
            }
            const toDataIterable = isIterable(toData);
            if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== "object") {
              throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${index}) failed to return a finite number, iterable list, or object.`);
            }
            if (toDataIterable) {
              quickToCallbacks[cntr++](...toData);
            } else {
              quickToCallbacks[cntr++](toData);
            }
          }
        } else {
          const isPosition = this.#isPosition(position);
          const actualPosition = isPosition ? position : position.position;
          if (!this.#isPosition(actualPosition)) {
            return;
          }
          callbackOptions.index = 0;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : position;
          const toData = dataCallback(callbackOptions);
          if (toData === null || toData === void 0) {
            return;
          }
          const toDataIterable = isIterable(toData);
          if (!Number.isFinite(toData) && !toDataIterable && typeof toData !== "object") {
            throw new TypeError(`AnimationGroupAPI.quickTo error: toData callback function iteration(${index}) failed to return a finite number, iterable list, or object.`);
          }
          if (toDataIterable) {
            quickToCallbacks[cntr++](...toData);
          } else {
            quickToCallbacks[cntr++](toData);
          }
        }
      } else {
        for (let cntr = quickToCallbacks.length; --cntr >= 0; ) {
          quickToCallbacks[cntr](...args);
        }
      }
    }, "quickToCB");
    quickToCB.keys = keysArray;
    quickToCB.options = (options2) => {
      if (options2 !== void 0 && !isObject(options2) && typeof options2 !== "function") {
        throw new TypeError(`AnimationGroupAPI.quickTo error: 'options' is not an object or function.`);
      }
      if (isObject(options2)) {
        for (let cntr = quickToCallbacks.length; --cntr >= 0; ) {
          quickToCallbacks[cntr].options(options2);
        }
      } else if (typeof options2 === "function") {
        if (isIterable(position)) {
          index = -1;
          let cntr = 0;
          for (const entry of position) {
            index++;
            const isPosition = this.#isPosition(entry);
            const actualPosition = isPosition ? entry : entry.position;
            if (!this.#isPosition(actualPosition)) {
              console.warn(
                `AnimationGroupAPI.quickTo.options warning: No Position instance found at index: ${index}.`
              );
              continue;
            }
            callbackOptions.index = index;
            callbackOptions.position = position;
            callbackOptions.data = isPosition ? void 0 : entry;
            actualOptions = options2(callbackOptions);
            if (actualOptions === null || actualOptions === void 0) {
              continue;
            }
            if (typeof actualOptions !== "object") {
              throw new TypeError(
                `AnimationGroupAPI.quickTo.options error: options callback function iteration(${index}) failed to return an object.`
              );
            }
            quickToCallbacks[cntr++].options(actualOptions);
          }
        } else {
          const isPosition = this.#isPosition(position);
          const actualPosition = isPosition ? position : position.position;
          if (!this.#isPosition(actualPosition)) {
            console.warn(`AnimationGroupAPI.quickTo.options warning: No Position instance found.`);
            return quickToCB;
          }
          callbackOptions.index = 0;
          callbackOptions.position = position;
          callbackOptions.data = isPosition ? void 0 : position;
          actualOptions = options2(callbackOptions);
          if (typeof actualOptions !== "object") {
            throw new TypeError(
              `AnimationGroupAPI.quickTo error: options callback function failed to return an object.`
            );
          }
          quickToCallbacks[0].options(actualOptions);
        }
      }
      return quickToCB;
    };
    return quickToCB;
  }
}
__name(AnimationGroupAPI, "AnimationGroupAPI");
class Centered {
  #element;
  #height;
  #lock;
  #width;
  constructor({ element: element2, lock = false, width, height } = {}) {
    this.element = element2;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get element() {
    return this.#element;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  getLeft(width) {
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    return (boundsWidth - width) / 2;
  }
  getTop(height) {
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    return (boundsHeight - height) / 2;
  }
}
__name(Centered, "Centered");
const browserCentered = new Centered();
const positionInitial = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  browserCentered,
  Centered
}, Symbol.toStringTag, { value: "Module" }));
class PositionChangeSet {
  constructor() {
    this.left = false;
    this.top = false;
    this.width = false;
    this.height = false;
    this.maxHeight = false;
    this.maxWidth = false;
    this.minHeight = false;
    this.minWidth = false;
    this.zIndex = false;
    this.transform = false;
    this.transformOrigin = false;
  }
  hasChange() {
    return this.left || this.top || this.width || this.height || this.maxHeight || this.maxWidth || this.minHeight || this.minWidth || this.zIndex || this.transform || this.transformOrigin;
  }
  set(value) {
    this.left = value;
    this.top = value;
    this.width = value;
    this.height = value;
    this.maxHeight = value;
    this.maxWidth = value;
    this.minHeight = value;
    this.minWidth = value;
    this.zIndex = value;
    this.transform = value;
    this.transformOrigin = value;
  }
}
__name(PositionChangeSet, "PositionChangeSet");
class PositionData {
  constructor({
    height = null,
    left = null,
    maxHeight = null,
    maxWidth = null,
    minHeight = null,
    minWidth = null,
    rotateX = null,
    rotateY = null,
    rotateZ = null,
    scale = null,
    translateX = null,
    translateY = null,
    translateZ = null,
    top = null,
    transformOrigin = null,
    width = null,
    zIndex = null
  } = {}) {
    this.height = height;
    this.left = left;
    this.maxHeight = maxHeight;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.rotateX = rotateX;
    this.rotateY = rotateY;
    this.rotateZ = rotateZ;
    this.scale = scale;
    this.top = top;
    this.transformOrigin = transformOrigin;
    this.translateX = translateX;
    this.translateY = translateY;
    this.translateZ = translateZ;
    this.width = width;
    this.zIndex = zIndex;
    Object.seal(this);
  }
  copy(data) {
    this.height = data.height;
    this.left = data.left;
    this.maxHeight = data.maxHeight;
    this.maxWidth = data.maxWidth;
    this.minHeight = data.minHeight;
    this.minWidth = data.minWidth;
    this.rotateX = data.rotateX;
    this.rotateY = data.rotateY;
    this.rotateZ = data.rotateZ;
    this.scale = data.scale;
    this.top = data.top;
    this.transformOrigin = data.transformOrigin;
    this.translateX = data.translateX;
    this.translateY = data.translateY;
    this.translateZ = data.translateZ;
    this.width = data.width;
    this.zIndex = data.zIndex;
    return this;
  }
}
__name(PositionData, "PositionData");
class PositionStateAPI {
  #data;
  #dataSaved = /* @__PURE__ */ new Map();
  #position;
  #transforms;
  constructor(position, data, transforms) {
    this.#position = position;
    this.#data = data;
    this.#transforms = transforms;
  }
  get({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - getSave error: 'name' is not a string.`);
    }
    return this.#dataSaved.get(name);
  }
  getDefault() {
    return this.#dataSaved.get("#defaultData");
  }
  remove({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - remove: 'name' is not a string.`);
    }
    const data = this.#dataSaved.get(name);
    this.#dataSaved.delete(name);
    return data;
  }
  reset({ keepZIndex = false, invokeSet = true } = {}) {
    const defaultData = this.#dataSaved.get("#defaultData");
    if (typeof defaultData !== "object") {
      return false;
    }
    if (this.#position.animate.isScheduled) {
      this.#position.animate.cancel();
    }
    const zIndex = this.#position.zIndex;
    const data = Object.assign({}, defaultData);
    if (keepZIndex) {
      data.zIndex = zIndex;
    }
    this.#transforms.reset(data);
    if (this.#position.parent?.reactive?.minimized) {
      this.#position.parent?.maximize?.({ animate: false, duration: 0 });
    }
    if (invokeSet) {
      setTimeout(() => this.#position.set(data), 0);
    }
    return true;
  }
  restore({
    name,
    remove = false,
    properties,
    silent = false,
    async = false,
    animateTo = false,
    duration = 0.1,
    ease = identity,
    interpolate = lerp$5
  }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - restore error: 'name' is not a string.`);
    }
    const dataSaved = this.#dataSaved.get(name);
    if (dataSaved) {
      if (remove) {
        this.#dataSaved.delete(name);
      }
      let data = dataSaved;
      if (isIterable(properties)) {
        data = {};
        for (const property of properties) {
          data[property] = dataSaved[property];
        }
      }
      if (silent) {
        for (const property in data) {
          this.#data[property] = data[property];
        }
        return dataSaved;
      } else if (animateTo) {
        if (data.transformOrigin !== this.#position.transformOrigin) {
          this.#position.transformOrigin = data.transformOrigin;
        }
        if (async) {
          return this.#position.animate.to(data, { duration, ease, interpolate }).finished.then(() => dataSaved);
        } else {
          this.#position.animate.to(data, { duration, ease, interpolate });
        }
      } else {
        this.#position.set(data);
      }
    }
    return dataSaved;
  }
  save({ name, ...extra }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - save error: 'name' is not a string.`);
    }
    const data = this.#position.get(extra);
    this.#dataSaved.set(name, data);
    return data;
  }
  set({ name, ...data }) {
    if (typeof name !== "string") {
      throw new TypeError(`Position - set error: 'name' is not a string.`);
    }
    this.#dataSaved.set(name, data);
  }
}
__name(PositionStateAPI, "PositionStateAPI");
class StyleCache {
  constructor() {
    this.el = void 0;
    this.computed = void 0;
    this.marginLeft = void 0;
    this.marginTop = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.minHeight = void 0;
    this.minWidth = void 0;
    this.hasWillChange = false;
    this.resizeObserved = {
      contentHeight: void 0,
      contentWidth: void 0,
      offsetHeight: void 0,
      offsetWidth: void 0
    };
    const storeResizeObserved = writable(this.resizeObserved);
    this.stores = {
      element: writable(this.el),
      resizeContentHeight: propertyStore(storeResizeObserved, "contentHeight"),
      resizeContentWidth: propertyStore(storeResizeObserved, "contentWidth"),
      resizeObserved: storeResizeObserved,
      resizeOffsetHeight: propertyStore(storeResizeObserved, "offsetHeight"),
      resizeOffsetWidth: propertyStore(storeResizeObserved, "offsetWidth")
    };
  }
  get offsetHeight() {
    if (this.el instanceof HTMLElement) {
      return this.resizeObserved.offsetHeight !== void 0 ? this.resizeObserved.offsetHeight : this.el.offsetHeight;
    }
    throw new Error(`StyleCache - get offsetHeight error: no element assigned.`);
  }
  get offsetWidth() {
    if (this.el instanceof HTMLElement) {
      return this.resizeObserved.offsetWidth !== void 0 ? this.resizeObserved.offsetWidth : this.el.offsetWidth;
    }
    throw new Error(`StyleCache - get offsetWidth error: no element assigned.`);
  }
  hasData(el) {
    return this.el === el;
  }
  reset() {
    if (this.el instanceof HTMLElement && this.el.isConnected && !this.hasWillChange) {
      this.el.style.willChange = null;
    }
    this.el = void 0;
    this.computed = void 0;
    this.marginLeft = void 0;
    this.marginTop = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.minHeight = void 0;
    this.minWidth = void 0;
    this.hasWillChange = false;
    this.resizeObserved.contentHeight = void 0;
    this.resizeObserved.contentWidth = void 0;
    this.resizeObserved.offsetHeight = void 0;
    this.resizeObserved.offsetWidth = void 0;
    this.stores.element.set(void 0);
  }
  update(el) {
    this.el = el;
    this.computed = globalThis.getComputedStyle(el);
    this.marginLeft = styleParsePixels(el.style.marginLeft) ?? styleParsePixels(this.computed.marginLeft);
    this.marginTop = styleParsePixels(el.style.marginTop) ?? styleParsePixels(this.computed.marginTop);
    this.maxHeight = styleParsePixels(el.style.maxHeight) ?? styleParsePixels(this.computed.maxHeight);
    this.maxWidth = styleParsePixels(el.style.maxWidth) ?? styleParsePixels(this.computed.maxWidth);
    this.minHeight = styleParsePixels(el.style.minHeight) ?? styleParsePixels(this.computed.minHeight);
    this.minWidth = styleParsePixels(el.style.minWidth) ?? styleParsePixels(this.computed.minWidth);
    const willChange = el.style.willChange !== "" ? el.style.willChange : this.computed.willChange;
    this.hasWillChange = willChange !== "" && willChange !== "auto";
    this.stores.element.set(el);
  }
}
__name(StyleCache, "StyleCache");
class TransformData {
  constructor() {
    Object.seal(this);
  }
  #boundingRect = new DOMRect();
  #corners = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
  #mat4 = mat4.create();
  #originTranslations = [mat4.create(), mat4.create()];
  get boundingRect() {
    return this.#boundingRect;
  }
  get corners() {
    return this.#corners;
  }
  get css() {
    return `matrix3d(${this.mat4.join(",")})`;
  }
  get mat4() {
    return this.#mat4;
  }
  get originTranslations() {
    return this.#originTranslations;
  }
}
__name(TransformData, "TransformData");
class AdapterValidators {
  #validatorData;
  #mapUnsubscribe = /* @__PURE__ */ new Map();
  constructor() {
    this.#validatorData = [];
    Object.seal(this);
    return [this, this.#validatorData];
  }
  get length() {
    return this.#validatorData.length;
  }
  *[Symbol.iterator]() {
    if (this.#validatorData.length === 0) {
      return;
    }
    for (const entry of this.#validatorData) {
      yield { ...entry };
    }
  }
  add(...validators) {
    for (const validator of validators) {
      const validatorType = typeof validator;
      if (validatorType !== "function" && validatorType !== "object" || validator === null) {
        throw new TypeError(`AdapterValidator error: 'validator' is not a function or object.`);
      }
      let data = void 0;
      let subscribeFn = void 0;
      switch (validatorType) {
        case "function":
          data = {
            id: void 0,
            validator,
            weight: 1
          };
          subscribeFn = validator.subscribe;
          break;
        case "object":
          if (typeof validator.validator !== "function") {
            throw new TypeError(`AdapterValidator error: 'validator' attribute is not a function.`);
          }
          if (validator.weight !== void 0 && typeof validator.weight !== "number" || (validator.weight < 0 || validator.weight > 1)) {
            throw new TypeError(
              `AdapterValidator error: 'weight' attribute is not a number between '0 - 1' inclusive.`
            );
          }
          data = {
            id: validator.id !== void 0 ? validator.id : void 0,
            validator: validator.validator.bind(validator),
            weight: validator.weight || 1,
            instance: validator
          };
          subscribeFn = validator.validator.subscribe ?? validator.subscribe;
          break;
      }
      const index = this.#validatorData.findIndex((value) => {
        return data.weight < value.weight;
      });
      if (index >= 0) {
        this.#validatorData.splice(index, 0, data);
      } else {
        this.#validatorData.push(data);
      }
      if (typeof subscribeFn === "function") {
        const unsubscribe = subscribeFn();
        if (typeof unsubscribe !== "function") {
          throw new TypeError(
            "AdapterValidator error: Filter has subscribe function, but no unsubscribe function is returned."
          );
        }
        if (this.#mapUnsubscribe.has(data.validator)) {
          throw new Error(
            "AdapterValidator error: Filter added already has an unsubscribe function registered."
          );
        }
        this.#mapUnsubscribe.set(data.validator, unsubscribe);
      }
    }
  }
  clear() {
    this.#validatorData.length = 0;
    for (const unsubscribe of this.#mapUnsubscribe.values()) {
      unsubscribe();
    }
    this.#mapUnsubscribe.clear();
  }
  remove(...validators) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    for (const data of validators) {
      const actualValidator = typeof data === "function" ? data : data !== null && typeof data === "object" ? data.validator : void 0;
      if (!actualValidator) {
        continue;
      }
      for (let cntr = this.#validatorData.length; --cntr >= 0; ) {
        if (this.#validatorData[cntr].validator === actualValidator) {
          this.#validatorData.splice(cntr, 1);
          let unsubscribe = void 0;
          if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualValidator)) === "function") {
            unsubscribe();
            this.#mapUnsubscribe.delete(actualValidator);
          }
        }
      }
    }
  }
  removeBy(callback) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    if (typeof callback !== "function") {
      throw new TypeError(`AdapterValidator error: 'callback' is not a function.`);
    }
    this.#validatorData = this.#validatorData.filter((data) => {
      const remove = callback.call(callback, { ...data });
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.validator);
        }
      }
      return !remove;
    });
  }
  removeById(...ids) {
    const length = this.#validatorData.length;
    if (length === 0) {
      return;
    }
    this.#validatorData = this.#validatorData.filter((data) => {
      let remove = false;
      for (const id of ids) {
        remove |= data.id === id;
      }
      if (remove) {
        let unsubscribe;
        if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.validator)) === "function") {
          unsubscribe();
          this.#mapUnsubscribe.delete(data.validator);
        }
      }
      return !remove;
    });
  }
}
__name(AdapterValidators, "AdapterValidators");
class BasicBounds {
  #constrain;
  #element;
  #enabled;
  #height;
  #lock;
  #width;
  constructor({ constrain = true, element: element2, enabled = true, lock = false, width, height } = {}) {
    this.element = element2;
    this.constrain = constrain;
    this.enabled = enabled;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get constrain() {
    return this.#constrain;
  }
  get element() {
    return this.#element;
  }
  get enabled() {
    return this.#enabled;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set constrain(constrain) {
    if (this.#lock) {
      return;
    }
    if (typeof constrain !== "boolean") {
      throw new TypeError(`'constrain' is not a boolean.`);
    }
    this.#constrain = constrain;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set enabled(enabled) {
    if (this.#lock) {
      return;
    }
    if (typeof enabled !== "boolean") {
      throw new TypeError(`'enabled' is not a boolean.`);
    }
    this.#enabled = enabled;
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  validator(valData) {
    if (!this.#enabled) {
      return valData.position;
    }
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    if (typeof valData.position.width === "number") {
      const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
      valData.position.width = valData.width = Math.clamped(valData.position.width, valData.minWidth, maxW);
      if (valData.width + valData.position.left + valData.marginLeft > boundsWidth) {
        valData.position.left = boundsWidth - valData.width - valData.marginLeft;
      }
    }
    if (typeof valData.position.height === "number") {
      const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
      valData.position.height = valData.height = Math.clamped(valData.position.height, valData.minHeight, maxH);
      if (valData.height + valData.position.top + valData.marginTop > boundsHeight) {
        valData.position.top = boundsHeight - valData.height - valData.marginTop;
      }
    }
    const maxL = Math.max(boundsWidth - valData.width - valData.marginLeft, 0);
    valData.position.left = Math.round(Math.clamped(valData.position.left, 0, maxL));
    const maxT = Math.max(boundsHeight - valData.height - valData.marginTop, 0);
    valData.position.top = Math.round(Math.clamped(valData.position.top, 0, maxT));
    return valData.position;
  }
}
__name(BasicBounds, "BasicBounds");
const s_TRANSFORM_DATA = new TransformData();
class TransformBounds {
  #constrain;
  #element;
  #enabled;
  #height;
  #lock;
  #width;
  constructor({ constrain = true, element: element2, enabled = true, lock = false, width, height } = {}) {
    this.element = element2;
    this.constrain = constrain;
    this.enabled = enabled;
    this.width = width;
    this.height = height;
    this.#lock = typeof lock === "boolean" ? lock : false;
  }
  get constrain() {
    return this.#constrain;
  }
  get element() {
    return this.#element;
  }
  get enabled() {
    return this.#enabled;
  }
  get height() {
    return this.#height;
  }
  get width() {
    return this.#width;
  }
  set constrain(constrain) {
    if (this.#lock) {
      return;
    }
    if (typeof constrain !== "boolean") {
      throw new TypeError(`'constrain' is not a boolean.`);
    }
    this.#constrain = constrain;
  }
  set element(element2) {
    if (this.#lock) {
      return;
    }
    if (element2 === void 0 || element2 === null || element2 instanceof HTMLElement) {
      this.#element = element2;
    } else {
      throw new TypeError(`'element' is not a HTMLElement, undefined, or null.`);
    }
  }
  set enabled(enabled) {
    if (this.#lock) {
      return;
    }
    if (typeof enabled !== "boolean") {
      throw new TypeError(`'enabled' is not a boolean.`);
    }
    this.#enabled = enabled;
  }
  set height(height) {
    if (this.#lock) {
      return;
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  set width(width) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
  }
  setDimension(width, height) {
    if (this.#lock) {
      return;
    }
    if (width === void 0 || Number.isFinite(width)) {
      this.#width = width;
    } else {
      throw new TypeError(`'width' is not a finite number or undefined.`);
    }
    if (height === void 0 || Number.isFinite(height)) {
      this.#height = height;
    } else {
      throw new TypeError(`'height' is not a finite number or undefined.`);
    }
  }
  validator(valData) {
    if (!this.#enabled) {
      return valData.position;
    }
    const boundsWidth = this.#width ?? this.#element?.offsetWidth ?? globalThis.innerWidth;
    const boundsHeight = this.#height ?? this.#element?.offsetHeight ?? globalThis.innerHeight;
    if (typeof valData.position.width === "number") {
      const maxW = valData.maxWidth ?? (this.#constrain ? boundsWidth : Number.MAX_SAFE_INTEGER);
      valData.position.width = Math.clamped(valData.width, valData.minWidth, maxW);
    }
    if (typeof valData.position.height === "number") {
      const maxH = valData.maxHeight ?? (this.#constrain ? boundsHeight : Number.MAX_SAFE_INTEGER);
      valData.position.height = Math.clamped(valData.height, valData.minHeight, maxH);
    }
    const data = valData.transforms.getData(valData.position, s_TRANSFORM_DATA, valData);
    const initialX = data.boundingRect.x;
    const initialY = data.boundingRect.y;
    if (data.boundingRect.bottom + valData.marginTop > boundsHeight) {
      data.boundingRect.y += boundsHeight - data.boundingRect.bottom - valData.marginTop;
    }
    if (data.boundingRect.right + valData.marginLeft > boundsWidth) {
      data.boundingRect.x += boundsWidth - data.boundingRect.right - valData.marginLeft;
    }
    if (data.boundingRect.top - valData.marginTop < 0) {
      data.boundingRect.y += Math.abs(data.boundingRect.top - valData.marginTop);
    }
    if (data.boundingRect.left - valData.marginLeft < 0) {
      data.boundingRect.x += Math.abs(data.boundingRect.left - valData.marginLeft);
    }
    valData.position.left -= initialX - data.boundingRect.x;
    valData.position.top -= initialY - data.boundingRect.y;
    return valData.position;
  }
}
__name(TransformBounds, "TransformBounds");
const basicWindow = new BasicBounds({ lock: true });
const transformWindow = new TransformBounds({ lock: true });
const positionValidators = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  basicWindow,
  BasicBounds,
  transformWindow,
  TransformBounds
}, Symbol.toStringTag, { value: "Module" }));
const s_SCALE_VECTOR = [1, 1, 1];
const s_TRANSLATE_VECTOR = [0, 0, 0];
const s_MAT4_RESULT = mat4.create();
const s_MAT4_TEMP = mat4.create();
const s_VEC3_TEMP = vec3.create();
class Transforms {
  #orderList = [];
  constructor() {
    this._data = {};
  }
  get isActive() {
    return this.#orderList.length > 0;
  }
  get rotateX() {
    return this._data.rotateX;
  }
  get rotateY() {
    return this._data.rotateY;
  }
  get rotateZ() {
    return this._data.rotateZ;
  }
  get scale() {
    return this._data.scale;
  }
  get translateX() {
    return this._data.translateX;
  }
  get translateY() {
    return this._data.translateY;
  }
  get translateZ() {
    return this._data.translateZ;
  }
  set rotateX(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateX === void 0) {
        this.#orderList.push("rotateX");
      }
      this._data.rotateX = value;
    } else {
      if (this._data.rotateX !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "rotateX");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.rotateX;
    }
  }
  set rotateY(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateY === void 0) {
        this.#orderList.push("rotateY");
      }
      this._data.rotateY = value;
    } else {
      if (this._data.rotateY !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "rotateY");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.rotateY;
    }
  }
  set rotateZ(value) {
    if (Number.isFinite(value)) {
      if (this._data.rotateZ === void 0) {
        this.#orderList.push("rotateZ");
      }
      this._data.rotateZ = value;
    } else {
      if (this._data.rotateZ !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "rotateZ");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.rotateZ;
    }
  }
  set scale(value) {
    if (Number.isFinite(value)) {
      if (this._data.scale === void 0) {
        this.#orderList.push("scale");
      }
      this._data.scale = value;
    } else {
      if (this._data.scale !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "scale");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.scale;
    }
  }
  set translateX(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateX === void 0) {
        this.#orderList.push("translateX");
      }
      this._data.translateX = value;
    } else {
      if (this._data.translateX !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "translateX");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.translateX;
    }
  }
  set translateY(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateY === void 0) {
        this.#orderList.push("translateY");
      }
      this._data.translateY = value;
    } else {
      if (this._data.translateY !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "translateY");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.translateY;
    }
  }
  set translateZ(value) {
    if (Number.isFinite(value)) {
      if (this._data.translateZ === void 0) {
        this.#orderList.push("translateZ");
      }
      this._data.translateZ = value;
    } else {
      if (this._data.translateZ !== void 0) {
        const index = this.#orderList.findIndex((entry) => entry === "translateZ");
        if (index >= 0) {
          this.#orderList.splice(index, 1);
        }
      }
      delete this._data.translateZ;
    }
  }
  getCSS(data = this._data) {
    return `matrix3d(${this.getMat4(data, s_MAT4_RESULT).join(",")})`;
  }
  getCSSOrtho(data = this._data) {
    return `matrix3d(${this.getMat4Ortho(data, s_MAT4_RESULT).join(",")})`;
  }
  getData(position, output = new TransformData(), validationData = {}) {
    const valWidth = validationData.width ?? 0;
    const valHeight = validationData.height ?? 0;
    const valOffsetTop = validationData.offsetTop ?? validationData.marginTop ?? 0;
    const valOffsetLeft = validationData.offsetLeft ?? validationData.offsetLeft ?? 0;
    position.top += valOffsetTop;
    position.left += valOffsetLeft;
    const width = Number.isFinite(position.width) ? position.width : valWidth;
    const height = Number.isFinite(position.height) ? position.height : valHeight;
    const rect = output.corners;
    if (this.hasTransform(position)) {
      rect[0][0] = rect[0][1] = rect[0][2] = 0;
      rect[1][0] = width;
      rect[1][1] = rect[1][2] = 0;
      rect[2][0] = width;
      rect[2][1] = height;
      rect[2][2] = 0;
      rect[3][0] = 0;
      rect[3][1] = height;
      rect[3][2] = 0;
      const matrix = this.getMat4(position, output.mat4);
      const translate = s_GET_ORIGIN_TRANSLATION(position.transformOrigin, width, height, output.originTranslations);
      if (transformOriginDefault === position.transformOrigin) {
        vec3.transformMat4(rect[0], rect[0], matrix);
        vec3.transformMat4(rect[1], rect[1], matrix);
        vec3.transformMat4(rect[2], rect[2], matrix);
        vec3.transformMat4(rect[3], rect[3], matrix);
      } else {
        vec3.transformMat4(rect[0], rect[0], translate[0]);
        vec3.transformMat4(rect[0], rect[0], matrix);
        vec3.transformMat4(rect[0], rect[0], translate[1]);
        vec3.transformMat4(rect[1], rect[1], translate[0]);
        vec3.transformMat4(rect[1], rect[1], matrix);
        vec3.transformMat4(rect[1], rect[1], translate[1]);
        vec3.transformMat4(rect[2], rect[2], translate[0]);
        vec3.transformMat4(rect[2], rect[2], matrix);
        vec3.transformMat4(rect[2], rect[2], translate[1]);
        vec3.transformMat4(rect[3], rect[3], translate[0]);
        vec3.transformMat4(rect[3], rect[3], matrix);
        vec3.transformMat4(rect[3], rect[3], translate[1]);
      }
      rect[0][0] = position.left + rect[0][0];
      rect[0][1] = position.top + rect[0][1];
      rect[1][0] = position.left + rect[1][0];
      rect[1][1] = position.top + rect[1][1];
      rect[2][0] = position.left + rect[2][0];
      rect[2][1] = position.top + rect[2][1];
      rect[3][0] = position.left + rect[3][0];
      rect[3][1] = position.top + rect[3][1];
    } else {
      rect[0][0] = position.left;
      rect[0][1] = position.top;
      rect[1][0] = position.left + width;
      rect[1][1] = position.top;
      rect[2][0] = position.left + width;
      rect[2][1] = position.top + height;
      rect[3][0] = position.left;
      rect[3][1] = position.top + height;
      mat4.identity(output.mat4);
    }
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    for (let cntr = 4; --cntr >= 0; ) {
      if (rect[cntr][0] > maxX) {
        maxX = rect[cntr][0];
      }
      if (rect[cntr][0] < minX) {
        minX = rect[cntr][0];
      }
      if (rect[cntr][1] > maxY) {
        maxY = rect[cntr][1];
      }
      if (rect[cntr][1] < minY) {
        minY = rect[cntr][1];
      }
    }
    const boundingRect = output.boundingRect;
    boundingRect.x = minX;
    boundingRect.y = minY;
    boundingRect.width = maxX - minX;
    boundingRect.height = maxY - minY;
    position.top -= valOffsetTop;
    position.left -= valOffsetLeft;
    return output;
  }
  getMat4(data = this._data, output = mat4.create()) {
    const matrix = mat4.identity(output);
    let seenKeys = 0;
    const orderList = this.#orderList;
    for (let cntr = 0; cntr < orderList.length; cntr++) {
      const key = orderList[cntr];
      switch (key) {
        case "rotateX":
          seenKeys |= transformKeysBitwise.rotateX;
          mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateY":
          seenKeys |= transformKeysBitwise.rotateY;
          mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateZ":
          seenKeys |= transformKeysBitwise.rotateZ;
          mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "scale":
          seenKeys |= transformKeysBitwise.scale;
          s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
          mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
          break;
        case "translateX":
          seenKeys |= transformKeysBitwise.translateX;
          s_TRANSLATE_VECTOR[0] = data.translateX;
          s_TRANSLATE_VECTOR[1] = 0;
          s_TRANSLATE_VECTOR[2] = 0;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
        case "translateY":
          seenKeys |= transformKeysBitwise.translateY;
          s_TRANSLATE_VECTOR[0] = 0;
          s_TRANSLATE_VECTOR[1] = data.translateY;
          s_TRANSLATE_VECTOR[2] = 0;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
        case "translateZ":
          seenKeys |= transformKeysBitwise.translateZ;
          s_TRANSLATE_VECTOR[0] = 0;
          s_TRANSLATE_VECTOR[1] = 0;
          s_TRANSLATE_VECTOR[2] = data.translateZ;
          mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
          break;
      }
    }
    if (data !== this._data) {
      for (let cntr = 0; cntr < transformKeys.length; cntr++) {
        const key = transformKeys[cntr];
        if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) {
          continue;
        }
        switch (key) {
          case "rotateX":
            mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateY":
            mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateZ":
            mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "scale":
            s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
            mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
            break;
          case "translateX":
            s_TRANSLATE_VECTOR[0] = data[key];
            s_TRANSLATE_VECTOR[1] = 0;
            s_TRANSLATE_VECTOR[2] = 0;
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
          case "translateY":
            s_TRANSLATE_VECTOR[0] = 0;
            s_TRANSLATE_VECTOR[1] = data[key];
            s_TRANSLATE_VECTOR[2] = 0;
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
          case "translateZ":
            s_TRANSLATE_VECTOR[0] = 0;
            s_TRANSLATE_VECTOR[1] = 0;
            s_TRANSLATE_VECTOR[2] = data[key];
            mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
            break;
        }
      }
    }
    return matrix;
  }
  getMat4Ortho(data = this._data, output = mat4.create()) {
    const matrix = mat4.identity(output);
    s_TRANSLATE_VECTOR[0] = (data.left ?? 0) + (data.translateX ?? 0);
    s_TRANSLATE_VECTOR[1] = (data.top ?? 0) + (data.translateY ?? 0);
    s_TRANSLATE_VECTOR[2] = data.translateZ ?? 0;
    mat4.multiply(matrix, matrix, mat4.fromTranslation(s_MAT4_TEMP, s_TRANSLATE_VECTOR));
    if (data.scale !== null) {
      s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data.scale;
      mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
    }
    if (data.rotateX === null && data.rotateY === null && data.rotateZ === null) {
      return matrix;
    }
    let seenKeys = 0;
    const orderList = this.#orderList;
    for (let cntr = 0; cntr < orderList.length; cntr++) {
      const key = orderList[cntr];
      switch (key) {
        case "rotateX":
          seenKeys |= transformKeysBitwise.rotateX;
          mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateY":
          seenKeys |= transformKeysBitwise.rotateY;
          mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
        case "rotateZ":
          seenKeys |= transformKeysBitwise.rotateZ;
          mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
          break;
      }
    }
    if (data !== this._data) {
      for (let cntr = 0; cntr < transformKeys.length; cntr++) {
        const key = transformKeys[cntr];
        if (data[key] === null || (seenKeys & transformKeysBitwise[key]) > 0) {
          continue;
        }
        switch (key) {
          case "rotateX":
            mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateY":
            mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
          case "rotateZ":
            mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
            break;
        }
      }
    }
    return matrix;
  }
  hasTransform(data) {
    for (const key of transformKeys) {
      if (Number.isFinite(data[key])) {
        return true;
      }
    }
    return false;
  }
  reset(data) {
    for (const key in data) {
      if (transformKeys.includes(key)) {
        if (Number.isFinite(data[key])) {
          this._data[key] = data[key];
        } else {
          const index = this.#orderList.findIndex((entry) => entry === key);
          if (index >= 0) {
            this.#orderList.splice(index, 1);
          }
          delete this._data[key];
        }
      }
    }
  }
}
__name(Transforms, "Transforms");
function s_GET_ORIGIN_TRANSLATION(transformOrigin, width, height, output) {
  const vector = s_VEC3_TEMP;
  switch (transformOrigin) {
    case "top left":
      vector[0] = vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      mat4.fromTranslation(output[1], vector);
      break;
    case "top center":
      vector[0] = -width * 0.5;
      vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "top right":
      vector[0] = -width;
      vector[1] = 0;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      mat4.fromTranslation(output[1], vector);
      break;
    case "center left":
      vector[0] = 0;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case null:
    case "center":
      vector[0] = -width * 0.5;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "center right":
      vector[0] = -width;
      vector[1] = -height * 0.5;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      vector[1] = height * 0.5;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom left":
      vector[0] = 0;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom center":
      vector[0] = -width * 0.5;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width * 0.5;
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    case "bottom right":
      vector[0] = -width;
      vector[1] = -height;
      mat4.fromTranslation(output[0], vector);
      vector[0] = width;
      vector[1] = height;
      mat4.fromTranslation(output[1], vector);
      break;
    default:
      mat4.identity(output[0]);
      mat4.identity(output[1]);
      break;
  }
  return output;
}
__name(s_GET_ORIGIN_TRANSLATION, "s_GET_ORIGIN_TRANSLATION");
class UpdateElementData {
  constructor() {
    this.data = void 0;
    this.dataSubscribers = new PositionData();
    this.dimensionData = { width: 0, height: 0 };
    this.changeSet = void 0;
    this.options = void 0;
    this.queued = false;
    this.styleCache = void 0;
    this.transforms = void 0;
    this.transformData = new TransformData();
    this.subscriptions = void 0;
    this.storeDimension = writable(this.dimensionData);
    this.storeTransform = writable(this.transformData, () => {
      this.options.transformSubscribed = true;
      return () => this.options.transformSubscribed = false;
    });
    this.queued = false;
    Object.seal(this.dimensionData);
  }
}
__name(UpdateElementData, "UpdateElementData");
async function nextAnimationFrame(cntr = 1) {
  if (!Number.isInteger(cntr) || cntr < 1) {
    throw new TypeError(`nextAnimationFrame error: 'cntr' must be a positive integer greater than 0.`);
  }
  let currentTime = performance.now();
  for (; --cntr >= 0; ) {
    currentTime = await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return currentTime;
}
__name(nextAnimationFrame, "nextAnimationFrame");
class UpdateElementManager {
  static list = [];
  static listCntr = 0;
  static updatePromise;
  static get promise() {
    return this.updatePromise;
  }
  static add(el, updateData) {
    if (this.listCntr < this.list.length) {
      const entry = this.list[this.listCntr];
      entry[0] = el;
      entry[1] = updateData;
    } else {
      this.list.push([el, updateData]);
    }
    this.listCntr++;
    updateData.queued = true;
    if (!this.updatePromise) {
      this.updatePromise = this.wait();
    }
    return this.updatePromise;
  }
  static async wait() {
    const currentTime = await nextAnimationFrame();
    this.updatePromise = void 0;
    for (let cntr = this.listCntr; --cntr >= 0; ) {
      const entry = this.list[cntr];
      const el = entry[0];
      const updateData = entry[1];
      entry[0] = void 0;
      entry[1] = void 0;
      updateData.queued = false;
      if (!el.isConnected) {
        continue;
      }
      if (updateData.options.ortho) {
        s_UPDATE_ELEMENT_ORTHO(el, updateData);
      } else {
        s_UPDATE_ELEMENT(el, updateData);
      }
      if (updateData.options.calculateTransform || updateData.options.transformSubscribed) {
        s_UPDATE_TRANSFORM(el, updateData);
      }
      this.updateSubscribers(updateData);
    }
    this.listCntr = 0;
    return currentTime;
  }
  static immediate(el, updateData) {
    if (!el.isConnected) {
      return;
    }
    if (updateData.options.ortho) {
      s_UPDATE_ELEMENT_ORTHO(el, updateData);
    } else {
      s_UPDATE_ELEMENT(el, updateData);
    }
    if (updateData.options.calculateTransform || updateData.options.transformSubscribed) {
      s_UPDATE_TRANSFORM(el, updateData);
    }
    this.updateSubscribers(updateData);
  }
  static updateSubscribers(updateData) {
    const data = updateData.data;
    const changeSet = updateData.changeSet;
    if (!changeSet.hasChange()) {
      return;
    }
    const output = updateData.dataSubscribers.copy(data);
    const subscriptions = updateData.subscriptions;
    if (subscriptions.length > 0) {
      for (let cntr = 0; cntr < subscriptions.length; cntr++) {
        subscriptions[cntr](output);
      }
    }
    if (changeSet.width || changeSet.height) {
      updateData.dimensionData.width = data.width;
      updateData.dimensionData.height = data.height;
      updateData.storeDimension.set(updateData.dimensionData);
    }
    changeSet.set(false);
  }
}
__name(UpdateElementManager, "UpdateElementManager");
function s_UPDATE_ELEMENT(el, updateData) {
  const changeSet = updateData.changeSet;
  const data = updateData.data;
  if (changeSet.left) {
    el.style.left = `${data.left}px`;
  }
  if (changeSet.top) {
    el.style.top = `${data.top}px`;
  }
  if (changeSet.zIndex) {
    el.style.zIndex = typeof data.zIndex === "number" ? `${data.zIndex}` : null;
  }
  if (changeSet.width) {
    el.style.width = typeof data.width === "number" ? `${data.width}px` : data.width;
  }
  if (changeSet.height) {
    el.style.height = typeof data.height === "number" ? `${data.height}px` : data.height;
  }
  if (changeSet.transformOrigin) {
    el.style.transformOrigin = data.transformOrigin === "center" ? null : data.transformOrigin;
  }
  if (changeSet.transform) {
    el.style.transform = updateData.transforms.isActive ? updateData.transforms.getCSS() : null;
  }
}
__name(s_UPDATE_ELEMENT, "s_UPDATE_ELEMENT");
function s_UPDATE_ELEMENT_ORTHO(el, updateData) {
  const changeSet = updateData.changeSet;
  const data = updateData.data;
  if (changeSet.zIndex) {
    el.style.zIndex = typeof data.zIndex === "number" ? `${data.zIndex}` : null;
  }
  if (changeSet.width) {
    el.style.width = typeof data.width === "number" ? `${data.width}px` : data.width;
  }
  if (changeSet.height) {
    el.style.height = typeof data.height === "number" ? `${data.height}px` : data.height;
  }
  if (changeSet.transformOrigin) {
    el.style.transformOrigin = data.transformOrigin === "center" ? null : data.transformOrigin;
  }
  if (changeSet.left || changeSet.top || changeSet.transform) {
    el.style.transform = updateData.transforms.getCSSOrtho(data);
  }
}
__name(s_UPDATE_ELEMENT_ORTHO, "s_UPDATE_ELEMENT_ORTHO");
function s_UPDATE_TRANSFORM(el, updateData) {
  s_VALIDATION_DATA$1.height = updateData.data.height !== "auto" ? updateData.data.height : updateData.styleCache.offsetHeight;
  s_VALIDATION_DATA$1.width = updateData.data.width !== "auto" ? updateData.data.width : updateData.styleCache.offsetWidth;
  s_VALIDATION_DATA$1.marginLeft = updateData.styleCache.marginLeft;
  s_VALIDATION_DATA$1.marginTop = updateData.styleCache.marginTop;
  updateData.transforms.getData(updateData.data, updateData.transformData, s_VALIDATION_DATA$1);
  updateData.storeTransform.set(updateData.transformData);
}
__name(s_UPDATE_TRANSFORM, "s_UPDATE_TRANSFORM");
const s_VALIDATION_DATA$1 = {
  height: void 0,
  width: void 0,
  marginLeft: void 0,
  marginTop: void 0
};
class Position {
  #data = new PositionData();
  #animate = new AnimationAPI(this, this.#data);
  #positionChangeSet = new PositionChangeSet();
  #options = {
    calculateTransform: false,
    initialHelper: void 0,
    ortho: true,
    transformSubscribed: false
  };
  #parent;
  #stores;
  #styleCache;
  #subscriptions = [];
  #transforms = new Transforms();
  #updateElementData;
  #updateElementPromise;
  #validators;
  #validatorData;
  #state = new PositionStateAPI(this, this.#data, this.#transforms);
  static get Animate() {
    return AnimationGroupAPI;
  }
  static get Initial() {
    return positionInitial;
  }
  static get TransformData() {
    return TransformData;
  }
  static get Validators() {
    return positionValidators;
  }
  static duplicate(position, options) {
    if (!(position instanceof Position)) {
      throw new TypeError(`'position' is not an instance of Position.`);
    }
    const newPosition = new Position(options);
    newPosition.#options = Object.assign({}, position.#options, options);
    newPosition.#validators.add(...position.#validators);
    newPosition.set(position.#data);
    return newPosition;
  }
  constructor(parent, options) {
    if (isPlainObject(parent)) {
      options = parent;
    } else {
      this.#parent = parent;
    }
    const data = this.#data;
    const transforms = this.#transforms;
    this.#styleCache = new StyleCache();
    const updateData = new UpdateElementData();
    updateData.changeSet = this.#positionChangeSet;
    updateData.data = this.#data;
    updateData.options = this.#options;
    updateData.styleCache = this.#styleCache;
    updateData.subscriptions = this.#subscriptions;
    updateData.transforms = this.#transforms;
    this.#updateElementData = updateData;
    if (typeof options === "object") {
      if (typeof options.calculateTransform === "boolean") {
        this.#options.calculateTransform = options.calculateTransform;
      }
      if (typeof options.ortho === "boolean") {
        this.#options.ortho = options.ortho;
      }
      if (Number.isFinite(options.height) || options.height === "auto" || options.height === "inherit" || options.height === null) {
        data.height = updateData.dimensionData.height = typeof options.height === "number" ? Math.round(options.height) : options.height;
      }
      if (Number.isFinite(options.left) || options.left === null) {
        data.left = typeof options.left === "number" ? Math.round(options.left) : options.left;
      }
      if (Number.isFinite(options.maxHeight) || options.maxHeight === null) {
        data.maxHeight = typeof options.maxHeight === "number" ? Math.round(options.maxHeight) : options.maxHeight;
      }
      if (Number.isFinite(options.maxWidth) || options.maxWidth === null) {
        data.maxWidth = typeof options.maxWidth === "number" ? Math.round(options.maxWidth) : options.maxWidth;
      }
      if (Number.isFinite(options.minHeight) || options.minHeight === null) {
        data.minHeight = typeof options.minHeight === "number" ? Math.round(options.minHeight) : options.minHeight;
      }
      if (Number.isFinite(options.minWidth) || options.minWidth === null) {
        data.minWidth = typeof options.minWidth === "number" ? Math.round(options.minWidth) : options.minWidth;
      }
      if (Number.isFinite(options.rotateX) || options.rotateX === null) {
        transforms.rotateX = data.rotateX = options.rotateX;
      }
      if (Number.isFinite(options.rotateY) || options.rotateY === null) {
        transforms.rotateY = data.rotateY = options.rotateY;
      }
      if (Number.isFinite(options.rotateZ) || options.rotateZ === null) {
        transforms.rotateZ = data.rotateZ = options.rotateZ;
      }
      if (Number.isFinite(options.scale) || options.scale === null) {
        transforms.scale = data.scale = options.scale;
      }
      if (Number.isFinite(options.top) || options.top === null) {
        data.top = typeof options.top === "number" ? Math.round(options.top) : options.top;
      }
      if (typeof options.transformOrigin === "string" || options.transformOrigin === null) {
        data.transformOrigin = transformOrigins.includes(options.transformOrigin) ? options.transformOrigin : null;
      }
      if (Number.isFinite(options.translateX) || options.translateX === null) {
        transforms.translateX = data.translateX = options.translateX;
      }
      if (Number.isFinite(options.translateY) || options.translateY === null) {
        transforms.translateY = data.translateY = options.translateY;
      }
      if (Number.isFinite(options.translateZ) || options.translateZ === null) {
        transforms.translateZ = data.translateZ = options.translateZ;
      }
      if (Number.isFinite(options.width) || options.width === "auto" || options.width === "inherit" || options.width === null) {
        data.width = updateData.dimensionData.width = typeof options.width === "number" ? Math.round(options.width) : options.width;
      }
      if (Number.isFinite(options.zIndex) || options.zIndex === null) {
        data.zIndex = typeof options.zIndex === "number" ? Math.round(options.zIndex) : options.zIndex;
      }
    }
    this.#stores = {
      height: propertyStore(this, "height"),
      left: propertyStore(this, "left"),
      rotateX: propertyStore(this, "rotateX"),
      rotateY: propertyStore(this, "rotateY"),
      rotateZ: propertyStore(this, "rotateZ"),
      scale: propertyStore(this, "scale"),
      top: propertyStore(this, "top"),
      transformOrigin: propertyStore(this, "transformOrigin"),
      translateX: propertyStore(this, "translateX"),
      translateY: propertyStore(this, "translateY"),
      translateZ: propertyStore(this, "translateZ"),
      width: propertyStore(this, "width"),
      zIndex: propertyStore(this, "zIndex"),
      maxHeight: propertyStore(this, "maxHeight"),
      maxWidth: propertyStore(this, "maxWidth"),
      minHeight: propertyStore(this, "minHeight"),
      minWidth: propertyStore(this, "minWidth"),
      dimension: { subscribe: updateData.storeDimension.subscribe },
      element: { subscribe: this.#styleCache.stores.element.subscribe },
      resizeContentHeight: { subscribe: this.#styleCache.stores.resizeContentHeight.subscribe },
      resizeContentWidth: { subscribe: this.#styleCache.stores.resizeContentWidth.subscribe },
      resizeOffsetHeight: { subscribe: this.#styleCache.stores.resizeOffsetHeight.subscribe },
      resizeOffsetWidth: { subscribe: this.#styleCache.stores.resizeOffsetWidth.subscribe },
      transform: { subscribe: updateData.storeTransform.subscribe },
      resizeObserved: this.#styleCache.stores.resizeObserved
    };
    subscribeIgnoreFirst(this.#stores.resizeObserved, (resizeData) => {
      const parent2 = this.#parent;
      const el = parent2 instanceof HTMLElement ? parent2 : parent2?.elementTarget;
      if (el instanceof HTMLElement && Number.isFinite(resizeData?.offsetWidth) && Number.isFinite(resizeData?.offsetHeight)) {
        this.set(data);
      }
    });
    this.#stores.transformOrigin.values = transformOrigins;
    [this.#validators, this.#validatorData] = new AdapterValidators();
    if (options?.initial || options?.positionInitial) {
      const initialHelper = options.initial ?? options.positionInitial;
      if (typeof initialHelper?.getLeft !== "function" || typeof initialHelper?.getTop !== "function") {
        throw new Error(
          `'options.initial' position helper does not contain 'getLeft' and / or 'getTop' functions.`
        );
      }
      this.#options.initialHelper = options.initial;
    }
    if (options?.validator) {
      if (isIterable(options?.validator)) {
        this.validators.add(...options.validator);
      } else {
        this.validators.add(options.validator);
      }
    }
  }
  get animate() {
    return this.#animate;
  }
  get dimension() {
    return this.#updateElementData.dimensionData;
  }
  get element() {
    return this.#styleCache.el;
  }
  get elementUpdated() {
    return this.#updateElementPromise;
  }
  get parent() {
    return this.#parent;
  }
  get state() {
    return this.#state;
  }
  get stores() {
    return this.#stores;
  }
  get transform() {
    return this.#updateElementData.transformData;
  }
  get validators() {
    return this.#validators;
  }
  set parent(parent) {
    if (parent !== void 0 && !(parent instanceof HTMLElement) && !isObject(parent)) {
      throw new TypeError(`'parent' is not an HTMLElement, object, or undefined.`);
    }
    this.#parent = parent;
    this.#state.remove({ name: "#defaultData" });
    this.#styleCache.reset();
    if (parent) {
      this.set(this.#data);
    }
  }
  get height() {
    return this.#data.height;
  }
  get left() {
    return this.#data.left;
  }
  get maxHeight() {
    return this.#data.maxHeight;
  }
  get maxWidth() {
    return this.#data.maxWidth;
  }
  get minHeight() {
    return this.#data.minHeight;
  }
  get minWidth() {
    return this.#data.minWidth;
  }
  get rotateX() {
    return this.#data.rotateX;
  }
  get rotateY() {
    return this.#data.rotateY;
  }
  get rotateZ() {
    return this.#data.rotateZ;
  }
  get rotation() {
    return this.#data.rotateZ;
  }
  get scale() {
    return this.#data.scale;
  }
  get top() {
    return this.#data.top;
  }
  get transformOrigin() {
    return this.#data.transformOrigin;
  }
  get translateX() {
    return this.#data.translateX;
  }
  get translateY() {
    return this.#data.translateY;
  }
  get translateZ() {
    return this.#data.translateZ;
  }
  get width() {
    return this.#data.width;
  }
  get zIndex() {
    return this.#data.zIndex;
  }
  set height(height) {
    this.#stores.height.set(height);
  }
  set left(left) {
    this.#stores.left.set(left);
  }
  set maxHeight(maxHeight) {
    this.#stores.maxHeight.set(maxHeight);
  }
  set maxWidth(maxWidth) {
    this.#stores.maxWidth.set(maxWidth);
  }
  set minHeight(minHeight) {
    this.#stores.minHeight.set(minHeight);
  }
  set minWidth(minWidth) {
    this.#stores.minWidth.set(minWidth);
  }
  set rotateX(rotateX) {
    this.#stores.rotateX.set(rotateX);
  }
  set rotateY(rotateY) {
    this.#stores.rotateY.set(rotateY);
  }
  set rotateZ(rotateZ) {
    this.#stores.rotateZ.set(rotateZ);
  }
  set rotation(rotateZ) {
    this.#stores.rotateZ.set(rotateZ);
  }
  set scale(scale) {
    this.#stores.scale.set(scale);
  }
  set top(top) {
    this.#stores.top.set(top);
  }
  set transformOrigin(transformOrigin) {
    if (transformOrigins.includes(transformOrigin)) {
      this.#stores.transformOrigin.set(transformOrigin);
    }
  }
  set translateX(translateX) {
    this.#stores.translateX.set(translateX);
  }
  set translateY(translateY) {
    this.#stores.translateY.set(translateY);
  }
  set translateZ(translateZ) {
    this.#stores.translateZ.set(translateZ);
  }
  set width(width) {
    this.#stores.width.set(width);
  }
  set zIndex(zIndex) {
    this.#stores.zIndex.set(zIndex);
  }
  get(position = {}, options) {
    const keys = options?.keys;
    const excludeKeys = options?.exclude;
    const numeric = options?.numeric ?? false;
    if (isIterable(keys)) {
      if (numeric) {
        for (const key of keys) {
          position[key] = this[key] ?? numericDefaults[key];
        }
      } else {
        for (const key of keys) {
          position[key] = this[key];
        }
      }
      if (isIterable(excludeKeys)) {
        for (const key of excludeKeys) {
          delete position[key];
        }
      }
      return position;
    } else {
      const data = Object.assign(position, this.#data);
      if (isIterable(excludeKeys)) {
        for (const key of excludeKeys) {
          delete data[key];
        }
      }
      if (numeric) {
        setNumericDefaults(data);
      }
      return data;
    }
  }
  toJSON() {
    return Object.assign({}, this.#data);
  }
  set(position = {}) {
    if (typeof position !== "object") {
      throw new TypeError(`Position - set error: 'position' is not an object.`);
    }
    const parent = this.#parent;
    if (parent !== void 0 && typeof parent?.options?.positionable === "boolean" && !parent?.options?.positionable) {
      return this;
    }
    const immediateElementUpdate = position.immediateElementUpdate === true;
    const data = this.#data;
    const transforms = this.#transforms;
    const targetEl = parent instanceof HTMLElement ? parent : parent?.elementTarget;
    const el = targetEl instanceof HTMLElement && targetEl.isConnected ? targetEl : void 0;
    const changeSet = this.#positionChangeSet;
    const styleCache = this.#styleCache;
    if (el) {
      if (!styleCache.hasData(el)) {
        styleCache.update(el);
        if (!styleCache.hasWillChange) {
          el.style.willChange = this.#options.ortho ? "transform" : "top, left, transform";
        }
        changeSet.set(true);
        this.#updateElementData.queued = false;
      }
      convertRelative(position, this);
      position = this.#updatePosition(position, parent, el, styleCache);
      if (position === null) {
        return this;
      }
    }
    if (Number.isFinite(position.left)) {
      position.left = Math.round(position.left);
      if (data.left !== position.left) {
        data.left = position.left;
        changeSet.left = true;
      }
    }
    if (Number.isFinite(position.top)) {
      position.top = Math.round(position.top);
      if (data.top !== position.top) {
        data.top = position.top;
        changeSet.top = true;
      }
    }
    if (Number.isFinite(position.maxHeight) || position.maxHeight === null) {
      position.maxHeight = typeof position.maxHeight === "number" ? Math.round(position.maxHeight) : null;
      if (data.maxHeight !== position.maxHeight) {
        data.maxHeight = position.maxHeight;
        changeSet.maxHeight = true;
      }
    }
    if (Number.isFinite(position.maxWidth) || position.maxWidth === null) {
      position.maxWidth = typeof position.maxWidth === "number" ? Math.round(position.maxWidth) : null;
      if (data.maxWidth !== position.maxWidth) {
        data.maxWidth = position.maxWidth;
        changeSet.maxWidth = true;
      }
    }
    if (Number.isFinite(position.minHeight) || position.minHeight === null) {
      position.minHeight = typeof position.minHeight === "number" ? Math.round(position.minHeight) : null;
      if (data.minHeight !== position.minHeight) {
        data.minHeight = position.minHeight;
        changeSet.minHeight = true;
      }
    }
    if (Number.isFinite(position.minWidth) || position.minWidth === null) {
      position.minWidth = typeof position.minWidth === "number" ? Math.round(position.minWidth) : null;
      if (data.minWidth !== position.minWidth) {
        data.minWidth = position.minWidth;
        changeSet.minWidth = true;
      }
    }
    if (Number.isFinite(position.rotateX) || position.rotateX === null) {
      if (data.rotateX !== position.rotateX) {
        data.rotateX = transforms.rotateX = position.rotateX;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.rotateY) || position.rotateY === null) {
      if (data.rotateY !== position.rotateY) {
        data.rotateY = transforms.rotateY = position.rotateY;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.rotateZ) || position.rotateZ === null) {
      if (data.rotateZ !== position.rotateZ) {
        data.rotateZ = transforms.rotateZ = position.rotateZ;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.scale) || position.scale === null) {
      position.scale = typeof position.scale === "number" ? Math.max(0, Math.min(position.scale, 1e3)) : null;
      if (data.scale !== position.scale) {
        data.scale = transforms.scale = position.scale;
        changeSet.transform = true;
      }
    }
    if (typeof position.transformOrigin === "string" && transformOrigins.includes(
      position.transformOrigin
    ) || position.transformOrigin === null) {
      if (data.transformOrigin !== position.transformOrigin) {
        data.transformOrigin = position.transformOrigin;
        changeSet.transformOrigin = true;
      }
    }
    if (Number.isFinite(position.translateX) || position.translateX === null) {
      if (data.translateX !== position.translateX) {
        data.translateX = transforms.translateX = position.translateX;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.translateY) || position.translateY === null) {
      if (data.translateY !== position.translateY) {
        data.translateY = transforms.translateY = position.translateY;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.translateZ) || position.translateZ === null) {
      if (data.translateZ !== position.translateZ) {
        data.translateZ = transforms.translateZ = position.translateZ;
        changeSet.transform = true;
      }
    }
    if (Number.isFinite(position.zIndex)) {
      position.zIndex = Math.round(position.zIndex);
      if (data.zIndex !== position.zIndex) {
        data.zIndex = position.zIndex;
        changeSet.zIndex = true;
      }
    }
    if (Number.isFinite(position.width) || position.width === "auto" || position.width === "inherit" || position.width === null) {
      position.width = typeof position.width === "number" ? Math.round(position.width) : position.width;
      if (data.width !== position.width) {
        data.width = position.width;
        changeSet.width = true;
      }
    }
    if (Number.isFinite(position.height) || position.height === "auto" || position.height === "inherit" || position.height === null) {
      position.height = typeof position.height === "number" ? Math.round(position.height) : position.height;
      if (data.height !== position.height) {
        data.height = position.height;
        changeSet.height = true;
      }
    }
    if (el) {
      const defaultData = this.#state.getDefault();
      if (typeof defaultData !== "object") {
        this.#state.save({ name: "#defaultData", ...Object.assign({}, data) });
      }
      if (immediateElementUpdate) {
        UpdateElementManager.immediate(el, this.#updateElementData);
        this.#updateElementPromise = Promise.resolve(performance.now());
      } else if (!this.#updateElementData.queued) {
        this.#updateElementPromise = UpdateElementManager.add(el, this.#updateElementData);
      }
    } else {
      UpdateElementManager.updateSubscribers(this.#updateElementData);
    }
    return this;
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(Object.assign({}, this.#data));
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  #updatePosition({
    left,
    top,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    width,
    height,
    rotateX,
    rotateY,
    rotateZ,
    scale,
    transformOrigin,
    translateX,
    translateY,
    translateZ,
    zIndex,
    rotation,
    ...rest
  } = {}, parent, el, styleCache) {
    let currentPosition = s_DATA_UPDATE.copy(this.#data);
    if (el.style.width === "" || width !== void 0) {
      if (width === "auto" || currentPosition.width === "auto" && width !== null) {
        currentPosition.width = "auto";
        width = styleCache.offsetWidth;
      } else if (width === "inherit" || currentPosition.width === "inherit" && width !== null) {
        currentPosition.width = "inherit";
        width = styleCache.offsetWidth;
      } else {
        const newWidth = Number.isFinite(width) ? width : currentPosition.width;
        currentPosition.width = width = Number.isFinite(newWidth) ? Math.round(newWidth) : styleCache.offsetWidth;
      }
    } else {
      width = Number.isFinite(currentPosition.width) ? currentPosition.width : styleCache.offsetWidth;
    }
    if (el.style.height === "" || height !== void 0) {
      if (height === "auto" || currentPosition.height === "auto" && height !== null) {
        currentPosition.height = "auto";
        height = styleCache.offsetHeight;
      } else if (height === "inherit" || currentPosition.height === "inherit" && height !== null) {
        currentPosition.height = "inherit";
        height = styleCache.offsetHeight;
      } else {
        const newHeight = Number.isFinite(height) ? height : currentPosition.height;
        currentPosition.height = height = Number.isFinite(newHeight) ? Math.round(newHeight) : styleCache.offsetHeight;
      }
    } else {
      height = Number.isFinite(currentPosition.height) ? currentPosition.height : styleCache.offsetHeight;
    }
    if (Number.isFinite(left)) {
      currentPosition.left = left;
    } else if (!Number.isFinite(currentPosition.left)) {
      currentPosition.left = typeof this.#options.initialHelper?.getLeft === "function" ? this.#options.initialHelper.getLeft(width) : 0;
    }
    if (Number.isFinite(top)) {
      currentPosition.top = top;
    } else if (!Number.isFinite(currentPosition.top)) {
      currentPosition.top = typeof this.#options.initialHelper?.getTop === "function" ? this.#options.initialHelper.getTop(height) : 0;
    }
    if (Number.isFinite(maxHeight) || maxHeight === null) {
      currentPosition.maxHeight = Number.isFinite(maxHeight) ? Math.round(maxHeight) : null;
    }
    if (Number.isFinite(maxWidth) || maxWidth === null) {
      currentPosition.maxWidth = Number.isFinite(maxWidth) ? Math.round(maxWidth) : null;
    }
    if (Number.isFinite(minHeight) || minHeight === null) {
      currentPosition.minHeight = Number.isFinite(minHeight) ? Math.round(minHeight) : null;
    }
    if (Number.isFinite(minWidth) || minWidth === null) {
      currentPosition.minWidth = Number.isFinite(minWidth) ? Math.round(minWidth) : null;
    }
    if (Number.isFinite(rotateX) || rotateX === null) {
      currentPosition.rotateX = rotateX;
    }
    if (Number.isFinite(rotateY) || rotateY === null) {
      currentPosition.rotateY = rotateY;
    }
    if (rotateZ !== currentPosition.rotateZ && (Number.isFinite(rotateZ) || rotateZ === null)) {
      currentPosition.rotateZ = rotateZ;
    } else if (rotation !== currentPosition.rotateZ && (Number.isFinite(rotation) || rotation === null)) {
      currentPosition.rotateZ = rotation;
    }
    if (Number.isFinite(translateX) || translateX === null) {
      currentPosition.translateX = translateX;
    }
    if (Number.isFinite(translateY) || translateY === null) {
      currentPosition.translateY = translateY;
    }
    if (Number.isFinite(translateZ) || translateZ === null) {
      currentPosition.translateZ = translateZ;
    }
    if (Number.isFinite(scale) || scale === null) {
      currentPosition.scale = typeof scale === "number" ? Math.max(0, Math.min(scale, 1e3)) : null;
    }
    if (typeof transformOrigin === "string" || transformOrigin === null) {
      currentPosition.transformOrigin = transformOrigins.includes(transformOrigin) ? transformOrigin : null;
    }
    if (Number.isFinite(zIndex) || zIndex === null) {
      currentPosition.zIndex = typeof zIndex === "number" ? Math.round(zIndex) : zIndex;
    }
    const validatorData = this.#validatorData;
    if (validatorData.length) {
      s_VALIDATION_DATA.parent = parent;
      s_VALIDATION_DATA.el = el;
      s_VALIDATION_DATA.computed = styleCache.computed;
      s_VALIDATION_DATA.transforms = this.#transforms;
      s_VALIDATION_DATA.height = height;
      s_VALIDATION_DATA.width = width;
      s_VALIDATION_DATA.marginLeft = styleCache.marginLeft;
      s_VALIDATION_DATA.marginTop = styleCache.marginTop;
      s_VALIDATION_DATA.maxHeight = styleCache.maxHeight ?? currentPosition.maxHeight;
      s_VALIDATION_DATA.maxWidth = styleCache.maxWidth ?? currentPosition.maxWidth;
      const isMinimized = parent?.reactive?.minimized ?? false;
      s_VALIDATION_DATA.minHeight = isMinimized ? currentPosition.minHeight ?? 0 : styleCache.minHeight || (currentPosition.minHeight ?? 0);
      s_VALIDATION_DATA.minWidth = isMinimized ? currentPosition.minWidth ?? 0 : styleCache.minWidth || (currentPosition.minWidth ?? 0);
      for (let cntr = 0; cntr < validatorData.length; cntr++) {
        s_VALIDATION_DATA.position = currentPosition;
        s_VALIDATION_DATA.rest = rest;
        currentPosition = validatorData[cntr].validator(s_VALIDATION_DATA);
        if (currentPosition === null) {
          return null;
        }
      }
    }
    return currentPosition;
  }
}
__name(Position, "Position");
const s_DATA_UPDATE = new PositionData();
const s_VALIDATION_DATA = {
  position: void 0,
  parent: void 0,
  el: void 0,
  computed: void 0,
  transforms: void 0,
  height: void 0,
  width: void 0,
  marginLeft: void 0,
  marginTop: void 0,
  maxHeight: void 0,
  maxWidth: void 0,
  minHeight: void 0,
  minWidth: void 0,
  rest: void 0
};
Object.seal(s_VALIDATION_DATA);
class ApplicationState {
  #application;
  #dataSaved = /* @__PURE__ */ new Map();
  constructor(application) {
    this.#application = application;
  }
  get(extra = {}) {
    return Object.assign(extra, {
      position: this.#application?.position?.get(),
      beforeMinimized: this.#application?.position?.state.get({ name: "#beforeMinimized" }),
      options: Object.assign({}, this.#application?.options),
      ui: { minimized: this.#application?.reactive?.minimized }
    });
  }
  getSave({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - getSave error: 'name' is not a string.`);
    }
    return this.#dataSaved.get(name);
  }
  remove({ name }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - remove: 'name' is not a string.`);
    }
    const data = this.#dataSaved.get(name);
    this.#dataSaved.delete(name);
    return data;
  }
  restore({
    name,
    remove = false,
    async = false,
    animateTo = false,
    duration = 0.1,
    ease = identity,
    interpolate = lerp$5
  }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - restore error: 'name' is not a string.`);
    }
    const dataSaved = this.#dataSaved.get(name);
    if (dataSaved) {
      if (remove) {
        this.#dataSaved.delete(name);
      }
      if (async) {
        return this.set(dataSaved, { async, animateTo, duration, ease, interpolate }).then(() => dataSaved);
      } else {
        this.set(dataSaved, { async, animateTo, duration, ease, interpolate });
      }
    }
    return dataSaved;
  }
  save({ name, ...extra }) {
    if (typeof name !== "string") {
      throw new TypeError(`ApplicationState - save error: 'name' is not a string.`);
    }
    const data = this.get(extra);
    this.#dataSaved.set(name, data);
    return data;
  }
  set(data, { async = false, animateTo = false, duration = 0.1, ease = identity, interpolate = lerp$5 } = {}) {
    if (!isObject(data)) {
      throw new TypeError(`ApplicationState - restore error: 'data' is not an object.`);
    }
    const application = this.#application;
    if (!isObject(data?.position)) {
      console.warn(`ApplicationState.set warning: 'data.position' is not an object.`);
      return application;
    }
    const rendered = application.rendered;
    if (animateTo && !rendered) {
      console.warn(`ApplicationState.set warning: Application is not rendered and 'animateTo' is true.`);
      return application;
    }
    if (animateTo) {
      if (data.position.transformOrigin !== application.position.transformOrigin) {
        application.position.transformOrigin = data.position.transformOrigin;
      }
      if (isObject(data?.ui)) {
        const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
        if (application?.reactive?.minimized && !minimized) {
          application.maximize({ animate: false, duration: 0 });
        }
      }
      const promise2 = application.position.animate.to(
        data.position,
        { duration, ease, interpolate }
      ).finished.then((cancelled) => {
        if (cancelled) {
          return application;
        }
        if (isObject(data?.options)) {
          application?.reactive.mergeOptions(data.options);
        }
        if (isObject(data?.ui)) {
          const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
          if (!application?.reactive?.minimized && minimized) {
            application.minimize({ animate: false, duration: 0 });
          }
        }
        if (isObject(data?.beforeMinimized)) {
          application.position.state.set({ name: "#beforeMinimized", ...data.beforeMinimized });
        }
        return application;
      });
      if (async) {
        return promise2;
      }
    } else {
      if (rendered) {
        if (isObject(data?.options)) {
          application?.reactive.mergeOptions(data.options);
        }
        if (isObject(data?.ui)) {
          const minimized = typeof data.ui?.minimized === "boolean" ? data.ui.minimized : false;
          if (application?.reactive?.minimized && !minimized) {
            application.maximize({ animate: false, duration: 0 });
          } else if (!application?.reactive?.minimized && minimized) {
            application.minimize({ animate: false, duration });
          }
        }
        if (isObject(data?.beforeMinimized)) {
          application.position.state.set({ name: "#beforeMinimized", ...data.beforeMinimized });
        }
        application.position.set(data.position);
      } else {
        let positionData = data.position;
        if (isObject(data.beforeMinimized)) {
          positionData = data.beforeMinimized;
          positionData.left = data.position.left;
          positionData.top = data.position.top;
        }
        application.position.set(positionData);
      }
    }
    return application;
  }
}
__name(ApplicationState, "ApplicationState");
class GetSvelteData {
  #applicationShellHolder;
  #svelteData;
  constructor(applicationShellHolder, svelteData) {
    this.#applicationShellHolder = applicationShellHolder;
    this.#svelteData = svelteData;
  }
  get applicationShell() {
    return this.#applicationShellHolder[0];
  }
  component(index) {
    const data = this.#svelteData[index];
    return typeof data === "object" ? data?.component : void 0;
  }
  *componentEntries() {
    for (let cntr = 0; cntr < this.#svelteData.length; cntr++) {
      yield [cntr, this.#svelteData[cntr].component];
    }
  }
  *componentValues() {
    for (let cntr = 0; cntr < this.#svelteData.length; cntr++) {
      yield this.#svelteData[cntr].component;
    }
  }
  data(index) {
    return this.#svelteData[index];
  }
  dataByComponent(component) {
    for (const data of this.#svelteData) {
      if (data.component === component) {
        return data;
      }
    }
    return void 0;
  }
  dataEntries() {
    return this.#svelteData.entries();
  }
  dataValues() {
    return this.#svelteData.values();
  }
  get length() {
    return this.#svelteData.length;
  }
}
__name(GetSvelteData, "GetSvelteData");
function loadSvelteConfig({ app, template, config, elementRootUpdate } = {}) {
  const svelteOptions = typeof config.options === "object" ? config.options : {};
  let target;
  if (config.target instanceof HTMLElement) {
    target = config.target;
  } else if (template instanceof HTMLElement && typeof config.target === "string") {
    target = template.querySelector(config.target);
  } else {
    target = document.createDocumentFragment();
  }
  if (target === void 0) {
    console.log(
      `%c[TRL] loadSvelteConfig error - could not find target selector, '${config.target}', for config:
`,
      "background: rgb(57,34,34)",
      config
    );
    throw new Error();
  }
  const NewSvelteComponent = config.class;
  const svelteConfig = parseSvelteConfig({ ...config, target }, app);
  const externalContext = svelteConfig.context.get("external");
  externalContext.application = app;
  externalContext.elementRootUpdate = elementRootUpdate;
  let eventbus;
  if (typeof app._eventbus === "object" && typeof app._eventbus.createProxy === "function") {
    eventbus = app._eventbus.createProxy();
    externalContext.eventbus = eventbus;
  }
  const component = new NewSvelteComponent(svelteConfig);
  svelteConfig.eventbus = eventbus;
  let element2;
  if (isApplicationShell(component)) {
    element2 = component.elementRoot;
  }
  if (target instanceof DocumentFragment && target.firstElementChild) {
    if (element2 === void 0) {
      element2 = target.firstElementChild;
    }
    template.append(target);
  } else if (config.target instanceof HTMLElement && element2 === void 0) {
    if (config.target instanceof HTMLElement && typeof svelteOptions.selectorElement !== "string") {
      console.log(
        `%c[TRL] loadSvelteConfig error - HTMLElement target with no 'selectorElement' defined.

Note: If configuring an application shell and directly targeting a HTMLElement did you bind an'elementRoot' and include '<svelte:options accessors={true}/>'?

Offending config:
`,
        "background: rgb(57,34,34)",
        config
      );
      throw new Error();
    }
    element2 = target.querySelector(svelteOptions.selectorElement);
    if (element2 === null || element2 === void 0) {
      console.log(
        `%c[TRL] loadSvelteConfig error - HTMLElement target with 'selectorElement', '${svelteOptions.selectorElement}', not found for config:
`,
        "background: rgb(57,34,34)",
        config
      );
      throw new Error();
    }
  }
  const injectHTML = !(config.target instanceof HTMLElement);
  return { config: svelteConfig, component, element: element2, injectHTML };
}
__name(loadSvelteConfig, "loadSvelteConfig");
class SvelteReactive {
  #application;
  #initialized = false;
  #storeAppOptions;
  #storeAppOptionsUpdate;
  #dataUIState;
  #storeUIState;
  #storeUIStateUpdate;
  #storeUnsubscribe = [];
  constructor(application) {
    this.#application = application;
  }
  initialize() {
    if (this.#initialized) {
      return;
    }
    this.#initialized = true;
    this.#storesInitialize();
    return {
      appOptionsUpdate: this.#storeAppOptionsUpdate,
      uiOptionsUpdate: this.#storeUIStateUpdate,
      subscribe: this.#storesSubscribe.bind(this),
      unsubscribe: this.#storesUnsubscribe.bind(this)
    };
  }
  get dragging() {
    return this.#dataUIState.dragging;
  }
  get minimized() {
    return this.#dataUIState.minimized;
  }
  get resizing() {
    return this.#dataUIState.resizing;
  }
  get draggable() {
    return this.#application?.options?.draggable;
  }
  get headerButtonNoClose() {
    return this.#application?.options?.headerButtonNoClose;
  }
  get headerButtonNoLabel() {
    return this.#application?.options?.headerButtonNoLabel;
  }
  get headerNoTitleMinimized() {
    return this.#application?.options?.headerNoTitleMinimized;
  }
  get minimizable() {
    return this.#application?.options?.minimizable;
  }
  get popOut() {
    return this.#application.popOut;
  }
  get resizable() {
    return this.#application?.options?.resizable;
  }
  get storeAppOptions() {
    return this.#storeAppOptions;
  }
  get storeUIState() {
    return this.#storeUIState;
  }
  get title() {
    return this.#application.title;
  }
  set draggable(draggable2) {
    if (typeof draggable2 === "boolean") {
      this.setOptions("draggable", draggable2);
    }
  }
  set headerButtonNoClose(headerButtonNoClose) {
    if (typeof headerButtonNoClose === "boolean") {
      this.setOptions("headerButtonNoClose", headerButtonNoClose);
    }
  }
  set headerButtonNoLabel(headerButtonNoLabel) {
    if (typeof headerButtonNoLabel === "boolean") {
      this.setOptions("headerButtonNoLabel", headerButtonNoLabel);
    }
  }
  set headerNoTitleMinimized(headerNoTitleMinimized) {
    if (typeof headerNoTitleMinimized === "boolean") {
      this.setOptions("headerNoTitleMinimized", headerNoTitleMinimized);
    }
  }
  set minimizable(minimizable) {
    if (typeof minimizable === "boolean") {
      this.setOptions("minimizable", minimizable);
    }
  }
  set popOut(popOut) {
    if (typeof popOut === "boolean") {
      this.setOptions("popOut", popOut);
    }
  }
  set resizable(resizable) {
    if (typeof resizable === "boolean") {
      this.setOptions("resizable", resizable);
    }
  }
  set title(title) {
    if (typeof title === "string") {
      this.setOptions("title", title);
    } else if (title === void 0 || title === null) {
      this.setOptions("title", "");
    }
  }
  getOptions(accessor, defaultValue) {
    return safeAccess(this.#application.options, accessor, defaultValue);
  }
  mergeOptions(options) {
    this.#storeAppOptionsUpdate((instanceOptions) => deepMerge(instanceOptions, options));
  }
  setOptions(accessor, value) {
    const success = safeSet(this.#application.options, accessor, value);
    if (success) {
      this.#storeAppOptionsUpdate(() => this.#application.options);
    }
  }
  #storesInitialize() {
    const writableAppOptions = writable(this.#application.options);
    this.#storeAppOptionsUpdate = writableAppOptions.update;
    const storeAppOptions = {
      subscribe: writableAppOptions.subscribe,
      draggable: propertyStore(writableAppOptions, "draggable"),
      headerButtonNoClose: propertyStore(writableAppOptions, "headerButtonNoClose"),
      headerButtonNoLabel: propertyStore(writableAppOptions, "headerButtonNoLabel"),
      headerNoTitleMinimized: propertyStore(writableAppOptions, "headerNoTitleMinimized"),
      minimizable: propertyStore(writableAppOptions, "minimizable"),
      popOut: propertyStore(writableAppOptions, "popOut"),
      resizable: propertyStore(writableAppOptions, "resizable"),
      title: propertyStore(writableAppOptions, "title")
    };
    Object.freeze(storeAppOptions);
    this.#storeAppOptions = storeAppOptions;
    this.#dataUIState = {
      dragging: false,
      headerButtons: [],
      minimized: this.#application._minimized,
      resizing: false
    };
    const writableUIOptions = writable(this.#dataUIState);
    this.#storeUIStateUpdate = writableUIOptions.update;
    const storeUIState = {
      subscribe: writableUIOptions.subscribe,
      dragging: propertyStore(writableUIOptions, "dragging"),
      headerButtons: derived(writableUIOptions, ($options, set2) => set2($options.headerButtons)),
      minimized: derived(writableUIOptions, ($options, set2) => set2($options.minimized)),
      resizing: propertyStore(writableUIOptions, "resizing")
    };
    Object.freeze(storeUIState);
    this.#storeUIState = storeUIState;
  }
  #storesSubscribe() {
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoClose, (value) => {
      this.updateHeaderButtons({ headerButtonNoClose: value });
    }));
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.headerButtonNoLabel, (value) => {
      this.updateHeaderButtons({ headerButtonNoLabel: value });
    }));
    this.#storeUnsubscribe.push(subscribeIgnoreFirst(this.#storeAppOptions.popOut, (value) => {
      if (value && this.#application.rendered) {
        ui.windows[this.#application.appId] = this.#application;
      } else {
        delete ui.windows[this.#application.appId];
      }
    }));
  }
  #storesUnsubscribe() {
    this.#storeUnsubscribe.forEach((unsubscribe) => unsubscribe());
    this.#storeUnsubscribe = [];
  }
  updateHeaderButtons({
    headerButtonNoClose = this.#application.options.headerButtonNoClose,
    headerButtonNoLabel = this.#application.options.headerButtonNoLabel
  } = {}) {
    let buttons = this.#application._getHeaderButtons();
    if (typeof headerButtonNoClose === "boolean" && headerButtonNoClose) {
      buttons = buttons.filter((button) => button.class !== "close");
    }
    if (typeof headerButtonNoLabel === "boolean" && headerButtonNoLabel) {
      for (const button of buttons) {
        button.label = void 0;
      }
    }
    this.#storeUIStateUpdate((options) => {
      options.headerButtons = buttons;
      return options;
    });
  }
}
__name(SvelteReactive, "SvelteReactive");
class SvelteApplication extends Application {
  #applicationShellHolder = [null];
  #applicationState;
  #elementTarget = null;
  #elementContent = null;
  #initialZIndex = 95;
  #onMount = false;
  #position;
  #reactive;
  #svelteData = [];
  #getSvelteData = new GetSvelteData(this.#applicationShellHolder, this.#svelteData);
  #stores;
  constructor(options = {}) {
    super(options);
    this.#applicationState = new ApplicationState(this);
    this.#position = new Position(this, {
      ...this.position,
      ...this.options,
      initial: this.options.positionInitial,
      ortho: this.options.positionOrtho,
      validator: this.options.positionValidator
    });
    delete this.position;
    Object.defineProperty(this, "position", {
      get: () => this.#position,
      set: (position) => {
        if (typeof position === "object") {
          this.#position.set(position);
        }
      }
    });
    this.#reactive = new SvelteReactive(this);
    this.#stores = this.#reactive.initialize();
  }
  static get defaultOptions() {
    return deepMerge(super.defaultOptions, {
      defaultCloseAnimation: true,
      draggable: true,
      headerButtonNoClose: false,
      headerButtonNoLabel: false,
      headerNoTitleMinimized: false,
      minHeight: MIN_WINDOW_HEIGHT,
      minWidth: MIN_WINDOW_WIDTH,
      positionable: true,
      positionInitial: Position.Initial.browserCentered,
      positionOrtho: true,
      positionValidator: Position.Validators.transformWindow,
      transformOrigin: "top left"
    });
  }
  get elementContent() {
    return this.#elementContent;
  }
  get elementTarget() {
    return this.#elementTarget;
  }
  get reactive() {
    return this.#reactive;
  }
  get state() {
    return this.#applicationState;
  }
  get svelte() {
    return this.#getSvelteData;
  }
  _activateCoreListeners(html) {
    super._activateCoreListeners(typeof this.options.template === "string" ? html : [this.#elementTarget]);
  }
  bringToTop({ force = false } = {}) {
    if (force || this.popOut) {
      super.bringToTop();
    }
    if (document.activeElement !== document.body && !this.elementTarget.contains(document.activeElement)) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      document.body.focus();
    }
    ui.activeWindow = this;
  }
  async close(options = {}) {
    const states = Application.RENDER_STATES;
    if (!options.force && ![states.RENDERED, states.ERROR].includes(this._state)) {
      return;
    }
    this.#stores.unsubscribe();
    this._state = states.CLOSING;
    const el = this.#elementTarget;
    if (!el) {
      return this._state = states.CLOSED;
    }
    const content = el.querySelector(".window-content");
    if (content) {
      content.style.overflow = "hidden";
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = "hidden";
      }
    }
    for (const cls of this.constructor._getInheritanceChain()) {
      Hooks.call(`close${cls.name}`, this, el);
    }
    const animate = typeof this.options.defaultCloseAnimation === "boolean" ? this.options.defaultCloseAnimation : true;
    if (animate) {
      el.style.minHeight = "0";
      const { paddingBottom, paddingTop } = globalThis.getComputedStyle(el);
      await el.animate([
        { maxHeight: `${el.clientHeight}px`, paddingTop, paddingBottom },
        { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
      ], { duration: 250, easing: "ease-in", fill: "forwards" }).finished;
    }
    const svelteDestroyPromises = [];
    for (const entry of this.#svelteData) {
      svelteDestroyPromises.push(outroAndDestroy(entry.component));
      const eventbus = entry.config.eventbus;
      if (typeof eventbus === "object" && typeof eventbus.off === "function") {
        eventbus.off();
        entry.config.eventbus = void 0;
      }
    }
    await Promise.all(svelteDestroyPromises);
    this.#svelteData.length = 0;
    el.remove();
    this.position.state.restore({
      name: "#beforeMinimized",
      properties: ["width", "height"],
      silent: true,
      remove: true
    });
    this.#applicationShellHolder[0] = null;
    this._element = null;
    this.#elementContent = null;
    this.#elementTarget = null;
    delete ui.windows[this.appId];
    this._minimized = false;
    this._scrollPositions = null;
    this._state = states.CLOSED;
    this.#onMount = false;
    this.#stores.uiOptionsUpdate((storeOptions) => deepMerge(storeOptions, { minimized: this._minimized }));
  }
  _injectHTML(html) {
    if (this.popOut && html.length === 0 && Array.isArray(this.options.svelte)) {
      throw new Error(
        "SvelteApplication - _injectHTML - A popout app with no template can only support one Svelte component."
      );
    }
    this.reactive.updateHeaderButtons();
    const elementRootUpdate = /* @__PURE__ */ __name(() => {
      let cntr = 0;
      return (elementRoot) => {
        if (elementRoot !== null && elementRoot !== void 0 && cntr++ > 0) {
          this.#updateApplicationShell();
          return true;
        }
        return false;
      };
    }, "elementRootUpdate");
    if (Array.isArray(this.options.svelte)) {
      for (const svelteConfig of this.options.svelte) {
        const svelteData = loadSvelteConfig({
          app: this,
          template: html[0],
          config: svelteConfig,
          elementRootUpdate
        });
        if (isApplicationShell(svelteData.component)) {
          if (this.svelte.applicationShell !== null) {
            throw new Error(
              `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                    ${JSON.stringify(svelteConfig)}`
            );
          }
          this.#applicationShellHolder[0] = svelteData.component;
          if (isHMRProxy(svelteData.component) && Array.isArray(svelteData.component?.$$?.on_hmr)) {
            svelteData.component.$$.on_hmr.push(() => () => this.#updateApplicationShell());
          }
        }
        this.#svelteData.push(svelteData);
      }
    } else if (typeof this.options.svelte === "object") {
      const svelteData = loadSvelteConfig({
        app: this,
        template: html[0],
        config: this.options.svelte,
        elementRootUpdate
      });
      if (isApplicationShell(svelteData.component)) {
        if (this.svelte.applicationShell !== null) {
          throw new Error(
            `SvelteApplication - _injectHTML - An application shell is already mounted; offending config:
                 ${JSON.stringify(this.options.svelte)}`
          );
        }
        this.#applicationShellHolder[0] = svelteData.component;
        if (isHMRProxy(svelteData.component) && Array.isArray(svelteData.component?.$$?.on_hmr)) {
          svelteData.component.$$.on_hmr.push(() => () => this.#updateApplicationShell());
        }
      }
      this.#svelteData.push(svelteData);
    }
    const isDocumentFragment = html.length && html[0] instanceof DocumentFragment;
    let injectHTML = true;
    for (const svelteData of this.#svelteData) {
      if (!svelteData.injectHTML) {
        injectHTML = false;
        break;
      }
    }
    if (injectHTML) {
      super._injectHTML(html);
    }
    if (this.svelte.applicationShell !== null) {
      this._element = $(this.svelte.applicationShell.elementRoot);
      this.#elementContent = hasGetter(this.svelte.applicationShell, "elementContent") ? this.svelte.applicationShell.elementContent : null;
      this.#elementTarget = hasGetter(this.svelte.applicationShell, "elementTarget") ? this.svelte.applicationShell.elementTarget : null;
    } else if (isDocumentFragment) {
      for (const svelteData of this.#svelteData) {
        if (svelteData.element instanceof HTMLElement) {
          this._element = $(svelteData.element);
          break;
        }
      }
    }
    if (this.#elementTarget === null) {
      const element2 = typeof this.options.selectorTarget === "string" ? this._element.find(this.options.selectorTarget) : this._element;
      this.#elementTarget = element2[0];
    }
    if (this.#elementTarget === null || this.#elementTarget === void 0 || this.#elementTarget.length === 0) {
      throw new Error(`SvelteApplication - _injectHTML: Target element '${this.options.selectorTarget}' not found.`);
    }
    if (typeof this.options.positionable === "boolean" && this.options.positionable) {
      this.#elementTarget.style.zIndex = typeof this.options.zIndex === "number" ? this.options.zIndex : this.#initialZIndex ?? 95;
    }
    this.#stores.subscribe();
  }
  async maximize({ animate = true, duration = 0.1 } = {}) {
    if (!this.popOut || [false, null].includes(this._minimized)) {
      return;
    }
    this._minimized = null;
    const durationMS = duration * 1e3;
    const element2 = this.elementTarget;
    const header = element2.querySelector(".window-header");
    const content = element2.querySelector(".window-content");
    const positionBefore = this.position.state.get({ name: "#beforeMinimized" });
    if (animate) {
      await this.position.state.restore({
        name: "#beforeMinimized",
        async: true,
        animateTo: true,
        properties: ["width"],
        duration: 0.1
      });
    }
    for (let cntr = header.children.length; --cntr >= 0; ) {
      header.children[cntr].style.display = null;
    }
    content.style.display = null;
    let constraints;
    if (animate) {
      ({ constraints } = this.position.state.restore({
        name: "#beforeMinimized",
        animateTo: true,
        properties: ["height"],
        remove: true,
        duration
      }));
    } else {
      ({ constraints } = this.position.state.remove({ name: "#beforeMinimized" }));
    }
    await content.animate([
      { maxHeight: 0, paddingTop: 0, paddingBottom: 0, offset: 0 },
      { ...constraints, offset: 1 },
      { maxHeight: "100%", offset: 1 }
    ], { duration: durationMS, fill: "forwards" }).finished;
    this.position.set({
      minHeight: positionBefore.minHeight ?? this.options?.minHeight ?? MIN_WINDOW_HEIGHT,
      minWidth: positionBefore.minWidth ?? this.options?.minWidth ?? MIN_WINDOW_WIDTH
    });
    element2.style.minWidth = null;
    element2.style.minHeight = null;
    element2.classList.remove("minimized");
    this._minimized = false;
    setTimeout(() => {
      content.style.overflow = null;
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = null;
      }
    }, 50);
    this.#stores.uiOptionsUpdate((options) => deepMerge(options, { minimized: false }));
  }
  async minimize({ animate = true, duration = 0.1 } = {}) {
    if (!this.rendered || !this.popOut || [true, null].includes(this._minimized)) {
      return;
    }
    this.#stores.uiOptionsUpdate((options) => deepMerge(options, { minimized: true }));
    this._minimized = null;
    const durationMS = duration * 1e3;
    const element2 = this.elementTarget;
    const header = element2.querySelector(".window-header");
    const content = element2.querySelector(".window-content");
    const beforeMinWidth = this.position.minWidth;
    const beforeMinHeight = this.position.minHeight;
    this.position.set({ minWidth: 100, minHeight: 30 });
    element2.style.minWidth = "100px";
    element2.style.minHeight = "30px";
    if (content) {
      content.style.overflow = "hidden";
      for (let cntr = content.children.length; --cntr >= 0; ) {
        content.children[cntr].style.overflow = "hidden";
      }
    }
    const { paddingBottom, paddingTop } = globalThis.getComputedStyle(content);
    const constraints = {
      maxHeight: `${content.clientHeight}px`,
      paddingTop,
      paddingBottom
    };
    if (animate) {
      const animation = content.animate([
        constraints,
        { maxHeight: 0, paddingTop: 0, paddingBottom: 0 }
      ], { duration: durationMS, fill: "forwards" });
      animation.finished.then(() => content.style.display = "none");
    } else {
      setTimeout(() => content.style.display = "none", durationMS);
    }
    const saved = this.position.state.save({ name: "#beforeMinimized", constraints });
    saved.minWidth = beforeMinWidth;
    saved.minHeight = beforeMinHeight;
    const headerOffsetHeight = header.offsetHeight;
    this.position.minHeight = headerOffsetHeight;
    if (animate) {
      await this.position.animate.to({ height: headerOffsetHeight }, { duration }).finished;
    }
    for (let cntr = header.children.length; --cntr >= 0; ) {
      const className = header.children[cntr].className;
      if (className.includes("window-title") || className.includes("close")) {
        continue;
      }
      if (className.includes("keep-minimized")) {
        header.children[cntr].style.display = "block";
        continue;
      }
      header.children[cntr].style.display = "none";
    }
    if (animate) {
      await this.position.animate.to({ width: MIN_WINDOW_WIDTH }, { duration: 0.1 }).finished;
    }
    element2.classList.add("minimized");
    this._minimized = true;
  }
  onSvelteMount({ element: element2, elementContent, elementTarget } = {}) {
  }
  onSvelteRemount({ element: element2, elementContent, elementTarget } = {}) {
  }
  _replaceHTML(element2, html) {
    if (!element2.length) {
      return;
    }
    this.reactive.updateHeaderButtons();
  }
  async _render(force = false, options = {}) {
    if (this._state === Application.RENDER_STATES.NONE && document.querySelector(`#${this.id}`) instanceof HTMLElement) {
      console.warn(`SvelteApplication - _render: A DOM element already exists for CSS ID '${this.id}'. Cancelling initial render for new application with appId '${this.appId}'.`);
      return;
    }
    await super._render(force, options);
    if (!this.#onMount) {
      this.onSvelteMount({ element: this._element[0], elementContent: this.#elementContent, elementTarget: this.#elementTarget });
      this.#onMount = true;
    }
  }
  async _renderInner(data) {
    const html = typeof this.template === "string" ? await renderTemplate(this.template, data) : document.createDocumentFragment();
    return $(html);
  }
  async _renderOuter() {
    const html = await super._renderOuter();
    this.#initialZIndex = html[0].style.zIndex;
    return html;
  }
  setPosition(position) {
    return this.position.set(position);
  }
  #updateApplicationShell() {
    const applicationShell = this.svelte.applicationShell;
    if (applicationShell !== null) {
      this._element = $(applicationShell.elementRoot);
      this.#elementContent = hasGetter(applicationShell, "elementContent") ? applicationShell.elementContent : null;
      this.#elementTarget = hasGetter(applicationShell, "elementTarget") ? applicationShell.elementTarget : null;
      if (this.#elementTarget === null) {
        const element2 = typeof this.options.selectorTarget === "string" ? this._element.find(this.options.selectorTarget) : this._element;
        this.#elementTarget = element2[0];
      }
      if (typeof this.options.positionable === "boolean" && this.options.positionable) {
        this.#elementTarget.style.zIndex = typeof this.options.zIndex === "number" ? this.options.zIndex : this.#initialZIndex ?? 95;
        super.bringToTop();
        this.position.set(this.position.get());
      }
      super._activateCoreListeners([this.#elementTarget]);
      this.onSvelteRemount({ element: this._element[0], elementContent: this.#elementContent, elementTarget: this.#elementTarget });
    }
  }
}
__name(SvelteApplication, "SvelteApplication");
const TJSContainer_svelte_svelte_type_style_lang = "";
function get_each_context$a(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[2] = list[i];
  return child_ctx;
}
__name(get_each_context$a, "get_each_context$a");
function create_if_block_1$4(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "Container warning: No children.";
      attr(p, "class", "svelte-1s361pr");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
__name(create_if_block_1$4, "create_if_block_1$4");
function create_if_block$5(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
  }
  const out = /* @__PURE__ */ __name((i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  }), "out");
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & 2) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$a(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$a(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
__name(create_if_block$5, "create_if_block$5");
function create_each_block$a(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  const switch_instance_spread_levels = [ctx[2].props];
  var switch_value = ctx[2].class;
  function switch_props(ctx2) {
    let switch_instance_props = {};
    for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    }
    return { props: switch_instance_props };
  }
  __name(switch_props, "switch_props");
  if (switch_value) {
    switch_instance = new switch_value(switch_props());
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = dirty & 2 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(ctx2[2].props)]) : {};
      if (switch_value !== (switch_value = ctx2[2].class)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props());
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
__name(create_each_block$a, "create_each_block$a");
function create_fragment$f(ctx) {
  let show_if;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$5, create_if_block_1$4];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (dirty & 2)
      show_if = null;
    if (show_if == null)
      show_if = !!Array.isArray(ctx2[1]);
    if (show_if)
      return 0;
    if (ctx2[0])
      return 1;
    return -1;
  }
  __name(select_block_type, "select_block_type");
  if (~(current_block_type_index = select_block_type(ctx, -1))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(target, anchor);
      }
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2, dirty);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        } else {
          if_block = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d(detaching);
      }
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
__name(create_fragment$f, "create_fragment$f");
function instance$f($$self, $$props, $$invalidate) {
  let { warn = false } = $$props;
  let { children: children2 = void 0 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("warn" in $$props2)
      $$invalidate(0, warn = $$props2.warn);
    if ("children" in $$props2)
      $$invalidate(1, children2 = $$props2.children);
  };
  return [warn, children2];
}
__name(instance$f, "instance$f");
class TJSContainer extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, { warn: 0, children: 1 });
  }
  get warn() {
    return this.$$.ctx[0];
  }
  set warn(warn) {
    this.$$set({ warn });
    flush();
  }
  get children() {
    return this.$$.ctx[1];
  }
  set children(children2) {
    this.$$set({ children: children2 });
    flush();
  }
}
__name(TJSContainer, "TJSContainer");
const s_DEFAULT_TRANSITION = /* @__PURE__ */ __name(() => void 0, "s_DEFAULT_TRANSITION");
const s_DEFAULT_TRANSITION_OPTIONS = {};
const TJSGlassPane_svelte_svelte_type_style_lang = "";
function resizeObserver(node, target) {
  ResizeObserverManager.add(node, target);
  return {
    update: (newTarget) => {
      ResizeObserverManager.remove(node, target);
      target = newTarget;
      ResizeObserverManager.add(node, target);
    },
    destroy: () => {
      ResizeObserverManager.remove(node, target);
    }
  };
}
__name(resizeObserver, "resizeObserver");
resizeObserver.updateCache = function(el) {
  if (!(el instanceof HTMLElement)) {
    throw new TypeError(`resizeObserverUpdate error: 'el' is not an HTMLElement.`);
  }
  const subscribers = s_MAP.get(el);
  if (Array.isArray(subscribers)) {
    const computed = globalThis.getComputedStyle(el);
    const borderBottom = styleParsePixels(el.style.borderBottom) ?? styleParsePixels(computed.borderBottom) ?? 0;
    const borderLeft = styleParsePixels(el.style.borderLeft) ?? styleParsePixels(computed.borderLeft) ?? 0;
    const borderRight = styleParsePixels(el.style.borderRight) ?? styleParsePixels(computed.borderRight) ?? 0;
    const borderTop = styleParsePixels(el.style.borderTop) ?? styleParsePixels(computed.borderTop) ?? 0;
    const paddingBottom = styleParsePixels(el.style.paddingBottom) ?? styleParsePixels(computed.paddingBottom) ?? 0;
    const paddingLeft = styleParsePixels(el.style.paddingLeft) ?? styleParsePixels(computed.paddingLeft) ?? 0;
    const paddingRight = styleParsePixels(el.style.paddingRight) ?? styleParsePixels(computed.paddingRight) ?? 0;
    const paddingTop = styleParsePixels(el.style.paddingTop) ?? styleParsePixels(computed.paddingTop) ?? 0;
    const additionalWidth = borderLeft + borderRight + paddingLeft + paddingRight;
    const additionalHeight = borderTop + borderBottom + paddingTop + paddingBottom;
    for (const subscriber of subscribers) {
      subscriber.styles.additionalWidth = additionalWidth;
      subscriber.styles.additionalHeight = additionalHeight;
      s_UPDATE_SUBSCRIBER(subscriber, subscriber.contentWidth, subscriber.contentHeight);
    }
  }
};
const s_MAP = /* @__PURE__ */ new Map();
class ResizeObserverManager {
  static add(el, target) {
    const updateType = s_GET_UPDATE_TYPE(target);
    if (updateType === 0) {
      throw new Error(`'target' does not match supported ResizeObserverManager update mechanisms.`);
    }
    const computed = globalThis.getComputedStyle(el);
    const borderBottom = styleParsePixels(el.style.borderBottom) ?? styleParsePixels(computed.borderBottom) ?? 0;
    const borderLeft = styleParsePixels(el.style.borderLeft) ?? styleParsePixels(computed.borderLeft) ?? 0;
    const borderRight = styleParsePixels(el.style.borderRight) ?? styleParsePixels(computed.borderRight) ?? 0;
    const borderTop = styleParsePixels(el.style.borderTop) ?? styleParsePixels(computed.borderTop) ?? 0;
    const paddingBottom = styleParsePixels(el.style.paddingBottom) ?? styleParsePixels(computed.paddingBottom) ?? 0;
    const paddingLeft = styleParsePixels(el.style.paddingLeft) ?? styleParsePixels(computed.paddingLeft) ?? 0;
    const paddingRight = styleParsePixels(el.style.paddingRight) ?? styleParsePixels(computed.paddingRight) ?? 0;
    const paddingTop = styleParsePixels(el.style.paddingTop) ?? styleParsePixels(computed.paddingTop) ?? 0;
    const data = {
      updateType,
      target,
      contentWidth: 0,
      contentHeight: 0,
      styles: {
        additionalWidth: borderLeft + borderRight + paddingLeft + paddingRight,
        additionalHeight: borderTop + borderBottom + paddingTop + paddingBottom
      }
    };
    if (s_MAP.has(el)) {
      const subscribers = s_MAP.get(el);
      subscribers.push(data);
    } else {
      s_MAP.set(el, [data]);
    }
    s_RESIZE_OBSERVER.observe(el);
  }
  static remove(el, target = void 0) {
    const subscribers = s_MAP.get(el);
    if (Array.isArray(subscribers)) {
      const index = subscribers.findIndex((entry) => entry.target === target);
      if (index >= 0) {
        s_UPDATE_SUBSCRIBER(subscribers[index], void 0, void 0);
        subscribers.splice(index, 1);
      }
      if (subscribers.length === 0) {
        s_MAP.delete(el);
        s_RESIZE_OBSERVER.unobserve(el);
      }
    }
  }
}
__name(ResizeObserverManager, "ResizeObserverManager");
const s_UPDATE_TYPES = {
  none: 0,
  attribute: 1,
  function: 2,
  resizeObserved: 3,
  setContentBounds: 4,
  setDimension: 5,
  storeObject: 6,
  storesObject: 7
};
const s_RESIZE_OBSERVER = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const subscribers = s_MAP.get(entry?.target);
    if (Array.isArray(subscribers)) {
      const contentWidth = entry.contentRect.width;
      const contentHeight = entry.contentRect.height;
      for (const subscriber of subscribers) {
        s_UPDATE_SUBSCRIBER(subscriber, contentWidth, contentHeight);
      }
    }
  }
});
function s_GET_UPDATE_TYPE(target) {
  if (target?.resizeObserved instanceof Function) {
    return s_UPDATE_TYPES.resizeObserved;
  }
  if (target?.setDimension instanceof Function) {
    return s_UPDATE_TYPES.setDimension;
  }
  if (target?.setContentBounds instanceof Function) {
    return s_UPDATE_TYPES.setContentBounds;
  }
  const targetType = typeof target;
  if (targetType === "object" || targetType === "function") {
    if (isUpdatableStore(target.resizeObserved)) {
      return s_UPDATE_TYPES.storeObject;
    }
    const stores = target?.stores;
    if (typeof stores === "object" || typeof stores === "function") {
      if (isUpdatableStore(stores.resizeObserved)) {
        return s_UPDATE_TYPES.storesObject;
      }
    }
  }
  if (targetType === "object") {
    return s_UPDATE_TYPES.attribute;
  }
  if (targetType === "function") {
    return s_UPDATE_TYPES.function;
  }
  return s_UPDATE_TYPES.none;
}
__name(s_GET_UPDATE_TYPE, "s_GET_UPDATE_TYPE");
function s_UPDATE_SUBSCRIBER(subscriber, contentWidth, contentHeight) {
  const styles = subscriber.styles;
  subscriber.contentWidth = contentWidth;
  subscriber.contentHeight = contentHeight;
  const offsetWidth = Number.isFinite(contentWidth) ? contentWidth + styles.additionalWidth : void 0;
  const offsetHeight = Number.isFinite(contentHeight) ? contentHeight + styles.additionalHeight : void 0;
  const target = subscriber.target;
  switch (subscriber.updateType) {
    case s_UPDATE_TYPES.attribute:
      target.contentWidth = contentWidth;
      target.contentHeight = contentHeight;
      target.offsetWidth = offsetWidth;
      target.offsetHeight = offsetHeight;
      break;
    case s_UPDATE_TYPES.function:
      target?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.resizeObserved:
      target.resizeObserved?.(offsetWidth, offsetHeight, contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.setContentBounds:
      target.setContentBounds?.(contentWidth, contentHeight);
      break;
    case s_UPDATE_TYPES.setDimension:
      target.setDimension?.(offsetWidth, offsetHeight);
      break;
    case s_UPDATE_TYPES.storeObject:
      target.resizeObserved.update((object) => {
        object.contentHeight = contentHeight;
        object.contentWidth = contentWidth;
        object.offsetHeight = offsetHeight;
        object.offsetWidth = offsetWidth;
        return object;
      });
      break;
    case s_UPDATE_TYPES.storesObject:
      target.stores.resizeObserved.update((object) => {
        object.contentHeight = contentHeight;
        object.contentWidth = contentWidth;
        object.offsetHeight = offsetHeight;
        object.offsetWidth = offsetWidth;
        return object;
      });
      break;
  }
}
__name(s_UPDATE_SUBSCRIBER, "s_UPDATE_SUBSCRIBER");
function applyStyles(node, properties) {
  function setProperties() {
    if (typeof properties !== "object") {
      return;
    }
    for (const prop of Object.keys(properties)) {
      node.style.setProperty(`${prop}`, properties[prop]);
    }
  }
  __name(setProperties, "setProperties");
  setProperties();
  return {
    update(newProperties) {
      properties = newProperties;
      setProperties();
    }
  };
}
__name(applyStyles, "applyStyles");
function draggable(node, {
  position,
  active: active2 = true,
  button = 0,
  storeDragging = void 0,
  ease = false,
  easeOptions = { duration: 0.1, ease: cubicOut }
}) {
  let initialPosition = null;
  let initialDragPoint = {};
  let dragging = false;
  let quickTo = position.animate.quickTo(["top", "left"], easeOptions);
  const handlers = {
    dragDown: ["pointerdown", (e) => onDragPointerDown(e), false],
    dragMove: ["pointermove", (e) => onDragPointerChange(e), false],
    dragUp: ["pointerup", (e) => onDragPointerUp(e), false]
  };
  function activateListeners() {
    node.addEventListener(...handlers.dragDown);
    node.classList.add("draggable");
  }
  __name(activateListeners, "activateListeners");
  function removeListeners() {
    if (typeof storeDragging?.set === "function") {
      storeDragging.set(false);
    }
    node.removeEventListener(...handlers.dragDown);
    node.removeEventListener(...handlers.dragMove);
    node.removeEventListener(...handlers.dragUp);
    node.classList.remove("draggable");
  }
  __name(removeListeners, "removeListeners");
  if (active2) {
    activateListeners();
  }
  function onDragPointerDown(event) {
    if (event.button !== button || !event.isPrimary) {
      return;
    }
    event.preventDefault();
    dragging = false;
    initialPosition = position.get();
    initialDragPoint = { x: event.clientX, y: event.clientY };
    node.addEventListener(...handlers.dragMove);
    node.addEventListener(...handlers.dragUp);
    node.setPointerCapture(event.pointerId);
  }
  __name(onDragPointerDown, "onDragPointerDown");
  function onDragPointerChange(event) {
    if ((event.buttons & 1) === 0) {
      onDragPointerUp(event);
      return;
    }
    if (event.button !== -1 || !event.isPrimary) {
      return;
    }
    event.preventDefault();
    if (!dragging && typeof storeDragging?.set === "function") {
      dragging = true;
      storeDragging.set(true);
    }
    const newLeft = initialPosition.left + (event.clientX - initialDragPoint.x);
    const newTop = initialPosition.top + (event.clientY - initialDragPoint.y);
    if (ease) {
      quickTo(newTop, newLeft);
    } else {
      s_POSITION_DATA.left = newLeft;
      s_POSITION_DATA.top = newTop;
      position.set(s_POSITION_DATA);
    }
  }
  __name(onDragPointerChange, "onDragPointerChange");
  function onDragPointerUp(event) {
    event.preventDefault();
    dragging = false;
    if (typeof storeDragging?.set === "function") {
      storeDragging.set(false);
    }
    node.removeEventListener(...handlers.dragMove);
    node.removeEventListener(...handlers.dragUp);
  }
  __name(onDragPointerUp, "onDragPointerUp");
  return {
    update: (options) => {
      if (typeof options.active === "boolean") {
        active2 = options.active;
        if (active2) {
          activateListeners();
        } else {
          removeListeners();
        }
      }
      if (typeof options.button === "number") {
        button = options.button;
      }
      if (options.position !== void 0 && options.position !== position) {
        position = options.position;
        quickTo = position.animate.quickTo(["top", "left"], easeOptions);
      }
      if (typeof options.ease === "boolean") {
        ease = options.ease;
      }
      if (typeof options.easeOptions === "object") {
        easeOptions = options.easeOptions;
        quickTo.options(easeOptions);
      }
    },
    destroy: () => removeListeners()
  };
}
__name(draggable, "draggable");
class DraggableOptions {
  #ease = false;
  #easeOptions = { duration: 0.1, ease: cubicOut };
  #subscriptions = [];
  constructor({ ease, easeOptions } = {}) {
    Object.defineProperty(this, "ease", {
      get: () => {
        return this.#ease;
      },
      set: (newEase) => {
        if (typeof newEase !== "boolean") {
          throw new TypeError(`'ease' is not a boolean.`);
        }
        this.#ease = newEase;
        this.#updateSubscribers();
      },
      enumerable: true
    });
    Object.defineProperty(this, "easeOptions", {
      get: () => {
        return this.#easeOptions;
      },
      set: (newEaseOptions) => {
        if (newEaseOptions === null || typeof newEaseOptions !== "object") {
          throw new TypeError(`'easeOptions' is not an object.`);
        }
        if (newEaseOptions.duration !== void 0) {
          if (!Number.isFinite(newEaseOptions.duration)) {
            throw new TypeError(`'easeOptions.duration' is not a finite number.`);
          }
          if (newEaseOptions.duration < 0) {
            throw new Error(`'easeOptions.duration' is less than 0.`);
          }
          this.#easeOptions.duration = newEaseOptions.duration;
        }
        if (newEaseOptions.ease !== void 0) {
          if (typeof newEaseOptions.ease !== "function" && typeof newEaseOptions.ease !== "string") {
            throw new TypeError(`'easeOptions.ease' is not a function or string.`);
          }
          this.#easeOptions.ease = newEaseOptions.ease;
        }
        this.#updateSubscribers();
      },
      enumerable: true
    });
    if (ease !== void 0) {
      this.ease = ease;
    }
    if (easeOptions !== void 0) {
      this.easeOptions = easeOptions;
    }
  }
  get easeDuration() {
    return this.#easeOptions.duration;
  }
  get easeValue() {
    return this.#easeOptions.ease;
  }
  set easeDuration(duration) {
    if (!Number.isFinite(duration)) {
      throw new TypeError(`'duration' is not a finite number.`);
    }
    if (duration < 0) {
      throw new Error(`'duration' is less than 0.`);
    }
    this.#easeOptions.duration = duration;
    this.#updateSubscribers();
  }
  set easeValue(value) {
    if (typeof value !== "function" && typeof value !== "string") {
      throw new TypeError(`'value' is not a function or string.`);
    }
    this.#easeOptions.ease = value;
    this.#updateSubscribers();
  }
  reset() {
    this.#ease = false;
    this.#easeOptions = { duration: 0.1, ease: cubicOut };
    this.#updateSubscribers();
  }
  resetEase() {
    this.#easeOptions = { duration: 0.1, ease: cubicOut };
    this.#updateSubscribers();
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this);
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  #updateSubscribers() {
    const subscriptions = this.#subscriptions;
    if (subscriptions.length > 0) {
      for (let cntr = 0; cntr < subscriptions.length; cntr++) {
        subscriptions[cntr](this);
      }
    }
  }
}
__name(DraggableOptions, "DraggableOptions");
draggable.options = (options) => new DraggableOptions(options);
const s_POSITION_DATA = { left: 0, top: 0 };
function localize(stringId, data) {
  const result = typeof data !== "object" ? game.i18n.localize(stringId) : game.i18n.format(stringId, data);
  return result !== void 0 ? result : "";
}
__name(localize, "localize");
function create_fragment$e(ctx) {
  let a;
  let html_tag;
  let t;
  let a_class_value;
  let applyStyles_action;
  let mounted;
  let dispose;
  return {
    c() {
      a = element("a");
      html_tag = new HtmlTag(false);
      t = text(ctx[2]);
      html_tag.a = t;
      attr(a, "class", a_class_value = "header-button " + ctx[0].class);
    },
    m(target, anchor) {
      insert(target, a, anchor);
      html_tag.m(ctx[1], a);
      append(a, t);
      if (!mounted) {
        dispose = [
          listen(a, "click", stop_propagation(prevent_default(ctx[4])), true),
          listen(a, "pointerdown", stop_propagation(prevent_default(pointerdown_handler)), true),
          listen(a, "mousedown", stop_propagation(prevent_default(mousedown_handler)), true),
          listen(a, "dblclick", stop_propagation(prevent_default(dblclick_handler)), true),
          action_destroyer(applyStyles_action = applyStyles.call(null, a, ctx[3]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2)
        html_tag.p(ctx2[1]);
      if (dirty & 4)
        set_data(t, ctx2[2]);
      if (dirty & 1 && a_class_value !== (a_class_value = "header-button " + ctx2[0].class)) {
        attr(a, "class", a_class_value);
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 8)
        applyStyles_action.update.call(null, ctx2[3]);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(a);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$e, "create_fragment$e");
const s_REGEX_HTML = /^\s*<.*>$/;
const pointerdown_handler = /* @__PURE__ */ __name(() => null, "pointerdown_handler");
const mousedown_handler = /* @__PURE__ */ __name(() => null, "mousedown_handler");
const dblclick_handler = /* @__PURE__ */ __name(() => null, "dblclick_handler");
function instance$e($$self, $$props, $$invalidate) {
  let { button = void 0 } = $$props;
  let icon, label, title, styles;
  function onClick(event) {
    const invoke = button.callback ?? button.onclick;
    if (typeof invoke === "function") {
      invoke.call(button, event);
      $$invalidate(0, button);
    }
  }
  __name(onClick, "onClick");
  $$self.$$set = ($$props2) => {
    if ("button" in $$props2)
      $$invalidate(0, button = $$props2.button);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 33) {
      if (button) {
        $$invalidate(5, title = typeof button.title === "string" ? localize(button.title) : "");
        $$invalidate(1, icon = typeof button.icon !== "string" ? void 0 : s_REGEX_HTML.test(button.icon) ? button.icon : `<i class="${button.icon}" title="${title}"></i>`);
        $$invalidate(2, label = typeof button.label === "string" ? localize(button.label) : "");
        $$invalidate(3, styles = typeof button.styles === "object" ? button.styles : void 0);
      }
    }
  };
  return [button, icon, label, styles, onClick, title];
}
__name(instance$e, "instance$e");
class TJSHeaderButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, { button: 0 });
  }
  get button() {
    return this.$$.ctx[0];
  }
  set button(button) {
    this.$$set({ button });
    flush();
  }
}
__name(TJSHeaderButton, "TJSHeaderButton");
const TJSApplicationHeader_svelte_svelte_type_style_lang = "";
function get_each_context$9(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[20] = list[i];
  return child_ctx;
}
__name(get_each_context$9, "get_each_context$9");
function create_each_block$9(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  const switch_instance_spread_levels = [ctx[20].props];
  var switch_value = ctx[20].class;
  function switch_props(ctx2) {
    let switch_instance_props = {};
    for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    }
    return { props: switch_instance_props };
  }
  __name(switch_props, "switch_props");
  if (switch_value) {
    switch_instance = new switch_value(switch_props());
  }
  return {
    c() {
      if (switch_instance)
        create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = dirty & 8 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(ctx2[20].props)]) : {};
      if (switch_value !== (switch_value = ctx2[20].class)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props());
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance)
        transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance)
        transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(switch_instance_anchor);
      if (switch_instance)
        destroy_component(switch_instance, detaching);
    }
  };
}
__name(create_each_block$9, "create_each_block$9");
function create_key_block(ctx) {
  let header;
  let h4;
  let t0_value = localize(ctx[5]) + "";
  let t0;
  let t1;
  let draggable_action;
  let minimizable_action;
  let current;
  let mounted;
  let dispose;
  let each_value = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
  }
  const out = /* @__PURE__ */ __name((i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  }), "out");
  return {
    c() {
      header = element("header");
      h4 = element("h4");
      t0 = text(t0_value);
      t1 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h4, "class", "window-title svelte-3umz0z");
      set_style(h4, "display", ctx[2], false);
      attr(header, "class", "window-header flexrow");
    },
    m(target, anchor) {
      insert(target, header, anchor);
      append(header, h4);
      append(h4, t0);
      append(header, t1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(header, null);
      }
      current = true;
      if (!mounted) {
        dispose = [
          action_destroyer(draggable_action = ctx[0].call(null, header, ctx[1])),
          action_destroyer(minimizable_action = ctx[12].call(null, header, ctx[4]))
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if ((!current || dirty & 32) && t0_value !== (t0_value = localize(ctx2[5]) + ""))
        set_data(t0, t0_value);
      if (dirty & 4) {
        set_style(h4, "display", ctx2[2], false);
      }
      if (dirty & 8) {
        each_value = ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$9(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$9(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(header, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (draggable_action && is_function(draggable_action.update) && dirty & 2)
        draggable_action.update.call(null, ctx2[1]);
      if (minimizable_action && is_function(minimizable_action.update) && dirty & 16)
        minimizable_action.update.call(null, ctx2[4]);
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(header);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_key_block, "create_key_block");
function create_fragment$d(ctx) {
  let previous_key = ctx[0];
  let key_block_anchor;
  let current;
  let key_block = create_key_block(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && safe_not_equal(previous_key, previous_key = ctx2[0])) {
        group_outros();
        transition_out(key_block, 1, 1, noop);
        check_outros();
        key_block = create_key_block(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
__name(create_fragment$d, "create_fragment$d");
function instance$d($$self, $$props, $$invalidate) {
  let $storeHeaderButtons;
  let $storeMinimized;
  let $storeHeaderNoTitleMinimized;
  let $storeDraggable;
  let $storeMinimizable;
  let $storeTitle;
  let { draggable: draggable$1 = void 0 } = $$props;
  let { draggableOptions = void 0 } = $$props;
  const application = getContext("external").application;
  const storeTitle = application.reactive.storeAppOptions.title;
  component_subscribe($$self, storeTitle, (value) => $$invalidate(5, $storeTitle = value));
  const storeDraggable = application.reactive.storeAppOptions.draggable;
  component_subscribe($$self, storeDraggable, (value) => $$invalidate(17, $storeDraggable = value));
  const storeDragging = application.reactive.storeUIState.dragging;
  const storeHeaderButtons = application.reactive.storeUIState.headerButtons;
  component_subscribe($$self, storeHeaderButtons, (value) => $$invalidate(14, $storeHeaderButtons = value));
  const storeHeaderNoTitleMinimized = application.reactive.storeAppOptions.headerNoTitleMinimized;
  component_subscribe($$self, storeHeaderNoTitleMinimized, (value) => $$invalidate(16, $storeHeaderNoTitleMinimized = value));
  const storeMinimizable = application.reactive.storeAppOptions.minimizable;
  component_subscribe($$self, storeMinimizable, (value) => $$invalidate(4, $storeMinimizable = value));
  const storeMinimized = application.reactive.storeUIState.minimized;
  component_subscribe($$self, storeMinimized, (value) => $$invalidate(15, $storeMinimized = value));
  let dragOptions;
  let displayHeaderTitle;
  let buttons;
  function minimizable(node, booleanStore) {
    const callback = application._onToggleMinimize.bind(application);
    function activateListeners() {
      node.addEventListener("dblclick", callback);
    }
    __name(activateListeners, "activateListeners");
    function removeListeners() {
      node.removeEventListener("dblclick", callback);
    }
    __name(removeListeners, "removeListeners");
    if (booleanStore) {
      activateListeners();
    }
    return {
      update: (booleanStore2) => {
        if (booleanStore2) {
          activateListeners();
        } else {
          removeListeners();
        }
      },
      destroy: () => removeListeners()
    };
  }
  __name(minimizable, "minimizable");
  $$self.$$set = ($$props2) => {
    if ("draggable" in $$props2)
      $$invalidate(0, draggable$1 = $$props2.draggable);
    if ("draggableOptions" in $$props2)
      $$invalidate(13, draggableOptions = $$props2.draggableOptions);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      $$invalidate(0, draggable$1 = typeof draggable$1 === "function" ? draggable$1 : draggable);
    }
    if ($$self.$$.dirty & 139264) {
      $$invalidate(1, dragOptions = Object.assign(
        {},
        {
          ease: true,
          easeOptions: { duration: 0.1, ease: cubicOut }
        },
        typeof draggableOptions === "object" ? draggableOptions : {},
        {
          position: application.position,
          active: $storeDraggable,
          storeDragging
        }
      ));
    }
    if ($$self.$$.dirty & 98304) {
      $$invalidate(2, displayHeaderTitle = $storeHeaderNoTitleMinimized && $storeMinimized ? "none" : null);
    }
    if ($$self.$$.dirty & 16384) {
      {
        $$invalidate(3, buttons = $storeHeaderButtons.reduce(
          (array, button) => {
            array.push(isSvelteComponent(button) ? { class: button, props: {} } : {
              class: TJSHeaderButton,
              props: { button }
            });
            return array;
          },
          []
        ));
      }
    }
  };
  return [
    draggable$1,
    dragOptions,
    displayHeaderTitle,
    buttons,
    $storeMinimizable,
    $storeTitle,
    storeTitle,
    storeDraggable,
    storeHeaderButtons,
    storeHeaderNoTitleMinimized,
    storeMinimizable,
    storeMinimized,
    minimizable,
    draggableOptions,
    $storeHeaderButtons,
    $storeMinimized,
    $storeHeaderNoTitleMinimized,
    $storeDraggable
  ];
}
__name(instance$d, "instance$d");
class TJSApplicationHeader extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$d, create_fragment$d, safe_not_equal, { draggable: 0, draggableOptions: 13 });
  }
}
__name(TJSApplicationHeader, "TJSApplicationHeader");
function create_fragment$c(ctx) {
  let div;
  let resizable_action;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      div.innerHTML = `<i class="fas fa-arrows-alt-h"></i>`;
      attr(div, "class", "window-resizable-handle");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      ctx[10](div);
      if (!mounted) {
        dispose = action_destroyer(resizable_action = ctx[6].call(null, div, {
          active: ctx[1],
          storeResizing: ctx[5]
        }));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (resizable_action && is_function(resizable_action.update) && dirty & 2)
        resizable_action.update.call(null, {
          active: ctx2[1],
          storeResizing: ctx2[5]
        });
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[10](null);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$c, "create_fragment$c");
function instance$c($$self, $$props, $$invalidate) {
  let $storeElementRoot;
  let $storeMinimized;
  let $storeResizable;
  let { isResizable = false } = $$props;
  const application = getContext("external").application;
  const storeElementRoot = getContext("storeElementRoot");
  component_subscribe($$self, storeElementRoot, (value) => $$invalidate(8, $storeElementRoot = value));
  const storeResizable = application.reactive.storeAppOptions.resizable;
  component_subscribe($$self, storeResizable, (value) => $$invalidate(1, $storeResizable = value));
  const storeMinimized = application.reactive.storeUIState.minimized;
  component_subscribe($$self, storeMinimized, (value) => $$invalidate(9, $storeMinimized = value));
  const storeResizing = application.reactive.storeUIState.resizing;
  let elementResize;
  function resizable(node, { active: active2 = true, storeResizing: storeResizing2 = void 0 } = {}) {
    let position = null;
    let initialPosition = {};
    let resizing = false;
    const handlers = {
      resizeDown: ["pointerdown", (e) => onResizePointerDown(e), false],
      resizeMove: ["pointermove", (e) => onResizePointerMove(e), false],
      resizeUp: ["pointerup", (e) => onResizePointerUp(e), false]
    };
    function activateListeners() {
      node.addEventListener(...handlers.resizeDown);
      $$invalidate(7, isResizable = true);
      node.style.display = "block";
    }
    __name(activateListeners, "activateListeners");
    function removeListeners() {
      if (typeof storeResizing2?.set === "function") {
        storeResizing2.set(false);
      }
      node.removeEventListener(...handlers.resizeDown);
      node.removeEventListener(...handlers.resizeMove);
      node.removeEventListener(...handlers.resizeUp);
      node.style.display = "none";
      $$invalidate(7, isResizable = false);
    }
    __name(removeListeners, "removeListeners");
    if (active2) {
      activateListeners();
    } else {
      node.style.display = "none";
    }
    function onResizePointerDown(event) {
      event.preventDefault();
      resizing = false;
      position = application.position.get();
      if (position.height === "auto") {
        position.height = $storeElementRoot.clientHeight;
      }
      if (position.width === "auto") {
        position.width = $storeElementRoot.clientWidth;
      }
      initialPosition = { x: event.clientX, y: event.clientY };
      node.addEventListener(...handlers.resizeMove);
      node.addEventListener(...handlers.resizeUp);
      node.setPointerCapture(event.pointerId);
    }
    __name(onResizePointerDown, "onResizePointerDown");
    function onResizePointerMove(event) {
      event.preventDefault();
      if (!resizing && typeof storeResizing2?.set === "function") {
        resizing = true;
        storeResizing2.set(true);
      }
      application.position.set({
        width: position.width + (event.clientX - initialPosition.x),
        height: position.height + (event.clientY - initialPosition.y)
      });
    }
    __name(onResizePointerMove, "onResizePointerMove");
    function onResizePointerUp(event) {
      resizing = false;
      if (typeof storeResizing2?.set === "function") {
        storeResizing2.set(false);
      }
      event.preventDefault();
      node.removeEventListener(...handlers.resizeMove);
      node.removeEventListener(...handlers.resizeUp);
      application._onResize(event);
    }
    __name(onResizePointerUp, "onResizePointerUp");
    return {
      update: ({ active: active3 }) => {
        if (active3) {
          activateListeners();
        } else {
          removeListeners();
        }
      },
      destroy: () => removeListeners()
    };
  }
  __name(resizable, "resizable");
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementResize = $$value;
      $$invalidate(0, elementResize), $$invalidate(7, isResizable), $$invalidate(9, $storeMinimized), $$invalidate(8, $storeElementRoot);
    });
  }
  __name(div_binding, "div_binding");
  $$self.$$set = ($$props2) => {
    if ("isResizable" in $$props2)
      $$invalidate(7, isResizable = $$props2.isResizable);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 897) {
      if (elementResize) {
        $$invalidate(0, elementResize.style.display = isResizable && !$storeMinimized ? "block" : "none", elementResize);
        const elementRoot = $storeElementRoot;
        if (elementRoot) {
          elementRoot.classList[isResizable ? "add" : "remove"]("resizable");
        }
      }
    }
  };
  return [
    elementResize,
    $storeResizable,
    storeElementRoot,
    storeResizable,
    storeMinimized,
    storeResizing,
    resizable,
    isResizable,
    $storeElementRoot,
    $storeMinimized,
    div_binding
  ];
}
__name(instance$c, "instance$c");
class ResizableHandle extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, { isResizable: 7 });
  }
}
__name(ResizableHandle, "ResizableHandle");
const ApplicationShell_svelte_svelte_type_style_lang = "";
function create_else_block(ctx) {
  let current;
  const default_slot_template = ctx[27].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[26], null);
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 67108864)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            ctx2[26],
            !current ? get_all_dirty_from_scope(ctx2[26]) : get_slot_changes(default_slot_template, ctx2[26], dirty, null),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
__name(create_else_block, "create_else_block");
function create_if_block$4(ctx) {
  let tjscontainer;
  let current;
  tjscontainer = new TJSContainer({
    props: { children: ctx[14] }
  });
  return {
    c() {
      create_component(tjscontainer.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tjscontainer, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(tjscontainer.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tjscontainer.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(tjscontainer, detaching);
    }
  };
}
__name(create_if_block$4, "create_if_block$4");
function create_fragment$b(ctx) {
  let div;
  let tjsapplicationheader;
  let t0;
  let section;
  let current_block_type_index;
  let if_block;
  let applyStyles_action;
  let t1;
  let resizablehandle;
  let div_id_value;
  let div_class_value;
  let div_data_appid_value;
  let applyStyles_action_1;
  let div_intro;
  let div_outro;
  let current;
  let mounted;
  let dispose;
  tjsapplicationheader = new TJSApplicationHeader({
    props: {
      draggable: ctx[6],
      draggableOptions: ctx[7]
    }
  });
  const if_block_creators = [create_if_block$4, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (Array.isArray(ctx2[14]))
      return 0;
    return 1;
  }
  __name(select_block_type, "select_block_type");
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  resizablehandle = new ResizableHandle({});
  return {
    c() {
      div = element("div");
      create_component(tjsapplicationheader.$$.fragment);
      t0 = space();
      section = element("section");
      if_block.c();
      t1 = space();
      create_component(resizablehandle.$$.fragment);
      attr(section, "class", "window-content svelte-are4no");
      attr(div, "id", div_id_value = ctx[10].id);
      attr(div, "class", div_class_value = "app window-app " + ctx[10].options.classes.join(" ") + " svelte-are4no");
      attr(div, "data-appid", div_data_appid_value = ctx[10].appId);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(tjsapplicationheader, div, null);
      append(div, t0);
      append(div, section);
      if_blocks[current_block_type_index].m(section, null);
      ctx[28](section);
      append(div, t1);
      mount_component(resizablehandle, div, null);
      ctx[29](div);
      current = true;
      if (!mounted) {
        dispose = [
          action_destroyer(applyStyles_action = applyStyles.call(null, section, ctx[9])),
          action_destroyer(ctx[12].call(null, section, ctx[15])),
          listen(div, "pointerdown", ctx[13], true),
          action_destroyer(applyStyles_action_1 = applyStyles.call(null, div, ctx[8])),
          action_destroyer(ctx[11].call(null, div, ctx[16]))
        ];
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      const tjsapplicationheader_changes = {};
      if (dirty & 64)
        tjsapplicationheader_changes.draggable = ctx[6];
      if (dirty & 128)
        tjsapplicationheader_changes.draggableOptions = ctx[7];
      tjsapplicationheader.$set(tjsapplicationheader_changes);
      if_block.p(ctx, dirty);
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & 512)
        applyStyles_action.update.call(null, ctx[9]);
      if (!current || dirty & 1024 && div_id_value !== (div_id_value = ctx[10].id)) {
        attr(div, "id", div_id_value);
      }
      if (!current || dirty & 1024 && div_class_value !== (div_class_value = "app window-app " + ctx[10].options.classes.join(" ") + " svelte-are4no")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty & 1024 && div_data_appid_value !== (div_data_appid_value = ctx[10].appId)) {
        attr(div, "data-appid", div_data_appid_value);
      }
      if (applyStyles_action_1 && is_function(applyStyles_action_1.update) && dirty & 256)
        applyStyles_action_1.update.call(null, ctx[8]);
    },
    i(local) {
      if (current)
        return;
      transition_in(tjsapplicationheader.$$.fragment, local);
      transition_in(if_block);
      transition_in(resizablehandle.$$.fragment, local);
      add_render_callback(() => {
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, ctx[2], ctx[4]);
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(tjsapplicationheader.$$.fragment, local);
      transition_out(if_block);
      transition_out(resizablehandle.$$.fragment, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, ctx[3], ctx[5]);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(tjsapplicationheader);
      if_blocks[current_block_type_index].d();
      ctx[28](null);
      destroy_component(resizablehandle);
      ctx[29](null);
      if (detaching && div_outro)
        div_outro.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$b, "create_fragment$b");
function instance$b($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { elementContent = void 0 } = $$props;
  let { elementRoot = void 0 } = $$props;
  let { draggable: draggable2 = void 0 } = $$props;
  let { draggableOptions = void 0 } = $$props;
  let { children: children2 = void 0 } = $$props;
  let { stylesApp = void 0 } = $$props;
  let { stylesContent = void 0 } = $$props;
  let { appOffsetHeight = false } = $$props;
  let { appOffsetWidth = false } = $$props;
  const appResizeObserver = !!appOffsetHeight || !!appOffsetWidth ? resizeObserver : () => null;
  let { contentOffsetHeight = false } = $$props;
  let { contentOffsetWidth = false } = $$props;
  const contentResizeObserver = !!contentOffsetHeight || !!contentOffsetWidth ? resizeObserver : () => null;
  const bringToTop = /* @__PURE__ */ __name((event) => {
    if (typeof application.options.popOut === "boolean" && application.options.popOut) {
      if (application !== ui?.activeWindow) {
        application.bringToTop.call(application);
      }
      if (document.activeElement !== document.body && event.target !== document.activeElement) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        document.body.focus();
      }
    }
  }, "bringToTop");
  if (!getContext("storeElementContent")) {
    setContext("storeElementContent", writable(elementContent));
  }
  if (!getContext("storeElementRoot")) {
    setContext("storeElementRoot", writable(elementRoot));
  }
  const context = getContext("external");
  const application = context.application;
  const allChildren = Array.isArray(children2) ? children2 : typeof context === "object" ? context.children : void 0;
  let { transition = void 0 } = $$props;
  let { inTransition = s_DEFAULT_TRANSITION } = $$props;
  let { outTransition = s_DEFAULT_TRANSITION } = $$props;
  let { transitionOptions = void 0 } = $$props;
  let { inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS } = $$props;
  let { outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS } = $$props;
  let oldTransition = void 0;
  let oldTransitionOptions = void 0;
  function resizeObservedContent(offsetWidth, offsetHeight) {
    $$invalidate(20, contentOffsetWidth = offsetWidth);
    $$invalidate(19, contentOffsetHeight = offsetHeight);
  }
  __name(resizeObservedContent, "resizeObservedContent");
  function resizeObservedApp(offsetWidth, offsetHeight, contentWidth, contentHeight) {
    application.position.stores.resizeObserved.update((object) => {
      object.contentWidth = contentWidth;
      object.contentHeight = contentHeight;
      object.offsetWidth = offsetWidth;
      object.offsetHeight = offsetHeight;
      return object;
    });
    $$invalidate(17, appOffsetHeight = offsetHeight);
    $$invalidate(18, appOffsetWidth = offsetWidth);
  }
  __name(resizeObservedApp, "resizeObservedApp");
  function section_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementContent = $$value;
      $$invalidate(0, elementContent);
    });
  }
  __name(section_binding, "section_binding");
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      elementRoot = $$value;
      $$invalidate(1, elementRoot);
    });
  }
  __name(div_binding, "div_binding");
  $$self.$$set = ($$props2) => {
    if ("elementContent" in $$props2)
      $$invalidate(0, elementContent = $$props2.elementContent);
    if ("elementRoot" in $$props2)
      $$invalidate(1, elementRoot = $$props2.elementRoot);
    if ("draggable" in $$props2)
      $$invalidate(6, draggable2 = $$props2.draggable);
    if ("draggableOptions" in $$props2)
      $$invalidate(7, draggableOptions = $$props2.draggableOptions);
    if ("children" in $$props2)
      $$invalidate(21, children2 = $$props2.children);
    if ("stylesApp" in $$props2)
      $$invalidate(8, stylesApp = $$props2.stylesApp);
    if ("stylesContent" in $$props2)
      $$invalidate(9, stylesContent = $$props2.stylesContent);
    if ("appOffsetHeight" in $$props2)
      $$invalidate(17, appOffsetHeight = $$props2.appOffsetHeight);
    if ("appOffsetWidth" in $$props2)
      $$invalidate(18, appOffsetWidth = $$props2.appOffsetWidth);
    if ("contentOffsetHeight" in $$props2)
      $$invalidate(19, contentOffsetHeight = $$props2.contentOffsetHeight);
    if ("contentOffsetWidth" in $$props2)
      $$invalidate(20, contentOffsetWidth = $$props2.contentOffsetWidth);
    if ("transition" in $$props2)
      $$invalidate(22, transition = $$props2.transition);
    if ("inTransition" in $$props2)
      $$invalidate(2, inTransition = $$props2.inTransition);
    if ("outTransition" in $$props2)
      $$invalidate(3, outTransition = $$props2.outTransition);
    if ("transitionOptions" in $$props2)
      $$invalidate(23, transitionOptions = $$props2.transitionOptions);
    if ("inTransitionOptions" in $$props2)
      $$invalidate(4, inTransitionOptions = $$props2.inTransitionOptions);
    if ("outTransitionOptions" in $$props2)
      $$invalidate(5, outTransitionOptions = $$props2.outTransitionOptions);
    if ("$$scope" in $$props2)
      $$invalidate(26, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      if (elementContent !== void 0 && elementContent !== null) {
        getContext("storeElementContent").set(elementContent);
      }
    }
    if ($$self.$$.dirty & 2) {
      if (elementRoot !== void 0 && elementRoot !== null) {
        getContext("storeElementRoot").set(elementRoot);
      }
    }
    if ($$self.$$.dirty & 20971520) {
      if (oldTransition !== transition) {
        const newTransition = s_DEFAULT_TRANSITION !== transition && typeof transition === "function" ? transition : s_DEFAULT_TRANSITION;
        $$invalidate(2, inTransition = newTransition);
        $$invalidate(3, outTransition = newTransition);
        $$invalidate(24, oldTransition = newTransition);
      }
    }
    if ($$self.$$.dirty & 41943040) {
      if (oldTransitionOptions !== transitionOptions) {
        const newOptions = transitionOptions !== s_DEFAULT_TRANSITION_OPTIONS && typeof transitionOptions === "object" ? transitionOptions : s_DEFAULT_TRANSITION_OPTIONS;
        $$invalidate(4, inTransitionOptions = newOptions);
        $$invalidate(5, outTransitionOptions = newOptions);
        $$invalidate(25, oldTransitionOptions = newOptions);
      }
    }
    if ($$self.$$.dirty & 4) {
      if (typeof inTransition !== "function") {
        $$invalidate(2, inTransition = s_DEFAULT_TRANSITION);
      }
    }
    if ($$self.$$.dirty & 1032) {
      {
        if (typeof outTransition !== "function") {
          $$invalidate(3, outTransition = s_DEFAULT_TRANSITION);
        }
        if (application && typeof application?.options?.defaultCloseAnimation === "boolean") {
          $$invalidate(10, application.options.defaultCloseAnimation = outTransition === s_DEFAULT_TRANSITION, application);
        }
      }
    }
    if ($$self.$$.dirty & 16) {
      if (typeof inTransitionOptions !== "object") {
        $$invalidate(4, inTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS);
      }
    }
    if ($$self.$$.dirty & 32) {
      if (typeof outTransitionOptions !== "object") {
        $$invalidate(5, outTransitionOptions = s_DEFAULT_TRANSITION_OPTIONS);
      }
    }
  };
  return [
    elementContent,
    elementRoot,
    inTransition,
    outTransition,
    inTransitionOptions,
    outTransitionOptions,
    draggable2,
    draggableOptions,
    stylesApp,
    stylesContent,
    application,
    appResizeObserver,
    contentResizeObserver,
    bringToTop,
    allChildren,
    resizeObservedContent,
    resizeObservedApp,
    appOffsetHeight,
    appOffsetWidth,
    contentOffsetHeight,
    contentOffsetWidth,
    children2,
    transition,
    transitionOptions,
    oldTransition,
    oldTransitionOptions,
    $$scope,
    slots,
    section_binding,
    div_binding
  ];
}
__name(instance$b, "instance$b");
class ApplicationShell extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {
      elementContent: 0,
      elementRoot: 1,
      draggable: 6,
      draggableOptions: 7,
      children: 21,
      stylesApp: 8,
      stylesContent: 9,
      appOffsetHeight: 17,
      appOffsetWidth: 18,
      contentOffsetHeight: 19,
      contentOffsetWidth: 20,
      transition: 22,
      inTransition: 2,
      outTransition: 3,
      transitionOptions: 23,
      inTransitionOptions: 4,
      outTransitionOptions: 5
    });
  }
  get elementContent() {
    return this.$$.ctx[0];
  }
  set elementContent(elementContent) {
    this.$$set({ elementContent });
    flush();
  }
  get elementRoot() {
    return this.$$.ctx[1];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
  get draggable() {
    return this.$$.ctx[6];
  }
  set draggable(draggable2) {
    this.$$set({ draggable: draggable2 });
    flush();
  }
  get draggableOptions() {
    return this.$$.ctx[7];
  }
  set draggableOptions(draggableOptions) {
    this.$$set({ draggableOptions });
    flush();
  }
  get children() {
    return this.$$.ctx[21];
  }
  set children(children2) {
    this.$$set({ children: children2 });
    flush();
  }
  get stylesApp() {
    return this.$$.ctx[8];
  }
  set stylesApp(stylesApp) {
    this.$$set({ stylesApp });
    flush();
  }
  get stylesContent() {
    return this.$$.ctx[9];
  }
  set stylesContent(stylesContent) {
    this.$$set({ stylesContent });
    flush();
  }
  get appOffsetHeight() {
    return this.$$.ctx[17];
  }
  set appOffsetHeight(appOffsetHeight) {
    this.$$set({ appOffsetHeight });
    flush();
  }
  get appOffsetWidth() {
    return this.$$.ctx[18];
  }
  set appOffsetWidth(appOffsetWidth) {
    this.$$set({ appOffsetWidth });
    flush();
  }
  get contentOffsetHeight() {
    return this.$$.ctx[19];
  }
  set contentOffsetHeight(contentOffsetHeight) {
    this.$$set({ contentOffsetHeight });
    flush();
  }
  get contentOffsetWidth() {
    return this.$$.ctx[20];
  }
  set contentOffsetWidth(contentOffsetWidth) {
    this.$$set({ contentOffsetWidth });
    flush();
  }
  get transition() {
    return this.$$.ctx[22];
  }
  set transition(transition) {
    this.$$set({ transition });
    flush();
  }
  get inTransition() {
    return this.$$.ctx[2];
  }
  set inTransition(inTransition) {
    this.$$set({ inTransition });
    flush();
  }
  get outTransition() {
    return this.$$.ctx[3];
  }
  set outTransition(outTransition) {
    this.$$set({ outTransition });
    flush();
  }
  get transitionOptions() {
    return this.$$.ctx[23];
  }
  set transitionOptions(transitionOptions) {
    this.$$set({ transitionOptions });
    flush();
  }
  get inTransitionOptions() {
    return this.$$.ctx[4];
  }
  set inTransitionOptions(inTransitionOptions) {
    this.$$set({ inTransitionOptions });
    flush();
  }
  get outTransitionOptions() {
    return this.$$.ctx[5];
  }
  set outTransitionOptions(outTransitionOptions) {
    this.$$set({ outTransitionOptions });
    flush();
  }
}
__name(ApplicationShell, "ApplicationShell");
const TJSApplicationShell_svelte_svelte_type_style_lang = "";
const DialogContent_svelte_svelte_type_style_lang = "";
class ObjectEntryStore {
  #data;
  #subscriptions = [];
  constructor(data = {}) {
    if (!isObject(data)) {
      throw new TypeError(`'data' is not an object.`);
    }
    this.#data = data;
    if (typeof data.id !== "string") {
      this.#data.id = uuidv4();
    }
    if (!uuidv4.isValid(data.id)) {
      throw new Error(`'data.id' (${data.id}) is not a valid UUIDv4 string.`);
    }
  }
  static duplicate(data, arrayStore) {
  }
  get _data() {
    return this.#data;
  }
  get id() {
    return this.#data.id;
  }
  toJSON() {
    return this.#data;
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this.#data);
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  _updateSubscribers() {
    const subscriptions = this.#subscriptions;
    const data = this.#data;
    for (let cntr = 0; cntr < subscriptions.length; cntr++) {
      subscriptions[cntr](data);
    }
  }
}
__name(ObjectEntryStore, "ObjectEntryStore");
class ArrayObjectStore {
  #data = [];
  #dataMap = /* @__PURE__ */ new Map();
  #dataReducer;
  #manualUpdate;
  #StoreClass;
  #subscriptions = [];
  #updateSubscribersBound;
  static get EntryStore() {
    return ObjectEntryStore;
  }
  constructor({ StoreClass, defaultData = [], childDebounce = 250, dataReducer = false, manualUpdate = false } = {}) {
    if (!Number.isInteger(childDebounce) || childDebounce < 0 || childDebounce > 1e3) {
      throw new TypeError(`'childDebounce' must be an integer between and including 0 - 1000.`);
    }
    if (typeof manualUpdate !== "boolean") {
      throw new TypeError(`'manualUpdate' is not a boolean.`);
    }
    if (!isWritableStore(StoreClass.prototype)) {
      throw new TypeError(`'StoreClass' is not a writable store constructor.`);
    }
    let hasIDGetter = false;
    for (let o = StoreClass.prototype; o; o = Object.getPrototypeOf(o)) {
      const descriptor = Object.getOwnPropertyDescriptor(o, "id");
      if (descriptor !== void 0 && descriptor.get !== void 0) {
        hasIDGetter = true;
        break;
      }
    }
    if (!hasIDGetter) {
      throw new TypeError(`'StoreClass' does not have a getter accessor for 'id' property.`);
    }
    if (!Array.isArray(defaultData)) {
      throw new TypeError(`'defaultData' is not an array.`);
    }
    this.#manualUpdate = manualUpdate;
    this.#StoreClass = StoreClass;
    if (dataReducer) {
      this.#dataReducer = new DynArrayReducer({ data: this.#data });
    }
    this.#updateSubscribersBound = childDebounce === 0 ? this.updateSubscribers.bind(this) : debounce((data) => this.updateSubscribers(data), childDebounce);
  }
  *[Symbol.iterator]() {
    if (this.#data.length === 0) {
      return;
    }
    for (const entryStore of this.#data) {
      yield entryStore;
    }
  }
  get _data() {
    return this.#data;
  }
  get dataReducer() {
    if (!this.#dataReducer) {
      throw new Error(
        `'dataReducer' is not initialized; did you forget to specify 'dataReducer' as true in constructor options?`
      );
    }
    return this.#dataReducer;
  }
  get length() {
    return this.#data.length;
  }
  clearEntries() {
    for (const storeEntryData of this.#dataMap.values()) {
      storeEntryData.unsubscribe();
    }
    this.#dataMap.clear();
    this.#data.length = 0;
    this.updateSubscribers();
  }
  createEntry(entryData = {}) {
    if (!isObject(entryData)) {
      throw new TypeError(`'entryData' is not an object.`);
    }
    if (typeof entryData.id !== "string") {
      entryData.id = uuidv4();
    }
    if (this.#data.findIndex((entry) => entry.id === entryData.id) >= 0) {
      throw new Error(`'entryData.id' (${entryData.id}) already in this ArrayObjectStore instance.`);
    }
    const store = this.#createStore(entryData);
    this.updateSubscribers();
    return store;
  }
  #createStore(entryData) {
    const store = new this.#StoreClass(entryData, this);
    if (!uuidv4.isValid(store.id)) {
      throw new Error(`'store.id' (${store.id}) is not a UUIDv4 compliant string.`);
    }
    const unsubscribe = subscribeIgnoreFirst(store, this.#updateSubscribersBound);
    this.#data.push(store);
    this.#dataMap.set(entryData.id, { store, unsubscribe });
    return store;
  }
  deleteEntry(id) {
    const result = this.#deleteStore(id);
    if (result) {
      this.updateSubscribers();
    }
    return result;
  }
  #deleteStore(id) {
    if (typeof id !== "string") {
      throw new TypeError(`'id' is not a string.`);
    }
    const storeEntryData = this.#dataMap.get(id);
    if (storeEntryData) {
      storeEntryData.unsubscribe();
      this.#dataMap.delete(id);
      const index = this.#data.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        this.#data.splice(index, 1);
      }
      return true;
    }
    return false;
  }
  duplicateEntry(id) {
    if (typeof id !== "string") {
      throw new TypeError(`'id' is not a string.`);
    }
    const storeEntryData = this.#dataMap.get(id);
    if (storeEntryData) {
      const data = klona(storeEntryData.store.toJSON());
      data.id = uuidv4();
      this.#StoreClass?.duplicate?.(data, this);
      return this.createEntry(data);
    }
    return void 0;
  }
  findEntry(predicate) {
    return this.#data.find(predicate);
  }
  getEntry(id) {
    const storeEntryData = this.#dataMap.get(id);
    return storeEntryData ? storeEntryData.store : void 0;
  }
  set(updateList) {
    if (!Array.isArray(updateList)) {
      console.warn(`ArrayObjectStore.set warning: aborting set operation as 'updateList' is not an array.`);
      return;
    }
    const data = this.#data;
    const dataMap = this.#dataMap;
    const removeIDSet = new Set(dataMap.keys());
    let rebuildIndex = false;
    for (let updateIndex = 0; updateIndex < updateList.length; updateIndex++) {
      const updateData = updateList[updateIndex];
      const id = updateData.id;
      if (typeof id !== "string") {
        throw new Error(`'updateData.id' is not a string.`);
      }
      const localIndex = data.findIndex((entry) => entry.id === id);
      if (localIndex >= 0) {
        const localEntry = data[localIndex];
        localEntry.set(updateData);
        if (localIndex !== updateIndex) {
          data.splice(localIndex, 1);
          if (updateIndex < data.length) {
            data.splice(updateIndex, 0, localEntry);
          } else {
            rebuildIndex = true;
          }
        }
        removeIDSet.delete(id);
      } else {
        this.#createStore(updateData);
      }
    }
    if (rebuildIndex) {
      for (const storeEntryData of dataMap.values()) {
        storeEntryData.unsubscribe();
      }
      data.length = 0;
      dataMap.clear();
      for (const updateData of updateList) {
        this.#createStore(updateData);
      }
    } else {
      for (const id of removeIDSet) {
        this.#deleteStore(id);
      }
    }
    this.updateSubscribers();
  }
  toJSON() {
    return this.#data;
  }
  subscribe(handler) {
    this.#subscriptions.push(handler);
    handler(this.#data);
    return () => {
      const index = this.#subscriptions.findIndex((sub) => sub === handler);
      if (index >= 0) {
        this.#subscriptions.splice(index, 1);
      }
    };
  }
  updateSubscribers(update2) {
    const updateGate = typeof update2 === "boolean" ? update2 : !this.#manualUpdate;
    if (updateGate) {
      const subscriptions = this.#subscriptions;
      const data = this.#data;
      for (let cntr = 0; cntr < subscriptions.length; cntr++) {
        subscriptions[cntr](data);
      }
    }
    if (this.#dataReducer) {
      this.#dataReducer.index.update(true);
    }
  }
}
__name(ArrayObjectStore, "ArrayObjectStore");
async function createFolderWithActors(folderName, actorNames) {
  let folder = game.folders?.getName(folderName);
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      type: "Actor",
      color: "#646cdd",
      parent: null
    });
  }
  const folderId = folder.id;
  const monsterPack = game.packs.get("dnd5e.monsters");
  if (!monsterPack)
    return [];
  const actors = [];
  for (const name of actorNames) {
    const creature = await monsterPack.getDocuments({ "name": name });
    if (!creature.length)
      continue;
    actors.push(await Actor.create({
      ...creature[0].toObject(),
      folder: folderId
    }));
  }
  return actors;
}
__name(createFolderWithActors, "createFolderWithActors");
function checkModules() {
  let error = false;
  if (!game.modules.get("jb2a_patreon")?.active) {
    let installed = game.modules.get("jb2a_patreon") && !game.modules.get("jb2a_patreon").active ? "enabled" : "installed";
    error = `You need to have the JB2A Patreon module ${installed} to cast this spell!`;
  }
  if (!game.modules.get("socketlib")?.active) {
    let installed = game.modules.get("socketlib") && !game.modules.get("socketlib").active ? "enabled" : "installed";
    error = `You need to have SocketLib ${installed} to cast this spell!`;
  }
  if (!game.modules.get("tagger")?.active) {
    let installed = game.modules.get("tagger") && !game.modules.get("tagger").active ? "enabled" : "installed";
    error = `You need to have Tagger${installed} to cast this spell!`;
  }
  if (!game.modules.get("sequencer")?.active) {
    let installed = game.modules.get("sequencer") && !game.modules.get("sequencer").active ? "enabled" : "installed";
    error = `You need to have Sequencer ${installed} to cast this spell!`;
  }
  if (!game.modules.get("warpgate")?.active) {
    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
    error = `You need to have Warpgate ${installed} to cast this spell!`;
  }
  return error;
}
__name(checkModules, "checkModules");
function getDistanceClassic(pointA, pointB) {
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
}
__name(getDistanceClassic, "getDistanceClassic");
function measureDistance(pointA, pointB) {
  const ray = new Ray({ x: pointA.x, y: pointA.y }, { x: pointB.x, y: pointB.y });
  const segments = [{ ray }];
  let dist = canvas.grid.measureDistances(segments, { gridSpaces: true })[0];
  return dist;
}
__name(measureDistance, "measureDistance");
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
__name(getRandomInt, "getRandomInt");
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
__name(componentToHex, "componentToHex");
function rgbToHex(r, g, b) {
  return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
__name(rgbToHex, "rgbToHex");
function getRandomColor(type) {
  let color = rgbToHex(getRandomInt(0, 155), getRandomInt(0, 155), getRandomInt(0, 155));
  if (type == "0x") {
    return color;
  } else if (type == "#") {
    return "#" + color.substring(2);
  }
  return color;
}
__name(getRandomColor, "getRandomColor");
function convertColorHexTo0x(color) {
  return "0x" + color.substring(1);
}
__name(convertColorHexTo0x, "convertColorHexTo0x");
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
__name(capitalizeFirstLetter, "capitalizeFirstLetter");
function getCenter(pos, width = 1) {
  return { x: pos.x + canvas.grid.size / 2 * width, y: pos.y + canvas.grid.size / 2 * width };
}
__name(getCenter, "getCenter");
function getTileCenter(tile) {
  return { x: tile.x + tile.width / 2, y: tile.y + tile.height / 2 };
}
__name(getTileCenter, "getTileCenter");
function convertDuration(itemDuration, inCombat) {
  const useTurns = inCombat && game.modules.get("times-up")?.active;
  if (!itemDuration)
    return { type: "seconds", seconds: 0, rounds: 0, turns: 0 };
  if (!game.modules.get("times-up")?.active) {
    switch (itemDuration.units) {
      case "turn":
      case "turns":
        return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
      case "round":
      case "rounds":
        return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
      case "second":
      case "seconds":
        return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
      case "minute":
      case "minutes":
        let durSeconds = itemDuration.value * 60;
        if (durSeconds / CONFIG.time.roundTime <= 10) {
          return { type: useTurns ? "turns" : "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
        } else {
          return { type: "seconds", seconds: durSeconds, rounds: durSeconds / CONFIG.time.roundTime, turns: 0 };
        }
      case "hour":
      case "hours":
        return { type: "seconds", seconds: itemDuration.value * 60 * 60, rounds: 0, turns: 0 };
      case "day":
      case "days":
        return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24, rounds: 0, turns: 0 };
      case "week":
      case "weeks":
        return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 7, rounds: 0, turns: 0 };
      case "month":
      case "months":
        return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30, rounds: 0, turns: 0 };
      case "year":
      case "years":
        return { type: "seconds", seconds: itemDuration.value * 60 * 60 * 24 * 30 * 365, rounds: 0, turns: 0 };
      case "inst":
        return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: 1 };
      default:
        console.warn("dae | unknown time unit found", itemDuration.units);
        return { type: useTurns ? "none" : "seconds", seconds: void 0, rounds: void 0, turns: void 0 };
    }
  } else {
    switch (itemDuration.units) {
      case "turn":
      case "turns":
        return { type: useTurns ? "turns" : "seconds", seconds: 1, rounds: 0, turns: itemDuration.value };
      case "round":
      case "rounds":
        return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value * CONFIG.time.roundTime, rounds: itemDuration.value, turns: 0 };
      case "second":
        return { type: useTurns ? "turns" : "seconds", seconds: itemDuration.value, rounds: itemDuration.value / CONFIG.time.roundTime, turns: 0 };
      default:
        let interval = {};
        interval[itemDuration.units] = itemDuration.value;
        const durationSeconds = window.SimpleCalendar.api.timestampPlusInterval(game.time.worldTime, interval) - game.time.worldTime;
        if (durationSeconds / CONFIG.time.roundTime <= 10) {
          return { type: useTurns ? "turns" : "seconds", seconds: durationSeconds, rounds: Math.floor(durationSeconds / CONFIG.time.roundTime), turns: 0 };
        } else {
          return { type: "seconds", seconds: durationSeconds, rounds: Math.floor(durationSeconds / CONFIG.time.roundTime), turns: 0 };
        }
    }
  }
}
__name(convertDuration, "convertDuration");
function getSelfTarget(actor) {
  if (actor.token)
    return actor.token;
  const speaker = ChatMessage.getSpeaker({ actor });
  if (speaker.token)
    return canvas.tokens?.get(speaker.token);
  return new CONFIG.Token.documentClass(actor.getTokenData(), { actor });
}
__name(getSelfTarget, "getSelfTarget");
function getAllItemsNamed(name) {
  let actors = game.actors.contents;
  let scenes = game.scenes.contents;
  let itemsWithName = [];
  for (let actor of actors) {
    let items = actor.items.filter((item) => item.name == name && item.data.flags.advancedspelleffects?.enableASE);
    items.forEach((item) => {
      itemsWithName.push(item);
    });
  }
  for (let scene of scenes) {
    let tokensInScene = Array.from(scene.tokens);
    tokensInScene.forEach((token) => {
      let items = token.actor.items.filter((item) => item.name == name && item.data.flags.advancedspelleffects?.enableASE);
      items.forEach((item) => {
        itemsWithName.push(item);
      });
    });
  }
  return itemsWithName;
}
__name(getAllItemsNamed, "getAllItemsNamed");
function firstGM() {
  return game.users.find((u) => u.isGM && u.active);
}
__name(firstGM, "firstGM");
function isFirstGM() {
  return game.user.id === firstGM()?.id;
}
__name(isFirstGM, "isFirstGM");
function getDBOptions(rawSet) {
  let returnData = [];
  let tempObj = {};
  let setOptions = Sequencer.Database.getPathsUnder(rawSet);
  if (setOptions) {
    setOptions.forEach((elem) => {
      tempObj = {};
      tempObj[elem] = capitalizeFirstLetter(elem);
      returnData.push(tempObj);
    });
  }
  return returnData;
}
__name(getDBOptions, "getDBOptions");
function getDBOptionsIcons(rawSet) {
  let returnData = [];
  let tempObj = {};
  const seqFiles = Sequencer.Database.getEntry(rawSet);
  if (seqFiles.length > 0) {
    seqFiles.forEach((elem) => {
      tempObj = {};
      tempObj[elem.dbPath] = elem.dbPath.substring(10);
      returnData.push(tempObj);
    });
  }
  return returnData;
}
__name(getDBOptionsIcons, "getDBOptionsIcons");
function isMidiActive() {
  if (game.modules.get("midi-qol")?.active) {
    return true;
  }
  return false;
}
__name(isMidiActive, "isMidiActive");
function getContainedCustom(tokenD, crosshairs) {
  let tokenCenter = getCenter(tokenD.data, tokenD.data.width);
  let tokenCrosshairsDist = canvas.grid.measureDistance(tokenCenter, crosshairs);
  let crosshairsDistance = crosshairs.data?.distance ?? crosshairs.distance;
  let distanceRequired = crosshairsDistance - 2.5 + 2.5 * tokenD.data.width;
  if (tokenCrosshairsDist < distanceRequired) {
    return true;
  } else {
    return false;
  }
}
__name(getContainedCustom, "getContainedCustom");
async function checkCrosshairs(crosshairs) {
  let collected;
  while (crosshairs.inFlight) {
    await warpgate.wait(100);
    collected = warpgate.crosshairs.collect(crosshairs, ["Token"], getContainedCustom)["Token"];
    let tokensOutOfRange = canvas.tokens.placeables.filter((token) => {
      return !collected.find((t) => t.id === token.id);
    });
    crosshairs.label = `${collected.length} targets`;
    for await (let tokenD of collected) {
      let token = canvas.tokens.get(tokenD.id);
      let markerEffect = "jb2a.ui.indicator.red.01.01";
      let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${token.id}` });
      if (markerApplied.length == 0) {
        new Sequence().effect().file(markerEffect).atLocation(token).scale(0.5).offset({ y: 100 }).mirrorY().persist().name(`ase-crosshairs-marker-${token.id}`).play();
      }
    }
    for await (let token of tokensOutOfRange) {
      let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${token.id}` });
      if (markerApplied.length > 0) {
        Sequencer.EffectManager.endEffects({ name: `ase-crosshairs-marker-${token.id}` });
      }
    }
  }
}
__name(checkCrosshairs, "checkCrosshairs");
function cleanUpTemplateGridHighlights() {
  const ASETemplates = canvas.scene?.templates.filter((template) => {
    return template.data.flags.advancedspelleffects;
  }) ?? [];
  for (let template of ASETemplates) {
    const highlight = canvas.grid.getHighlightLayer(`Template.${template.id}`);
    if (highlight) {
      highlight.clear();
    }
  }
}
__name(cleanUpTemplateGridHighlights, "cleanUpTemplateGridHighlights");
function lineCrossesLine(a, b, c, d) {
  const aSide = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x) > 0;
  const bSide = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x) > 0;
  const cSide = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
  const dSide = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x) > 0;
  return aSide !== bSide && cSide !== dSide;
}
__name(lineCrossesLine, "lineCrossesLine");
function lineCrossesCircle(pointA, pointB, circleCenter, radius) {
  const x = circleCenter.x;
  const y = circleCenter.y;
  const x1 = pointA.x;
  const y1 = pointA.y;
  const x2 = pointB.x;
  const y2 = pointB.y;
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    param = dot / len_sq;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  let dx = x - xx;
  let dy = y - yy;
  let distanceToLine = Math.sqrt(dx * dx + dy * dy);
  return distanceToLine < radius && (Math.abs(x - x1) > radius || Math.abs(y - y1) > radius || Math.abs(x - x2) > radius || Math.abs(y - y2) > radius);
}
__name(lineCrossesCircle, "lineCrossesCircle");
function isPointOnLeft(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
}
__name(isPointOnLeft, "isPointOnLeft");
function isPointNearLine(linePointA, linePointB, checkPoint, range) {
  const x = checkPoint.x;
  const y = checkPoint.y;
  const x1 = linePointA.x;
  const y1 = linePointA.y;
  const x2 = linePointB.x;
  const y2 = linePointB.y;
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    param = dot / len_sq;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  let dx = x - xx;
  let dy = y - yy;
  let distanceToLine = Math.sqrt(dx * dx + dy * dy);
  return distanceToLine <= range;
}
__name(isPointNearLine, "isPointNearLine");
function isPointInCircle(circleCenter, checkPoint, insideRange, outsideRange) {
  const x = circleCenter.x;
  const y = circleCenter.y;
  const x1 = checkPoint.x;
  const y1 = checkPoint.y;
  let dx = x - x1;
  let dy = y - y1;
  let distanceToPoint = Math.sqrt(dx * dx + dy * dy);
  return distanceToPoint > insideRange && distanceToPoint < outsideRange;
}
__name(isPointInCircle, "isPointInCircle");
var aseSocket = void 0;
function setupASESocket() {
  if (game.modules.get("socketlib")?.active) {
    aseSocket = window.socketlib.registerModule("advancedspelleffects");
    aseSocket.register("placeTiles", placeTiles);
    aseSocket.register("placeWalls", placeWalls);
    aseSocket.register("deleteTiles", deleteTiles);
    aseSocket.register("deleteTemplates", deleteTemplates);
    aseSocket.register("updateFlag", updateFlag);
    aseSocket.register("removeFlag", removeFlag);
    aseSocket.register("moveWalls", moveWalls);
    aseSocket.register("moveTile", moveTile);
    aseSocket.register("fadeTile", fadeTile);
    aseSocket.register("placeSounds", placeSounds);
    aseSocket.register("moveSound", moveSound);
    aseSocket.register("updateDocument", updateDocument);
    aseSocket.register("updateDocuments", updateDocuments);
    aseSocket.register("checkGMAlwaysAccept", checkGMAlwaysAccept);
    aseSocket.register("createGMChat", createGMChat);
  }
}
__name(setupASESocket, "setupASESocket");
async function createGMChat(data) {
  let gm = firstGM();
  await ChatMessage.create({ content: data.content, whisper: ChatMessage.getWhisperRecipients(gm.name) });
  await ui.chat.scrollBottom();
  return;
}
__name(createGMChat, "createGMChat");
async function checkGMAlwaysAccept() {
  const alwaysAccept = game.settings.get("warpgate", "alwaysAccept");
  console.log("GM Always Accept: ", alwaysAccept);
  if (!alwaysAccept) {
    ui.notifications.info("Warpgate 'Always Accept' is disabled. You must manually accept the mutation.");
  }
}
__name(checkGMAlwaysAccept, "checkGMAlwaysAccept");
async function updateDocument(objectId, updateData) {
  let object = canvas.scene.tiles.get(objectId) || canvas.scene.tokens.get(objectId) || canvas.scene.drawings.get(objectId) || canvas.scene.walls.get(objectId) || canvas.scene.lights.get(objectId) || game.scenes.get(objectId) || game.users.get(objectId) || game.actors.get(objectId);
  if (object) {
    await object.update(updateData, { animate: false });
  }
}
__name(updateDocument, "updateDocument");
async function updateDocuments(objectType = "", updateData) {
  if (updateData.length > 0 && objectType != "") {
    await canvas.scene.updateEmbeddedDocuments(objectType, updateData);
  }
}
__name(updateDocuments, "updateDocuments");
async function updateFlag(objectId, flag, value) {
  let object = canvas.scene.tiles.get(objectId) || canvas.scene.tokens.get(objectId) || canvas.scene.drawings.get(objectId) || canvas.scene.walls.get(objectId) || canvas.scene.lights.get(objectId) || game.scenes.get(objectId) || game.users.get(objectId);
  if (object) {
    await object.setFlag("advancedspelleffects", flag, value);
  }
}
__name(updateFlag, "updateFlag");
async function removeFlag(objectId, flag) {
  let object = canvas.scene.tiles.get(objectId) || canvas.scene.tokens.get(objectId) || canvas.scene.drawings.get(objectId) || canvas.scene.walls.get(objectId) || canvas.scene.lights.get(objectId) || game.scenes.get(objectId) || game.users.get(objectId);
  if (object) {
    await object.unsetFlag("advancedspelleffects", flag);
  }
}
__name(removeFlag, "removeFlag");
async function placeTiles(tileData) {
  return await canvas.scene.createEmbeddedDocuments("Tile", tileData);
}
__name(placeTiles, "placeTiles");
async function deleteTiles(tileIds) {
  await canvas.scene.deleteEmbeddedDocuments("Tile", tileIds);
}
__name(deleteTiles, "deleteTiles");
async function deleteTemplates(tileIds) {
  await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", tileIds);
}
__name(deleteTemplates, "deleteTemplates");
async function moveTile(newLocation, tileId) {
  let tile = canvas.scene.tiles.get(tileId);
  const distance = getDistanceClassic({ x: tile.data.x + canvas.grid.size, y: tile.data.y + canvas.grid.size }, { x: newLocation.x, y: newLocation.y });
  const moveSpeed = Math.floor(distance / 50);
  let moveTileSeq = new Sequence("Advanced Spell Effects").animation().on(tile).moveTowards(newLocation, { ease: "easeInOutQuint" }).offset({ x: -canvas.grid.size, y: -canvas.grid.size }).moveSpeed(moveSpeed);
  await moveTileSeq.play();
}
__name(moveTile, "moveTile");
async function fadeTile(fade, tileId) {
  let tile = canvas.scene.tiles.get(tileId);
  if (!tile) {
    ui.notifications.error(game.i18n.localize("ASE.TileNotFound"));
    return;
  }
  let fadeTileSeq = new Sequence("Advanced Spell Effects").animation().on(tile);
  if (fade.type == "fadeIn") {
    fadeTileSeq.fadeIn(fade.duration);
  } else if (fade.type == "fadeOut") {
    fadeTileSeq.fadeOut(fade.duration);
  }
  await fadeTileSeq.play();
}
__name(fadeTile, "fadeTile");
async function placeWalls(wallData) {
  return await canvas.scene.createEmbeddedDocuments("Wall", wallData);
}
__name(placeWalls, "placeWalls");
async function moveWalls(tileId, wallType, numWalls) {
  let tileD = canvas.scene.tiles.get(tileId) ?? canvas.scene.templates.get(tileId);
  let placedX = tileD.data.x + tileD.data.width / 2;
  let placedY = tileD.data.y + tileD.data.height / 2;
  let outerCircleRadius = tileD.data.width / 2.2;
  let wall_angles = 2 * Math.PI / numWalls;
  let walls = [];
  let wallDocuments = [];
  let wallPoints = [];
  walls = await Tagger.getByTag([`${wallType}Wall-${tileD.id}`]);
  walls.forEach((wall) => {
    wallDocuments.push(wall.id);
  });
  walls = [];
  if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
    await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
    for (let i = 0; i < numWalls; i++) {
      let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
      let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
      wallPoints.push({ x, y });
    }
    for (let i = 0; i < wallPoints.length; i++) {
      if (i < wallPoints.length - 1) {
        walls.push({
          c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
          flags: { tagger: { tags: [`${wallType}Wall-${tileD.id}`] } },
          move: 0
        });
      } else {
        walls.push({
          c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
          flags: { tagger: { tags: [`${wallType}Wall-${tileD.id}`] } },
          move: 0
        });
      }
    }
  }
  await canvas.scene.createEmbeddedDocuments("Wall", walls);
}
__name(moveWalls, "moveWalls");
async function placeSounds(soundData, delay) {
  await warpgate.wait(delay);
  return await canvas.scene.createEmbeddedDocuments("AmbientSound", soundData);
}
__name(placeSounds, "placeSounds");
async function moveSound(sourceId, newLoc) {
  let source = canvas.scene.tiles.get(sourceId) || canvas.scene.tokens.get(sourceId);
  if (!source) {
    ui.notifications.error(game.i18n.localize("ASE.SoundSourceNotFound"));
    return;
  }
  if (source.getFlag("advancedspelleffects", "moving")) {
    return;
  }
  const attachedSounds = await Tagger.getByTag([`ase-source-${sourceId}`]);
  if (!attachedSounds.length > 0) {
    ui.notifications.error(game.i18n.localize("ASE.SoundNotFound"));
    return;
  }
  const oldSoundData = attachedSounds[0].data;
  source.data.hitArea?.width || source.data.width;
  source.data.hitArea?.height || source.data.height;
  const newSoundData = [{
    easing: oldSoundData.easing,
    path: oldSoundData.path,
    radius: oldSoundData.radius,
    type: oldSoundData.type,
    volume: oldSoundData.volume,
    x: newLoc.x,
    y: newLoc.y,
    flags: oldSoundData.flags
  }];
  if (oldSoundData.x != newSoundData[0].x || oldSoundData.y != newSoundData[0].y) {
    await canvas.scene.createEmbeddedDocuments("AmbientSound", newSoundData);
    if (canvas.scene.getEmbeddedDocument("AmbientSound", attachedSounds[0].id)) {
      await canvas.scene.deleteEmbeddedDocuments("AmbientSound", attachedSounds.map((s) => s.id));
    }
  }
}
__name(moveSound, "moveSound");
async function AnimateDeadSequence(effectSettings, token, summonTokenData) {
  console.log("ASE Animate Dead Sequence: ", effectSettings);
  const colorA = effectSettings.effectAColor ?? "green";
  const soundA = effectSettings.effectASound ?? "";
  const soundADelay = Number(effectSettings.effectASoundDelay) ?? 0;
  const soundAVolume = effectSettings.effectASoundVolume == "" ? 1 : Number(effectSettings.effectASoundVolume);
  const colorB = effectSettings.effectBColor;
  const soundB = effectSettings.effectBSound ?? "";
  const soundBDelay = Number(effectSettings.effectBSoundDelay) ?? 0;
  const soundBVolume = effectSettings.effectBSoundVolume == "" ? 1 : Number(effectSettings.effectBSoundVolume);
  const schoolName = effectSettings.magicSchool;
  const schoolColor = effectSettings.magicSchoolColor;
  const schoolSound = effectSettings.magicSchoolSound ?? "";
  const SchoolSoundDelay = Number(effectSettings.magicSchoolSoundDelay) ?? 0;
  const schoolVolume = effectSettings.magicSchoolVolume == "" ? 1 : Number(effectSettings.magicSchoolVolume);
  const schoolSoundOutro = effectSettings.magicSchoolSoundOutro ?? "";
  const schoolSoundDelayOutro = Number(effectSettings.magicSchoolSoundDelayOutro) ?? 0;
  const schoolVolumeOutro = effectSettings.magicSchoolVolumeOutro == "" ? 1 : Number(effectSettings.magicSchoolVolumeOutro);
  let animLoc = getCenter(token);
  let portalAnimIntro = `jb2a.magic_signs.circle.02.${schoolName}.intro.${schoolColor}`;
  let portalAnimLoop = `jb2a.magic_signs.circle.02.${schoolName}.loop.${schoolColor}`;
  let portalAnimOutro = `jb2a.magic_signs.circle.02.${schoolName}.outro.${schoolColor}`;
  let effectAAnim = `jb2a.eldritch_blast.${colorA}.05ft`;
  let effectBAnim = `jb2a.energy_strands.complete.${colorB}.01`;
  let returnSeq = new Sequence("Advanced Spell Effects").sound().file(schoolSound).delay(SchoolSoundDelay).volume(schoolVolume).playIf(schoolSound != "").effect().file(portalAnimIntro).atLocation(animLoc).belowTokens().scale(0.25).waitUntilFinished(-2e3).effect().file(portalAnimLoop).atLocation(animLoc).belowTokens().scale(0.25).persist().fadeOut(750, { ease: "easeInQuint" }).name("portalAnimLoop").sound().file(soundA).delay(soundADelay).volume(soundAVolume).playIf(soundA != "").effect().file(effectAAnim).atLocation(animLoc).waitUntilFinished(-1e3).endTime(3300).playbackRate(0.7).scaleOut(0, 500).scale(1.5).zIndex(1).center().sound().file(soundB).delay(soundBDelay).volume(soundBVolume).playIf(soundB != "").effect().file(effectBAnim).atLocation(animLoc).zIndex(1).scale(0.4).fadeOut(500).scaleIn(0, 1e3, { ease: "easeInOutBack" }).waitUntilFinished(-1500).thenDo(async () => {
    try {
      let corpseDoc = token.document;
      let summonActorData = game.actors.get(summonTokenData.actorId).data.toObject();
      delete summonActorData._id;
      const sheet = token.actor.sheet;
      await token.actor.sheet.close();
      token.actor._sheet = null;
      delete token.actor.apps[sheet.appId];
      let mutateUpdates = { token: summonTokenData, actor: summonActorData };
      await aseSocket.executeAsGM("checkGMAlwaysAccept");
      await warpgate.mutate(corpseDoc, mutateUpdates);
    } catch (err) {
      console.log(err);
    }
  }).sound().file(schoolSoundOutro).delay(schoolSoundDelayOutro).volume(schoolVolumeOutro).playIf(schoolSoundOutro != "").effect().file(portalAnimOutro).atLocation(animLoc).belowTokens().scale(0.25).thenDo(async () => {
    await Sequencer.EffectManager.endEffects({ name: "portalAnimLoop" });
  });
  return returnSeq;
}
__name(AnimateDeadSequence, "AnimateDeadSequence");
function get_each_context$8(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  return child_ctx;
}
__name(get_each_context$8, "get_each_context$8");
function create_each_block$8(key_1, ctx) {
  let tr;
  let td0;
  let img;
  let img_src_value;
  let t0;
  let t1_value = ctx[11].name + "";
  let t1;
  let t2;
  let td1;
  let button0;
  let t3_value = localize("ASE.ZombieLabel") + "";
  let t3;
  let button0_id_value;
  let t4;
  let td2;
  let button1;
  let t5_value = localize("ASE.SkeletonLabel") + "";
  let t5;
  let button1_id_value;
  let t6;
  let tr_id_value;
  let mounted;
  let dispose;
  return {
    key: key_1,
    first: null,
    c() {
      tr = element("tr");
      td0 = element("td");
      img = element("img");
      t0 = text(" -\r\n                                    ");
      t1 = text(t1_value);
      t2 = space();
      td1 = element("td");
      button0 = element("button");
      t3 = text(t3_value);
      t4 = space();
      td2 = element("td");
      button1 = element("button");
      t5 = text(t5_value);
      t6 = space();
      if (!src_url_equal(img.src, img_src_value = ctx[11].data.img))
        attr(img, "src", img_src_value);
      attr(img, "width", "30");
      attr(img, "height", "30");
      set_style(img, "border", "0px");
      attr(img, "alt", "Token");
      attr(button0, "id", button0_id_value = ctx[11].id + "-zombie");
      attr(button1, "id", button1_id_value = ctx[11].id + "-skeleton");
      attr(tr, "class", "corpseToken");
      attr(tr, "id", tr_id_value = ctx[11].id);
      this.first = tr;
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, img);
      append(td0, t0);
      append(td0, t1);
      append(tr, t2);
      append(tr, td1);
      append(td1, button0);
      append(button0, t3);
      append(tr, t4);
      append(tr, td2);
      append(td2, button1);
      append(button1, t5);
      append(tr, t6);
      if (!mounted) {
        dispose = [
          listen(button0, "click", function() {
            if (is_function(ctx[4](ctx[11], "zombie")))
              ctx[4](ctx[11], "zombie").apply(this, arguments);
          }),
          listen(button1, "click", function() {
            if (is_function(ctx[4](ctx[11], "skeleton")))
              ctx[4](ctx[11], "skeleton").apply(this, arguments);
          }),
          listen(tr, "mouseenter", function() {
            if (is_function(ctx[11]._onHoverIn()))
              ctx[11]._onHoverIn().apply(this, arguments);
          }),
          listen(tr, "mouseleave", function() {
            if (is_function(ctx[11]._onHoverOut()))
              ctx[11]._onHoverOut().apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && !src_url_equal(img.src, img_src_value = ctx[11].data.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 2 && t1_value !== (t1_value = ctx[11].name + ""))
        set_data(t1, t1_value);
      if (dirty & 2 && button0_id_value !== (button0_id_value = ctx[11].id + "-zombie")) {
        attr(button0, "id", button0_id_value);
      }
      if (dirty & 2 && button1_id_value !== (button1_id_value = ctx[11].id + "-skeleton")) {
        attr(button1, "id", button1_id_value);
      }
      if (dirty & 2 && tr_id_value !== (tr_id_value = ctx[11].id)) {
        attr(tr, "id", tr_id_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_each_block$8, "create_each_block$8");
function create_default_slot$2(ctx) {
  let form_1;
  let section;
  let p;
  let t0_value = localize("ASE.AnimateDeadDialogRaiseMessage") + "";
  let t0;
  let t1;
  let t2;
  let t3;
  let table;
  let tbody;
  let tr;
  let th0;
  let t5;
  let th1;
  let t7;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let mounted;
  let dispose;
  let each_value = ctx[1];
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[11].id, "get_key");
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$8(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
  }
  return {
    c() {
      form_1 = element("form");
      section = element("section");
      p = element("p");
      t0 = text(t0_value);
      t1 = space();
      t2 = text(ctx[2]);
      t3 = space();
      table = element("table");
      tbody = element("tbody");
      tr = element("tr");
      th0 = element("th");
      th0.textContent = `${localize("ASE.AnimateDeadDialogHeaderCorpse")}`;
      t5 = space();
      th1 = element("th");
      th1.textContent = `${localize("ASE.AnimateDeadDialogHeaderRaise")}`;
      t7 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(table, "width", "100%");
      attr(section, "class", "content");
      attr(form_1, "autocomplete", "off");
      attr(form_1, "id", "animte-dead-shell");
      attr(form_1, "class", "overview");
    },
    m(target, anchor) {
      insert(target, form_1, anchor);
      append(form_1, section);
      append(section, p);
      append(p, t0);
      append(p, t1);
      append(p, t2);
      append(section, t3);
      append(section, table);
      append(table, tbody);
      append(tbody, tr);
      append(tr, th0);
      append(tr, t5);
      append(tr, th1);
      append(tbody, t7);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
      ctx[8](form_1);
      if (!mounted) {
        dispose = listen(form_1, "submit", prevent_default(ctx[7]));
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 4)
        set_data(t2, ctx2[2]);
      if (dirty & 18) {
        each_value = ctx2[1];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, tbody, destroy_block, create_each_block$8, null, get_each_context$8);
      }
    },
    d(detaching) {
      if (detaching)
        detach(form_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[8](null);
      mounted = false;
      dispose();
    }
  };
}
__name(create_default_slot$2, "create_default_slot$2");
function create_fragment$a(ctx) {
  let applicationshell;
  let updating_elementRoot;
  let current;
  function applicationshell_elementRoot_binding(value) {
    ctx[9](value);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  let applicationshell_props = {
    $$slots: { default: [create_default_slot$2] },
    $$scope: { ctx }
  };
  if (ctx[0] !== void 0) {
    applicationshell_props.elementRoot = ctx[0];
  }
  applicationshell = new ApplicationShell({ props: applicationshell_props });
  binding_callbacks.push(() => bind(applicationshell, "elementRoot", applicationshell_elementRoot_binding));
  return {
    c() {
      create_component(applicationshell.$$.fragment);
    },
    m(target, anchor) {
      mount_component(applicationshell, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const applicationshell_changes = {};
      if (dirty & 16398) {
        applicationshell_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_elementRoot && dirty & 1) {
        updating_elementRoot = true;
        applicationshell_changes.elementRoot = ctx2[0];
        add_flush_callback(() => updating_elementRoot = false);
      }
      applicationshell.$set(applicationshell_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(applicationshell.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(applicationshell.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(applicationshell, detaching);
    }
  };
}
__name(create_fragment$a, "create_fragment$a");
function instance$a($$self, $$props, $$invalidate) {
  let { elementRoot } = $$props;
  let { corpses } = $$props;
  let { raiseLimit } = $$props;
  let { effectSettings } = $$props;
  let raisesLeft = raiseLimit;
  const { application } = getContext("external");
  let form = void 0;
  console.log("Animate Dead App Shell: ------ Entering App Shell -------");
  console.log("Animate Dead App Shell: corpses: ", corpses);
  console.log("Animate Dead App Shell: raiseLimit: ", raiseLimit);
  console.log("Animate Dead App Shell: effectSettings: ", effectSettings);
  onDestroy(async () => {
    console.log("the component is being destroyed...");
  });
  async function raiseCorpse(corpse, type) {
    console.log(`Animate Dead App Shell: Raising ${corpse.name ?? "body"}as ${type}: `, corpse);
    $$invalidate(2, raisesLeft--, raisesLeft);
    corpses.splice(corpses.indexOf(corpse), 1);
    $$invalidate(1, corpses);
    let zombieTokenData = (await game.actors.get(effectSettings.zombieActor).getTokenData()).toObject();
    let skeletonTokenData = (await game.actors.get(effectSettings.skeletonActor).getTokenData()).toObject();
    if (!zombieTokenData || !skeletonTokenData) {
      ui.notifications.error(game.i18n.localize("ASE.AssociatedActorNotFoundNotification"));
      console.log("Animate Dead App Shell: ERROR: Zombie or Skeleton Token Data not found!, Check spell Settings to ensure the actors are set up");
      if (raisesLeft <= 0 || corpses.length == 0) {
        console.log("Animate Dead App Shell: All raises used up, closing app...");
        application.close();
      }
      return;
    }
    delete zombieTokenData.x;
    delete zombieTokenData.y;
    delete skeletonTokenData.x;
    delete skeletonTokenData.y;
    zombieTokenData = mergeObject(corpse.data.toObject(), zombieTokenData, { inplace: false });
    skeletonTokenData = mergeObject(corpse.data.toObject(), skeletonTokenData, { inplace: false });
    let effectSequence;
    switch (type) {
      case "zombie":
        effectSequence = await AnimateDeadSequence(effectSettings, corpse, zombieTokenData);
        break;
      case "skeleton":
        effectSequence = await AnimateDeadSequence(effectSettings, corpse, skeletonTokenData);
        break;
    }
    console.log("Animate Dead App Shell: effectSequence: ", effectSequence);
    effectSequence.play();
    if (raisesLeft <= 0 || corpses.length == 0) {
      console.log("Animate Dead App Shell: All raises used up, closing app...");
      application.close();
    }
  }
  __name(raiseCorpse, "raiseCorpse");
  function submit_handler(event) {
    bubble.call(this, $$self, event);
  }
  __name(submit_handler, "submit_handler");
  function form_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      form = $$value;
      $$invalidate(3, form);
    });
  }
  __name(form_1_binding, "form_1_binding");
  function applicationshell_elementRoot_binding(value) {
    elementRoot = value;
    $$invalidate(0, elementRoot);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  $$self.$$set = ($$props2) => {
    if ("elementRoot" in $$props2)
      $$invalidate(0, elementRoot = $$props2.elementRoot);
    if ("corpses" in $$props2)
      $$invalidate(1, corpses = $$props2.corpses);
    if ("raiseLimit" in $$props2)
      $$invalidate(5, raiseLimit = $$props2.raiseLimit);
    if ("effectSettings" in $$props2)
      $$invalidate(6, effectSettings = $$props2.effectSettings);
  };
  return [
    elementRoot,
    corpses,
    raisesLeft,
    form,
    raiseCorpse,
    raiseLimit,
    effectSettings,
    submit_handler,
    form_1_binding,
    applicationshell_elementRoot_binding
  ];
}
__name(instance$a, "instance$a");
class AnimateDeadAppShell extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {
      elementRoot: 0,
      corpses: 1,
      raiseLimit: 5,
      effectSettings: 6
    });
  }
  get elementRoot() {
    return this.$$.ctx[0];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
  get corpses() {
    return this.$$.ctx[1];
  }
  set corpses(corpses) {
    this.$$set({ corpses });
    flush();
  }
  get raiseLimit() {
    return this.$$.ctx[5];
  }
  set raiseLimit(raiseLimit) {
    this.$$set({ raiseLimit });
    flush();
  }
  get effectSettings() {
    return this.$$.ctx[6];
  }
  set effectSettings(effectSettings) {
    this.$$set({ effectSettings });
    flush();
  }
}
__name(AnimateDeadAppShell, "AnimateDeadAppShell");
class AnimateDeadDialog extends SvelteApplication {
  constructor(data) {
    super({
      title: localize("ASE.AnimateDead"),
      id: "animate-dead-dialog",
      zIndex: 102,
      svelte: {
        class: AnimateDeadAppShell,
        target: document.body,
        props: {
          corpses: data.corpses,
          raiseLimit: data.raiseLimit,
          effectSettings: data.effectSettings
        }
      }
    });
    console.log("ASE: Launching Animate Dead Dialog!", data);
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizable: true,
      minimizable: true,
      width: "auto",
      height: "auto",
      closeOnSubmit: true
    });
  }
}
__name(AnimateDeadDialog, "AnimateDeadDialog");
class darkness {
  static registerHooks() {
    if (!game.user.isGM)
      return;
    Hooks.on("updateTile", darkness._updateTile);
    Hooks.on("deleteTile", darkness._deleteTile);
  }
  static async _updateTile(tileD) {
    await aseSocket.executeAsGM("moveWalls", tileD.id, "Darkness", 12);
  }
  static async _deleteTile(tileD) {
    let walls = [];
    let wallDocuments = [];
    walls = await Tagger.getByTag([`DarknessWall-${tileD.id}`]);
    walls.forEach((wall) => {
      wallDocuments.push(wall.id);
    });
    if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
      await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
    }
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let darknessTiles = await Tagger.getByTag(`DarknessTile-${casterActor.id}`);
    if (darknessTiles.length > 0) {
      aseSocket.executeAsGM("deleteTiles", [darknessTiles[0].id]);
    }
  }
  static async createDarkness(midiData) {
    const item = midiData.item;
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().file("jb2a.darkness.black").attachTo(crosshairs).persist().opacity(0.5).play();
    }, "displayCrosshairs");
    let crosshairsConfig = {
      size: 6,
      icon: item.img,
      label: game.i18n.localize("ASE.Darkness"),
      tag: "darkness-crosshairs",
      drawIcon: true,
      drawOutline: false,
      interval: 1
    };
    let template = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
    const caster2 = await canvas.tokens.get(midiData.tokenId);
    const casterActor = caster2.actor;
    const effectOptions = item.getFlag("advancedspelleffects", "effectOptions");
    const sound = effectOptions.darknessSound ?? "";
    const soundDelay = Number(effectOptions.darknessSoundDelay) ?? 0;
    const volume = effectOptions.darknessVolume ?? 1;
    const soundOptions = {
      sound,
      volume,
      delay: soundDelay
    };
    await placeCloudAsTile(template, casterActor.id, soundOptions);
    async function placeCloudAsTile(templateData, casterId, soundOptions2) {
      let tileWidth;
      let tileHeight;
      let tileX;
      let tileY;
      let placedX = templateData.x;
      let placedY = templateData.y;
      let wallPoints = [];
      let walls = [];
      tileWidth = templateData.width * canvas.grid.size;
      tileHeight = templateData.width * canvas.grid.size;
      let outerCircleRadius = tileWidth / 2.2;
      tileX = templateData.x - tileWidth / 2;
      tileY = templateData.y - tileHeight / 2;
      let data = [{
        alpha: 1,
        width: tileWidth,
        height: tileHeight,
        img: "modules/jb2a_patreon/Library/2nd_Level/Darkness/Darkness_01_Black_600x600.webm",
        overhead: true,
        occlusion: {
          alpha: 0,
          mode: 3
        },
        video: {
          autoplay: true,
          loop: true,
          volume: 0
        },
        x: tileX,
        y: tileY,
        z: 100,
        flags: { tagger: { tags: [`DarknessTile-${casterId}`] } }
      }];
      let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
      let tileId = createdTiles[0].id ?? createdTiles[0]._id;
      new Sequence("Advanced Spell Effects").sound().file(soundOptions2.sound).delay(soundOptions2.delay).volume(soundOptions2.volume).playIf(soundOptions2.sound !== "").play();
      let wall_number = 12;
      let wall_angles = 2 * Math.PI / wall_number;
      for (let i = 0; i < wall_number; i++) {
        let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
        let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
        wallPoints.push({ x, y });
      }
      for (let i = 0; i < wallPoints.length; i++) {
        if (i < wallPoints.length - 1) {
          walls.push({
            c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
            flags: { tagger: { tags: [`DarknessWall-${tileId}`] } },
            move: 0
          });
        } else {
          walls.push({
            c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
            flags: { tagger: { tags: [`DarknessWall-${tileId}`] } },
            move: 0
          });
        }
      }
      await aseSocket.executeAsGM("placeWalls", walls);
    }
    __name(placeCloudAsTile, "placeCloudAsTile");
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    soundOptions.push({
      label: game.i18n.localize("ASE.DarknessSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.darknessSound",
      flagName: "darknessSound",
      flagValue: currFlags.darknessSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DarknessSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.darknessSoundDelay",
      flagName: "darknessSoundDelay",
      flagValue: currFlags.darknessSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DarknessVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.darknessVolume",
      flagName: "darknessVolume",
      flagValue: currFlags.darknessVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(darkness, "darkness");
class detectMagic {
  static registerHooks() {
    Hooks.on("updateToken", detectMagic._updateToken);
  }
  static async _preloadAssets() {
    console.log("Preloading assets for ASE Detect Magic...");
    let assetDBPaths = [];
    let animateDeadItems = getAllItemsNamed("Detect Magic");
    if (animateDeadItems.length > 0) {
      for await (let item of animateDeadItems) {
        let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
        let waveAnim = `jb2a.detect_magic.circle.${aseSettings.waveColor ?? "blue"}`;
        let auraLoopAnim = `jb2a.magic_signs.circle.02.divination.loop.${aseSettings.auraColor ?? "blue"}`;
        let auraIntroAnim = `jb2a.magic_signs.circle.02.divination.intro.${aseSettings.auraColor ?? "blue"}`;
        if (!assetDBPaths.includes(waveAnim))
          assetDBPaths.push(waveAnim);
        if (!assetDBPaths.includes(auraLoopAnim))
          assetDBPaths.push(auraLoopAnim);
        if (!assetDBPaths.includes(auraIntroAnim))
          assetDBPaths.push(auraIntroAnim);
        const magicalSchoolsEng = [
          "abjuration",
          "conjuration",
          "divination",
          "enchantment",
          "evocation",
          "illusion",
          "necromancy",
          "transmutation"
        ];
        let magicalSchools = magicalSchoolsEng;
        let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
        let objects = await Tagger.getByTag("magical");
        let magicalObjects = objects.map((o) => {
          return {
            obj: o,
            school: Tagger.getTags(o).find((t) => magicalSchools.includes(t.toLowerCase())) || false,
            color: Tagger.getTags(o).find((t) => magicalColors.includes(t.toLowerCase())) || "blue"
          };
        });
        for await (let magical of magicalObjects) {
          if (!magical.school) {
            continue;
          }
          let runeIntroAnim = `jb2a.magic_signs.rune.${magical.school}.intro.${magical.color}`;
          let runeLoopAnim = `jb2a.magic_signs.rune.${magical.school}.loop.${magical.color}`;
          if (!assetDBPaths.includes(runeIntroAnim))
            assetDBPaths.push(runeIntroAnim);
          if (!assetDBPaths.includes(runeLoopAnim))
            assetDBPaths.push(runeLoopAnim);
        }
      }
    }
    console.log(`Preloaded ${assetDBPaths.length} assets for Detect Magic!`);
    await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
    return;
  }
  static async activateDetectMagic(midiData) {
    let item = midiData.item;
    let aseFlags = item.getFlag("advancedspelleffects", "effectOptions");
    let actor = midiData.actor;
    let caster2 = canvas.tokens.get(midiData.tokenId);
    let users = [];
    let magicalObjects = [];
    let waveColor = aseFlags.waveColor ?? "blue";
    let auraColor = aseFlags.auraColor ?? "blue";
    const waveSound = aseFlags.waveSound ?? "";
    const waveSoundDelay = Number(aseFlags.waveSoundDelay) ?? 0;
    const waveVolume = Number(aseFlags.waveVolume) ?? 1;
    const magicalSchoolsEng = [
      "abjuration",
      "conjuration",
      "divination",
      "enchantment",
      "evocation",
      "illusion",
      "necromancy",
      "transmutation"
    ];
    for (const user in actor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        users.push(user);
      }
    }
    let magicalSchools = magicalSchoolsEng;
    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
    let objects = await Tagger.getByTag("magical", { ignore: [caster2] });
    magicalObjects = objects.map((o) => {
      let pointA = { x: caster2.data.x + canvas.grid.size / 2, y: caster2.data.y + canvas.grid.size / 2 };
      let pointB = { x: o.data.x + canvas.grid.size / 2, y: o.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      return {
        delay: distance * 55,
        distance,
        obj: o,
        school: Tagger.getTags(o).find((t) => magicalSchools.includes(t.toLowerCase())) || false,
        color: Tagger.getTags(o).find((t) => magicalColors.includes(t.toLowerCase())) || "blue"
      };
    }).filter((o) => o.distance <= 30);
    let dmSequence = new Sequence("Advanced Spell Effects").sound().file(waveSound).volume(waveVolume).delay(waveSoundDelay).playIf(waveSound != "").effect(`jb2a.detect_magic.circle.${waveColor}`).attachTo(caster2).belowTiles().scale(2.33333).effect().file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`).attachTo(caster2).scale(0.2).belowTokens().waitUntilFinished(-1e3).fadeOut(1e3, { ease: "easeInQuint" }).effect().file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`).attachTo(caster2).persist().extraEndDuration(750).fadeOut(750, { ease: "easeInQuint" }).scale(0.2).loopProperty("sprite", "rotation", { duration: 2e4, from: 0, to: 360 }).name(`${caster2.id}-detectMagicAura`).belowTokens();
    console.log("Magical Objects", magicalObjects);
    for await (let magical of magicalObjects) {
      if (!magical.school) {
        continue;
      }
      await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", true);
      new Sequence("Advanced Spell Effects").effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}").forUsers(users).attachTo(magical.obj).scale(0.25).delay(magical.delay).setMustache(magical).waitUntilFinished(-1200).zIndex(0).effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}").name(`${magical.obj.id}-magicRune`).delay(magical.delay).forUsers(users).scale(0.25).attachTo(magical.obj).persist(true).setMustache(magical).waitUntilFinished(-750).fadeOut(750, { ease: "easeInQuint" }).zIndex(1).play();
    }
    dmSequence.play();
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let users = [];
    for (const user in casterActor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        users.push(user);
      }
    }
    const magicalSchoolsEng = [
      "abjuration",
      "conjuration",
      "divination",
      "enchantment",
      "evocation",
      "illusion",
      "necromancy",
      "transmutation"
    ];
    let objects = await Tagger.getByTag("magical", { ignore: [casterToken] });
    let magicalSchools = magicalSchoolsEng;
    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
    let magicalObjects = [];
    magicalObjects = objects.map((o) => {
      let pointA = { x: casterToken.data.x + canvas.grid.size / 2, y: casterToken.data.y + canvas.grid.size / 2 };
      let pointB = { x: o.data.x + canvas.grid.size / 2, y: o.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      return {
        delay: 0,
        distance,
        obj: o,
        school: Tagger.getTags(o).find((t) => magicalSchools.includes(t.toLowerCase())) || false,
        color: Tagger.getTags(o).find((t) => magicalColors.includes(t.toLowerCase())) || "blue"
      };
    });
    for await (let magical of magicalObjects) {
      if (!magical.school) {
        continue;
      }
      if (magical.obj.getFlag("advancedspelleffects", "magicDetected")) {
        await aseSocket.executeAsGM("updateFlag", magical.obj.id, "magicDetected", false);
        await Sequencer.EffectManager.endEffects({ name: `${magical.obj.id}-magicRune`, object: magical.obj._object });
        new Sequence("Advanced Spell Effects").effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}").forUsers(users).attachTo(magical.obj).playIf(magical.distance <= 30).scale(0.25).setMustache(magical).zIndex(0).play();
      }
    }
    await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-detectMagicAura`, object: casterToken });
    new Sequence("Advanced Spell Effects").effect().file(`jb2a.magic_signs.circle.02.divination.outro.${effectOptions.auraColor}`).scale(0.2).belowTokens().attachTo(casterToken).play();
  }
  static async _updateToken(tokenDocument, updateData) {
    if (!updateData.x && !updateData.y)
      return;
    const isGM = isFirstGM();
    if (!isGM)
      return;
    if (tokenDocument.actor.effects.filter((effect) => effect.data.document.sourceName == "Detect Magic").length == 0) {
      return;
    }
    let users = [];
    for (const user in tokenDocument.actor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        users.push(user);
      }
    }
    let newPos = { x: 0, y: 0 };
    newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
    newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
    let magicalObjectsOutOfRange = [];
    let magicalObjectsInRange = [];
    const magicalSchoolsEng = [
      "abjuration",
      "conjuration",
      "divination",
      "enchantment",
      "evocation",
      "illusion",
      "necromancy",
      "transmutation"
    ];
    let magicalSchools = magicalSchoolsEng;
    let magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
    let objects = await Tagger.getByTag("magical", { ignore: [tokenDocument] });
    const magicalObjects = objects.map((o) => {
      let pointA = { x: newPos.x + canvas.grid.size / 2, y: newPos.y + canvas.grid.size / 2 };
      let pointB = { x: o.data.x + canvas.grid.size / 2, y: o.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      return {
        delay: 0,
        distance,
        obj: o,
        school: Tagger.getTags(o).find((t) => magicalSchools.includes(t.toLowerCase())) || false,
        color: Tagger.getTags(o).find((t) => magicalColors.includes(t.toLowerCase())) || "blue"
      };
    });
    magicalObjectsOutOfRange = magicalObjects.filter((o) => o.distance > 30);
    for await (let magical of magicalObjectsOutOfRange) {
      if (!magical.school) {
        continue;
      }
      new Sequence("Advanced Spell Effects").effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}").forUsers(users).attachTo(magical.obj).scale(0.25).setMustache(magical).zIndex(0).playIf(magical.obj.getFlag("advancedspelleffects", "magicDetected")).play();
      if (magical.obj.getFlag("advancedspelleffects", "magicDetected")) {
        await magical.obj.setFlag("advancedspelleffects", "magicDetected", false);
        await Sequencer.EffectManager.endEffects({ name: `${magical.obj.id}-magicRune`, object: magical.obj._object });
      }
    }
    magicalObjectsInRange = magicalObjects.filter((o) => o.distance <= 30);
    for await (let magical of magicalObjectsInRange) {
      if (!magical.school) {
        continue;
      }
      if (!magical.obj.getFlag("advancedspelleffects", "magicDetected")) {
        await magical.obj.setFlag("advancedspelleffects", "magicDetected", true);
        new Sequence("Advanced Spell Effects").effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}").forUsers(users).scale(0.25).delay(magical.delay).setMustache(magical).name("detectMagicRuneIntro").attachTo(magical.obj).waitUntilFinished(-800).zIndex(0).effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}").name(`${magical.obj.id}-magicRune`).delay(magical.delay).forUsers(users).scale(0.25).attachTo(magical.obj).persist(true).setMustache(magical).waitUntilFinished(-750).zIndex(1).fadeOut(750, { ease: "easeInQuint" }).play();
      }
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const detectMagicWaves = `jb2a.detect_magic.circle`;
    const detectMagicWaveColorOptions = getDBOptions(detectMagicWaves);
    const detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
    const detectMagicAuraColorOptions = getDBOptions(detectMagicAuras);
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: "Select Wave Color: ",
      type: "dropdown",
      options: detectMagicWaveColorOptions,
      name: "flags.advancedspelleffects.effectOptions.waveColor",
      flagName: "waveColor",
      flagValue: currFlags.waveColor ?? "blue"
    });
    soundOptions.push({
      label: "Wave Sound: ",
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.waveSound",
      flagName: "waveSound",
      flagValue: currFlags.waveSound ?? ""
    });
    soundOptions.push({
      label: "Wave Sound Delay: ",
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.waveSoundDelay",
      flagName: "waveSoundDelay",
      flagValue: currFlags.waveSoundDelay ?? 0
    });
    soundOptions.push({
      label: "Wave Sound Volume:",
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.waveVolume",
      flagName: "waveVolume",
      flagValue: currFlags.waveVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: "Select Aura Color: ",
      type: "dropdown",
      options: detectMagicAuraColorOptions,
      name: "flags.advancedspelleffects.effectOptions.auraColor",
      flagName: "auraColor",
      flagValue: currFlags.auraColor ?? "blue"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions
    };
  }
}
__name(detectMagic, "detectMagic");
class callLightning {
  static registerHooks() {
    Hooks.on("updateCombat", callLightning._updateCombat);
  }
  static async createStormCloud(midiData) {
    console.log("Creating Storm Cloud...", midiData);
    const item = midiData.item;
    const itemUuid = item.uuid;
    const caster2 = canvas.tokens.get(midiData.tokenId);
    const casterActor = game.actors.get(caster2.actor.id);
    const spellLevel = midiData.itemLevel;
    let aseFlags = item.getFlag("advancedspelleffects", "effectOptions");
    let color = "blue";
    let res = "low";
    let boltStyle = aseFlags?.boltStyle?.toLowerCase() ?? "chain";
    const boltSound = aseFlags?.boltSound ?? "";
    const boltVolume = aseFlags?.boltVolume ?? 1;
    const boltSoundDelay = aseFlags?.boltSoundDelay ?? 0;
    const stormCloudSound = aseFlags?.stormCloudSound ?? "";
    const stormCloudVolume = aseFlags?.stormCloudVolume ?? 1;
    const stormCloudSoundDelay = aseFlags?.stormCloudSoundDelay ?? 0;
    const placeCrackAsTile = aseFlags?.placeCrackAsTile ?? false;
    let weatherDialogData = {
      buttons: [{ label: game.i18n.localize("ASE.Yes"), value: true }, { label: game.i18n.localize("ASE.No"), value: false }],
      title: game.i18n.localize("ASE.AskStorm")
    };
    let stormyWeather = await warpgate.buttonDialog(weatherDialogData, "row");
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().file("jb2a.call_lightning.low_res.blue").attachTo(crosshairs).persist().scaleToObject().opacity(0.5).play();
    }, "displayCrosshairs");
    let crosshairsConfig = {
      size: 25,
      icon: item.img,
      label: game.i18n.localize("ASE.CallLightning"),
      tag: "call-lightning-crosshairs",
      drawIcon: true,
      drawOutline: false,
      interval: 1
    };
    let castTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
    let effectFile = `jb2a.call_lightning.${res}_res.${color}`;
    const effectFilePath = Sequencer.Database.getEntry(effectFile).file;
    const effectOptions = {
      castTemplate,
      casterId: midiData.tokenId,
      isStorm: stormyWeather,
      effectFilePath,
      stormCloudSound,
      stormCloudVolume,
      stormCloudSoundDelay,
      boltSound,
      boltVolume,
      boltSoundDelay,
      boltStyle,
      spellLevel,
      itemId: item.id,
      placeCrackAsTile,
      originalItemUuid: itemUuid
    };
    let stormTileId = await placeCloudAsTile(effectOptions);
    const updates = {
      embedded: {
        Item: {}
      }
    };
    const activationItemName2 = game.i18n.localize("ASE.ActivateCallLightning");
    let castItemDamage = item.data.data.damage;
    let newDamageNum = Number(castItemDamage.parts[0][0][0]) + (spellLevel - 3) + (stormyWeather ? 1 : 0);
    castItemDamage.parts[0][0] = castItemDamage.parts[0][0].replace(/\d+/, newDamageNum);
    updates.embedded.Item[activationItemName2] = {
      "type": "spell",
      "img": item.img,
      "data": {
        "ability": "",
        "actionType": "save",
        "activation": { "type": "action", "cost": 1, "condition": "" },
        "damage": castItemDamage,
        "scaling": item.data.data.scaling,
        "level": spellLevel,
        "save": item.data.data.save,
        "preparation": { "mode": "atwill", "prepared": true },
        "range": { "value": null, "long": null, "units": "" },
        "school": "con",
        "description": {
          "value": game.i18n.localize("ASE.ActivateCallLightningCastDescription")
        }
      },
      "flags": {
        "advancedspelleffects": {
          "enableASE": true,
          "spellEffect": game.i18n.localize("ASE.ActivateCallLightning"),
          "castItem": true,
          "savesRequired": true,
          "effectOptions": {
            "stormTileId": stormTileId,
            "allowInitialMidiCall": true
          }
        }
      }
    };
    await warpgate.mutate(caster2.document, updates, {}, { name: `${caster2.actor.id}-call-lightning` });
    ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
    await ChatMessage.create({ content: `${game.i18n.format("ASE.CallLightningChatMessage"), { name: caster2.actor.name }}` });
    effectOptions.stormTileId = stormTileId;
    effectOptions.concentration = true;
    let castItem = casterActor.items.getName(activationItemName2);
    effectOptions.castItem = castItem.uuid;
    game.ASESpellStateManager.addSpell(midiData.itemUuid, effectOptions);
    async function placeCloudAsTile(effectOptions2) {
      console.log("Placing Cloud as Tile...", effectOptions2);
      const castTemplate2 = effectOptions2.castTemplate;
      const casterId = effectOptions2.casterId;
      const effectFilePath2 = effectOptions2.effectFilePath;
      const isStorm = effectOptions2.isStorm;
      const stormCloudSound2 = effectOptions2.stormCloudSound;
      const stormCloudVolume2 = effectOptions2.stormCloudVolume;
      const stormCloudSoundDelay2 = effectOptions2.stormCloudSoundDelay;
      const boltSound2 = effectOptions2.boltSound;
      const boltVolume2 = effectOptions2.boltVolume;
      const boltSoundDelay2 = effectOptions2.boltSoundDelay;
      const boltStyle2 = effectOptions2.boltStyle;
      const spellLevel2 = effectOptions2.spellLevel;
      const itemId = effectOptions2.itemId;
      const placeCrackAsTile2 = effectOptions2.placeCrackAsTile;
      const itemUuid2 = effectOptions2.originalItemUuid;
      console.log("itemUuid: ", itemUuid2);
      let templateData = castTemplate2;
      let tileWidth;
      let tileHeight;
      let tileX;
      let tileY;
      tileWidth = templateData.width * canvas.grid.size;
      tileHeight = templateData.width * canvas.grid.size;
      tileX = templateData.x - tileWidth / 2;
      tileY = templateData.y - tileHeight / 2;
      let data = {
        alpha: 0.5,
        width: tileWidth,
        height: tileHeight,
        img: effectFilePath2,
        overhead: true,
        occlusion: {
          alpha: 0,
          mode: 0
        },
        video: {
          autoplay: true,
          loop: true,
          volume: 0
        },
        x: tileX,
        y: tileY,
        z: 100,
        flags: {
          advancedspelleffects: {
            "stormCloudTile": casterId,
            "boltStyle": boltStyle2,
            "spellLevel": spellLevel2,
            "itemID": itemId,
            "itemUuid": itemUuid2,
            "stormDamage": isStorm,
            "boltSound": boltSound2,
            "boltVolume": boltVolume2,
            "boltSoundDelay": boltSoundDelay2,
            "placeCrackAsTile": placeCrackAsTile2
          }
        }
      };
      let createdTiles = await aseSocket.executeAsGM("placeTiles", [data]);
      const tileId = createdTiles[0].id ?? createdTiles[0]._id;
      new Sequence("Advanced Spell Effects").sound().file(stormCloudSound2).volume(stormCloudVolume2).delay(stormCloudSoundDelay2).playIf(stormCloudSound2 !== "").play();
      return tileId;
    }
    __name(placeCloudAsTile, "placeCloudAsTile");
  }
  static async getBoltTargets(stormTileId) {
    let stormCloudTile = canvas.scene.tiles.get(stormTileId);
    let crosshairsConfig = {
      size: 3,
      icon: "icons/magic/lightning/bolt-strike-blue.webp",
      label: game.i18n.localize("ASE.LightningBolt"),
      tag: "lightning-bolt-crosshairs",
      drawIcon: true,
      drawOutline: true,
      interval: 1
    };
    let boltTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: checkCrosshairs });
    const targetsInCrosshairs = warpgate.crosshairs.collect(boltTemplate, ["Token"], getContainedCustom)["Token"];
    for await (let target of targetsInCrosshairs) {
      let markerApplied = Sequencer.EffectManager.getEffects({ name: `ase-crosshairs-marker-${target.id}` });
      if (markerApplied.length > 0) {
        Sequencer.EffectManager.endEffects({ name: `ase-crosshairs-marker-${target.id}` });
      }
    }
    let dist = measureDistance({ x: stormCloudTile.data.x + stormCloudTile.data.width / 2, y: stormCloudTile.data.y + stormCloudTile.data.width / 2 }, boltTemplate);
    if (dist > 60) {
      await warpgate.buttonDialog({
        buttons: [{ label: "Ok", value: true }],
        title: `${game.i18n.localize("ASE.SpellFailed")} - ${game.i18n.localize("ASE.OutOfRange")}`
      }, "row");
      return [];
    }
    const boltOptions = {
      boltStyle: stormCloudTile.getFlag("advancedspelleffects", "boltStyle"),
      boltSound: stormCloudTile.getFlag("advancedspelleffects", "boltSound") ?? "",
      boltVolume: stormCloudTile.getFlag("advancedspelleffects", "boltVolume") ?? 0,
      boltSoundDelay: Number(stormCloudTile.getFlag("advancedspelleffects", "boltSoundDelay")) ?? 0,
      placeCrackAsTile: stormCloudTile.getFlag("advancedspelleffects", "placeCrackAsTile") ?? true
    };
    playEffect(boltTemplate, stormCloudTile, boltOptions);
    async function playEffect(boltTemplate2, cloud, boltOptions2) {
      const boltStyle = boltOptions2.boltStyle;
      const boltSound = boltOptions2.boltSound;
      const boltVolume = boltOptions2.boltVolume;
      const boltSoundDelay = boltOptions2.boltSoundDelay;
      const placeCrackAsTile = boltOptions2.placeCrackAsTile;
      let boltEffect;
      switch (boltStyle) {
        case "chain":
          boltEffect = "jb2a.chain_lightning.primary.blue";
          break;
        case "strike":
          boltEffect = "jb2a.lightning_strike.blue";
          break;
        default:
          boltEffect = "jb2a.chain_lightning.primary.blue";
      }
      async function placeCracksAsTile(boltTemplate3, effectFilePath) {
        let templateData = boltTemplate3;
        let tileWidth;
        let tileHeight;
        let tileX;
        let tileY;
        tileWidth = templateData.width * canvas.grid.size;
        tileHeight = templateData.width * canvas.grid.size;
        tileX = templateData.x - tileWidth / 2;
        tileY = templateData.y - tileHeight / 2;
        let data = [{
          alpha: 1,
          width: tileWidth,
          height: tileHeight,
          img: effectFilePath,
          overhead: false,
          occlusion: {
            alpha: 0,
            mode: 0
          },
          video: {
            autoplay: true,
            loop: true,
            volume: 0
          },
          x: tileX,
          y: tileY,
          z: 100
        }];
        await aseSocket.executeAsGM("placeTiles", data);
      }
      __name(placeCracksAsTile, "placeCracksAsTile");
      let cloudCenter = { x: cloud.data.x + cloud.data.width / 2, y: cloud.data.y + cloud.data.width / 2 };
      let strikeRay = new Ray(boltTemplate2, cloudCenter);
      let strikeAngle = strikeRay.angle * (180 / Math.PI);
      let strikeRotation = -strikeAngle - 90;
      let groundCrackVersion = getRandomInt(1, 3);
      let groundCrackAnim = `jb2a.impact.ground_crack.blue.0${groundCrackVersion}`;
      let groundCrackImg = `jb2a.impact.ground_crack.still_frame.0${groundCrackVersion}`;
      let groundCrackImgPath = Sequencer.Database.getEntry(groundCrackImg).file;
      let boltSeq = new Sequence("Advanced Spell Effects").sound().file(boltSound).volume(boltVolume).delay(boltSoundDelay).playIf(boltSound != "").effect().file(boltEffect).atLocation(cloud).stretchTo(boltTemplate2).waitUntilFinished(-1500).playIf(boltStyle == "chain").effect().file(boltEffect).atLocation({ x: boltTemplate2.x, y: boltTemplate2.y }).playIf(boltStyle == "strike").rotate(strikeRotation).randomizeMirrorX().scale(2).effect().file(groundCrackAnim).atLocation(boltTemplate2).belowTokens().scale(0.5).waitUntilFinished(-3e3).thenDo(async () => {
        if (placeCrackAsTile) {
          placeCracksAsTile(boltTemplate2, groundCrackImgPath);
        }
      });
      await boltSeq.play();
    }
    __name(playEffect, "playEffect");
    return targetsInCrosshairs;
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == casterToken.id);
    const isGM = isFirstGM();
    if (stormCloudTiles.length > 0) {
      console.log("Removing Storm Cloud Tile...", stormCloudTiles[0].id);
      const itemUuid = stormCloudTiles[0].getFlag("advancedspelleffects", "itemUuid");
      let spellState = game.ASESpellStateManager.getSpell(itemUuid);
      console.log("Spell State: ", spellState);
      if (spellState) {
        game.ASESpellStateManager.removeSpell(itemUuid);
      }
      if (isGM) {
        await aseSocket.executeAsGM("deleteTiles", [stormCloudTiles[0].id]);
        await warpgate.revert(casterToken.document, `${casterActor.id}-call-lightning`);
        ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
        await ChatMessage.create({ content: game.i18n.localize("ASE.ActivateCallLightningDissipate") });
      }
    }
  }
  static async _updateCombat(combat) {
    let currentCombatantId = combat.current.tokenId;
    let caster2 = canvas.tokens.get(currentCombatantId);
    if (!caster2)
      return;
    if (!caster2.actor.isOwner || game.user.isGM && caster2.actor.hasPlayerOwner)
      return;
    let stormCloudTiles = canvas.scene.tiles.filter((tile) => tile.data.flags.advancedspelleffects?.stormCloudTile == currentCombatantId);
    if (stormCloudTiles.length > 0) {
      let confirmData = {
        buttons: [{ label: "Yes", value: true }, { label: "No", value: false }],
        title: game.i18n.format("ASE.ActivateCallLightningDialog", { spellLevel: stormCloudTiles[0].getFlag("advancedspelleffects", "spellLevel") })
      };
      let confirm = await warpgate.buttonDialog(confirmData, "row");
      if (confirm) {
        let item = caster2.actor.items.filter((i) => i.name == game.i18n.localize("ASE.ActivateCallLightning"))[0];
        if (item) {
          await item.roll();
        } else {
          ui.notifications.error(game.i18n.format("ASE.NoSpellItem", { spellName: game.i18n.localize("ASE.ActivateCallLightning") }));
        }
      }
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const boltOptions = [
      {
        "chain": game.i18n.localize("ASE.Chain")
      },
      {
        "strike": game.i18n.localize("ASE.Strike")
      }
    ];
    animOptions.push({
      label: game.i18n.localize("ASE.SelectBoltStyleLabel"),
      type: "dropdown",
      options: boltOptions,
      name: "flags.advancedspelleffects.effectOptions.boltStyle",
      flagName: "boltStyle",
      flagValue: currFlags.boltStyle ?? "chain"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.PlaceCrackAsTileLabel"),
      tooltip: game.i18n.localize("ASE.PlaceCrackAsTileTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.placeCrackAsTile",
      flagName: "placeCrackAsTile",
      flagValue: currFlags.placeCrackAsTile ?? false
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BoltSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.boltSound",
      flagName: "boltSound",
      flagValue: currFlags.boltSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BoltSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.boltSoundDelay",
      flagName: "boltSoundDelay",
      flagValue: currFlags.boltSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BoltVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.boltVolume",
      flagName: "boltVolume",
      flagValue: currFlags.boltVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(callLightning, "callLightning");
class fogCloud {
  static registerHooks() {
    if (!game.user.isGM)
      return;
    Hooks.on("updateTile", fogCloud._updateTile);
    Hooks.on("deleteTile", fogCloud._deleteTile);
  }
  static async _updateTile(tileD) {
    if (tileD.getFlag("advancedspelleffects", "fogCloudWallNum")) {
      let wallNum = tileD.getFlag("advancedspelleffects", "fogCloudWallNum");
      await aseSocket.executeAsGM("moveWalls", tileD.id, "FogCloud", wallNum);
    }
  }
  static async _deleteTile(tileD) {
    let walls = [];
    let wallDocuments = [];
    walls = await Tagger.getByTag([`FogCloudWall-${tileD.id}`]);
    walls.forEach((wall) => {
      wallDocuments.push(wall.id);
    });
    if (canvas.scene.getEmbeddedDocument("Wall", wallDocuments[0])) {
      await canvas.scene.deleteEmbeddedDocuments("Wall", wallDocuments);
    }
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let fogCloudTiles = await Tagger.getByTag(`FogCloudTile-${casterActor.id}`);
    if (fogCloudTiles.length > 0) {
      aseSocket.executeAsGM("deleteTiles", [fogCloudTiles[0].id]);
    }
  }
  static async createFogCloud(midiData) {
    let item = midiData.item;
    let itemLevel = midiData.itemLevel;
    let aseFlags = item.getFlag("advancedspelleffects", "effectOptions");
    let caster2 = await canvas.tokens.get(midiData.tokenId);
    let casterActor = caster2.actor;
    let cloudSize;
    if (aseFlags.scaleWithLevel == void 0 || aseFlags.scaleWithLevel) {
      cloudSize = Number(aseFlags.fogCloudRadius ?? 20) / 2.5 * itemLevel;
    } else {
      cloudSize = Number(aseFlags.fogCloudRadius ?? 20) / 2.5;
    }
    if (cloudSize < 2.5)
      cloudSize = 2.5;
    const sound = aseFlags?.fogCloudSound ?? "";
    const soundDelay = Number(aseFlags?.fogCloudSoundDelay) ?? 0;
    const volume = aseFlags?.fogCloudVolume ?? 1;
    const soundOptions = {
      sound,
      volume,
      delay: soundDelay
    };
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().file("jb2a.fog_cloud.1.white").attachTo(crosshairs).persist().scaleToObject().opacity(0.5).play();
    }, "displayCrosshairs");
    let crosshairsConfig = {
      size: cloudSize,
      icon: item.img,
      label: game.i18n.localize("ASE.FogCloud"),
      tag: "fog-cloud-crosshairs",
      drawIcon: false,
      drawOutline: false,
      interval: 1
    };
    let fogCloudTemplate = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
    await placeCloudAsTile(fogCloudTemplate, casterActor.id, itemLevel, soundOptions);
    async function placeCloudAsTile(template, casterId, spellLevel, soundOptions2) {
      let templateData = template;
      console.log(templateData);
      let tileWidth;
      let tileHeight;
      let tileX;
      let tileY;
      let placedX = templateData.x;
      let placedY = templateData.y;
      let wallPoints = [];
      let walls = [];
      let wall_number = aseFlags.wallNumber * spellLevel;
      let wall_angles = 2 * Math.PI / wall_number;
      tileWidth = templateData.width * canvas.grid.size + canvas.grid.size / 2;
      tileHeight = templateData.width * canvas.grid.size + canvas.grid.size / 2;
      let outerCircleRadius = templateData.width * canvas.grid.size / 2;
      tileX = templateData.x - tileWidth / 2;
      tileY = templateData.y - tileHeight / 2;
      let data = [{
        alpha: 1,
        width: tileWidth,
        height: tileHeight,
        img: "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
        overhead: true,
        occlusion: {
          alpha: 0,
          mode: 3
        },
        video: {
          autoplay: true,
          loop: true,
          volume: 0
        },
        x: tileX,
        y: tileY,
        z: 100,
        flags: { tagger: { tags: [`FogCloudTile-${casterId}`] }, advancedspelleffects: { fogCloudWallNum: wall_number } }
      }];
      let createdTiles = await aseSocket.executeAsGM("placeTiles", data);
      let tileId = createdTiles[0].id ?? createdTiles[0]._id;
      new Sequence("Advanced Spell Effects").sound().file(soundOptions2.sound).delay(soundOptions2.delay).volume(soundOptions2.volume).playIf(soundOptions2.sound !== "").play();
      for (let i = 0; i < wall_number; i++) {
        let x = placedX + outerCircleRadius * Math.cos(i * wall_angles);
        let y = placedY + outerCircleRadius * Math.sin(i * wall_angles);
        wallPoints.push({ x, y });
      }
      for (let i = 0; i < wallPoints.length; i++) {
        if (i < wallPoints.length - 1) {
          walls.push({
            c: [wallPoints[i].x, wallPoints[i].y, wallPoints[i + 1].x, wallPoints[i + 1].y],
            flags: { tagger: { tags: [`FogCloudWall-${tileId}`] } },
            move: 0
          });
        } else {
          walls.push({
            c: [wallPoints[i].x, wallPoints[i].y, wallPoints[0].x, wallPoints[0].y],
            flags: { tagger: { tags: [`FogCloudWall-${tileId}`] } },
            move: 0
          });
        }
      }
      await aseSocket.executeAsGM("placeWalls", walls);
    }
    __name(placeCloudAsTile, "placeCloudAsTile");
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.WallsLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallNumber",
      flagName: "wallNumber",
      flagValue: currFlags.wallNumber ?? 12
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ScaleWithLevelLabel"),
      tooltip: game.i18n.localize("ASE.ScaleWithLevelTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.scaleWithLevel",
      flagName: "scaleWithLevel",
      flagValue: currFlags.scaleWithLevel ?? true
    });
    animOptions.push({
      label: game.i18n.localize("ASE.FogCloudRadiusLabel"),
      tooltip: game.i18n.localize("ASE.FogCloudRadiusTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.fogCloudRadius",
      flagName: "fogCloudRadius",
      flagValue: currFlags.fogCloudRadius ?? 20
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FogCloudSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.fogCloudSound",
      flagName: "fogCloudSound",
      flagValue: currFlags.fogCloudSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FogCloudSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.fogCloudSoundDelay",
      flagName: "fogCloudSoundDelay",
      flagValue: currFlags.fogCloudSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FogCloudVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.fogCloudVolume",
      flagName: "fogCloudVolume",
      flagValue: currFlags.fogCloudVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(fogCloud, "fogCloud");
class spiritualWeapon {
  static registerHooks() {
    return;
  }
  static async createSpiritualWeapon(midiData) {
    const casterActor = midiData.actor;
    const casterActorRollData = casterActor.getRollData();
    canvas.tokens.get(midiData.tokenId);
    const item = midiData.item;
    const effectOptions = item.getFlag("advancedspelleffects", "effectOptions") ?? {};
    const level = midiData.itemLevel;
    let summonType = "Spiritual Weapon";
    const casterActorSpellcastingMod = casterActorRollData.abilities[casterActorRollData.attributes.spellcasting].mod ?? 0;
    casterActor.data.data.attributes.spelldc;
    const summonerAttack = casterActorRollData.attributes.prof + casterActorSpellcastingMod + Number(casterActorRollData.bonuses?.msak?.attack ?? 0);
    const summonerMod = casterActorSpellcastingMod + Number(casterActorRollData.bonuses?.msak?.damage ?? 0);
    let damageScale = "";
    async function myEffectFunction(template, options2, update2) {
      let glowColor;
      let color = options2.color;
      const sound = options2.effectOptions?.summonSound ?? "";
      const soundDelay = Number(options2.effectOptions?.summonSoundDelay) ?? 0;
      const volume = options2.effectOptions?.summonVolume ?? 1;
      switch (color) {
        case "blue":
          glowColor = rgbToHex(173, 216, 230);
          break;
        case "green":
          glowColor = rgbToHex(144, 238, 144);
          break;
        case "orange":
          glowColor = rgbToHex(255, 128, 0);
          break;
        case "pruple":
          glowColor = rgbToHex(153, 0, 153);
          break;
        case "red":
          glowColor = rgbToHex(204, 0, 0);
          break;
        case "yellow":
          glowColor = rgbToHex(255, 255, 0);
          break;
        case "pink":
          glowColor = rgbToHex(255, 102, 255);
          break;
        default:
          glowColor = rgbToHex(153, 204, 255);
      }
      let effectFile;
      if (Sequencer.Database.entryExists(`jb2a.eldritch_blast.${color}`)) {
        effectFile = `jb2a.eldritch_blast.${color}`;
      } else {
        effectFile = `jb2a.eldritch_blast.yellow`;
      }
      let effect = `jb2a.bless.400px.intro.${color}`;
      if (Sequencer.Database.entryExists(effect)) {
        effect = effect;
      } else {
        effect = `jb2a.bless.400px.intro.yellow`;
      }
      new Sequence("Advanced Spell Effects").sound().file(sound).delay(soundDelay).volume(volume).playIf(sound !== "").effect().file(effectFile).atLocation(template).waitUntilFinished(-1200).endTime(3300).playbackRate(0.7).scaleOut(0, 250).filter("Glow", { color: glowColor, distance: 35, outerStrength: 2, innerStrength: 0.25 }).center().belowTokens().effect().file(effect).atLocation(template).center().scale(1.5).belowTokens().play();
    }
    __name(myEffectFunction, "myEffectFunction");
    async function postEffects(template, token) {
      new Sequence("Advanced Spell Effects").animation().on(token).fadeIn(500).play();
    }
    __name(postEffects, "postEffects");
    let weaponData = [{
      type: "select",
      label: game.i18n.localize("ASE.WeaponDialogLabel"),
      options: ["Mace", "Maul", "Scythe", "Sword"]
    }];
    let weaponChoice = await warpgate.dialog(weaponData);
    weaponChoice = weaponChoice[0].toLowerCase();
    let spiritWeapon = `jb2a.spiritual_weapon.${weaponChoice}`;
    let types = Sequencer.Database.getPathsUnder(spiritWeapon);
    let typeOptions = [];
    types.forEach((type) => {
      typeOptions.push(capitalizeFirstLetter(type));
    });
    let typeData = [{
      type: "select",
      label: game.i18n.localize("ASE.SpiritTypeDialogLabel"),
      options: typeOptions
    }];
    let typeChoice = await warpgate.dialog(typeData);
    typeChoice = typeChoice[0].toLowerCase();
    spiritWeapon = spiritWeapon + `.${typeChoice}`;
    let colors = Sequencer.Database.getPathsUnder(spiritWeapon);
    let colorOptions = [];
    colors.forEach((color) => {
      colorOptions.push(capitalizeFirstLetter(color));
    });
    let attackColors;
    if (weaponChoice == "mace" || weaponChoice == "maul" || weaponChoice == "scythe" || weaponChoice == "sword") {
      attackColors = Sequencer.Database.getPathsUnder(`jb2a.spiritual_weapon.${weaponChoice}`);
    } else if (Sequencer.Database.entryExists(`jb2a.${weaponChoice}.melee`)) {
      attackColors = Sequencer.Database.getPathsUnder(`jb2a.${weaponChoice}.melee`);
    } else {
      attackColors = Sequencer.Database.getPathsUnder(`jb2a.sword.melee.fire`);
    }
    let attackColorOptions = [];
    attackColors.forEach((attackColor) => {
      attackColorOptions.push(capitalizeFirstLetter(attackColor));
    });
    let colorData = [{
      type: "select",
      label: game.i18n.localize("ASE.SpiritColorDialogLabel"),
      options: colorOptions
    }];
    let colorChoices = await warpgate.dialog(colorData);
    let spiritColorChoice = colorChoices[0].toLowerCase();
    let attackColorChoice = spiritColorChoice;
    spiritWeapon = spiritWeapon + `.${spiritColorChoice}`;
    let spiritAttackAnim;
    if (weaponChoice != "scythe") {
      if (attackColorChoice == "white") {
        attackColorChoice = "black";
      } else if (weaponChoice == "mace" || weaponChoice == "maul" && attackColorChoice == "purple") {
        attackColorChoice = "dark_purple";
      }
      spiritAttackAnim = `jb2a.${weaponChoice}.melee.fire.${attackColorChoice}`;
    } else {
      spiritAttackAnim = spiritWeapon;
    }
    let spiritualWeapon2 = Sequencer.Database.getEntry(spiritWeapon).file;
    let spiritualWeaponAttackImg = Sequencer.Database.getEntry(spiritWeapon).file;
    if (spiritualWeaponAttackImg.includes("Mace") || spiritualWeaponAttackImg.includes("Maul") || spiritualWeaponAttackImg.includes("Sword")) {
      spiritualWeaponAttackImg = spiritualWeaponAttackImg.replace("200x200.webm", "Thumb.webp");
    } else {
      spiritualWeaponAttackImg = spiritualWeaponAttackImg.replace("300x300.webm", "Thumb.webp");
    }
    const spiritualWeaponActorImg = spiritualWeaponAttackImg;
    if (level - 3 > 0) {
      damageScale = `+ ${Math.floor((level - 2) / 2)}d8[upcast]`;
    }
    const attackItemName = game.i18n.localize("ASE.SpiritAttackItemName");
    let updates = {
      token: {
        "alpha": 0,
        "name": `${summonType} of ${casterActor.name}`,
        "img": spiritualWeapon2,
        "scale": 1.5,
        "actorLink": false
      },
      actor: {
        "name": `${summonType} of ${casterActor.name}`,
        "img": spiritualWeaponActorImg
      },
      embedded: {
        Item: {}
      }
    };
    updates.embedded.Item[attackItemName] = {
      "type": "weapon",
      img: spiritualWeaponAttackImg,
      "data": {
        "ability": "",
        "actionType": "mwak",
        "activation": { "type": "action", "cost": 1, "condition": "" },
        "attackBonus": `- @mod - @prof + ${summonerAttack}`,
        "damage": { "parts": [[`1d8 ${damageScale} + ${summonerMod}`, "force"]], "versatile": "" },
        "range": { "value": null, "long": null, "units": "" },
        "description": {
          "value": game.i18n.localize("ASE.SpiritAttackItemDescription")
        }
      },
      "flags": {
        "advancedspelleffects": {
          "enableASE": true,
          "disableSettings": true,
          "spellEffect": game.i18n.localize("ASE.SpiritAttackItemName"),
          "castItem": true,
          "castStage": "preDamage",
          "effectOptions": {
            "attackAnimFile": spiritAttackAnim
          }
        }
      }
    };
    let crosshairsConfig = {
      size: 1,
      label: `${summonType} of ${casterActor.name}`,
      tag: "spiritual-weapon-crosshairs",
      drawIcon: false,
      drawOutline: false,
      interval: 2
    };
    const options = { controllingActor: game.actors.get(casterActor.id), crosshairs: crosshairsConfig };
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().file(spiritualWeapon2).attachTo(crosshairs).persist().name("ASE-spiritual-weapon-crosshairs").opacity(0.5).play();
    }, "displayCrosshairs");
    const callbacks = {
      pre: async (template, update2) => {
        myEffectFunction(template, { color: spiritColorChoice, effectOptions });
        await warpgate.wait(1750);
      },
      post: async (template, token) => {
        postEffects(template, token);
        await warpgate.wait(500);
        await Sequencer.EffectManager.endEffects({ name: "ASE-spiritual-weapon-crosshairs" });
      },
      show: displayCrosshairs
    };
    warpgate.spawn(summonType, updates, callbacks, options);
  }
  static async spiritualWeaponAttack(data) {
    console.log("ASE Spiritual Weapon Attacking...", data);
    data.actor;
    const casterToken = canvas.tokens.get(data.tokenId);
    const spellItem = data.item;
    const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
    const attackAnimFile = aseEffectOptions?.attackAnimFile;
    const target = Array.from(data.targets)[0];
    let hitTargets = Array.from(data.hitTargets);
    console.log("Hit Targets: ", hitTargets);
    const missed = hitTargets.length == 0;
    console.log("ASE Spiritual Weapon Attack Missed: ", missed);
    new Sequence("Advanced Spell Effects").animation().on(casterToken).opacity(1).fadeOut(250).effect().fadeIn(750).startTime(500).endTime(650).file(attackAnimFile).missed(missed).atLocation(casterToken).fadeOut(500).stretchTo(target).waitUntilFinished(-250).animation().on(casterToken).opacity(1).fadeIn(750).play();
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    soundOptions.push({
      label: game.i18n.localize("ASE.SummonSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.summonSound",
      flagName: "summonSound",
      flagValue: currFlags.summonSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.SummonSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.summonSoundDelay",
      flagName: "summonSoundDelay",
      flagValue: currFlags.summonSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.SummonVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.summonVolume",
      flagName: "summonVolume",
      flagValue: currFlags.summonVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(spiritualWeapon, "spiritualWeapon");
class steelWindStrike {
  static registerHooks() {
    return;
  }
  static async doStrike(midiData) {
    let item = midiData.item;
    let aseFlags = item.getFlag("advancedspelleffects", "effectOptions");
    let weapon = aseFlags.weapon ?? "sword";
    let weaponColor = aseFlags.weaponColor ?? "blue";
    let caster2 = canvas.tokens.get(midiData.tokenId);
    let targets = Array.from(game.user.targets);
    let rollDataForDisplay = [];
    let swordAnim;
    let gustAnim = "jb2a.gust_of_wind.veryfast";
    let validSwingTypes = [0, 2, 4];
    let animStartTimeMap = {
      0: 750,
      1: 500,
      2: 850,
      3: 850,
      4: 1e3,
      5: 500
    };
    let animEndTimeMap = {
      0: 1250,
      1: 1250,
      2: 2e3,
      3: 1250,
      4: 1700,
      5: 1250
    };
    let weaponsPathMap = {
      "sword": "melee.01",
      "mace": "melee",
      "greataxe": "melee",
      "greatsword": "melee",
      "handaxe": "melee",
      "spear": "melee.01"
    };
    let currentAutoRotateState = false;
    if (game.modules.get("autorotate")?.active) {
      currentAutoRotateState = caster2.document.getFlag("autorotate", "enabled") ?? false;
    }
    if (currentAutoRotateState) {
      await caster2.document.setFlag("autorotate", "enabled", false);
    }
    await steelWindStrike2(item, caster2, targets, aseFlags);
    async function evaluateAttack(target, rollData, damageFormula) {
      let attackRoll = await new Roll(`1d20 + @mod + @prof`, rollData).evaluate({ async: true });
      console.log("ASE SWS ttack roll: ", attackRoll);
      if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
        onMiss(target, attackRoll);
      } else {
        onHit(target, attackRoll, damageFormula);
      }
    }
    __name(evaluateAttack, "evaluateAttack");
    async function onHit(target, attackRoll, damageFormula) {
      let currentRoll = await new Roll(damageFormula, caster2.actor.getRollData()).evaluate({ async: true });
      if (game.modules.get("midi-qol")?.active) {
        new MidiQOL.DamageOnlyWorkflow(midiData.actor, midiData.tokenId, currentRoll.total, "force", [target], currentRoll, { flavor: game.i18n.localize("ASE.SteelWindStrikeDamageFlavor"), itemCardId: "new", itemData: midiData.item.data });
      }
      rollDataForDisplay.push({
        "target": target.name,
        "attackroll": attackRoll.total,
        "hit": true,
        "damageroll": currentRoll.total
      });
    }
    __name(onHit, "onHit");
    async function onMiss(target, attackRoll) {
      rollDataForDisplay.push({
        "target": target.name,
        "attackroll": attackRoll.total,
        "hit": false,
        "damageroll": 0
      });
    }
    __name(onMiss, "onMiss");
    async function finalTeleport(caster3, location) {
      let startLocation = { x: caster3.x, y: caster3.y };
      let distance = Math.sqrt(Math.pow(location.x - caster3.x, 2) + Math.pow(location.y - caster3.y, 2));
      let steelWindSequence = new Sequence("Advanced Spell Effects").animation().on(caster3).rotateTowards(location).animation().on(caster3).snapToGrid().moveTowards(location, { ease: "easeOutElasticCustom" }).moveSpeed(distance / 60).duration(800).waitUntilFinished(-750).effect().atLocation(startLocation).file(gustAnim).stretchTo(location).opacity(0.8).fadeOut(250).belowTokens().waitUntilFinished().thenDo(async () => {
        if (game.modules.get("autorotate")?.active) {
          await caster3.document.setFlag("autorotate", "enabled", currentAutoRotateState);
        }
      });
      await steelWindSequence.play();
    }
    __name(finalTeleport, "finalTeleport");
    function getFreePosition(origin) {
      const center = canvas.grid.getCenter(origin.x, origin.y);
      origin = { x: center[0], y: center[1] };
      const positions = generatePositions(origin);
      for (let position of positions) {
        if (isFree(position)) {
          return position;
        }
      }
    }
    __name(getFreePosition, "getFreePosition");
    function generatePositions(origin) {
      let positions = [canvas.grid.getSnappedPosition(origin.x - 1, origin.y - 1)];
      for (let r = canvas.scene.dimensions.size; r < canvas.scene.dimensions.size * 2; r += canvas.scene.dimensions.size) {
        for (let theta = 0; theta < 2 * Math.PI; theta += Math.PI / (4 * r / canvas.scene.dimensions.size)) {
          const newPos = canvas.grid.getTopLeft(origin.x + r * Math.cos(theta), origin.y + r * Math.sin(theta));
          positions.push({ x: newPos[0], y: newPos[1] });
        }
      }
      return positions;
    }
    __name(generatePositions, "generatePositions");
    function isFree(position) {
      for (let token of canvas.tokens.placeables) {
        const hitBox = new PIXI.Rectangle(token.x, token.y, token.w, token.h);
        if (hitBox.contains(position.x, position.y)) {
          return false;
        }
      }
      return true;
    }
    __name(isFree, "isFree");
    async function steelWindStrike2(item2, caster3, targets2, options) {
      const dashSound = options.dashSound ?? "";
      const dashSoundDelay = options.dashSoundDelay ?? 0;
      const dashVolume = options.dashVolume ?? 1;
      const strikeSound = options.strikeSound ?? "";
      let strikeSoundDelay = options.strikeSoundDelay ?? 0;
      const strikeVolume = options.strikeVolume ?? 1;
      let itemRollData = item2.getRollData();
      const itemRollMod = itemRollData.mod;
      const damageFormula = `${options.dmgDieCount}${options.dmgDie}${options.dmgMod > 0 ? "+" : ""}${options.dmgMod > 0 ? options.dmgMod : ""}`;
      let currentX;
      let targetX;
      let currentY;
      let targetY;
      let distance;
      let swingType;
      let swingStartDelay = -600;
      for (let i = 0; i < targets2.length; i++) {
        if (i == targets2.length - 1) {
          swingType = 5;
          swingStartDelay = -250;
          strikeSoundDelay += 750;
        } else {
          swingType = validSwingTypes[getRandomInt(0, 2)];
        }
        swordAnim = `jb2a.${weapon}.${weaponsPathMap[weapon]}.${weaponColor}.${swingType}`;
        let target = targets2[i];
        itemRollData.mod = itemRollMod;
        evaluateAttack(target, itemRollData, damageFormula);
        const openPosition = getFreePosition({ x: target.x, y: target.y });
        let rotateAngle = new Ray(openPosition, target).angle * (180 / Math.PI);
        currentX = caster3.x;
        targetX = openPosition.x;
        currentY = caster3.y;
        targetY = openPosition.y;
        distance = Math.sqrt(Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2));
        let steelWindSequence = new Sequence("Advanced Spell Effects").sound().file(dashSound).volume(dashVolume).delay(dashSoundDelay).playIf(dashSound != "").effect().atLocation({ x: caster3.x + canvas.grid.size / 2, y: caster3.y + canvas.grid.size / 2 }).file(gustAnim).stretchTo({ x: openPosition.x + canvas.grid.size / 2, y: openPosition.y + canvas.grid.size / 2 }).opacity(0.8).fadeOut(250).belowTokens().animation().on(caster3).rotate(rotateAngle - 90).animation().on(caster3).moveTowards(openPosition, { ease: "easeOutElasticCustom" }).moveSpeed(distance / 60).duration(800).waitUntilFinished(swingStartDelay).sound().file(strikeSound).volume(strikeVolume).delay(strikeSoundDelay).playIf(strikeSound != "").effect().atLocation(caster3, { cacheLocation: false }).file(swordAnim).startTime(animStartTimeMap[swingType]).endTime(animEndTimeMap[swingType]).stretchTo(target).fadeOut(250, { ease: "easeOutQuint" }).waitUntilFinished();
        await steelWindSequence.play();
      }
      let contentHTML = `<form class="editable flexcol" autocomplete="off">`;
      rollDataForDisplay.forEach((data) => {
        let name = data.target;
        let attackTotal = data.attackroll;
        let damageTotal = data.damageroll;
        let hitStatus = data.hit;
        contentHTML = contentHTML + `<section>
                                        <li class="flexrow">
                                            <h4>${name}</h4>
                                            <div>
                                                <span>${game.i18n.localize("ASE.SWSAttackTotalMessage")}${attackTotal}</span>
                                            </div>
                                            <div>
                                                <span>${hitStatus ? game.i18n.localize("ASE.SWSHitMessage") : game.i18n.localize("ASE.SWSMissMessage")}</span>
                                            </div>
                                            <div> 
                                                <span>${game.i18n.localize("ASE.SWSDamageTotalMessage")} ${damageTotal}</span>
                                            </div>
                                        </li>
                                    </section> 
                                    <br>`;
      });
      contentHTML = contentHTML + `</form>`;
      async function chooseFinalLocation() {
        let crosshairsConfig = {
          size: 1,
          icon: caster3.data.img,
          label: game.i18n.localize("ASE.SWSFinalLocationCrosshairsLabel"),
          tag: "end-at-crosshairs",
          drawIcon: true,
          drawOutline: false,
          interval: 2
        };
        let template = await warpgate.crosshairs.show(crosshairsConfig);
        await finalTeleport(caster3, template);
      }
      __name(chooseFinalLocation, "chooseFinalLocation");
      let done = await new Promise((resolve) => {
        new Dialog(
          {
            title: game.i18n.localize("ASE.SWSBreakDownWindowTitle"),
            content: contentHTML,
            buttons: {
              one: {
                label: game.i18n.localize("ASE.OK"),
                callback: (html) => {
                  resolve(true);
                }
              }
            }
          },
          { width: "500" }
        ).render(true);
      });
      if (done) {
        await chooseFinalLocation();
      }
    }
    __name(steelWindStrike2, "steelWindStrike");
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const SwordColors = `jb2a.sword.melee.01`;
    const swordColorOptions = getDBOptions(SwordColors);
    const dieOptions = [
      { "d4": "d4" },
      { "d6": "d6" },
      { "d8": "d8" },
      { "d10": "d10" },
      { "d12": "d12" },
      { "d20": "d20" }
    ];
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieCountLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgDieCount",
      flagName: "dmgDieCount",
      flagValue: currFlags.dmgDieCount ?? 6
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieLabel"),
      type: "dropdown",
      options: dieOptions,
      name: "flags.advancedspelleffects.effectOptions.dmgDie",
      flagName: "dmgDie",
      flagValue: currFlags.dmgDie ?? "d10"
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageBonusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgMod",
      flagName: "dmgMod",
      flagValue: currFlags.dmgMod ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.SwordColorLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.weaponColor",
      options: swordColorOptions,
      flagName: "weaponColor",
      flagValue: currFlags.weaponColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DashSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.dashSound",
      flagName: "dashSound",
      flagValue: currFlags.dashSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DashSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dashSoundDelay",
      flagName: "dashSoundDelay",
      flagValue: currFlags.dashSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DashVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.dashVolume",
      flagName: "dashVolume",
      flagValue: currFlags.dashVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.StrikeSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.strikeSound",
      flagName: "strikeSound",
      flagValue: currFlags.strikeSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.StrikeSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.strikeSoundDelay",
      flagName: "strikeSoundDelay",
      flagValue: currFlags.strikeSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.StrikeVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.strikeVolume",
      flagName: "strikeVolume",
      flagValue: currFlags.strikeVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(steelWindStrike, "steelWindStrike");
class thunderStep {
  static registerHooks() {
    return;
  }
  static async doTeleport(midiData) {
    let actorD = midiData.actor;
    const tokenD = canvas.tokens.get(midiData.tokenId);
    const itemD = actorD.items.getName(midiData.item.name);
    await game.messages.get(midiData.itemCardId);
    midiData.itemLevel ? Number(midiData.itemLevel) : 3;
    actorD.data.data.attributes.spelldc;
    const effectOptions = itemD.getFlag("advancedspelleffects", "effectOptions") ?? {};
    const teleportSound = effectOptions.teleportSound ?? "";
    const teleportSoundDelay = Number(effectOptions.teleportSoundDelay) ?? 0;
    const teleportVolume = effectOptions.teleportVolume ?? 1;
    const reappearSound = effectOptions.reappearSound ?? "";
    const reappearSoundDelay = Number(effectOptions.reappearSoundDelay) ?? 0;
    const reappearVolume = effectOptions.reappearVolume ?? 1;
    const teleport_range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle",
      user: game.userId,
      x: tokenD.x + canvas.grid.size / 2,
      y: tokenD.y + canvas.grid.size / 2,
      direction: 0,
      distance: 92.5,
      fillColor: game.user.color
    }]);
    const damage_range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
      t: "circle",
      user: game.userId,
      x: tokenD.x + canvas.grid.size / 2,
      y: tokenD.y + canvas.grid.size / 2,
      direction: 0,
      distance: 12.5,
      fillColor: "#FF0000"
    }]);
    const passengers = [];
    if (midiData.targets.length) {
      let passenger = await canvas.tokens.get(midiData.targets[0]._id);
      if (passenger)
        passengers.push(passenger);
    } else {
      let potentialPassengers = canvas.tokens.placeables.filter(function(target) {
        return canvas.grid.measureDistance(tokenD, target) <= 7.5 && target.data.disposition === tokenD.data.disposition && target !== tokenD;
      });
      let passenger = potentialPassengers.length ? await new Promise((resolve) => {
        const content = [`${game.i18n.localize("ASE.ThunderStepPassengerPrompt")}<br><br><select style='width:100%'>`];
        content.push(`<option passenger_id="noone">${game.i18n.localize("ASE.NoOne")}</option>`);
        potentialPassengers.forEach((passenger2) => {
          content.push(`<option passenger_id="${passenger2.id}">${passenger2.name}</option>`);
        });
        content.push("</select><br>");
        let dismissed = true;
        new Dialog({
          title: game.i18n.localize("ASE.ThunderStep"),
          content,
          buttons: {
            one: {
              icon: `<i class="fas fa-check"></i>`,
              label: game.i18n.localize("ASE.Done"),
              callback: (html) => {
                const tokenId = html.find("select").find(":selected").attr("passenger_id");
                dismissed = false;
                resolve(tokenId);
              }
            }
          },
          default: game.i18n.localize("ASE.Cancel"),
          close: () => {
            if (dismissed) {
              resolve("cancel");
            }
          }
        }).render(true);
      }) : "noone";
      if (passenger === "cancel") {
        teleport_range[0].delete();
        damage_range[0].delete();
        return;
      }
      if (passenger !== "noone") {
        passengers.push(potentialPassengers.find((t) => t.id === passenger));
      }
    }
    passengers.push(tokenD);
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().from(tokenD).attachTo(crosshairs).persist().loopProperty("sprite", "rotation", { duration: 1e4, from: 0, to: 360 }).opacity(0.5).play();
    }, "displayCrosshairs");
    let crosshairsConfig = {
      size: 1,
      label: game.i18n.localize("ASE.ThunderStep"),
      tag: "thunder-step-crosshairs",
      drawIcon: false,
      drawOutline: false,
      interval: 2
    };
    let position = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
    teleport_range[0].delete();
    let targets = canvas.tokens.placeables.filter(function(target) {
      return target?.actor?.data?.data?.attributes?.hp?.value > 0 && canvas.grid.measureDistance(tokenD, target) <= 12.5 && passengers.indexOf(target) === -1;
    });
    new Sequence("Advanced Spell Effects").sound().file(teleportSound).volume(teleportVolume).delay(teleportSoundDelay).playIf(teleportSound !== "").effect().file("jb2a.shatter.blue").atLocation(tokenD, { cacheLocation: true }).scale(1.25).effect().file("jb2a.impact.ground_crack.01.blue").atLocation(tokenD, { cacheLocation: true }).belowTokens().delay(1400).wait(1300).thenDo(async () => {
      let targetUUIDs = targets.map((t) => t.document.uuid);
      console.log("ASE: Thunder Step: Targets: " + targetUUIDs);
      let stateOptions = {
        targets: targetUUIDs,
        targetted: true
      };
      game.ASESpellStateManager.addSpell(itemD.uuid, stateOptions);
      for await (let passenger of passengers) {
        const updateData = {
          x: position.x - canvas.grid.size / 2 + passenger.center.x - tokenD.center.x,
          y: position.y - canvas.grid.size / 2 + passenger.center.y - tokenD.center.y
        };
        await aseSocket.executeAsGM("updateDocument", passenger.id, updateData);
      }
    }, true).wait(250).sound().file(reappearSound).volume(reappearVolume).delay(reappearSoundDelay).playIf(reappearSound !== "").effect().baseFolder("modules/jb2a_patreon/Library/Generic/Impact").file("Impact_01_Regular_Blue_400x400.webm").atLocation(tokenD).scale(1.75).wait(50).thenDo(async () => {
      damage_range[0].delete();
    }, true).play();
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    soundOptions.push({
      label: game.i18n.localize("ASE.TeleportSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.teleportSound",
      flagName: "teleportSound",
      flagValue: currFlags?.teleportSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TeleportSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.teleportSoundDelay",
      flagName: "teleportSoundDelay",
      flagValue: currFlags?.teleportSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TeleportVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.teleportVolume",
      flagName: "teleportVolume",
      flagValue: currFlags?.teleportVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ReappearSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.reappearSound",
      flagName: "reappearSound",
      flagValue: currFlags?.reappearSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ReappearSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.reappearSoundDelay",
      flagName: "reappearSoundDelay",
      flagValue: currFlags?.reappearSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ReappearVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.reappearVolume",
      flagName: "reappearVolume",
      flagValue: currFlags?.reappearVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(thunderStep, "thunderStep");
class summonCreature {
  static registerHooks() {
    return;
  }
  static async doSummon(midiData) {
    async function myEffectFunction(template, effectInfo2, summonQty) {
      const portalAnim = `jb2a.portals.vertical.vortex.${effectInfo2.portalColor}`;
      const magicSignIntro = `jb2a.magic_signs.circle.02.${effectInfo2.magicSchool}.intro.${effectInfo2.magicSchoolColor}`;
      const magicSignLoop = `jb2a.magic_signs.circle.02.${effectInfo2.magicSchool}.loop.${effectInfo2.magicSchoolColor}`;
      const effectAAnim = `jb2a.eldritch_blast.${effectInfo2.effectAColor}.05ft`;
      const portalCloseAnim = `jb2a.impact.010.${effectInfo2.portalImpactColor}`;
      const portalSound = effectInfo2.portalSound ?? "";
      let portalSoundDelay = Number(effectInfo2.portalSoundDelay) ?? 0;
      if (!typeof portalSoundDelay === "number") {
        portalSoundDelay = 0;
      }
      const portalSoundVolume = effectInfo2.portalSoundVolume ?? 1;
      const circleSound = effectInfo2.circleSound ?? "";
      let circleSoundDelay = Number(effectInfo2.circleSoundDelay) ?? 0;
      if (!typeof circleSoundDelay === "number") {
        circleSoundDelay = 0;
      }
      const circleSoundVolume = effectInfo2.circleSoundVolume ?? 1;
      const effectASound = effectInfo2.effectASound ?? "";
      const effectASoundDelay = Number(effectInfo2.effectASoundDelay) ?? 0;
      const effectASoundVolume = effectInfo2.effectASoundVolume ?? 1;
      const portalCloseSound = effectInfo2.portalCloseSound ?? "";
      let portalCloseSoundDelay = Number(effectInfo2.portalCloseSoundDelay) ?? 0;
      if (!typeof portalCloseSoundDelay === "number") {
        portalCloseSoundDelay = 0;
      }
      const portalCloseSoundVolume = effectInfo2.portalCloseSoundVolume ?? 1;
      let baseScale = 0.75;
      new Sequence("Advanced Spell Effects").sound().file(circleSound).delay(circleSoundDelay).volume(circleSoundVolume).playIf(circleSound != "").effect().file(magicSignIntro).offset({ x: 0, y: canvas.grid.size }).atLocation(template).belowTokens().scale(0.25).waitUntilFinished(-2e3).effect().file(magicSignLoop).offset({ x: 0, y: canvas.grid.size }).atLocation(template).belowTokens().scale(0.25).persist().fadeOut(750, { ease: "easeInQuint" }).name("magicSignLoop").sound().file(effectASound).delay(effectASoundDelay).volume(effectASoundVolume).playIf(effectASound != "").effect().file(effectAAnim).offset({ x: 0, y: canvas.grid.size }).atLocation(template).waitUntilFinished(-1e3).endTime(3300).playbackRate(0.7).scaleOut(0, 500).scale(1.5).zIndex(1).center().belowTokens().sound().file(portalSound).delay(portalSoundDelay).volume(portalSoundVolume).playIf(portalSound != "").effect().belowTokens().zIndex(2).atLocation(template).file(portalAnim).fadeIn(500).offset({ x: 0, y: canvas.grid.size }).scale(0).animateProperty("sprite", "scale.x", { from: 0, to: baseScale, delay: 200, duration: 500, ease: "easeInOutCubic" }).animateProperty("sprite", "scale.y", { from: 0, to: baseScale, delay: 200, duration: 700, ease: "easeInOutCubic" }).animateProperty("sprite", "scale.x", { from: baseScale, to: 0, delay: 2500, duration: 500, ease: "easeInElastic" }).animateProperty("sprite", "scale.y", { from: baseScale, to: 0, delay: 2500, duration: 700, ease: "easeInElastic" }).wait(3e3).sound().file(portalCloseSound).delay(portalCloseSoundDelay).volume(portalCloseSoundVolume).playIf(portalCloseSound != "").effect().file(portalCloseAnim).atLocation(template).offset({ x: 0, y: canvas.grid.size }).play();
    }
    __name(myEffectFunction, "myEffectFunction");
    async function postEffects(template, token, effectInfo2) {
      let magicSignOutro = `jb2a.magic_signs.circle.02.${effectInfo2.magicSchool}.outro.${effectInfo2.magicSchoolColor}`;
      new Sequence("Advanced Spell Effects").effect().file(magicSignOutro).offset({ x: 0, y: canvas.grid.size }).atLocation(template).belowTokens().scale(0.25).thenDo(async () => {
        await Sequencer.EffectManager.endEffects({ name: "magicSignLoop" });
      }).wait(1500).effect().atLocation(token).scaleToObject().file(token.data.img).fadeIn(400).offset({ x: 0, y: canvas.grid.size }).animateProperty("sprite", "position.y", { from: 0, to: canvas.grid.size, duration: 400, ease: "easeInOutCubic" }).duration(500).fadeOut(50).wait(400).animation().on(token).fadeIn(100, { ease: "easeInQuint" }).play();
    }
    __name(postEffects, "postEffects");
    const casterActor = midiData.actor;
    canvas.tokens.get(midiData.tokenId);
    let item = midiData.item;
    let summonInfo = item.getFlag("advancedspelleffects", "effectOptions.summons");
    let effectInfo = item.getFlag("advancedspelleffects", "effectOptions");
    let summonOptionsData = { buttons: [] };
    for (let [type, info] of Object.entries(summonInfo)) {
      let buttonData = { label: info.name, value: [game.actors.get(info.actor).name, info.qty] };
      summonOptionsData.buttons.push(buttonData);
    }
    let chosenSummon = await warpgate.buttonDialog(summonOptionsData, "row");
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      const loadImage = /* @__PURE__ */ __name((src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }), "loadImage");
      let summonTokenData = await game.actors.getName(chosenSummon[0]).getTokenData();
      loadImage(summonTokenData.img).then(async (image) => {
        const summonImageScale = summonTokenData.width * canvas.grid.size / image.width;
        new Sequence("Advanced Spell Effects").effect().file(image.src).attachTo(crosshairs).persist().scale(summonImageScale).loopProperty("sprite", "rotation", { duration: 1e4, from: 0, to: 360 }).opacity(0.5).play();
      });
    }, "displayCrosshairs");
    let summonEffectCallbacks = {
      pre: async (template, update2) => {
        myEffectFunction(template, effectInfo, chosenSummon[1]);
        await warpgate.wait(1750);
      },
      post: async (template, token) => {
        postEffects(template, token, effectInfo);
        await warpgate.wait(500);
      },
      show: displayCrosshairs
    };
    let summonData = await game.actors.getName(chosenSummon[0]).getTokenData();
    let crosshairsConfig = {
      size: summonData.width,
      label: chosenSummon[0],
      tag: `summon-${chosenSummon[0]}-crosshairs`,
      drawIcon: false,
      drawOutline: false,
      interval: 2
    };
    let updates = {
      token: {
        "alpha": 0,
        "flags": { "advancedspelleffects": { "summoner": casterActor.id } }
      },
      actor: {},
      embedded: {}
    };
    if (effectInfo.isTashas) {
      console.log(`Scaling ${chosenSummon[0]} with spell level...`);
      let spellLevel = midiData.itemLevel;
      let hpBonus = 0;
      let acBonus = spellLevel;
      let damageBonus = spellLevel;
      let attackBonus = casterActor.data.data.attributes.spelldc - 8;
      let summonActor = game.actors.getName(chosenSummon[0]);
      switch (item.name) {
        case game.i18n.localize("ASE.SummonAberration"):
          hpBonus = 10 * (spellLevel - 4);
          break;
        case game.i18n.localize("ASE.SummonBeast"):
          hpBonus = 5 * (spellLevel - 2);
          break;
        case game.i18n.localize("ASE.SummonCelestial"):
          if (chosenSummon[0].includes(game.i18n.localize("ASE.Defender"))) {
            acBonus += 2;
          }
          hpBonus = 10 * (spellLevel - 5);
          break;
        case game.i18n.localize("ASE.SummonConstruct"):
          hpBonus = 15 * (spellLevel - 3);
          break;
        case game.i18n.localize("ASE.SummonElemental"):
          hpBonus = 10 * (spellLevel - 4);
          break;
        case game.i18n.localize("ASE.SummonFey"):
          hpBonus = 10 * (spellLevel - 3);
          break;
        case game.i18n.localize("ASE.SummonFiend"):
          hpBonus = 15 * (spellLevel - 6);
          break;
        case game.i18n.localize("ASE.SummonShadowspawn"):
          hpBonus = 15 * (spellLevel - 3);
          break;
        case game.i18n.localize("ASE.SummonUndead"):
          hpBonus = 10 * (spellLevel - 3);
          break;
      }
      if (hpBonus < 0) {
        hpBonus = 0;
      }
      updates.actor = {
        "data.attributes.hp": { value: summonActor.data.data.attributes.hp.max + hpBonus, max: summonActor.data.data.attributes.hp.max + hpBonus },
        "data.bonuses.msak": { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
        "data.bonuses.mwak": { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
        "data.bonuses.rsak": { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` },
        "data.bonuses.rwak": { attack: `- @mod - @prof + ${attackBonus}`, damage: `${damageBonus}` }
      };
      updates.embedded = {
        ActiveEffect: {
          "Spell Level Bonus - AC": {
            icon: "icons/magic/defensive/shield-barrier-blue.webp",
            label: game.i18n.localize("ASE.SpellLevelBonusACEffectLabel"),
            changes: [{
              "key": "data.attributes.ac.bonus",
              "mode": 2,
              "value": acBonus,
              "priority": 0
            }]
          }
        }
      };
    }
    const warpgateOptions = { controllingActor: game.actors.get(midiData.actor.id), duplicates: chosenSummon[1], crosshairs: crosshairsConfig };
    await warpgate.spawn(chosenSummon[0], updates, summonEffectCallbacks, warpgateOptions);
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    console.log("Detected summon concentration removal...");
    let summonedTokens = canvas.tokens.placeables.filter((token) => {
      return token.document.getFlag("advancedspelleffects", "summoner") == casterActor.id;
    });
    for (const summonedToken of summonedTokens) {
      await warpgate.dismiss(summonedToken.id);
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const magicSignsRaw = `jb2a.magic_signs.circle.02`;
    const magicSchoolOptions = getDBOptions(magicSignsRaw);
    const magicSchoolColorsRaw = `jb2a.magic_signs.circle.02.${currFlags.advancedspelleffects?.effectOptions?.magicSchool ?? "abjuration"}.intro`;
    const magicSchoolColorOptions = getDBOptions(magicSchoolColorsRaw);
    const effectAColorsRaw = `jb2a.eldritch_blast`;
    const effectAColorOptions = getDBOptions(effectAColorsRaw);
    const portalColorsRaw = `jb2a.portals.vertical.vortex`;
    const portalColorOptions = getDBOptions(portalColorsRaw);
    const portalImpactColorsRaw = `jb2a.impact.010`;
    const portalImpactColorOptions = getDBOptions(portalImpactColorsRaw);
    const summonActorsList = game.folders?.getName("ASE-Summons")?.contents ?? [];
    let summonOptions = [];
    let currentSummonTypes = {};
    summonActorsList.forEach((actor) => {
      let summonActor = {};
      summonActor.name = actor.name;
      summonActor.id = actor.id;
      summonOptions.push(summonActor);
    });
    currentSummonTypes = currFlags.summons ?? [{ name: "", actor: summonOptions[0].id, qty: 1 }];
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.magicSchool",
      options: magicSchoolOptions,
      flagName: "magicSchool",
      flagValue: currFlags.magicSchool ?? "abjuration"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolColorLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolColor",
      flagName: "magicSchoolColor",
      options: magicSchoolColorOptions,
      flagValue: currFlags.magicSchoolColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicCircleSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.circleSound",
      flagName: "circleSound",
      flagValue: currFlags.circleSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicCircleSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.circleSoundDelay",
      flagName: "circleSoundDelay",
      flagValue: currFlags.circleSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicCircleVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.circleVolume",
      flagName: "circleVolume",
      flagValue: currFlags.circleVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectAColorLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.effectAColor",
      flagName: "effectAColor",
      options: effectAColorOptions,
      flagValue: currFlags.effectAColor ?? "dark_green"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.effectASound",
      flagName: "effectASound",
      flagValue: currFlags.effectASound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.effectASoundDelay",
      flagName: "effectASoundDelay",
      flagValue: currFlags.effectASoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.effectAVolume",
      flagName: "effectAVolume",
      flagValue: currFlags.effectAVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.PortalColorLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.portalColor",
      flagName: "portalColor",
      options: portalColorOptions,
      flagValue: currFlags.portalColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.portalSound",
      flagName: "portalSound",
      flagValue: currFlags.portalSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.portalSoundDelay",
      flagName: "portalSoundDelay",
      flagValue: currFlags.portalSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.portalVolume",
      flagName: "portalVolume",
      flagValue: currFlags.portalVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.PortalCloseColorLabel"),
      type: "dropdown",
      name: "flags.advancedspelleffects.effectOptions.portalImpactColor",
      flagName: "portalImpactColor",
      options: portalImpactColorOptions,
      flagValue: currFlags.portalImpactColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalCloseSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.portalCloseSound",
      flagName: "portalCloseSound",
      flagValue: currFlags.portalCloseSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalCloseSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.portalCloseSoundDelay",
      flagName: "portalCloseSoundDelay",
      flagValue: currFlags.portalCloseSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PortalCloseVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.portalCloseVolume",
      flagName: "portalCloseVolume",
      flagValue: currFlags.portalCloseVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.UseTashasScalingLabel"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.isTashas",
      flagName: "isTashas",
      flagValue: currFlags.isTashas ?? false
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      summons: currentSummonTypes,
      summonOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(summonCreature, "summonCreature");
class witchBolt {
  static registerHooks() {
    Hooks.on("updateToken", witchBolt._updateToken);
    Hooks.on("updateCombat", witchBolt._updateCombat);
  }
  static async cast(midiData) {
    midiData.actor;
    let caster2 = canvas.tokens.get(midiData.tokenId);
    let target = Array.from(midiData.targets)[0];
    let effectOptions = midiData.item.getFlag("advancedspelleffects", "effectOptions");
    let boltFile = `jb2a.chain_lightning.primary.${effectOptions.initialBoltColor}`;
    let animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
    const initialBoltSound = effectOptions.initialBoltSound ?? "";
    const initialBoltSoundDelay = Number(effectOptions.initialBoltSoundDelay) ?? 0;
    const initialBoltSoundVolume = effectOptions.initialBoltSoundVolume ?? 1;
    const streamSound = effectOptions.streamCasterSound ?? "";
    const streamSoundDelay = Number(effectOptions.streamCasterSoundDelay) ?? 0;
    const streamVolume = effectOptions.streamCasterVolume ?? 1;
    const streamEasing = effectOptions.streamCasterEasing ?? true;
    const streamRadius = effectOptions.streamCasterRadius ?? 20;
    const soundOptions = {
      easing: streamEasing,
      sound: streamSound,
      radius: streamRadius,
      volume: streamVolume,
      delay: streamSoundDelay
    };
    const itemData = midiData.item.data.data;
    console.log(itemData);
    let missed = false;
    if (game.modules.get("midi-qol")?.active) {
      missed = Array.from(midiData.hitTargets).length == 0;
    }
    new Sequence("Advanced Spell Effects").sound().file(initialBoltSound).delay(initialBoltSoundDelay).volume(initialBoltSoundVolume).playIf(initialBoltSound != "").effect().file(boltFile).atLocation(caster2).stretchTo(target).missed(missed).waitUntilFinished(-900).effect().file(animFile).atLocation(caster2).stretchTo(target).persist().playIf(!missed).name(`${caster2.id}-witchBolt`).play();
    if (!missed) {
      await caster2.document.setFlag("advancedspelleffects", "witchBolt.casterId", caster2.id);
      await caster2.document.setFlag("advancedspelleffects", "witchBolt.targetId", target.id);
      const updates = {
        embedded: {
          Item: {}
        }
      };
      const activationItemName2 = game.i18n.localize("ASE.ActivateWitchBolt");
      updates.embedded.Item[activationItemName2] = {
        "type": "spell",
        "img": midiData.item.img,
        "data": {
          "ability": "",
          "actionType": "other",
          "activation": { "type": "action", "cost": 1, "condition": "" },
          "damage": itemData.damage,
          "level": midiData.itemLevel,
          "preparation": { "mode": "atwill", "prepared": true },
          "range": { "value": null, "long": null, "units": "" },
          "school": "con",
          "description": {
            "value": game.i18n.localize("ASE.ActivateWitchBoltDescription")
          }
        },
        "flags": {
          "advancedspelleffects": {
            "enableASE": true,
            "spellEffect": game.i18n.localize("ASE.ActivateWitchBolt"),
            "effectOptions": effectOptions
          }
        }
      };
      ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.ActivateWitchBolt") }));
      await warpgate.mutate(caster2.document, updates, {}, { name: `${caster2.actor.id}-witch-bolt` });
      if (effectOptions.streamCasterSound && effectOptions.streamCasterSound != "") {
        await placeSound(getCenter(caster2.document.data), soundOptions, caster2.document.id);
      }
    }
    async function placeSound(location, options, sourceId) {
      const soundData = [{
        easing: options.easing,
        path: options.sound,
        radius: options.radius,
        type: "1",
        volume: options.volume,
        x: location.x,
        y: location.y,
        flags: {
          tagger: {
            tags: [`ase-source-${sourceId}`]
          },
          advancedspelleffects: {
            sourceId
          }
        }
      }];
      return await aseSocket.executeAsGM("placeSounds", soundData, options.delay);
    }
    __name(placeSound, "placeSound");
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    console.log(`${casterToken.id}-witchBolt`);
    await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-witchBolt` });
    await casterToken.document.unsetFlag("advancedspelleffects", "witchBolt");
    ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.ActivateWitchBolt") }));
    await warpgate.revert(casterToken.document, `${casterActor.id}-witch-bolt`);
    const attachedSounds = await Tagger.getByTag([`ase-source-${casterToken.id}`]);
    if (!attachedSounds.length > 0) {
      return;
    }
    await canvas.scene.deleteEmbeddedDocuments("AmbientSound", attachedSounds.map((s) => s.id));
    return;
  }
  static async activateBolt(midiData) {
    let casterActor = midiData.actor;
    let caster2 = canvas.tokens.get(midiData.tokenId);
    let target = canvas.tokens.get(caster2.document.getFlag("advancedspelleffects", "witchBolt.targetId"));
    let effectOptions = midiData.item.getFlag("advancedspelleffects", "effectOptions");
    let boltFile = `jb2a.chain_lightning.primary.${effectOptions.initialBoltColor}`;
    const initialBoltSound = effectOptions.initialBoltSound ?? "";
    const initialBoltSoundDelay = Number(effectOptions.initialBoltSoundDelay) ?? 0;
    const initialBoltSoundVolume = effectOptions.initialBoltSoundVolume ?? 1;
    let itemData = midiData.item.data;
    const damageFormula = itemData.data.damage.parts[0];
    const damageType = itemData.data.damage.parts[1];
    console.log("damageFormula: ", damageFormula);
    let damageRoll = await new Roll(`${damageFormula}`).evaluate({ async: true });
    itemData.data.components.concentration = false;
    if (game.modules.get("midi-qol")?.active) {
      new MidiQOL.DamageOnlyWorkflow(casterActor, caster2.document, damageRoll.total, damageType, target ? [target] : [], damageRoll, { flavor: game.i18n.localize("ASE.WitchBoltDamageFlavor"), itemCardId: "new", itemData });
    }
    new Sequence("Advanced Spell Effects").sound().file(initialBoltSound).delay(initialBoltSoundDelay).volume(initialBoltSoundVolume).playIf(initialBoltSound != "").effect().file(boltFile).atLocation(caster2).stretchTo(target).play();
  }
  static async _updateToken(tokenDocument, updateData) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    if (!updateData.x && !updateData.y)
      return;
    let casterActor = tokenDocument.actor;
    let animFile = "";
    let witchBoltItem;
    let effectOptions;
    let witchBoltConcentration;
    let itemId;
    let origin;
    let witchBoltCasters = canvas.tokens.placeables.filter((token) => {
      return token.actor?.effects.filter((effect) => {
        let origin2 = effect.data.origin?.split(".");
        if (!origin2 || origin2?.length < 4)
          return false;
        let itemId2 = origin2[5] ?? origin2[3];
        let item = token.actor.items.get(itemId2);
        if (!item)
          return false;
        const spellEffect = item.getFlag("advancedspelleffects", "spellEffect") ?? void 0;
        if (!spellEffect)
          return false;
        return spellEffect == game.i18n.localize("ASE.WitchBolt");
      }).length > 0;
    });
    if (witchBoltCasters.length == 0)
      return;
    let isWitchBoltTarget = false;
    let castersOnTarget = [];
    witchBoltCasters.forEach((caster2) => {
      if (caster2.document.getFlag("advancedspelleffects", "witchBolt.targetId") == tokenDocument.id) {
        castersOnTarget.push(caster2);
        isWitchBoltTarget = true;
      }
    });
    if (isWitchBoltTarget) {
      let newPos = { x: 0, y: 0 };
      newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
      newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
      newPos = getCenter(newPos);
      for (let i = 0; i < castersOnTarget.length; i++) {
        let casterOnTarget = castersOnTarget[i];
        let distanceToTarget = measureDistance(newPos, casterOnTarget);
        await Sequencer.EffectManager.endEffects({ name: `${casterOnTarget.id}-witchBolt` });
        witchBoltConcentration = casterOnTarget.actor.effects.filter((effect) => {
          let origin2 = effect.data.origin?.split(".");
          if (!origin2 || origin2?.length < 4)
            return false;
          let itemId2 = origin2[5] ?? origin2[3];
          let item = casterOnTarget.actor.items.get(itemId2);
          if (!item)
            return false;
          const spellEffect = item.getFlag("advancedspelleffects", "spellEffect") ?? void 0;
          if (!spellEffect)
            return false;
          return spellEffect == game.i18n.localize("ASE.WitchBolt");
        })[0];
        if (distanceToTarget > 30) {
          await witchBoltConcentration.delete();
        } else {
          origin = witchBoltConcentration.data.origin?.split(".");
          if (!origin || origin?.length < 4)
            return false;
          itemId = origin[5] ?? origin[3];
          witchBoltItem = casterOnTarget.actor.items.get(itemId);
          effectOptions = witchBoltItem.getFlag("advancedspelleffects", "effectOptions");
          animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
          new Sequence("Advanced Spell Effects").effect().file(animFile).atLocation(casterOnTarget).stretchTo(newPos).persist().name(`${casterOnTarget.id}-witchBolt`).play();
        }
      }
    }
    witchBoltConcentration = casterActor.effects.filter((effect) => {
      let origin2 = effect.data.origin?.split(".");
      if (!origin2 || origin2?.length < 4)
        return false;
      let itemId2 = origin2[5] ?? origin2[3];
      let item = casterActor.items.get(itemId2);
      if (!item)
        return false;
      const spellEffect = item.getFlag("advancedspelleffects", "spellEffect") ?? void 0;
      if (!spellEffect)
        return false;
      return spellEffect == game.i18n.localize("ASE.WitchBolt");
    })[0];
    if (witchBoltConcentration) {
      let concOrigin = witchBoltConcentration.data.origin.split(".");
      if (!concOrigin || concOrigin?.length < 4)
        return false;
      let itemID = concOrigin[5] ?? concOrigin[3];
      witchBoltItem = casterActor.items.get(itemID);
      effectOptions = witchBoltItem.getFlag("advancedspelleffects", "effectOptions");
      animFile = `jb2a.witch_bolt.${effectOptions.streamColor}`;
      let effectInfo = tokenDocument.getFlag("advancedspelleffects", "witchBolt");
      if (effectInfo) {
        let target = canvas.tokens.get(effectInfo.targetId);
        let newPos = { x: 0, y: 0 };
        newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
        newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
        newPos = getCenter(newPos);
        await Sequencer.EffectManager.endEffects({ name: `${tokenDocument.id}-witchBolt` });
        let casterToTargetDist = measureDistance(newPos, target);
        if (casterToTargetDist > 30) {
          await witchBoltConcentration.delete();
          return;
        }
        new Sequence("Advanced Spell Effects").effect().file(animFile).atLocation(newPos).stretchTo(target).persist().name(`${tokenDocument.id}-witchBolt`).play();
        if (effectOptions.streamCasterSound && effectOptions.streamCasterSound != "") {
          await aseSocket.executeAsGM("moveSound", tokenDocument.id, newPos);
        }
      }
    }
  }
  static async _updateCombat(combat) {
    let currentCombatantId = combat.current.tokenId;
    let caster2 = canvas.tokens.get(currentCombatantId);
    if (!caster2)
      return;
    let casterActor = caster2.actor;
    if (!casterActor.isOwner || game.user.isGM && caster2.actor.hasPlayerOwner)
      return;
    let witchBoltConcentration = casterActor.effects.filter((effect) => {
      let origin = effect.data.origin?.split(".");
      if (!origin || origin?.length < 4)
        return false;
      let itemId = origin[5] ?? origin[3];
      let effectSource = casterActor.items.get(itemId)?.name;
      return effectSource == "Witch Bolt";
    })[0];
    if (witchBoltConcentration) {
      let confirmData = {
        buttons: [{ label: game.i18n.localize("ASE.Yes"), value: true }, { label: game.i18n.localize("ASE.No"), value: false }],
        title: game.i18n.localize("ASE.WitchBoltPromptTitle")
      };
      canvas.tokens.get(caster2.document.getFlag("advancedspelleffects", "witchBolt.targetId"));
      let concOrigin = witchBoltConcentration.data.origin.split(".");
      if (!concOrigin || concOrigin?.length < 4)
        return false;
      let itemID = concOrigin[5] ?? concOrigin[3];
      let witchBoltItem = casterActor.items.get(itemID);
      let confirm = await warpgate.buttonDialog(confirmData, "row");
      if (confirm) {
        await witchBolt.activateBolt({ actor: casterActor, item: witchBoltItem, tokenId: caster2.id });
      }
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const initialBoltAnim = "jb2a.chain_lightning.primary";
    const initialBoltColorOptions = getDBOptions(initialBoltAnim);
    const streamAnim = "jb2a.witch_bolt";
    const streamColorOptions = getDBOptions(streamAnim);
    let animOptions = [];
    let soundOptions = [];
    let spellOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.InitialBoltColorLabel"),
      type: "dropdown",
      options: initialBoltColorOptions,
      name: "flags.advancedspelleffects.effectOptions.initialBoltColor",
      flagName: "initialBoltColor",
      flagValue: currFlags.initialBoltColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.InitialBoltSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.initialBoltSound",
      flagName: "initialBoltSound",
      flagValue: currFlags.initialBoltSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.InitialBoltSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.initialBoltSoundDelay",
      flagName: "initialBoltSoundDelay",
      flagValue: currFlags.initialBoltSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.InitialBoltVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.initialBoltVolume",
      flagName: "initialBoltVolume",
      flagValue: currFlags.initialBoltVolume ?? 1,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamColorLabel"),
      type: "dropdown",
      options: streamColorOptions,
      name: "flags.advancedspelleffects.effectOptions.streamColor",
      flagName: "streamColor",
      flagValue: currFlags.streamColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.streamCasterSound",
      flagName: "streamCasterSound",
      flagValue: currFlags.streamCasterSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.streamCasterSoundDelay",
      flagName: "streamCasterSoundDelay",
      flagValue: currFlags.streamCasterSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.streamCasterVolume",
      flagName: "streamCasterVolume",
      flagValue: currFlags.streamCasterVolume ?? 1,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamSoundEasingLabel"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.streamCasterEasing",
      flagName: "streamCasterEasing",
      flagValue: currFlags.streamCasterEasing ?? true
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ContinuousStreamSoundRadiusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.streamCasterRadius",
      flagName: "streamCasterRadius",
      flagValue: currFlags.streamCasterRadius ?? 20
    });
    return {
      animOptions,
      spellOptions,
      soundOptions
    };
  }
}
__name(witchBolt, "witchBolt");
function MissileMarkerSequence(effectOptions, target, index, type) {
  let markerAnim = `${effectOptions.targetMarkerType}.${effectOptions.targetMarkerColor}`;
  const markerSound = effectOptions.markerSound ?? "";
  const markerSoundDelay = Number(effectOptions.markerSoundDelay) ?? 0;
  const markerSoundVolume = Number(effectOptions.markerVolume) ?? 1;
  const markerAnimHue = effectOptions.targetMarkerHue ?? 0;
  const markerAnimSaturation = effectOptions.targetMarkerSaturation ?? 0;
  let baseScale = effectOptions.baseScale;
  let baseOffset = canvas.grid.size / 2;
  let offsetMod = -(1 / 4) * index + 1;
  let offset = { x: baseOffset * offsetMod, y: baseOffset };
  let markerSeq = new Sequence("Advanced Spell Effects").sound().file(markerSound).delay(markerSoundDelay).volume(markerSoundVolume).playIf(markerSound != "").effect().attachTo(target, { followRotation: false }).filter("ColorMatrix", { hue: markerAnimHue, saturate: markerAnimSaturation }).locally().file(markerAnim).scale(0.01).name(`missile-target-${target.id}-${index}`).offset(offset).persist().animateProperty("sprite", "scale.x", { from: 0.01, to: baseScale, delay: 200, duration: 700, ease: "easeOutBounce" }).animateProperty("sprite", "scale.y", { from: 0.01, to: baseScale, duration: 900, ease: "easeOutBounce" });
  if (type == "advantage") {
    markerSeq.loopProperty("sprite", "position.y", { from: 0, to: -10, duration: 1e3, ease: "easeInOutSine", pingPong: true });
  } else if (type == "disadvantage") {
    markerSeq.loopProperty("sprite", "position.y", { from: 0, to: 10, duration: 1e3, ease: "easeInOutSine", pingPong: true });
  }
  return markerSeq;
}
__name(MissileMarkerSequence, "MissileMarkerSequence");
function MissileSequence(data) {
  const caster2 = data.caster;
  const target = data.targets[0] ?? false;
  const effectOptions = data.effectOptions ?? {};
  const hit = data.hit ?? false;
  let intro = data.intro ?? false;
  const missileIntroSound = effectOptions.missileIntroSound ?? "";
  const missleIntroPlayback = effectOptions.missileIntroSoundPlayback ?? "indiv";
  let missileIntroSoundDelay = Number(effectOptions.missileIntroSoundDelay) ?? 0;
  let missileIntroVolume = Number(effectOptions.missileIntroVolume) ?? 1;
  const impactDelay = Number(effectOptions.impactDelay) ?? -1e3;
  const missileImpactSound = effectOptions.missileImpactSound ?? "";
  effectOptions.missileImpactSoundPlayback ?? "indiv";
  let missileImpactSoundDelay = Number(effectOptions.missileImpactSoundDelay) ?? 0;
  let missileImpactVolume = Number(effectOptions.missileImpactVolume) ?? 1;
  let missileAnim = `${effectOptions.missileAnim}.${effectOptions.missileColor}`;
  let missileSequence;
  if (intro) {
    missileSequence = new Sequence("Advanced Spell Effects").sound().file(missileIntroSound).delay(missileIntroSoundDelay).volume(missileIntroVolume).playIf(missileIntroSound != "" && missleIntroPlayback == "group");
  } else {
    missileSequence = new Sequence("Advanced Spell Effects").sound().file(missileIntroSound).delay(missileIntroSoundDelay).volume(missileIntroVolume).playIf(missileIntroSound != "" && missleIntroPlayback == "indiv").effect().file(missileAnim).atLocation(caster2).randomizeMirrorY().missed(!hit).stretchTo(target).randomOffset(0.65).waitUntilFinished(impactDelay).sound().file(missileImpactSound).delay(missileImpactSoundDelay).volume(missileImpactVolume).playIf(missileImpactSound != "");
  }
  return missileSequence;
}
__name(MissileSequence, "MissileSequence");
async function MissileChatBuilder(data) {
  let content = `<table id="ASEmissileDialogChatTable"><tr><th>${localize("ASE.Target")}</th><th>Hit / Miss</th><th>${localize("ASE.AttackRoll")}</th><th>${localize("ASE.DamageRoll")}</th>`;
  let rolls = data.rolls;
  console.log("ASE: Missile Chat Builder: Data", data);
  console.log("ASE: Missile Chat Builder: Rolls", rolls);
  for (let i = 0; i < rolls.length; i++) {
    let currAttackRoll = rolls[i].attackRoll;
    let currDamageRoll = rolls[i].damageRoll ?? {};
    let currTarget = rolls[i].target;
    let currTargetName = currTarget.name;
    let hit = !currAttackRoll ? true : rolls[i].hit;
    let currAttackBreakDown = "";
    let currDamageBreakdown = "";
    let damageTotalText = "";
    if (currAttackRoll) {
      if (currAttackRoll.hasAdvantage || currAttackRoll.hasDisadvantage) {
        let advantageText = "";
        currAttackRoll.dice[0].results.forEach((result) => {
          advantageText += result.result + ", ";
        });
        advantageText = advantageText.slice(0, -2);
        currAttackBreakDown = `[${currAttackRoll.hasAdvantage ? "Advantage" : "Disadvantage"} : ${advantageText}] - [${currAttackRoll.result}]`;
      } else {
        currAttackBreakDown = `[${currAttackRoll.result}]`;
      }
      if (currDamageRoll.isCritical) {
        currAttackRoll._total = `Critical!`;
      }
    } else {
      currAttackBreakDown = "NO ROLL";
      currAttackRoll = { _total: " - " };
    }
    if (hit) {
      currDamageBreakdown = `${currDamageRoll.formula} : ${currDamageRoll.result}`;
      damageTotalText = currDamageRoll.total;
    } else {
      currDamageBreakdown = `NO ROLL`;
      damageTotalText = ` - `;
    }
    content += `<tr><td><figure style="overflow: auto;"><img style="float: left;" alt="Token" src="${currTarget.data.img}" height="40" style="border:0px"><figcaption style="white-space: nowrap;">${currTargetName}</figcaption></figure></td><td>${hit ? "Hit" : "Miss"}</td><td title = '${currAttackBreakDown}'>${currAttackRoll._total}</td><td title = '${currDamageBreakdown}'>${damageTotalText}</td></tr>`;
  }
  return content;
}
__name(MissileChatBuilder, "MissileChatBuilder");
function get_each_context$7(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[16] = i;
  return child_ctx;
}
__name(get_each_context$7, "get_each_context$7");
function create_each_block$7(key_1, ctx) {
  let tr;
  let td0;
  let label;
  let img;
  let img_src_value;
  let t0;
  let t1_value = ctx[14].token.document.data.name + "";
  let t1;
  let label_for_value;
  let t2;
  let td1;
  let input;
  let input_id_value;
  let input_value_value;
  let t3;
  let td2;
  let button0;
  let t4;
  let button1;
  let t5;
  let mounted;
  let dispose;
  return {
    key: key_1,
    first: null,
    c() {
      tr = element("tr");
      td0 = element("td");
      label = element("label");
      img = element("img");
      t0 = text(" - ");
      t1 = text(t1_value);
      t2 = space();
      td1 = element("td");
      input = element("input");
      t3 = space();
      td2 = element("td");
      button0 = element("button");
      button0.innerHTML = `<i class="fas fa-plus"></i>`;
      t4 = space();
      button1 = element("button");
      button1.innerHTML = `<i class="fas fa-minus"></i>`;
      t5 = space();
      attr(img, "alt", "Token");
      if (!src_url_equal(img.src, img_src_value = ctx[14].token.document.data.img))
        attr(img, "src", img_src_value);
      attr(img, "width", "30");
      attr(img, "height", "30");
      set_style(img, "border", "0px");
      attr(label, "for", label_for_value = ctx[14].token.document.id + "-missiles");
      set_style(input, "width", "2em");
      attr(input, "type", "number");
      attr(input, "id", input_id_value = ctx[14].token.document.id + "-missiles");
      input.readOnly = true;
      input.value = input_value_value = ctx[14].missilesAssigned;
      this.first = tr;
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, label);
      append(label, img);
      append(label, t0);
      append(label, t1);
      append(tr, t2);
      append(tr, td1);
      append(td1, input);
      append(tr, t3);
      append(tr, td2);
      append(td2, button0);
      append(td2, t4);
      append(td2, button1);
      append(tr, t5);
      if (!mounted) {
        dispose = [
          listen(button0, "click", function() {
            if (is_function(ctx[5](ctx[14].token, ctx[16])))
              ctx[5](ctx[14].token, ctx[16]).apply(this, arguments);
          }),
          listen(button1, "click", function() {
            if (is_function(ctx[6](ctx[14].token, ctx[16])))
              ctx[6](ctx[14].token, ctx[16]).apply(this, arguments);
          }),
          listen(tr, "mouseenter", function() {
            if (is_function(ctx[14].token._onHoverIn()))
              ctx[14].token._onHoverIn().apply(this, arguments);
          }),
          listen(tr, "mouseleave", function() {
            if (is_function(ctx[14].token._onHoverOut()))
              ctx[14].token._onHoverOut().apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 16 && !src_url_equal(img.src, img_src_value = ctx[14].token.document.data.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 16 && t1_value !== (t1_value = ctx[14].token.document.data.name + ""))
        set_data(t1, t1_value);
      if (dirty & 16 && label_for_value !== (label_for_value = ctx[14].token.document.id + "-missiles")) {
        attr(label, "for", label_for_value);
      }
      if (dirty & 16 && input_id_value !== (input_id_value = ctx[14].token.document.id + "-missiles")) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 16 && input_value_value !== (input_value_value = ctx[14].missilesAssigned) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_each_block$7, "create_each_block$7");
function create_default_slot$1(ctx) {
  let form_1;
  let t0;
  let section;
  let p0;
  let t1_value = localize("ASE.MissileDialogInstructionsA") + "";
  let t1;
  let t2;
  let t3_value = ctx[1].effectOptions.missileType + "";
  let t3;
  let t4;
  let p1;
  let t6;
  let p2;
  let t8;
  let p3;
  let t9_value = localize("ASE.MissileDialogInstructionsD") + "";
  let t9;
  let t10;
  let t11_value = ctx[1].effectOptions.missileType + "";
  let t11;
  let t12;
  let p4;
  let t13_value = localize("ASE.MissileDialogMissileCountLabel") + "";
  let t13;
  let t14;
  let b;
  let t15;
  let t16;
  let t17_value = ctx[1].effectOptions.missileType + "";
  let t17;
  let t18_value = ctx[3] != 1 ? "s" : "";
  let t18;
  let t19;
  let table;
  let tbody;
  let tr;
  let th0;
  let t21;
  let th1;
  let t22_value = ctx[1].effectOptions.missileType + "";
  let t22;
  let t23;
  let t24;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t25;
  let footer;
  let button;
  let i;
  let t26;
  let t27_value = localize("ASE.Done") + "";
  let t27;
  let mounted;
  let dispose;
  let each_value = ctx[4];
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[14].token, "get_key");
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    let child_ctx = get_each_context$7(ctx, each_value, i2);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i2] = create_each_block$7(key, child_ctx));
  }
  return {
    c() {
      form_1 = element("form");
      t0 = space();
      section = element("section");
      p0 = element("p");
      t1 = text(t1_value);
      t2 = space();
      t3 = text(t3_value);
      t4 = space();
      p1 = element("p");
      p1.textContent = `${localize("ASE.MissileDialogInstructionsB")}`;
      t6 = space();
      p2 = element("p");
      p2.textContent = `${localize("ASE.MissileDialogInstructionsC")}`;
      t8 = space();
      p3 = element("p");
      t9 = text(t9_value);
      t10 = space();
      t11 = text(t11_value);
      t12 = space();
      p4 = element("p");
      t13 = text(t13_value);
      t14 = space();
      b = element("b");
      t15 = text(ctx[3]);
      t16 = space();
      t17 = text(t17_value);
      t18 = text(t18_value);
      t19 = space();
      table = element("table");
      tbody = element("tbody");
      tr = element("tr");
      th0 = element("th");
      th0.textContent = `${localize("ASE.Target")}`;
      t21 = space();
      th1 = element("th");
      t22 = text(t22_value);
      t23 = text("(s)");
      t24 = space();
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t25 = space();
      footer = element("footer");
      button = element("button");
      i = element("i");
      t26 = space();
      t27 = text(t27_value);
      attr(form_1, "autocomplete", "off");
      attr(form_1, "id", "missile-dialog-form");
      attr(form_1, "class", "overview");
      attr(table, "id", "targetsTable");
      attr(table, "width", "100%");
      attr(section, "class", "content");
      attr(i, "class", "fa fa-check-square");
      attr(footer, "class", "sheet-footer flexrow");
    },
    m(target, anchor) {
      insert(target, form_1, anchor);
      ctx[9](form_1);
      insert(target, t0, anchor);
      insert(target, section, anchor);
      append(section, p0);
      append(p0, t1);
      append(p0, t2);
      append(p0, t3);
      append(section, t4);
      append(section, p1);
      append(section, t6);
      append(section, p2);
      append(section, t8);
      append(section, p3);
      append(p3, t9);
      append(p3, t10);
      append(p3, t11);
      append(section, t12);
      append(section, p4);
      append(p4, t13);
      append(p4, t14);
      append(p4, b);
      append(b, t15);
      append(p4, t16);
      append(p4, t17);
      append(p4, t18);
      append(section, t19);
      append(section, table);
      append(table, tbody);
      append(tbody, tr);
      append(tr, th0);
      append(tr, t21);
      append(tr, th1);
      append(th1, t22);
      append(th1, t23);
      append(tbody, t24);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(tbody, null);
      }
      insert(target, t25, anchor);
      insert(target, footer, anchor);
      append(footer, button);
      append(button, i);
      append(button, t26);
      append(button, t27);
      if (!mounted) {
        dispose = [
          listen(form_1, "submit", prevent_default(ctx[8])),
          listen(button, "click", ctx[7])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t3_value !== (t3_value = ctx2[1].effectOptions.missileType + ""))
        set_data(t3, t3_value);
      if (dirty & 2 && t11_value !== (t11_value = ctx2[1].effectOptions.missileType + ""))
        set_data(t11, t11_value);
      if (dirty & 8)
        set_data(t15, ctx2[3]);
      if (dirty & 2 && t17_value !== (t17_value = ctx2[1].effectOptions.missileType + ""))
        set_data(t17, t17_value);
      if (dirty & 8 && t18_value !== (t18_value = ctx2[3] != 1 ? "s" : ""))
        set_data(t18, t18_value);
      if (dirty & 2 && t22_value !== (t22_value = ctx2[1].effectOptions.missileType + ""))
        set_data(t22, t22_value);
      if (dirty & 112) {
        each_value = ctx2[4];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, tbody, destroy_block, create_each_block$7, null, get_each_context$7);
      }
    },
    d(detaching) {
      if (detaching)
        detach(form_1);
      ctx[9](null);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(section);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].d();
      }
      if (detaching)
        detach(t25);
      if (detaching)
        detach(footer);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_default_slot$1, "create_default_slot$1");
function create_fragment$9(ctx) {
  let applicationshell;
  let updating_elementRoot;
  let current;
  function applicationshell_elementRoot_binding(value) {
    ctx[10](value);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  let applicationshell_props = {
    $$slots: { default: [create_default_slot$1] },
    $$scope: { ctx }
  };
  if (ctx[0] !== void 0) {
    applicationshell_props.elementRoot = ctx[0];
  }
  applicationshell = new ApplicationShell({ props: applicationshell_props });
  binding_callbacks.push(() => bind(applicationshell, "elementRoot", applicationshell_elementRoot_binding));
  return {
    c() {
      create_component(applicationshell.$$.fragment);
    },
    m(target, anchor) {
      mount_component(applicationshell, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const applicationshell_changes = {};
      if (dirty & 131102) {
        applicationshell_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_elementRoot && dirty & 1) {
        updating_elementRoot = true;
        applicationshell_changes.elementRoot = ctx2[0];
        add_flush_callback(() => updating_elementRoot = false);
      }
      applicationshell.$set(applicationshell_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(applicationshell.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(applicationshell.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(applicationshell, detaching);
    }
  };
}
__name(create_fragment$9, "create_fragment$9");
function instance$9($$self, $$props, $$invalidate) {
  let { elementRoot } = $$props;
  let { data } = $$props;
  const { application } = getContext("external");
  let form = void 0;
  console.log("Missile Dialog App Shell: ------ Entering App Shell -------");
  document.addEventListener("mouseup", handleClick, false);
  let missilesRemaining = data.numMissiles;
  let targets = [];
  let attacks = [];
  game.user.updateTokenTargets([]);
  onDestroy(async () => {
    console.log("the missile dialog is being destroyed...", application);
    document.removeEventListener("mouseup", handleClick, false);
    Sequencer.EffectManager.endEffects({ name: `missile-target-*` });
    await aseSocket.executeAsGM("updateFlag", game.user.id, "missileDialogPos", {
      left: application.position.left,
      top: application.position.top
    });
  });
  function handleClick(event) {
    let attackType = event.altKey ? "advantage" : event.ctrlKey ? "disadvantage" : "";
    let token = canvas.tokens.placeables.filter((token2) => {
      const mouse = canvas.app.renderer.plugins.interaction.mouse;
      const mouseLocal = mouse.getLocalPosition(token2);
      return mouseLocal.x >= 0 && mouseLocal.x <= token2.hitArea.width && mouseLocal.y >= 0 && mouseLocal.y <= token2.hitArea.height;
    })[0];
    if (token) {
      let targetIndex = targets.findIndex((target) => target.token === token);
      if (event.button == 0) {
        addMissile(token, targetIndex, attackType);
      } else if (event.button == 2) {
        removeMissile(token, targetIndex);
      }
    }
  }
  __name(handleClick, "handleClick");
  async function addMissile(token, targetIndex, type = "") {
    if (missilesRemaining <= 0) {
      ui.notifications.info("Missile Limit Reached!");
      return;
    }
    $$invalidate(3, missilesRemaining--, missilesRemaining);
    attacks.push({ token, type });
    attacks = attacks;
    let markerIndex = attacks.filter((attack) => attack.token === token).length - 1;
    let markerSequence = MissileMarkerSequence(data.effectOptions, token, markerIndex, type);
    markerSequence.play();
    if (targetIndex == -1) {
      targets.push({ token, missilesAssigned: 1 });
      $$invalidate(4, targets);
    } else {
      $$invalidate(4, targets[targetIndex].missilesAssigned++, targets);
      $$invalidate(4, targets);
    }
  }
  __name(addMissile, "addMissile");
  function removeMissile(token, targetIndex) {
    if (targetIndex > -1) {
      $$invalidate(3, missilesRemaining++, missilesRemaining);
      let attackIndex = attacks.slice().reverse().findIndex((attack) => attack.token === token);
      let markerIndex = attacks.filter((attack) => attack.token === token).length - 1;
      Sequencer.EffectManager.endEffects({
        name: `missile-target-${token.id}-${markerIndex}`,
        object: token
      });
      attacks.splice(attacks.length - 1 - attackIndex, 1);
      attacks = attacks;
      $$invalidate(4, targets[targetIndex].missilesAssigned--, targets);
      if (targets[targetIndex].missilesAssigned <= 0) {
        targets.splice(targetIndex, 1);
      }
      $$invalidate(4, targets);
    }
  }
  __name(removeMissile, "removeMissile");
  function launchMissiles() {
    if (attacks.length > 0) {
      let targetUuids = [];
      attacks.forEach((attack) => {
        targetUuids.push(attack.token.document.uuid);
      });
      const dialogData = {
        targets: targetUuids,
        attacks,
        casterId: data.casterId,
        itemCardId: data.itemCardId,
        iterate: "targets",
        sequenceBuilder: MissileSequence,
        sequences: [
          MissileSequence({
            intro: true,
            caster: data.casterId,
            effectOptions: data.effectOptions,
            targets: []
          })
        ],
        effectOptions: data.effectOptions,
        chatBuilder: MissileChatBuilder,
        rolls: []
      };
      const itemUUID = data.item.uuid;
      game.ASESpellStateManager.addSpell(itemUUID, dialogData);
    }
    application.close();
  }
  __name(launchMissiles, "launchMissiles");
  function submit_handler(event) {
    bubble.call(this, $$self, event);
  }
  __name(submit_handler, "submit_handler");
  function form_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      form = $$value;
      $$invalidate(2, form);
    });
  }
  __name(form_1_binding, "form_1_binding");
  function applicationshell_elementRoot_binding(value) {
    elementRoot = value;
    $$invalidate(0, elementRoot);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  $$self.$$set = ($$props2) => {
    if ("elementRoot" in $$props2)
      $$invalidate(0, elementRoot = $$props2.elementRoot);
    if ("data" in $$props2)
      $$invalidate(1, data = $$props2.data);
  };
  return [
    elementRoot,
    data,
    form,
    missilesRemaining,
    targets,
    addMissile,
    removeMissile,
    launchMissiles,
    submit_handler,
    form_1_binding,
    applicationshell_elementRoot_binding
  ];
}
__name(instance$9, "instance$9");
class MissileDialogAppShell extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, { elementRoot: 0, data: 1 });
  }
  get elementRoot() {
    return this.$$.ctx[0];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
  get data() {
    return this.$$.ctx[1];
  }
  set data(data) {
    this.$$set({ data });
    flush();
  }
}
__name(MissileDialogAppShell, "MissileDialogAppShell");
class MissileDialog$1 extends SvelteApplication {
  constructor(data) {
    super({
      title: localize("ASE.SelectTargetsDialogTitle"),
      id: "missile-dialog-shell",
      zIndex: 102,
      svelte: {
        class: MissileDialogAppShell,
        target: document.body,
        props: {
          data
        }
      },
      close: () => {
        console.log("ASE: Missile Dialog Closed!");
      }
    });
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizable: true,
      minimizable: true,
      width: "auto",
      height: "auto",
      left: game.user?.getFlag("advancedspelleffects", "missileDialogPos.left") ?? "auto",
      top: game.user?.getFlag("advancedspelleffects", "missileDialogPos.top") ?? "auto",
      closeOnSubmit: true
    });
  }
}
__name(MissileDialog$1, "MissileDialog$1");
class magicMissile {
  static async registerHooks() {
    return;
  }
  static async _preloadAssets() {
    console.log("Preloading assets for ASE Magic Missile...");
    let assetDBPaths = [];
    let magicMissileItems = getAllItemsNamed("Magic Missile");
    if (magicMissileItems.length > 0) {
      for (let item of magicMissileItems) {
        let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
        let missileAnim = `jb2a.magic_missile.${aseSettings.missileColor}`;
        let markerAnim = `jb2a.moonbeam.01.loop.${aseSettings.targetMarkerColor}`;
        if (!assetDBPaths.includes(missileAnim))
          assetDBPaths.push(missileAnim);
        if (!assetDBPaths.includes(markerAnim))
          assetDBPaths.push(markerAnim);
      }
    }
    console.log(`Preloaded ${assetDBPaths.length} assets for Magic Missile!`);
    await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
    return;
  }
  static async selectTargets(midiData) {
    midiData.actor;
    const casterToken = canvas.tokens.get(midiData.tokenId);
    const numMissiles = Number(midiData.itemLevel) + 2;
    const itemCardId = midiData.itemCardId;
    const spellItem = midiData.item;
    const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
    aseEffectOptions["targetMarkerType"] = "jb2a.moonbeam.01.loop";
    aseEffectOptions["missileType"] = "dart";
    aseEffectOptions["missileAnim"] = "jb2a.magic_missile";
    aseEffectOptions["baseScale"] = 0.05;
    aseEffectOptions["dmgDie"] = aseEffectOptions.dmgDie ?? "d4";
    aseEffectOptions["dmgDieCount"] = aseEffectOptions.dmgDieCount ?? 1;
    aseEffectOptions["dmgType"] = "force";
    aseEffectOptions["dmgMod"] = aseEffectOptions.dmgMod ?? 1;
    aseEffectOptions["impactDelay"] = -1e3;
    new MissileDialog$1({ casterId: casterToken.id, numMissiles, itemCardId, effectOptions: aseEffectOptions, item: spellItem }).render(true);
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const missileColorOptions = getDBOptions("jb2a.magic_missile");
    const targetMarkerColorOptions = getDBOptions("jb2a.moonbeam.01.loop");
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const dieOptions = [
      { "d4": "d4" },
      { "d6": "d6" },
      { "d8": "d8" },
      { "d10": "d10" },
      { "d12": "d12" },
      { "d20": "d20" }
    ];
    const soundPlaybackOptions = [
      { "indiv": "Individual" },
      { "group": "Group" }
    ];
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieCountLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgDieCount",
      flagName: "dmgDieCount",
      flagValue: currFlags.dmgDieCount ?? 1
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieLabel"),
      type: "dropdown",
      options: dieOptions,
      name: "flags.advancedspelleffects.effectOptions.dmgDie",
      flagName: "dmgDie",
      flagValue: currFlags.dmgDie ?? "d10"
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageBonusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgMod",
      flagName: "dmgMod",
      flagValue: currFlags.dmgMod ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetmarkerColorLabel"),
      type: "dropdown",
      options: targetMarkerColorOptions,
      name: "flags.advancedspelleffects.effectOptions.targetMarkerColor",
      flagName: "targetMarkerColor",
      flagValue: currFlags.targetMarkerColor ?? "blue"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerHueLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerHue",
      flagName: "targetMarkerHue",
      flagValue: currFlags.targetMarkerHue ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSaturationLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerSaturation",
      flagName: "targetMarkerSaturation",
      flagValue: currFlags.targetMarkerSaturation ?? 0,
      min: -1,
      max: 1,
      step: 0.1
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.markerSound",
      flagName: "markerSound",
      flagValue: currFlags.markerSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.markerSoundDelay",
      flagName: "markerSoundDelay",
      flagValue: currFlags.markerSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.markerVolume",
      flagName: "markerVolume",
      flagValue: currFlags.markerVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DartColorLabel"),
      type: "dropdown",
      options: missileColorOptions,
      name: "flags.advancedspelleffects.effectOptions.missileColor",
      flagName: "missileColor",
      flagValue: currFlags.missileColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartIntroSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSound",
      flagName: "missileIntroSound",
      flagValue: currFlags.missileIntroSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartIntroSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundDelay",
      flagName: "missileIntroSoundDelay",
      flagValue: currFlags.missileIntroSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartIntroVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroVolume",
      flagName: "missileIntroVolume",
      flagValue: currFlags.missileIntroVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundPlayback",
      flagName: "missileIntroSoundPlayback",
      flagValue: currFlags.missileIntroSoundPlayback ?? "indiv"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartImpactSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSound",
      flagName: "missileImpactSound",
      flagValue: currFlags.missileImpactSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartImpactSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.DartImpactSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundDelay",
      flagName: "missileImpactSoundDelay",
      flagValue: currFlags.missileImpactSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DartImpactVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactVolume",
      flagName: "missileImpactVolume",
      flagValue: currFlags.missileImpactVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundPlayback",
      flagName: "missileImpactSoundPlayback",
      flagValue: currFlags.missileImpactSoundPlayback ?? "indiv"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(magicMissile, "magicMissile");
class scorchingRay {
  static async registerHooks() {
    return;
  }
  static async _preloadAssets() {
    console.log("Preloading assets for ASE Scorching Ray...");
    let assetDBPaths = [];
    let scorchingRayItems = getAllItemsNamed("Scorching Ray");
    if (scorchingRayItems.length > 0) {
      for (let item of scorchingRayItems) {
        let aseSettings = item.getFlag("advancedspelleffects", "effectOptions");
        let missileAnim = `jb2a.scorching_ray.${aseSettings.missileColor}`;
        let markerAnim = `jb2a.markers.01.${aseSettings.targetMarkerColor}`;
        if (!assetDBPaths.includes(missileAnim))
          assetDBPaths.push(missileAnim);
        if (!assetDBPaths.includes(markerAnim))
          assetDBPaths.push(markerAnim);
      }
    }
    console.log(`Preloaded ${assetDBPaths.length} assets for Scorching Ray!`);
    await Sequencer.Preloader.preloadForClients(assetDBPaths, true);
    return;
  }
  static async selectTargets(midiData) {
    midiData.actor;
    const casterToken = canvas.tokens.get(midiData.tokenId);
    const numMissiles = Number(midiData.itemLevel) + 1;
    const itemCardId = midiData.itemCardId;
    const spellItem = midiData.item;
    const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
    aseEffectOptions["targetMarkerType"] = "jb2a.markers.01";
    aseEffectOptions["missileType"] = "ray";
    aseEffectOptions["missileAnim"] = "jb2a.scorching_ray";
    aseEffectOptions["baseScale"] = 0.1;
    aseEffectOptions["dmgDie"] = aseEffectOptions.dmgDie ?? "d6";
    aseEffectOptions["dmgDieCount"] = aseEffectOptions.dmgDieCount ?? 2;
    aseEffectOptions["dmgType"] = "fire";
    aseEffectOptions["dmgMod"] = aseEffectOptions.dmgMod ?? 0;
    aseEffectOptions["impactDelay"] = -1e3;
    new MissileDialog$1({
      casterId: casterToken.id,
      numMissiles,
      itemCardId,
      effectOptions: aseEffectOptions,
      item: spellItem,
      actionType: "rsak"
    }).render(true);
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const missileColorOptions = getDBOptions("jb2a.scorching_ray.02");
    const targetMarkerColorOptions = getDBOptions("jb2a.markers.01");
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const dieOptions = [
      { "d4": "d4" },
      { "d6": "d6" },
      { "d8": "d8" },
      { "d10": "d10" },
      { "d12": "d12" },
      { "d20": "d20" }
    ];
    const soundPlaybackOptions = [
      { "indiv": "Individual" },
      { "group": "Group" }
    ];
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieCountLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgDieCount",
      flagName: "dmgDieCount",
      flagValue: currFlags.dmgDieCount ?? 1
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieLabel"),
      type: "dropdown",
      options: dieOptions,
      name: "flags.advancedspelleffects.effectOptions.dmgDie",
      flagName: "dmgDie",
      flagValue: currFlags.dmgDie ?? "d10"
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageBonusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgMod",
      flagName: "dmgMod",
      flagValue: currFlags.dmgMod ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetmarkerColorLabel"),
      type: "dropdown",
      options: targetMarkerColorOptions,
      name: "flags.advancedspelleffects.effectOptions.targetMarkerColor",
      flagName: "targetMarkerColor",
      flagValue: currFlags.targetMarkerColor ?? "red"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerHueLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerHue",
      flagName: "targetMarkerHue",
      flagValue: currFlags.targetMarkerHue ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSaturationLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerSaturation",
      flagName: "targetMarkerSaturation",
      flagValue: currFlags.targetMarkerSaturation ?? 0,
      min: -1,
      max: 1,
      step: 0.1
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.markerSound",
      flagName: "markerSound",
      flagValue: currFlags.markerSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.markerSoundDelay",
      flagName: "markerSoundDelay",
      flagValue: currFlags.markerSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.markerVolume",
      flagName: "markerVolume",
      flagValue: currFlags.markerVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.RayColorLabel"),
      type: "dropdown",
      options: missileColorOptions,
      name: "flags.advancedspelleffects.effectOptions.missileColor",
      flagName: "missileColor",
      flagValue: currFlags.missileColor ?? "orange"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayIntroSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSound",
      flagName: "missileIntroSound",
      flagValue: currFlags.missileIntroSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayIntroSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundDelay",
      flagName: "missileIntroSoundDelay",
      flagValue: currFlags.missileIntroSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayIntroVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroVolume",
      flagName: "missileIntroVolume",
      flagValue: currFlags.missileIntroVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundPlayback",
      flagName: "missileIntroSoundPlayback",
      flagValue: currFlags.missileIntroSoundPlayback ?? "indiv"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayImpactSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSound",
      flagName: "missileImpactSound",
      flagValue: currFlags.missileImpactSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayImpactSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.RayImpactSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundDelay",
      flagName: "missileImpactSoundDelay",
      flagValue: currFlags.missileImpactSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.RayImpactVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactVolume",
      flagName: "missileImpactVolume",
      flagValue: currFlags.missileImpactVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundPlayback",
      flagName: "missileImpactSoundPlayback",
      flagValue: currFlags.missileImpactSoundPlayback ?? "indiv"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(scorchingRay, "scorchingRay");
class eldritchBlast {
  static async registerHooks() {
    return;
  }
  static async selectTargets(midiData) {
    const casterActor = midiData.actor;
    const casterToken = canvas.tokens.get(midiData.tokenId);
    const characterLevel = casterActor.data?.data?.details?.level ?? casterActor.data?.data?.details?.spellLevel ?? 1;
    console.log(`Caster level: ${characterLevel}`);
    let numMissiles = 1;
    if (characterLevel >= 5) {
      numMissiles += 1;
    }
    if (characterLevel >= 11) {
      numMissiles += 1;
    }
    if (characterLevel >= 17) {
      numMissiles += 1;
    }
    const itemCardId = midiData.itemCardId;
    const spellItem = midiData.item;
    const aseEffectOptions = JSON.parse(JSON.stringify(spellItem?.getFlag("advancedspelleffects", "effectOptions") ?? {}));
    aseEffectOptions["targetMarkerType"] = "jb2a.markers.02";
    aseEffectOptions["missileType"] = "beam";
    aseEffectOptions["missileAnim"] = "jb2a.eldritch_blast";
    aseEffectOptions["baseScale"] = 0.1;
    aseEffectOptions["dmgDie"] = aseEffectOptions.dmgDie ?? "d10";
    aseEffectOptions["dmgDieCount"] = aseEffectOptions.dmgDieCount ?? 1;
    aseEffectOptions["dmgType"] = "force";
    aseEffectOptions["dmgMod"] = aseEffectOptions.dmgMod ?? 0;
    aseEffectOptions["impactDelay"] = -3e3;
    let invocations = aseEffectOptions.invocations;
    if (invocations.agonizingBlast) {
      aseEffectOptions.dmgMod += casterActor?.data?.data?.abilities?.cha?.mod ?? 0;
    }
    new MissileDialog$1({
      casterId: casterToken.id,
      numMissiles,
      itemCardId,
      effectOptions: aseEffectOptions,
      item: spellItem,
      actionType: "rsak"
    }).render(true);
    return;
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const missileColorOptions = getDBOptions("jb2a.eldritch_blast");
    const targetMarkerColorOptions = getDBOptions("jb2a.markers.02");
    const dieOptions = [
      { "d4": "d4" },
      { "d6": "d6" },
      { "d8": "d8" },
      { "d10": "d10" },
      { "d12": "d12" },
      { "d20": "d20" }
    ];
    const soundPlaybackOptions = [
      { "indiv": "Individual" },
      { "group": "Group" }
    ];
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    spellOptions.push({
      label: game.i18n.localize("ASE.AgonizingBlastLabel"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.agonizingBlast",
      flagName: "agonizingBlast",
      flagValue: currFlags.invocations?.agonizingBlast ?? false
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieCountLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgDieCount",
      flagName: "dmgDieCount",
      flagValue: currFlags.dmgDieCount ?? 1
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageDieLabel"),
      type: "dropdown",
      options: dieOptions,
      name: "flags.advancedspelleffects.effectOptions.dmgDie",
      flagName: "dmgDie",
      flagValue: currFlags.dmgDie ?? "d10"
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DamageBonusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.dmgMod",
      flagName: "dmgMod",
      flagValue: currFlags.dmgMod ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetmarkerColorLabel"),
      type: "dropdown",
      options: targetMarkerColorOptions,
      name: "flags.advancedspelleffects.effectOptions.targetMarkerColor",
      flagName: "targetMarkerColor",
      flagValue: currFlags.targetMarkerColor ?? "blueyellow"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerHueLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerHue",
      flagName: "targetMarkerHue",
      flagValue: currFlags.targetMarkerHue ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSaturationLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.targetMarkerSaturation",
      flagName: "targetMarkerSaturation",
      flagValue: currFlags.targetMarkerSaturation ?? 0,
      min: -1,
      max: 1,
      step: 0.1
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.markerSound",
      flagName: "markerSound",
      flagValue: currFlags.markerSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.markerSoundDelay",
      flagName: "markerSoundDelay",
      flagValue: currFlags.markerSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.TargetMarkerVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.markerVolume",
      flagName: "markerVolume",
      flagValue: currFlags.markerVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.BeamColorLabel"),
      type: "dropdown",
      options: missileColorOptions,
      name: "flags.advancedspelleffects.effectOptions.missileColor",
      flagName: "missileColor",
      flagValue: currFlags.missileColor ?? "purple"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSound",
      flagName: "missileIntroSound",
      flagValue: currFlags.missileIntroSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundDelay",
      flagName: "missileIntroSoundDelay",
      flagValue: currFlags.missileIntroSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileIntroVolume",
      flagName: "missileIntroVolume",
      flagValue: currFlags.missileIntroVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamIntroSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileIntroSoundPlayback",
      flagName: "missileIntroSoundPlayback",
      flagValue: currFlags.missileIntroSoundPlayback ?? "indiv"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSound",
      flagName: "missileImpactSound",
      flagValue: currFlags.missileImpactSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.BeamImpactSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundDelay",
      flagName: "missileImpactSoundDelay",
      flagValue: currFlags.missileImpactSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.missileImpactVolume",
      flagName: "missileImpactVolume",
      flagValue: currFlags.missileImpactVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsLabel"),
      tooltip: game.i18n.localize("ASE.BeamImpactSoundPlaybackOptionsTooltip"),
      type: "dropdown",
      options: soundPlaybackOptions,
      name: "flags.advancedspelleffects.effectOptions.missileImpactSoundPlayback",
      flagName: "missileImpactSoundPlayback",
      flagValue: currFlags.missileImpactSoundPlayback ?? "indiv"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(eldritchBlast, "eldritchBlast");
class moonBeam {
  static registerHooks() {
    Hooks.on("updateToken", moonBeam._updateToken);
    Hooks.on("updateCombat", moonBeam._updateCombat);
    Hooks.on("deleteTile", moonBeam._deleteTile);
    return;
  }
  static async _deleteTile(tileD) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    const attachedSounds = await Tagger.getByTag([`ase-source-${tileD.id}`]);
    if (!attachedSounds.length > 0) {
      return;
    }
    await canvas.scene.deleteEmbeddedDocuments("AmbientSound", attachedSounds.map((s) => s.id));
  }
  static async _updateToken(tokenDocument, updateData) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    if (!updateData.x && !updateData.y)
      return;
    const moonbeamTiles = await Tagger.getByTag(`*-moonbeam`);
    if (moonbeamTiles.length == 0)
      return;
    const token = canvas.tokens.get(tokenDocument.id);
    let newTokenPosition = { x: 0, y: 0 };
    newTokenPosition.x = updateData.x ? updateData.x : token.data.x;
    newTokenPosition.y = updateData.y ? updateData.y : token.data.y;
    newTokenPosition = getCenter(newTokenPosition, tokenDocument.data.width);
    let inTiles = token.document.getFlag("advancedspelleffects", "moonbeam.inTiles") ?? [];
    for (let i = 0; i < moonbeamTiles.length; i++) {
      let moonbeamTile = moonbeamTiles[i];
      let moonbeamTileCenter = getTileCenter(moonbeamTile.data);
      let targetToBeamDist = getDistanceClassic(newTokenPosition, moonbeamTileCenter);
      if (targetToBeamDist < tokenDocument.data.width * canvas.grid.size / 2 + moonbeamTile.data.width / 2) {
        if (inTiles.includes(moonbeamTile.id)) {
          console.log(`${token.name} has already entered this tile this turn - ${moonbeamTile.id}`);
          ui.notifications.info(game.i18n.format("ASE.MoonbeamAlreadyEnteredTile", { name: token.name }));
        } else {
          console.log(`${token.name} is entering the space of a moonbeam tile - ${moonbeamTile.id}`);
          ui.notifications.info(game.i18n.format("ASE.MoonbeamEnteringTile", { name: token.name }));
          inTiles.push(moonbeamTile.id);
          let effectOptions = moonbeamTile.getFlag("advancedspelleffects", "effectOptions") ?? {};
          await moonBeam.activateBeam(token, effectOptions);
        }
      }
    }
    await token.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
  }
  static async _updateCombat(combat) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    const moonbeamTiles = await Tagger.getByTag(`*-moonbeam`);
    if (moonbeamTiles.length == 0)
      return;
    const combatantToken = canvas.tokens.get(combat.current.tokenId);
    combatantToken.actor;
    const combatantPosition = getCenter(combatantToken.data, combatantToken.data.width);
    let inTiles = [];
    for (let i = 0; i < moonbeamTiles.length; i++) {
      let moonbeamTile = moonbeamTiles[i];
      let effectOptions = moonbeamTile.getFlag("advancedspelleffects", "effectOptions") ?? {};
      let moonbeamTileCenter = getTileCenter(moonbeamTile.data);
      let targetToBeamDist = getDistanceClassic(combatantPosition, moonbeamTileCenter);
      if (targetToBeamDist < combatantToken.data.width * canvas.grid.size / 2 + moonbeamTile.data.width / 2) {
        console.log(`${combatantToken.name} is starting its turn in the space of a moonbeam tile - ${moonbeamTile.id}`);
        ui.notifications.info(game.i18n.format("ASE.StartingTurnInMoonbeam", { name: combatantToken.name }));
        await moonBeam.activateBeam(combatantToken, effectOptions);
        inTiles.push(moonbeamTile.id);
      }
    }
    await combatantToken.document.setFlag("advancedspelleffects", "moonbeam.inTiles", inTiles);
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
    if (moonbeamTiles.length > 0) {
      aseSocket.executeAsGM("deleteTiles", [moonbeamTiles[0].id]);
    }
    await warpgate.revert(casterToken.document, `${casterActor.id}-moonbeam`);
    ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.MoveMoonbeam") }));
    const tokens = canvas.tokens.placeables;
    for await (let token of tokens) {
      if (token.document.getFlag("advancedspelleffects", "moonbeam") != void 0) {
        await token.document.unsetFlag("advancedspelleffects", "moonbeam");
      }
    }
  }
  static async callBeam(data) {
    const casterActor = data.actor;
    const casterToken = canvas.tokens.get(data.tokenId);
    data.itemCardId;
    const spellItem = data.item;
    data.itemLevel;
    const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
    const beamIntro = `jb2a.moonbeam.01.intro.${aseEffectOptions.moonbeamColor}`;
    `jb2a.moonbeam.01.outro.${aseEffectOptions.moonbeamColor}`;
    const beamLoop = `jb2a.moonbeam.01.no_pulse.${aseEffectOptions.moonbeamColor}`;
    aseEffectOptions.moonbeamDmgColor;
    const beamInitialSound = aseEffectOptions.moonbeamSound ?? "";
    const beamLoopSound = aseEffectOptions.moonbeamLoopSound ?? "";
    const beamInitialSoundDelay = Number(aseEffectOptions.moonbeamSoundDelay) ?? 0;
    const beamLoopSoundDelay = Number(aseEffectOptions.moonbeamLoopSoundDelay) ?? 0;
    const beamInitialSoundVolume = aseEffectOptions.moonbeamVolume ?? 1;
    const beamLoopSoundVolume = aseEffectOptions.moonbeamLoopVolume ?? 1;
    const beamLoopSoundEasing = aseEffectOptions.moonbeamLoopEasing ?? true;
    const beamLoopSoundRadius = aseEffectOptions.moonbeamLoopRadius ?? 20;
    let damage = data.item.data.data.damage;
    aseEffectOptions["rollInfo"] = {
      casterTokenId: casterToken.id,
      itemUUID: "",
      itemCardId: data.itemCardId,
      spellSaveDc: casterActor.data.data.attributes.spelldc,
      damageFormula: damage
    };
    aseEffectOptions["allowInitialMidiCall"] = false;
    const updates = {
      embedded: {
        Item: {}
      }
    };
    const activationItemName2 = game.i18n.localize("ASE.MoveMoonbeam");
    updates.embedded.Item[activationItemName2] = {
      "type": "spell",
      "img": spellItem.img,
      "data": {
        "ability": "",
        "actionType": "save",
        "save": spellItem.data.data.save,
        "activation": { "type": "action", "cost": 1 },
        "damage": damage,
        "level": data.itemLevel,
        "preparation": { "mode": "atwill", "prepared": true },
        "range": { "value": null, "long": null, "units": "" },
        "school": "evo",
        "target": { "value": 1, "width": null, "units": "", "type": "creature" },
        "description": {
          "value": game.i18n.localize("ASE.MoveMoonbeamDescription")
        }
      },
      "flags": {
        "advancedspelleffects": {
          "enableASE": true,
          "spellEffect": game.i18n.localize("ASE.MoveMoonbeam"),
          "castItem": true,
          "effectOptions": aseEffectOptions
        }
      }
    };
    let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);
    await warpgate.mutate(casterToken.document, updates, {}, { name: `${casterActor.id}-moonbeam` });
    let moonbeamCastItem = casterActor.items.getName(activationItemName2);
    if (moonbeamCastItem) {
      aseEffectOptions["rollInfo"]["itemUUID"] = moonbeamCastItem.uuid;
    }
    ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.MoveMoonbeam") }));
    const moonbeamTile = await placeBeam(moonbeamLoc, casterToken.id, beamLoop, aseEffectOptions);
    const moonbeamTileId = moonbeamTile.id ?? moonbeamTile._id;
    let beamSeq = new Sequence("Advanced Spell Effects").sound().file(beamInitialSound).delay(beamInitialSoundDelay).volume(beamInitialSoundVolume).playIf(beamInitialSound != "").effect().file(beamIntro).atLocation(moonbeamLoc).endTimePerc(0.5).scale(0.5).waitUntilFinished(-500).thenDo(async () => {
      await aseSocket.executeAsGM("fadeTile", { type: "fadeIn", duration: 500 }, moonbeamTileId);
    });
    await beamSeq.play();
    const soundOptions = {
      volume: beamLoopSoundVolume,
      delay: beamLoopSoundDelay,
      sound: beamLoopSound,
      easing: beamLoopSoundEasing,
      radius: beamLoopSoundRadius
    };
    if (beamLoopSound != "") {
      const sourceSound = await placeSound(moonbeamLoc, soundOptions, moonbeamTileId);
      console.log("Sound Created...", sourceSound);
    }
    async function placeBeam(templateData, tokenId, beamAnim, effectOptions) {
      let tileWidth;
      let tileHeight;
      let tileX;
      let tileY;
      tileWidth = templateData.width * canvas.grid.size;
      tileHeight = templateData.width * canvas.grid.size;
      tileX = templateData.x - tileWidth / 2;
      tileY = templateData.y - tileHeight / 2;
      const animPath = Sequencer.Database.getEntry(beamAnim).file;
      let data2 = [{
        alpha: 0,
        width: tileWidth,
        height: tileHeight,
        img: animPath,
        overhead: true,
        occlusion: {
          alpha: 0,
          mode: 0
        },
        video: {
          autoplay: true,
          loop: true,
          volume: 0
        },
        x: tileX,
        y: tileY,
        z: 100,
        flags: {
          tagger: {
            tags: [`${tokenId}-moonbeam`]
          },
          advancedspelleffects: {
            effectOptions
          }
        }
      }];
      let createdTiles = await aseSocket.executeAsGM("placeTiles", data2);
      return createdTiles[0];
    }
    __name(placeBeam, "placeBeam");
    async function placeSound(location, options, sourceId) {
      const soundData = [{
        easing: options.easing,
        path: options.sound,
        radius: options.radius,
        type: "1",
        volume: options.volume,
        x: location.x,
        y: location.y,
        flags: {
          tagger: {
            tags: [`ase-source-${sourceId}`]
          },
          advancedspelleffects: {
            sourceId
          }
        }
      }];
      return await aseSocket.executeAsGM("placeSounds", soundData, options.delay);
    }
    __name(placeSound, "placeSound");
  }
  static async activateBeam(target, effectOptions) {
    const rollInfo = effectOptions.rollInfo;
    effectOptions["castItem"] = true;
    const targetUuid = target.document?.uuid ?? target.uuid;
    let state = game.ASESpellStateManager.getSpell(rollInfo.itemUUID);
    if (state) {
      game.ASESpellStateManager.removeSpell(rollInfo.itemUUID);
    }
    effectOptions.targets = [targetUuid];
    game.ASESpellStateManager.addSpell(rollInfo.itemUUID, effectOptions);
    new Sequence("Advanced Spell Effects").sound().file(effectOptions.moonbeamDmgSound).delay(Number(effectOptions.moonbeamDmgSoundDelay) ?? 0).volume(effectOptions.moonbeamDmgVolume ?? 1).playIf(effectOptions.moonbeamDmgSound && effectOptions.moonbeamDmgSound != "").effect().file(`jb2a.impact.004.${effectOptions.moonbeamDmgColor}`).attachTo(target).randomRotation().scaleIn(0.5, 200).animateProperty("sprite", "rotation", { duration: 1e3, from: 0, to: 45 }).randomOffset(0.5).repeats(4, 100, 250).play();
  }
  static async moveBeam(data) {
    data.actor;
    const casterToken = canvas.tokens.get(data.tokenId);
    const spellItem = data.item;
    const aseEffectOptions = spellItem?.getFlag("advancedspelleffects", "effectOptions");
    const beamLoop = `jb2a.moonbeam.01.loop.${aseEffectOptions.moonbeamColor}`;
    let moonbeamTiles = await Tagger.getByTag(`${casterToken.id}-moonbeam`);
    if (moonbeamTiles?.length == 0) {
      console.log("Moonbeam not found");
      ui.notifications.error(`Moonbeam not found.`);
      return;
    }
    let moonbeamTile = moonbeamTiles[0];
    let moonbeamLoc = await moonBeam.chooseBeamLocation(beamLoop);
    await aseSocket.executeAsGM("moveTile", moonbeamLoc, moonbeamTile.id);
    if (aseEffectOptions.moonbeamLoopSound && aseEffectOptions.moonbeamLoopSound != "") {
      await aseSocket.executeAsGM("moveSound", moonbeamTile.id, moonbeamLoc);
    }
  }
  static async chooseBeamLocation(beamAnim) {
    const displayCrosshairs = /* @__PURE__ */ __name(async (crosshairs) => {
      new Sequence("Advanced Spell Effects").effect().file(beamAnim).attachTo(crosshairs).persist().scale(0.5).opacity(0.5).play();
    }, "displayCrosshairs");
    let crosshairsConfig = {
      size: 2,
      label: game.i18n.localize("ASE.Moonbeam"),
      tag: "moonbeam-crosshairs",
      drawIcon: false,
      drawOutline: false,
      interval: 1
    };
    let placedLoc = await warpgate.crosshairs.show(crosshairsConfig, { show: displayCrosshairs });
    return placedLoc;
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const beamColorOptions = getDBOptions("jb2a.moonbeam.01.no_pulse");
    const beamDamageOptions = getDBOptions("jb2a.impact.004");
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.BeamColorLabel"),
      type: "dropdown",
      options: beamColorOptions,
      name: "flags.advancedspelleffects.effectOptions.moonbeamColor",
      flagName: "moonbeamColor",
      flagValue: currFlags.moonbeamColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamInitialSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamSound",
      flagName: "moonbeamSound",
      flagValue: currFlags.moonbeamSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamInitialSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamSoundDelay",
      flagName: "moonbeamSoundDelay",
      flagValue: currFlags.moonbeamSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamInitialVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamVolume",
      flagName: "moonbeamVolume",
      flagValue: currFlags.moonbeamVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamLoopSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamLoopSound",
      flagName: "moonbeamLoopSound",
      flagValue: currFlags.moonbeamLoopSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamLoopSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamLoopSoundDelay",
      flagName: "moonbeamLoopSoundDelay",
      flagValue: currFlags.moonbeamLoopSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamLoopVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamLoopVolume",
      flagName: "moonbeamLoopVolume",
      flagValue: currFlags.moonbeamLoopVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamLoopVolumeEasingLabel"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.moonbeamLoopEasing",
      flagName: "moonbeamLoopEasing",
      flagValue: currFlags.moonbeamLoopEasing ?? true
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MoonbeamLoopSoundRadiusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamLoopRadius",
      flagName: "moonbeamLoopRadius",
      flagValue: currFlags.moonbeamLoopRadius ?? 20
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DamageEffectColorLabel"),
      type: "dropdown",
      options: beamDamageOptions,
      name: "flags.advancedspelleffects.effectOptions.moonbeamDmgColor",
      flagName: "moonbeamDmgColor",
      flagValue: currFlags.moonbeamDmgColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DamageEffectSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamDmgSound",
      flagName: "moonbeamDmgSound",
      flagValue: currFlags.moonbeamDmgSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DamageEffectSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamDmgSoundDelay",
      flagName: "moonbeamDmgSoundDelay",
      flagValue: currFlags.moonbeamDmgSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DamageEffectVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.moonbeamDmgVolume",
      flagName: "moonbeamDmgVolume",
      flagValue: currFlags.moonbeamDmgVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      "allowInitialMidiCall": true
    };
  }
}
__name(moonBeam, "moonBeam");
class wofPanelDialog extends FormApplication {
  constructor(options = { aseData: {}, templateData: {}, type: "" }) {
    super(options);
    foundry.utils.mergeObject(this.options, options);
    this.data = {};
    this.data.aseData = this.options.aseData;
    this.data.templateData = this.options.templateData;
    this.data.type = this.options.type;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "./modules/advancedspelleffects/src/templates/wof-panel-dialog.html",
      id: "wof-panel-dialog",
      title: game.i18n.localize("ASE.WallOfForce"),
      resizable: true,
      width: "auto",
      height: "auto",
      left: game.user?.getFlag("advancedspelleffects", "wofDialogPos.left") ?? "auto",
      top: game.user?.getFlag("advancedspelleffects", "wofDialogPos.top") ?? "auto",
      submitOnClose: true,
      close: () => {
        ui.notify;
      }
    });
  }
  async getData() {
    return { data: this.data };
  }
  async _updateObject(event, formData) {
    await aseSocket.executeAsGM("updateFlag", game.user.id, "wofDialogPos", { left: this.position.left, top: this.position.top });
  }
}
__name(wofPanelDialog, "wofPanelDialog");
class wallOfForce {
  static registerHooks() {
    if (!game.user.isGM)
      return;
    Hooks.on("updateMeasuredTemplate", wallOfForce._updateMeasuredTemplate);
    Hooks.on("deleteMeasuredTemplate", wallOfForce._deleteMeasuredTemplate);
  }
  static async _updateMeasuredTemplate(template, changes) {
    if (template.getFlag("advancedspelleffects", "wallOfForceWallNum") && (changes.x !== void 0 || changes.y !== void 0 || changes.direction !== void 0)) {
      wallOfForce._placeWalls(template, true);
    }
  }
  static async _deleteMeasuredTemplate(template) {
    const walls = Tagger.getByTag([`WallOfForce-Wall${template.id}`]).map((wall) => wall.id);
    if (walls.length) {
      await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
    }
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let wallOfForceTemplate = Tagger.getByTag(`WallOfForce-${casterActor.id}`);
    let wofTemplateIds = [];
    if (wallOfForceTemplate.length > 0) {
      wallOfForceTemplate.forEach((template) => {
        wofTemplateIds.push(template.id);
      });
      aseSocket.executeAsGM("deleteTemplates", wofTemplateIds);
    }
  }
  static async createWallOfForce(midiData) {
    const aseData = {
      itemLevel: midiData.itemLevel,
      flags: midiData.item.getFlag("advancedspelleffects", "effectOptions"),
      caster: canvas.tokens.get(midiData.tokenId),
      casterActor: canvas.tokens.get(midiData.tokenId).actor
    };
    const { dimensions, texture, type } = await warpgate.buttonDialog({
      title: "Choose your Wall of Force shape:",
      buttons: [
        {
          label: `Sphere/Dome (${aseData.flags.wallOfForceRadius}ft radius)`,
          value: {
            dimensions: {
              radius: aseData.flags.wallOfForceRadius
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_Sphere_Thumb.webp` : "jb2a.wall_of_force.sphere." + aseData.flags.color,
            type: "sphere"
          }
        },
        {
          label: `Horizontal Wall (${aseData.flags.wallOfForceSegmentSize * 5}x${aseData.flags.wallOfForceSegmentSize * 2})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize * 5,
              width: aseData.flags.wallOfForceSegmentSize * 2
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp` : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
            type: "horizontal"
          }
        },
        {
          label: `Horizontal Wall (${aseData.flags.wallOfForceSegmentSize * 10}x${aseData.flags.wallOfForceSegmentSize})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize * 10,
              width: aseData.flags.wallOfForceSegmentSize
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp` : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
            type: "horizontal"
          }
        },
        {
          label: `Vertical Wall (${aseData.flags.wallOfForceSegmentSize * 5}x${aseData.flags.wallOfForceSegmentSize * 2})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize * 5,
              height: aseData.flags.wallOfForceSegmentSize * 2
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp` : "jb2a.wall_of_force.vertical." + aseData.flags.color,
            type: "vertical"
          }
        },
        {
          label: `Vertical Wall (${aseData.flags.wallOfForceSegmentSize * 10}x${aseData.flags.wallOfForceSegmentSize})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize * 10,
              height: aseData.flags.wallOfForceSegmentSize
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp` : "jb2a.wall_of_force.vertical." + aseData.flags.color,
            type: "vertical"
          }
        },
        {
          label: `Place Horizontal Panels (${aseData.flags.wallOfForceSegmentSize}x${aseData.flags.wallOfForceSegmentSize})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize,
              width: aseData.flags.wallOfForceSegmentSize
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_H_Thumb.webp` : "jb2a.wall_of_force.horizontal." + aseData.flags.color,
            type: "h-panels"
          }
        },
        {
          label: `Place Vertical Panels (${aseData.flags.wallOfForceSegmentSize}x${aseData.flags.wallOfForceSegmentSize})`,
          value: {
            dimensions: {
              length: aseData.flags.wallOfForceSegmentSize,
              width: aseData.flags.wallOfForceSegmentSize
            },
            texture: aseData.flags.useWebP ? `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${aseData.flags.color}_V_Thumb.webp` : "jb2a.wall_of_force.vertical." + aseData.flags.color,
            type: "v-panels"
          }
        }
      ]
    }, "column");
    if (!dimensions || !texture)
      return;
    aseData.dimensions = dimensions;
    aseData.texture = texture;
    const templateData = {
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      color: "#FFFFFF",
      fillColor: "#FFFFFF",
      flags: {
        tagger: { tags: [`WallOfForce-${aseData.casterActor.id}`] },
        advancedspelleffects: {
          wallOfForceWallNum: 12,
          dimensions: aseData.dimensions
        }
      }
    };
    if (type == "sphere") {
      templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.CIRCLE;
      templateData["distance"] = dimensions.radius;
    } else if (type == "vertical") {
      templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
      templateData["distance"] = dimensions.length;
    } else if (type == "horizontal") {
      templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
      templateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
      templateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
    }
    if (type == "h-panels" || type == "v-panels") {
      if (type == "h-panels") {
        templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
        templateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
        templateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
      } else if (type == "v-panels") {
        templateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
        templateData["distance"] = dimensions.length;
      }
      templateData.flags.tagger.tags.push("0");
      let wofPanelDiag = new wofPanelDialog({ aseData, templateData, type }).render(true);
      await wofPanelDiag.getData();
      Hooks.once("createMeasuredTemplate", async (template2) => {
        await template2.setFlag("advancedspelleffects", "placed", true);
        wallOfForce._placePanels(aseData, template2, wofPanelDiag, type);
      });
      console.log("template data:", templateData);
      const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
      let template = new game.dnd5e.canvas.AbilityTemplate(doc);
      template.actorSheet = aseData.casterActor.sheet;
      template.drawPreview();
    } else {
      Hooks.once("createMeasuredTemplate", async (template2) => {
        await template2.setFlag("advancedspelleffects", "placed", true);
        wallOfForce._placeWallOfForce(aseData, template2);
      });
      const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
      let template = new game.dnd5e.canvas.AbilityTemplate(doc);
      template.actorSheet = aseData.casterActor.sheet;
      template.drawPreview();
    }
  }
  static sourceSquareV(center, distance, direction) {
    const gridSize = canvas.grid.h;
    const length = distance / 5 * gridSize;
    const x = center.x + length * Math.cos(direction * Math.PI / 180);
    const y = center.y + length * Math.sin(direction * Math.PI / 180);
    return { x, y };
  }
  static sourceSquare(center, widthSquares, heightSquares) {
    const gridSize = canvas.grid.h;
    const h = gridSize * heightSquares;
    const w = gridSize * widthSquares;
    const bottom = center.y + h / 2;
    const left = center.x - w / 2;
    const top = center.y - h / 2;
    const right = center.x + w / 2;
    const rightSpots = [...new Array(1)].map((_, i) => ({
      direction: 45,
      x: right,
      y: top
    }));
    const bottomSpots = [...new Array(1)].map((_, i) => ({
      direction: 45,
      x: left,
      y: bottom
    }));
    const leftSpots = [...new Array(1)].map((_, i) => ({
      direction: 135,
      x: left,
      y: top
    }));
    const topSpots = [...new Array(1)].map((_, i) => ({
      direction: 225,
      x: right,
      y: top
    }));
    console.log("topSpots: ", topSpots);
    console.log("leftSpots: ", leftSpots);
    console.log("bottomSpots: ", bottomSpots);
    console.log("rightSpots: ", rightSpots);
    const allSpots = [
      ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
      ...bottomSpots,
      ...leftSpots,
      ...topSpots,
      ...rightSpots.slice(0, Math.floor(rightSpots.length / 2))
    ];
    console.log("allSpots: ", allSpots);
    return {
      x: left,
      y: top,
      center,
      top,
      bottom,
      left,
      right,
      h,
      w,
      heightSquares,
      widthSquares,
      allSpots
    };
  }
  static async _placePanels(aseData, template, panelDiag, type) {
    wallOfForce._playEffects(aseData, template);
    wallOfForce._placeWalls(template);
    canvas.grid.h;
    const previousTemplateData = template.data;
    let panelsRemaining = panelDiag.data.aseData.flags.wallOfForcePanelCount;
    const nextTemplateData = template.toObject();
    nextTemplateData.flags.advancedspelleffects["placed"] = false;
    delete nextTemplateData["_id"];
    nextTemplateData.flags.tagger.tags[1] = (Number(nextTemplateData.flags.tagger.tags[1]) + 1).toString();
    if (panelsRemaining < 2 || !panelDiag.rendered) {
      panelDiag.submit();
      return;
    }
    panelDiag.data.aseData.flags.wallOfForcePanelCount--;
    panelDiag.render(true);
    let previousTemplateCenter;
    let square;
    let updateTemplateLocation;
    if (type == "h-panels") {
      if (previousTemplateData.direction == 45) {
        previousTemplateCenter = {
          x: previousTemplateData.x + previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y + previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      } else if (previousTemplateData.direction == 135) {
        previousTemplateCenter = {
          x: previousTemplateData.x - previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y + previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      } else if (previousTemplateData.direction == 225) {
        previousTemplateCenter = {
          x: previousTemplateData.x - previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y - previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      }
      const previousTemplateWidthSquares = previousTemplateData.flags.advancedspelleffects.dimensions.length / 5;
      const previousTemplateHeightSquares = previousTemplateData.flags.advancedspelleffects.dimensions.width / 5;
      square = wallOfForce.sourceSquare(
        { x: previousTemplateCenter.x, y: previousTemplateCenter.y },
        previousTemplateWidthSquares,
        previousTemplateHeightSquares
      );
    } else if (type == "v-panels") {
      square = wallOfForce.sourceSquareV(
        { x: previousTemplateData.x, y: previousTemplateData.y },
        previousTemplateData.distance,
        previousTemplateData.direction
      );
      nextTemplateData.x = square.x;
      nextTemplateData.y = square.y;
    }
    const displayTemplateData = JSON.parse(JSON.stringify(nextTemplateData));
    delete displayTemplateData.flags.advancedspelleffects["wallOfForceWallNum"];
    let displayTemplate = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [displayTemplateData]))[0];
    let currentSpotIndex = 0;
    updateTemplateLocation = /* @__PURE__ */ __name(async (crosshairs) => {
      while (crosshairs.inFlight) {
        if (!panelDiag.rendered) {
          crosshairs.inFlight = false;
          return;
        }
        await warpgate.wait(100);
        if (!displayTemplate)
          return;
        const verticalTemplate = displayTemplate.data.t == CONST.MEASURED_TEMPLATE_TYPES.RAY;
        let ray;
        let angle;
        if (!verticalTemplate) {
          const totalSpots = square.allSpots.length;
          const radToNormalizedAngle = /* @__PURE__ */ __name((rad) => {
            let angle2 = rad * 180 / Math.PI % 360;
            if (square.heightSquares % 2 === 1 && square.widthSquares % 2 === 1) {
              angle2 -= 360 / totalSpots / 2;
            }
            const normalizedAngle = Math.round(angle2 / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0 ? normalizedAngle + 360 : normalizedAngle;
          }, "radToNormalizedAngle");
          ray = new Ray(square.center, crosshairs);
          angle = radToNormalizedAngle(ray.angle);
          const spotIndex = Math.ceil(angle / 360 * totalSpots);
          if (spotIndex === currentSpotIndex) {
            continue;
          }
          currentSpotIndex = spotIndex;
          const spot = square.allSpots[currentSpotIndex];
          if (!displayTemplate)
            return;
          await displayTemplate.update({ ...spot });
        } else {
          ray = new Ray(square, crosshairs);
          angle = ray.angle * 180 / Math.PI;
          if (angle == displayTemplate.data.direction) {
            continue;
          }
          if (!displayTemplate)
            return;
          await displayTemplate.update({ direction: angle });
        }
      }
    }, "updateTemplateLocation");
    const targetConfig = {
      drawIcon: false,
      drawOutline: false,
      interval: 20
    };
    const rotateCrosshairs = await warpgate.crosshairs.show(
      targetConfig,
      {
        show: updateTemplateLocation
      }
    );
    if (rotateCrosshairs.cancelled) {
      if (canvas.scene.templates.get(displayTemplate.id)) {
        await displayTemplate.delete();
      }
      game.user.updateTokenTargets();
      panelDiag.submit();
      return;
    }
    const newFlags = {
      flags: {
        advancedspelleffects: {
          placed: true
        }
      }
    };
    if (type == "v-panels") {
      newFlags.flags.advancedspelleffects["wallOfForceWallNum"] = nextTemplateData.flags.advancedspelleffects["wallOfForceWallNum"];
    }
    await displayTemplate.update(newFlags);
    wallOfForce._placePanels(aseData, displayTemplate, panelDiag, type);
  }
  static async _placeWallOfForce(aseData, templateDocument) {
    wallOfForce._playEffects(aseData, templateDocument);
    wallOfForce._placeWalls(templateDocument);
  }
  static async _placeWalls(templateDocument, deleteOldWalls = false) {
    if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE)
      return;
    if (deleteOldWalls) {
      const walls2 = Tagger.getByTag([`WallOfForce-Wall${templateDocument.id}`]).map((wall) => wall.id);
      if (walls2.length) {
        await canvas.scene.deleteEmbeddedDocuments("Wall", walls2);
      }
    }
    const template = templateDocument.object;
    const walls = [];
    if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      const placedX = template.x;
      const placedY = template.y;
      let wall_number = 12;
      let wall_angles = 2 * Math.PI / wall_number;
      let outerCircleRadius = template.shape.radius;
      let lastPoint = false;
      let firstPoint;
      for (let i = 0; i < wall_number; i++) {
        const currentPoint = [
          placedX + outerCircleRadius * Math.cos(i * wall_angles),
          placedY + outerCircleRadius * Math.sin(i * wall_angles)
        ];
        if (lastPoint) {
          walls.push({
            c: [...lastPoint, ...currentPoint],
            flags: { tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] } },
            move: 20,
            sight: 0,
            light: 0,
            sound: 0
          });
        }
        lastPoint = [...currentPoint];
        if (!firstPoint)
          firstPoint = [...currentPoint];
      }
      walls.push({
        c: [...lastPoint, ...firstPoint],
        flags: { tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] } },
        move: 20,
        sight: 0,
        light: 0,
        sound: 0
      });
    } else {
      const startPoint = template.ray.A;
      const endPoint = template.ray.B;
      walls.push({
        c: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
        flags: {
          tagger: { tags: [`WallOfForce-Wall${templateDocument.id}`] },
          wallHeight: {
            wallHeightTop: templateDocument.getFlag("advancedspelleffects", "dimensions").height,
            wallHeightBottom: 0
          }
        },
        move: 20,
        sight: 0,
        light: 0,
        sound: 0
      });
    }
    await aseSocket.executeAsGM("placeWalls", walls);
  }
  static _playEffects(aseData, template) {
    if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      new Sequence().effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).zIndex(1e3).persist().play();
    } else if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) {
      new Sequence().effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).tilingTexture({
        x: aseData.flags.wallOfForceSegmentSize / 10,
        y: aseData.flags.wallOfForceSegmentSize / 10
      }).belowTokens().zIndex(-1e3).persist().play();
    } else {
      new Sequence().effect(aseData.texture).attachTo(template).stretchTo(template, { attachTo: true, onlyX: true }).tilingTexture({
        x: aseData.flags.wallOfForceSegmentSize / 10
      }).fadeIn(250).fadeOut(250).persist().play();
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    spellOptions.push({
      label: game.i18n.localize("ASE.WallOfForceRadiusLabel"),
      tooltip: game.i18n.localize("ASE.WallOfForceRadiusTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallOfForceRadius",
      flagName: "wallOfForceRadius",
      flagValue: currFlags.wallOfForceRadius ?? 10
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallOfForceSegmentSizeLabel"),
      tooltip: game.i18n.localize("ASE.WallOfForceSegmentSizeTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallOfForceSegmentSize",
      flagName: "wallOfForceSegmentSize",
      flagValue: currFlags.wallOfForceSegmentSize ?? 10
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallOfForcePanelCountLabel"),
      tooltip: game.i18n.localize("ASE.WallOfForcePanelCountTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallOfForcePanelCount",
      flagName: "wallOfForcePanelCount",
      flagValue: currFlags.wallOfForcePanelCount ?? 10
    });
    animOptions.push({
      label: game.i18n.localize("ASE.WallOfForceColorLabel"),
      type: "dropdown",
      options: getDBOptions("jb2a.wall_of_force.horizontal"),
      name: "flags.advancedspelleffects.effectOptions.color",
      flagName: "color",
      flagValue: currFlags.color ?? "blue"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.WallOfForceUseWebPLabel"),
      tooltip: game.i18n.localize("ASE.WallOfForceUseWebPTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.useWebP",
      flagName: "useWebP",
      flagValue: currFlags.useWebP ?? false
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(wallOfForce, "wallOfForce");
class baseSpellClass {
  static registerHooks() {
  }
  static async getRequiredSettings() {
    return {
      animOptions: [],
      spellOptions: [],
      soundOptions: []
    };
  }
}
__name(baseSpellClass, "baseSpellClass");
class wallPanelDialog extends FormApplication {
  constructor(options = { aseData: {}, templateData: {}, type: "" }) {
    super(options);
    foundry.utils.mergeObject(this.options, options);
    this.data = {};
    this.data.aseData = this.options.aseData;
    this.data.templateData = this.options.templateData;
    this.data.type = this.options.type;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "./modules/advancedspelleffects/src/templates/wall-panel-dialog.html",
      id: "wall-panel-dialog",
      title: game.i18n.localize("ASE.WallPanelTitle"),
      resizable: true,
      width: "auto",
      height: "auto",
      left: game.user?.getFlag("advancedspelleffects", "wallPanelDialogPos.left") ?? "auto",
      top: game.user?.getFlag("advancedspelleffects", "wallPanelDialogPos.top") ?? "auto",
      submitOnClose: true,
      close: () => {
        ui.notify;
      }
    });
  }
  async getData() {
    return { data: this.data };
  }
  async _updateObject(event, formData) {
    await aseSocket.executeAsGM("updateFlag", game.user.id, "wallPanelDialogPos", { left: this.position.left, top: this.position.top });
  }
}
__name(wallPanelDialog, "wallPanelDialog");
class wallOfFire extends baseSpellClass {
  constructor(data) {
    super();
    this.data = data;
    this.actor = game.actors.get(this.data.actor.id);
    this.token = canvas.tokens.get(this.data.tokenId);
    this.item = this.data.item;
    this.itemCardId = this.data.itemCardId;
    this.itemLevel = this.data.itemLevel;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions") ?? {};
    this.wallType = "fire";
    this.wallCategory = "wall";
    this.wallOptions = {};
    this.chatMessage = {};
    this.baseTemplateData = {
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      color: "#FFFFFF",
      fillColor: "#FFFFFF",
      flags: {
        tagger: { tags: [`wallSpell-${this.wallType}-${this.actor.id}`] },
        advancedspelleffects: {
          wallSpellWallNum: 12,
          dimensions: {},
          wallType: this.wallType,
          length: this.effectOptions.length,
          wallOperationalData: {},
          wallEffectData: this.effectOptions,
          wallName: this.item.name
        }
      }
    };
  }
  async cast() {
    this._setWallOptions();
    const { dimensions, texture, type } = await warpgate.buttonDialog(this._getDialogData(), "column");
    if (!dimensions || !texture)
      return;
    const chatMessage = await game.messages.get(this.itemCardId);
    if (chatMessage) {
      this.chatMessage = chatMessage.id;
    }
    this._setBaseTemplateData(dimensions, type);
    const aseData = {
      itemLevel: this.itemLevel,
      flags: this.effectOptions,
      caster: this.token,
      casterActor: this.actor,
      dimensions,
      texture
    };
    Hooks.once("createMeasuredTemplate", async (template2) => {
      const direction = template2.data.direction;
      const templateDimensions = template2.getFlag("advancedspelleffects", "dimensions") ?? {};
      const templateLength = templateDimensions?.length ?? 0;
      if ((direction == 0 || direction == 180 || direction == 90 || direction == 270) && templateLength > 0) {
        await template2.update({ distance: templateLength, flags: { advancedspelleffects: { placed: true } } });
      } else {
        await template2.setFlag("advancedspelleffects", "placed", true);
      }
      wallOfFire.playEffects(aseData, template2);
      await wallOfFire.pickFireSide(template2);
      wallOfFire.handleDamage(template2);
    });
    const doc = new MeasuredTemplateDocument(this.baseTemplateData, { parent: canvas.scene });
    let template = new game.dnd5e.canvas.AbilityTemplate(doc);
    template.actorSheet = aseData.casterActor.sheet;
    template.drawPreview();
  }
  _setWallOptions() {
    this.wallOptions = {
      wallCategory: "wall",
      rect: {
        dimensions: {
          length: this.effectOptions.wallLength,
          width: this.effectOptions.wallHeight
        }
      },
      circle: {
        dimensions: {
          radius: this.effectOptions.wallRadius
        }
      }
    };
  }
  _getDialogData() {
    const wallType = this.wallType;
    const wallOptions = this.wallOptions;
    this.wallCategory;
    const effectOptions = this.effectOptions;
    const useWebP = effectOptions.useWebP ?? false;
    let dialogData = {
      title: `Choose your Wall of ${this.wallType} shape`,
      buttons: [{
        label: `Sphere/Dome/Ring(${wallOptions.circle.dimensions.radius}ft radius)`,
        value: {
          dimensions: wallOptions.circle.dimensions,
          texture: this._getTexture({ type: "circle", effectData: this.effectOptions }, wallType, useWebP),
          type: "circle"
        }
      }, {
        label: `Wall(${wallOptions.rect.dimensions.length}ft x ${wallOptions.rect.dimensions.width}ft)`,
        value: {
          dimensions: wallOptions.rect.dimensions,
          texture: this._getTexture({ type: "wall", effectData: this.effectOptions }, wallType, useWebP),
          type: "ray"
        }
      }]
    };
    return dialogData;
  }
  _setBaseTemplateData(dimensions, type) {
    this.baseTemplateData.flags.advancedspelleffects.dimensions = dimensions;
    this.baseTemplateData.flags.tagger.tags.push("0");
    if (type == "circle") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.CIRCLE;
      this.baseTemplateData["distance"] = dimensions.radius;
    } else if (type == "ray") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
      this.baseTemplateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
      this.baseTemplateData["width"] = this.effectOptions.wallWidth;
    }
    let damageRoll;
    if (this.effectOptions.levelScaling) {
      damageRoll = `${Number(this.itemLevel) + 1}d8`;
    } else {
      damageRoll = `${this.effectOptions.dmgDieCount}${this.effectOptions.dmgDie}${this.effectOptions.dmgMod > 0 ? ` + ${this.effectOptions.dmgMod}` : ""}`;
    }
    this.baseTemplateData.flags.advancedspelleffects.wallOperationalData = {
      savingThrowOnCast: true,
      savingThrow: "dex",
      halfDamOnSave: true,
      damage: damageRoll,
      damageType: "fire",
      damageOnTouch: true,
      savingThrowOnTouch: false,
      checkForTouch: true,
      damageSide: "",
      damageInArea: true,
      damageArea: {},
      damageOnCast: true,
      savingThrowDC: this.actor.data.data.attributes.spelldc ?? 0,
      chatMessage: this.chatMessage,
      item: this.item.id,
      casterActor: this.actor.id,
      range: this.effectOptions?.range ?? 10,
      casterToken: this.token.id
    };
  }
  _getTexture(options, wallType, useWebP = false) {
    let texture = "";
    if (options.type == "circle") {
      if (useWebP) {
        texture = `modules/jb2a_patreon/Library/Generic/Fire/FireRing_01_Circle_${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}_Thumb.webp`;
      } else {
        texture = `jb2a.fire_ring.900px.${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}`;
      }
    } else if (options.type == "wall") {
      if (useWebP) {
        texture = `modules/jb2a_patreon/Library/4th_Level/Wall_Of_Fire/WallOfFire_01_${options.effectData.fireColor}_Thumb.webp`;
      } else {
        texture = `jb2a.wall_of_fire.300x100.${options.effectData.fireColor}`;
      }
    }
    return texture;
  }
  static registerHooks() {
    if (!game.user.isGM)
      return;
    Hooks.on("preUpdateToken", wallOfFire.preUpdateToken);
    Hooks.on("updateCombat", wallOfFire.updateCombat);
    return;
  }
  static async updateCombat(combat) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    const token = canvas.tokens.get(combat.previous.tokenId);
    if (!token)
      return;
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    const tokenPos = { x: token.data.x, y: token.data.y };
    await token.document.unsetFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
    const wallTemplates = canvas.templates.placeables.filter((template) => template.document.getFlag("advancedspelleffects", "wallOperationalData.damageOnTouch") == true || template.document.getFlag("advancedspelleffects", "wallOperationalData.savingThrowOnTouch") == true);
    if (wallTemplates.length && wallTemplates.length > 0) {
      for await (let wallTemplate of wallTemplates) {
        const templateDocument = wallTemplate.document;
        if (!templateDocument)
          return;
        const templateData = templateDocument.data;
        if (!templateData)
          return;
        const aseData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
        const aseEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
        if (!aseData || !aseData.damageOnTouch)
          return;
        if (!aseData.checkForTouch)
          return;
        ({
          wallName: templateDocument.getFlag("advancedspelleffects", "wallName") ?? "",
          wallTemplateId: templateDocument.id,
          wallType: templateDocument.getFlag("advancedspelleffects", "wallType") ?? "",
          wallOperationalData: aseData,
          wallEffectData: aseEffectData
        });
        templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
        const mTemplate = templateDocument.object;
        const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: templateData.t, distance: mTemplate.data.distance };
        if (templateDetails.shape == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
          let templateCenter = { x: templateDetails.x, y: templateDetails.y };
          let templateRadius = templateDetails.distance / 5 * grid;
          const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: tokenPos.x + x * grid,
                  y: tokenPos.y + y * grid
                };
                let inRange = false;
                if (sideToCheck == "inside") {
                  inRange = isPointInCircle(templateCenter, currGrid, 0, templateRadius);
                } else if (sideToCheck == "outside") {
                  const outerRadius = templateRadius + aseData.range / 5 * grid;
                  inRange = isPointInCircle(templateCenter, currGrid, templateRadius, outerRadius);
                }
                if (inRange) {
                  console.log("In range and on side...", token.name);
                  break widthLoop;
                } else {
                  console.log("Token not in range of wall circle: ", token.name);
                }
              }
            }
        } else {
          let templatePointA = { x: templateDetails.x, y: templateDetails.y };
          const templateAngle = templateData.direction * (Math.PI / 180);
          const templateLength = templateData.distance * grid / 5;
          const templatePointBX = templatePointA.x + templateLength * Math.cos(templateAngle);
          const templatePointBY = templatePointA.y + templateLength * Math.sin(templateAngle);
          let templatePointB = { x: templatePointBX, y: templatePointBY };
          if (templatePointA.x > templatePointB.x && templatePointA.y > templatePointB.y || templatePointA.x < templatePointB.x && templatePointA.y > templatePointB.y) {
            const temp = templatePointA;
            templatePointA = templatePointB;
            templatePointB = temp;
          } else if (templatePointA.x == templatePointB.x) {
            if (templatePointA.y > templatePointB.y) {
              const temp = templatePointA;
              templatePointA = templatePointB;
              templatePointB = temp;
            }
          } else if (templatePointA.y == templatePointB.y) {
            if (templatePointA.x > templatePointB.x) {
              const temp = templatePointA;
              templatePointA = templatePointB;
              templatePointB = temp;
            }
          }
          const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: tokenPos.x + x * grid,
                  y: tokenPos.y + y * grid
                };
                const inRange = isPointNearLine(templatePointA, templatePointB, currGrid, aseData.range / 5 * grid);
                if (inRange) {
                  let isOnSide = false;
                  if (sideToCheck == "bottom" || sideToCheck == "left") {
                    isOnSide = isPointOnLeft(templatePointA, templatePointB, currGrid);
                  } else if (sideToCheck == "top" || sideToCheck == "right") {
                    isOnSide = isPointOnLeft(templatePointB, templatePointA, currGrid);
                  }
                  if (isOnSide) {
                    console.log("In range and on side...", token.name);
                    break widthLoop;
                  } else {
                    console.log("Token not on side of wall: ", token.name);
                  }
                } else {
                  console.log("Token not in range of wall: ", token.name);
                }
              }
            }
        }
      }
    }
  }
  static async preUpdateToken(tokenDocument, updateData) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    if (!updateData.x && !updateData.y)
      return;
    const token = tokenDocument;
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    const oldPos = { x: tokenDocument.data.x, y: tokenDocument.data.y };
    let newPos = { x: 0, y: 0 };
    newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
    newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
    const movementRay = new Ray(oldPos, newPos);
    const templates = Array.from(canvas?.scene?.templates ?? {});
    if (templates.length == 0)
      return;
    let templateDocument = {};
    let wallsTouched = token.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched") ?? [];
    let wallName = "";
    for (let i = 0; i < templates.length; i++) {
      templateDocument = templates[i];
      const templateData = templateDocument.data;
      if (!templateData)
        return;
      const aseData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
      const aseEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
      wallName = templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
      const mTemplate = templateDocument.object;
      const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
      const templatePointA = { x: templateDetails.x, y: templateDetails.y };
      const templateAngle = templateData.direction * (Math.PI / 180);
      const templateLength = templateData.distance * grid / 5;
      const templatePointBX = templatePointA.x + templateLength * Math.cos(templateAngle);
      const templatePointBY = templatePointA.y + templateLength * Math.sin(templateAngle);
      const templatePointB = { x: templatePointBX, y: templatePointBY };
      const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
      const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
      widthLoop:
        for (let x = startX; x < token.data.width; x++) {
          for (let y = startY; y < token.data.height; y++) {
            const currGrid = {
              x: newPos.x + x * grid - templatePointA.x,
              y: newPos.y + y * grid - templatePointA.y
            };
            const oldCurrGrid = {
              x: oldPos.x + x * grid - templatePointA.x,
              y: oldPos.y + y * grid - templatePointA.y
            };
            let previousContains = templateDetails.shape?.contains(oldCurrGrid.x, oldCurrGrid.y);
            let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
            if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
              previousContains = false;
              contains = false;
            }
            let crossed = false;
            if (!contains) {
              const dragCoordOld = {
                x: movementRay.A.x + x * grid,
                y: movementRay.A.y + y * grid
              };
              const dragCoordNew = {
                x: movementRay.B.x + x * grid,
                y: movementRay.B.y + y * grid
              };
              if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
                crossed = lineCrossesCircle(dragCoordOld, dragCoordNew, templatePointA, templateDetails.distance / 5 * grid);
              } else {
                crossed = lineCrossesLine(dragCoordOld, dragCoordNew, templatePointA, templatePointB);
              }
            }
            if ((previousContains && contains || !previousContains) && (crossed || contains)) {
              if (wallsTouched.includes(templateDocument.id)) {
                console.log(`${token.name} has already been effected by this ${wallName} this turn - ${templateDocument.id}`);
                ui.notifications.info(game.i18n.format("ASE.WallSpellAlreadyEffected", { name: token.name, wallName }));
                break widthLoop;
              } else {
                console.log(`${token.name} touched ${wallName} - ${templateDocument.id}`);
                ui.notifications.info(game.i18n.format("ASE.WallSpellTouchingWall", { name: token.name, wallName }));
                wallsTouched.push(templateDocument.id);
                ({
                  wallName,
                  wallTemplateId: templateDocument.id,
                  wallType: templateDocument.getFlag("advancedspelleffects", "wallType") ?? "",
                  wallOperationalData: aseData,
                  wallEffectData: aseEffectData
                });
                console.log("In range and on side...", token.name);
                break widthLoop;
              }
            }
          }
        }
    }
    await token.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let wallSpellTemplates = Tagger.getByTag(`wallSpell-fire-${casterActor.id}`);
    let wsTemplateIds = [];
    if (wallSpellTemplates.length > 0) {
      wallSpellTemplates.forEach((template) => {
        wsTemplateIds.push(template.id);
      });
      await aseSocket.executeAsGM("deleteTemplates", wsTemplateIds);
    }
    const tokens = canvas.tokens.placeables;
    let tokenDocument = {};
    let wallsTouched = [];
    for (let i = 0; i < tokens.length; i++) {
      tokenDocument = tokens[i].document;
      wallsTouched = tokenDocument.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
      if (!wallsTouched || wallsTouched.length == 0)
        continue;
      wallsTouched = wallsTouched.filter((wallId) => !wsTemplateIds.includes(wallId));
      await tokenDocument.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
    }
  }
  static async pickFireSide(templateDocument) {
    const wallData = templateDocument?.data;
    if (!wallData)
      return;
    let buttonDialogData;
    if (wallData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      buttonDialogData = {
        title: "Pick dome/ring/sphere damaging side",
        buttons: [
          {
            label: "Inside",
            value: "inside"
          },
          {
            label: "Outside",
            value: "outside"
          }
        ]
      };
    } else {
      const direction = wallData.direction;
      if (direction == 0 || direction == 180) {
        buttonDialogData = {
          title: "Pick wall damaging side",
          buttons: [
            {
              label: "Top",
              value: "top"
            },
            {
              label: "Bottom",
              value: "bottom"
            }
          ]
        };
      } else {
        buttonDialogData = {
          title: "Pick wall damaging side",
          buttons: [
            {
              label: "Left",
              value: "left"
            },
            {
              label: "Right",
              value: "right"
            }
          ]
        };
      }
    }
    let damageSidePicked = await warpgate.buttonDialog(buttonDialogData, "column");
    if (!damageSidePicked)
      return;
    await templateDocument.setFlag("advancedspelleffects", "wallOperationalData.damageSide", damageSidePicked);
  }
  static async handleDamage(templateDocument) {
    const wallData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
    if (!wallData)
      return;
    const wallEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
    console.log("ASE WALL OF FIRE - handleDamage: wallEffectData: ", wallEffectData);
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    wallData.damageOnCast;
    wallData.damageType;
    wallData.damage;
    wallData.halfDamOnSave ?? true;
    const savingThrowOnCast = wallData.savingThrowOnCast;
    const mTemplate = templateDocument.object;
    const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
    const chatMessageId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.chatMessage");
    await game.messages.get(chatMessageId);
    const casterActorId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.casterActor");
    const casterActor = await game.actors.get(casterActorId);
    const wallItemId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.item");
    const wallItem = await casterActor.items.get(wallItemId);
    const wallItemUUID = wallItem.uuid;
    let spellState = game.ASESpellStateManager.getSpell(wallItemUUID);
    if (!spellState) {
      wallEffectData.concentration = true;
      wallEffectData.noCastItem = true;
      game.ASESpellStateManager.addSpell(wallItemUUID, wallEffectData);
    }
    if (savingThrowOnCast) {
      wallData.savingThrow;
      wallData.savingThrowDC;
      const tokens = canvas.tokens.placeables;
      const targets = [];
      if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: token.data.x + x * grid - templateDetails.x,
                  y: token.data.y + y * grid - templateDetails.y
                };
                let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
                if (contains) {
                  targets.push(token);
                  break widthLoop;
                }
              }
            }
        }
      }
      if (targets.length && targets.length > 0) {
        const updates = {
          embedded: {
            Item: {}
          }
        };
        game.i18n.localize("ASE.WallOfFireDamageItem");
        let castItemDamage = wallItem.data.data.damage;
        updates.embedded.Item[activationItemName] = {
          "type": "spell",
          "img": wallItem.img,
          "data": {
            "ability": "",
            "actionType": "save",
            "activation": { "type": "action", "cost": 1, "condition": "" },
            "damage": castItemDamage,
            "scaling": wallItem.data.data.scaling,
            "level": wallItem.data.data.level,
            "save": wallItem.data.data.save,
            "preparation": { "mode": "atwill", "prepared": true },
            "range": { "value": null, "long": null, "units": "" },
            "school": "evo",
            "description": {
              "value": wallItem.data.data.description.value
            }
          },
          "flags": {
            "advancedspelleffects": wallItem.data.flags.advancedspelleffects
          }
        };
        await warpgate.mutate(caster.document, updates, {}, { name: `${caster.actor.id}-call-lightning` });
      }
    }
  }
  static playEffects(aseData, template) {
    if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).zIndex(1e3).persist().play();
    } else if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).tilingTexture({
        x: aseData.flags.wallSegmentSize / 10,
        y: aseData.flags.wallSegmentSize / 10
      }).belowTokens().zIndex(-1e3).persist().play();
    } else {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).stretchTo(template, { attachTo: true, onlyX: true }).fadeIn(250).fadeOut(250).persist().play();
    }
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.WallUseWebPLabel"),
      tooltip: game.i18n.localize("ASE.WallUseWebPTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.useWebP",
      flagName: "useWebP",
      flagValue: currFlags.useWebP ?? false
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallLengthLabel"),
      tooltip: game.i18n.localize("ASE.WallLengthTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallLength",
      flagName: "wallLength",
      flagValue: currFlags.wallLength ?? 60
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallHeightLabel"),
      tooltip: game.i18n.localize("ASE.WallHeightTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallHeight",
      flagName: "wallHeight",
      flagValue: currFlags.wallHeight ?? 20
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallWidthLabel"),
      tooltip: game.i18n.localize("ASE.WallWidthTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallWidth",
      flagName: "wallWidth",
      flagValue: currFlags.wallWidth ?? 1
    });
    animOptions.push({
      label: game.i18n.localize("ASE.WallOfFireColorLabel"),
      tooltip: game.i18n.localize("ASE.WallOfFireColorTooltip"),
      type: "dropdown",
      options: getDBOptions("jb2a.wall_of_fire.300x100"),
      name: "flags.advancedspelleffects.effectOptions.fireColor",
      flagName: "fireColor",
      flagValue: currFlags.fireColor ?? "yellow"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.WallOfFireImpactColorLabel"),
      tooltip: game.i18n.localize("ASE.WallOfFireImpactColorTooltip"),
      type: "dropdown",
      options: getDBOptions("jb2a.impact.004"),
      name: "flags.advancedspelleffects.effectOptions.fireImpactColor",
      flagName: "fireImpactColor",
      flagValue: currFlags.fireImpactColor ?? "yellow"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellDamageEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellDmgSound",
      flagName: "wallSpellDmgSound",
      flagValue: currFlags.wallSpellDmgSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellDmgSoundDelay",
      flagName: "wallSpellDmgSoundDelay",
      flagValue: currFlags.wallSpellDmgSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellDamageEffectVolumeLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellDamageEffectVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellDmgVolume",
      flagName: "wallSpellDmgVolume",
      flagValue: currFlags.wallSpellDmgVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.WallRadiusLabel"),
      tooltip: game.i18n.localize("ASE.WallRadiusTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallRadius",
      flagName: "wallRadius",
      flagValue: currFlags.wallRadius ?? 10
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialSoundLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellSound",
      flagName: "wallSpellSound",
      flagValue: currFlags.wallSpellSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellSoundDelay",
      flagName: "wallSpellSoundDelay",
      flagValue: currFlags.wallSpellSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialVolumeLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellVolume",
      flagName: "wallSpellVolume",
      flagValue: currFlags.wallSpellVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(wallOfFire, "wallOfFire");
class detectStuff {
  constructor(data) {
    this.data = data;
    this.actor = game.actors.get(this.data.actor.id);
    this.caster = canvas.tokens.get(this.data.tokenId);
    this.users = [];
    for (const user in this.actor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        this.users.push(user);
      }
    }
    this.item = this.data.item;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
    this.preset = this.effectOptions.preset ?? "magic";
    switch (this.preset) {
      case "magic":
        this.tags = [
          "abjuration",
          "conjuration",
          "divination",
          "enchantment",
          "evocation",
          "illusion",
          "necromancy",
          "transmutation"
        ];
        this.magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
        break;
      case "goodAndEvil":
        this.tags = ["good", "evil"];
        break;
      case "poisonAndDisease":
        this.tags = ["poison", "disease"];
        break;
      case "custom":
        this.tags = [];
        this.customTags = [];
        for (let tag of Object.keys(this.effectOptions.tagOptions)) {
          this.tags.push(this.effectOptions.tagOptions[tag].tagLabel);
          this.customTags.push({
            tagLabel: this.effectOptions.tagOptions[tag].tagLabel,
            tagEffect: this.effectOptions.tagOptions[tag].tagEffect
          });
        }
        break;
    }
  }
  static registerHooks() {
    console.log("Registering Hooks for Detect Stuff");
    Hooks.on("updateToken", detectStuff._updateToken);
  }
  async cast() {
    await this.castDetect();
  }
  getObjectsInRange(objects) {
    return objects.map((obj) => {
      let returnObj = {};
      let pointA = { x: this.caster.data.x + canvas.grid.size / 2, y: this.caster.data.y + canvas.grid.size / 2 };
      let pointB = { x: obj.data.x + canvas.grid.size / 2, y: obj.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      returnObj["delay"] = distance * 55;
      returnObj["distance"] = distance;
      returnObj["obj"] = obj;
      let tag;
      if (this.preset == "magic") {
        let magicSchool = Tagger.getTags(obj).find((t) => this.tags.includes(t.toLowerCase())) || false;
        let magicColor = Tagger.getTags(obj).find((t) => this.magicalColors.includes(t.toLowerCase())) || "blue";
        returnObj["introAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.intro.${magicColor}`;
        returnObj["loopAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.loop.${magicColor}`;
        returnObj["outroAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`;
        tag = magicSchool;
      } else if (this.preset == "goodAndEvil") {
        tag = Tagger.getTags(obj).find((t) => this.tags.includes(t.toLowerCase())) || false;
        if (tag) {
          if (tag == "good") {
            returnObj["animPath"] = this.effectOptions.goodAnim;
          } else if (tag == "evil") {
            returnObj["animPath"] = this.effectOptions.evilAnim;
          }
        } else {
          returnObj["animPath"] = false;
        }
      } else if (this.preset == "poisonAndDisease") {
        tag = Tagger.getTags(obj).find((t) => this.tags.includes(t.toLowerCase())) || false;
        if (tag) {
          if (tag == "poison") {
            returnObj["animPath"] = this.effectOptions.poisonAnim;
          } else if (tag == "disease") {
            returnObj["animPath"] = this.effectOptions.diseaseAnim;
          }
        } else {
          returnObj["animPath"] = false;
        }
      } else if (this.preset == "custom") {
        let objectTags = Tagger.getTags(obj);
        let customTagObject = this.customTags.filter((ct) => objectTags.includes(ct.tagLabel))[0] ?? false;
        if (customTagObject) {
          tag = customTagObject?.tagLabel ?? false;
        }
        if (tag) {
          returnObj["animPath"] = customTagObject.tagEffect;
        } else {
          returnObj["animPath"] = false;
        }
      }
      returnObj["tag"] = tag;
      return returnObj;
    }).filter((obj) => obj.distance <= this.effectOptions.range && this.tags.includes(obj.tag));
  }
  async castDetect() {
    const taggedObjects = Tagger.getByTag("ASE-detect", { ignore: [this.caster], caseInsensitive: true });
    let objInRange = this.getObjectsInRange(taggedObjects);
    await aseSocket.executeAsGM("updateFlag", this.caster.id, "detectItemId", this.item.id);
    this.playAnimSequence(objInRange);
  }
  async playAnimSequence(objects) {
    const waveSound = this.effectOptions.waveSound ?? false;
    const waveSoundVolume = this.effectOptions.waveSoundVolume ?? 0.5;
    const waveSoundDelay = this.effectOptions.waveSoundDelay ?? 0;
    const waveColor = this.effectOptions.waveColor ?? "blue";
    const auraColor = this.effectOptions.auraColor ?? "blue";
    let detectedObjects = [];
    for (let obj of objects) {
      detectedObjects.push(obj.obj.id);
    }
    let sequence = new Sequence("Advanced Spell Effects").sound().file(waveSound).volume(waveSoundVolume).delay(waveSoundDelay).playIf(waveSound).effect(`jb2a.detect_magic.circle.${waveColor}`).attachTo(this.caster).belowTiles().effect().file(`jb2a.magic_signs.circle.02.divination.intro.${auraColor}`).attachTo(this.caster).scale(0.2).belowTokens().waitUntilFinished(-1e3).fadeOut(1e3, { ease: "easeInQuint" }).effect().file(`jb2a.magic_signs.circle.02.divination.loop.${auraColor}`).attachTo(this.caster).persist().extraEndDuration(750).fadeOut(750, { ease: "easeInQuint" }).scale(0.2).loopProperty("sprite", "rotation", { duration: 2e4, from: 0, to: 360 }).name(`${this.caster.id}-detectMagicAura`).belowTokens();
    for (let obj of objects) {
      if (this.preset == "magic") {
        this.playMagicalObjectAnim(obj);
      } else {
        this.playObjectAnim(obj);
      }
    }
    await aseSocket.executeAsGM("updateFlag", this.caster.id, "objectsDetected", detectedObjects);
    sequence.play();
  }
  async playObjectAnim(object) {
    new Sequence("Advanced Spell Effects").effect(object.animPath).fadeIn(750, { ease: "easeInQuint" }).name(`${object.obj.id}-magicRune`).delay(object.delay).forUsers(this.users).attachTo(object.obj).scale(0.5).persist(true).fadeOut(750, { ease: "easeInQuint" }).zIndex(1).play();
  }
  async playMagicalObjectAnim(object) {
    new Sequence("Advanced Spell Effects").effect(object.introAnimPath).forUsers(this.users).attachTo(object.obj).scale(0.25).delay(object.delay).waitUntilFinished(-1200).zIndex(0).effect(object.loopAnimPath).name(`${object.obj.id}-magicRune`).delay(object.delay).forUsers(this.users).scale(0.25).attachTo(object.obj).persist(true).waitUntilFinished(-750).fadeOut(750, { ease: "easeInQuint" }).zIndex(1).play();
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    await aseSocket.executeAsGM("removeFlag", casterToken.id, "detectItemId");
    let users = [];
    for (const user in casterActor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        users.push(user);
      }
    }
    let preset = effectOptions.preset;
    let tags = [];
    let magicalColors = [];
    let customTags = [];
    switch (preset) {
      case "magic":
        tags = [
          "abjuration",
          "conjuration",
          "divination",
          "enchantment",
          "evocation",
          "illusion",
          "necromancy",
          "transmutation"
        ];
        magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
        break;
      case "goodAndEvil":
        tags = ["good", "evil"];
        break;
      case "poisonAndDisease":
        tags = ["poison", "disease"];
        break;
      case "custom":
        tags = [];
        customTags = [];
        for (let tag of Object.keys(effectOptions.tagOptions)) {
          tags.push(effectOptions.tagOptions[tag].tagLabel);
          customTags.push({
            tagLabel: effectOptions.tagOptions[tag].tagLabel,
            tagEffect: effectOptions.tagOptions[tag].tagEffect
          });
        }
        break;
    }
    Tagger.getByTag("ASE-detect", { ignore: [casterToken], caseInsensitive: true });
    let detectedObjectsIDs = casterToken.document.getFlag("advancedspelleffects", "objectsDetected");
    await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-detectMagicAura`, object: casterToken });
    new Sequence("Advanced Spell Effects").effect().file(`jb2a.magic_signs.circle.02.divination.outro.${effectOptions.auraColor}`).scale(0.2).belowTokens().attachTo(casterToken).play();
    for await (let id of detectedObjectsIDs) {
      let object = canvas.scene.tiles.get(id) || canvas.scene.tokens.get(id) || canvas.scene.drawings.get(id) || canvas.scene.walls.get(id) || canvas.scene.lights.get(id) || game.scenes.get(id) || game.users.get(id);
      let pointA = { x: casterToken.data.x + canvas.grid.size / 2, y: casterToken.data.y + canvas.grid.size / 2 };
      let pointB = { x: object.data.x + canvas.grid.size / 2, y: object.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      if (object) {
        if (preset == "magic") {
          let magicSchool = Tagger.getTags(object).find((t) => tags.includes(t.toLowerCase())) || false;
          let magicColor = Tagger.getTags(object).find((t) => magicalColors.includes(t.toLowerCase())) || "blue";
          await Sequencer.EffectManager.endEffects({ name: `${id}-magicRune` });
          new Sequence("Advanced Spell Effects").effect(`jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`).forUsers(users).attachTo(object.id).playIf(distance <= 30).scale(0.25).zIndex(0).play();
        } else {
          await Sequencer.EffectManager.endEffects({ name: `${id}-magicRune` });
        }
      }
    }
    await aseSocket.executeAsGM("removeFlag", casterToken.id, "objectsDetected");
  }
  static async _updateToken(tokenDocument, updateData) {
    if (!updateData.x && !updateData.y)
      return;
    const isGM = isFirstGM();
    if (!isGM)
      return;
    const itemId = tokenDocument.getFlag("advancedspelleffects", "detectItemId");
    if (!itemId)
      return;
    let item = tokenDocument._actor?.items?.get(itemId) ?? game.items.get(itemId) ?? false;
    if (!item)
      return;
    if (tokenDocument.actor.effects.filter(async (effect) => {
      let effectItem = await fromUuid(effect.data.origin);
      return effectItem.name == item.name;
    }).length == 0) {
      return;
    }
    const effectOptions = item.getFlag("advancedspelleffects", "effectOptions");
    let newPos = { x: 0, y: 0 };
    newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
    newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
    let users = [];
    for (const user in tokenDocument.actor.data.permission) {
      if (user == "default")
        continue;
      if (game.users.get(user)) {
        users.push(user);
      }
    }
    let preset = effectOptions.preset;
    let tags = [];
    let magicalColors = [];
    let customTags = [];
    let taggedObjects;
    switch (preset) {
      case "magic":
        tags = [
          "abjuration",
          "conjuration",
          "divination",
          "enchantment",
          "evocation",
          "illusion",
          "necromancy",
          "transmutation"
        ];
        magicalColors = ["blue", "green", "pink", "purple", "red", "yellow"];
        break;
      case "goodAndEvil":
        tags = ["good", "evil"];
        break;
      case "poisonAndDisease":
        tags = ["poison", "disease"];
        break;
      case "custom":
        tags = [];
        customTags = [];
        for (let tag of Object.keys(effectOptions.tagOptions)) {
          tags.push(effectOptions.tagOptions[tag].tagLabel);
          customTags.push({
            tagLabel: effectOptions.tagOptions[tag].tagLabel,
            tagEffect: effectOptions.tagOptions[tag].tagEffect
          });
        }
        break;
    }
    taggedObjects = Tagger.getByTag(
      "ASE-detect",
      { caseInsensitive: true }
    );
    let detectedObjects = taggedObjects.map((obj) => {
      let returnObj = {};
      let pointA = { x: newPos.x + canvas.grid.size / 2, y: newPos.y + canvas.grid.size / 2 };
      let pointB = { x: obj.data.x + canvas.grid.size / 2, y: obj.data.y + canvas.grid.size / 2 };
      let distance = measureDistance(pointA, pointB);
      returnObj["delay"] = 0;
      returnObj["distance"] = distance;
      returnObj["obj"] = obj;
      let tag;
      if (preset == "magic") {
        let magicSchool = Tagger.getTags(obj).find((t) => tags.includes(t.toLowerCase())) || false;
        let magicColor = Tagger.getTags(obj).find((t) => magicalColors.includes(t.toLowerCase())) || "blue";
        returnObj["introAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.intro.${magicColor}`;
        returnObj["loopAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.loop.${magicColor}`;
        returnObj["outroAnimPath"] = `jb2a.magic_signs.rune.${magicSchool}.outro.${magicColor}`;
        tag = magicSchool;
      } else if (preset == "goodAndEvil") {
        tag = Tagger.getTags(obj).find((t) => tags.includes(t.toLowerCase())) || false;
        if (tag) {
          if (tag == "good") {
            returnObj["animPath"] = effectOptions.goodAnim;
          } else if (tag == "evil") {
            returnObj["animPath"] = effectOptions.evilAnim;
          }
        } else {
          returnObj["animPath"] = false;
        }
      } else if (preset == "poisonAndDisease") {
        tag = Tagger.getTags(obj).find((t) => tags.includes(t.toLowerCase())) || false;
        if (tag) {
          if (tag == "poison") {
            returnObj["animPath"] = effectOptions.poisonAnim;
          } else if (tag == "disease") {
            returnObj["animPath"] = effectOptions.diseaseAnim;
          }
        } else {
          returnObj["animPath"] = false;
        }
      } else if (preset == "custom") {
        let objectTags = Tagger.getTags(obj);
        let customTagObject = customTags.filter((ct) => objectTags.includes(ct.tagLabel))[0] ?? false;
        if (customTagObject) {
          tag = customTagObject?.tagLabel ?? false;
        }
        if (tag) {
          returnObj["animPath"] = customTagObject.tagEffect;
        } else {
          returnObj["animPath"] = false;
        }
      }
      returnObj["tag"] = tag;
      return returnObj;
    }).filter((obj) => tags.includes(obj.tag));
    let detectedObjectsOutOfRange = detectedObjects.filter((o) => o.distance > effectOptions.range);
    let detectedObjectsInRange = detectedObjects.filter((o) => o.distance <= effectOptions.range);
    let detectedObjectsIDs = tokenDocument.getFlag("advancedspelleffects", "objectsDetected");
    for await (let detectedObj of detectedObjectsOutOfRange) {
      if (preset == "magic") {
        await Sequencer.EffectManager.endEffects({ name: `${detectedObj.obj.id}-magicRune` });
        new Sequence("Advanced Spell Effects").effect(detectedObj.outroAnimPath).forUsers(users).playIf(detectedObjectsIDs.includes(detectedObj.obj.id)).attachTo(detectedObj.obj.id).scale(0.25).zIndex(0).play();
      } else {
        await Sequencer.EffectManager.endEffects({ name: `${detectedObj.obj.id}-magicRune` });
      }
    }
    if (detectedObjectsIDs?.length > 0) {
      for (let detectedObj of detectedObjectsOutOfRange) {
        detectedObjectsIDs = detectedObjectsIDs?.filter((id) => id != detectedObj.obj.id) ?? [];
      }
      await aseSocket.executeAsGM("updateFlag", tokenDocument.id, "objectsDetected", detectedObjectsIDs);
    }
    for await (let detectedObj of detectedObjectsInRange) {
      if (detectedObjectsIDs?.includes(detectedObj.obj.id)) {
        continue;
      }
      if (preset == "magic") {
        new Sequence("Advanced Spell Effects").effect(detectedObj.introAnimPath).forUsers(users).attachTo(detectedObj.obj).scale(0.25).delay(detectedObj.delay).waitUntilFinished(-1200).zIndex(0).effect(detectedObj.loopAnimPath).name(`${detectedObj.obj.id}-magicRune`).delay(detectedObj.delay).forUsers(users).scale(0.25).attachTo(detectedObj.obj).persist(true).waitUntilFinished(-750).fadeOut(750, { ease: "easeInQuint" }).zIndex(1).play();
      } else {
        new Sequence("Advanced Spell Effects").effect(detectedObj.animPath).fadeIn(750, { ease: "easeInQuint" }).name(`${detectedObj.obj.id}-magicRune`).delay(detectedObj.delay).forUsers(users).scale(0.5).attachTo(detectedObj.obj).persist(true).fadeOut(750, { ease: "easeInQuint" }).zIndex(1).play();
      }
    }
    for (let detectedObj of detectedObjectsInRange) {
      if (detectedObjectsIDs?.length > 0) {
        if (!detectedObjectsIDs.includes(detectedObj.obj.id)) {
          detectedObjectsIDs.push(detectedObj.obj.id);
        }
      }
    }
    await aseSocket.executeAsGM("updateFlag", tokenDocument.id, "objectsDetected", detectedObjectsIDs);
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const detectMagicWaves = `jb2a.detect_magic.circle`;
    const detectMagicWaveColorOptions = getDBOptions(detectMagicWaves);
    const detectMagicAuras = `jb2a.magic_signs.circle.02.divination.intro`;
    const detectMagicAuraColorOptions = getDBOptions(detectMagicAuras);
    const detectPresetAnims = "jb2a.icon";
    const detectPresetAnimOptions = getDBOptionsIcons(detectPresetAnims);
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const presetOptions = [
      { "magic": "Detect Magic" },
      { "goodAndEvil": "Detect Good and Evil" },
      { "poisonAndDisease": "Detect Poison and Disease" },
      { "custom": "Custom" }
    ];
    spellOptions.push({
      label: game.i18n.localize("ASE.DetectPresetsLabel"),
      type: "dropdown",
      options: presetOptions,
      name: "flags.advancedspelleffects.effectOptions.preset",
      flagName: "preset",
      flagValue: currFlags.preset ?? "magic"
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.DetectRangeLabel"),
      tooltip: game.i18n.localize("ASE.DetectRangeTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.range",
      flagName: "range",
      flagValue: currFlags.range ?? 30
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectWaveColorLabel"),
      type: "dropdown",
      options: detectMagicWaveColorOptions,
      name: "flags.advancedspelleffects.effectOptions.waveColor",
      flagName: "waveColor",
      flagValue: currFlags.waveColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DetectWaveSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.waveSound",
      flagName: "waveSound",
      flagValue: currFlags.waveSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DetectWaveSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.waveSoundDelay",
      flagName: "wakeSoundDelay",
      flagValue: currFlags.waveSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.DetectWaveSoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.waveVolume",
      flagName: "waveVolume",
      flagValue: currFlags.waveVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectAuraColorLabel"),
      type: "dropdown",
      options: detectMagicAuraColorOptions,
      name: "flags.advancedspelleffects.effectOptions.auraColor",
      flagName: "auraColor",
      flagValue: currFlags.auraColor ?? "blue"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectGoodAnimLabel"),
      tooltip: game.i18n.localize("ASE.DetectGoodAnimTooltip"),
      type: "dropdown",
      options: detectPresetAnimOptions,
      name: "flags.advancedspelleffects.effectOptions.goodAnim",
      flagName: "goodAnim",
      flagValue: currFlags.goodAnim ?? "jb2a.icon.runes03.yellow"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectEvilAnimLabel"),
      tooltip: game.i18n.localize("ASE.DetectEvilAnimTooltip"),
      type: "dropdown",
      options: detectPresetAnimOptions,
      name: "flags.advancedspelleffects.effectOptions.evilAnim",
      flagName: "evilAnim",
      flagValue: currFlags.evilAnim ?? "jb2a.icon.runes03.dark_black"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectPoisonAnimLabel"),
      tooltip: game.i18n.localize("ASE.DetectPoisonAnimTooltip"),
      type: "dropdown",
      options: detectPresetAnimOptions,
      name: "flags.advancedspelleffects.effectOptions.poisonAnim",
      flagName: "poisonAnim",
      flagValue: currFlags.poisonAnim ?? "jb2a.icon.poison.dark_green"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.DetectDiseaseAnimLabel"),
      tooltip: game.i18n.localize("ASE.DetectDiseaseAnimTooltip"),
      type: "dropdown",
      options: detectPresetAnimOptions,
      name: "flags.advancedspelleffects.effectOptions.diseaseAnim",
      flagName: "diseaseAnim",
      flagValue: currFlags.diseaseAnim ?? "jb2a.icon.poison.purple"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(detectStuff, "detectStuff");
class wallSpell extends baseSpellClass {
  constructor(data) {
    super();
    this.data = data;
    this.actor = game.actors.get(this.data.actor.id);
    this.token = canvas.tokens.get(this.data.tokenId);
    this.item = this.data.item;
    this.itemCardId = this.data.itemCardId;
    this.itemLevel = this.data.itemLevel;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions") ?? {};
    this.wallType = this.effectOptions.wallType.toLowerCase();
    this.wallCategory = "";
    this.wallOptions = {};
    this.chatMessage = {};
    this.baseTemplateData = {
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      color: "#FFFFFF",
      fillColor: "#FFFFFF",
      flags: {
        tagger: { tags: [`wallSpell-${this.wallType}-${this.actor.id}`] },
        advancedspelleffects: {
          wallSpellWallNum: 12,
          dimensions: {},
          wallType: this.wallType,
          length: this.effectOptions.wallLength,
          wallOperationalData: {},
          wallEffectData: this.effectOptions,
          wallName: this.item.name
        }
      }
    };
  }
  async cast() {
    this._setWallCategory();
    this._setWallOptions();
    const { dimensions, texture, type } = await warpgate.buttonDialog(this._getDialogData(), "column");
    if (!dimensions || !texture)
      return;
    const chatMessage = await game.messages.get(this.itemCardId);
    if (chatMessage) {
      this.chatMessage = chatMessage.id;
    }
    this._setBaseTemplateData(dimensions, type);
    const aseData = {
      itemLevel: this.itemLevel,
      flags: this.effectOptions,
      caster: this.token,
      casterActor: this.actor,
      dimensions,
      texture
    };
    if (type == "h-panels" || type == "v-panels") {
      let wallPanelDiag = new wallPanelDialog({ aseData, templateData: this.baseTemplateData, type }).render(true);
      Hooks.once("createMeasuredTemplate", async (template2) => {
        await template2.setFlag("advancedspelleffects", "placed", true);
        wallSpell.placePanels(aseData, template2, wallPanelDiag, type);
      });
      const doc = new MeasuredTemplateDocument(this.baseTemplateData, { parent: canvas.scene });
      let template = new game.dnd5e.canvas.AbilityTemplate(doc);
      template.actorSheet = aseData.casterActor.sheet;
      template.drawPreview();
    } else {
      Hooks.once("createMeasuredTemplate", async (template2) => {
        const direction = template2.data.direction;
        const templateDimensions = template2.getFlag("advancedspelleffects", "dimensions") ?? {};
        const templateLength = templateDimensions?.length ?? 0;
        if ((direction == 0 || direction == 180 || direction == 90 || direction == 270) && templateLength > 0) {
          await template2.update({ distance: templateLength, flags: { advancedspelleffects: { placed: true } } });
        } else {
          await template2.setFlag("advancedspelleffects", "placed", true);
        }
        wallSpell.playEffects(aseData, template2);
        wallSpell.placeWalls(template2);
        if (this.wallType.includes("fire")) {
          await wallSpell.pickFireSide(template2);
        }
        if (isMidiActive()) {
          wallSpell.handleOnCast(template2);
        }
      });
      const doc = new MeasuredTemplateDocument(this.baseTemplateData, { parent: canvas.scene });
      let template = new game.dnd5e.canvas.AbilityTemplate(doc);
      template.actorSheet = aseData.casterActor.sheet;
      template.drawPreview();
    }
  }
  _setWallCategory() {
    if (this.wallType.includes("thorns") || this.wallType.includes("fire") || this.wallType.includes("light") || this.wallType.includes("sand") || this.wallType.includes("water")) {
      this.wallCategory = "wall";
    } else if (this.wallType.includes("force") || this.wallType.includes("ice") || this.wallType.includes("stone")) {
      this.wallCategory = "panels";
    }
  }
  _setWallOptions() {
    switch (this.wallCategory) {
      case "wall":
        this.wallOptions = {
          wallCategory: "wall",
          rect: {
            dimensions: {
              length: this.effectOptions.wallLength,
              width: this.effectOptions.wallHeight
            }
          },
          circle: {
            dimensions: {
              radius: this.effectOptions.wallRadius
            }
          }
        };
        break;
      case "panels":
        this.wallOptions = {
          wallCategory: "panels",
          rect: {
            horizontal: {
              dimensions: {
                length: this.effectOptions.wallSegmentSize,
                width: this.effectOptions.wallSegmentSize
              }
            },
            vertical: {
              dimensions: {
                length: this.effectOptions.wallSegmentSize,
                width: this.effectOptions.wallSegmentSize
              }
            }
          },
          circle: {
            dimensions: {
              radius: this.effectOptions.wallRadius
            }
          }
        };
        break;
      default:
        this.wallOptions = {
          wallCategory: "wall",
          rect: {
            dimensions: {
              length: this.effectOptions.wallLength,
              height: this.effectOptions.wallHeight
            }
          },
          circle: {
            dimensions: {
              radius: this.effectOptions.wallRadius
            }
          }
        };
        break;
    }
  }
  _getDialogData() {
    const wallType = this.wallType;
    const wallOptions = this.wallOptions;
    const wallCategory = this.wallCategory;
    const effectOptions = this.effectOptions;
    const useWebP = effectOptions.useWebP ?? false;
    let dialogData = {
      title: `Choose your Wall of ${this.wallType} shape`,
      buttons: []
    };
    if (!wallType.toLowerCase().includes("light") && !wallType.toLowerCase().includes("sand")) {
      dialogData.buttons.push({
        label: `Sphere/Dome/Ring(${wallOptions.circle.dimensions.radius}ft radius)`,
        value: {
          dimensions: wallOptions.circle.dimensions,
          texture: this._getTexture({ type: "circle", effectData: this.effectOptions }, wallType, useWebP),
          type: "circle"
        }
      });
    }
    switch (wallCategory) {
      case "wall":
        dialogData.buttons.push({
          label: `Wall(${wallOptions.rect.dimensions.length}ft x ${wallOptions.rect.dimensions.width}ft)`,
          value: {
            dimensions: wallOptions.rect.dimensions,
            texture: this._getTexture({ type: "wall", effectData: this.effectOptions }, wallType, useWebP),
            type: "ray"
          }
        });
        break;
      case "panels":
        dialogData.buttons.push({
          label: `Horizontal Panels(${wallOptions.rect.horizontal.dimensions.length}ft x ${wallOptions.rect.horizontal.dimensions.width}ft)`,
          value: {
            dimensions: wallOptions.rect.horizontal.dimensions,
            texture: this._getTexture({ type: "panel", subtype: "horizontal", effectData: this.effectOptions }, wallType, useWebP),
            type: "h-panels"
          }
        });
        dialogData.buttons.push({
          label: `Vertical Panels(${wallOptions.rect.vertical.dimensions.length}ft x ${wallOptions.rect.vertical.dimensions.width}ft)`,
          value: {
            dimensions: wallOptions.rect.vertical.dimensions,
            texture: this._getTexture({ type: "panel", subtype: "vertical", effectData: this.effectOptions }, wallType, useWebP),
            type: "v-panels"
          }
        });
        break;
    }
    return dialogData;
  }
  _setBaseTemplateData(dimensions, type) {
    this.baseTemplateData.flags.advancedspelleffects.dimensions = dimensions;
    this.baseTemplateData.flags.tagger.tags.push("0");
    if (type == "circle") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.CIRCLE;
      this.baseTemplateData["distance"] = dimensions.radius;
    } else if (type == "ray") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
      this.baseTemplateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
      this.baseTemplateData["width"] = this.effectOptions.wallWidth;
    } else if (type == "v-panels") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RAY;
      this.baseTemplateData["distance"] = dimensions.length;
    } else if (type == "h-panels") {
      this.baseTemplateData["t"] = CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE;
      this.baseTemplateData["distance"] = Math.sqrt(Math.pow(dimensions.length, 2) + Math.pow(dimensions.width, 2));
      this.baseTemplateData["direction"] = 180 * Math.atan2(dimensions.length, dimensions.width) / Math.PI;
    }
    switch (this.wallType) {
      case "fire":
        let damageRoll;
        if (this.effectOptions.levelScaling) {
          damageRoll = `${Number(this.itemLevel) + 1}d8`;
        } else {
          damageRoll = `${this.effectOptions.dmgDieCount}${this.effectOptions.dmgDie}${this.effectOptions.dmgMod > 0 ? ` + ${this.effectOptions.dmgMod}` : ""}`;
        }
        this.baseTemplateData.flags.advancedspelleffects.wallOperationalData = {
          savingThrowOnCast: true,
          savingThrow: "dex",
          halfDamOnSave: true,
          damage: damageRoll,
          damageType: "fire",
          damageOnTouch: true,
          savingThrowOnTouch: false,
          checkForTouch: true,
          damageSide: "",
          damageInArea: true,
          damageArea: {},
          damageOnCast: true,
          savingThrowDC: this.actor.data.data.attributes.spelldc ?? 0,
          chatMessage: this.chatMessage,
          item: this.item.id,
          casterActor: this.actor.id,
          range: this.effectOptions?.range ?? 10,
          casterToken: this.token.id
        };
    }
  }
  _getTexture(options, wallType, useWebP = false) {
    let texture = "";
    switch (wallType) {
      case "thorns":
        if (useWebP) {
          texture = "modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Brown_Thumb.webp";
        } else {
          texture = "jb2a.entangle.brown";
        }
        break;
      case "fire":
        if (options.type == "circle") {
          if (useWebP) {
            texture = `modules/jb2a_patreon/Library/Generic/Fire/FireRing_01_Circle_${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}_Thumb.webp`;
          } else {
            texture = `jb2a.fire_ring.900px.${options.effectData.fireColor == "yellow" ? "red" : options.effectData.fireColor}`;
          }
        } else if (options.type == "wall") {
          if (useWebP) {
            texture = `modules/jb2a_patreon/Library/4th_Level/Wall_Of_Fire/WallOfFire_01_${options.effectData.fireColor}_Thumb.webp`;
          } else {
            texture = `jb2a.wall_of_fire.300x100.${options.effectData.fireColor}`;
          }
        }
        break;
      case "force":
        if (options.type == "circle") {
          if (useWebP) {
            texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_Sphere_Thumb.webp`;
          } else {
            texture = `jb2a.wall_of_force.sphere.${options.effectData.forceColor}`;
          }
        } else if (options.type == "panel") {
          if (options.subtype == "horizontal") {
            if (useWebP) {
              texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_H_Thumb.webp`;
            } else {
              texture = `jb2a.wall_of_force.horizontal.${options.effectData.forceColor}`;
            }
          } else if (options.subtype == "vertical") {
            if (useWebP) {
              texture = `modules/jb2a_patreon/Library/5th_Level/Wall_Of_Force/WallOfForce_01_${options.effectData.forceColor}_V_Thumb.webp`;
            } else {
              texture = `jb2a.wall_of_force.vertical.${options.effectData.forceColor}`;
            }
          }
        }
        break;
    }
    return texture;
  }
  static registerHooks() {
    if (!game.user.isGM)
      return;
    Hooks.on("updateMeasuredTemplate", wallSpell.updateMeasuredTemplate);
    Hooks.on("deleteMeasuredTemplate", wallSpell.deleteMeasuredTemplate);
    Hooks.on("preUpdateToken", wallSpell.preUpdateToken);
    Hooks.on("updateCombat", wallSpell.updateCombat);
    return;
  }
  static async updateCombat(combat) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    const token = canvas.tokens.get(combat.previous.tokenId);
    if (!token)
      return;
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    const tokenPos = { x: token.data.x, y: token.data.y };
    await token.document.unsetFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
    const wallTemplates = canvas.templates.placeables.filter((template) => template.document.getFlag("advancedspelleffects", "wallOperationalData.damageOnTouch") == true || template.document.getFlag("advancedspelleffects", "wallOperationalData.savingThrowOnTouch") == true);
    if (wallTemplates.length && wallTemplates.length > 0) {
      for await (let wallTemplate of wallTemplates) {
        const templateDocument = wallTemplate.document;
        if (!templateDocument)
          return;
        const templateData = templateDocument.data;
        if (!templateData)
          return;
        const aseData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
        const aseEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
        if (!aseData || !aseData.damageOnTouch)
          return;
        if (!aseData.checkForTouch)
          return;
        const wallData = {
          wallName: templateDocument.getFlag("advancedspelleffects", "wallName") ?? "",
          wallTemplateId: templateDocument.id,
          wallType: templateDocument.getFlag("advancedspelleffects", "wallType") ?? "",
          wallOperationalData: aseData,
          wallEffectData: aseEffectData
        };
        templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
        const mTemplate = templateDocument.object;
        const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: templateData.t, distance: mTemplate.data.distance };
        if (templateDetails.shape == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
          let templateCenter = { x: templateDetails.x, y: templateDetails.y };
          let templateRadius = templateDetails.distance / 5 * grid;
          const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: tokenPos.x + x * grid,
                  y: tokenPos.y + y * grid
                };
                let inRange = false;
                if (sideToCheck == "inside") {
                  inRange = isPointInCircle(templateCenter, currGrid, 0, templateRadius);
                } else if (sideToCheck == "outside") {
                  const outerRadius = templateRadius + aseData.range / 5 * grid;
                  inRange = isPointInCircle(templateCenter, currGrid, templateRadius, outerRadius);
                }
                if (inRange) {
                  wallSpell.activateWallEffect(token, wallData);
                  break widthLoop;
                } else {
                  console.log("Token not in range of wall circle: ", token.name);
                }
              }
            }
        } else {
          let templatePointA = { x: templateDetails.x, y: templateDetails.y };
          const templateAngle = templateData.direction * (Math.PI / 180);
          const templateLength = templateData.distance * grid / 5;
          const templatePointBX = templatePointA.x + templateLength * Math.cos(templateAngle);
          const templatePointBY = templatePointA.y + templateLength * Math.sin(templateAngle);
          let templatePointB = { x: templatePointBX, y: templatePointBY };
          if (templatePointA.x > templatePointB.x && templatePointA.y > templatePointB.y || templatePointA.x < templatePointB.x && templatePointA.y > templatePointB.y) {
            const temp = templatePointA;
            templatePointA = templatePointB;
            templatePointB = temp;
          } else if (templatePointA.x == templatePointB.x) {
            if (templatePointA.y > templatePointB.y) {
              const temp = templatePointA;
              templatePointA = templatePointB;
              templatePointB = temp;
            }
          } else if (templatePointA.y == templatePointB.y) {
            if (templatePointA.x > templatePointB.x) {
              const temp = templatePointA;
              templatePointA = templatePointB;
              templatePointB = temp;
            }
          }
          const sideToCheck = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.damageSide");
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: tokenPos.x + x * grid,
                  y: tokenPos.y + y * grid
                };
                const inRange = isPointNearLine(templatePointA, templatePointB, currGrid, aseData.range / 5 * grid);
                if (inRange) {
                  let isOnSide = false;
                  if (sideToCheck == "bottom" || sideToCheck == "left") {
                    isOnSide = isPointOnLeft(templatePointA, templatePointB, currGrid);
                  } else if (sideToCheck == "top" || sideToCheck == "right") {
                    isOnSide = isPointOnLeft(templatePointB, templatePointA, currGrid);
                  }
                  if (isOnSide) {
                    wallSpell.activateWallEffect(token, wallData);
                    break widthLoop;
                  } else {
                    console.log("Token not on side of wall: ", token.name);
                  }
                } else {
                  console.log("Token not in range of wall: ", token.name);
                }
              }
            }
        }
      }
    }
  }
  static async preUpdateToken(tokenDocument, updateData) {
    const isGM = isFirstGM();
    if (!isGM)
      return;
    if (!updateData.x && !updateData.y)
      return;
    const token = tokenDocument;
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    const oldPos = { x: tokenDocument.data.x, y: tokenDocument.data.y };
    let newPos = { x: 0, y: 0 };
    newPos.x = updateData.x ? updateData.x : tokenDocument.data.x;
    newPos.y = updateData.y ? updateData.y : tokenDocument.data.y;
    const movementRay = new Ray(oldPos, newPos);
    const templates = Array.from(canvas?.scene?.templates ?? {});
    if (templates.length == 0)
      return;
    let templateDocument = {};
    let wallsTouched = token.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched") ?? [];
    let wallName = "";
    for (let i = 0; i < templates.length; i++) {
      templateDocument = templates[i];
      const templateData = templateDocument.data;
      if (!templateData)
        return;
      const aseData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
      const aseEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
      if (!aseData || !aseData.damageOnTouch)
        return;
      if (!aseData.checkForTouch)
        return;
      wallName = templateDocument.getFlag("advancedspelleffects", "wallName") ?? "";
      const mTemplate = templateDocument.object;
      const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
      const templatePointA = { x: templateDetails.x, y: templateDetails.y };
      const templateAngle = templateData.direction * (Math.PI / 180);
      const templateLength = templateData.distance * grid / 5;
      const templatePointBX = templatePointA.x + templateLength * Math.cos(templateAngle);
      const templatePointBY = templatePointA.y + templateLength * Math.sin(templateAngle);
      const templatePointB = { x: templatePointBX, y: templatePointBY };
      const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
      const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
      widthLoop:
        for (let x = startX; x < token.data.width; x++) {
          for (let y = startY; y < token.data.height; y++) {
            const currGrid = {
              x: newPos.x + x * grid - templatePointA.x,
              y: newPos.y + y * grid - templatePointA.y
            };
            const oldCurrGrid = {
              x: oldPos.x + x * grid - templatePointA.x,
              y: oldPos.y + y * grid - templatePointA.y
            };
            let previousContains = templateDetails.shape?.contains(oldCurrGrid.x, oldCurrGrid.y);
            let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
            if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
              previousContains = false;
              contains = false;
            }
            let crossed = false;
            if (!contains) {
              const dragCoordOld = {
                x: movementRay.A.x + x * grid,
                y: movementRay.A.y + y * grid
              };
              const dragCoordNew = {
                x: movementRay.B.x + x * grid,
                y: movementRay.B.y + y * grid
              };
              if (templateData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
                crossed = lineCrossesCircle(dragCoordOld, dragCoordNew, templatePointA, templateDetails.distance / 5 * grid);
              } else {
                crossed = lineCrossesLine(dragCoordOld, dragCoordNew, templatePointA, templatePointB);
              }
            }
            if ((previousContains && contains || !previousContains) && (crossed || contains)) {
              if (wallsTouched.includes(templateDocument.id)) {
                console.log(`${token.name} has already been effected by this ${wallName} this turn - ${templateDocument.id}`);
                ui.notifications.info(game.i18n.format("ASE.WallSpellAlreadyEffected", { name: token.name, wallName }));
                break widthLoop;
              } else {
                console.log(`${token.name} touched ${wallName} - ${templateDocument.id}`);
                ui.notifications.info(game.i18n.format("ASE.WallSpellTouchingWall", { name: token.name, wallName }));
                wallsTouched.push(templateDocument.id);
                const wallData = {
                  wallName,
                  wallTemplateId: templateDocument.id,
                  wallType: templateDocument.getFlag("advancedspelleffects", "wallType") ?? "",
                  wallOperationalData: aseData,
                  wallEffectData: aseEffectData
                };
                await wallSpell.activateWallEffect(token, wallData);
                break widthLoop;
              }
            }
          }
        }
    }
    await token.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
  }
  static async activateWallEffect(token, wallData) {
    const wallOperationalData = wallData.wallOperationalData;
    const wallEffectData = wallData.wallEffectData;
    function addTokenToText(token2, damageTotal) {
      return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token2.id}"> <b>${token2.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token2.id}" style="display: none;"> <b>${token2.name}</b></div>
      <div>
      ${game.i18n.format("ASE.TookDamageMessage", { damageTotal })}
        
      </div>
      <div><img src="${token2?.data?.img}" height="30" style="border:0px"></div>
    </div>`;
    }
    __name(addTokenToText, "addTokenToText");
    const casterActor = game.actors.get(wallOperationalData.casterActor);
    const casterToken = canvas.tokens.get(wallOperationalData.casterToken);
    const spellItem = casterActor.items.get(wallOperationalData.item);
    let itemData = spellItem.data;
    itemData.data.components.concentration = false;
    if (isMidiActive()) {
      const damageRoll = await new Roll(wallOperationalData.damage).evaluate({ async: true });
      if (game.modules.get("dice-so-nice")?.active) {
        game.dice3d?.showForRoll(damageRoll);
      }
      let midiData;
      midiData = await new MidiQOL.DamageOnlyWorkflow(
        casterActor,
        casterToken.document,
        damageRoll.total,
        wallOperationalData.damageType,
        [token],
        damageRoll,
        {
          flavor: `${wallData.wallName} - Damage Roll (${wallOperationalData.damage} ${wallOperationalData.damageType})`,
          itemCardId: "new",
          itemData: spellItem.data
        }
      );
      const chatMessage = await game.messages.get(midiData.itemCardId);
      let chatMessageContent = await duplicate(chatMessage.data.content);
      let newChatmessageContent = $(chatMessageContent);
      newChatmessageContent.find(".midi-qol-hits-display").empty();
      newChatmessageContent.find(".midi-qol-hits-display").append(
        $(addTokenToText(token, damageRoll.total))
      );
      await chatMessage.update({ content: newChatmessageContent.prop("outerHTML") });
      await ui.chat.scrollBottom();
    }
    new Sequence("Advanced Spell Effects").sound().file(wallEffectData.wallSpellDmgSound).delay(Number(wallEffectData.wallSpellDmgSoundDelay) ?? 0).volume(wallEffectData.wallSpellDmgVolume ?? 0.5).playIf(wallEffectData.wallSpellDmgSound && wallEffectData.wallSpellDmgSound != "").effect().file(`jb2a.impact.004.${wallEffectData?.fireImpactColor ?? "orange"}`).attachTo(token).randomRotation().scaleIn(0.5, 200).scaleToObject().animateProperty("sprite", "rotation", { duration: 1e3, from: 0, to: 45 }).randomOffset(0.5).repeats(4, 100, 250).play();
    return;
  }
  static async updateMeasuredTemplate(template, changes) {
    if (template.getFlag("advancedspelleffects", "wallSpellWallNum") && (changes.x !== void 0 || changes.y !== void 0 || changes.direction !== void 0)) {
      wallSpell.placeWalls(template, true);
    }
  }
  static async deleteMeasuredTemplate(template) {
    const walls = Tagger.getByTag([`wallSpell-${template.getFlag("advancedspelleffects", "wallType")}-Wall${template.id}`]).map((wall) => wall.id);
    if (walls.length) {
      await canvas.scene.deleteEmbeddedDocuments("Wall", walls);
    }
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    let wallSpellTemplates = Tagger.getByTag(`wallSpell-${effectOptions.wallType}-${casterActor.id}`);
    let wsTemplateIds = [];
    if (wallSpellTemplates.length > 0) {
      wallSpellTemplates.forEach((template) => {
        wsTemplateIds.push(template.id);
      });
      await aseSocket.executeAsGM("deleteTemplates", wsTemplateIds);
    }
    const tokens = canvas.tokens.placeables;
    let tokenDocument = {};
    let wallsTouched = [];
    for (let i = 0; i < tokens.length; i++) {
      tokenDocument = tokens[i].document;
      wallsTouched = tokenDocument.getFlag("advancedspelleffects", "wallTouchedData.wallsTouched");
      if (!wallsTouched || wallsTouched.length == 0)
        continue;
      wallsTouched = wallsTouched.filter((wallId) => !wsTemplateIds.includes(wallId));
      await tokenDocument.setFlag("advancedspelleffects", "wallTouchedData.wallsTouched", wallsTouched);
    }
  }
  static async placeWalls(templateDocument, deleteOldWalls = false) {
    if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE)
      return;
    const wallType = templateDocument.getFlag("advancedspelleffects", "wallType") ?? "";
    if (wallType != "force")
      return;
    if (deleteOldWalls) {
      const walls2 = Tagger.getByTag([`wallSpell-${wallType}-Wall${templateDocument.id}`]).map((wall) => wall.id);
      if (walls2.length) {
        await canvas.scene.deleteEmbeddedDocuments("Wall", walls2);
      }
    }
    const template = templateDocument.object;
    const walls = [];
    if (templateDocument.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      const placedX = template.x;
      const placedY = template.y;
      let wall_number = 12;
      let wall_angles = 2 * Math.PI / wall_number;
      let outerCircleRadius = template.shape.radius;
      let lastPoint = false;
      let firstPoint;
      for (let i = 0; i < wall_number; i++) {
        const currentPoint = [
          placedX + outerCircleRadius * Math.cos(i * wall_angles),
          placedY + outerCircleRadius * Math.sin(i * wall_angles)
        ];
        if (lastPoint) {
          walls.push({
            c: [...lastPoint, ...currentPoint],
            flags: { tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] } },
            move: 20,
            sight: 0,
            light: 0,
            sound: 0
          });
        }
        lastPoint = [...currentPoint];
        if (!firstPoint)
          firstPoint = [...currentPoint];
      }
      walls.push({
        c: [...lastPoint, ...firstPoint],
        flags: { tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] } },
        move: 20,
        sight: 0,
        light: 0,
        sound: 0
      });
    } else {
      const startPoint = template.ray.A;
      const endPoint = template.ray.B;
      walls.push({
        c: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
        flags: {
          tagger: { tags: [`wallSpell-${wallType}-Wall${templateDocument.id}`] },
          wallHeight: {
            wallHeightTop: templateDocument.getFlag("advancedspelleffects", "dimensions").width,
            wallHeightBottom: 0
          }
        },
        move: 20,
        sight: 0,
        light: 0,
        sound: 0
      });
    }
    await aseSocket.executeAsGM("placeWalls", walls);
  }
  static sourceSquareV(center, distance, direction) {
    const gridSize = canvas.grid.h;
    const length = distance / 5 * gridSize;
    const x = center.x + length * Math.cos(direction * Math.PI / 180);
    const y = center.y + length * Math.sin(direction * Math.PI / 180);
    return { x, y };
  }
  static sourceSquare(center, widthSquares, heightSquares) {
    const gridSize = canvas.grid.h;
    const h = gridSize * heightSquares;
    const w = gridSize * widthSquares;
    const bottom = center.y + h / 2;
    const left = center.x - w / 2;
    const top = center.y - h / 2;
    const right = center.x + w / 2;
    const rightSpots = [...new Array(1)].map((_, i) => ({
      direction: 45,
      x: right,
      y: top
    }));
    const bottomSpots = [...new Array(1)].map((_, i) => ({
      direction: 45,
      x: left,
      y: bottom
    }));
    const leftSpots = [...new Array(1)].map((_, i) => ({
      direction: 135,
      x: left,
      y: top
    }));
    const topSpots = [...new Array(1)].map((_, i) => ({
      direction: 225,
      x: right,
      y: top
    }));
    const allSpots = [
      ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
      ...bottomSpots,
      ...leftSpots,
      ...topSpots,
      ...rightSpots.slice(0, Math.floor(rightSpots.length / 2))
    ];
    return {
      x: left,
      y: top,
      center,
      top,
      bottom,
      left,
      right,
      h,
      w,
      heightSquares,
      widthSquares,
      allSpots
    };
  }
  static async pickFireSide(templateDocument) {
    const wallData = templateDocument?.data;
    if (!wallData)
      return;
    let buttonDialogData;
    if (wallData.t == CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      buttonDialogData = {
        title: "Pick dome/ring/sphere damaging side",
        buttons: [
          {
            label: "Inside",
            value: "inside"
          },
          {
            label: "Outside",
            value: "outside"
          }
        ]
      };
    } else {
      const direction = wallData.direction;
      if (direction == 0 || direction == 180) {
        buttonDialogData = {
          title: "Pick wall damaging side",
          buttons: [
            {
              label: "Top",
              value: "top"
            },
            {
              label: "Bottom",
              value: "bottom"
            }
          ]
        };
      } else {
        buttonDialogData = {
          title: "Pick wall damaging side",
          buttons: [
            {
              label: "Left",
              value: "left"
            },
            {
              label: "Right",
              value: "right"
            }
          ]
        };
      }
    }
    let damageSidePicked = await warpgate.buttonDialog(buttonDialogData, "column");
    if (!damageSidePicked)
      return;
    await templateDocument.setFlag("advancedspelleffects", "wallOperationalData.damageSide", damageSidePicked);
  }
  static async handleOnCast(templateDocument) {
    const wallData = templateDocument.getFlag("advancedspelleffects", "wallOperationalData");
    if (!wallData)
      return;
    const wallEffectData = templateDocument.getFlag("advancedspelleffects", "wallEffectData");
    const grid = canvas?.scene?.data.grid;
    if (!grid)
      return false;
    wallData.damageOnCast;
    const damageType = wallData.damageType;
    const wallDamage = wallData.damage;
    const halfDamOnSave = wallData.halfDamOnSave ?? true;
    const savingThrowOnCast = wallData.savingThrowOnCast;
    const mTemplate = templateDocument.object;
    const templateDetails = { x: templateDocument.data.x, y: templateDocument.data.y, shape: mTemplate.shape, distance: mTemplate.data.distance };
    const chatMessageId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.chatMessage");
    const chatMessage = await game.messages.get(chatMessageId);
    const casterActorId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.casterActor");
    const casterActor = await game.actors.get(casterActorId);
    const wallItemId = templateDocument.getFlag("advancedspelleffects", "wallOperationalData.item");
    const wallItem = await casterActor.items.get(wallItemId);
    if (!chatMessage) {
      ui.notifications.info(`No chat message found for wall spell, no damage will be applied`);
      return;
    }
    if (savingThrowOnCast) {
      const saveType = wallData.savingThrow;
      const saveDC = wallData.savingThrowDC;
      const tokens = canvas.tokens.placeables;
      const targets = [];
      if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const startX = token.data.width >= 1 ? 0.5 : token.data.width / 2;
          const startY = token.data.height >= 1 ? 0.5 : token.data.height / 2;
          widthLoop:
            for (let x = startX; x < token.data.width; x++) {
              for (let y = startY; y < token.data.height; y++) {
                const currGrid = {
                  x: token.data.x + x * grid - templateDetails.x,
                  y: token.data.y + y * grid - templateDetails.y
                };
                let contains = templateDetails.shape?.contains(currGrid.x, currGrid.y);
                if (contains) {
                  targets.push(token);
                  break widthLoop;
                }
              }
            }
        }
      }
      if (targets.length && targets.length > 0) {
        let chatMessageContent = await duplicate(chatMessage.data.content);
        let targetTokens = /* @__PURE__ */ new Set();
        let saves = /* @__PURE__ */ new Set();
        let newChatmessageContent = $(chatMessageContent);
        newChatmessageContent.find(".midi-qol-saves-display").empty();
        if (halfDamOnSave) {
          let damage = await new Roll(wallDamage).evaluate({ async: true });
          for await (let targetToken of targets) {
            let targetTokenAbilities = targetToken?.actor?.data?.data?.abilities ?? {};
            let targetTokenSaveMod = targetTokenAbilities[saveType]?.save ?? 0;
            let saveRoll = await new Roll("1d20+@mod", { mod: targetTokenSaveMod }).evaluate({ async: true });
            let save = saveRoll.total;
            targetTokens.add(targetToken);
            if (save >= saveDC) {
              saves.add(targetToken);
            }
            newChatmessageContent.find(".midi-qol-saves-display").append(
              $(wallSpell.addTokenToText(targetToken, save, saveDC, damage))
            );
            new Sequence("Advanced Spell Effects").sound().file(wallEffectData.wallSpellDmgSound).delay(Number(wallEffectData.wallSpellDmgSoundDelay) ?? 0).volume(wallEffectData.wallSpellDmgVolume ?? 0.5).playIf(wallEffectData.wallSpellDmgSound && wallEffectData.wallSpellDmgSound != "").effect().file(`jb2a.impact.004.${wallEffectData?.fireImpactColor ?? "orange"}`).attachTo(targetToken).randomRotation().scaleIn(0.5, 200).animateProperty("sprite", "rotation", { duration: 1e3, from: 0, to: 45 }).randomOffset(0.5).repeats(4, 100, 250).play();
          }
          await chatMessage.update({ content: newChatmessageContent.prop("outerHTML") });
          await ui.chat.scrollBottom();
          MidiQOL.applyTokenDamage(
            [{ damage: damage.total, type: damageType }],
            damage.total,
            targetTokens,
            wallItem,
            saves
          );
        }
      }
    }
  }
  static addTokenToText(token, roll, dc, damageRoll) {
    let saveResult = roll >= dc ? true : false;
    return `<div class="midi-qol-flex-container">
      <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
      <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
      <div>
      ${saveResult ? game.i18n.format("ASE.SavePassMessage", { saveTotal: roll, damageTotal: Math.floor(damageRoll.total / 2) }) : game.i18n.format("ASE.SaveFailMessage", { saveTotal: roll, damageTotal: damageRoll.total })}
      </div>
      <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
    </div>`;
  }
  static async placePanels(aseData, template, panelDiag, type) {
    wallSpell.playEffects(aseData, template);
    wallSpell.placeWalls(template);
    canvas.grid.h;
    const previousTemplateData = template.data;
    let panelsRemaining = panelDiag.data.aseData.flags.panelCount;
    const nextTemplateData = template.toObject();
    nextTemplateData.flags.advancedspelleffects["placed"] = false;
    delete nextTemplateData["_id"];
    nextTemplateData.flags.tagger.tags[1] = (Number(nextTemplateData.flags.tagger.tags[1]) + 1).toString();
    if (panelsRemaining < 2 || !panelDiag.rendered) {
      panelDiag.submit();
      return;
    }
    panelDiag.data.aseData.flags.panelCount--;
    panelDiag.render(true);
    let previousTemplateCenter = {};
    let square;
    let updateTemplateLocation;
    if (type == "h-panels") {
      if (previousTemplateData.direction == 45) {
        previousTemplateCenter = {
          x: previousTemplateData.x + previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y + previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      } else if (previousTemplateData.direction == 135) {
        previousTemplateCenter = {
          x: previousTemplateData.x - previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y + previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      } else if (previousTemplateData.direction == 225) {
        previousTemplateCenter = {
          x: previousTemplateData.x - previousTemplateData.flags.advancedspelleffects.dimensions.length / 5 * canvas.grid.size / 2,
          y: previousTemplateData.y - previousTemplateData.flags.advancedspelleffects.dimensions.width / 5 * canvas.grid.size / 2
        };
      }
      const previousTemplateWidthSquares = previousTemplateData.flags.advancedspelleffects.dimensions.length / 5;
      const previousTemplateHeightSquares = previousTemplateData.flags.advancedspelleffects.dimensions.width / 5;
      square = wallSpell.sourceSquare(
        { x: previousTemplateCenter.x, y: previousTemplateCenter.y },
        previousTemplateWidthSquares,
        previousTemplateHeightSquares
      );
    } else if (type == "v-panels") {
      square = wallSpell.sourceSquareV(
        { x: previousTemplateData.x, y: previousTemplateData.y },
        previousTemplateData.distance,
        previousTemplateData.direction
      );
      nextTemplateData.x = square.x;
      nextTemplateData.y = square.y;
    }
    const displayTemplateData = JSON.parse(JSON.stringify(nextTemplateData));
    delete displayTemplateData.flags.advancedspelleffects["wallSpellWallNum"];
    let displayTemplate = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [displayTemplateData]))[0];
    let currentSpotIndex = 0;
    updateTemplateLocation = /* @__PURE__ */ __name(async (crosshairs) => {
      while (crosshairs.inFlight) {
        if (!panelDiag.rendered) {
          crosshairs.inFlight = false;
          return;
        }
        await warpgate.wait(100);
        if (!displayTemplate)
          return;
        const verticalTemplate = displayTemplate.data.t == CONST.MEASURED_TEMPLATE_TYPES.RAY;
        let ray;
        let angle;
        if (!verticalTemplate) {
          const totalSpots = square.allSpots.length;
          const radToNormalizedAngle = /* @__PURE__ */ __name((rad) => {
            let angle2 = rad * 180 / Math.PI % 360;
            if (square.heightSquares % 2 === 1 && square.widthSquares % 2 === 1) {
              angle2 -= 360 / totalSpots / 2;
            }
            const normalizedAngle = Math.round(angle2 / (360 / totalSpots)) * (360 / totalSpots);
            return normalizedAngle < 0 ? normalizedAngle + 360 : normalizedAngle;
          }, "radToNormalizedAngle");
          ray = new Ray(square.center, crosshairs);
          angle = radToNormalizedAngle(ray.angle);
          const spotIndex = Math.ceil(angle / 360 * totalSpots);
          if (spotIndex === currentSpotIndex) {
            continue;
          }
          currentSpotIndex = spotIndex;
          const spot = square.allSpots[currentSpotIndex];
          if (!displayTemplate)
            return;
          await displayTemplate.update({ ...spot });
        } else {
          ray = new Ray(square, crosshairs);
          angle = ray.angle * 180 / Math.PI;
          if (angle == displayTemplate.data.direction) {
            continue;
          }
          if (!displayTemplate)
            return;
          await displayTemplate.update({ direction: angle });
        }
      }
    }, "updateTemplateLocation");
    const targetConfig = {
      drawIcon: false,
      drawOutline: false,
      interval: 20
    };
    const rotateCrosshairs = await warpgate.crosshairs.show(
      targetConfig,
      {
        show: updateTemplateLocation
      }
    );
    if (rotateCrosshairs.cancelled) {
      if (canvas.scene.templates.get(displayTemplate.id)) {
        await displayTemplate.delete();
      }
      game.user.updateTokenTargets();
      panelDiag.submit();
      return;
    }
    const newFlags = {
      flags: {
        advancedspelleffects: {
          placed: true
        }
      }
    };
    if (type == "v-panels") {
      newFlags.flags.advancedspelleffects["wallSpellWallNum"] = nextTemplateData.flags.advancedspelleffects["wallSpellWallNum"];
    }
    await displayTemplate.update(newFlags);
    wallSpell.placePanels(aseData, displayTemplate, panelDiag, type);
  }
  static playEffects(aseData, template) {
    if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.CIRCLE) {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).zIndex(1e3).persist().play();
    } else if (template.data.t === CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE) {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).scaleToObject().fadeIn(250).fadeOut(250).tilingTexture({
        x: aseData.flags.wallSegmentSize / 10,
        y: aseData.flags.wallSegmentSize / 10
      }).belowTokens().zIndex(-1e3).persist().play();
    } else {
      new Sequence().sound().file(aseData.flags.wallSpellSound).delay(Number(aseData.flags.wallSpellSoundDelay) ?? 0).volume(aseData.flags.wallSpellVolume ?? 0.5).playIf(aseData.flags.wallSpellSound && aseData.flags.wallSpellSound != "").effect(aseData.texture).attachTo(template).stretchTo(template, { attachTo: true, onlyX: true }).fadeIn(250).fadeOut(250).persist().play();
    }
  }
  static getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const dieOptions = [
      { "d4": "d4" },
      { "d6": "d6" },
      { "d8": "d8" },
      { "d10": "d10" },
      { "d12": "d12" },
      { "d20": "d20" }
    ];
    const wallTypeOptions = [
      { "fire": "Wall of Fire" },
      { "force": "Wall of Force" }
    ];
    const wallType = currFlags.wallType ?? "fire";
    spellOptions.push({
      label: game.i18n.localize("ASE.WallTypeOptionsLabel"),
      tooltip: game.i18n.localize("ASE.WallTypeOptionsTooltip"),
      type: "dropdown",
      options: wallTypeOptions,
      name: "flags.advancedspelleffects.effectOptions.wallType",
      flagName: "wallType",
      flagValue: currFlags.wallType ?? "fire"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.WallUseWebPLabel"),
      tooltip: game.i18n.localize("ASE.WallUseWebPTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.useWebP",
      flagName: "useWebP",
      flagValue: currFlags.useWebP ?? false
    });
    if (wallType == "fire") {
      spellOptions.push({
        label: game.i18n.localize("ASE.ScaleWithLevelLabel"),
        tooltip: game.i18n.localize("ASE.ScaleWithLevelTooltip"),
        type: "checkbox",
        name: "flags.advancedspelleffects.effectOptions.levelScaling",
        flagName: "levelScaling",
        flagValue: currFlags.levelScaling ?? true
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.DamageDieCountLabel"),
        tooltip: game.i18n.localize("ASE.DamageDieCountTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.dmgDieCount",
        flagName: "dmgDieCount",
        flagValue: currFlags.dmgDieCount ?? 5
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.DamageDieLabel"),
        tooltip: game.i18n.localize("ASE.DamageDieTooltip"),
        type: "dropdown",
        options: dieOptions,
        name: "flags.advancedspelleffects.effectOptions.dmgDie",
        flagName: "dmgDie",
        flagValue: currFlags.dmgDie ?? "d8"
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.DamageBonusLabel"),
        tooltip: game.i18n.localize("ASE.DamageBonusTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.dmgMod",
        flagName: "dmgMod",
        flagValue: currFlags.dmgMod ?? 0
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.WallLengthLabel"),
        tooltip: game.i18n.localize("ASE.WallLengthTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.wallLength",
        flagName: "wallLength",
        flagValue: currFlags.wallLength ?? 60
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.WallHeightLabel"),
        tooltip: game.i18n.localize("ASE.WallHeightTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.wallHeight",
        flagName: "wallHeight",
        flagValue: currFlags.wallHeight ?? 20
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.WallWidthLabel"),
        tooltip: game.i18n.localize("ASE.WallWidthTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.wallWidth",
        flagName: "wallWidth",
        flagValue: currFlags.wallWidth ?? 1
      });
      animOptions.push({
        label: game.i18n.localize("ASE.WallOfFireColorLabel"),
        tooltip: game.i18n.localize("ASE.WallOfFireColorTooltip"),
        type: "dropdown",
        options: getDBOptions("jb2a.wall_of_fire.300x100"),
        name: "flags.advancedspelleffects.effectOptions.fireColor",
        flagName: "fireColor",
        flagValue: currFlags.fireColor ?? "yellow"
      });
      animOptions.push({
        label: game.i18n.localize("ASE.WallOfFireImpactColorLabel"),
        tooltip: game.i18n.localize("ASE.WallOfFireImpactColorTooltip"),
        type: "dropdown",
        options: getDBOptions("jb2a.impact.004"),
        name: "flags.advancedspelleffects.effectOptions.fireImpactColor",
        flagName: "fireImpactColor",
        flagValue: currFlags.fireImpactColor ?? "yellow"
      });
      soundOptions.push({
        label: game.i18n.localize("ASE.WallSpellDamageEffectSoundLabel"),
        tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundTooltip"),
        type: "fileInput",
        name: "flags.advancedspelleffects.effectOptions.wallSpellDmgSound",
        flagName: "wallSpellDmgSound",
        flagValue: currFlags.wallSpellDmgSound ?? ""
      });
      soundOptions.push({
        label: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayLabel"),
        tooltip: game.i18n.localize("ASE.WallSpellDamageEffectSoundDelayTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.wallSpellDmgSoundDelay",
        flagName: "wallSpellDmgSoundDelay",
        flagValue: currFlags.wallSpellDmgSoundDelay ?? 0
      });
      soundOptions.push({
        label: game.i18n.localize("ASE.WallSpellDamageEffectVolumeLabel"),
        tooltip: game.i18n.localize("ASE.WallSpellDamageEffectVolumeTooltip"),
        type: "rangeInput",
        name: "flags.advancedspelleffects.effectOptions.wallSpellDmgVolume",
        flagName: "wallSpellDmgVolume",
        flagValue: currFlags.wallSpellDmgVolume ?? 0.5,
        min: 0,
        max: 1,
        step: 0.01
      });
    }
    spellOptions.push({
      label: game.i18n.localize("ASE.WallRadiusLabel"),
      tooltip: game.i18n.localize("ASE.WallRadiusTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallRadius",
      flagName: "wallRadius",
      flagValue: currFlags.wallRadius ?? 10
    });
    if (wallType == "force") {
      spellOptions.push({
        label: game.i18n.localize("ASE.WallSegmentSizeLabel"),
        tooltip: game.i18n.localize("ASE.WallSegmentSizeTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.wallSegmentSize",
        flagName: "wallSegmentSize",
        flagValue: currFlags.wallSegmentSize ?? 10
      });
      spellOptions.push({
        label: game.i18n.localize("ASE.WallPanelCountLabel"),
        tooltip: game.i18n.localize("ASE.WallPanelCountTooltip"),
        type: "numberInput",
        name: "flags.advancedspelleffects.effectOptions.panelCount",
        flagName: "panelCount",
        flagValue: currFlags.panelCount ?? 10
      });
      animOptions.push({
        label: game.i18n.localize("ASE.WallOfForceColorLabel"),
        type: "dropdown",
        options: getDBOptions("jb2a.wall_of_force.horizontal"),
        name: "flags.advancedspelleffects.effectOptions.forceColor",
        flagName: "forceColor",
        flagValue: currFlags.forceColor ?? "blue"
      });
    }
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialSoundLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellSound",
      flagName: "wallSpellSound",
      flagValue: currFlags.wallSpellSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellSoundDelay",
      flagName: "wallSpellSoundDelay",
      flagValue: currFlags.wallSpellSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.WallSpellInitialVolumeLabel"),
      tooltip: game.i18n.localize("ASE.WallSpellInitialVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.wallSpellVolume",
      flagName: "wallSpellVolume",
      flagValue: currFlags.wallSpellVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(wallSpell, "wallSpell");
class concentrationHandler {
  static registerHooks() {
    Hooks.on("deleteActiveEffect", concentrationHandler._handleConcentration);
  }
  static async _handleConcentration(activeEffect) {
    console.log("Handling removal of Concentration: ", activeEffect);
    isFirstGM();
    if (activeEffect.data.label != "Concentration" && activeEffect.data.label != game.i18n.localize("ASE.ConcentratingLabel"))
      return;
    let origin = activeEffect.data.origin?.split(".");
    if (!origin || origin?.length < 4)
      return false;
    let itemId = origin[5] ?? origin[3];
    let casterActor;
    let casterToken;
    let effectSource;
    if (origin[0] == "Actor") {
      casterActor = game.actors.get(origin[1]);
      casterToken = await casterActor.getActiveTokens()[0];
    } else {
      casterToken = canvas.tokens.get(origin[3]);
      casterActor = casterToken.actor;
    }
    effectSource = casterActor.items.get(itemId).name;
    let item = casterActor.items.filter((item2) => item2.name == effectSource)[0] ?? void 0;
    if (!item)
      return;
    let aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
    let effectOptions = item.getFlag("advancedspelleffects", "effectOptions") ?? {};
    if (!aseEnabled)
      return;
    const spellEffect = item.getFlag("advancedspelleffects", "spellEffect") ?? void 0;
    switch (spellEffect) {
      case game.i18n.localize("ASE.Darkness"):
        await darkness.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.DetectMagic"):
        await detectMagic.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.DetectStuff"):
        await detectStuff.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.CallLightning"):
        await callLightning.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.FogCloud"):
        await fogCloud.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.WitchBolt"):
        await witchBolt.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.VampiricTouch"):
        await vampiricTouch.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.Moonbeam"):
        await moonBeam.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.WallOfForce"):
        await wallOfForce.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.WallSpell"):
        await wallSpell.handleConcentration(casterActor, casterToken, effectOptions);
        return;
      case game.i18n.localize("ASE.WallOfFire"):
        console.log(" REMOVING CONCENTRATION FOR Wall of Fire");
        await wallOfFire.handleConcentration(casterActor, casterToken, effectOptions);
        return;
    }
    if (effectSource.includes(game.i18n.localize("ASE.Summon"))) {
      summonCreature.handleConcentration(casterActor, casterToken, effectOptions);
      return;
    }
    console.log("ASE: Effect source not recognized...");
  }
  static async addConcentration(actor, item) {
    let selfTarget = item.actor.token ? item.actor.token.object : getSelfTarget(item.actor);
    if (!selfTarget)
      return;
    let concentrationName = game.i18n.localize("ASE.ConcentratingLabel");
    const inCombat = game.combat?.turns.some((combatant) => combatant.token?.id === selfTarget.id);
    const effectData = {
      changes: [],
      origin: item.uuid,
      disabled: false,
      icon: "modules/advancedspelleffects/icons/concentrate.png",
      label: concentrationName,
      duration: {},
      flags: { "advancedspelleffects": { isConcentration: item?.uuid } }
    };
    const convertedDuration = convertDuration(item.data.data.duration, inCombat);
    if (convertedDuration?.type === "seconds") {
      effectData.duration = { seconds: convertedDuration.seconds, startTime: game.time.worldTime };
    } else if (convertedDuration?.type === "turns") {
      effectData.duration = {
        rounds: convertedDuration.rounds,
        turns: convertedDuration.turns,
        startRound: game.combat?.round,
        startTurn: game.combat?.turn
      };
    }
    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    return true;
  }
}
__name(concentrationHandler, "concentrationHandler");
class vampiricTouch {
  static async cast(midiData) {
    const tokenD = canvas.tokens.get(midiData.tokenId);
    let tactor = midiData.actor;
    const target = Array.from(midiData.targets)[0];
    let effectOptions = midiData.item.getFlag("advancedspelleffects", "effectOptions");
    let casterAnim = `jb2a.energy_strands.overlay.${effectOptions.vtCasterColor}.01`;
    const casterSound = effectOptions.vtCasterSound ?? "";
    const casterSoundDelay = Number(effectOptions.vtCasterSoundDelay) ?? 0;
    const casterSoundVolume = effectOptions.vtCasterVolume ?? 1;
    const impactSound = effectOptions.vtImpactSound;
    const impactSoundDelay = Number(effectOptions.vtImpactSoundDelay) ?? 0;
    const impactVolume = effectOptions.vtImpactVolume ?? 1;
    const siphonSound = effectOptions.vtSiphonSound;
    const siphonSoundDelay = Number(effectOptions.vtSiphonSoundDelay) ?? 0;
    const siphonVolume = effectOptions.vtSiphonVolume ?? 1;
    const itemData = midiData.item.data.data;
    console.log(itemData);
    const maxStrands = effectOptions.vtMaxStrands ?? 20;
    const updates = {
      embedded: {
        Item: {}
      }
    };
    const activationItemName2 = game.i18n.localize("ASE.VampiricTouchAttack");
    updates.embedded.Item[activationItemName2] = {
      "type": "spell",
      "img": midiData.item.img,
      "data": {
        "ability": "",
        "actionType": itemData.actionType,
        "activation": { "type": "action", "cost": 1 },
        "damage": itemData.damage,
        "level": midiData.itemLevel,
        "preparation": { "mode": "atwill", "prepared": true },
        "range": { "value": 5, "units": "ft" },
        "school": "nec",
        "target": { "value": 1, "type": "creature" },
        "description": {
          "value": game.i18n.localize("ASE.VampiricTouchDescription")
        }
      },
      "flags": {
        "advancedspelleffects": {
          "enableASE": true,
          "spellEffect": game.i18n.localize("ASE.VampiricTouchAttack"),
          "castItem": true,
          "castStage": "preDamage",
          "effectOptions": {
            "vtStrandColor": effectOptions.vtStrandColor,
            "vtImpactColor": effectOptions.vtImpactColor,
            "vtSiphonSound": siphonSound,
            "vtSiphonSoundDelay": siphonSoundDelay,
            "vtSiphonVolume": siphonVolume,
            "vtImpactSound": impactSound,
            "vtImpactSoundDelay": impactSoundDelay,
            "vtImpactVolume": impactVolume,
            "vtMaxStrands": maxStrands,
            "allowInitialMidiCall": true
          }
        }
      }
    };
    new Sequence("Advanced Spell Effects").sound().file(casterSound).delay(casterSoundDelay).volume(casterSoundVolume).playIf(casterSound != "").effect().file(casterAnim).attachTo(tokenD).scaleToObject(1.15).zIndex(1).persist().name(`${tokenD.id}-vampiric-touch`).scaleIn(0, 12 * 200, { ease: "easeInOutBack" }).scaleOut(0, 1e3, { ease: "easeInOutBack" }).fadeOut(1e3).play();
    await warpgate.mutate(tokenD.document, updates, {}, { name: `${tactor.id}-vampiric-touch` });
    ui.notifications.info(game.i18n.format("ASE.AddedAtWill", { spellName: game.i18n.localize("ASE.VampiricTouchAttack") }));
    await ChatMessage.create({ content: `${tactor.name}'s hands are wrapped in darkness...` });
    effectOptions.concentration = true;
    let castItem = tactor.items.getName(activationItemName2);
    effectOptions.castItem = castItem.uuid;
    effectOptions.targets = [target.document.uuid];
    game.ASESpellStateManager.addSpell(midiData.itemUuid, effectOptions);
  }
  static async handleConcentration(casterActor, casterToken, effectOptions) {
    await warpgate.revert(casterToken.document, `${casterActor.id}-vampiric-touch`);
    ui.notifications.info(game.i18n.format("ASE.RemovedAtWill", { spellName: game.i18n.localize("ASE.VampiricTouchAttack") }));
    await Sequencer.EffectManager.endEffects({ name: `${casterToken.id}-vampiric-touch` });
    await ChatMessage.create({ content: `${casterActor.name}'s returns to normal.` });
  }
  static async activateTouch(midiData) {
    const tokenD = canvas.tokens.get(midiData.tokenId);
    let tactor = midiData.actor;
    const target = Array.from(midiData.targets)[0];
    console.log("ASE: Vampiric Touch Activated: target:", target);
    let missed = false;
    let damageTotal = 4 * midiData.itemLevel;
    let effectOptions = midiData.item.getFlag("advancedspelleffects", "effectOptions");
    let strandAnim = `jb2a.energy_strands.range.standard.${effectOptions.vtStrandColor}`;
    let impactAnim = `jb2a.impact.004.${effectOptions.vtImpactColor}`;
    const siphonSound = effectOptions.vtSiphonSound;
    const siphonSoundDelay = Number(effectOptions.vtSiphonSoundDelay) ?? 0;
    const siphonVolume = effectOptions.vtSiphonVolume ?? 1;
    const impactSound = effectOptions.vtImpactSound;
    const impactSoundDelay = Number(effectOptions.vtImpactSoundDelay) ?? 0;
    const impactVolume = effectOptions.vtImpactVolume ?? 1;
    const maxStrands = Number(effectOptions.vtMaxStrands) ?? 20;
    missed = Array.from(midiData.hitTargets).length == 0;
    damageTotal = midiData.damageRoll?.total ?? 12;
    if (Array.from(midiData.hitTargets).length > 0) {
      const updatedHP = tactor.data.data.attributes.hp.value + Math.floor(damageTotal / 2);
      await tactor.update({
        "data.attributes.hp.value": Math.min(tactor.data.data.attributes.hp.max, updatedHP)
      });
    }
    const strandNum = Math.min(Math.floor(damageTotal), maxStrands);
    new Sequence("Advanced Spell Effects").sound().file(impactSound).delay(impactSoundDelay + 100).volume(impactVolume).playIf(impactSound != "").effect().file(impactAnim).atLocation(target).scaleToObject().missed(missed).delay(100).sound().file(siphonSound).delay(siphonSoundDelay).volume(siphonVolume).playIf(siphonSound != "" && !missed).effect().file(strandAnim).atLocation(target).playIf(!missed).stretchTo(tokenD).repeats(Math.max(1, strandNum), 100, 200).randomizeMirrorY().play();
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const vampiricTouchCasterAnim = "jb2a.energy_strands.overlay";
    const vampiricTouchStrandAnim = `jb2a.energy_strands.range.standard`;
    const vampiricTouchImpactAnim = `jb2a.impact.004`;
    const vampiricTouchCasterColorOptions = getDBOptions(vampiricTouchCasterAnim);
    const vampiricTouchStrandColorOptions = getDBOptions(vampiricTouchStrandAnim);
    const vampiricTouchImpactColorOptions = getDBOptions(vampiricTouchImpactAnim);
    let animOptions = [];
    let soundOptions = [];
    let spellOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.VTCasterEffectLabel"),
      tooltip: game.i18n.localize("ASE.VTCasterEffectTooltip"),
      type: "dropdown",
      options: vampiricTouchCasterColorOptions,
      name: "flags.advancedspelleffects.effectOptions.vtCasterColor",
      flagName: "vtCasterColor",
      flagValue: currFlags.vtCasterColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTCasterSoundLabel"),
      tooltip: game.i18n.localize("ASE.VTCasterSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.vtCasterSound",
      flagName: "vtCasterSound",
      flagValue: currFlags.vtCasterSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTCasterSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.VTCasterSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.vtCasterSoundDelay",
      flagName: "vtCasterSoundDelay",
      flagValue: currFlags.vtCasterSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTCasterVolumeLabel"),
      tooltip: game.i18n.localize("ASE.VTCasterVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.vtCasterVolume",
      flagName: "vtCasterVolume",
      flagValue: currFlags.vtCasterVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.VTSiphonEffectLabel"),
      tooltip: game.i18n.localize("ASE.VTSiphonEffectTooltip"),
      type: "dropdown",
      options: vampiricTouchStrandColorOptions,
      name: "flags.advancedspelleffects.effectOptions.vtStrandColor",
      flagName: "vtStrandColor",
      flagValue: currFlags.vtStrandColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTSiphonSoundLabel"),
      tooltip: game.i18n.localize("ASE.VTSiphonSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.vtSiphonSound",
      flagName: "vtSiphonSound",
      flagValue: currFlags.vtSiphonSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTSiphonSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.VTSiphonSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.vtSiphonSoundDelay",
      flagName: "vtSiphonSoundDelay",
      flagValue: currFlags.vtSiphonSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTSiphonVolumeLabel"),
      tooltip: game.i18n.localize("ASE.VTSiphonVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.vtSiphonVolume",
      flagName: "vtSiphonVolume",
      flagValue: currFlags.vtSiphonVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.VTImpactEffectLabel"),
      tooltip: game.i18n.localize("ASE.VTImpactEffectTooltip"),
      type: "dropdown",
      options: vampiricTouchImpactColorOptions,
      name: "flags.advancedspelleffects.effectOptions.vtImpactColor",
      flagName: "vtImpactColor",
      flagValue: currFlags.vtImpactColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTImpactSoundLabel"),
      tooltip: game.i18n.localize("ASE.VTImpactSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.vtImpactSound",
      flagName: "vtImpactSound",
      flagValue: currFlags.vtImpactSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTImpactSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.VTImpactSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.vtImpactSoundDelay",
      flagName: "vtImpactSoundDelay",
      flagValue: currFlags.vtImpactSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.VTImpactVolumeLabel"),
      tooltip: game.i18n.localize("ASE.VTImpactVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.vtImpactVolume",
      flagName: "vtImpactVolume",
      flagValue: currFlags.vtImpactVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.VTMaxStrandsLabel"),
      tooltip: game.i18n.localize("ASE.VTMaxStrandsTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.vtMaxStrands",
      flagName: "vtMaxStrands",
      flagValue: currFlags.vtMaxStrands ?? 20
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(vampiricTouch, "vampiricTouch");
function ChainLightningSequence(data) {
  console.log("ChainLightningSequence: ", data);
  const firstTarget = data.firstTarget;
  let firstTargetFailedSave = false;
  if (data.failedSaves) {
    for (let i = 0; i < data.failedSaves.length; i++) {
      if (data.failedSaves[i] == firstTarget) {
        firstTargetFailedSave = true;
      }
    }
  }
  let targets = [];
  for (let i = 0; i < data.targets.length; i++) {
    let target = data.targets[i];
    let failedSave = false;
    if (data.failedSaves) {
      for (let j = 0; j < data.failedSaves.length; j++) {
        if (data.failedSaves[j] == target) {
          failedSave = true;
        }
      }
    }
    if (target != firstTarget) {
      targets.push({ token: target, failedSave });
    }
  }
  console.log("ChainLightningSequence: targets: ", targets);
  console.log("ChainLightningSequence: firstTargetFailedSave: ", firstTargetFailedSave);
  let sequence = new Sequence().wait(350).sound().file(data.effectOptions.primarySound).delay(data.effectOptions.primarySoundDelay).volume(data.effectOptions.primarySoundVolume).playIf(data.effectOptions.primarySound != "").effect().file(`jb2a.chain_lightning.primary.${data.effectOptions.primaryBoltColor}`).atLocation(data.caster).stretchTo(data.firstTarget).randomizeMirrorY().effect().file(`jb2a.static_electricity.02.${data.effectOptions.saveFailEffectColor}`).atLocation(data.firstTarget).scaleToObject(1.3).randomRotation().duration(5e3).delay(600).playIf(firstTargetFailedSave).wait(750);
  for (let target of targets) {
    let randomDelay = getRandomInt(data.effectOptions.secondaryBoltDelayLower, data.effectOptions.secondaryBoltDelayUpper);
    sequence.sound().file(data.effectOptions.secondarySound).delay(randomDelay + data.effectOptions.secondarySoundDelay).volume(data.effectOptions.secondarySoundVolume).playIf(data.effectOptions.secondarySound != "").effect().file(`jb2a.chain_lightning.secondary.${data.effectOptions.secondaryBoltColor}`).atLocation(data.firstTarget).stretchTo(target.token).randomizeMirrorY().delay(randomDelay).effect().file(`jb2a.static_electricity.02.${data.effectOptions.saveFailEffectColor}`).atLocation(target.token).scaleToObject(1.63).randomRotation().duration(5e3).delay(randomDelay + 400).playIf(target.failedSave);
  }
  return sequence;
}
__name(ChainLightningSequence, "ChainLightningSequence");
class chainLightning {
  constructor(data) {
    this.params = data;
    this.actor = game.actors.get(this.params.actor.id);
    this.token = canvas.tokens.get(this.params.tokenId);
    this.item = this.params.item;
    this.firstTarget = this.params.targets[0] ?? Array.from(this.params.targets)[0];
    this.itemCardId = this.params.itemCardId;
    this.originalDamage = this.params.damageTotal;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
    this.spellLevel = this.params.itemLevel ? Number(this.params.itemLevel) : 6;
    if (this.effectOptions.levelScaling || this.effectOptions.levelScaling === void 0) {
      this.targetsToJumpTo = 3 + (this.spellLevel - 6);
    } else if (!this.effectOptions.levelScaling) {
      this.targetsToJumpTo = Number(this.effectOptions.numJumps) ?? 3;
    }
    this.spellSaveDC = this.actor.data.data.attributes.spelldc;
    this.targetData = [];
  }
  static registerHooks() {
    return;
  }
  async cast() {
    console.log("Running Chain Lightning...");
    if (!this.firstTarget) {
      ui.notifications.error("Target Required");
      return;
    }
    await this.promptJumps();
    console.log(this);
    if (this.targetData) {
      let targets = this.targetData.map((target) => target.token.document.uuid);
      targets.push(this.firstTarget.document.uuid);
      let spellOptions = {
        targetted: true,
        targets,
        sequenceBuilder: ChainLightningSequence,
        firstTarget: this.firstTarget.document.uuid,
        effectOptions: this.effectOptions,
        caster: this.token.document.uuid,
        failedSaves: []
      };
      game.ASESpellStateManager.addSpell(this.item.uuid, spellOptions);
      return;
    }
  }
  async promptJumps() {
    let firstTarget = this.firstTarget;
    let tokenD = this.token;
    const potentialTargets = canvas.tokens.placeables.filter(function(target) {
      return target.actor?.data?.data?.attributes.hp.value > 0 && canvas.grid.measureDistance(firstTarget, target) <= 32.5 && target !== firstTarget && target !== tokenD;
    });
    if (!potentialTargets.length)
      return;
    const targetList = potentialTargets.map((target, index) => {
      return `
            <tr class="chain-lightning-target" tokenId="${target.id}">
                <td class="chain-lightning-flex">
                    <img src="${target.data.img}" width="30" height="30" style="border:0px"> - ${target.name}
                </td>
                <td>
                    <input type="checkbox" class='target' name="${index}">
                </td>
            </tr>
            `;
    }).join("");
    const content = `
        <style>
            .chain-lightning-flex {
                display: inline-flex;
                align-items: center;
            }
            .chain-lightning-flex img {
                margin-right: 0.5rem;
            }
        </style>
        <p>Your chain lightning can jump to <b>${this.targetsToJumpTo}</b> targets.</p>
        <p>You have <b class="chain-lightning-count">${this.targetsToJumpTo}</b> left to assign.</p>
        <form class="flexcol">
            <table width="100%">
                <tbody>
                    <tr>
                        <th>Potential Target</th>
                        <th>Jump to</th>
                    </tr>
                    ${targetList}
                </tbody>
            </table>
        </form>
        `;
    this.targetData = await new Promise(async (resolve) => {
      let resolved = false;
      new Dialog({
        title: "Chain Lightning: Choose Jump Targets",
        content,
        buttons: {
          one: {
            icon: `<i class="fas fa-bolt"></i>`,
            label: "FIRE AT WILL",
            callback: async (html) => {
              let selected_targets = html.find("input:checkbox:checked");
              let targetData = [];
              for (let input of selected_targets) {
                targetData.push({
                  token: potentialTargets[Number(input.name)],
                  saved: true
                });
              }
              resolved = true;
              resolve(targetData);
            }
          }
        },
        close: () => {
          if (!resolved)
            resolve(false);
        },
        render: (html) => {
          const jumpCount = html.find(".chain-lightning-count");
          html.find(".chain-lightning-target").on("mouseenter", function(e) {
            let token = canvas.tokens.get($(this).attr("tokenId"));
            token._onHoverIn(e);
          }).on("mouseleave", function(e) {
            let token = canvas.tokens.get($(this).attr("tokenId"));
            token._onHoverOut(e);
          });
          let numJumps = this.targetsToJumpTo;
          html.find("input:checkbox").on("change", function() {
            let total = html.find("input:checkbox:checked").length;
            jumpCount.text(Math.max(numJumps - total, 0));
            html.find("input:checkbox:not(:checked)").each(function() {
              $(this).prop("disabled", total === numJumps);
            });
          });
        }
      }).render(true);
    });
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const primaryColorOptions = getDBOptions("jb2a.chain_lightning.primary");
    const secondaryColorOptions = getDBOptions("jb2a.chain_lightning.secondary");
    const failSaveEffectColorOptions = getDBOptions("jb2a.static_electricity.02");
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.ChainLightningPrimaryColorLabel"),
      type: "dropdown",
      options: primaryColorOptions,
      name: "flags.advancedspelleffects.effectOptions.primaryBoltColor",
      flagName: "primaryBoltColor",
      flagValue: currFlags.primaryBoltColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningPrimarySoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.primarySound",
      flagName: "primarySound",
      flagValue: currFlags.primarySound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningPrimarySoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.primarySoundDelay",
      flagName: "primarySoundDelay",
      flagValue: currFlags.primarySoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningPrimaryVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.primarySoundVolume",
      flagName: "primarySoundVolume",
      flagValue: currFlags.primarySoundVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondaryColorLabel"),
      type: "dropdown",
      options: secondaryColorOptions,
      name: "flags.advancedspelleffects.effectOptions.secondaryBoltColor",
      flagName: "secondaryBoltColor",
      flagValue: currFlags.secondaryBoltColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondarySoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.secondarySound",
      flagName: "secondarySound",
      flagValue: currFlags.secondarySound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondarySoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.secondarySoundDelay",
      flagName: "secondarySoundDelay",
      flagValue: currFlags.secondarySoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondaryVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.secondarySoundVolume",
      flagName: "secondarySoundVolume",
      flagValue: currFlags.secondarySoundVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondaryDelayLowerLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.secondaryBoltDelayLower",
      flagName: "secondaryBoltDelayLower",
      flagValue: currFlags.secondaryBoltDelayLower ?? 0
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSecondaryDelayUpperLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.secondaryBoltDelayUpper",
      flagName: "secondaryBoltDelayUpper",
      flagValue: currFlags.secondaryBoltDelayUpper ?? 250
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ChainLightningSaveFailEffectLabel"),
      type: "dropdown",
      options: failSaveEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.saveFailEffectColor",
      flagName: "saveFailEffectColor",
      flagValue: currFlags.saveFailEffectColor ?? "blue"
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
}
__name(chainLightning, "chainLightning");
class mirrorImage {
  constructor(data) {
    this.params = data;
    this.actor = game.actors.get(this.params.actor.id);
    this.token = canvas.tokens.get(this.params.tokenId);
    this.item = this.params.item;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
  }
  static registerHooks() {
    if (isMidiActive()) {
      Hooks.on("midi-qol.preCheckHits", mirrorImage.handlePreCheckHits);
    }
    Hooks.on("endedSequencerEffect", mirrorImage.handleMirrorImageEnded);
    return;
  }
  async cast() {
    await this.playSequence();
    await this.token.document.setFlag("advancedspelleffects", "mirrorImage", this.effectOptions);
  }
  static async handlePreCheckHits(data) {
    let target = Array.from(data.targets)[0];
    if (!target)
      return;
    const mirrorImages = Sequencer.EffectManager.getEffects().filter((effect) => effect.data.name && effect.data.name.startsWith(`MirrorImage-${target.id}`));
    if (mirrorImages.length == 0)
      return;
    const effectOptions = target.document.getFlag("advancedspelleffects", "mirrorImage");
    if (!effectOptions)
      return;
    const mirrorImageEffectNames = mirrorImages.map((effect) => effect.data.name);
    const attackRoll = data.attackRoll;
    target.document.actor.data.data.attributes.ac.value;
    const imagesRemaining = mirrorImages.length;
    const imageAC = 10 + target.actor.data.data.abilities.dex.mod;
    const roll = new Roll(`1d20`).evaluate({ async: false });
    let dc;
    if (imagesRemaining == 3) {
      dc = 6;
    } else if (imagesRemaining == 2) {
      dc = 8;
    } else if (imagesRemaining == 1) {
      dc = 11;
    } else {
      console.log("Error: Mirror Images remaining is not 1, 2, or 3.");
      return;
    }
    if (roll.total < dc) {
      console.log("Mirror Image failed.");
      await warpgate.wait(500);
      await mirrorImage.updateChatCardFailed(data.itemCardId, target, roll.total);
      return;
    } else {
      console.log("Mirror Image succeeded.");
      data.noAutoDamage = true;
      if (attackRoll.total >= imageAC) {
        await warpgate.wait(effectOptions.imageDestroyDelay);
        await Sequencer.EffectManager.endEffects({ name: mirrorImageEffectNames[0] });
        await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, true);
        return;
      } else {
        await warpgate.wait(500);
        await mirrorImage.updateChatCard(data.itemCardId, target, roll.total, false);
        return;
      }
    }
  }
  static async handleMirrorImageEnded(effect) {
    if (!effect.data?.name)
      return;
    if (!effect.data.name.startsWith("MirrorImage"))
      return;
    const targetID = effect.data.name.split("-")[1];
    const target = canvas.tokens.get(targetID);
    const effectOptions = target.document.getFlag("advancedspelleffects", "mirrorImage");
    const imageDestroyEffect = `jb2a.impact.004.${effectOptions.imageDestroyEffectColor}`;
    const imageDestroySound = effectOptions.imageDestroySound ?? "";
    const imageDestroySoundDelay = effectOptions.imageDestroySoundDelay ?? 0;
    const imageDestroyVolume = effectOptions.imageDestroyVolume ?? 1;
    const spritePos = effect.sprite.worldTransform;
    const t = canvas.stage.worldTransform;
    const adjustedPos = {
      x: (spritePos.tx - t.tx) / canvas.stage.scale.x,
      y: (spritePos.ty - t.ty) / canvas.stage.scale.y
    };
    new Sequence().effect(imageDestroyEffect).atLocation(adjustedPos).sound().file(imageDestroySound).volume(imageDestroyVolume).delay(imageDestroySoundDelay).playIf(imageDestroySound != "").play();
  }
  static async updateChatCardFailed(itemCardId, target, attackRoll) {
    const chatMessage = await game.messages.get(itemCardId, target);
    let chatMessageContent = $(await duplicate(chatMessage.data.content));
    chatMessageContent.find(".midi-qol-hits-display").append(`<div class="midi-qol-flex-container">
                    <div>
                        Mirror Image Roll: <b>${attackRoll}</b>
                    </div>
                </div>`);
    await chatMessage.update({ content: chatMessageContent.prop("outerHTML") });
  }
  static async updateChatCard(itemCardId, target, attackRoll, hit) {
    const chatMessage = await game.messages.get(itemCardId, target);
    let chatMessageContent = $(await duplicate(chatMessage.data.content));
    chatMessageContent.find(".midi-qol-hits-display").empty();
    chatMessageContent.find(".midi-qol-hits-display").append(`<div class="midi-qol-flex-container">
                    <div>
                        Mirror Image Roll: <b>${attackRoll}</b>  - Attack ${hit ? "hits" : "misses"}
                    </div>
                    <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${target.id}"> ${target.name}'s Mirror Image!</div>
                    <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${target.id}"> ${target.name}'s Mirror Image!
                    </div>
                    <div><img src="${target.data.img}" width="30" height="30" style="border:0px">
                    </div>
                </div>`);
    await chatMessage.update({ content: chatMessageContent.prop("outerHTML") });
  }
  async playSequence() {
    const casterToken = this.token;
    const numberOfImages = 3;
    casterToken.data.img;
    const positions = [];
    const angles = [...Array(120).keys()].map((x) => x * 3);
    for (let i = 0; i < numberOfImages; i++) {
      var centerOffset = 10 + Math.random() * this.effectOptions.orbitRadius;
      var rotationOffset = angles.length / numberOfImages * i;
      const trig = /* @__PURE__ */ __name((formula) => {
        const pos = angles.map((angle) => centerOffset * Math[formula](angle * (Math.PI / 180)));
        return [...pos.slice(rotationOffset), ...pos.slice(0, rotationOffset)];
      }, "trig");
      positions.push({
        x: trig("cos"),
        y: trig("sin")
      });
    }
    const castEffect = `jb2a.impact.004.${this.effectOptions.castEffectColor}`;
    const runeGlowColor = this.effectOptions.runeColor;
    const orbitDuration = this.effectOptions.orbitDuration;
    const imageOpacity = this.effectOptions.imageOpacity;
    const castEffectSound = this.effectOptions.castSound ?? "";
    const castEffectSoundDelay = this.effectOptions.castSoundDelay ?? 0;
    const castEffectVolume = this.effectOptions.castVolume ?? 1;
    const seq = new Sequence().sound().file(castEffectSound).volume(castEffectVolume).delay(castEffectSoundDelay).playIf(castEffectSound != "").effect().file(castEffect).atLocation(casterToken).fadeIn(500).effect().file("jb2a.extras.tmfx.runes.circle.simple.illusion").atLocation(casterToken).duration(2e3).fadeIn(500).fadeOut(500).scale(0.5).filter("Glow", {
      color: runeGlowColor
    }).scaleIn(0, 500, {
      ease: "easeOutCubic"
    }).waitUntilFinished(-1e3);
    positions.forEach((position, index) => {
      seq.effect().from(casterToken).fadeIn(1e3).attachTo(casterToken).loopProperty("sprite", "position.x", {
        values: index % 2 ? position.x : position.x.slice().reverse(),
        duration: orbitDuration,
        pingPong: false
      }).loopProperty("sprite", "position.y", {
        values: index % 3 ? position.y : position.y.slice().reverse(),
        duration: orbitDuration,
        pingPong: false
      }).persist().scaleOut(0, 300, { ease: "easeInExpo" }).opacity(imageOpacity).name(`MirrorImage-${casterToken.id}-${index}`);
    });
    seq.play();
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const burstEffectColorOptions = getDBOptions("jb2a.impact.004");
    const runeColorOptions = [
      { "0x3c1361": "Dark Purple" },
      { "0x00b4ff": "Blue" },
      { "0x1DD0DE": "Cyan" },
      { "0x1D8B16": "Green" },
      { "0xFFCE00": "Yellow" },
      { "0xFF9B00": "Orange" },
      { "0xFF0000": "Red" },
      { "0x7D1DFF": "Purple" },
      { "0xFF00FF": "Pink" },
      { "0xFFFFFF": "White" },
      { "0x000000": "Black" }
    ];
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageCreateEffectColorLabel"),
      type: "dropdown",
      options: burstEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.castEffectColor",
      flagName: "castEffectColor",
      flagValue: currFlags.castEffectColor ?? "blue",
      tooltip: game.i18n.localize("ASE.MirrorImageCreateEffectColorTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageCastSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.castSound",
      flagName: "castSound",
      flagValue: currFlags.castSound ?? "",
      tooltip: game.i18n.localize("ASE.MirrorImageCastSoundTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageCastSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.castSoundDelay",
      flagName: "castSoundDelay",
      flagValue: currFlags.castSoundDelay ?? 0,
      tooltip: game.i18n.localize("ASE.MirrorImageCastSoundDelayTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageCastVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.castVolume",
      flagName: "castVolume",
      flagValue: currFlags.castVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: game.i18n.localize("ASE.MirrorImageCastVolumeTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageRuneColorLabel"),
      type: "dropdown",
      options: runeColorOptions,
      name: "flags.advancedspelleffects.effectOptions.runeColor",
      flagName: "runeColor",
      flagValue: currFlags.runeColor ?? "0x00b4ff",
      tooltip: game.i18n.localize("ASE.MirrorImageRuneColorTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageOrbitRadiusLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.orbitRadius",
      flagName: "orbitRadius",
      flagValue: currFlags.orbitRadius ?? 40,
      tooltip: game.i18n.localize("ASE.MirrorImageOrbitRadiusTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageOrbitDurationLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.orbitDuration",
      flagName: "orbitDuration",
      flagValue: currFlags.orbitDuration ?? 24,
      tooltip: game.i18n.localize("ASE.MirrorImageOrbitDurationTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageOpacityLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.imageOpacity",
      flagName: "imageOpacity",
      flagValue: currFlags.imageOpacity ?? 0.5,
      min: 0,
      max: 1,
      step: 0.1,
      tooltip: game.i18n.localize("ASE.MirrorImageOpacityTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageDestroyDelay"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.imageDestroyDelay",
      flagName: "imageDestroyDelay",
      flagValue: currFlags.imageDestroyDelay ?? 0,
      tooltip: game.i18n.localize("ASE.MirrorImageDestroyDelayTooltip")
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MirrorImageDestroyEffectColorLabel"),
      type: "dropdown",
      options: burstEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.imageDestroyEffectColor",
      flagName: "imageDestroyEffectColor",
      flagValue: currFlags.imageDestroyEffectColor ?? "blue",
      tooltip: game.i18n.localize("ASE.MirrorImageDestroyEffectColorTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageDestroySoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.imageDestroySound",
      flagName: "imageDestroySound",
      flagValue: currFlags.imageDestroySound ?? "",
      tooltip: game.i18n.localize("ASE.MirrorImageDestroySoundTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageDestroySoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.imageDestroySoundDelay",
      flagName: "imageDestroySoundDelay",
      flagValue: currFlags.imageDestroySoundDelay ?? 0,
      tooltip: game.i18n.localize("ASE.MirrorImageDestroySoundDelayTooltip")
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MirrorImageDestroyVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.imageDestroyVolume",
      flagName: "imageDestroyVolume",
      flagValue: currFlags.imageDestroyVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: game.i18n.localize("ASE.MirrorImageDestroyVolumeTooltip")
    });
    return {
      spellOptions,
      animOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(mirrorImage, "mirrorImage");
class chaosBolt extends baseSpellClass {
  elements = {
    "Acid": "icons/magic/acid/projectile-faceted-glob.webp",
    "Cold": "icons/magic/air/wind-tornado-wall-blue.webp",
    "Fire": "icons/magic/fire/beam-jet-stream-embers.webp",
    "Force": "icons/magic/sonic/projectile-sound-rings-wave.webp",
    "Lightning": "icons/magic/lightning/bolt-blue.webp",
    "Poison": "icons/magic/death/skull-poison-green.webp",
    "Psychic": "icons/magic/control/fear-fright-monster-grin-red-orange.webp",
    "Thunder": "icons/magic/sonic/explosion-shock-wave-teal.webp"
  };
  constructor(args) {
    super();
    this.params = args;
    this.actor = game.actors.get(this.params.actor.id);
    this.token = canvas.tokens.get(this.params.tokenId);
    this.item = this.params.item;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions") ?? {};
    this.itemCardId = this.params.itemCardId;
    this.spellLevel = Number(this.params.itemLevel);
    this.target = Array.from(this.params.targets)[0];
    this.targetsHitSoFar = [];
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const acidEffects = `jb2a.magic_missile`;
    const acidEffectColorOptions = getDBOptions(acidEffects);
    const coldEffects = `jb2a.ray_of_frost`;
    const coldEffectColorOptions = getDBOptions(coldEffects);
    const fireEffects = "jb2a.fire_bolt";
    const fireEffectColorOptions = getDBOptions(fireEffects);
    const forceEffects = "jb2a.eldritch_blast";
    const forceEffectColorOptions = getDBOptions(forceEffects);
    const lightningEffects = "jb2a.chain_lightning.primary";
    const lightningEffectColorOptions = getDBOptions(lightningEffects);
    const poisonEffects = "jb2a.spell_projectile.skull";
    const poisonEffectColorOptions = getDBOptions(poisonEffects);
    const psychicEffects = "jb2a.disintegrate";
    const psychicEffectColorOptions = getDBOptions(psychicEffects);
    const thunderEffects = "jb2a.bullet.01";
    const thunderEffectColorOptions = getDBOptions(thunderEffects);
    const thunderShatterEffects = "jb2a.shatter";
    const thunderShatterEffectColorOptions = getDBOptions(thunderShatterEffects);
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    animOptions.push({
      label: game.i18n.localize("ASE.AcidEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.AcidEffectColorTooltip"),
      type: "dropdown",
      options: acidEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.acidColor",
      flagName: "acidColor",
      flagValue: currFlags.acidColor ?? "green"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.AcidEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.AcidEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.acidSound",
      flagName: "acidSound",
      flagValue: currFlags.acidSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.AcidEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.AcidEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.acidSoundDelay",
      flagName: "acidSoundDelay",
      flagValue: currFlags.acidSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.AcidEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.AcidEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.acidVolume",
      flagName: "acidVolume",
      flagValue: currFlags.acidVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ColdEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.ColdEffectColorTooltip"),
      type: "dropdown",
      options: coldEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.coldColor",
      flagName: "coldColor",
      flagValue: currFlags.coldColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ColdEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.ColdEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.coldSound",
      flagName: "coldSound",
      flagValue: currFlags.coldSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ColdEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.ColdEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.coldSoundDelay",
      flagName: "coldSoundDelay",
      flagValue: currFlags.coldSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ColdEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.ColdEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.coldVolume",
      flagName: "coldVolume",
      flagValue: currFlags.coldVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.FireEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.FireEffectColorTooltip"),
      type: "dropdown",
      options: fireEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.fireColor",
      flagName: "fireColor",
      flagValue: currFlags.fireColor ?? "orange"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FireEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.FireEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.fireSound",
      flagName: "fireSound",
      flagValue: currFlags.fireSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FireEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.FireEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.fireSoundDelay",
      flagName: "fireSoundDelay",
      flagValue: currFlags.fireSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.FireEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.FireEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.fireVolume",
      flagName: "fireVolume",
      flagValue: currFlags.fireVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ForceEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.ForceEffectColorTooltip"),
      type: "dropdown",
      options: forceEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.forceColor",
      flagName: "forceColor",
      flagValue: currFlags.forceColor ?? "purple"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ForceEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.ForceEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.forceSound",
      flagName: "forceSound",
      flagValue: currFlags.forceSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ForceEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.ForceEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.forceSoundDelay",
      flagName: "forceSoundDelay",
      flagValue: currFlags.forceSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ForceEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.ForceEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.forceVolume",
      flagName: "forceVolume",
      flagValue: currFlags.forceVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.LightningEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.LightningEffectColorTooltip"),
      type: "dropdown",
      options: lightningEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.lightningColor",
      flagName: "lightningColor",
      flagValue: currFlags.lightningColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.LightningEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.LightningEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.lightningSound",
      flagName: "lightningSound",
      flagValue: currFlags.lightningSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.LightningEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.LightningEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.lightningSoundDelay",
      flagName: "lightningSoundDelay",
      flagValue: currFlags.lightningSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.LightningEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.LightningEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.lightningVolume",
      flagName: "lightningVolume",
      flagValue: currFlags.lightningVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.PoisonEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.PoisonEffectColorTooltip"),
      type: "dropdown",
      options: poisonEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.poisonColor",
      flagName: "poisonColor",
      flagValue: currFlags.poisonColor ?? "pinkpurple"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PoisonEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.PoisonEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.poisonSound",
      flagName: "poisonSound",
      flagValue: currFlags.poisonSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PoisonEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.PoisonEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.poisonSoundDelay",
      flagName: "poisonSoundDelay",
      flagValue: currFlags.poisonSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PoisonEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.PoisonEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.poisonVolume",
      flagName: "poisonVolume",
      flagValue: currFlags.poisonVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.PsychicEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.PsychicEffectColorTooltip"),
      type: "dropdown",
      options: psychicEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.psychicColor",
      flagName: "psychicColor",
      flagValue: currFlags.psychicColor ?? "dark_red"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PsychicEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.PsychicEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.psychicSound",
      flagName: "psychicSound",
      flagValue: currFlags.psychicSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PsychicEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.PsychicEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.psychicSoundDelay",
      flagName: "psychicSoundDelay",
      flagValue: currFlags.psychicSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.PsychicEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.PsychicEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.psychicVolume",
      flagName: "psychicVolume",
      flagValue: currFlags.psychicVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ThunderEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.ThunderEffectColorTooltip"),
      type: "dropdown",
      options: thunderEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.thunderColor",
      flagName: "thunderColor",
      flagValue: currFlags.thunderColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.ThunderEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.thunderSound",
      flagName: "thunderSound",
      flagValue: currFlags.thunderSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.ThunderEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.thunderSoundDelay",
      flagName: "thunderSoundDelay",
      flagValue: currFlags.thunderSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.ThunderEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.thunderVolume",
      flagName: "thunderVolume",
      flagValue: currFlags.thunderVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.ThunderShatterEffectColorLabel"),
      tooltip: game.i18n.localize("ASE.ThunderShatterEffectColorTooltip"),
      type: "dropdown",
      options: thunderShatterEffectColorOptions,
      name: "flags.advancedspelleffects.effectOptions.thunderShatterColor",
      flagName: "thunderShatterColor",
      flagValue: currFlags.thunderShatterColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderShatterEffectSoundLabel"),
      tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.thunderShatterSound",
      flagName: "thunderShatterSound",
      flagValue: currFlags.thunderShatterSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderShatterEffectSoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.thunderShatterSoundDelay",
      flagName: "thunderShatterSoundDelay",
      flagValue: currFlags.thunderShatterSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ThunderShatterEffectSoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.ThunderShatterEffectSoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.thunderShatterVolume",
      flagName: "thunderShatterVolume",
      flagValue: currFlags.thunderShatterVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      animOptions,
      spellOptions,
      soundOptions,
      allowInitialMidiCall: false
    };
  }
  static async cast(args) {
    console.log("ASE | CHAOS BOLT | Cast Args: ", args);
    const workflow = new this(args);
    const spellStateOptions = {
      repeat: true,
      damInterrupt: true,
      effectOptions: workflow.effectOptions,
      item: workflow.item,
      caster: workflow.token,
      targets: [workflow.target.document.uuid],
      targetsHit: []
    };
    console.log("ASE | CHAOS BOLT | spellStateOptions: ", spellStateOptions);
    game.ASESpellStateManager.addSpell(workflow.item.uuid, spellStateOptions);
  }
  static async damageInterrupt(data) {
    console.log("ASE | CHAOS BOLT | Damage Interrupt Data: ", data);
    const elements = {
      "Acid": "icons/magic/acid/projectile-faceted-glob.webp",
      "Cold": "icons/magic/air/wind-tornado-wall-blue.webp",
      "Fire": "icons/magic/fire/beam-jet-stream-embers.webp",
      "Force": "icons/magic/sonic/projectile-sound-rings-wave.webp",
      "Lightning": "icons/magic/lightning/bolt-blue.webp",
      "Poison": "icons/magic/death/skull-poison-green.webp",
      "Psychic": "icons/magic/control/fear-fright-monster-grin-red-orange.webp",
      "Thunder": "icons/magic/sonic/explosion-shock-wave-teal.webp"
    };
    const damageSequences2 = {
      "acid": (sequence2, attack, options) => {
        sequence2.sound().file(options.acidSound ?? "").delay(options.acidSoundDelay ?? 0).volume(options.acidVolume ?? 0.5).playIf(options.acidSound != "" && options.acidSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.magic_missile.${options.acidColor ?? "green"}`).missed(!attack.hits).waitUntilFinished(-1e3);
      },
      "cold": (sequence2, attack, options) => {
        sequence2.sound().file(options.coldSound ?? "").delay(options.coldSoundDelay ?? 0).volume(options.coldVolume ?? 0.5).playIf(options.coldSound != "" && options.coldSound).effect().atLocation(attack.origin).stretchTo(attack.target).missed(!attack.hits).file(`jb2a.ray_of_frost.${options.coldColor ?? "blue"}`).waitUntilFinished(-1500);
      },
      "fire": (sequence2, attack, options) => {
        sequence2.sound().file(options.fireSound ?? "").delay(options.fireSoundDelay ?? 0).volume(options.fireVolume ?? 0.5).playIf(options.fireSound != "" && options.fireSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.fire_bolt.${options.fireColor ?? "orange"}`).missed(!attack.hits).waitUntilFinished(-1e3);
      },
      "force": (sequence2, attack, options) => {
        sequence2.sound().file(options.forceSound ?? "").delay(options.forceSoundDelay ?? 0).volume(options.forceVolume ?? 0.5).playIf(options.forceSound != "" && options.forceSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.eldritch_blast.${options.forceColor ?? "purple"}`).missed(!attack.hits).waitUntilFinished(-3e3);
      },
      "lightning": (sequence2, attack, options) => {
        sequence2.sound().file(options.lightningSound ?? "").delay(options.lightningSoundDelay ?? 0).volume(options.lightningVolume ?? 0.5).playIf(options.lightningSound != "" && options.lightningSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.chain_lightning.primary.${options.lightningColor ?? "blue"}`).missed(!attack.hits).waitUntilFinished(-1500);
      },
      "poison": (sequence2, attack, options) => {
        sequence2.sound().file(options.poisonSound ?? "").delay(options.poisonSoundDelay ?? 0).volume(options.poisonVolume ?? 0.5).playIf(options.poisonSound != "").effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.spell_projectile.skull.${options.poisonColor ?? "pinkpurple"}`).missed(!attack.hits).waitUntilFinished(-1500);
      },
      "psychic": (sequence2, attack, options) => {
        sequence2.sound().file(options.psychicSound ?? "").delay(options.psychicSoundDelay ?? 0).volume(options.psychicVolume ?? 0.5).playIf(options.psychicSound != "" && options.psychicSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.disintegrate.${options.psychicColor ?? "dark_red"}`).missed(!attack.hits).waitUntilFinished(-1750);
      },
      "thunder": (sequence2, attack, options) => {
        sequence2.sound().file(options.thunderSound ?? "").delay(options.thunderSoundDelay ?? 0).volume(options.thunderVolume ?? 0.5).playIf(options.thunderSound != "" && options.thunderSound).effect().atLocation(attack.origin).stretchTo(attack.target).file(`jb2a.bullet.01.${options.thunderColor ?? "blue"}`).missed(!attack.hits).name(`chaos-missile-thunder-${attack.origin.id}`).waitUntilFinished(-1e3).sound().file(options.thunderShatterSound ?? "").delay(options.thunderShatterSoundDelay ?? 0).volume(options.thunderShatterVolume ?? 0.5).playIf(options.thunderShatterSound != "" && options.thunderShatterSound).effect().atLocation(`chaos-missile-thunder-${attack.origin.id}`).file(`jb2a.shatter.${options.thunderShatterColor ?? "blue"}`).waitUntilFinished(-1500);
      }
    };
    const item = data.item;
    const effectOptions = item.getFlag("advancedspelleffects", "effectOptions");
    const range = item.data.data.range.value;
    const hitTarget = Array.from(data.hitTargets)[0];
    const attackHit = Array.from(data.hitTargets).length > 0;
    const target = Array.from(data.targets)[0];
    let returnObj = {};
    let spellState = game.ASESpellStateManager.getSpell(item.uuid);
    if (!spellState)
      return;
    if (!hitTarget) {
      spellState.finished = true;
      game.ASESpellStateManager.removeSpell(item.uuid);
    }
    console.log("ASE | CHAOS BOLT | Spell State: ", spellState);
    if (hitTarget) {
      spellState.options.targetsHit.push(hitTarget.document.uuid);
    }
    if (spellState.options.nextTargets) {
      delete spellState.options.nextTargets;
    }
    const damageRoll = data.damageRoll;
    let die1;
    let die2;
    if (damageRoll.terms[0].faces == 8) {
      die1 = damageRoll.terms[0].results[0].result;
      die2 = damageRoll.terms[0].results[1].result;
    }
    const firstElement = Object.keys(elements)[die1 - 1];
    const secondElement = Object.keys(elements)[die2 - 1];
    let damageType = await warpgate.buttonDialog({
      buttons: [
        { label: `First D8 Result: ${die1} <img src="${elements[firstElement]}"/> ${firstElement.slice(0, 1).toUpperCase() + firstElement.slice(1)} damage`, value: firstElement },
        { label: `Second D8 Result: ${die2} <img src="${elements[secondElement]}"/> ${secondElement.slice(0, 1).toUpperCase() + secondElement.slice(1)} damage`, value: secondElement }
      ],
      title: "Pick Damage Type..."
    }, "row");
    if (!damageType) {
      spellState.finished = true;
      game.ASESpellStateManager.removeSpell(item.uuid);
      ui.notifications.error("Spell Aborted: You must pick a damage type!");
      return returnObj;
    }
    console.log("ASE | CHAOS BOLT | Damage Type: ", damageType.toLowerCase());
    returnObj["newDamageType"] = damageType;
    if (die1 != die2) {
      spellState.finished = true;
      game.ASESpellStateManager.removeSpell(item.uuid);
    } else if (die1 == die2 && attackHit) {
      const potentialTargets = canvas.tokens.placeables.filter(function(target2) {
        return target2.actor?.data?.data?.attributes.hp.value > 0 && canvas.grid.measureDistance(spellState.options.caster, target2) <= range && !spellState.options.targetsHit.includes(target2.document.uuid) && target2 !== spellState.options.caster;
      });
      console.log("ASE | CHAOS BOLT | Potential Targets: ", potentialTargets);
      if (!potentialTargets.length) {
        spellState.finished = true;
        game.ASESpellStateManager.removeSpell(item.uuid);
      } else {
        const targetList = potentialTargets.map((target2, index) => {
          return `
                    <tr class="chaos-bolt-target" tokenId="${target2.id}">
                        <td class="chaos-bolt-flex">
                            <img src="${target2.data.img}" width="30" height="30" style="border:0px"> - ${target2.name}
                        </td>
                        <td>
                            <input type="checkbox" class='target' name="${index}">
                        </td>
                    </tr>
                    `;
        }).join("");
        const content = `
                <style>
                    .chaos-bolt-flex {
                        display: inline-flex;
                        align-items: center;
                    }
                    .chaos-bolt-flex img {
                        margin-right: 0.5rem;
                    }
                </style>
                <p>Choose next target: </p>
                <form class="flexcol">
                    <table width="100%">
                        <tbody>
                            <tr>
                                <th>Potential Target</th>
                                <th>Jump to</th>
                            </tr>
                            ${targetList}
                        </tbody>
                    </table>
                </form>
                `;
        let newTargets = await new Promise(async (resolve) => {
          let resolved = false;
          new Dialog({
            title: "Chaos Bolt: Choose New Target",
            content,
            buttons: {
              one: {
                icon: `<i class="fas fa-bolt"></i>`,
                label: "HURL!",
                callback: async (html) => {
                  let selected_targets = html.find("input:checkbox:checked");
                  let targetData = [];
                  for (let input of selected_targets) {
                    targetData.push(potentialTargets[Number(input.name)].document.uuid);
                  }
                  resolved = true;
                  resolve(targetData);
                }
              }
            },
            close: () => {
              if (!resolved)
                resolve(false);
            },
            render: (html) => {
              html.find(".chaos-bolt-target").on("mouseenter", function(e) {
                let token = canvas.tokens.get($(this).attr("tokenId"));
                token._onHoverIn(e);
              }).on("mouseleave", function(e) {
                let token = canvas.tokens.get($(this).attr("tokenId"));
                token._onHoverOut(e);
              });
              let numJumps = 1;
              html.find("input:checkbox").on("change", function() {
                let total = html.find("input:checkbox:checked").length;
                html.find("input:checkbox:not(:checked)").each(function() {
                  $(this).prop("disabled", total === numJumps);
                });
              });
            }
          }).render(true);
        });
        console.log("ASE | CHAOS BOLT | New Target: ", newTargets);
        if (!newTargets) {
          spellState.finished = true;
          game.ASESpellStateManager.removeSpell(item.uuid);
        }
        if (newTargets.length > 0) {
          returnObj["newTargets"] = newTargets;
        }
      }
    }
    let sequence = new Sequence();
    damageSequences2[damageType.toLowerCase()](sequence, { origin: spellState.options.caster, target, hits: attackHit }, effectOptions);
    sequence.play();
    return returnObj;
  }
  async playSequence() {
    if (!game.modules.get("sequencer")?.active)
      return;
    if (!game.modules.get("jb2a_patreon")?.active)
      return;
    let sequence = new Sequence();
    for (const attack of this.attackData) {
      damageSequences[attack.damageType](sequence, attack, this.effectOptions);
    }
    sequence.play();
  }
}
__name(chaosBolt, "chaosBolt");
class viciousMockery {
  constructor(data) {
    this.params = data;
    this.actor = game.actors.get(this.params.actor.id);
    this.token = canvas.tokens.get(this.params.tokenId);
    this.item = this.params.item;
    this.effectOptions = this.item.getFlag("advancedspelleffects", "effectOptions");
    this.isMidiActive = isMidiActive();
    this.target = Array.from(this.params.targets)[0];
    this.cussVault = ["!", "@", "#", "$", "%", "&"];
  }
  static registerHooks() {
    return;
  }
  async cast() {
    await this.playSequence();
  }
  async playSequence() {
    const caster2 = this.token;
    const target = this.target;
    const useRandomGlow = this.effectOptions.randomGlow;
    const glowColor = useRandomGlow ? getRandomColor("0x") : convertColorHexTo0x(this.effectOptions?.glowColor ?? "#f01414");
    const glowDistance = this.effectOptions?.glowDistance ?? 30;
    const glowOuterStrength = this.effectOptions?.glowOuterStrength ?? 2;
    const glowInnerStrength = this.effectOptions?.glowInnerStrength ?? 0.25;
    const fontFamily = this.effectOptions?.font ?? "Impact";
    const fontSize = this.effectOptions?.size ?? 38;
    const fontFillColorA = this.effectOptions?.fillColorA ?? "#f01414";
    const fontFillColorB = this.effectOptions?.fillColorB ?? "#931a1a";
    const soundFile = this.effectOptions?.sound ?? "";
    const soundDelay = this.effectOptions?.soundDelay ?? 0;
    const soundVolume = this.effectOptions?.soundVolume ?? 0.5;
    const textOptions = {
      "dropShadowAngle": 7.6,
      "fontFamily": fontFamily,
      "fontSize": fontSize,
      "fontStyle": "oblique",
      "fontVariant": "small-caps",
      "fontWeight": "bolder",
      "fill": [
        fontFillColorA,
        fontFillColorB
      ]
    };
    const distance = getDistanceClassic({ x: caster2.x, y: caster2.y }, { x: target.x, y: target.y });
    let viciousMockerySeq = new Sequence();
    viciousMockerySeq.sound().file(soundFile).delay(soundDelay).volume(soundVolume).playIf(soundFile && soundFile !== "");
    for (let i = 0; i < getRandomInt(5, 8); i++) {
      viciousMockerySeq.effect().moveTowards(target, { ease: "easeInOutElastic" }).moveSpeed(distance / 2.5).atLocation(caster2).text(this.makeCussWord(), textOptions).animateProperty("sprite", "rotation", { from: 0, to: 720, duration: 1200, ease: "easeInOutCubic" }).animateProperty("sprite", "scale.x", { from: 0, to: 1, duration: 1200, ease: "easeInOutCubic" }).animateProperty("sprite", "scale.y", { from: 0, to: 1, duration: 1200, ease: "easeInOutCubic" }).randomOffset().animateProperty("sprite", "scale.x", { from: 1, to: 0, delay: 1250, duration: 600, ease: "easeInOutCubic" }).animateProperty("sprite", "scale.y", { from: 1, to: 0, delay: 1250, duration: 600, ease: "easeInOutCubic" }).filter("Glow", { color: glowColor, distance: glowDistance, outerStrength: glowOuterStrength, innerStrength: glowInnerStrength }).wait(getRandomInt(50, 75));
    }
    viciousMockerySeq.play();
  }
  makeCussWord() {
    let cussWordList = [];
    for (let i = 0; i < getRandomInt(4, 10); i++) {
      cussWordList.push(this.cussVault[getRandomInt(0, this.cussVault.length - 1)]);
    }
    let cussWord = cussWordList.join("");
    return cussWord;
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    const effectFontOptions = [
      { "serif": "Serif" },
      { "Georgia serif": "Georgia" },
      { "Palatino": "Palatino" },
      { "Times New Roman": "Times New Roman" },
      { "Times": "Times" },
      { "sans-serif": "Sans-Serif" },
      { "Arial": "Arial" },
      { "Helvetica": "Helvetica" },
      { "Arial Black": "Arial Black" },
      { "Gadget": "Gadget" },
      { "Comic Sans MS": "Comic Sans MS" },
      { "cursive": "Cursive" },
      { "Impact": "Impact" },
      { "Charcoal": "Charcoal" },
      { "Lucida Sans Unicode": "Lucida Sans Unicode" },
      { "Lucida Grande": "Lucida Grande" },
      { "Tahoma": "Tahoma" },
      { "Geneva": "Geneva" },
      { "Trebuchet MS": "Trebuchet MS" },
      { "Verdana": "Verdana" },
      { "Courier New, monospace": "Courier New" },
      { "Courier": "Courier" },
      { "Monaco": "Monaco" },
      { "MS PGothic": "MS PGothic" },
      { "Indie Flower": "Indie Flower" }
    ];
    animOptions.push({
      label: game.i18n.localize("ASE.EffectFontLabel"),
      tooltip: game.i18n.localize("ASE.EffectFontTooltip"),
      type: "dropdown",
      options: effectFontOptions,
      name: "flags.advancedspelleffects.effectOptions.font",
      flagName: "font",
      flagValue: currFlags.font ?? "Impact"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.FontSizeLabel"),
      tooltip: game.i18n.localize("ASE.FontSizeTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.size",
      flagName: "size",
      flagValue: currFlags.size ?? 38
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectFillColorALabel"),
      tooltip: game.i18n.localize("ASE.EffectFillColorATooltip"),
      type: "colorPicker",
      name: "flags.advancedspelleffects.effectOptions.fillColorA",
      flagName: "fillColorA",
      flagValue: currFlags.fillColorA ?? "#f01414"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectFillColorBLabel"),
      tooltip: game.i18n.localize("ASE.EffectFillColorBTooltip"),
      type: "colorPicker",
      name: "flags.advancedspelleffects.effectOptions.fillColorB",
      flagName: "fillColorB",
      flagValue: currFlags.fillColorB ?? "#931a1a"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.RandomGlowLabel"),
      tooltip: game.i18n.localize("ASE.RandomGlowTooltip"),
      type: "checkbox",
      name: "flags.advancedspelleffects.effectOptions.randomGlow",
      flagName: "randomGlow",
      flagValue: currFlags.randomGlow ?? true
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectGlowColorLabel"),
      tooltip: game.i18n.localize("ASE.EffectGlowColorTooltip"),
      type: "colorPicker",
      name: "flags.advancedspelleffects.effectOptions.glowColor",
      flagName: "glowColor",
      flagValue: currFlags.glowColor ?? "#f01414"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectGlowDistanceLabel"),
      tooltip: game.i18n.localize("ASE.EffectGlowDistanceTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.glowDistance",
      flagName: "glowDistance",
      flagValue: currFlags.glowDistance ?? 30
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectGlowOuterStrengthLabel"),
      tooltip: game.i18n.localize("ASE.EffectGlowOuterStrengthTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.glowOuterStrength",
      flagName: "glowOuterStrength",
      flagValue: currFlags.glowOuterStrength ?? 2
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectGlowInnerStrengthLabel"),
      tooltip: game.i18n.localize("ASE.EffectGlowInnerStrengthTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.glowInnerStrength",
      flagName: "glowInnerStrength",
      flagValue: currFlags.glowInnerStrength ?? 0.25
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ViscousMockerySoundLabel"),
      tooltip: game.i18n.localize("ASE.ViscousMockerySoundTooltip"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.sound",
      flagName: "sound",
      flagValue: currFlags.sound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ViscousMockerySoundDelayLabel"),
      tooltip: game.i18n.localize("ASE.ViscousMockerySoundDelayTooltip"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.soundDelay",
      flagName: "soundDelay",
      flagValue: currFlags.soundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.ViscousMockerySoundVolumeLabel"),
      tooltip: game.i18n.localize("ASE.ViscousMockerySoundVolumeTooltip"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.soundVolume",
      flagName: "soundVolume",
      flagValue: currFlags.soundVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      spellOptions,
      animOptions,
      soundOptions
    };
  }
}
__name(viciousMockery, "viciousMockery");
class ASESettings$1 extends FormApplication {
  constructor() {
    super(...arguments);
    this.flags = this.object.data.flags.advancedspelleffects;
    if (this.flags) {
      if (!this.flags.effectOptions) {
        this.flags.effectOptions = {};
      }
    }
    this.spellList = {};
    this.spellList[game.i18n.localize("ASE.AnimateDead")] = animateDead;
    this.spellList[game.i18n.localize("ASE.CallLightning")] = callLightning;
    this.spellList[game.i18n.localize("ASE.ChaosBolt")] = chaosBolt;
    this.spellList[game.i18n.localize("ASE.DetectMagic")] = detectMagic;
    this.spellList[game.i18n.localize("ASE.FogCloud")] = fogCloud;
    this.spellList[game.i18n.localize("ASE.Darkness")] = darkness;
    this.spellList[game.i18n.localize("ASE.MagicMissile")] = magicMissile;
    this.spellList[game.i18n.localize("ASE.SpiritualWeapon")] = spiritualWeapon;
    this.spellList[game.i18n.localize("ASE.SteelWindStrike")] = steelWindStrike;
    this.spellList[game.i18n.localize("ASE.ThunderStep")] = thunderStep;
    this.spellList[game.i18n.localize("ASE.WitchBolt")] = witchBolt;
    this.spellList[game.i18n.localize("ASE.ScorchingRay")] = scorchingRay;
    this.spellList[game.i18n.localize("ASE.EldritchBlast")] = eldritchBlast;
    this.spellList[game.i18n.localize("ASE.VampiricTouch")] = vampiricTouch;
    this.spellList[game.i18n.localize("ASE.Moonbeam")] = moonBeam;
    this.spellList[game.i18n.localize("ASE.ChainLightning")] = chainLightning;
    this.spellList[game.i18n.localize("ASE.MirrorImage")] = mirrorImage;
    this.spellList[game.i18n.localize("ASE.Summon")] = summonCreature;
    this.spellList[game.i18n.localize("ASE.WallOfForce")] = wallOfForce;
    this.spellList[game.i18n.localize("ASE.DetectStuff")] = detectStuff;
    this.spellList[game.i18n.localize("ASE.ViciousMockery")] = viciousMockery;
    this.spellList[game.i18n.localize("ASE.WallSpell")] = wallSpell;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "./modules/advancedspelleffects/src/templates/ase-settings-new.html",
      id: "ase-item-settings",
      title: game.i18n.localize("ASE.SettingsWindowTitle"),
      resizable: true,
      width: "auto",
      height: "auto",
      closeOnSubmit: true
    });
  }
  async setItemDetails(item) {
    let data = {
      "activation": { "type": "action", "cost": 1, "condition": "" },
      "duration": { "value": null, "units": "" },
      "target": { "value": null, "width": null, "units": "", "type": "" },
      "uses": { "value": 0, "max": 0, "per": null },
      "consume": { "type": "", "target": null, "amount": null },
      "ability": null,
      "actionType": "other",
      "attackBonus": 0,
      "critical": null,
      "damage": { "parts": [], "versatile": "" },
      "formula": "",
      "save": { "ability": "", "dc": null, "scaling": "spell" },
      "materials": { "value": "", "consumed": false, "cost": 0, "supply": 0 },
      "scaling": { "mode": "none", "formula": "" }
    };
    let damageFormula;
    let damageDieCount;
    let damageDie;
    let damageMod;
    let effectOptions = this.object.data.flags?.advancedspelleffects?.effectOptions ?? {};
    switch (item.name) {
      case game.i18n.localize("ASE.DetectMagic"):
        data.duration = { "value": 10, "units": "minute" };
        break;
      case game.i18n.localize("ASE.Darkness"):
        data.level = 2;
        data.duration = { "value": 10, "units": "minute" };
        break;
      case game.i18n.localize("ASE.FogCloud"):
        data.level = 1;
        data.duration = { "value": 10, "units": "minute" };
        break;
      case game.i18n.localize("ASE.WallOfForce"):
        data.level = 5;
        data.duration = { "value": 10, "units": "minute" };
        break;
      case game.i18n.localize("ASE.SteelWindStrike"):
        data.level = 5;
        break;
      case game.i18n.localize("ASE.ThunderStep"):
        data.level = 3;
        break;
      case game.i18n.localize("ASE.SpiritualWeapon"):
        data.level = 2;
        break;
      case game.i18n.localize("ASE.CallLightning"):
        data.level = 3;
        data.duration = { "value": 10, "units": "minute" };
        break;
      case game.i18n.localize("ASE.WitchBolt"):
        data.level = 1;
        data.actionType = "rsak";
        data.damage.parts.push(["1d12", "lightning"]);
        data.duration = { "value": 10, "units": "minute" };
        data.scaling.formula = "1d12";
        data.scaling.mode = "level";
        break;
      case game.i18n.localize("ASE.VampiricTouch"):
        data.level = 3;
        data.actionType = "msak";
        data.damage.parts.push(["3d6", "necrotic"]);
        data.duration = { "value": 1, "units": "minute" };
        data.scaling.formula = "1d6";
        data.scaling.mode = "level";
        break;
      case game.i18n.localize("ASE.ChainLightning"):
        data.level = 6;
        data.actionType = "save";
        damageDieCount = effectOptions.dmgDieCount ?? 10;
        damageDie = effectOptions.dmgDie ?? "d8";
        damageMod = effectOptions.dmgMod ?? 0;
        damageFormula = `${damageDieCount}${damageDie}${damageMod != 0 ? (damageMod > 0 ? " + " : "") + damageMod : ""}`;
        data.damage.parts.push([damageFormula, "lightning"]);
        data.save = { ability: "dex", dc: null, scaling: "spell" };
        data.target = { value: 1, width: null, units: "", type: "creature" };
        break;
      case game.i18n.localize("ASE.ViciousMockery"):
        data.level = 0;
        data.actionType = "save";
        data.damage.parts.push(["1d4", "psychic"]);
        data.save = { ability: "wis", dc: null, scaling: "spell" };
        data.target = { value: 1, width: null, units: "", type: "creature" };
        data.scaling = { mode: "cantrip", formula: "1d4" };
        break;
    }
    let updates = { data };
    await item.update(updates);
  }
  async setEffectData(item, itemName) {
    let flags = this.object.data.flags;
    let returnOBJ = {};
    let requiredSettings;
    if (itemName.includes(game.i18n.localize("ASE.Summon"))) {
      requiredSettings = await summonCreature.getRequiredSettings(flags.advancedspelleffects.effectOptions);
      returnOBJ.requiredSettings = requiredSettings;
      let summonActorsList = game.folders?.getName("ASE-Summons")?.contents ?? [];
      let summonOptions = {};
      let currentSummonTypes = {};
      summonActorsList.forEach((actor) => {
        summonOptions[actor.name] = actor.id;
      });
      currentSummonTypes = flags.advancedspelleffects?.effectOptions?.summons ?? [{ name: "", actor: "", qty: 1 }];
      returnOBJ["itemId"] = item.id;
      if (item.parent) {
        returnOBJ["summonerId"] = item.parent.id;
      } else {
        returnOBJ["summonerId"] = "";
      }
      returnOBJ.summons = currentSummonTypes;
      returnOBJ.summonOptions = summonOptions;
    } else if (itemName.includes(game.i18n.localize("ASE.DetectStuff"))) {
      requiredSettings = await detectStuff.getRequiredSettings(flags.advancedspelleffects.effectOptions);
      returnOBJ.requiredSettings = requiredSettings;
      let customTags = flags.advancedspelleffects?.effectOptions?.tags ?? "";
      let tags = customTags.split(",");
      let tagOptions = flags.advancedspelleffects?.effectOptions?.tagOptions ?? { tagLabel: "", tagEffect: "" };
      returnOBJ.tags = tags;
      returnOBJ.tagOptions = tagOptions;
      returnOBJ["itemId"] = item.id;
      if (item.parent) {
        returnOBJ["casterId"] = item.parent.id;
      } else {
        returnOBJ["casterId"] = "";
      }
    } else {
      if (this.spellList[game.i18n.localize(itemName)] != void 0) {
        requiredSettings = await this.spellList[game.i18n.localize(itemName)].getRequiredSettings(flags.advancedspelleffects.effectOptions);
      } else {
        requiredSettings = await this.spellList[game.i18n.localize("ASE.AnimateDead")].getRequiredSettings(flags.advancedspelleffects.effectOptions);
      }
      returnOBJ.requiredSettings = requiredSettings;
    }
    return returnOBJ;
  }
  async getSpellOptions() {
    let spellOptions = {};
    let spellList = this.spellList;
    let spellNames = Object.keys(spellList).sort();
    spellNames.forEach((spellName) => {
      spellOptions[spellName] = spellName;
    });
    return spellOptions;
  }
  async getData() {
    let flags = this.object.data.flags;
    let item = this.object;
    let itemName = flags.advancedspelleffects?.spellEffect ?? item.name;
    if (itemName == "") {
      itemName = item.name;
      let spellListKeys = Object.keys(this.spellList);
      if (spellListKeys.includes(itemName)) {
        itemName = itemName;
      } else {
        itemName = game.i18n.localize("ASE.AnimateDead");
      }
    }
    let content = "";
    let effectData;
    let spellOptions;
    if (flags.advancedspelleffects?.enableASE) {
      spellOptions = await this.getSpellOptions();
      effectData = await this.setEffectData(item, itemName);
      await this.setItemDetails(this.object);
    }
    return {
      flags: this.object.data.flags,
      itemName,
      effectData,
      spellOptions,
      content
    };
  }
  activateListeners(html) {
    const body = $("#ase-item-settings");
    const animSettings = $("#ase-anim-settings");
    const animSettingsButton = $(".ase-anim-settingsButton");
    const soundSettings = $("#ase-sound-settings");
    const soundSettingsButton = $(".ase-sound-settingsButton");
    const spellSettings = $("#ase-spell-settings");
    const spellSettingsButton = $(".ase-spell-settingsButton");
    let currentTab = spellSettingsButton;
    let currentBody = spellSettings;
    super.activateListeners(html);
    $(".nav-tab").click(function() {
      currentBody.toggleClass("hide");
      currentTab.toggleClass("selected");
      if ($(this).hasClass("ase-anim-settingsButton")) {
        animSettings.toggleClass("hide");
        currentBody = animSettings;
        currentTab = animSettingsButton;
      } else if ($(this).hasClass("ase-sound-settingsButton")) {
        soundSettings.toggleClass("hide");
        currentBody = soundSettings;
        currentTab = soundSettingsButton;
      } else if ($(this).hasClass("ase-spell-settingsButton")) {
        spellSettings.toggleClass("hide");
        currentBody = spellSettings;
        currentTab = spellSettingsButton;
      }
      currentTab.toggleClass("selected");
      body.height("auto");
      body.width("auto");
    });
    html.find('.ase-enable-checkbox input[type="checkbox"]').click((evt) => {
      this.submit({ preventClose: true }).then(() => this.render());
      $("#ase-item-settings").height("auto");
      $("#ase-item-settings").width("auto");
    });
    html.find(".ase-spell-settings-select").change((evt) => {
      this.submit({ preventClose: true }).then(() => this.render());
      $("#ase-item-settings").height("auto");
      $("#ase-item-settings").width("auto");
    });
    html.find(".ase-spell-settings-numInput").change((evt) => {
      this.submit({ preventClose: true }).then(() => this.render());
      $("#ase-item-settings").height("auto");
      $("#ase-item-settings").width("auto");
    });
    html.find(".addType").click(this._addSummonType.bind(this));
    html.find(".removeType").click(this._removeSummonType.bind(this));
    html.find(".addTag").click(this._addTag.bind(this));
    html.find(".removeTag").click(this._removeTag.bind(this));
  }
  async _removeSummonType(e) {
    let summonsTable = document.getElementById("summonsTable").getElementsByTagName("tbody")[0];
    let row = summonsTable.rows[summonsTable.rows.length - 1];
    let cells = row.cells;
    let summonTypeIndex = cells[1].children[0].name.match(/\d+/)[0];
    let itemId = document.getElementById("hdnItemId").value;
    let actorId = document.getElementById("hdnSummonerId").value;
    let item;
    if (actorId != "") {
      let summoner = game.actors.get(actorId);
      item = summoner.items.get(itemId);
    } else {
      item = game.items.get(itemId);
    }
    summonsTable.rows[summonsTable.rows.length - 1].remove();
    await item.unsetFlag("advancedspelleffects", `effectOptions.summons.${summonTypeIndex}`);
    if (this.flags) {
      delete this.flags.effectOptions.summons[summonTypeIndex];
    }
    this.submit({ preventClose: true }).then(() => this.render());
  }
  async _addSummonType(e) {
    let summonsTable = document.getElementById("summonsTable").getElementsByTagName("tbody")[0];
    let newSummonRow = summonsTable.insertRow(-1);
    let newLabel1 = newSummonRow.insertCell(0);
    let newTextInput = newSummonRow.insertCell(1);
    let newLabel2 = newSummonRow.insertCell(2);
    let newSelect = newSummonRow.insertCell(3);
    let newLabel3 = newSummonRow.insertCell(4);
    let newQtyInput = newSummonRow.insertCell(5);
    newLabel1.innerHTML = `<label><b>${game.i18n.localize("ASE.SummonTypeNameLabel")}</b></label>`;
    newTextInput.innerHTML = `<input type="text"
        name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.name"
        value="">`;
    newLabel2.innerHTML = `<label><b>${game.i18n.localize("ASE.AssociatedActorLabel")}</b></label>`;
    newSelect.innerHTML = ` <select name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.actor">
        {{#each ../effectData.summonOptions as |id name|}}
        <option value="">{{name}}</option>
        {{/each}}
    </select>`;
    newLabel3.innerHTML = `<label><b>game.i18n.localize("ASE.SummonQuantityLabel")</b></label>`;
    newQtyInput.innerHTML = `<input style='width: 3em;' type="text"
    name="flags.advancedspelleffects.effectOptions.summons.${summonsTable.rows.length - 1}.qty"
    value=1>`;
    this.submit({ preventClose: true }).then(() => this.render());
  }
  async _addTag(e) {
    let tagsTable = document.getElementById("tagsTable").getElementsByTagName("tbody")[0];
    let newTagRow = tagsTable.insertRow(-1);
    let newLabel1 = newTagRow.insertCell(0);
    let newTextInput = newTagRow.insertCell(1);
    newLabel1.innerHTML = `<label><b>${game.i18n.localize("ASE.TagNameLabel")}</b></label>`;
    newTextInput.innerHTML = `<input type="text"
        name="flags.advancedspelleffects.effectOptions.tagOptions.${tagsTable.rows.length - 1}.tagLabel"
        value="">`;
    this.submit({ preventClose: true }).then(() => this.render());
  }
  async _removeTag(e) {
    let tagsTable = document.getElementById("tagsTable").getElementsByTagName("tbody")[0];
    let row = tagsTable.rows[tagsTable.rows.length - 1];
    let cells = row.cells;
    let tagIndex = cells[1].children[0].name.match(/\d+/)[0];
    let itemId = document.getElementById("hdnItemId").value;
    let actorId = document.getElementById("hdnCasterId").value;
    let item;
    if (actorId != "") {
      let caster2 = game.actors.get(actorId);
      item = caster2.items.get(itemId);
    } else {
      item = game.items.get(itemId);
    }
    tagsTable.rows[tagsTable.rows.length - 1].remove();
    await item.unsetFlag("advancedspelleffects", `effectOptions.tagOptions.${tagIndex}`);
    if (this.flags) {
      delete this.flags.effectOptions.tagOptions[tagIndex];
    }
    this.submit({ preventClose: true }).then(() => this.render());
  }
  async _updateObject(event, formData) {
    console.log("Saving ASE item...");
    await this.setItemDetails(this.object);
    formData = expandObject(formData);
    if (!formData.changes)
      formData.changes = [];
    formData.changes = Object.values(formData.changes);
    for (let c of formData.changes) {
      if (Number.isNumeric(c.value))
        c.value = parseFloat(c.value);
    }
    return this.object.update(formData);
  }
}
__name(ASESettings$1, "ASESettings$1");
Handlebars.registerHelper("ifCondASE", function(v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    case "includes":
      return v1.includes(v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
class animateDead {
  static registerHooks() {
    return;
  }
  static async rise(midiData) {
    const actorD = midiData.actor;
    const tokenD = canvas.tokens.get(midiData.tokenId);
    const itemD = actorD.items.getName(midiData.item.name);
    let aseSettings = itemD.getFlag("advancedspelleffects", "effectOptions");
    const spellLevel = midiData.itemLevel ? Number(midiData.itemLevel) : 3;
    midiData.actor?.data?.data?.attributes?.spelldc ?? 10;
    const raiseLimit = 2 * spellLevel - 5;
    const detectRange = aseSettings.range ?? 10;
    let corpses = canvas.tokens.placeables.filter(function(target) {
      return target?.actor?.data?.data?.attributes?.hp?.value == 0 && measureDistance(getCenter(tokenD.data), getCenter(target.data)) <= detectRange && target !== tokenD;
    });
    new AnimateDeadDialog({ corpses, raiseLimit, effectSettings: aseSettings }, {}).render(true);
  }
  static async getRequiredSettings(currFlags) {
    if (!currFlags)
      currFlags = {};
    const magicSignsRaw = `jb2a.magic_signs.circle.02`;
    const magicSchoolOptions = getDBOptions(magicSignsRaw);
    const magicSchoolColorsRaw = `jb2a.magic_signs.circle.02.${currFlags.magicSchool ?? "abjuration"}.intro`;
    const magicSchoolColorOptions = getDBOptions(magicSchoolColorsRaw);
    const effectAColorsRaw = `jb2a.eldritch_blast`;
    const effectAColorOptions = getDBOptions(effectAColorsRaw);
    const effectBColorsRaw = `jb2a.energy_strands.complete`;
    const effectBColorOptions = getDBOptions(effectBColorsRaw);
    const portalColorsRaw = `jb2a.portals.vertical.vortex`;
    getDBOptions(portalColorsRaw);
    const portalImpactColorsRaw = `jb2a.impact.010`;
    getDBOptions(portalImpactColorsRaw);
    let summonActorsFolder = game.folders?.getName("ASE-Summons");
    let summonActorsList = summonActorsFolder?.contents ?? [];
    if (!summonActorsFolder || summonActorsList.length === 0) {
      summonActorsList = await createFolderWithActors("ASE-Summons", ["Skeleton", "Zombie"]);
    }
    let summonOptions = [];
    let tempObj = {};
    summonActorsList.forEach((actor) => {
      tempObj = {};
      tempObj[actor.id] = actor.name;
      summonOptions.push(tempObj);
    });
    if (summonOptions.length === 0) {
      summonOptions.push({ "": "No Summonable Actors" });
    }
    let spellOptions = [];
    let animOptions = [];
    let soundOptions = [];
    spellOptions.push({
      label: game.i18n.localize("ASE.ZombieActorLabel"),
      type: "dropdown",
      options: summonOptions,
      name: "flags.advancedspelleffects.effectOptions.summons.zombie.actor",
      flagName: "zombieActor",
      flagValue: currFlags.zombieActor ?? Object.keys(Object.values(summonOptions)[0])[0]
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.SkeletonActorLabel"),
      type: "dropdown",
      options: summonOptions,
      name: "flags.advancedspelleffects.effectOptions.summons.skeleton.actor",
      flagName: "skeletonActor",
      flagValue: currFlags.skeletonActor ?? Object.keys(Object.values(summonOptions)[0])[0]
    });
    spellOptions.push({
      label: game.i18n.localize("ASE.animateDeadRangeLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.range",
      flagName: "range",
      flagValue: currFlags.range ?? 10
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolLabel"),
      type: "dropdown",
      options: magicSchoolOptions,
      name: "flags.advancedspelleffects.effectOptions.magicSchool",
      flagName: "magicSchool",
      flagValue: currFlags.magicSchool ?? "abjuration"
    });
    animOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolColorLabel"),
      type: "dropdown",
      options: magicSchoolColorOptions,
      name: "flags.advancedspelleffects.effectOptions.magicSchoolColor",
      flagName: "magicSchoolColor",
      flagValue: currFlags.magicSchoolColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolIntroSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolSound",
      flagName: "magicSchoolSound",
      flagValue: currFlags.magicSchoolSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolIntroSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolSoundDelay",
      flagName: "magicSchoolSoundDelay",
      flagValue: currFlags.magicSchoolSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolIntroSoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolVolume",
      flagName: "magicSchoolVolume",
      flagValue: currFlags.magicSchoolVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolOutroSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolSoundOutro",
      flagName: "magicSchoolSoundOutro",
      flagValue: currFlags.magicSchoolSoundOutro ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolOutroSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolSoundDelayOutro",
      flagName: "magicSchoolSoundDelayOutro",
      flagValue: currFlags.magicSchoolSoundDelayOutro ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.MagicSchoolOutroSoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.magicSchoolVolumeOutro",
      flagName: "magicSchoolVolumeOutro",
      flagValue: currFlags.magicSchoolVolumeOutro ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectAColorLabel"),
      type: "dropdown",
      options: effectAColorOptions,
      name: "flags.advancedspelleffects.effectOptions.effectAColor",
      flagName: "effectAColor",
      flagValue: currFlags.effectAColor ?? "green"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.effectASound",
      flagName: "effectASound",
      flagValue: currFlags.effectASound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.effectASoundDelay",
      flagName: "effectASoundDelay",
      flagValue: currFlags.effectASoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectASoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.effectASoundVolume",
      flagName: "effectASoundVolume",
      flagValue: currFlags.effectASoundVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    animOptions.push({
      label: game.i18n.localize("ASE.EffectBColorLabel"),
      type: "dropdown",
      options: effectBColorOptions,
      name: "flags.advancedspelleffects.effectOptions.effectBColor",
      flagName: "effectBColor",
      flagValue: currFlags.effectBColor ?? "blue"
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectBSoundLabel"),
      type: "fileInput",
      name: "flags.advancedspelleffects.effectOptions.effectBSound",
      flagName: "effectBSound",
      flagValue: currFlags.effectBSound ?? ""
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectBSoundDelayLabel"),
      type: "numberInput",
      name: "flags.advancedspelleffects.effectOptions.effectBSoundDelay",
      flagName: "effectBSoundDelay",
      flagValue: currFlags.effectBSoundDelay ?? 0
    });
    soundOptions.push({
      label: game.i18n.localize("ASE.EffectBSoundVolumeLabel"),
      type: "rangeInput",
      name: "flags.advancedspelleffects.effectOptions.effectBSoundVolume",
      flagName: "effectBSoundVolume",
      flagValue: currFlags.effectBSoundVolume ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01
    });
    return {
      animOptions,
      spellOptions,
      soundOptions,
      allowInitialMidiCall: true
    };
  }
}
__name(animateDead, "animateDead");
const spells = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  animateDead,
  callLightning,
  chainLightning,
  chaosBolt,
  darkness,
  detectMagic,
  detectStuff,
  eldritchBlast,
  fogCloud,
  magicMissile,
  mirrorImage,
  moonBeam,
  scorchingRay,
  spiritualWeapon,
  summonCreature,
  thunderStep,
  vampiricTouch,
  viciousMockery,
  wallOfForce
}, Symbol.toStringTag, { value: "Module" }));
class SpellStore extends ArrayObjectStore {
  constructor() {
    super({ StoreClass: SpellEntryStore });
  }
  get first() {
    return this._data[0];
  }
  async initialize() {
    console.log("ASE: SpellStore initialize: ", spells);
    let flagData = {};
    if (this.length > 0) {
      throw new Error(`SpellStore has already been initialized.`);
    }
    for (const [name, effect] of Object.entries(spells)) {
      flagData = {};
      let settings = {};
      settings = await effect.getRequiredSettings();
      for (const [settingType, setting] of Object.entries(settings)) {
        if (settingType == "summons") {
          flagData["summons"] = setting;
        }
        if (settingType != "summonOptions" && settingType != "allowInitialMidiCall") {
          setting.forEach((s) => {
            flagData[s.flagName] = s.flagValue;
          });
        }
        if (settingType == "allowInitialMidiCall") {
          flagData["allowInitialMidiCall"] = setting;
        }
      }
      if (typeof effect.registerHooks === "function") {
        effect.registerHooks();
      }
      this.createEntry({
        name: localize(`ASE.${name[0].toUpperCase()}${name.substring(1)}`),
        effect,
        flagData,
        settings
      });
    }
    console.log("ASE: SpellStore initialized: ", this);
  }
  async reInit() {
    while (this.length > 0) {
      this.deleteEntry(this._data[0].id);
    }
    let flagData = {};
    if (this.length > 0) {
      throw new Error(`SpellStore has already been initialized.`);
    }
    for (const [name, effect] of Object.entries(spells)) {
      flagData = {};
      let settings = {};
      settings = await effect.getRequiredSettings();
      for (const [settingType, setting] of Object.entries(settings)) {
        if (settingType == "summons") {
          flagData["summons"] = setting;
        }
        if (settingType != "summonOptions" && settingType != "allowInitialMidiCall") {
          setting.forEach((s) => {
            flagData[s.flagName] = s.flagValue;
          });
        }
        if (settingType == "allowInitialMidiCall") {
          flagData["allowInitialMidiCall"] = setting;
        }
      }
      this.createEntry({
        name: localize(`ASE.${name[0].toUpperCase()}${name.substring(1)}`),
        effect,
        flagData,
        settings
      });
    }
    console.log("ASE: SpellStore initialized: ", this);
  }
}
__name(SpellStore, "SpellStore");
class SpellEntryStore extends SpellStore.EntryStore {
  constructor(data = {}) {
    super(data);
  }
  get name() {
    return this._data.name;
  }
  get effect() {
    return this._data.effect;
  }
  get flagData() {
    return this._data.flags;
  }
  get settings() {
    return this._data.settings;
  }
  get getRequiredSettings() {
    return this._data.effect.getRequiredSettings;
  }
  set(data) {
  }
}
__name(SpellEntryStore, "SpellEntryStore");
const spellStore = new SpellStore();
function create_fragment$8(ctx) {
  let div;
  let table;
  let tbody;
  let tr;
  let td0;
  let label;
  let t0;
  let label_class_value;
  let t1;
  let td1;
  let input;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      table = element("table");
      tbody = element("tbody");
      tr = element("tr");
      td0 = element("td");
      label = element("label");
      t0 = text(ctx[1]);
      t1 = space();
      td1 = element("td");
      input = element("input");
      attr(label, "for", "enableASE");
      attr(label, "class", label_class_value = ctx[0] ? "selected" : "notSelected");
      attr(input, "type", "checkbox");
      attr(input, "id", "enableASE");
      set_style(tbody, "border-top", "1pt solid black");
      set_style(tbody, "border-bottom", "none");
      attr(div, "class", "ase-shared-settings");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, table);
      append(table, tbody);
      append(tbody, tr);
      append(tr, td0);
      append(td0, label);
      append(label, t0);
      append(tr, t1);
      append(tr, td1);
      append(td1, input);
      input.checked = ctx[0];
      if (!mounted) {
        dispose = listen(input, "change", ctx[2]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && label_class_value !== (label_class_value = ctx2[0] ? "selected" : "notSelected")) {
        attr(label, "class", label_class_value);
      }
      if (dirty & 1) {
        input.checked = ctx2[0];
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$8, "create_fragment$8");
function instance$8($$self, $$props, $$invalidate) {
  let { enableASE } = $$props;
  console.log("----------------------ENTERING ENABLEASE COMPONENT----------------------");
  let enableASELabel = game.i18n.localize("ASE.ConvertToASELabel");
  function input_change_handler() {
    enableASE = this.checked;
    $$invalidate(0, enableASE);
  }
  __name(input_change_handler, "input_change_handler");
  $$self.$$set = ($$props2) => {
    if ("enableASE" in $$props2)
      $$invalidate(0, enableASE = $$props2.enableASE);
  };
  return [enableASE, enableASELabel, input_change_handler];
}
__name(instance$8, "instance$8");
class EnableASE extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { enableASE: 0 });
  }
}
__name(EnableASE, "EnableASE");
function get_each_context$6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
__name(get_each_context$6, "get_each_context$6");
function create_each_block$6(key_1, ctx) {
  let option;
  let t_value = ctx[8].name + "";
  let t;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[8];
      option.value = option.__value;
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && t_value !== (t_value = ctx[8].name + ""))
        set_data(t, t_value);
      if (dirty & 4 && option_value_value !== (option_value_value = ctx[8])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block$6, "create_each_block$6");
function create_fragment$7(ctx) {
  let div1;
  let div0;
  let table;
  let tbody;
  let tr0;
  let td0;
  let label0;
  let t1;
  let td1;
  let p;
  let b;
  let t2;
  let t3;
  let tr1;
  let td2;
  let t5;
  let td3;
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let mounted;
  let dispose;
  let each_value = ctx[2];
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[8].id, "get_key");
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$6(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
  }
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      table = element("table");
      tbody = element("tbody");
      tr0 = element("tr");
      td0 = element("td");
      label0 = element("label");
      label0.textContent = `${ctx[4]}`;
      t1 = space();
      td1 = element("td");
      p = element("p");
      b = element("b");
      t2 = text(ctx[0]);
      t3 = space();
      tr1 = element("tr");
      td2 = element("td");
      td2.innerHTML = `<label for="spellEffect">Use Effect:</label>`;
      t5 = space();
      td3 = element("td");
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(label0, "for", "itemNameLabel");
      attr(p, "id", "itemNameLabel");
      attr(select, "id", "spellEffect");
      if (ctx[1] === void 0)
        add_render_callback(() => ctx[6].call(select));
      set_style(tbody, "border-top", "none");
      set_style(tbody, "border-bottom", "none");
      attr(div1, "class", "ase-shared-settings");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, table);
      append(table, tbody);
      append(tbody, tr0);
      append(tr0, td0);
      append(td0, label0);
      append(tr0, t1);
      append(tr0, td1);
      append(td1, p);
      append(p, b);
      append(b, t2);
      append(tbody, t3);
      append(tbody, tr1);
      append(tr1, td2);
      append(tr1, t5);
      append(tr1, td3);
      append(td3, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[1]);
      if (!mounted) {
        dispose = listen(select, "change", ctx[6]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1)
        set_data(t2, ctx2[0]);
      if (dirty & 4) {
        each_value = ctx2[2];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, select, destroy_block, create_each_block$6, null, get_each_context$6);
      }
      if (dirty & 6) {
        select_option(select, ctx2[1]);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$7, "create_fragment$7");
function instance$7($$self, $$props, $$invalidate) {
  let $spellStoreHost;
  let $currentSpell, $$unsubscribe_currentSpell = noop, $$subscribe_currentSpell = /* @__PURE__ */ __name(() => ($$unsubscribe_currentSpell(), $$unsubscribe_currentSpell = subscribe(currentSpell, ($$value) => $$invalidate(5, $currentSpell = $$value)), currentSpell), "$$subscribe_currentSpell");
  let $spellStore;
  component_subscribe($$self, spellStore, ($$value) => $$invalidate(2, $spellStore = $$value));
  $$self.$$.on_destroy.push(() => $$unsubscribe_currentSpell());
  let { itemName } = $$props;
  console.log("----------------------ENTERING SHARED SETTINGS COMPONENT----------------------");
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(7, $spellStoreHost = value));
  let currentSpell = $spellStoreHost;
  $$subscribe_currentSpell();
  let ASESettingsLabel = game.i18n.localize("ASE.ASESettingsLabel");
  function select_change_handler() {
    currentSpell = select_value(this);
    $$subscribe_currentSpell($$invalidate(1, currentSpell));
  }
  __name(select_change_handler, "select_change_handler");
  $$self.$$set = ($$props2) => {
    if ("itemName" in $$props2)
      $$invalidate(0, itemName = $$props2.itemName);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 34) {
      {
        console.log("Shared Settings: currentSpell: ", $currentSpell);
        set_store_value(spellStoreHost, $spellStoreHost = currentSpell, $spellStoreHost);
      }
    }
  };
  return [
    itemName,
    currentSpell,
    $spellStore,
    spellStoreHost,
    ASESettingsLabel,
    $currentSpell,
    select_change_handler
  ];
}
__name(instance$7, "instance$7");
class SharedSettings extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, { itemName: 0 });
  }
}
__name(SharedSettings, "SharedSettings");
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[15] = list;
  child_ctx[16] = i;
  return child_ctx;
}
__name(get_each_context$5, "get_each_context$5");
function get_each_context_1$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i].id;
  child_ctx[18] = list[i].name;
  return child_ctx;
}
__name(get_each_context_1$3, "get_each_context_1$3");
function create_each_block_1$3(ctx) {
  let option;
  let t_value = ctx[18] + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[17];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block_1$3, "create_each_block_1$3");
function create_each_block$5(ctx) {
  let tr;
  let td0;
  let label0;
  let b0;
  let label0_for_value;
  let t1;
  let td1;
  let input0;
  let input0_id_value;
  let t2;
  let td2;
  let label1;
  let b1;
  let label1_for_value;
  let t4;
  let td3;
  let select;
  let select_id_value;
  let t5;
  let td4;
  let label2;
  let b2;
  let label2_for_value;
  let t7;
  let td5;
  let input1;
  let input1_id_value;
  let mounted;
  let dispose;
  function input0_input_handler() {
    ctx[10].call(input0, ctx[16]);
  }
  __name(input0_input_handler, "input0_input_handler");
  let each_value_1 = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
  }
  function select_change_handler() {
    ctx[11].call(select, ctx[16]);
  }
  __name(select_change_handler, "select_change_handler");
  function input1_input_handler() {
    ctx[12].call(input1, ctx[16]);
  }
  __name(input1_input_handler, "input1_input_handler");
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      label0 = element("label");
      b0 = element("b");
      b0.textContent = `${ctx[4]}`;
      t1 = space();
      td1 = element("td");
      input0 = element("input");
      t2 = space();
      td2 = element("td");
      label1 = element("label");
      b1 = element("b");
      b1.textContent = `${ctx[5]}`;
      t4 = space();
      td3 = element("td");
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t5 = space();
      td4 = element("td");
      label2 = element("label");
      b2 = element("b");
      b2.textContent = `${ctx[6]}`;
      t7 = space();
      td5 = element("td");
      input1 = element("input");
      attr(label0, "for", label0_for_value = ctx[14].name);
      attr(input0, "type", "text");
      attr(input0, "id", input0_id_value = ctx[14].name);
      attr(label1, "for", label1_for_value = ctx[14].actor);
      attr(select, "id", select_id_value = ctx[14].actor);
      if (ctx[1][ctx[16]].actor === void 0)
        add_render_callback(select_change_handler);
      attr(label2, "for", label2_for_value = ctx[14].qty);
      set_style(input1, "width", "3em");
      attr(input1, "type", "text");
      attr(input1, "id", input1_id_value = ctx[14].qty);
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, label0);
      append(label0, b0);
      append(tr, t1);
      append(tr, td1);
      append(td1, input0);
      set_input_value(input0, ctx[1][ctx[16]].name);
      append(tr, t2);
      append(tr, td2);
      append(td2, label1);
      append(label1, b1);
      append(tr, t4);
      append(tr, td3);
      append(td3, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[1][ctx[16]].actor);
      append(tr, t5);
      append(tr, td4);
      append(td4, label2);
      append(label2, b2);
      append(tr, t7);
      append(tr, td5);
      append(td5, input1);
      set_input_value(input1, ctx[1][ctx[16]].qty);
      if (!mounted) {
        dispose = [
          listen(input0, "input", input0_input_handler),
          listen(select, "change", select_change_handler),
          listen(input1, "input", input1_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 10 && label0_for_value !== (label0_for_value = ctx[14].name)) {
        attr(label0, "for", label0_for_value);
      }
      if (dirty & 10 && input0_id_value !== (input0_id_value = ctx[14].name)) {
        attr(input0, "id", input0_id_value);
      }
      if (dirty & 10 && input0.value !== ctx[1][ctx[16]].name) {
        set_input_value(input0, ctx[1][ctx[16]].name);
      }
      if (dirty & 10 && label1_for_value !== (label1_for_value = ctx[14].actor)) {
        attr(label1, "for", label1_for_value);
      }
      if (dirty & 8) {
        each_value_1 = ctx[3];
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1$3(ctx, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1$3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if (dirty & 10 && select_id_value !== (select_id_value = ctx[14].actor)) {
        attr(select, "id", select_id_value);
      }
      if (dirty & 10) {
        select_option(select, ctx[1][ctx[16]].actor);
      }
      if (dirty & 10 && label2_for_value !== (label2_for_value = ctx[14].qty)) {
        attr(label2, "for", label2_for_value);
      }
      if (dirty & 10 && input1_id_value !== (input1_id_value = ctx[14].qty)) {
        attr(input1, "id", input1_id_value);
      }
      if (dirty & 10 && input1.value !== ctx[1][ctx[16]].qty) {
        set_input_value(input1, ctx[1][ctx[16]].qty);
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_each_block$5, "create_each_block$5");
function create_fragment$6(ctx) {
  let table;
  let tbody;
  let t0;
  let tr;
  let td0;
  let button0;
  let t2;
  let td1;
  let button1;
  let mounted;
  let dispose;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
  }
  return {
    c() {
      table = element("table");
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      tr = element("tr");
      td0 = element("td");
      button0 = element("button");
      button0.textContent = `${localize("ASE.AddTypeButtonLabel")}`;
      t2 = space();
      td1 = element("td");
      button1 = element("button");
      button1.textContent = `${localize("ASE.RemoveTypeButtonLabel")}`;
      attr(table, "id", "summonsTable");
      attr(table, "width", "100%");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
      append(tbody, t0);
      append(tbody, tr);
      append(tr, td0);
      append(td0, button0);
      append(tr, t2);
      append(tr, td1);
      append(td1, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", ctx[7]),
          listen(button1, "click", ctx[8])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 122) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$5(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$5(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(tbody, t0);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(table);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$6, "create_fragment$6");
function instance$6($$self, $$props, $$invalidate) {
  let $spellEffect, $$unsubscribe_spellEffect = noop, $$subscribe_spellEffect = /* @__PURE__ */ __name(() => ($$unsubscribe_spellEffect(), $$unsubscribe_spellEffect = subscribe(spellEffect, ($$value) => $$invalidate(13, $spellEffect = $$value)), spellEffect), "$$subscribe_spellEffect");
  let $spellStoreHost;
  $$self.$$.on_destroy.push(() => $$unsubscribe_spellEffect());
  console.log("----------------------ENTERING CUSTOM SUMMON SETTINGS COMPONENT----------------------");
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(9, $spellStoreHost = value));
  let spellEffect = $spellStoreHost;
  $$subscribe_spellEffect();
  let summonOptions = $spellEffect.settings.summonOptions;
  console.log("Custom Summon Stuff Settings: summonOptions: ", summonOptions);
  console.log("Custom Summon Settings: spell Effect: ", $spellEffect);
  if (!$spellEffect.flagData.summons || $spellEffect.flagData.summons.length == 0) {
    set_store_value(
      spellEffect,
      $spellEffect.flagData.summons = [
        {
          name: "",
          actor: summonOptions[0].id,
          qty: 1
        }
      ],
      $spellEffect
    );
  }
  let summons = $spellEffect.flagData.summons;
  console.log("Custom Summon Stuff Settings: summons: ", summons);
  let summonTypeLabel = localize("ASE.SummonTypeNameLabel");
  let associatedActorLabel = localize("ASE.AssociatedActorLabel");
  let summonQuantityLabel = localize("ASE.SummonQuantityLabel");
  function addSummon() {
    summons.push({
      name: "",
      actor: summonOptions[0].id,
      qty: 1
    });
    $$invalidate(1, summons);
  }
  __name(addSummon, "addSummon");
  function removeSummon() {
    if (summons.length == 1) {
      ui.notifications.info("Cannot remove last summon");
      return;
    }
    summons.pop();
    $$invalidate(1, summons);
  }
  __name(removeSummon, "removeSummon");
  function input0_input_handler(i) {
    summons[i].name = this.value;
    $$invalidate(1, summons);
    $$invalidate(3, summonOptions);
  }
  __name(input0_input_handler, "input0_input_handler");
  function select_change_handler(i) {
    summons[i].actor = select_value(this);
    $$invalidate(1, summons);
    $$invalidate(3, summonOptions);
  }
  __name(select_change_handler, "select_change_handler");
  function input1_input_handler(i) {
    summons[i].qty = this.value;
    $$invalidate(1, summons);
    $$invalidate(3, summonOptions);
  }
  __name(input1_input_handler, "input1_input_handler");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 512) {
      $$subscribe_spellEffect($$invalidate(0, spellEffect = $spellStoreHost));
    }
  };
  return [
    spellEffect,
    summons,
    spellStoreHost,
    summonOptions,
    summonTypeLabel,
    associatedActorLabel,
    summonQuantityLabel,
    addSummon,
    removeSummon,
    $spellStoreHost,
    input0_input_handler,
    select_change_handler,
    input1_input_handler
  ];
}
__name(instance$6, "instance$6");
class CustomSummonForm extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
  }
}
__name(CustomSummonForm, "CustomSummonForm");
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  child_ctx[10] = list;
  child_ctx[11] = i;
  return child_ctx;
}
__name(get_each_context$4, "get_each_context$4");
function create_each_block$4(ctx) {
  let tr;
  let td0;
  let label0;
  let b0;
  let label0_for_value;
  let label0_title_value;
  let t1;
  let td1;
  let input0;
  let input0_id_value;
  let t2;
  let td2;
  let label1;
  let b1;
  let label1_for_value;
  let label1_title_value;
  let t4;
  let td3;
  let input1;
  let input1_id_value;
  let t5;
  let mounted;
  let dispose;
  function input0_input_handler() {
    ctx[6].call(input0, ctx[11]);
  }
  __name(input0_input_handler, "input0_input_handler");
  function input1_input_handler() {
    ctx[7].call(input1, ctx[11]);
  }
  __name(input1_input_handler, "input1_input_handler");
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      label0 = element("label");
      b0 = element("b");
      b0.textContent = `${localize("ASE.TagNameLabel")}`;
      t1 = space();
      td1 = element("td");
      input0 = element("input");
      t2 = space();
      td2 = element("td");
      label1 = element("label");
      b1 = element("b");
      b1.textContent = `${localize("ASE.TagEffectLabel")}`;
      t4 = space();
      td3 = element("td");
      input1 = element("input");
      t5 = space();
      attr(label0, "for", label0_for_value = ctx[9].tagLabel);
      attr(label0, "title", label0_title_value = localize("ASE.TagNameTooltip"));
      attr(input0, "type", "text");
      attr(input0, "id", input0_id_value = ctx[9].tagLabel);
      attr(label1, "for", label1_for_value = ctx[9].tagEffect);
      attr(label1, "title", label1_title_value = localize("ASE.TagEffectTooltip"));
      attr(input1, "type", "text");
      attr(input1, "id", input1_id_value = ctx[9].tagEffect);
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, label0);
      append(label0, b0);
      append(tr, t1);
      append(tr, td1);
      append(td1, input0);
      set_input_value(input0, ctx[1][ctx[11]].tagLabel);
      append(tr, t2);
      append(tr, td2);
      append(td2, label1);
      append(label1, b1);
      append(tr, t4);
      append(tr, td3);
      append(td3, input1);
      set_input_value(input1, ctx[1][ctx[11]].tagEffect);
      append(tr, t5);
      if (!mounted) {
        dispose = [
          listen(input0, "input", input0_input_handler),
          listen(input1, "input", input1_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && label0_for_value !== (label0_for_value = ctx[9].tagLabel)) {
        attr(label0, "for", label0_for_value);
      }
      if (dirty & 2 && input0_id_value !== (input0_id_value = ctx[9].tagLabel)) {
        attr(input0, "id", input0_id_value);
      }
      if (dirty & 2 && input0.value !== ctx[1][ctx[11]].tagLabel) {
        set_input_value(input0, ctx[1][ctx[11]].tagLabel);
      }
      if (dirty & 2 && label1_for_value !== (label1_for_value = ctx[9].tagEffect)) {
        attr(label1, "for", label1_for_value);
      }
      if (dirty & 2 && input1_id_value !== (input1_id_value = ctx[9].tagEffect)) {
        attr(input1, "id", input1_id_value);
      }
      if (dirty & 2 && input1.value !== ctx[1][ctx[11]].tagEffect) {
        set_input_value(input1, ctx[1][ctx[11]].tagEffect);
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_each_block$4, "create_each_block$4");
function create_fragment$5(ctx) {
  let table;
  let tbody;
  let tr;
  let th;
  let t1;
  let t2;
  let div1;
  let div0;
  let button0;
  let t3_value = localize("ASE.AddTagButtonLabel") + "";
  let t3;
  let t4;
  let button1;
  let i;
  let t5;
  let t6_value = localize("ASE.RemoveTagButtonLabel") + "";
  let t6;
  let mounted;
  let dispose;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$4(get_each_context$4(ctx, each_value, i2));
  }
  return {
    c() {
      table = element("table");
      tbody = element("tbody");
      tr = element("tr");
      th = element("th");
      th.textContent = `${localize("ASE.TagTableLabel")}`;
      t1 = space();
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t2 = space();
      div1 = element("div");
      div0 = element("div");
      button0 = element("button");
      t3 = text(t3_value);
      t4 = space();
      button1 = element("button");
      i = element("i");
      t5 = space();
      t6 = text(t6_value);
      attr(th, "colspan", "4");
      attr(table, "id", "tagsTable");
      attr(table, "width", "100%");
      attr(table, "title", "Custom Tags");
      attr(button0, "title", localize("ASE.AddTagButtonTooltip"));
      attr(i, "class", "fas fa-times");
      attr(button1, "title", localize("ASE.RemoveTagButtonTooltip"));
      set_style(div0, "margin", "auto");
      set_style(div1, "text-align", "center");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, tbody);
      append(tbody, tr);
      append(tr, th);
      append(tbody, t1);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(tbody, null);
      }
      insert(target, t2, anchor);
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, button0);
      append(button0, t3);
      append(div0, t4);
      append(div0, button1);
      append(button1, i);
      append(button1, t5);
      append(button1, t6);
      if (!mounted) {
        dispose = [
          listen(button0, "click", ctx[3]),
          listen(button1, "click", ctx[4])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2) {
        each_value = ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$4(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(tbody, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(table);
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(t2);
      if (detaching)
        detach(div1);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_fragment$5, "create_fragment$5");
function instance$5($$self, $$props, $$invalidate) {
  let $spellEffect, $$unsubscribe_spellEffect = noop, $$subscribe_spellEffect = /* @__PURE__ */ __name(() => ($$unsubscribe_spellEffect(), $$unsubscribe_spellEffect = subscribe(spellEffect, ($$value) => $$invalidate(8, $spellEffect = $$value)), spellEffect), "$$subscribe_spellEffect");
  let $spellStoreHost;
  $$self.$$.on_destroy.push(() => $$unsubscribe_spellEffect());
  console.log("----------------------ENTERING CUSTOM DETECT SETTINGS COMPONENT----------------------");
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(5, $spellStoreHost = value));
  let spellEffect = $spellStoreHost;
  $$subscribe_spellEffect();
  console.log("Custom Detect Stuff Settings: spell Effect: ", $spellEffect);
  if (!$spellEffect.flagData.tagOptions || $spellEffect.flagData.tagOptions.length == 0) {
    set_store_value(spellEffect, $spellEffect.flagData.tagOptions = [{ tagEffect: "", tagLabel: "" }], $spellEffect);
  }
  let tags = $spellEffect.flagData.tagOptions ?? [{ tagEffect: "", tagLabel: "" }];
  console.log("Custom Detect Stuff Settings: tags: ", tags);
  function addTag() {
    tags.push({ tagEffect: "", tagLabel: "" });
    $$invalidate(1, tags);
  }
  __name(addTag, "addTag");
  function removeTag() {
    if (tags.length == 1) {
      ui.notifications.info("Cannot remove last tag");
      return;
    }
    tags.pop();
    $$invalidate(1, tags);
  }
  __name(removeTag, "removeTag");
  function input0_input_handler(i) {
    tags[i].tagLabel = this.value;
    $$invalidate(1, tags);
  }
  __name(input0_input_handler, "input0_input_handler");
  function input1_input_handler(i) {
    tags[i].tagEffect = this.value;
    $$invalidate(1, tags);
  }
  __name(input1_input_handler, "input1_input_handler");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $$subscribe_spellEffect($$invalidate(0, spellEffect = $spellStoreHost));
    }
  };
  return [
    spellEffect,
    tags,
    spellStoreHost,
    addTag,
    removeTag,
    $spellStoreHost,
    input0_input_handler,
    input1_input_handler
  ];
}
__name(instance$5, "instance$5");
class CustomDetectForm extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
  }
}
__name(CustomDetectForm, "CustomDetectForm");
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[14] = list;
  child_ctx[15] = i;
  return child_ctx;
}
__name(get_each_context$3, "get_each_context$3");
function get_each_context_1$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
__name(get_each_context_1$2, "get_each_context_1$2");
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
__name(get_each_context_2, "get_each_context_2");
function create_if_block_7(ctx) {
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler() {
    ctx[6].call(input, ctx[13]);
  }
  __name(input_input_handler, "input_input_handler");
  return {
    c() {
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2 && input.value !== ctx[1].flagData[ctx[13].flagName]) {
        set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_7, "create_if_block_7");
function create_if_block_6(ctx) {
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_handler() {
    ctx[7].call(input, ctx[13]);
  }
  __name(input_change_handler, "input_change_handler");
  return {
    c() {
      input = element("input");
      attr(input, "type", "checkbox");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, input, anchor);
      input.checked = ctx[1].flagData[ctx[13].flagName];
      if (!mounted) {
        dispose = listen(input, "change", input_change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2) {
        input.checked = ctx[1].flagData[ctx[13].flagName];
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_6, "create_if_block_6");
function create_if_block_5$2(ctx) {
  let select;
  let select_id_value;
  let mounted;
  let dispose;
  let each_value_2 = ctx[13].options;
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select, "id", select_id_value = ctx[13].flagName);
      if (ctx[0] === void 0)
        add_render_callback(() => ctx[8].call(select));
    },
    m(target, anchor) {
      insert(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[0]);
      if (!mounted) {
        dispose = listen(select, "change", ctx[8]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2) {
        each_value_2 = ctx2[13].options;
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
      if (dirty & 2 && select_id_value !== (select_id_value = ctx2[13].flagName)) {
        attr(select, "id", select_id_value);
      }
      if (dirty & 3) {
        select_option(select, ctx2[0]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(select);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_5$2, "create_if_block_5$2");
function create_each_block_2(ctx) {
  let option;
  let t_value = Object.values(ctx[16])[0] + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = Object.keys(ctx[16])[0];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t_value !== (t_value = Object.values(ctx2[16])[0] + ""))
        set_data(t, t_value);
      if (dirty & 2 && option_value_value !== (option_value_value = Object.keys(ctx2[16])[0])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block_2, "create_each_block_2");
function create_if_block_4$2(ctx) {
  let select;
  let select_id_value;
  let mounted;
  let dispose;
  let each_value_1 = ctx[13].options;
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
  }
  function select_change_handler_1() {
    ctx[9].call(select, ctx[13]);
  }
  __name(select_change_handler_1, "select_change_handler_1");
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select, "id", select_id_value = ctx[13].flagName);
      if (ctx[1].flagData[ctx[13].flagName] === void 0)
        add_render_callback(select_change_handler_1);
    },
    m(target, anchor) {
      insert(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[1].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(select, "change", select_change_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2) {
        each_value_1 = ctx[13].options;
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1$2(ctx, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if (dirty & 2 && select_id_value !== (select_id_value = ctx[13].flagName)) {
        attr(select, "id", select_id_value);
      }
      if (dirty & 2) {
        select_option(select, ctx[1].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(select);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_4$2, "create_if_block_4$2");
function create_each_block_1$2(ctx) {
  let option;
  let t_value = Object.values(ctx[16])[0] + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = Object.keys(ctx[16])[0];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t_value !== (t_value = Object.values(ctx2[16])[0] + ""))
        set_data(t, t_value);
      if (dirty & 2 && option_value_value !== (option_value_value = Object.keys(ctx2[16])[0])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block_1$2, "create_each_block_1$2");
function create_if_block_3$3(ctx) {
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler_1() {
    ctx[10].call(input, ctx[13]);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  return {
    c() {
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2 && input.value !== ctx[1].flagData[ctx[13].flagName]) {
        set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(input);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_3$3, "create_if_block_3$3");
function create_if_block_2$3(ctx) {
  let input;
  let input_min_value;
  let input_max_value;
  let input_step_value;
  let input_name_value;
  let t0;
  let output;
  let t1_value = ctx[1].flagData[ctx[13].flagName] + "";
  let t1;
  let mounted;
  let dispose;
  function input_change_input_handler() {
    ctx[11].call(input, ctx[13]);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  return {
    c() {
      input = element("input");
      t0 = space();
      output = element("output");
      t1 = text(t1_value);
      attr(input, "type", "range");
      attr(input, "min", input_min_value = ctx[13].min);
      attr(input, "max", input_max_value = ctx[13].max);
      attr(input, "step", input_step_value = ctx[13].step);
      attr(input, "oninput", "this.nextElementSibling.value = this.value");
      attr(input, "name", input_name_value = ctx[13].flagName);
      set_style(output, "font-weight", "bold");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      insert(target, t0, anchor);
      insert(target, output, anchor);
      append(output, t1);
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_input_handler),
          listen(input, "input", input_change_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_min_value !== (input_min_value = ctx[13].min)) {
        attr(input, "min", input_min_value);
      }
      if (dirty & 2 && input_max_value !== (input_max_value = ctx[13].max)) {
        attr(input, "max", input_max_value);
      }
      if (dirty & 2 && input_step_value !== (input_step_value = ctx[13].step)) {
        attr(input, "step", input_step_value);
      }
      if (dirty & 2 && input_name_value !== (input_name_value = ctx[13].flagName)) {
        attr(input, "name", input_name_value);
      }
      if (dirty & 2) {
        set_input_value(input, ctx[1].flagData[ctx[13].flagName]);
      }
      if (dirty & 2 && t1_value !== (t1_value = ctx[1].flagData[ctx[13].flagName] + ""))
        set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching)
        detach(input);
      if (detaching)
        detach(t0);
      if (detaching)
        detach(output);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_if_block_2$3, "create_if_block_2$3");
function create_each_block$3(key_1, ctx) {
  let tr;
  let td0;
  let label;
  let t0_value = ctx[13].label + "";
  let t0;
  let label_for_value;
  let t1;
  let td1;
  let t2;
  let t3;
  let show_if_1 = ctx[13].type == "dropdown" && ctx[13].flagName.includes("wallType");
  let t4;
  let show_if = ctx[13].type == "dropdown" && !ctx[13].flagName.includes("wallType");
  let t5;
  let t6;
  let t7;
  let if_block0 = ctx[13].type == "numberInput" && create_if_block_7(ctx);
  let if_block1 = ctx[13].type == "checkbox" && create_if_block_6(ctx);
  let if_block2 = show_if_1 && create_if_block_5$2(ctx);
  let if_block3 = show_if && create_if_block_4$2(ctx);
  let if_block4 = ctx[13].type == "textInput" && create_if_block_3$3(ctx);
  let if_block5 = ctx[13].type == "rangeInput" && create_if_block_2$3(ctx);
  return {
    key: key_1,
    first: null,
    c() {
      tr = element("tr");
      td0 = element("td");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      td1 = element("td");
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      if (if_block3)
        if_block3.c();
      t5 = space();
      if (if_block4)
        if_block4.c();
      t6 = space();
      if (if_block5)
        if_block5.c();
      t7 = space();
      attr(label, "for", label_for_value = ctx[13].flagName);
      this.first = tr;
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, label);
      append(label, t0);
      append(tr, t1);
      append(tr, td1);
      if (if_block0)
        if_block0.m(td1, null);
      append(td1, t2);
      if (if_block1)
        if_block1.m(td1, null);
      append(td1, t3);
      if (if_block2)
        if_block2.m(td1, null);
      append(td1, t4);
      if (if_block3)
        if_block3.m(td1, null);
      append(td1, t5);
      if (if_block4)
        if_block4.m(td1, null);
      append(td1, t6);
      if (if_block5)
        if_block5.m(td1, null);
      append(tr, t7);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t0_value !== (t0_value = ctx[13].label + ""))
        set_data(t0, t0_value);
      if (dirty & 2 && label_for_value !== (label_for_value = ctx[13].flagName)) {
        attr(label, "for", label_for_value);
      }
      if (ctx[13].type == "numberInput") {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_7(ctx);
          if_block0.c();
          if_block0.m(td1, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx[13].type == "checkbox") {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_6(ctx);
          if_block1.c();
          if_block1.m(td1, t3);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & 2)
        show_if_1 = ctx[13].type == "dropdown" && ctx[13].flagName.includes("wallType");
      if (show_if_1) {
        if (if_block2) {
          if_block2.p(ctx, dirty);
        } else {
          if_block2 = create_if_block_5$2(ctx);
          if_block2.c();
          if_block2.m(td1, t4);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & 2)
        show_if = ctx[13].type == "dropdown" && !ctx[13].flagName.includes("wallType");
      if (show_if) {
        if (if_block3) {
          if_block3.p(ctx, dirty);
        } else {
          if_block3 = create_if_block_4$2(ctx);
          if_block3.c();
          if_block3.m(td1, t5);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (ctx[13].type == "textInput") {
        if (if_block4) {
          if_block4.p(ctx, dirty);
        } else {
          if_block4 = create_if_block_3$3(ctx);
          if_block4.c();
          if_block4.m(td1, t6);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (ctx[13].type == "rangeInput") {
        if (if_block5) {
          if_block5.p(ctx, dirty);
        } else {
          if_block5 = create_if_block_2$3(ctx);
          if_block5.c();
          if_block5.m(td1, null);
        }
      } else if (if_block5) {
        if_block5.d(1);
        if_block5 = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      if (if_block5)
        if_block5.d();
    }
  };
}
__name(create_each_block$3, "create_each_block$3");
function create_if_block_1$3(ctx) {
  let customsummonform;
  let current;
  customsummonform = new CustomSummonForm({});
  return {
    c() {
      create_component(customsummonform.$$.fragment);
    },
    m(target, anchor) {
      mount_component(customsummonform, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(customsummonform.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(customsummonform.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(customsummonform, detaching);
    }
  };
}
__name(create_if_block_1$3, "create_if_block_1$3");
function create_if_block$3(ctx) {
  let customdetectform;
  let current;
  customdetectform = new CustomDetectForm({});
  return {
    c() {
      create_component(customdetectform.$$.fragment);
    },
    m(target, anchor) {
      mount_component(customdetectform, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(customdetectform.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(customdetectform.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(customdetectform, detaching);
    }
  };
}
__name(create_if_block$3, "create_if_block$3");
function create_fragment$4(ctx) {
  let table;
  let tbody;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let show_if_1 = ctx[1].name.includes(localize("ASE.Summon"));
  let t1;
  let show_if = ctx[1].name.includes(localize("ASE.DetectStuff"));
  let if_block1_anchor;
  let current;
  let each_value = ctx[1].settings.spellOptions;
  const get_key = /* @__PURE__ */ __name((ctx2) => ctx2[13].flagName, "get_key");
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
  }
  let if_block0 = show_if_1 && create_if_block_1$3();
  let if_block1 = show_if && create_if_block$3();
  return {
    c() {
      table = element("table");
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      if (if_block0)
        if_block0.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      if_block1_anchor = empty();
      set_style(tbody, "border-top", "1pt solid black");
      set_style(tbody, "border-bottom", "1pt solid black");
      attr(table, "class", "ase-spell-settings-table");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
      insert(target, t0, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert(target, t1, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 3) {
        each_value = ctx2[1].settings.spellOptions;
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, tbody, destroy_block, create_each_block$3, null, get_each_context$3);
      }
      if (dirty & 2)
        show_if_1 = ctx2[1].name.includes(localize("ASE.Summon"));
      if (show_if_1) {
        if (if_block0) {
          if (dirty & 2) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_1$3();
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(t1.parentNode, t1);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (dirty & 2)
        show_if = ctx2[1].name.includes(localize("ASE.DetectStuff"));
      if (show_if) {
        if (if_block1) {
          if (dirty & 2) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block$3();
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(table);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (detaching)
        detach(t0);
      if (if_block0)
        if_block0.d(detaching);
      if (detaching)
        detach(t1);
      if (if_block1)
        if_block1.d(detaching);
      if (detaching)
        detach(if_block1_anchor);
    }
  };
}
__name(create_fragment$4, "create_fragment$4");
function instance$4($$self, $$props, $$invalidate) {
  let $spellEffect, $$unsubscribe_spellEffect = noop, $$subscribe_spellEffect = /* @__PURE__ */ __name(() => ($$unsubscribe_spellEffect(), $$unsubscribe_spellEffect = subscribe(spellEffect, ($$value) => $$invalidate(1, $spellEffect = $$value)), spellEffect), "$$subscribe_spellEffect");
  let $spellStoreHost;
  $$self.$$.on_destroy.push(() => $$unsubscribe_spellEffect());
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(5, $spellStoreHost = value));
  let spellEffect = $spellStoreHost;
  $$subscribe_spellEffect();
  console.log("Spell Settings: --------ENTERING SPELL SETTINGS COMPONENT-------");
  console.log("Spell Settings: spellEffect: ", $spellEffect);
  $spellEffect.settings.summonOptions ?? [];
  let wallSpecificSettings = {};
  let wallType = $spellEffect.flagData.wallType ?? "fire";
  function input_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler, "input_input_handler");
  function input_change_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.checked;
    spellEffect.set($spellEffect);
  }
  __name(input_change_handler, "input_change_handler");
  function select_change_handler() {
    wallType = select_value(this);
    $$invalidate(0, wallType);
  }
  __name(select_change_handler, "select_change_handler");
  function select_change_handler_1(setting) {
    $spellEffect.flagData[setting.flagName] = select_value(this);
    spellEffect.set($spellEffect);
  }
  __name(select_change_handler_1, "select_change_handler_1");
  function input_input_handler_1(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  function input_change_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = to_number(this.value);
    spellEffect.set($spellEffect);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $$subscribe_spellEffect($$invalidate(2, spellEffect = $spellStoreHost));
    }
    if ($$self.$$.dirty & 19) {
      {
        if ($spellEffect.name.includes(localize("ASE.WallSpell"))) {
          console.log("Spell Settings: Chaning wall type to: ", wallType);
          set_store_value(spellEffect, $spellEffect.flagData.wallType = wallType, $spellEffect);
          $$invalidate(4, wallSpecificSettings = $spellEffect.effect.getRequiredSettings($spellEffect.flagData));
          set_store_value(spellEffect, $spellEffect.settings = wallSpecificSettings, $spellEffect);
          set_store_value(spellEffect, $spellEffect.flagData.panelCount = wallSpecificSettings.spellOptions.find((x) => x.flagName == "panelCount")?.flagValue ?? 10, $spellEffect);
          set_store_value(spellEffect, $spellEffect.flagData.wallSegmentSize = wallSpecificSettings.spellOptions.find((x) => x.flagName == "wallSegmentSize")?.flagValue ?? 10, $spellEffect);
          set_store_value(spellEffect, $spellEffect.flagData.forceColor = wallSpecificSettings.animOptions.find((x) => x.flagName == "forceColor")?.flagValue ?? "blue", $spellEffect);
        }
      }
    }
  };
  return [
    wallType,
    $spellEffect,
    spellEffect,
    spellStoreHost,
    wallSpecificSettings,
    $spellStoreHost,
    input_input_handler,
    input_change_handler,
    select_change_handler,
    select_change_handler_1,
    input_input_handler_1,
    input_change_input_handler
  ];
}
__name(instance$4, "instance$4");
class SpellSettings extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, {});
  }
}
__name(SpellSettings, "SpellSettings");
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  child_ctx[11] = list;
  child_ctx[12] = i;
  return child_ctx;
}
__name(get_each_context$2, "get_each_context$2");
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  return child_ctx;
}
__name(get_each_context_1$1, "get_each_context_1$1");
function create_if_block_5$1(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler() {
    ctx[4].call(input, ctx[10]);
  }
  __name(input_input_handler, "input_input_handler");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[10].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[10].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2 && input.value !== ctx[1].flagData[ctx[10].flagName]) {
        set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_5$1, "create_if_block_5$1");
function create_if_block_4$1(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_handler() {
    ctx[5].call(input, ctx[10]);
  }
  __name(input_change_handler, "input_change_handler");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "checkbox");
      attr(input, "id", input_id_value = ctx[10].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      input.checked = ctx[1].flagData[ctx[10].flagName];
      if (!mounted) {
        dispose = listen(input, "change", input_change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[10].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2) {
        input.checked = ctx[1].flagData[ctx[10].flagName];
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_4$1, "create_if_block_4$1");
function create_if_block_3$2(ctx) {
  let td;
  let select;
  let select_id_value;
  let mounted;
  let dispose;
  let each_value_1 = ctx[10].options;
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  }
  function select_change_handler() {
    ctx[6].call(select, ctx[10]);
  }
  __name(select_change_handler, "select_change_handler");
  return {
    c() {
      td = element("td");
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select, "id", select_id_value = ctx[10].flagName);
      if (ctx[1].flagData[ctx[10].flagName] === void 0)
        add_render_callback(select_change_handler);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[1].flagData[ctx[10].flagName]);
      if (!mounted) {
        dispose = listen(select, "change", select_change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2) {
        each_value_1 = ctx[10].options;
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1$1(ctx, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if (dirty & 2 && select_id_value !== (select_id_value = ctx[10].flagName)) {
        attr(select, "id", select_id_value);
      }
      if (dirty & 2) {
        select_option(select, ctx[1].flagData[ctx[10].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_3$2, "create_if_block_3$2");
function create_each_block_1$1(ctx) {
  let option;
  let t_value = Object.values(ctx[13])[0] + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = Object.keys(ctx[13])[0];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t_value !== (t_value = Object.values(ctx2[13])[0] + ""))
        set_data(t, t_value);
      if (dirty & 2 && option_value_value !== (option_value_value = Object.keys(ctx2[13])[0])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block_1$1, "create_each_block_1$1");
function create_if_block_2$2(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler_1() {
    ctx[7].call(input, ctx[10]);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[10].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[10].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2 && input.value !== ctx[1].flagData[ctx[10].flagName]) {
        set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_2$2, "create_if_block_2$2");
function create_if_block_1$2(ctx) {
  let td;
  let output;
  let t0_value = ctx[1].flagData[ctx[10].flagName] + "";
  let t0;
  let t1;
  let input;
  let input_min_value;
  let input_max_value;
  let input_step_value;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_input_handler() {
    ctx[8].call(input, ctx[10]);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  return {
    c() {
      td = element("td");
      output = element("output");
      t0 = text(t0_value);
      t1 = space();
      input = element("input");
      set_style(output, "font-weight", "bold");
      attr(input, "type", "range");
      attr(input, "min", input_min_value = ctx[10].min);
      attr(input, "max", input_max_value = ctx[10].max);
      attr(input, "step", input_step_value = ctx[10].step);
      attr(input, "oninput", "this.previousElementSibling.value = this.value");
      attr(input, "id", input_id_value = ctx[10].flagName);
      attr(td, "colspan", "2");
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, output);
      append(output, t0);
      append(td, t1);
      append(td, input);
      set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_input_handler),
          listen(input, "input", input_change_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t0_value !== (t0_value = ctx[1].flagData[ctx[10].flagName] + ""))
        set_data(t0, t0_value);
      if (dirty & 2 && input_min_value !== (input_min_value = ctx[10].min)) {
        attr(input, "min", input_min_value);
      }
      if (dirty & 2 && input_max_value !== (input_max_value = ctx[10].max)) {
        attr(input, "max", input_max_value);
      }
      if (dirty & 2 && input_step_value !== (input_step_value = ctx[10].step)) {
        attr(input, "step", input_step_value);
      }
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[10].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2) {
        set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_if_block_1$2, "create_if_block_1$2");
function create_if_block$2(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler_2() {
    ctx[9].call(input, ctx[10]);
  }
  __name(input_input_handler_2, "input_input_handler_2");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "color");
      attr(input, "id", input_id_value = ctx[10].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler_2);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && input_id_value !== (input_id_value = ctx[10].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 2) {
        set_input_value(input, ctx[1].flagData[ctx[10].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block$2, "create_if_block$2");
function create_each_block$2(ctx) {
  let tr;
  let td;
  let label;
  let t0_value = ctx[10].label + "";
  let t0;
  let label_for_value;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let t7;
  let if_block0 = ctx[10].type == "numberInput" && create_if_block_5$1(ctx);
  let if_block1 = ctx[10].type == "checkbox" && create_if_block_4$1(ctx);
  let if_block2 = ctx[10].type == "dropdown" && create_if_block_3$2(ctx);
  let if_block3 = ctx[10].type == "textInput" && create_if_block_2$2(ctx);
  let if_block4 = ctx[10].type == "rangeInput" && create_if_block_1$2(ctx);
  let if_block5 = ctx[10].type == "colorPicker" && create_if_block$2(ctx);
  return {
    c() {
      tr = element("tr");
      td = element("td");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      if (if_block3)
        if_block3.c();
      t5 = space();
      if (if_block4)
        if_block4.c();
      t6 = space();
      if (if_block5)
        if_block5.c();
      t7 = space();
      attr(label, "for", label_for_value = ctx[10].flagName);
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td);
      append(td, label);
      append(label, t0);
      append(tr, t1);
      if (if_block0)
        if_block0.m(tr, null);
      append(tr, t2);
      if (if_block1)
        if_block1.m(tr, null);
      append(tr, t3);
      if (if_block2)
        if_block2.m(tr, null);
      append(tr, t4);
      if (if_block3)
        if_block3.m(tr, null);
      append(tr, t5);
      if (if_block4)
        if_block4.m(tr, null);
      append(tr, t6);
      if (if_block5)
        if_block5.m(tr, null);
      append(tr, t7);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t0_value !== (t0_value = ctx2[10].label + ""))
        set_data(t0, t0_value);
      if (dirty & 2 && label_for_value !== (label_for_value = ctx2[10].flagName)) {
        attr(label, "for", label_for_value);
      }
      if (ctx2[10].type == "numberInput") {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_5$1(ctx2);
          if_block0.c();
          if_block0.m(tr, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[10].type == "checkbox") {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_4$1(ctx2);
          if_block1.c();
          if_block1.m(tr, t3);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (ctx2[10].type == "dropdown") {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_3$2(ctx2);
          if_block2.c();
          if_block2.m(tr, t4);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (ctx2[10].type == "textInput") {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_2$2(ctx2);
          if_block3.c();
          if_block3.m(tr, t5);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (ctx2[10].type == "rangeInput") {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
        } else {
          if_block4 = create_if_block_1$2(ctx2);
          if_block4.c();
          if_block4.m(tr, t6);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (ctx2[10].type == "colorPicker") {
        if (if_block5) {
          if_block5.p(ctx2, dirty);
        } else {
          if_block5 = create_if_block$2(ctx2);
          if_block5.c();
          if_block5.m(tr, t7);
        }
      } else if (if_block5) {
        if_block5.d(1);
        if_block5 = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      if (if_block5)
        if_block5.d();
    }
  };
}
__name(create_each_block$2, "create_each_block$2");
function create_fragment$3(ctx) {
  let table;
  let tbody;
  let each_value = ctx[1].settings.animOptions;
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  return {
    c() {
      table = element("table");
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      set_style(tbody, "border-top", "1pt solid black");
      set_style(tbody, "border-bottom", "1pt solid black");
      attr(table, "class", "ase-spell-settings-table");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2) {
        each_value = ctx2[1].settings.animOptions;
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(tbody, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(table);
      destroy_each(each_blocks, detaching);
    }
  };
}
__name(create_fragment$3, "create_fragment$3");
function instance$3($$self, $$props, $$invalidate) {
  let $spellStoreHost;
  let $spellEffect, $$unsubscribe_spellEffect = noop, $$subscribe_spellEffect = /* @__PURE__ */ __name(() => ($$unsubscribe_spellEffect(), $$unsubscribe_spellEffect = subscribe(spellEffect, ($$value) => $$invalidate(1, $spellEffect = $$value)), spellEffect), "$$subscribe_spellEffect");
  $$self.$$.on_destroy.push(() => $$unsubscribe_spellEffect());
  console.log("Anim Settings: ---------ENTERING ANIM SETTINGS COMPONENT--------");
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(3, $spellStoreHost = value));
  let spellEffect = $spellStoreHost;
  $$subscribe_spellEffect();
  function input_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler, "input_input_handler");
  function input_change_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.checked;
    spellEffect.set($spellEffect);
  }
  __name(input_change_handler, "input_change_handler");
  function select_change_handler(setting) {
    $spellEffect.flagData[setting.flagName] = select_value(this);
    spellEffect.set($spellEffect);
  }
  __name(select_change_handler, "select_change_handler");
  function input_input_handler_1(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  function input_change_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = to_number(this.value);
    spellEffect.set($spellEffect);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  function input_input_handler_2(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler_2, "input_input_handler_2");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 8) {
      $$subscribe_spellEffect($$invalidate(0, spellEffect = $spellStoreHost));
    }
    if ($$self.$$.dirty & 1) {
      console.log("Anim Settings: spellEffect", spellEffect);
    }
  };
  return [
    spellEffect,
    $spellEffect,
    spellStoreHost,
    $spellStoreHost,
    input_input_handler,
    input_change_handler,
    select_change_handler,
    input_input_handler_1,
    input_change_input_handler,
    input_input_handler_2
  ];
}
__name(instance$3, "instance$3");
class AnimSettings extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
  }
}
__name(AnimSettings, "AnimSettings");
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[14] = list;
  child_ctx[15] = i;
  return child_ctx;
}
__name(get_each_context$1, "get_each_context$1");
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
__name(get_each_context_1, "get_each_context_1");
function create_if_block_5(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler() {
    ctx[6].call(input, ctx[13]);
  }
  __name(input_input_handler, "input_input_handler");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 4 && input.value !== ctx[2].flagData[ctx[13].flagName]) {
        set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_5, "create_if_block_5");
function create_if_block_4(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_handler() {
    ctx[7].call(input, ctx[13]);
  }
  __name(input_change_handler, "input_change_handler");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "checkbox");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      input.checked = ctx[2].flagData[ctx[13].flagName];
      if (!mounted) {
        dispose = listen(input, "change", input_change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 4) {
        input.checked = ctx[2].flagData[ctx[13].flagName];
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_4, "create_if_block_4");
function create_if_block_3$1(ctx) {
  let td;
  let select;
  let select_id_value;
  let mounted;
  let dispose;
  let each_value_1 = ctx[13].options;
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  function select_change_handler() {
    ctx[8].call(select, ctx[13]);
  }
  __name(select_change_handler, "select_change_handler");
  return {
    c() {
      td = element("td");
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select, "id", select_id_value = ctx[13].flagName);
      if (ctx[2].flagData[ctx[13].flagName] === void 0)
        add_render_callback(select_change_handler);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, select);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select, null);
      }
      select_option(select, ctx[2].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(select, "change", select_change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4) {
        each_value_1 = ctx[13].options;
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if (dirty & 4 && select_id_value !== (select_id_value = ctx[13].flagName)) {
        attr(select, "id", select_id_value);
      }
      if (dirty & 4) {
        select_option(select, ctx[2].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_3$1, "create_if_block_3$1");
function create_each_block_1(ctx) {
  let option;
  let t_value = Object.values(ctx[16])[0] + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = Object.keys(ctx[16])[0];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 4 && t_value !== (t_value = Object.values(ctx2[16])[0] + ""))
        set_data(t, t_value);
      if (dirty & 4 && option_value_value !== (option_value_value = Object.keys(ctx2[16])[0])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
__name(create_each_block_1, "create_each_block_1");
function create_if_block_2$1(ctx) {
  let td;
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_input_handler_1() {
    ctx[9].call(input, ctx[13]);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  return {
    c() {
      td = element("td");
      input = element("input");
      attr(input, "type", "text");
      attr(input, "id", input_id_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, input);
      set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = listen(input, "input", input_input_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 4 && input.value !== ctx[2].flagData[ctx[13].flagName]) {
        set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      dispose();
    }
  };
}
__name(create_if_block_2$1, "create_if_block_2$1");
function create_if_block_1$1(ctx) {
  let td;
  let output;
  let t0_value = ctx[2].flagData[ctx[13].flagName] + "";
  let t0;
  let t1;
  let input;
  let input_min_value;
  let input_max_value;
  let input_step_value;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_input_handler() {
    ctx[10].call(input, ctx[13]);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  return {
    c() {
      td = element("td");
      output = element("output");
      t0 = text(t0_value);
      t1 = space();
      input = element("input");
      set_style(output, "font-weight", "bold");
      attr(input, "type", "range");
      attr(input, "min", input_min_value = ctx[13].min);
      attr(input, "max", input_max_value = ctx[13].max);
      attr(input, "step", input_step_value = ctx[13].step);
      attr(input, "oninput", "this.previousElementSibling.value = this.value");
      attr(input, "id", input_id_value = ctx[13].flagName);
      attr(td, "colspan", "2");
    },
    m(target, anchor) {
      insert(target, td, anchor);
      append(td, output);
      append(output, t0);
      append(td, t1);
      append(td, input);
      set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_input_handler),
          listen(input, "input", input_change_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && t0_value !== (t0_value = ctx[2].flagData[ctx[13].flagName] + ""))
        set_data(t0, t0_value);
      if (dirty & 4 && input_min_value !== (input_min_value = ctx[13].min)) {
        attr(input, "min", input_min_value);
      }
      if (dirty & 4 && input_max_value !== (input_max_value = ctx[13].max)) {
        attr(input, "max", input_max_value);
      }
      if (dirty & 4 && input_step_value !== (input_step_value = ctx[13].step)) {
        attr(input, "step", input_step_value);
      }
      if (dirty & 4 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 4) {
        set_input_value(input, ctx[2].flagData[ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_if_block_1$1, "create_if_block_1$1");
function create_if_block$1(ctx) {
  let td0;
  let input;
  let input_id_value;
  let t;
  let td1;
  let button;
  let mounted;
  let dispose;
  function input_input_handler_2() {
    ctx[11].call(input, ctx[13]);
  }
  __name(input_input_handler_2, "input_input_handler_2");
  function click_handler() {
    return ctx[12](ctx[13]);
  }
  __name(click_handler, "click_handler");
  return {
    c() {
      td0 = element("td");
      input = element("input");
      t = space();
      td1 = element("td");
      button = element("button");
      button.innerHTML = `<i class="fas fa-music fa-sm"></i>`;
      attr(input, "type", "text");
      attr(input, "class", "files");
      attr(input, "id", input_id_value = ctx[13].flagName);
      attr(button, "class", "file-picker");
      attr(button, "title", "Browse Files");
    },
    m(target, anchor) {
      insert(target, td0, anchor);
      append(td0, input);
      set_input_value(input, ctx[0][ctx[13].flagName]);
      insert(target, t, anchor);
      insert(target, td1, anchor);
      append(td1, button);
      if (!mounted) {
        dispose = [
          listen(input, "input", input_input_handler_2),
          listen(button, "click", prevent_default(click_handler))
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 4 && input_id_value !== (input_id_value = ctx[13].flagName)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & 5 && input.value !== ctx[0][ctx[13].flagName]) {
        set_input_value(input, ctx[0][ctx[13].flagName]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(td0);
      if (detaching)
        detach(t);
      if (detaching)
        detach(td1);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_if_block$1, "create_if_block$1");
function create_each_block$1(ctx) {
  let tr;
  let td;
  let label;
  let t0_value = ctx[13].label + "";
  let t0;
  let label_for_value;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let t7;
  let if_block0 = ctx[13].type == "numberInput" && create_if_block_5(ctx);
  let if_block1 = ctx[13].type == "checkbox" && create_if_block_4(ctx);
  let if_block2 = ctx[13].type == "dropdown" && create_if_block_3$1(ctx);
  let if_block3 = ctx[13].type == "textInput" && create_if_block_2$1(ctx);
  let if_block4 = ctx[13].type == "rangeInput" && create_if_block_1$1(ctx);
  let if_block5 = ctx[13].type == "fileInput" && create_if_block$1(ctx);
  return {
    c() {
      tr = element("tr");
      td = element("td");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      if (if_block0)
        if_block0.c();
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      if (if_block3)
        if_block3.c();
      t5 = space();
      if (if_block4)
        if_block4.c();
      t6 = space();
      if (if_block5)
        if_block5.c();
      t7 = space();
      attr(label, "for", label_for_value = ctx[13].flagName);
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td);
      append(td, label);
      append(label, t0);
      append(tr, t1);
      if (if_block0)
        if_block0.m(tr, null);
      append(tr, t2);
      if (if_block1)
        if_block1.m(tr, null);
      append(tr, t3);
      if (if_block2)
        if_block2.m(tr, null);
      append(tr, t4);
      if (if_block3)
        if_block3.m(tr, null);
      append(tr, t5);
      if (if_block4)
        if_block4.m(tr, null);
      append(tr, t6);
      if (if_block5)
        if_block5.m(tr, null);
      append(tr, t7);
    },
    p(ctx2, dirty) {
      if (dirty & 4 && t0_value !== (t0_value = ctx2[13].label + ""))
        set_data(t0, t0_value);
      if (dirty & 4 && label_for_value !== (label_for_value = ctx2[13].flagName)) {
        attr(label, "for", label_for_value);
      }
      if (ctx2[13].type == "numberInput") {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_5(ctx2);
          if_block0.c();
          if_block0.m(tr, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[13].type == "checkbox") {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_4(ctx2);
          if_block1.c();
          if_block1.m(tr, t3);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (ctx2[13].type == "dropdown") {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_3$1(ctx2);
          if_block2.c();
          if_block2.m(tr, t4);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (ctx2[13].type == "textInput") {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_2$1(ctx2);
          if_block3.c();
          if_block3.m(tr, t5);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (ctx2[13].type == "rangeInput") {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
        } else {
          if_block4 = create_if_block_1$1(ctx2);
          if_block4.c();
          if_block4.m(tr, t6);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (ctx2[13].type == "fileInput") {
        if (if_block5) {
          if_block5.p(ctx2, dirty);
        } else {
          if_block5 = create_if_block$1(ctx2);
          if_block5.c();
          if_block5.m(tr, t7);
        }
      } else if (if_block5) {
        if_block5.d(1);
        if_block5 = null;
      }
    },
    d(detaching) {
      if (detaching)
        detach(tr);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      if (if_block5)
        if_block5.d();
    }
  };
}
__name(create_each_block$1, "create_each_block$1");
function create_fragment$2(ctx) {
  let table;
  let tbody;
  let each_value = ctx[2].settings.soundOptions;
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      table = element("table");
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      set_style(tbody, "border-top", "1pt solid black");
      set_style(tbody, "border-bottom", "1pt solid black");
      attr(table, "class", "ase-spell-settings-table");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(tbody, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 21) {
        each_value = ctx2[2].settings.soundOptions;
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(tbody, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(table);
      destroy_each(each_blocks, detaching);
    }
  };
}
__name(create_fragment$2, "create_fragment$2");
function instance$2($$self, $$props, $$invalidate) {
  let $spellEffect, $$unsubscribe_spellEffect = noop, $$subscribe_spellEffect = /* @__PURE__ */ __name(() => ($$unsubscribe_spellEffect(), $$unsubscribe_spellEffect = subscribe(spellEffect, ($$value) => $$invalidate(2, $spellEffect = $$value)), spellEffect), "$$subscribe_spellEffect");
  let $spellStoreHost;
  $$self.$$.on_destroy.push(() => $$unsubscribe_spellEffect());
  console.log("Sound Settings: -------ENTERING SOUND SETTINGS COMPONENT-----");
  const spellStoreHost = getContext("spellStoreHost");
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(5, $spellStoreHost = value));
  let spellEffect = $spellStoreHost;
  $$subscribe_spellEffect();
  console.log("Sound Settings: spellEffect: ", $spellEffect);
  let soundPaths = {};
  $spellEffect.settings.soundOptions.forEach((soundOption) => {
    if (soundOption.type == "fileInput") {
      $$invalidate(0, soundPaths[soundOption.flagName] = $spellEffect.flagData[soundOption.flagName], soundPaths);
    }
  });
  async function selectFile(setting) {
    const current = $spellEffect.flagData[setting.flagName] ?? "";
    const picker = new FilePicker({
      type: "audio",
      current,
      callback: (path) => {
        $$invalidate(0, soundPaths[setting.flagName] = path, soundPaths);
      }
    });
    await picker.browse(current);
  }
  __name(selectFile, "selectFile");
  function input_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler, "input_input_handler");
  function input_change_handler(setting) {
    $spellEffect.flagData[setting.flagName] = this.checked;
    spellEffect.set($spellEffect);
  }
  __name(input_change_handler, "input_change_handler");
  function select_change_handler(setting) {
    $spellEffect.flagData[setting.flagName] = select_value(this);
    spellEffect.set($spellEffect);
  }
  __name(select_change_handler, "select_change_handler");
  function input_input_handler_1(setting) {
    $spellEffect.flagData[setting.flagName] = this.value;
    spellEffect.set($spellEffect);
  }
  __name(input_input_handler_1, "input_input_handler_1");
  function input_change_input_handler(setting) {
    $spellEffect.flagData[setting.flagName] = to_number(this.value);
    spellEffect.set($spellEffect);
  }
  __name(input_change_input_handler, "input_change_input_handler");
  function input_input_handler_2(setting) {
    soundPaths[setting.flagName] = this.value;
    $$invalidate(0, soundPaths);
  }
  __name(input_input_handler_2, "input_input_handler_2");
  const click_handler = /* @__PURE__ */ __name((setting) => selectFile(setting), "click_handler");
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $$subscribe_spellEffect($$invalidate(1, spellEffect = $spellStoreHost));
    }
    if ($$self.$$.dirty & 1) {
      {
        for (let flagName in soundPaths) {
          set_store_value(spellEffect, $spellEffect.flagData[flagName] = soundPaths[flagName], $spellEffect);
        }
      }
    }
  };
  return [
    soundPaths,
    spellEffect,
    $spellEffect,
    spellStoreHost,
    selectFile,
    $spellStoreHost,
    input_input_handler,
    input_change_handler,
    select_change_handler,
    input_input_handler_1,
    input_change_input_handler,
    input_input_handler_2,
    click_handler
  ];
}
__name(instance$2, "instance$2");
class SoundSettings extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
  }
}
__name(SoundSettings, "SoundSettings");
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
__name(get_each_context, "get_each_context");
function create_each_block(ctx) {
  let button;
  let div;
  let i;
  let i_class_value;
  let t;
  let button_class_value;
  let button_title_value;
  let button_id_value;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[7]);
  }
  __name(click_handler, "click_handler");
  return {
    c() {
      button = element("button");
      div = element("div");
      i = element("i");
      t = space();
      attr(i, "class", i_class_value = ctx[7].icon);
      set_style(div, "text-align", "center");
      attr(button, "class", button_class_value = ctx[7].class + " " + (ctx[7].selected ? "selected" : ""));
      attr(button, "type", "button");
      attr(button, "title", button_title_value = ctx[7].title);
      attr(button, "id", button_id_value = ctx[7].name);
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, div);
      append(div, i);
      append(button, t);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
__name(create_each_block, "create_each_block");
function create_fragment$1(ctx) {
  let div1;
  let div0;
  let each_value = ctx[0];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div0, "class", "ase-settings-tabs");
      attr(div1, "class", "ase-shared-settings");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div0, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 3) {
        each_value = ctx2[0];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div0, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div1);
      destroy_each(each_blocks, detaching);
    }
  };
}
__name(create_fragment$1, "create_fragment$1");
function instance$1($$self, $$props, $$invalidate) {
  let { currentTab } = $$props;
  console.log("----------------------ENTERING NAV BAR COMPONENT----------------------");
  let SpellSettingsButtonTitleLabel = game.i18n.localize("ASE.SpellSettingsButtonTitle");
  let AnimationSettingsButtonTitleLabel = game.i18n.localize("ASE.AnimationSettingsButtonTitle");
  let SoundSettingsButtonTitleLabel = game.i18n.localize("ASE.SoundSettingsButtonTitle");
  const navTabs = [
    {
      name: "Spell Settings",
      title: SpellSettingsButtonTitleLabel,
      class: "nav-tab ase-spell-settingsButton",
      id: SpellSettings,
      icon: "fas fa-cog",
      selected: true
    },
    {
      name: "Anim Settings",
      title: AnimationSettingsButtonTitleLabel,
      class: "nav-tab ase-anim-settingsButton",
      id: AnimSettings,
      icon: "fas fa-magic",
      selected: false
    },
    {
      name: "Sound Settings",
      title: SoundSettingsButtonTitleLabel,
      class: "nav-tab ase-sound-settingsButton",
      id: SoundSettings,
      icon: "fas fa-volume-up",
      selected: false
    }
  ];
  function switchTab(tab) {
    $$invalidate(2, currentTab = tab.id);
    navTabs.forEach(function(navTab) {
      let button = document.getElementById(navTab.name);
      if (navTab.name == tab.name && navTab.selected == false) {
        navTab.selected = true;
        button.classList.add("selected");
      } else {
        navTab.selected = false;
        button.classList.remove("selected");
      }
    });
  }
  __name(switchTab, "switchTab");
  const click_handler = /* @__PURE__ */ __name(function(tab) {
    switchTab(tab);
  }, "click_handler");
  $$self.$$set = ($$props2) => {
    if ("currentTab" in $$props2)
      $$invalidate(2, currentTab = $$props2.currentTab);
  };
  return [navTabs, switchTab, currentTab, click_handler];
}
__name(instance$1, "instance$1");
class NavBar extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { currentTab: 2 });
  }
}
__name(NavBar, "NavBar");
function create_if_block(ctx) {
  let sharedsettings;
  let t0;
  let navbar;
  let updating_currentTab;
  let t1;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  sharedsettings = new SharedSettings({
    props: { itemName: ctx[1].name }
  });
  function navbar_currentTab_binding(value) {
    ctx[12](value);
  }
  __name(navbar_currentTab_binding, "navbar_currentTab_binding");
  let navbar_props = {};
  if (ctx[4] !== void 0) {
    navbar_props.currentTab = ctx[4];
  }
  navbar = new NavBar({ props: navbar_props });
  binding_callbacks.push(() => bind(navbar, "currentTab", navbar_currentTab_binding));
  const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[4] == SpellSettings)
      return 0;
    if (ctx2[4] == AnimSettings)
      return 1;
    if (ctx2[4] == SoundSettings)
      return 2;
    return -1;
  }
  __name(select_block_type, "select_block_type");
  if (~(current_block_type_index = select_block_type(ctx))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      create_component(sharedsettings.$$.fragment);
      t0 = space();
      create_component(navbar.$$.fragment);
      t1 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      mount_component(sharedsettings, target, anchor);
      insert(target, t0, anchor);
      mount_component(navbar, target, anchor);
      insert(target, t1, anchor);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(target, anchor);
      }
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const sharedsettings_changes = {};
      if (dirty & 2)
        sharedsettings_changes.itemName = ctx2[1].name;
      sharedsettings.$set(sharedsettings_changes);
      const navbar_changes = {};
      if (!updating_currentTab && dirty & 16) {
        updating_currentTab = true;
        navbar_changes.currentTab = ctx2[4];
        add_flush_callback(() => updating_currentTab = false);
      }
      navbar.$set(navbar_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index !== previous_block_index) {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        } else {
          if_block = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(sharedsettings.$$.fragment, local);
      transition_in(navbar.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(sharedsettings.$$.fragment, local);
      transition_out(navbar.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      destroy_component(sharedsettings, detaching);
      if (detaching)
        detach(t0);
      destroy_component(navbar, detaching);
      if (detaching)
        detach(t1);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d(detaching);
      }
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
__name(create_if_block, "create_if_block");
function create_if_block_3(ctx) {
  let soundsettings;
  let current;
  soundsettings = new SoundSettings({});
  return {
    c() {
      create_component(soundsettings.$$.fragment);
    },
    m(target, anchor) {
      mount_component(soundsettings, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(soundsettings.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(soundsettings.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(soundsettings, detaching);
    }
  };
}
__name(create_if_block_3, "create_if_block_3");
function create_if_block_2(ctx) {
  let animsettings;
  let current;
  animsettings = new AnimSettings({});
  return {
    c() {
      create_component(animsettings.$$.fragment);
    },
    m(target, anchor) {
      mount_component(animsettings, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(animsettings.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(animsettings.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(animsettings, detaching);
    }
  };
}
__name(create_if_block_2, "create_if_block_2");
function create_if_block_1(ctx) {
  let spellsettings;
  let current;
  spellsettings = new SpellSettings({});
  return {
    c() {
      create_component(spellsettings.$$.fragment);
    },
    m(target, anchor) {
      mount_component(spellsettings, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(spellsettings.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(spellsettings.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(spellsettings, detaching);
    }
  };
}
__name(create_if_block_1, "create_if_block_1");
function create_default_slot(ctx) {
  let form_1;
  let div0;
  let enablease;
  let updating_enableASE;
  let t0;
  let t1;
  let div3;
  let div2;
  let div1;
  let button;
  let current;
  let mounted;
  let dispose;
  function enablease_enableASE_binding(value) {
    ctx[11](value);
  }
  __name(enablease_enableASE_binding, "enablease_enableASE_binding");
  let enablease_props = {};
  if (ctx[2] !== void 0) {
    enablease_props.enableASE = ctx[2];
  }
  enablease = new EnableASE({ props: enablease_props });
  binding_callbacks.push(() => bind(enablease, "enableASE", enablease_enableASE_binding));
  let if_block = ctx[2] && create_if_block(ctx);
  return {
    c() {
      form_1 = element("form");
      div0 = element("div");
      create_component(enablease.$$.fragment);
      t0 = space();
      if (if_block)
        if_block.c();
      t1 = space();
      div3 = element("div");
      div2 = element("div");
      div1 = element("div");
      button = element("button");
      button.textContent = `${localize("ASE.SaveCloseButtonLabel")}`;
      attr(div0, "class", "ase-settings-section");
      attr(button, "class", "footer-button");
      attr(div1, "class", "flexcol");
      set_style(div1, "grid-row", "1/2");
      set_style(div1, "grid-column", "2/3");
      attr(div2, "class", "ase-submit");
      attr(div3, "class", "aseBottomSection");
      set_style(div3, "margin-bottom", "5px");
      attr(form_1, "autocomplete", "off");
      attr(form_1, "id", "ase-settings");
      attr(form_1, "class", "overview");
    },
    m(target, anchor) {
      insert(target, form_1, anchor);
      append(form_1, div0);
      mount_component(enablease, div0, null);
      append(div0, t0);
      if (if_block)
        if_block.m(div0, null);
      append(form_1, t1);
      append(form_1, div3);
      append(div3, div2);
      append(div2, div1);
      append(div1, button);
      ctx[13](form_1);
      current = true;
      if (!mounted) {
        dispose = [
          listen(button, "click", prevent_default(ctx[7])),
          listen(form_1, "submit", prevent_default(ctx[10]))
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      const enablease_changes = {};
      if (!updating_enableASE && dirty & 4) {
        updating_enableASE = true;
        enablease_changes.enableASE = ctx2[2];
        add_flush_callback(() => updating_enableASE = false);
      }
      enablease.$set(enablease_changes);
      if (ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div0, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(enablease.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(enablease.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(form_1);
      destroy_component(enablease);
      if (if_block)
        if_block.d();
      ctx[13](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_default_slot, "create_default_slot");
function create_fragment(ctx) {
  let applicationshell;
  let updating_elementRoot;
  let current;
  function applicationshell_elementRoot_binding(value) {
    ctx[14](value);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  let applicationshell_props = {
    $$slots: { default: [create_default_slot] },
    $$scope: { ctx }
  };
  if (ctx[0] !== void 0) {
    applicationshell_props.elementRoot = ctx[0];
  }
  applicationshell = new ApplicationShell({ props: applicationshell_props });
  binding_callbacks.push(() => bind(applicationshell, "elementRoot", applicationshell_elementRoot_binding));
  return {
    c() {
      create_component(applicationshell.$$.fragment);
    },
    m(target, anchor) {
      mount_component(applicationshell, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const applicationshell_changes = {};
      if (dirty & 524318) {
        applicationshell_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_elementRoot && dirty & 1) {
        updating_elementRoot = true;
        applicationshell_changes.elementRoot = ctx2[0];
        add_flush_callback(() => updating_elementRoot = false);
      }
      applicationshell.$set(applicationshell_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(applicationshell.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(applicationshell.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(applicationshell, detaching);
    }
  };
}
__name(create_fragment, "create_fragment");
function instance($$self, $$props, $$invalidate) {
  let $currentSpell, $$unsubscribe_currentSpell = noop, $$subscribe_currentSpell = /* @__PURE__ */ __name(() => ($$unsubscribe_currentSpell(), $$unsubscribe_currentSpell = subscribe(currentSpell, ($$value) => $$invalidate(17, $currentSpell = $$value)), currentSpell), "$$subscribe_currentSpell");
  let $spellStoreHost;
  $$self.$$.on_destroy.push(() => $$unsubscribe_currentSpell());
  let { elementRoot } = $$props;
  let { item } = $$props;
  let { itemFlags } = $$props;
  const flags = { ...itemFlags.advancedspelleffects };
  const { application } = getContext("external");
  let form = void 0;
  const spellStoreHost = writable(void 0);
  component_subscribe($$self, spellStoreHost, (value) => $$invalidate(9, $spellStoreHost = value));
  setContext("spellStoreHost", spellStoreHost);
  let blankItem = true;
  let enableASE = flags.enableASE ?? false;
  let currentTab = SpellSettings;
  if (flags) {
    blankItem = false;
  }
  set_store_value(spellStoreHost, $spellStoreHost = spellStore.findEntry((x) => x.name === flags.spellEffect) ?? spellStore.first, $spellStoreHost);
  let currentSpell = $spellStoreHost;
  $$subscribe_currentSpell();
  if (!blankItem && flags.spellEffect == $currentSpell.name && flags.effectOptions) {
    if (flags.effectOptions.allowInitialMidiCall == void 0) {
      if (currentSpell.settings.allowInitialMidiCall != void 0) {
        flags.effectOptions.allowInitialMidiCall = currentSpell.settings.allowInitialMidiCall;
      } else {
        flags.effectOptions.allowInitialMidiCall = true;
      }
    }
    set_store_value(currentSpell, $currentSpell.flagData = flags.effectOptions, $currentSpell);
  }
  if (flags.effectOptions?.summons?.length > 0) {
    set_store_value(currentSpell, $currentSpell.settings.summons = flags.effectOptions.summons, $currentSpell);
  }
  console.log("App Shell: ------------------- Entering App Shell ---------------------");
  console.log("App Shell: Spell Store: ", spellStore);
  console.log("App Shell: item: ", item);
  console.log("App Shell: flags: ", flags);
  console.log("App Shell: blankItem: ", blankItem);
  console.log("App Shell: currentSpell: ", $currentSpell);
  async function closeApp() {
    let flagData = {};
    if (enableASE) {
      flagData = {
        enableASE,
        spellEffect: $currentSpell.name,
        effectOptions: $currentSpell.flagData
      };
      console.log("App Shell: FlagData Updating: ", flagData);
      const updatedFlags = {
        data: {
          flags: { advancedspelleffects: flagData }
        }
      };
      await item.unsetFlag("advancedspelleffects", "effectOptions");
      await item.update(updatedFlags.data);
    } else {
      for (let f in itemFlags.advancedspelleffects) {
        item.unsetFlag(`advancedspelleffects`, f);
      }
    }
    application.close();
  }
  __name(closeApp, "closeApp");
  onDestroy(async () => {
    console.log("the component is being destroyed...");
    spellStore.reInit();
  });
  function submit_handler(event) {
    bubble.call(this, $$self, event);
  }
  __name(submit_handler, "submit_handler");
  function enablease_enableASE_binding(value) {
    enableASE = value;
    $$invalidate(2, enableASE);
  }
  __name(enablease_enableASE_binding, "enablease_enableASE_binding");
  function navbar_currentTab_binding(value) {
    currentTab = value;
    $$invalidate(4, currentTab);
  }
  __name(navbar_currentTab_binding, "navbar_currentTab_binding");
  function form_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      form = $$value;
      $$invalidate(3, form);
    });
  }
  __name(form_1_binding, "form_1_binding");
  function applicationshell_elementRoot_binding(value) {
    elementRoot = value;
    $$invalidate(0, elementRoot);
  }
  __name(applicationshell_elementRoot_binding, "applicationshell_elementRoot_binding");
  $$self.$$set = ($$props2) => {
    if ("elementRoot" in $$props2)
      $$invalidate(0, elementRoot = $$props2.elementRoot);
    if ("item" in $$props2)
      $$invalidate(1, item = $$props2.item);
    if ("itemFlags" in $$props2)
      $$invalidate(8, itemFlags = $$props2.itemFlags);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 512) {
      $$subscribe_currentSpell($$invalidate(5, currentSpell = $spellStoreHost));
    }
    if ($$self.$$.dirty & 4) {
      console.log(`App Shell: ${enableASE ? "Enabled" : "Disabled"} ASE`);
    }
    if ($$self.$$.dirty & 512) {
      console.log(`App Shell: Spell Store Host: `, $spellStoreHost);
    }
  };
  return [
    elementRoot,
    item,
    enableASE,
    form,
    currentTab,
    currentSpell,
    spellStoreHost,
    closeApp,
    itemFlags,
    $spellStoreHost,
    submit_handler,
    enablease_enableASE_binding,
    navbar_currentTab_binding,
    form_1_binding,
    applicationshell_elementRoot_binding
  ];
}
__name(instance, "instance");
class ASESettingsAppShell extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { elementRoot: 0, item: 1, itemFlags: 8 });
  }
  get elementRoot() {
    return this.$$.ctx[0];
  }
  set elementRoot(elementRoot) {
    this.$$set({ elementRoot });
    flush();
  }
  get item() {
    return this.$$.ctx[1];
  }
  set item(item) {
    this.$$set({ item });
    flush();
  }
  get itemFlags() {
    return this.$$.ctx[8];
  }
  set itemFlags(itemFlags) {
    this.$$set({ itemFlags });
    flush();
  }
}
__name(ASESettingsAppShell, "ASESettingsAppShell");
class ASESettings extends SvelteApplication {
  constructor(item) {
    super({
      title: `ASE Settings for ${item.name}`,
      id: `ase-item-settings`,
      zIndex: 102,
      svelte: {
        class: ASESettingsAppShell,
        target: document.body,
        props: {
          item,
          itemFlags: item.data.flags
        }
      }
    });
    console.log("ASE: Caught item sheet render hook!", item);
    console.log("Item Flags: ", item.data.flags);
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      resizable: true,
      minimizable: true,
      width: "auto",
      height: "auto",
      closeOnSubmit: true
    });
  }
}
__name(ASESettings, "ASESettings");
const versionMigration = {
  async handle(item) {
    let spellList = {};
    spellList[game.i18n.localize("ASE.AnimateDead")] = game.i18n.localize("ASE.AnimateDead");
    spellList[game.i18n.localize("ASE.CallLightning")] = game.i18n.localize("ASE.CallLightning");
    spellList[game.i18n.localize("ASE.DetectMagic")] = game.i18n.localize("ASE.DetectMagic");
    spellList[game.i18n.localize("ASE.FogCloud")] = game.i18n.localize("ASE.FogCloud");
    spellList[game.i18n.localize("ASE.Darkness")] = game.i18n.localize("ASE.Darkness");
    spellList[game.i18n.localize("ASE.MagicMissile")] = game.i18n.localize("ASE.MagicMissile");
    spellList[game.i18n.localize("ASE.SpiritualWeapon")] = game.i18n.localize("ASE.SpiritualWeapon");
    spellList[game.i18n.localize("ASE.SteelWindStrike")] = game.i18n.localize("ASE.SteelWindStrike");
    spellList[game.i18n.localize("ASE.ThunderStep")] = game.i18n.localize("ASE.ThunderStep");
    spellList[game.i18n.localize("ASE.WitchBolt")] = game.i18n.localize("ASE.WitchBolt");
    spellList[game.i18n.localize("ASE.ScorchingRay")] = game.i18n.localize("ASE.ScorchingRay");
    spellList[game.i18n.localize("ASE.EldritchBlast")] = game.i18n.localize("ASE.EldritchBlast");
    spellList[game.i18n.localize("ASE.VampiricTouch")] = game.i18n.localize("ASE.VampiricTouch");
    spellList[game.i18n.localize("ASE.Moonbeam")] = game.i18n.localize("ASE.Moonbeam");
    spellList[game.i18n.localize("ASE.ChainLightning")] = game.i18n.localize("ASE.ChainLightning");
    spellList[game.i18n.localize("ASE.MirrorImage")] = game.i18n.localize("ASE.MirrorImage");
    let flags = item?.data?.flags?.advancedspelleffects ?? false;
    console.log("flags", flags);
    if (!flags)
      return;
    if (!flags.enableASE)
      return;
    if (flags.effectOptions.tagOptions) {
      if (!Array.isArray(flags.effectOptions.tagOptions)) {
        let newTagOptions = [];
        for (let key in flags.effectOptions.tagOptions) {
          newTagOptions.push({ key: flags.effectOptions.tagOptions[key] });
        }
        await item.setFlag("advancedspelleffects", "effectOptions.tagOptions", newTagOptions);
      }
    }
    console.log("Done migrating flags for old spell...");
  }
};
class ASEHandler {
  static async handleASE(data, optionals = {}) {
    let item = data.item;
    await versionMigration.handle(item);
    let aseFlags = item?.data?.flags?.advancedspelleffects ?? false;
    if (!aseFlags.enableASE)
      return;
    let missingModule = checkModules();
    if (missingModule) {
      ui.notifications.error(missingModule);
      return;
    }
    switch (aseFlags.spellEffect) {
      case game.i18n.localize("ASE.Darkness"):
        await darkness.createDarkness(data);
        return;
      case game.i18n.localize("ASE.DetectMagic"):
        await detectMagic.activateDetectMagic(data);
        return;
      case game.i18n.localize("ASE.DetectStuff"):
        const detectSpell = new detectStuff(data);
        detectSpell.cast();
        return;
      case game.i18n.localize("ASE.CallLightning"):
        if (!data.flavor) {
          await callLightning.createStormCloud(data);
        }
        return;
      case game.i18n.localize("ASE.ChaosBolt"):
        if (!optionals.damInterrupt) {
          await chaosBolt.cast(data);
        } else if (optionals.damInterrupt) {
          let newData = await chaosBolt.damageInterrupt(data);
          return newData;
        }
        return;
      case game.i18n.localize("ASE.ActivateCallLightning"):
        let newTargets = await callLightning.getBoltTargets(aseFlags.effectOptions.stormTileId);
        return { targets: newTargets };
      case game.i18n.localize("ASE.FogCloud"):
        await fogCloud.createFogCloud(data);
        return;
      case game.i18n.localize("ASE.SpiritualWeapon"):
        await spiritualWeapon.createSpiritualWeapon(data);
        return;
      case game.i18n.localize("ASE.SpiritAttackItemName"):
        await spiritualWeapon.spiritualWeaponAttack(data);
        return;
      case game.i18n.localize("ASE.SteelWindStrike"):
        if (!data.flavor?.includes("Steel Wind Strike")) {
          await steelWindStrike.doStrike(data);
        }
        return;
      case game.i18n.localize("ASE.ThunderStep"):
        await thunderStep.doTeleport(data);
        return;
      case game.i18n.localize("ASE.AnimateDead"):
        await animateDead.rise(data);
        return;
      case game.i18n.localize("ASE.WitchBolt"):
        if (data.flavor != game.i18n.localize("ASE.WitchBoltDamageFlavor") || !data.flavor) {
          console.log("Casting Witch Bolt!", data.flavor);
          await witchBolt.cast(data);
        } else {
          console.log("Activating Witch Bolt!", data.flavor);
        }
        return;
      case game.i18n.localize("ASE.ActivateWitchBolt"):
        if (data.flavor != game.i18n.localize("ASE.WitchBoltDamageFlavor") || !data.flavor) {
          await witchBolt.activateBolt(data);
        }
        return;
      case game.i18n.localize("ASE.VampiricTouch"):
        await vampiricTouch.cast(data);
        return;
      case game.i18n.localize("ASE.VampiricTouchAttack"):
        await vampiricTouch.activateTouch(data);
        return;
      case game.i18n.localize("ASE.MagicMissile"):
        await magicMissile.selectTargets(data);
        return;
      case game.i18n.localize("ASE.ScorchingRay"):
        await scorchingRay.selectTargets(data);
        return;
      case game.i18n.localize("ASE.EldritchBlast"):
        await eldritchBlast.selectTargets(data);
        return;
      case game.i18n.localize("ASE.Moonbeam"):
        if (!data.flavor?.includes("- Damage Roll")) {
          await moonBeam.callBeam(data);
        }
        return;
      case game.i18n.localize("ASE.MoveMoonbeam"):
        await moonBeam.moveBeam(data);
        return;
      case game.i18n.localize("ASE.ChainLightning"):
        const chainLightningSpell = new chainLightning(data);
        chainLightningSpell.cast();
        return;
      case game.i18n.localize("ASE.MirrorImage"):
        const mirrorImageSpell = new mirrorImage(data);
        mirrorImageSpell.cast();
        return;
      case game.i18n.localize("ASE.WallOfForce"):
        wallOfForce.createWallOfForce(data);
        return;
      case game.i18n.localize("ASE.WallSpell"):
        if (!data.flavor?.includes("- Damage Roll")) {
          const newWallSpell = new wallSpell(data);
          newWallSpell.cast();
        }
        return;
      case game.i18n.localize("ASE.WallOfFire"):
        const fireWall = new wallOfFire(data);
        fireWall.cast();
        return;
      case game.i18n.localize("ASE.ViciousMockery"):
        const viciousMockerySpell = new viciousMockery(data);
        viciousMockerySpell.cast();
        return;
    }
    if (item.name.includes(game.i18n.localize("ASE.Summon")) || aseFlags.spellEffect.includes(game.i18n.localize("ASE.Summon"))) {
      await summonCreature.doSummon(data);
      return;
    } else {
      console.log("--SPELL NAME NOT RECOGNIZED--");
      return;
    }
  }
}
__name(ASEHandler, "ASEHandler");
class midiHandler {
  static registerHooks() {
    if (game.modules.get("midi-qol")?.active) {
      Hooks.on("midi-qol.preambleComplete", midiHandler._handleASEPreamble);
      Hooks.on("midi-qol.RollComplete", midiHandler._handleStateTransition);
      Hooks.on("midi-qol.preDamageRollComplete", midiHandler._damageRollComplete);
      Hooks.on("midi-qol.preCheckSaves", midiHandler._preCheckSaves);
    }
  }
  static _getPreItemRollInfo(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE ITEM ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static _getPreAttackRollInfo(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE ATTACK ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static async _getAttackRollCompleteInfo(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE ATTACK ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static async _getPreCheckHitsInfo(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE CHECK HITS: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static async _getPreDamageRollInfo(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static async _getPreDamageRollComplete(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
  }
  static async _damageRollComplete(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW -------- ", workflow);
    console.log(" --------  ASE: MIDI HANDLER: PRE DAMAGE ROLL COMPLETE: WORKFLOW TARGETS -------- ", workflow.targets);
    const itemUUID = workflow.itemUuid;
    const item = await fromUuid(itemUUID);
    const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
    const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
    const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
    const castStage = item.getFlag("advancedspelleffects", "castStage") ?? "";
    if (spellEffect && aseEnabled) {
      let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
      if (currentItemState) {
        if (currentItemState.options.damInterrupt) {
          console.log("ASE: MIDI HANDLER: Interrupting Damage Roll");
          let newData = await ASEHandler.handleASE(workflow, { damInterrupt: true });
          console.log("ASE: MIDI HANDLER: Interrupting Damage Roll New Data", newData);
          if (newData) {
            if (newData.newDamageType) {
              console.log("ASE: MIDI HANDLER: DAMAGE DETAIL: ", workflow.damageDetail);
              workflow.damageDetail[0].type = newData.newDamageType.toLowerCase();
              workflow.defaultDamageType = newData.newDamageType.toLowerCase();
            }
            if (newData.newTargets) {
              currentItemState.options.nextTargets = newData.newTargets;
            }
          }
          return true;
        }
      } else if (castItem && castStage == "preDamage") {
        ASEHandler.handleASE(workflow);
      }
    }
  }
  static async _preCheckSaves(workflow) {
    console.log(" --------  ASE: MIDI HANDLER: PRE CHECK SAVES: WORKFLOW -------- ", workflow);
    const itemUUID = workflow.itemUuid;
    const item = await fromUuid(itemUUID);
    const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
    const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
    const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
    const savesRequired = item.getFlag("advancedspelleffects", "savesRequired") ?? false;
    const targets = Array.from(workflow.targets) ?? [];
    if (spellEffect && aseEnabled && castItem && savesRequired) {
      console.log("ASE: MIDI HANDLER: Cast Item Found!", item);
      let newMidiData = await ASEHandler.handleASE(workflow);
      console.log("ASE: MIDI HANDLER: Cast Item Found! New Midi Data", newMidiData);
      if (!Array.isArray(targets))
        return true;
      if (targets.length == 0) {
        let newTargets = /* @__PURE__ */ new Set();
        newMidiData.targets.forEach((target) => {
          newTargets.add(target);
        });
        console.log("ASE: MIDI HANDLER: Cast Item Found! New Targets", newTargets);
        workflow.targets = newTargets;
        workflow.hitTargets = newTargets;
        workflow.failedSaves = newTargets;
        console.log("ASE: MIDI HANDLER: Cast Item Found! New Workflow", workflow);
      }
      return true;
    } else {
      return true;
    }
  }
  static async _handleASEPreamble(workflow) {
    console.log("ASE: MIDI HANDLER: PREAMBLE: ", workflow);
    console.log(" --------  ASE: MIDI HANDLER: PREAMBLE: WORKFLOW TARGETS -------- ", workflow.optionalTestField);
    const itemUUID = workflow.itemUuid;
    const item = await fromUuid(itemUUID);
    const spellEffect = item.getFlag("advancedspelleffects", "spellEffect");
    const aseEnabled = item.getFlag("advancedspelleffects", "enableASE") ?? false;
    const castItem = item.getFlag("advancedspelleffects", "castItem") ?? false;
    const castStage = item.getFlag("advancedspelleffects", "castStage") ?? "";
    const savesRequired = item.getFlag("advancedspelleffects", "savesRequired") ?? false;
    const allowInitialMidiCall = item.getFlag("advancedspelleffects", "effectOptions.allowInitialMidiCall") ?? true;
    console.log("ASE: MIDI HANDLER: PREAMBLE: Allow Initial Midi Call", allowInitialMidiCall);
    console.log("ASE: MIDI HANDLER: PREAMBLE: Cast Item", castItem);
    console.log("ASE: MIDI HANDLER: PREAMBLE: ASE Enabled", aseEnabled);
    console.log("ASE: MIDI HANDLER: PREAMBLE: Spell Effect", spellEffect);
    if (spellEffect && aseEnabled && !(castItem && savesRequired)) {
      let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
      if (currentItemState) {
        console.log("ASE: MIDI HANDLER: Item State Found!", currentItemState.state);
        console.log("ASE: MIDI HANDLER: STATE ACTIVE?", currentItemState.active);
        console.log("ASE: MIDI HANDLER: STATE FINISHED?", currentItemState.finished);
        if (!castItem) {
          console.log("ASE: MIDI HANDLER: PREAMBLE: NOT CAST ITEM!");
          if (currentItemState.active && !currentItemState.finished) {
            return true;
          } else {
            return false;
          }
        } else {
          console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM!");
          if (currentItemState.active && !currentItemState.finished) {
            console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM! STATE ACTIVE!");
            return true;
          } else {
            console.log("ASE: MIDI HANDLER: PREAMBLE: CAST ITEM! STATE NOT ACTIVE!");
            ASEHandler.handleASE(workflow);
            if (allowInitialMidiCall) {
              return true;
            } else {
              return false;
            }
          }
        }
      } else {
        console.log("ASE: MIDI HANDLER: Item State Not Found!");
        if (castStage != "preDamage") {
          ASEHandler.handleASE(workflow);
        }
        if (allowInitialMidiCall) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return true;
    }
  }
  static async _handleStateTransition(workflow) {
    console.log("ASE: MIDI HANDLER: STATE TRANSITION: WORKFLOW", workflow);
    const itemUUID = workflow.itemUuid;
    const caster2 = workflow.token.document.id;
    const hitTargets = Array.from(workflow.hitTargets);
    let stateOptions = {};
    const targets = Array.from(workflow.targets);
    let targetUuid = "";
    let target;
    let iterateListKey = "";
    let currStateIndex = 0;
    let currentItemState = game.ASESpellStateManager.getSpell(itemUUID);
    console.log("ASE: MIDI HANDLER: STATE TRANSITION: CURRENT ITEM STATE", currentItemState);
    if (!currentItemState) {
      return;
    }
    if (currentItemState.active && !currentItemState.finished && currentItemState.options.iterate) {
      console.log("ASE: MIDI HANDLER: STATE TRANSITION: ITERATE...");
      if (!targets || targets.length == 0) {
        iterateListKey = currentItemState.options.iterate;
        currStateIndex = currentItemState.state - 1;
        targetUuid = currentItemState.options[iterateListKey][currStateIndex];
        target = await fromUuid(targetUuid);
      } else {
        target = targets[0];
      }
      if (currentItemState.options.sequenceBuilder) {
        game.ASESpellStateManager.continueSequence(itemUUID, { intro: false, caster: caster2, targets: [target], hit: !workflow.attackRoll ? true : hitTargets.length > 0, effectOptions: currentItemState.options.effectOptions, type: "missile" });
      }
      if (currentItemState.options.rolls) {
        stateOptions.rolls = { attackRoll: workflow.attackRoll, damageRoll: workflow.damageRoll, target, hit: hitTargets.length > 0 };
      }
      game.ASESpellStateManager.nextState(itemUUID, stateOptions);
      return;
    } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.targetted) {
      console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETTED...");
      if (!currentItemState.options.repeat) {
        stateOptions.finished = true;
      }
      if (currentItemState.options.failedSaves) {
        stateOptions.failedSaves = [];
        workflow.failedSaves.forEach((target2) => {
          stateOptions.failedSaves.push(target2.document.uuid);
        });
      }
      game.ASESpellStateManager.nextState(itemUUID, stateOptions);
    } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.repeat && currentItemState.options.nextTargets) {
      console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT...");
      game.ASESpellStateManager.nextState(itemUUID, { targets: currentItemState.options.nextTargets });
    } else if (currentItemState.active && !currentItemState.finished && currentItemState.options.castItem) {
      console.log("ASE: MIDI HANDLER: STATE TRANSITION: CAST ITEM...");
      currentItemState.finished = true;
      game.ASESpellStateManager.removeSpell(itemUUID);
    }
    console.log("ASE: MIDI HANDLER: STATE TRANSITION: FINISHED");
  }
}
__name(midiHandler, "midiHandler");
class noMidiHandler {
  static registerHooks() {
    if (!game.modules.get("midi-qol")?.active) {
      Hooks.on("preCreateChatMessage", noMidiHandler._handleASE);
    }
  }
  static async _handleASE(msg) {
    let caster2 = canvas.tokens.get(msg.data.speaker.token);
    let casterActor = caster2?.actor;
    let spellItem;
    if (msg.data?.flags?.betterrolls5e) {
      console.log("Detected Better Rolls...");
      spellItem = casterActor?.items?.get(msg.data.flags.betterrolls5e.itemId);
    } else {
      spellItem = casterActor?.items?.getName(msg.data.flavor);
    }
    let aseSpell = spellItem?.data?.flags?.advancedspelleffects ?? false;
    if (!caster2 || !casterActor || !spellItem || !aseSpell)
      return;
    let chatContent = msg.data.content;
    let spellLevel = Number(chatContent.charAt(chatContent.indexOf("data-spell-level") + 18));
    let spellTargets = Array.from(game.user.targets);
    let data = {
      actor: casterActor,
      token: caster2,
      tokenId: msg.data.speaker.token,
      item: spellItem,
      itemLevel: spellLevel,
      targets: spellTargets,
      itemCardId: msg.id
    };
    if (spellItem.data.data.components.concentration) {
      await concentrationHandler.addConcentration(casterActor, spellItem);
    }
    console.log("NO-MIDI DATA: ", data);
    ASEHandler.handleASE(data);
  }
}
__name(noMidiHandler, "noMidiHandler");
class MissileDialog extends FormApplication {
  constructor(options) {
    super(options);
    foundry.utils.mergeObject(this.options, options);
    this.data = {};
    this.data.attackMods = {};
    this.data.numMissiles = options.numMissiles;
    this.data.numMissilesMax = options.numMissiles;
    this.data.caster = options.casterId;
    this.data.itemCardId = options.itemCardId;
    this.data.item = options.item;
    this.data.actionType = options?.actionType || "other";
    this.data.effectOptions = options.effectOptions;
    this.data.allAttackRolls = [];
    this.data.allDamRolls = [];
    this.data.targets = [];
  }
  static async registerHooks() {
    return;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "./modules/advancedspelleffects/src/templates/missile-dialog.html",
      id: "missile-dialog",
      title: game.i18n.localize("ASE.SelectTargetsDialogTitle"),
      resizable: true,
      width: "auto",
      height: "auto",
      left: game.user?.getFlag("advancedspelleffects", "missileDialogPos.left") ?? "auto",
      top: game.user?.getFlag("advancedspelleffects", "missileDialogPos.top") ?? "auto",
      submitOnClose: true,
      close: () => {
        Hooks.call("closeMissileDialog");
      }
    });
  }
  async _applyMarker(target, type) {
    let markerAnim = `${this.data.effectOptions.targetMarkerType}.${this.data.effectOptions.targetMarkerColor}`;
    const markerSound = this.data.effectOptions.markerSound ?? "";
    const markerSoundDelay = Number(this.data.effectOptions.markerSoundDelay) ?? 0;
    const markerSoundVolume = Number(this.data.effectOptions.markerVolume) ?? 1;
    const markerAnimHue = this.data.effectOptions.targetMarkerHue ?? 0;
    const markerAnimSaturation = this.data.effectOptions.targetMarkerSaturation ?? 0;
    let baseScale = this.data.effectOptions.baseScale;
    let currMissile = this.data.targets.map((targetData) => {
      return { id: targetData.id, missilesAssigned: targetData.missilesAssigned };
    }).filter((t) => t.id == target.id)[0]?.missilesAssigned ?? 0;
    let baseOffset = canvas.grid.size / 2;
    let offsetMod = -(1 / 4) * currMissile + 1;
    let offset = { x: baseOffset * offsetMod, y: baseOffset };
    let markerSeq = new Sequence("Advanced Spell Effects").sound().file(markerSound).delay(markerSoundDelay).volume(markerSoundVolume).playIf(markerSound != "").effect().attachTo(target, { followRotation: false }).filter("ColorMatrix", { hue: markerAnimHue, saturate: markerAnimSaturation }).locally().file(markerAnim).scale(0.01).name(`missile-target-${target.id}-${currMissile}`).offset(offset).duration(3e5).animateProperty("sprite", "scale.x", { from: 0.01, to: baseScale, delay: 200, duration: 700, ease: "easeOutBounce" }).animateProperty("sprite", "scale.y", { from: 0.01, to: baseScale, duration: 900, ease: "easeOutBounce" });
    if (type == "kh") {
      markerSeq.loopProperty("sprite", "position.y", { from: 0, to: -10, duration: 1e3, ease: "easeInOutSine", pingPong: true });
    } else if (type == "kl") {
      markerSeq.loopProperty("sprite", "position.y", { from: 0, to: 10, duration: 1e3, ease: "easeInOutSine", pingPong: true });
    }
    markerSeq.play();
    if (!this.data.attackMods[target.id]) {
      this.data.attackMods[target.id] = [{ index: currMissile, type }];
    } else {
      this.data.attackMods[target.id].push({ index: currMissile, type });
    }
    let inTargetList = this.data.targets.find((t) => t.id == target.id);
    if (!inTargetList) {
      this.data.targets.push({ id: target.id, missilesAssigned: 1 });
    } else {
      inTargetList.missilesAssigned++;
    }
  }
  async _handleClick(event) {
    let parsedEventData = {
      altKey: event.originalEvent.altKey,
      ctrlKey: event.originalEvent.ctrlKey,
      button: event.originalEvent.button
    };
    let attackType = parsedEventData.altKey ? "kh" : parsedEventData.ctrlKey ? "kl" : "";
    let token = canvas.tokens.placeables.filter((token2) => {
      const mouse = canvas.app.renderer.plugins.interaction.mouse;
      const mouseLocal = mouse.getLocalPosition(token2);
      return mouseLocal.x >= 0 && mouseLocal.x <= token2.hitArea.width && mouseLocal.y >= 0 && mouseLocal.y <= token2.hitArea.height;
    })[0];
    if (token) {
      if (parsedEventData.button == 0) {
        let numMissiles = this.data.numMissiles;
        if (numMissiles == 0) {
          ui.notifications.info("Missile Limit Reached!");
        }
        if (numMissiles > 0) {
          const missileTextBox = document.getElementById("txtNumMissilesId");
          if (missileTextBox) {
            missileTextBox.value--;
          }
          await this._applyMarker(token, attackType);
          this._addTargetToList(token);
          this.data.numMissiles--;
        }
      } else if (parsedEventData.button == 2) {
        this._removeMissile(token);
      }
    }
  }
  async _addTargetToList(target) {
    let missilesAssigned = this.data.targets.find((t) => t.id == target.id)?.missilesAssigned ?? 1;
    let targetsTable = document.getElementById("targetsTable").getElementsByTagName("tbody")[0];
    let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
    if (!targetAssignedMissiles) {
      let newTargetRow = targetsTable.insertRow(-1);
      newTargetRow.id = `${target.document.id}-row`;
      let newLabel1 = newTargetRow.insertCell(0);
      let newMissilesAssignedInput = newTargetRow.insertCell(1);
      let newRemoveMissileButton = newTargetRow.insertCell(2);
      newLabel1.innerHTML = `<img src="${target.document.data.img}" width="30" height="30" style="border:0px"> - ${target.document.data.name}`;
      newMissilesAssignedInput.innerHTML = `<input style='width: 2em;' type="number" id="${target.document.id}-missiles" readonly value="${missilesAssigned}"></input>`;
      newRemoveMissileButton.innerHTML = `<button id="${target.document.id}-removeMissile" class="btnRemoveMissile" type="button"><i class="fas fa-minus"></i></button>`;
      let btnRemoveMissile = document.getElementById(`${target.document.id}-removeMissile`);
      btnRemoveMissile.addEventListener("click", this._removeMissile.bind(this));
      newTargetRow.addEventListener("mouseenter", function(e) {
        let token = canvas.tokens.get($(this).attr("id").split("-")[0]);
        token._onHoverIn(e);
      });
      newTargetRow.addEventListener("mouseleave", function(e) {
        let token = canvas.tokens.get($(this).attr("id").split("-")[0]);
        token._onHoverIn(e);
      });
      $("#missile-dialog").height("auto");
    } else {
      document.getElementById(`${target.document.id}-missiles`).value++;
    }
  }
  async _removeMarker(target) {
    const targetData = this.data.targets.find((t) => t.id == target.id);
    const missilesAssigned = targetData.missilesAssigned;
    await Sequencer.EffectManager.endEffects({ name: `missile-target-${target.id}-${missilesAssigned - 1}` });
    if (missilesAssigned > 0) {
      targetData.missilesAssigned--;
    }
  }
  async _removeMissile(e) {
    let target = e.currentTarget ? canvas.tokens.get(e.currentTarget.id.split("-")[0]) : e;
    if (target) {
      let missilesAssigned = this.data.targets.find((t) => t.id == target.id)?.missilesAssigned ?? 0;
      let targetAssignedMissiles = document.getElementById(`${target.document.id}-missiles`);
      if (targetAssignedMissiles) {
        document.getElementById(`${target.document.id}-missiles`).value = missilesAssigned - 1;
        this.data.numMissiles = Number(this.data.numMissiles) + 1;
        document.getElementById("txtNumMissilesId").value++;
        await this._removeMarker(target);
        this.data.attackMods[target.id].pop();
      }
      if (missilesAssigned == 1) {
        let targetRow = document.getElementById(`${target.document.id}-removeMissile`).closest("tr");
        targetRow.remove();
        let inTargetList = this.data.targets.find((t) => t.id == target.id);
        if (inTargetList) {
          this.data.targets.splice(this.data.targets.indexOf(inTargetList), 1);
        }
      }
    }
  }
  async _launchMissile(caster2, target, attackData) {
    let hit = attackData.hit;
    let missileAnim = `${this.data.effectOptions.missileAnim}.${this.data.effectOptions.missileColor}`;
    const missileIntroSound = this.data.effectOptions.missileIntroSound ?? "";
    const missleIntroPlayback = this.data.effectOptions.missileIntroSoundPlayback ?? "indiv";
    let missileIntroSoundDelay = Number(this.data.effectOptions.missileIntroSoundDelay) ?? 0;
    let missileIntroVolume = Number(this.data.effectOptions.missileIntroVolume) ?? 1;
    const impactDelay = Number(this.data.effectOptions.impactDelay) ?? -1e3;
    const missileImpactSound = this.data.effectOptions.missileImpactSound ?? "";
    const missleImpactPlayback = this.data.effectOptions.missileImpactSoundPlayback ?? "indiv";
    let missileImpactSoundDelay = Number(this.data.effectOptions.missileImpactSoundDelay) ?? 0;
    let missileImpactVolume = Number(this.data.effectOptions.missileImpactVolume) ?? 1;
    new Sequence("Advanced Spell Effects").sound().file(missileIntroSound).delay(missileIntroSoundDelay).volume(missileIntroVolume).playIf(missileIntroSound != "" && missleIntroPlayback == "indiv").effect().file(missileAnim).atLocation(caster2).randomizeMirrorY().missed(!hit).stretchTo(target).randomOffset(0.65).waitUntilFinished(impactDelay).sound().file(missileImpactSound).delay(missileImpactSoundDelay).volume(missileImpactVolume).playIf(missileImpactSound != "" && missleImpactPlayback == "indiv").play();
  }
  async getData() {
    game.user.updateTokenTargets([]);
    let missilesNum = Number(this.object.numMissiles) ?? 0;
    Hooks.once("closeMissileDialog", async () => {
      const missileEffects = Sequencer.EffectManager.getEffects({ name: "missile-target-*" });
      if (missileEffects.length > 0) {
        console.log("ASE Missile effects leftover detected...", missileEffects);
        await Sequencer.EffectManager.endEffects({ name: "missile-target-*" });
      }
    });
    return {
      data: this.data,
      numMissiles: missilesNum
    };
  }
  async _evaluateAttack(caster2, target, mod, rollData) {
    let attackBonus = rollData.bonuses[this.data.actionType]?.attack || "";
    let attackRoll = await new Roll(`${mod == "" ? 1 : 2}d20${mod} + @mod + @prof + ${attackBonus}`, rollData).evaluate({ async: true });
    let crit = attackRoll.terms[0].total == 20;
    let hit;
    game.dice3d?.showForRoll(attackRoll);
    if (attackRoll.total < target.actor.data.data.attributes.ac.value) {
      console.log(`${caster2.name} missed ${target.name} with roll ${attackRoll.total}${mod == "" ? "" : mod == "kh" ? ", with advantage!" : ", with dis-advantage!"}`);
      hit = false;
    } else {
      console.log(`${caster2.name} hits ${target.name} with roll ${attackRoll.total}${mod == "" ? "" : mod == "kh" ? ", with advantage!" : ", with dis-advantage!"}`);
      hit = true;
    }
    this.data.allAttackRolls.push({ roll: attackRoll, target: target.name, hit, crit });
    return { roll: attackRoll, hit, crit };
  }
  async _updateObject(event, formData) {
    if (event.target) {
      let addTokenToText2 = function(token, damage, numMissiles, missileType, damageFormula, damageType, attacksHit, attacksCrit) {
        return `<div class="midi-qol-flex-container">
            <div>
            Launched ${numMissiles} ${missileType}(s) at 
            </div>
          <div class="midi-qol-target-npc-GM midi-qol-target-name" id="${token.id}"> <b>${token.name}</b></div>
          <div class="midi-qol-target-npc-Player midi-qol-target-name" id="${token.id}" style="display: none;"> <b>${token.name}</b></div>
          <div><img src="${token?.data?.img}" height="30" style="border:0px"></div>
          <div><span>${attacksHit.length} ${missileType}(s) hit${attacksCrit > 0 ? ", " + attacksCrit + " critical(s)!" : ""}${attacksHit.length ? `, dealing <b>${damageFormula} (${damage}) </b>${damageType} damage` : ""}</span></div>
        </div>`;
      };
      var addTokenToText = addTokenToText2;
      __name(addTokenToText2, "addTokenToText");
      let caster2 = canvas.tokens.get(this.data.caster);
      game.actors.get(caster2.data.actorId);
      const item = this.data.item;
      let rollData = item.getRollData();
      const rollMod = rollData.mod;
      let damageBonus = rollData.bonuses[this.data.actionType]?.damage || "";
      const chatMessage = await game.messages.get(this.data.itemCardId);
      const missileIntroSound = this.data.effectOptions.missileIntroSound ?? "";
      const missleIntroPlayback = this.data.effectOptions.missileIntroSoundPlayback ?? "indiv";
      let missileIntroSoundDelay = Number(this.data.effectOptions.missileIntroSoundDelay) ?? 0;
      let missileIntroVolume = Number(this.data.effectOptions.missileIntroVolume) ?? 1;
      Number(this.data.effectOptions.impactDelay) ?? -1e3;
      const missileImpactSound = this.data.effectOptions.missileImpactSound ?? "";
      const missleImpactPlayback = this.data.effectOptions.missileImpactSoundPlayback ?? "indiv";
      let missileImpactSoundDelay = Number(this.data.effectOptions.missileImpactSoundDelay) ?? 0;
      let missileImpactVolume = Number(this.data.effectOptions.missileImpactVolume) ?? 1;
      new Sequence("Advanced Spell Effects").sound().file(missileIntroSound).delay(missileIntroSoundDelay).volume(missileIntroVolume).playIf(missileIntroSound != "" && missleIntroPlayback == "group" && this.data.targets.length > 0).sound().file(missileImpactSound).delay(missileImpactSoundDelay).volume(missileImpactVolume).playIf(missileImpactSound != "" && missleImpactPlayback == "group" && this.data.targets.length > 0).play();
      for await (let target of this.data.targets) {
        let targetToken = canvas.tokens.get(target.id);
        const missileNum = this.data.targets.find((t) => t.id == target.id)?.missilesAssigned ?? 0;
        if (missileNum == 0) {
          return;
        }
        let damageRoll;
        let attackData = {};
        let attacksHit = [];
        let attacksCrit = 0;
        let damageTotal = 0;
        let damageFormula;
        let missileDelay;
        let totalDamageFormula = {
          dieCount: 0,
          mod: 0
        };
        for (let i = 0; i < missileNum; i++) {
          if (this.data.effectOptions.missileType == "dart") {
            attackData["hit"] = true;
            missileDelay = getRandomInt(75, 150);
          } else {
            let attackMod = this.data.attackMods[targetToken.id][i]?.type;
            missileDelay = getRandomInt(50, 100);
            rollData.mod = rollMod;
            attackData = await this._evaluateAttack(caster2, targetToken, attackMod, rollData);
            if (attackData.crit) {
              attacksCrit += 1;
            }
          }
          const maxMods = game.settings.get("dnd5e", "criticalDamageModifiers");
          const maxBaseDice = game.settings.get("dnd5e", "criticalDamageMaxDice");
          let damageDieCount = this.data.effectOptions.dmgDieCount;
          let baseDamageDie = this.data.effectOptions.dmgDie;
          let baseDamageDieModified;
          let damageMod = Number(this.data.effectOptions.dmgMod) ? this.data.effectOptions.dmgMod : 0;
          if (attackData.crit) {
            if (maxMods) {
              damageMod *= 2;
              damageBonus *= 2;
            }
            if (maxBaseDice) {
              baseDamageDieModified = Number(baseDamageDie.split("d")[1]) * damageDieCount;
              baseDamageDie = baseDamageDie + "+ " + baseDamageDieModified;
            } else {
              damageDieCount *= 2;
            }
          }
          damageFormula = `${damageDieCount > 0 ? damageDieCount : ""}${baseDamageDie} ${damageMod ? "+" + damageMod : ""} ${damageBonus ? "+" + damageBonus : ""}`;
          damageRoll = await new Roll(damageFormula).evaluate({ async: true });
          this.data.allDamRolls.push({ roll: damageRoll, target: targetToken.name });
          game.dice3d?.showForRoll(damageRoll);
          attackData["damageRoll"] = damageRoll;
          attacksHit.push(damageRoll);
          if (game.modules.get("midi-qol")?.active) {
            if (attackData.hit) {
              let effectOptionsdmgType = this.data.effectOptions.dmgType;
              this.data.itemCardId;
              JSON.parse(JSON.stringify(this.data.item.data));
              let targetSet = /* @__PURE__ */ new Set();
              let saveSet = /* @__PURE__ */ new Set();
              targetSet.add(targetToken);
              await MidiQOL.applyTokenDamage(
                [{ damage: damageRoll.total, type: effectOptionsdmgType }],
                damageRoll.total,
                targetSet,
                this.data.item,
                saveSet
              );
              damageTotal += damageRoll.total;
              for (let i2 = 0; i2 < damageRoll.terms.length; i2++) {
                if (i2 == 0) {
                  totalDamageFormula.dieCount += damageRoll.terms[i2].number;
                } else if (!damageRoll.terms[i2].operator) {
                  totalDamageFormula.mod += damageRoll.terms[i2].number;
                }
              }
            }
            if (!attackData.hit && this.data.effectOptions.missileType != "dart") {
              attacksHit.pop();
            }
          } else {
            attackData["hit"] = true;
            damageTotal += damageRoll.total;
          }
          await this._launchMissile(caster2, targetToken, attackData);
          await warpgate.wait(missileDelay);
        }
        let newDamageFormula = `${totalDamageFormula.dieCount}${this.data.effectOptions.dmgDie} ${Number(totalDamageFormula.mod) ? "+" + totalDamageFormula.mod : ""}`;
        if (game.modules.get("midi-qol")?.active) {
          let chatMessageContent = await duplicate(chatMessage.data.content);
          let newChatmessageContent = $(chatMessageContent);
          newChatmessageContent.find(".midi-qol-hits-display").append(
            $(addTokenToText2(targetToken, damageTotal, missileNum, this.data.effectOptions.missileType, newDamageFormula, this.data.effectOptions.dmgType, attacksHit, attacksCrit))
          );
          await chatMessage.update({ content: newChatmessageContent.prop("outerHTML") });
        }
        const targetMarkers = Sequencer.EffectManager.getEffects({ object: targetToken }).filter((effect) => effect.data.name?.startsWith(`missile-target`));
        for await (let targetMarker of targetMarkers) {
          await Sequencer.EffectManager.endEffects({ name: targetMarker.data.name, object: targetToken });
        }
      }
      let content = this._buildChatData(this.data.allAttackRolls, this.data.allDamRolls, caster2);
      await ChatMessage.create({ content, user: game.user.id });
      await ui.chat.scrollBottom();
    }
    $(document.body).off("mouseup", MissileDialog._handleClick);
    await aseSocket.executeAsGM("updateFlag", game.user.id, "missileDialogPos", { left: this.position.left, top: this.position.top });
  }
  activateListeners(html) {
    super.activateListeners(html);
    $(document.body).on("mouseup", this._handleClick.bind(this));
  }
  _buildChatData(attackRolls, damageRolls, caster2) {
    let content = `<table id="missileDialogChatTable"><tr><th>${game.i18n.localize("ASE.Target")}</th><th>${game.i18n.localize("ASE.AttackRoll")}</th><th>${game.i18n.localize("ASE.Damage")}</th>`;
    if (this.data.effectOptions.missileType == "dart") {
      for (let i = 0; i < damageRolls.length; i++) {
        let currDamageData = damageRolls[i];
        let currTarget = currDamageData.target;
        let currDamageRoll = currDamageData.roll;
        let currDamageBreakdown = currDamageRoll.terms[0].formula + ": ";
        let currDamageValues = currDamageRoll.terms[0].values;
        for (let j = 0; j < currDamageValues.length; j++) {
          currDamageBreakdown += `[${currDamageValues[j]}]`;
        }
        let currExtraDamage = currDamageRoll.formula.split("+")[1];
        currDamageBreakdown += ` ${currExtraDamage ? "+ " : ""}${currExtraDamage ? currExtraDamage : ""}`;
        content += `<tr><td>${currTarget}</td><td>--</td><td title = '${currDamageBreakdown}'>${currDamageRoll.total}</td></tr>`;
      }
    } else {
      for (let i = 0; i < attackRolls.length; i++) {
        let currAttackData = attackRolls[i];
        let currDamageData = damageRolls[i];
        let currTarget = currAttackData.target;
        let currAttackRoll = currAttackData.roll;
        let currDamageRoll = currDamageData.roll;
        let currDamageRollDieTerms = currDamageRoll.terms.filter((term) => {
          return term.values?.length > 0;
        });
        let currDamageRollNumericTerms = currDamageRoll.terms.filter((term) => {
          return term.number != void 0 && !(term.values?.length > 0);
        });
        let currDamageFormula = "";
        let currDamageBreakdown = "";
        for (let j = 0; j < currDamageRollDieTerms.length; j++) {
          currDamageFormula += currDamageRollDieTerms[j].formula + (j < currDamageRollDieTerms.length - 1 ? " + " : "");
          for (let k = 0; k < currDamageRollDieTerms[j].values.length; k++) {
            currDamageBreakdown += "[" + currDamageRollDieTerms[j].values[k] + "]" + (k < currDamageRollDieTerms[j].values.length - 1 ? " + " : "");
          }
        }
        currDamageFormula += ": ";
        for (let j = 0; j < currDamageRollNumericTerms.length; j++) {
          currDamageBreakdown += (j == 0 && currDamageRollDieTerms.length > 0 ? " + " : "") + currDamageRollNumericTerms[j].number + (j < currDamageRollNumericTerms.length - 1 ? " + " : "");
        }
        currDamageBreakdown = currDamageFormula + currDamageBreakdown;
        let currAttackRollResult = currAttackRoll.result.split("+");
        let currAttackBreakDown = "[";
        if (currAttackData.crit) {
          currAttackRoll._total = "Critical!";
        }
        if (currAttackRoll.formula.includes("kh")) {
          let lowerRoll = Math.min(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
          let higherRoll = Math.max(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
          currAttackRollResult[0] = `Adv: ${lowerRoll}, ${higherRoll} `;
        } else if (currAttackRoll.formula.includes("kl")) {
          let lowerRoll = Math.min(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
          let higherRoll = Math.max(currAttackRoll.terms[0].results[0].result, currAttackRoll.terms[0].results[1].result);
          currAttackRollResult[0] = `Dis: ${lowerRoll}, ${higherRoll} `;
        }
        for (let j = 0; j < currAttackRollResult.length; j++) {
          currAttackBreakDown += `${j == 0 ? currAttackRollResult[j] + "]" : " + " + currAttackRollResult[j]}`;
        }
        content += `<tr><td>${currTarget}</td><td title = '${currAttackBreakDown}'>${currAttackRoll._total}</td><td title = '${currDamageBreakdown}'>${currDamageRoll.total}</td></tr>`;
      }
    }
    return content;
  }
}
__name(MissileDialog, "MissileDialog");
class SpellStateMachine {
  constructor() {
    this.spells = [];
  }
  getSpell(uuid) {
    return this.spells.find((spell) => spell.uuid === uuid) ?? false;
  }
  addSpell(uuid, options) {
    this.spells.push({ uuid, state: 0, active: true, finished: false, options });
    this.nextState(uuid);
  }
  removeSpell(uuid) {
    this.spells = this.spells.filter((spell) => spell.uuid !== uuid);
  }
  continueSequence(uuid, options) {
    let spell = this.spells.find((spell2) => spell2.uuid === uuid);
    if (spell.options.sequenceBuilder) {
      if (!spell.options.sequences) {
        spell.options.sequences = [];
      }
      spell.options.sequences.push(spell.options.sequenceBuilder(options));
    }
  }
  buildChatCard(uuid) {
    let spell = this.spells.find((spell2) => spell2.uuid === uuid);
    let chatContent = spell.options.chatBuilder({ rolls: spell.options.rolls, casterId: spell.options.casterId, attacks: spell.options.attacks });
    return chatContent;
  }
  async nextState(uuid, spellOptions = {}) {
    let spell = this.spells.find((spell2) => spell2.uuid === uuid);
    game.users.find((i) => i.isGM);
    let actor = void 0;
    let actorId = "";
    if (spell) {
      const item = await fromUuid(spell.uuid);
      const level = item.data.data.level;
      if (spell.uuid.split(".")[0] == "Actor") {
        actorId = spell.uuid.split(".")[1];
        actor = game.actors.get(actorId);
      }
      if (spell.options.iterate) {
        if (actor) {
          await actor.update({ [`data.spells.spell${level}.value`]: actor.data.data.spells[`spell${level}`].value + 1 });
        }
        let iterateListKey = spell.options.iterate;
        if (iterateListKey && spell.state < spell.options[iterateListKey].length) {
          if (spellOptions.rolls) {
            if (spell.options.rolls) {
              spell.options.rolls.push(spellOptions.rolls);
            }
          }
          game.user.updateTokenTargets([]);
          let options = {
            "targetUuids": [spell.options[iterateListKey][spell.state]],
            "configureDialog": false,
            "workflowOptions": {}
          };
          if (spell.options.attacks) {
            const attackType = spell.options.attacks[spell.state]?.type;
            if (attackType && attackType != "") {
              options.workflowOptions[attackType] = attackType;
            }
          }
          spell.state++;
          await MidiQOL.completeItemRoll(item, options);
        } else if (iterateListKey && spell.state >= spell.options[iterateListKey].length) {
          spell.active = false;
          spell.finished = true;
          if (spell.options.sequences.length && spell.options.sequences.length > 0) {
            for await (const sequence of spell.options.sequences) {
              sequence.play();
              await warpgate.wait(getRandomInt(50, 150));
            }
          }
          if (spellOptions.rolls) {
            if (spell.options.rolls) {
              spell.options.rolls.push(spellOptions.rolls);
            }
          }
          if (spell.options.chatBuilder) {
            let chatContent = await this.buildChatCard(uuid);
            await aseSocket.executeAsGM("createGMChat", { content: chatContent });
            if (actor) {
              await actor.update({ [`data.spells.spell${level}.value`]: actor.data.data.spells[`spell${level}`].value - 1 });
            }
          }
          this.removeSpell(uuid);
        }
      } else if (spell.options.concentration) {
        game.user.updateTokenTargets([]);
        if (spell.options.castItem) {
          let castItem = await fromUuid(spell.options.castItem);
          let options = {
            "targetUuids": spell.options?.targets,
            "configureDialog": false
          };
          spell.state++;
          await MidiQOL.completeItemRoll(castItem, options);
        } else if (spell.options.noCastItem)
          ;
      } else if (spell.options.targetted) {
        if (!spellOptions.finished) {
          if (actor) {
            await actor.update({ [`data.spells.spell${level}.value`]: actor.data.data.spells[`spell${level}`].value + 1 });
          }
          game.user.updateTokenTargets([]);
          let options = {
            "targetUuids": spell.options.targets,
            "configureDialog": false
          };
          spell.state++;
          await MidiQOL.completeItemRoll(item, options);
        } else if (spellOptions.finished) {
          spell.active = false;
          spell.finished = true;
          if (spellOptions.failedSaves) {
            spell.options.failedSaves = spellOptions.failedSaves;
          }
          if (spell.options.sequenceBuilder) {
            this.continueSequence(uuid, spell.options);
          }
          console.log("ASE: MIDI HANDLER: STATE TRANSITION: TARGETTED SPELL FINISHED", spell);
          if (spell.options.sequences) {
            if (spell.options.sequences.length && spell.options.sequences.length > 0) {
              for await (const sequence of spell.options.sequences) {
                sequence.play();
              }
            }
          }
          this.removeSpell(uuid);
          console.log("ASE: MIDI HANDLER: STATE TRANSITION: FINISHED: ", spell);
        }
      } else if (spell.options.repeat) {
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT", spell);
        console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT: STATE", spell.state);
        if (!spellOptions.finished) {
          if (actor) {
            await actor.update({ [`data.spells.spell${level}.value`]: actor.data.data.spells[`spell${level}`].value + 1 });
          }
          game.user.updateTokenTargets([]);
          let options = {
            "configureDialog": false,
            "optionalTestField": { "test": "value" },
            "workflowOptions": {
              "autoRollDamage": "always"
            }
          };
          if (spellOptions.targets) {
            options.targetUuids = spellOptions.targets;
          } else {
            options.targetUuids = spell.options.targets;
          }
          console.log("ASE: MIDI HANDLER: STATE TRANSITION: REPEAT: OPTIONS", options);
          spell.state++;
          await MidiQOL.completeItemRoll(item, options);
        }
      } else if (spell.options.castItem) {
        if (!spellOptions.finished) {
          let options = {
            "targetUuids": spell.options.targets,
            "configureDialog": false
          };
          spell.state++;
          await MidiQOL.completeItemRoll(item, options);
        }
      }
    }
  }
}
__name(SpellStateMachine, "SpellStateMachine");
const aseModules = {
  concentrationHandler,
  midiHandler,
  noMidiHandler,
  MissileDialog
};
Hooks.once("init", async function() {
  console.log("Registering ASE game settings...");
  game.ASESpellStateManager = new SpellStateMachine();
  const debouncedReload = foundry.utils.debounce(() => {
    window.location.reload();
  }, 100);
  game.settings.register("advancedspelleffects", "overrideGridHighlight", {
    name: "Enable ASE Grid Highlight Override",
    hint: "This overrides the foundry default template behaviour and removes the grid highlighting for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
  game.settings.register("advancedspelleffects", "overrideTemplateBorder", {
    name: "Enable ASE Template Border Override",
    hint: "This overrides the foundry default template behaviour and removes the border for templates specifically placed by ASE spells. Other templates should function as normal.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: debouncedReload
  });
});
Hooks.once("setup", function() {
  setupASESocket();
});
Hooks.once("ready", async function() {
  Object.values(aseModules).forEach((cl) => cl.registerHooks());
  Hooks.on("sequencerReady", () => {
    spellStore.initialize();
    function easeOutElasticCustom(x) {
      const c4 = 2 * Math.PI / 10;
      return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -12 * x) * Math.sin((x * 12 - 0.75) * c4) + 1;
    }
    __name(easeOutElasticCustom, "easeOutElasticCustom");
    Sequencer.registerEase("easeOutElasticCustom", easeOutElasticCustom);
  });
  if (game.settings.get("advancedspelleffects", "overrideGridHighlight")) {
    libWrapper.register("advancedspelleffects", "MeasuredTemplate.prototype.highlightGrid", _ASEGridHighlightWrapper, "WRAPPER");
    cleanUpTemplateGridHighlights();
  }
  if (game.settings.get("advancedspelleffects", "overrideTemplateBorder")) {
    if (!game.modules.get("tokenmagic")?.active) {
      libWrapper.register("advancedspelleffects", "MeasuredTemplate.prototype.render", _ASERemoveTemplateBorder, "WRAPPER");
    } else {
      ui.notifications.info("ASE Template Border Override disabled due to conflict with TokenMagicFX Module");
    }
  }
  function _ASERemoveTemplateBorder(wrapped, ...args) {
    wrapped(...args);
    if (this.data?.flags?.advancedspelleffects) {
      if (this.data?.flags?.advancedspelleffects?.placed) {
        this.template.alpha = 0;
      } else {
        return;
      }
    }
  }
  __name(_ASERemoveTemplateBorder, "_ASERemoveTemplateBorder");
  function _ASEGridHighlightWrapper(wrapped, ...args) {
    wrapped(...args);
    if (!this.data?.flags?.advancedspelleffects)
      return;
    const highlight = canvas.grid.getHighlightLayer(`Template.${this.id}`);
    if (highlight) {
      highlight.clear();
    }
  }
  __name(_ASEGridHighlightWrapper, "_ASEGridHighlightWrapper");
  if (!game.user.isGM)
    return;
  Hooks.on(`renderItemSheet`, async (app, html, data) => {
    if (app.document.getFlag("advancedspelleffects", "disableSettings")) {
      return;
    }
    const aseBtn = $(`<a class="ase-item-settings" title="Advanced Spell Effects"><i class="fas fa-magic"></i>ASE</a>`);
    aseBtn.click(async (ev) => {
      await versionMigration.handle(app.document);
      new ASESettings(app.document, {}).render(true);
    });
    html.closest(".app").find(".ase-item-settings").remove();
    let titleElement = html.closest(".app").find(".window-title");
    aseBtn.insertAfter(titleElement);
  });
});
//# sourceMappingURL=setup.js.map
