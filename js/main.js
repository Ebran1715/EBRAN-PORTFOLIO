import { initScene } from "./scene.js";
import { initCamera } from "./camera.js";
import { initMonitoring } from "./monitoring.js";
import { initNetwork } from "./network.js";
import { initProjects } from "./projects.js";
import { initAnimations } from "./animations.js";
import { initInteractions } from "./interactions.js";

const loader = document.querySelector("#loader");
const percent = document.querySelector("#loader-percent");
const status = document.querySelector("#loader-status");
const messages = [
  "INITIALIZING SYSTEM",
  "LOADING INFRASTRUCTURE",
  "CONNECTING NODES",
  "STARTING MONITORING",
  "SYSTEM READY"
];

let progress = 0;
const timer = setInterval(() => {
  progress += Math.ceil(Math.random() * 9);
  if (progress > 100) progress = 100;
  percent.textContent = String(progress).padStart(2,"0") + "%";
  status.textContent = messages[Math.min(messages.length - 1, Math.floor(progress / 22))];
  if(progress >= 100){
    clearInterval(timer);
    setTimeout(() => {
      loader.classList.add("hide");
      document.body.classList.add("loaded");
      document.querySelectorAll(".reveal").forEach(el => {
        const r = el.getBoundingClientRect();
        if(r.top < innerHeight * .92) el.classList.add("visible");
      });
    }, 550);
  }
}, 90);

const scene = initScene();
initCamera(scene);
initMonitoring(scene);
initNetwork(scene);
initProjects();
initAnimations();
initInteractions(scene);
