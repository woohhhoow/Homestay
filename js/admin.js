(function () {
  const STATUS_OPTIONS = ["new", "contacted", "confirmed", "ignored"];
  const qs = (selector, scope = document) => scope.querySelector(selector);

  function createClient() {
    if (!window.supabase || !window.SUPABASE_CONFIG) return null;
    return window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.key);
  }

  const supabaseClient = createClient();
  const state = {
    records: [],
    editingId: null,
  };

  const loginView = qs("[data-admin-login-view]");
  const loginForm = qs("[data-admin-login]");
  const loginButton = qs("[data-admin-login-button]");
  const loginStatus = qs("[data-admin-login-status]");
  const dashboard = qs("[data-admin-dashboard]");
  const recordsNode = qs("[data-admin-records]");
  const listStatus = qs("[data-admin-list-status]");
  const countNode = qs("[data-admin-count]");
  const logoutButton = qs("[data-admin-logout]");
  const refreshButton = qs("[data-admin-refresh]");
  const newButton = qs("[data-admin-new]");
  const editorModal = qs("[data-admin-modal]");
  const editor = qs("[data-admin-editor]");
  const editorTitle = qs("[data-editor-title]");
  const editorKicker = qs("[data-editor-kicker]");
  const editorStatus = qs("[data-editor-status]");
  const editorSave = qs("[data-editor-save]");
  const nav = qs(".site-nav");
  const navToggle = qs("[data-nav-toggle]");

  function setStatus(node, message, type = "") {
    if (!node) return;
    node.textContent = message;
    node.dataset.state = type;
  }

  function setBusy(control, busy, text) {
    if (!control) return;
    if (busy) {
      control.dataset.defaultText = control.textContent;
      control.disabled = true;
      if (text) control.textContent = text;
      return;
    }
    control.disabled = false;
    if (control.dataset.defaultText) control.textContent = control.dataset.defaultText;
    delete control.dataset.defaultText;
  }

  function setRecordCount(total) {
    if (!countNode) return;
    countNode.textContent = `${total} 条记录`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanValue(value) {
    const trimmed = String(value || "").trim();
    return trimmed || null;
  }

  function formatDate(value) {
    return value || "未填写";
  }

  function formatDateTime(value) {
    if (!value) return "未知";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function toEmail(account) {
    const cleaned = String(account || "").trim();
    return cleaned.includes("@") ? cleaned : `${cleaned}@qq.com`;
  }

  function setLoggedInView(isLoggedIn) {
    if (loginView) loginView.hidden = isLoggedIn;
    if (loginForm) loginForm.hidden = isLoggedIn;
    if (dashboard) dashboard.hidden = !isLoggedIn;
  }

  function statusSelect(record) {
    return `
      <label class="status-select compact">
        <span>状态</span>
        <select data-status-select="${escapeHtml(record.id)}">
          ${STATUS_OPTIONS.map(
            (status) => `<option value="${status}" ${status === (record.status || "new") ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
      </label>
    `;
  }

  function renderRecords(records) {
    if (!recordsNode) return;

    if (!records.length) {
      recordsNode.innerHTML = `<p class="empty-state">暂无咨询记录</p>`;
      return;
    }

    const rows = records
      .map(
        (item) => `
          <tr>
            <td data-label="姓名"><strong class="guest-name">${escapeHtml(item.name || "未填写姓名")}</strong></td>
            <td data-label="微信">${escapeHtml(item.wechat || "未填写")}</td>
            <td data-label="电话">${escapeHtml(item.phone || "未填写")}</td>
            <td data-label="入住">${escapeHtml(formatDate(item.checkin_date))}</td>
            <td data-label="退房">${escapeHtml(formatDate(item.checkout_date))}</td>
            <td data-label="人数">${escapeHtml(item.guests || "未填写")}</td>
            <td data-label="备注" class="message-cell">${escapeHtml(item.message || "无备注")}</td>
            <td data-label="状态">${statusSelect(item)}</td>
            <td data-label="提交时间">${escapeHtml(formatDateTime(item.created_at))}</td>
            <td data-label="操作">
              <div class="table-actions">
                <button class="link-button" type="button" data-edit-record="${escapeHtml(item.id)}">编辑</button>
                <button class="link-button" type="button" data-mark-contacted="${escapeHtml(item.id)}">标记已联系</button>
                <button class="link-button danger-link" type="button" data-delete-record="${escapeHtml(item.id)}">删除</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");

    recordsNode.innerHTML = `
      <div class="admin-table-shell">
        <table class="admin-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>微信</th>
              <th>电话</th>
              <th>入住</th>
              <th>退房</th>
              <th>人数</th>
              <th>备注</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  async function loadInquiries(message = "") {
    if (!supabaseClient) {
      setStatus(listStatus, "Supabase 组件未加载，请检查网络后刷新。", "error");
      return;
    }

    setStatus(listStatus, "正在加载咨询记录...", "");
    const { data, error } = await supabaseClient
      .from("inquiries")
      .select("id,name,wechat,phone,checkin_date,checkout_date,guests,message,status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase inquiries select failed:", error);
      state.records = [];
      setRecordCount(0);
      setStatus(listStatus, "无法读取咨询记录，请确认账号权限或稍后再试。", "error");
      renderRecords([]);
      return;
    }

    state.records = data || [];
    setRecordCount(state.records.length);
    setStatus(listStatus, message || (state.records.length ? "" : "暂无咨询记录"), message ? "success" : state.records.length ? "" : "empty");
    renderRecords(state.records);
  }

  function buildPayload(form) {
    const formData = new FormData(form);
    const guestsValue = cleanValue(formData.get("guests"));
    const guests = guestsValue ? Number.parseInt(guestsValue, 10) : null;
    const status = cleanValue(formData.get("status"));
    return {
      name: cleanValue(formData.get("name")),
      wechat: cleanValue(formData.get("wechat")),
      phone: cleanValue(formData.get("phone")),
      checkin_date: cleanValue(formData.get("checkin_date")),
      checkout_date: cleanValue(formData.get("checkout_date")),
      guests: Number.isFinite(guests) ? guests : null,
      message: cleanValue(formData.get("message")),
      status: STATUS_OPTIONS.includes(status) ? status : "new",
    };
  }

  function fillEditor(record = null) {
    if (!editor) return;
    editor.reset();
    state.editingId = record?.id || null;
    qs('[name="id"]', editor).value = record?.id || "";
    qs('[name="name"]', editor).value = record?.name || "";
    qs('[name="wechat"]', editor).value = record?.wechat || "";
    qs('[name="phone"]', editor).value = record?.phone || "";
    qs('[name="checkin_date"]', editor).value = record?.checkin_date || "";
    qs('[name="checkout_date"]', editor).value = record?.checkout_date || "";
    qs('[name="guests"]', editor).value = record?.guests || "";
    qs('[name="message"]', editor).value = record?.message || "";
    qs('[name="status"]', editor).value = record?.status || "new";
    editorTitle.textContent = record ? "编辑咨询记录" : "新增咨询记录";
    editorKicker.textContent = record ? "Edit Inquiry" : "New Inquiry";
    setStatus(editorStatus, "", "");
    if (editorModal && !editorModal.open) editorModal.showModal();
  }

  function closeEditor() {
    if (!editor) return;
    if (editorModal?.open) editorModal.close();
    editor.reset();
    state.editingId = null;
    setStatus(editorStatus, "", "");
  }

  async function saveEditor(event) {
    event.preventDefault();
    if (!supabaseClient || !editor) return;

    const payload = buildPayload(editor);
    if (!payload.name) {
      setStatus(editorStatus, "请填写姓名。", "error");
      return;
    }

    setBusy(editorSave, true, "保存中...");
    setStatus(editorStatus, "", "");
    const wasEditing = Boolean(state.editingId);

    const request = wasEditing
      ? supabaseClient.from("inquiries").update(payload).eq("id", state.editingId)
      : supabaseClient.from("inquiries").insert(payload);

    const { error } = await request;
    setBusy(editorSave, false);

    if (error) {
      console.error("Supabase inquiry save failed:", error);
      setStatus(editorStatus, "保存失败，请确认管理员权限或稍后再试。", "error");
      return;
    }

    closeEditor();
    await loadInquiries(wasEditing ? "记录已更新。" : "记录已新增。");
  }

  async function updateStatus(id, status, control = null) {
    if (!supabaseClient || !id || !STATUS_OPTIONS.includes(status)) return;
    if (control) control.disabled = true;
    const { error } = await supabaseClient.from("inquiries").update({ status }).eq("id", id);
    if (control) control.disabled = false;
    if (error) {
      console.error("Supabase inquiry status update failed:", error);
      setStatus(listStatus, "状态更新失败，请确认管理员权限。", "error");
      return;
    }
    await loadInquiries("状态已更新。");
  }

  async function deleteRecord(id, control = null) {
    if (!supabaseClient || !id) return;
    const confirmed = window.confirm("确认删除这条咨询记录吗？此操作不可恢复。");
    if (!confirmed) return;

    setBusy(control, true, "删除中...");
    const { error } = await supabaseClient.from("inquiries").delete().eq("id", id);
    setBusy(control, false);
    if (error) {
      console.error("Supabase inquiry delete failed:", error);
      setStatus(listStatus, "删除失败，请确认管理员权限。", "error");
      return;
    }
    await loadInquiries("记录已删除。");
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!supabaseClient) {
      setStatus(loginStatus, "Supabase 组件未加载，请检查网络后刷新。", "error");
      return;
    }

    const formData = new FormData(loginForm);
    const email = toEmail(formData.get("account"));
    const password = String(formData.get("password") || "");

    setBusy(loginButton, true, "登录中...");
    setStatus(loginStatus, "", "");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    setBusy(loginButton, false);

    if (error) {
      console.error("Supabase admin login failed:", error);
      setStatus(loginStatus, "登录失败，请检查账号或密码。", "error");
      return;
    }

    setStatus(loginStatus, "登录成功。", "success");
    setLoggedInView(true);
    await loadInquiries();
  }

  async function handleLogout() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setLoggedInView(false);
    closeEditor();
    state.records = [];
    renderRecords([]);
    setRecordCount(0);
    setStatus(loginStatus, "已退出登录。", "");
  }

  function initMobileNav() {
    navToggle?.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    nav?.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      nav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  }

  function bindAdminActions() {
    loginForm?.addEventListener("submit", handleLogin);
    logoutButton?.addEventListener("click", handleLogout);
    refreshButton?.addEventListener("click", async () => {
      setBusy(refreshButton, true, "刷新中...");
      await loadInquiries("已刷新。");
      setBusy(refreshButton, false);
    });
    newButton?.addEventListener("click", () => fillEditor());
    editor?.addEventListener("submit", saveEditor);
    document.querySelectorAll("[data-editor-cancel]").forEach((button) => button.addEventListener("click", closeEditor));
    editorModal?.addEventListener("click", (event) => {
      if (event.target === editorModal) closeEditor();
    });
    editorModal?.addEventListener("close", () => {
      editor?.reset();
      state.editingId = null;
      setStatus(editorStatus, "", "");
    });

    recordsNode?.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-record]");
      const contactedButton = event.target.closest("[data-mark-contacted]");
      const deleteButton = event.target.closest("[data-delete-record]");

      if (editButton) {
        const record = state.records.find((item) => String(item.id) === editButton.dataset.editRecord);
        if (record) fillEditor(record);
      }

      if (contactedButton) {
        updateStatus(contactedButton.dataset.markContacted, "contacted", contactedButton);
      }

      if (deleteButton) {
        deleteRecord(deleteButton.dataset.deleteRecord, deleteButton);
      }
    });

    recordsNode?.addEventListener("change", (event) => {
      const select = event.target.closest("[data-status-select]");
      if (select) updateStatus(select.dataset.statusSelect, select.value, select);
    });
  }

  async function initAdmin() {
    initMobileNav();
    if (!supabaseClient) {
      setStatus(loginStatus, "Supabase 组件未加载，请检查网络后刷新。", "error");
      return;
    }

    bindAdminActions();
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      setLoggedInView(true);
      await loadInquiries();
    } else {
      setLoggedInView(false);
      setRecordCount(0);
    }
  }

  document.addEventListener("DOMContentLoaded", initAdmin);
})();
