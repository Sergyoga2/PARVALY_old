export function scrollToAudit(topic = 'all') {
  window.dispatchEvent(new CustomEvent('set-audit-topic', { detail: topic }));
  document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
}
