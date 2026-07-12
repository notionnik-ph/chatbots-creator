(function () {
  "use strict";

  var script = document.currentScript;
  var config = window.ChatbotConfig || {};
  var botId = config.botId || (script && script.getAttribute("data-bot-id"));

  if (!botId) {
    console.error(
      "[Chatbot] Missing botId. Set window.ChatbotConfig.botId before loading the script.",
    );
    return;
  }

  var source = script && script.src;
  var baseUrl = (
    config.baseUrl ||
    (script && script.getAttribute("data-base-url")) ||
    (source ? new URL(source).origin : "")
  ).replace(/\/$/, "");

  if (!baseUrl) {
    console.error("[Chatbot] Unable to determine the chatbot application URL.");
    return;
  }

  var position =
    config.position === "bottom-left" ? "bottom-left" : "bottom-right";
  var primaryColor = config.primaryColor || "#6366f1";
  var launcherId = "cb-launcher-" + botId;
  var frameId = "cb-frame-" + botId;

  if (document.getElementById(launcherId)) return;

  var chatIcon =
    '<svg class="cb-icon cb-chat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M6.75 6.5H17.25C18.35 6.5 19.25 7.4 19.25 8.5V14.25C19.25 15.35 18.35 16.25 17.25 16.25H11.2L7.65 18.65C7.32 18.87 6.88 18.64 6.88 18.24V16.25H6.75C5.65 16.25 4.75 15.35 4.75 14.25V8.5C4.75 7.4 5.65 6.5 6.75 6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M8.5 10.85H8.51" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M12 10.85H12.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M15.5 10.85H15.51" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
    "</svg>";

  var closeIcon =
    '<svg class="cb-icon cb-close-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M7.5 7.5L16.5 16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M16.5 7.5L7.5 16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
    "</svg>";

  var style = document.createElement("style");

  style.textContent =
    "#" +
    launcherId +
    "{position:fixed;" +
    (position === "bottom-left" ? "left:20px;" : "right:20px;") +
    "bottom:20px;z-index:2147483640}" +
    "#" +
    launcherId +
    " .cb-btn{" +
    "width:64px;height:64px;border-radius:22px;border:1px solid rgba(255,255,255,.24);" +
    "cursor:pointer;background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.38),transparent 28%),linear-gradient(135deg," +
    primaryColor +
    ",#0f172a 78%);" +
    "color:#fff;display:flex;align-items:center;justify-content:center;" +
    "box-shadow:0 22px 60px rgba(0,0,0,.42),0 0 0 6px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.3);" +
    "transition:transform .22s ease,box-shadow .22s ease,filter .22s ease,border-radius .22s ease;" +
    "backdrop-filter:blur(14px);" +
    "}" +
    "#" +
    "#" +
    launcherId +
    " .cb-btn{" +
    "width:58px;height:58px;border-radius:999px;border:0;" +
    "cursor:pointer;background:" +
    primaryColor +
    ";" +
    "color:#071014;display:flex;align-items:center;justify-content:center;" +
    "box-shadow:0 10px 28px rgba(0,0,0,.28);" +
    "transition:transform .18s ease,box-shadow .18s ease;" +
    "}" +
    "#" +
    launcherId +
    " .cb-btn:hover{" +
    "transform:translateY(-2px);" +
    "box-shadow:0 14px 34px rgba(0,0,0,.34);" +
    "}" +
    "#" +
    launcherId +
    " .cb-btn:active{" +
    "transform:translateY(0) scale(.96);" +
    "}" +
    "#" +
    launcherId +
    " .cb-icon{" +
    "width:30px;height:30px;display:block;" +
    "}" +
    "#" +
    launcherId +
    " .cb-close-icon{" +
    "width:27px;height:27px;" +
    "}" +
    "#" +
    launcherId +
    " .cb-badge{" +
    "position:absolute;top:5px;right:5px;width:10px;height:10px;" +
    "border-radius:999px;background:#ef4444;border:2px solid " +
    primaryColor +
    ";" +
    "box-shadow:0 2px 8px rgba(239,68,68,.45);" +
    "pointer-events:none;" +
    "}" +
    "#" +
    launcherId +
    ".cb-open .cb-badge{" +
    "display:none;" +
    "}" +
    "#cb-frame-" +
    botId +
    "{position:fixed;" +
    (position === "bottom-left" ? "left:20px;" : "right:20px;") +
    "bottom:92px;width:380px;height:560px;max-width:calc(100vw - 32px);max-height:calc(100vh - 108px);" +
    "border:0;border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.48);" +
    "z-index:2147483639;transition:opacity .25s ease,transform .25s ease;" +
    "overflow:hidden;background:#111118;" +
    "}" +
    "#cb-frame-" +
    botId +
    ".cb-hidden{" +
    "opacity:0;transform:scale(.94) translateY(14px);pointer-events:none;" +
    "}" +
    "@media (max-width:480px){" +
    "#cb-frame-" +
    botId +
    "{left:16px;right:16px;bottom:88px;width:auto;height:calc(100vh - 120px);}" +
    "#" +
    launcherId +
    "{bottom:16px;" +
    (position === "bottom-left" ? "left:16px;" : "right:16px;") +
    "}" +
    "}";

  document.head.appendChild(style);

  var frame = document.createElement("iframe");
  frame.id = frameId;
  frame.src = baseUrl + "/widget/" + encodeURIComponent(botId);
  frame.className = "cb-hidden";
  frame.setAttribute("title", "Chat widget");
  frame.setAttribute("allow", "microphone; clipboard-read; clipboard-write");
  document.body.appendChild(frame);

  var launcher = document.createElement("div");
  launcher.id = launcherId;
  launcher.innerHTML =
    '<button class="cb-btn" type="button" aria-label="Open chat">' +
    chatIcon +
    "</button>" +
    '<span class="cb-badge" aria-hidden="true"></span>';

  document.body.appendChild(launcher);

  var open = false;
  var button = launcher.querySelector(".cb-btn");

  function setOpen(next) {
    open = next;
    frame.classList.toggle("cb-hidden", !next);
    launcher.classList.toggle("cb-open", next);
    button.innerHTML = next ? closeIcon : chatIcon;
    button.setAttribute("aria-label", next ? "Close chat" : "Open chat");
  }

  button.addEventListener("click", function () {
    setOpen(!open);
  });

  window.addEventListener("message", function (event) {
    if (
      event.origin === baseUrl &&
      event.data &&
      event.data.type === "chatbot:close" &&
      event.data.botId === botId
    ) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && open) {
      setOpen(false);
    }
  });
})();
