(() => {
  const section = document.getElementById("gifts");
  if (!section) return;
  const status = section.querySelector(".gift-copy-status");
  const groups = section.querySelectorAll(".gift-group");

  // Keep the accordion usable in browsers that do not support details[name].
  groups.forEach((group) => {
    group.addEventListener("toggle", () => {
      if (group.open) groups.forEach((other) => {
        if (other !== group) other.open = false;
      });
    });
  });

  function fallbackCopy(value) {
    const field = document.createElement("textarea");
    const focused = document.activeElement;
    field.value = value;
    field.readOnly = true;
    field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;";
    document.body.append(field);
    try {
      field.focus({ preventScroll: true });
      field.select();
      field.setSelectionRange(0, value.length);
      if (!document.execCommand("copy")) throw new Error("copy-failed");
    } finally {
      field.remove();
      if (focused && typeof focused.focus === "function") focused.focus({ preventScroll: true });
    }
  }

  section.querySelectorAll(".gift-copy").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.account;
      status.textContent = "";
      button.disabled = true;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(value);
          } catch {
            fallbackCopy(value);
          }
        } else {
          fallbackCopy(value);
        }
        status.textContent = `${button.dataset.accountLabel} 계좌번호를 복사했어요.`;
      } catch {
        status.textContent = "복사하지 못했어요. 계좌번호를 길게 눌러 직접 복사해 주세요.";
      } finally {
        button.disabled = false;
        button.focus({ preventScroll: true });
      }
    });
  });
})();
