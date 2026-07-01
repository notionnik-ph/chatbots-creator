(function () {
  'use strict';

  var script = document.currentScript;
  var config = window.ChatbotConfig || {};
  var botId = config.botId || (script && script.getAttribute('data-bot-id'));
  if (!botId) { console.error('[Chatbot] Missing botId. Set window.ChatbotConfig.botId before loading the script.'); return; }

  var source = script && script.src;
  var baseUrl = (config.baseUrl || (script && script.getAttribute('data-base-url')) || (source ? new URL(source).origin : '')).replace(/\/$/, '');
  if (!baseUrl) { console.error('[Chatbot] Unable to determine the chatbot application URL.'); return; }
  var position = config.position === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  var primaryColor = config.primaryColor || '#6366f1';
  var launcherId = 'cb-launcher-' + botId;
  if (document.getElementById(launcherId)) return;

  var style = document.createElement('style');
  style.textContent = '#' + launcherId + '{position:fixed;' + (position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:20px;z-index:2147483640}' +
    '#' + launcherId + ' .cb-btn{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:' + primaryColor + ';color:#fff;font-size:23px;box-shadow:0 4px 20px rgba(0,0,0,.35)}' +
    '#cb-frame-' + botId + '{position:fixed;' + (position === 'bottom-left' ? 'left:20px;' : 'right:20px;') + 'bottom:88px;width:380px;height:560px;max-width:calc(100vw - 32px);max-height:calc(100vh - 108px);border:0;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);z-index:2147483639;transition:opacity .25s,transform .25s}' +
    '#cb-frame-' + botId + '.cb-hidden{opacity:0;transform:scale(.92) translateY(12px);pointer-events:none}';
  document.head.appendChild(style);

  var frame = document.createElement('iframe');
  frame.id = 'cb-frame-' + botId;
  frame.src = baseUrl + '/widget/' + encodeURIComponent(botId);
  frame.className = 'cb-hidden';
  frame.setAttribute('title', 'Chat widget');
  frame.setAttribute('allow', 'microphone');
  document.body.appendChild(frame);

  var launcher = document.createElement('div'); launcher.id = launcherId;
  launcher.innerHTML = '<button class="cb-btn" type="button" aria-label="Open chat">💬</button>';
  document.body.appendChild(launcher);
  var open = false;
  function setOpen(next) { open = next; frame.classList.toggle('cb-hidden', !next); launcher.querySelector('.cb-btn').textContent = next ? '×' : '💬'; }
  launcher.querySelector('.cb-btn').addEventListener('click', function () { setOpen(!open); });
  window.addEventListener('message', function (event) { if (event.origin === baseUrl && event.data && event.data.type === 'chatbot:close' && event.data.botId === botId) setOpen(false); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && open) setOpen(false); });
})();
