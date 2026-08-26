export function initMonitoring(ctx){
  if(!ctx?.scene) return;
  const pulse=document.createElement("div");
  pulse.style.display="none";
  // Visual monitoring effects are primarily handled by the HTML dashboard.
  // This module is kept separate so real telemetry can be integrated later.
}
