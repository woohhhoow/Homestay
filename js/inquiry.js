(function () {
  const qs = (selector, scope = document) => scope.querySelector(selector);

  function createSupabaseClient() {
    if (!window.supabase || !window.SUPABASE_CONFIG) return null;
    return window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.key);
  }

  function cleanValue(value) {
    const trimmed = String(value || "").trim();
    return trimmed || null;
  }

  function setStatus(node, message, type = "") {
    if (!node) return;
    node.textContent = message;
    node.dataset.state = type;
  }

  function buildPayload(form) {
    const formData = new FormData(form);
    const guestsValue = cleanValue(formData.get("guests"));
    const guests = guestsValue ? Number.parseInt(guestsValue, 10) : null;

    return {
      name: cleanValue(formData.get("name")),
      wechat: cleanValue(formData.get("wechat")),
      phone: cleanValue(formData.get("phone")),
      checkin_date: cleanValue(formData.get("checkin_date")),
      checkout_date: cleanValue(formData.get("checkout_date")),
      guests: Number.isFinite(guests) ? guests : null,
      message: cleanValue(formData.get("message")),
    };
  }

  async function submitInquiry(form, options = {}) {
    const statusNode = options.statusNode || qs("[data-inquiry-status]", form);
    const submitButton = options.submitButton || qs("[data-inquiry-submit]", form);
    const supabaseClient = createSupabaseClient();

    if (!supabaseClient) {
      setStatus(statusNode, "当前网络组件未加载，请稍后再试。", "error");
      return false;
    }

    const payload = buildPayload(form);
    if (!payload.name) {
      setStatus(statusNode, "请先填写姓名。", "error");
      return false;
    }

    if (!payload.wechat && !payload.phone) {
      setStatus(statusNode, "请至少填写微信或电话，方便我们联系你。", "error");
      return false;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = options.loadingText || "提交中...";
    }
    setStatus(statusNode, "", "");

    const { error } = await supabaseClient.from("inquiries").insert(payload);

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = options.defaultText || "提交咨询";
    }

    if (error) {
      console.error("Supabase inquiry insert failed:", error);
      setStatus(statusNode, "提交失败，请稍后再试，或直接添加微信联系。", "error");
      return false;
    }

    form.reset();
    setStatus(statusNode, "提交成功，我们会尽快联系你。", "success");
    return true;
  }

  function bindInquiryForms() {
    document.querySelectorAll("[data-inquiry-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitInquiry(form);
      });
    });
  }

  window.BannaInquiry = {
    buildPayload,
    submitInquiry,
  };

  document.addEventListener("DOMContentLoaded", bindInquiryForms);
})();
