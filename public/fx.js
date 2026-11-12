(function(){var D=document,L=D.documentElement.dataset.layout,R=Math.random;
if(L=="star")D.querySelectorAll(".dust i").forEach(function(i){i.style.top=R()*100+"%";i.style.bottom="auto"});
if(L=="mehndi")D.querySelectorAll("main section").forEach(function(s){s.insertAdjacentHTML("afterbegin",'<svg class="vine" viewBox="0 0 200 30"><path d="M5 15C30 0 40 30 65 15S100 0 100 15S140 30 165 15S190 0 195 15"/></svg>')});
if(L=="neon"){var c=D.createElement("canvas"),x=c.getContext("2d"),P=[];c.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:2";D.body.appendChild(c);
function rs(){c.width=innerWidth;c.height=innerHeight}rs();addEventListener("resize",rs);
function boom(){var X=R()*c.width,Y=R()*c.height*.5+40,h=R()*360,i,a,v;for(i=0;i<48;i++){a=i/48*6.283;v=1+R()*3;P.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,h:h})}}
(function f(){x.clearRect(0,0,c.width,c.height);P=P.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.vx*=.985;p.l-=.012;if(p.l>0){x.fillStyle="hsla("+p.h+",100%,65%,"+p.l+")";x.fillRect(p.x,p.y,3,3)}return p.l>0});requestAnimationFrame(f)})();
D.getElementById("openBtn").addEventListener("click",function(){boom();setInterval(boom,1800)})}
var cp=D.getElementById("cp"),sh=D.getElementById("shr"),A="बनबैरिया, पोस्ट जमुनिया, थाना सहोदरा, चम्पारण, बिहार";
if(cp)cp.onclick=function(){(navigator.clipboard?navigator.clipboard.writeText(A):Promise.reject()).then(function(){cp.textContent="✓ पता कॉपी हुआ"},function(){cp.textContent=A})};
if(sh)sh.onclick=function(){if(navigator.share)navigator.share({title:"शुभ विवाह – स्थान",url:sh.dataset.u}).catch(function(){});else cp.click()};
})();
