// Draws the "scan to join" QR code on the full-page wall. Needs the qrcodejs library (cdnjs); if it
// cannot load (offline), the QR box hides itself and the join URL printed beside it still works.
(function () {
  const box = document.getElementById('wall-qr');
  if (!box) return;
  const url = location.href.replace(/[^/]*$/, '').replace(/[?#].*$/, '') + 'learn.html';
  const caption = document.getElementById('wall-qr-url');
  if (caption) caption.textContent = url.replace(/^https?:\/\//, '');
  if (typeof QRCode === 'undefined') { box.closest('.wall-qr').hidden = true; return; }
  new QRCode(box, { text: url, width: 200, height: 200, colorDark: '#1f1b3a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
})();
