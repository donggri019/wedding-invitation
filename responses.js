(() => {
  const endpoint = "https://script.google.com/macros/s/AKfycbzv8OhuOfjWLbDQjvuE_RQ3ldSGc2NLHv9kQQyrAMunPWS4yl6DJrTkkASuU5jrCXK0dQ/exec";

  const rsvp = document.getElementById("rsvp-form");
  const note = document.getElementById("note-form");
  const list = document.getElementById("notes");
  const listStatus = document.getElementById("notes-status");

  function syncCount() {
    const attending = rsvp.elements.attendance.value === "참석";
    document.getElementById("count-field").hidden = !attending;
    rsvp.elements.count.disabled = !attending;
    rsvp.elements.count.required = attending;
  }
  rsvp.elements.attendance.addEventListener("change", syncCount);
  syncCount();

  async function request(options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(endpoint, { ...options, signal: controller.signal, credentials: "omit", cache: "no-store" });
      if (!response.ok) throw new Error("http");
      const result = await response.json();
      if (result.ok !== true) throw new Error("rejected");
      return result;
    } finally {
      clearTimeout(timeout);
    }
  }

  let lastRead = 0;
  async function showNotes() {
    const read = ++lastRead;
    listStatus.textContent = "공개된 축하 글을 불러오고 있어요.";
    try {
      const { entries } = await request({ method: "GET" });
      if (read !== lastRead) return;
      const cards = entries.map(({ name, message, date }) => {
        const item = document.createElement("li");
        const author = document.createElement("strong");
        const header = document.createElement("header");
        const when = document.createElement("time");
        const body = document.createElement("p");
        author.textContent = name;
        when.textContent = date;
        body.textContent = message;
        header.append(author, when);
        item.append(header, body);
        return item;
      });
      list.replaceChildren(...cards);
      listStatus.textContent = cards.length ? "" : "아직 공개된 축하 글이 없어요.";
    } catch {
      if (read === lastRead) listStatus.textContent = "공개된 축하 글을 불러오지 못했어요. 잠시 후 다시 열어주세요.";
    }
  }

  function connect(form, kind) {
    const fields = form.querySelector("fieldset");
    const status = form.querySelector(".form-status");
    let lastPayload = null;
    let requestId;
    fields.disabled = false;
    status.textContent = "";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (fields.disabled) return;
      const data = new URLSearchParams(new FormData(form));
      for (const key of ["name", "message"]) {
        if (!data.has(key)) continue;
        const value = data.get(key).trim();
        if (!value) {
          status.textContent = key === "name" ? "이름을 입력해 주세요." : "축하 글을 입력해 주세요.";
          form.elements[key].focus();
          return;
        }
        data.set(key, value);
      }
      data.set("kind", kind);
      if (kind === "rsvp" && data.get("attendance") === "불참") data.set("count", "0");
      const payload = data.toString();
      if (payload !== lastPayload) {
        requestId = crypto.randomUUID();
        lastPayload = payload;
      }
      data.set("id", requestId);
      fields.disabled = true;
      status.textContent = "보내는 중이에요…";
      try {
        await request({ method: "POST", body: data });
        form.reset();
        lastPayload = null;
        if (kind === "rsvp") {
          syncCount();
          status.textContent = "참석 응답이 전달되었어요. 알려주셔서 감사합니다.";
        } else {
          const shared = data.get("visible") === "yes";
          status.textContent = shared ? "축하 글이 방명록에 등록되었어요." : "두 사람에게만 축하 글을 전달했어요.";
          if (shared) void showNotes();
        }
      } catch {
        status.textContent = "저장을 확인하지 못했어요. 잠시 후 같은 내용으로 다시 보내주세요.";
      } finally {
        fields.disabled = false;
      }
    });
  }

  connect(rsvp, "rsvp");
  connect(note, "note");
  void showNotes();
})();
