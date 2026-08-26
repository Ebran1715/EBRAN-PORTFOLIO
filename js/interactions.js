const skillData={
  NETWORKING:["TCP/IP","OSI Model","IPv4 / IPv6","Subnetting","VLSM","Ethernet","MAC Addressing","ARP","TCP / UDP","ICMP","VLAN","Access Port","Trunking","802.1Q","Inter-VLAN Routing","STP / RSTP","EtherChannel / LACP","Static Routing","Default Routing","RIP","OSPF","EIGRP","Routing Tables","DHCP","DNS","NAT / PAT","ACL","SSH","SNMP","Syslog","NTP","Port Security","DHCP Snooping","Dynamic ARP Inspection","Cisco Packet Tracer","Network Troubleshooting","Ping / Traceroute","Routing & Switching","Network Monitoring","Incident Troubleshooting"],
  MONITORING:["Zabbix Tool Creation","Zabbix Windows Server Monitoring","Zabbix Windows Workstation Monitoring","Checkmk","Motadata","24/7 Monitoring","Incident Management","SLA Compliance","Escalation"],
  SYSTEMS:["Linux","Basic Administration","Logs","VMware","VM Monitoring","Snapshots","Windows Server","Windows Workstations"],
  DEVELOPMENT:["HTML","CSS","JavaScript","Node.js","MySQL","Python Basics"]
};

export function initInteractions(ctx){
  const skillPanel=document.querySelector("#skill-panel");
  const experienceSpotlight=document.querySelector("#experience-spotlight");
  const navSpotlight=document.querySelector("#nav-spotlight");
  const closeSpotlight=(element)=>{
    if(!element) return;
    element.classList.remove("open");
    element.setAttribute("aria-hidden","true");
    clearTimeout(element.autoCloseTimer);
  };
  const scheduleAutoClose=(element)=>{
    if(!element) return;
    clearTimeout(element.autoCloseTimer);
    element.autoCloseTimer=setTimeout(()=>closeSpotlight(element),2000);
  };
  const navContent={
    home:{eyebrow:"EBRAN HUSAIN / NOC ENGINEER",title:"INFRASTRUCTURE\nIN MOTION.",text:"A cinematic portfolio exploring the systems, skills and experience behind reliable 24/7 operations.",tags:["NOC ENGINEER","24/7 OPERATIONS"]},
    experience:{eyebrow:"PROFESSIONAL JOURNEY",title:"THE OPERATOR.",text:"NOC Technician at CAS Cloud Pvt. Ltd. Monitoring infrastructure, responding to incidents and supporting business-critical systems.",tags:["2022 — CURRENT","CAS CLOUD"]},
    skills:{eyebrow:"SKILL NETWORK",title:"THE TOOLSET.",text:"Explore networking, monitoring, systems and development capabilities from the central skill network.",tags:["NETWORKING","MONITORING","SYSTEMS","DEVELOPMENT"]},
    projects:{eyebrow:"BUILDING",title:"AFTER HOURS.",text:"Selected projects created with HTML, CSS, JavaScript, Node.js and MySQL, plus enterprise design, dynamic routing, security, services and wireless labs in Cisco Packet Tracer.",tags:["CISCO PACKET TRACER","WIRELESS","OSPF / EIGRP","NETWORK SECURITY"]},
    education:{eyebrow:"FOUNDATION",title:"B.TECH.",text:"Computer Science Engineering foundation from Maharishi Markandeshwar (Deemed To Be University), completed in 2021.",tags:["COMPUTER SCIENCE","2021"]},
    contact:{eyebrow:"CONNECTION",title:"LET'S CONNECT.",text:"For opportunities, collaboration or a conversation about technology and infrastructure.",tags:["EMAIL","PHONE","LINKEDIN","NEPAL"]}
  };

  function openNavSpotlight(id){
    const content=navContent[id];
    if(!content || !navSpotlight) return;
    navSpotlight.querySelector(".eyebrow").textContent=content.eyebrow;
    navSpotlight.querySelector("h2").innerHTML=content.title.replace("\n","<br>");
    navSpotlight.querySelector("p").textContent=content.text;
    navSpotlight.querySelector(".spotlight-tags").innerHTML=content.tags.map(tag=>`<span>${tag}</span>`).join("");
    navSpotlight.classList.remove("open");
    requestAnimationFrame(()=>navSpotlight.classList.add("open"));
    navSpotlight.setAttribute("aria-hidden","false");
    scheduleAutoClose(navSpotlight);
  }

  function openSkill(node){
    document.querySelectorAll(".skill-node").forEach(n=>n.classList.remove("active"));
    node.classList.add("active");
    const key=node.dataset.skill;
    skillPanel.innerHTML=`<span class="eyebrow">${key}</span><h3>${key}</h3><p>${skillData[key].join(" · ")}</p><button class="skill-panel-close" type="button" aria-label="Close skill spotlight">×</button>`;
    skillPanel.classList.remove("open");
    requestAnimationFrame(()=>skillPanel.classList.add("open"));
    skillPanel.querySelector(".skill-panel-close").addEventListener("click",()=>closeSpotlight(skillPanel));
    skillPanel.setAttribute("aria-hidden","false");
    ctx?.setSection?.(3);
  }

  document.querySelectorAll(".skill-node").forEach(node=>{
    node.addEventListener("mouseenter",()=>{
      clearTimeout(skillPanel.autoCloseTimer);
      openSkill(node);
    });
    node.addEventListener("mouseleave",()=>closeSpotlight(skillPanel));
    node.addEventListener("click",()=>openSkill(node));
  });

  const initialPanel=skillPanel;
  initialPanel?.querySelector(".skill-panel-close")?.addEventListener("click",()=>closeSpotlight(initialPanel));
  experienceSpotlight?.querySelector(".content-spotlight-close")?.addEventListener("click",()=>{
    closeSpotlight(experienceSpotlight);
  });
  navSpotlight?.querySelector(".nav-spotlight-close")?.addEventListener("click",()=>{
    closeSpotlight(navSpotlight);
  });

  document.querySelectorAll(".nav nav a").forEach(link=>{
    link.addEventListener("click",()=>{
      const id=link.getAttribute("href")?.slice(1);
      setTimeout(()=>openNavSpotlight(id),650);
    });
  });

  const sound=document.querySelector("#sound-toggle");
  let on=false;
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;

  const ensureAudio = () => {
    if (audioCtx) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    audioCtx = new AudioCtor();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 220;
    gainNode.gain.value = 0.0001;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
  };

  sound?.addEventListener("click", async () => {
    ensureAudio();
    if (!audioCtx || !gainNode || !oscillator) return;

    on = !on;
    sound.textContent = on ? "SOUND ON" : "SOUND OFF";
    sound.setAttribute("aria-pressed", String(on));

    const target = on ? 0.03 : 0.0001;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(target, audioCtx.currentTime + 0.12);

    if (on) {
      oscillator.frequency.setTargetAtTime(220, audioCtx.currentTime, 0.1);
    } else {
      oscillator.frequency.setTargetAtTime(110, audioCtx.currentTime, 0.1);
    }
  });

  // Small parallax on desktop.
  addEventListener("pointermove",e=>{
    if(innerWidth<900) return;
    document.querySelectorAll(".section-copy").forEach((el,i)=>{
      const r=el.getBoundingClientRect();
      if(r.top<innerHeight && r.bottom>0){
        el.style.transform=`translate3d(${(e.clientX/innerWidth-.5)*4}px,${(e.clientY/innerHeight-.5)*3}px,0)`;
      }
    });
  });
}
