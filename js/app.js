import {searchMalAnime,searchMalGenre,getMalAnime,getMalAnimeByIds,getMalRanking} from "./mal.js";
const K={w:"aniscroll:watchlist:v1",h:"aniscroll:history:v1"},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),title=a=>a?.title?.english||a?.title?.romaji||a?.title?.native||"Untitled anime",cover=a=>a?.coverImage?.extraLarge||a?.coverImage?.large||"https://placehold.co/420x630/171827/d8b4fe?text=Anime",score=a=>a?.averageScore?(a.averageScore/10).toFixed(1):"NR",meta=a=>[a.format,a.seasonYear,a.episodes?Number(a.episodes)+" eps":null].filter(Boolean).join(" · ");
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{toast("Browser storage is unavailable")}}function toast(s){let n=$("#toast");if(!n){n=document.createElement("div");n.id="toast";n.className="toast";document.body.append(n)}n.textContent=s;n.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove("show"),2200)}
function header(){const slot=$("#site-header");if(!slot)return;const p=location.pathname;slot.innerHTML='<header class="site-header"><a class="brand" href="/index.html"><span class="brand-mark">A</span><span class="brand-name">ani<span class="violet">scroll</span><small class="brand-tag">YOUR ANIME UNIVERSE</small></span></a><nav id="main-nav" class="main-nav"><a class="nav-link" href="/index.html">Home</a><a class="nav-link" href="/search.html">Discover</a><a class="nav-link" href="/schedule.html">Schedule</a><a class="nav-link" href="/watchlist.html">Watchlist</a><a class="nav-link" href="/history.html">History</a></nav><form class="header-search" id="header-search"><span>⌕</span><input name="q" type="search" placeholder="Search anime…" aria-label="Search anime"><kbd>↵</kbd></form><button class="mobile-menu" id="mobile-menu" aria-label="Toggle navigation">☰</button></header>';$$(".nav-link").forEach(a=>{if(a.pathname===p)a.classList.add("active")});$("#header-search").addEventListener("submit",e=>{e.preventDefault();const q=new FormData(e.currentTarget).get("q")?.toString().trim();if(q)location.href="/search.html?q="+encodeURIComponent(q)});const menuButton=$("#mobile-menu"),mainNav=$("#main-nav");menuButton.setAttribute("aria-controls","main-nav");menuButton.setAttribute("aria-expanded","false");menuButton.addEventListener("click",()=>{const open=mainNav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Close navigation":"Open navigation");menuButton.textContent=open?"×":"☰"});mainNav.addEventListener("click",e=>{if(e.target.closest(".nav-link")){mainNav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Open navigation");menuButton.textContent="☰"}});document.addEventListener("click",e=>{if(!e.target.closest(".site-header")&&mainNav.classList.contains("open")){mainNav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Open navigation");menuButton.textContent="☰"}})}
function footer(){const n=$("#site-footer");if(n)n.innerHTML='<footer class="site-footer"><div class="footer-inner"><a href="/index.html" class="footer-brand">ani<span>scroll</span></a><p class="footer-note">Anime metadata powered by MyAnimeList. Aniscroll is an independent fan project.</p><nav class="footer-links"><a href="/search.html">Discover</a><a href="/watchlist.html">Watchlist</a><a href="/history.html">History</a><a href="https://myanimelist.net" target="_blank" rel="noreferrer">MyAnimeList ↗</a></nav></div></footer>'}
function card(a,ep){
 const id=Number(a.id),mal=id,watchQuery="source=mal&id="+id+"&mal="+id+"&ep="+Number(ep||1),watchUrl="/watch.html?"+watchQuery,watchBase="source=mal&id="+id+"&mal="+id,genres=Array.isArray(a.genres)?a.genres.slice(0,6):[],description=String(a.description||"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim();
 const names=[a.title?.english,a.title?.romaji].filter((v,i,arr)=>v&&v!==title(a)&&arr.indexOf(v)===i).slice(0,2);
 const status=a.status==="RELEASING"?"Currently Airing":a.status==="FINISHED"?"Finished":a.status==="NOT_YET_RELEASED"?"Upcoming":String(a.status||"Unknown").replace(/_/g," ");
 return '<article class="poster-card poster-hover-card"><a class="poster-cover" href="/watch.html?'+watchBase+'"><img src="'+esc(cover(a))+'" alt="'+esc(title(a))+'" loading="lazy" referrerpolicy="no-referrer"><span class="poster-score">★ '+score(a)+'</span><span class="poster-format">'+(ep?'EP '+Number(ep):esc(a.format||"ANIME"))+'</span><span class="poster-overlay"><span class="play-orb">▶</span></span></a><a class="poster-title" href="/watch.html?'+watchBase+'">'+esc(title(a))+'</a><div class="poster-meta">'+esc(meta(a)||"Anime")+'</div><div class="poster-hover-details"><a class="hover-detail-title" href="/watch.html?'+watchBase+'">'+esc(title(a))+'</a><div class="hover-badges"><span>'+esc(a.format||"ANIME")+'</span><span>HD</span><span>★ '+score(a)+'</span></div><p class="hover-description">'+esc(description?description.slice(0,230)+(description.length>230?"…":""):"Synopsis unavailable.")+'</p>'+(names.length?'<p class="hover-alt-names"><strong>Other names:</strong> '+esc(names.join("; "))+'</p>':"")+'<div class="hover-stats"><span>Score: '+score(a)+'</span><span>Year: '+esc(a.seasonYear||a.startDate?.year||"—")+'</span><span>Duration: '+(a.duration?Number(a.duration)+" min":"—")+'</span><span>Status: '+esc(status)+'</span></div>'+(genres.length?'<div class="hover-genres"><strong>Genre:</strong> '+genres.map(g=>esc(g)).join(", ")+'</div>':"")+'<div class="hover-actions"><a href="'+watchUrl+'">▶ Watch</a>'+('<button type="button" class="hover-save" data-id="'+id+'">'+(isSaved(id)?"✓ In List":"+ Add to List")+'</button>')+'</div></div></article>'
}
function draw(n,items,msg="No anime found"){if(!n)return;n.innerHTML=items?.length?items.map(a=>card(a)).join(""):'<div class="empty-state"><span>✧</span><h2>'+esc(msg)+'</h2><p>Try another title or filter.</p><a class="button button-primary" href="/search.html">Discover anime</a></div>';$$(".hover-save",n).forEach(b=>b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const saved=toggleSaved(Number(b.dataset.id));b.textContent=saved?"✓ In List":"+ Add to List"}))}
function getList(){return read(K.w)}function isSaved(id){return getList().some(x=>Number(x.id)===Number(id))}function toggleSaved(id){const l=getList();if(isSaved(id)){write(K.w,l.filter(x=>Number(x.id)!==Number(id)));toast("Removed from watchlist");return false}l.unshift({id:Number(id),status:"planned",addedAt:Date.now()});write(K.w,l);toast("Added to watchlist");return true}function record(a,ep){const old=read(K.h),v={id:Number(a.id),episode:Number(ep),title:title(a),image:cover(a),source:"mal",malId:Number(a.idMal)||0,watchedAt:Date.now()};write(K.h,[v,...old.filter(x=>!(Number(x.id)===v.id&&Number(x.episode)===v.episode))].slice(0,60))}
function drawHistory(n,list){if(!n)return;if(!list.length){n.innerHTML='<div class="empty-state"><span>◷</span><h2>Your story continues here</h2><p>Open an episode and it will appear in history.</p><a class="button button-primary" href="/search.html">Find anime</a></div>';return}n.innerHTML=list.map(x=>'<article class="poster-card"><a class="poster-cover" href="/watch.html?'+(x.source==="mal"?'source=mal&mal='+Number(x.malId||x.id)+'&id='+Number(x.id):'id='+Number(x.id))+'&ep='+Number(x.episode||1)+'"><img src="'+esc(x.image||"")+'" alt="" loading="lazy"><span class="poster-format">EP '+Number(x.episode||1)+'</span></a><a class="poster-title" href="/watch.html?'+(x.source==="mal"?'source=mal&mal='+Number(x.malId||x.id)+'&id='+Number(x.id):'id='+Number(x.id))+'&ep='+Number(x.episode||1)+'">'+esc(x.title||"Continue watching")+'</a><div class="poster-meta">'+new Date(x.watchedAt||Date.now()).toLocaleDateString()+'</div></article>').join("")}
async function home(){
 let featured=[],active=0,slideTimer;const heroImage=$("#hero-image"),heroTitle=$("#hero-title"),heroMeta=$("#hero-meta"),heroDescription=$("#hero-description"),watch=$("#hero-watch"),details=$("#hero-details"),pagination=$("#hero-pagination");
 const setSlide=index=>{if(!featured.length)return;active=(index+featured.length)%featured.length;const a=featured[active],id=Number(a.id);heroImage.style.backgroundImage='url("'+cover(a)+'")';heroTitle.textContent=title(a);heroMeta.innerHTML='<span>▶ '+esc(a.format||"TV")+'</span><span>▦ '+esc(a.seasonYear||"Anime")+'</span><span class="score">★ '+score(a)+'</span>';heroDescription.textContent=a.description||"Discover your next favorite anime.";watch.href="/watch.html?source=mal&id="+id+"&mal="+id+"&ep=1";details.href=watch.href;$("#hero-rank").textContent="#"+(active+1)+" SPOTLIGHT";pagination.innerHTML=featured.map((_,i)=>'<button type="button" class="'+(i===active?"active":"")+'" data-slide="'+i+'" aria-label="Show featured anime '+(i+1)+'"></button>').join("");$$("[data-slide]",pagination).forEach(b=>b.addEventListener("click",()=>{setSlide(Number(b.dataset.slide));restartTimer()}))};
 const restartTimer=()=>{clearInterval(slideTimer);if(featured.length>1)slideTimer=setInterval(()=>setSlide(active+1),8000)};$("#hero-prev")?.addEventListener("click",()=>{setSlide(active-1);restartTimer()});$("#hero-next")?.addEventListener("click",()=>{setSlide(active+1);restartTimer()});
 const loaders=[["trending-grid",()=>getMalRanking("TRENDING",1,12)],["popular-grid",()=>getMalRanking("POPULARITY",1,6)],["season-grid",()=>getMalRanking("AIRING",1,6)]];
 await Promise.all(loaders.map(async([id,fn])=>{try{const r=await fn(),items=r.media||[];draw($("#"+id),items);if(id==="trending-grid"&&items.length){featured=items.slice(0,8);setSlide(0);restartTimer()}}catch(e){const grid=$("#"+id);if(grid)grid.innerHTML='<div class="empty-state"><h2>Could not load anime</h2><p>'+esc(e.message)+'</p><button class="button button-quiet" data-home-retry="'+id+'">Retry</button></div>';$$("[data-home-retry='"+id+"']").forEach(b=>b.addEventListener("click",()=>fn().then(r=>draw(grid,r.media||[])).catch(err=>toast(err.message))))}}));
 const h=read(K.h).slice(0,6);if(h.length){$("#continue-section").hidden=false;try{const aa=await getMalAnimeByIds(h.map(x=>x.malId||x.id)),m=new Map(aa.map(x=>[Number(x.id),x]));$("#continue-grid").innerHTML=h.map(x=>m.has(Number(x.malId||x.id))?card(m.get(Number(x.malId||x.id)),x.episode):"").join("")}catch{}}
}

async function searchPage(){
 const form=$("#search-form"),q=$("#query-input"),f=$("#format-filter"),s=$("#status-filter"),g=$("#genre-filter"),season=$("#season-filter"),year=$("#year-filter"),sort=$("#sort-filter"),params=new URLSearchParams(location.search);
 q.value=params.get("q")||"";f.value=params.get("format")||"";s.value=params.get("status")||"";if(g)g.value=params.get("genre")||"";if(season)season.value=params.get("season")||"";if(year)year.value=params.get("year")||"";sort.value=params.get("sort")||"TRENDING_DESC";let page=Math.max(1,Number(params.get("page"))||1);
 async function load(){const grid=$("#search-results");grid.innerHTML=Array.from({length:12},()=>'<div class="loading-card"></div>').join("");$("#results-title").textContent=q.value.trim()?'Results for "'+q.value.trim()+'"':"Explore anime";$("#results-count").textContent="Searching MyAnimeList…";
 try{let r;if(g?.value)r=await searchMalGenre(g.value,page);else if(q.value.trim())r=await searchMalAnime(q.value.trim());else r=await getMalRanking(sort.value==="TRENDING_DESC"?"TRENDING":sort.value==="POPULARITY_DESC"?"POPULARITY":sort.value==="SCORE_DESC"?"SCORE":sort.value==="START_DATE_DESC"?"NEWEST":"TRENDING",page,24);
 const items=(r.media||[]).filter(a=>(!f.value||String(a.format||"").toUpperCase()===f.value)&&(!s.value||String(a.status||"").toUpperCase()===s.value)&&(!season?.value||String(a.season||"").toUpperCase()===season.value)&&(!year?.value||Number(a.seasonYear)===Number(year.value)));draw(grid,items,"No matching anime");$("#results-count").textContent="MyAnimeList · "+Number(r.pageInfo?.total||items.length).toLocaleString()+" titles · Page "+(r.pageInfo?.currentPage||page)+" of "+(r.pageInfo?.lastPage||1);
 const u=new URL(location.href);["q","format","status","genre","season","year","sort","page"].forEach(k=>u.searchParams.delete(k));if(q.value.trim())u.searchParams.set("q",q.value.trim());if(f.value)u.searchParams.set("format",f.value);if(s.value)u.searchParams.set("status",s.value);if(g?.value)u.searchParams.set("genre",g.value);if(season?.value)u.searchParams.set("season",season.value);if(year?.value)u.searchParams.set("year",year.value);if(sort.value)u.searchParams.set("sort",sort.value);if(page>1)u.searchParams.set("page",String(page));history.replaceState({},"",u);
 const current=r.pageInfo?.currentPage||page,last=Math.max(1,r.pageInfo?.lastPage||1),p=$("#pagination");p.innerHTML='<button class="page-button" data-page="'+(current-1)+'" '+(current<=1?'disabled':'')+'>← Previous</button><span class="muted">Page '+current+' / '+last+'</span><button class="page-button" data-page="'+(current+1)+'" '+(current>=last?'disabled':'')+'>Next →</button>';$$("[data-page]",p).forEach(b=>b.addEventListener("click",()=>{page=Number(b.dataset.page);load();scrollTo({top:0,behavior:"smooth"})}));
 }catch(e){grid.innerHTML='<div class="empty-state"><h2>Search unavailable</h2><p>'+esc(e.message)+'</p><button id="retry" class="button button-quiet">Retry</button></div>';$("#retry")?.addEventListener("click",load);$("#results-count").textContent="MyAnimeList request failed."}}
 form.addEventListener("submit",e=>{e.preventDefault();page=1;load()});$("#clear-filters").addEventListener("click",()=>{form.reset();sort.value="TRENDING_DESC";page=1;load()});await load();
}

async function animePage(){const id=Number(new URLSearchParams(location.search).get("id")),box=$("#anime-detail");if(!Number.isSafeInteger(id)||id<1){box.innerHTML='<div class="error-state"><h2>MAL anime ID missing</h2><a href="/search.html">Discover anime</a></div>';return}try{const a=await getMalAnime(id),d=String(a.description||"No synopsis available.").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();document.title=title(a)+" — Aniscroll";box.innerHTML='<div class="detail-hero"><div class="detail-backdrop" style="background-image:url('+JSON.stringify(cover(a))+')"></div><div class="detail-content"><img class="detail-cover" src="'+esc(cover(a))+'" alt="'+esc(title(a))+' cover"><div><p class="section-kicker">ANISCROLL TITLE GUIDE</p><h1 class="detail-title">'+esc(title(a))+'</h1><div class="detail-native">'+esc(a.title?.native||"")+'</div><div class="detail-stats"><span class="stat-pill">★ '+score(a)+' MAL</span><span class="stat-pill">'+esc(a.format||"ANIME")+'</span><span class="stat-pill">'+esc(a.status||"UNKNOWN")+'</span><span class="stat-pill">'+(a.episodes?Number(a.episodes)+" episodes":"Episode count unknown")+'</span></div><div class="genre-list">'+(a.genres||[]).map(g=>'<a class="genre-chip" href="/search.html?genre='+encodeURIComponent(g)+'">'+esc(g)+'</a>').join("")+'</div><p class="detail-description">'+esc(d.slice(0,900))+'</p><div class="detail-actions"><a class="button button-primary" href="/watch.html?source=mal&id='+id+'&mal='+id+'&ep=1">▶ Watch episode 1</a><button class="button button-quiet" id="save-anime">'+(isSaved(id)?"✓ Saved to watchlist":"♡ Add to watchlist")+'</button><a class="button button-quiet" href="'+esc(a.siteUrl)+'" target="_blank" rel="noreferrer">MyAnimeList ↗</a></div></div></div></div><div class="detail-layout"><div><section class="detail-section"><h2>About this anime</h2><p class="detail-description">'+esc(d)+'</p></section><section class="detail-section"><h2>Episodes</h2><div class="episodes-notice">'+(a.episodes?Number(a.episodes)+" episodes listed by MyAnimeList.":"Episode count unavailable.")+' Episode availability depends on the configured streaming provider. <a class="text-link" href="/watch.html?source=mal&id='+id+'&mal='+id+'&ep=1">Open player ↗</a></div></section></div><aside class="detail-section"><h2>Title information</h2><div class="episodes-notice"><p><strong>Format</strong><br>'+esc(a.format||"Unknown")+'</p><p><strong>Status</strong><br>'+esc(a.status||"Unknown")+'</p><p><strong>Year</strong><br>'+esc(a.seasonYear||"Unknown")+'</p><p><strong>Popularity</strong><br>'+Number(a.popularity||0).toLocaleString()+'</p></div></aside></div>';$("#save-anime").addEventListener("click",()=>{$("#save-anime").textContent=toggleSaved(id)?"✓ Saved to watchlist":"♡ Add to watchlist"})}catch(e){box.innerHTML='<div class="error-state"><h2>We could not load this anime</h2><p>'+esc(e.message)+'</p><a href="/search.html">Back to discovery</a></div>'}}

function streamURL(provider,id,ep,mode){if(!Number.isInteger(Number(ep))||Number(ep)<1)throw Error("Invalid episode");const streamId=Number(id);if(!Number.isInteger(streamId)||streamId<1)throw Error("A valid MyAnimeList ID is required");if(provider==="megaplay"){if(mode==="hsub")throw Error("Hard-subbed is configured only for ZokoAnime");return "https://megaplay.buzz/stream/mal/"+streamId+"/"+Number(ep)+"/"+mode}return "https://zokoanime.video/stream/mal/"+streamId+"/"+Number(ep)+"/"+mode}
async function watchPage(){
 const p=new URLSearchParams(location.search),initialMalId=Number(p.get("mal"))||0,requestedId=Number(p.get("id"))||0,sourceMal=p.get("source")==="mal"||(initialMalId>0&&requestedId===initialMalId),id=requestedId||(sourceMal?initialMalId:0);
 let ep=Math.max(1,Number(p.get("ep"))||1);
 let provider=["zokoanime","megaplay"].includes(p.get("provider"))?p.get("provider"):"zokoanime";
 let mode=["sub","dub","hsub"].includes(p.get("mode"))?p.get("mode"):"sub";
 const box=$("#watch-app");
 if(!Number.isInteger(id)||id<1){box.innerHTML='<div class="error-state"><h2>Choose an anime first</h2><a href="/search.html">Discover anime</a></div>';return}
 try{
  let a=await getMalAnime(initialMalId||id);
  const malId=Number(a.id)||initialMalId,count=Number(a.episodes)||0,animeTitle=title(a),poster=cover(a);
  const availableEpisodeCount=a.status==="RELEASING"&&a.nextAiringEpisode&&Number(a.nextAiringEpisode.episode)>0?Math.min(count||Number(a.nextAiringEpisode.episode)-1,Number(a.nextAiringEpisode.episode)-1):count;
  document.title="Watch "+animeTitle+" — Aniscroll";
  const description=(a.description||"No synopsis available.").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
  const seasons=[];
  box.classList.add("watch-page");
  box.innerHTML=
   '<div class="watch-breadcrumb"><a href="/index.html">← Back to discovery</a><span>ANISCROLL / WATCH</span></div>'+

   '<div class="watch-layout watch-layout-reference">'+
    '<aside class="episode-sidebar reference-episodes"><div class="reference-episode-head"><h2>List of episodes:</h2><label class="episode-search"><span>⌕</span><input id="episode-search" type="search" placeholder="Number of Ep" aria-label="Search episode number"></label></div>'+
     '<div class="episode-list reference-episode-list" id="episode-list"></div>'+
    '</aside>'+
    '<section class="watch-main-column">'+
     '<div class="reference-player"><div class="video-frame-wrap" id="video-frame-wrap"></div>'+
      '</div>'+
   ((a.status==="RELEASING"&&a.nextAiringEpisode&&Number(a.nextAiringEpisode.airingAt)*1000>Date.now())?'<div class="airing-notice" id="airing-notice"><span class="airing-notice-message">♧ The next episode is predicted to arrive on <strong id="airing-date"></strong> <span id="airing-countdown"></span></span><button type="button" class="airing-notice-close" id="airing-notice-close" aria-label="Dismiss airing notice">×</button></div>':'')+
     '<div class="watch-action-bar"><button type="button" class="watch-action" id="light-toggle">💡 Light <strong>On</strong></button><button type="button" class="watch-action" id="autoplay-toggle">Auto Play <strong>On</strong></button><button type="button" class="watch-action" id="autonext-toggle">Auto Next <strong>Off</strong></button><button type="button" class="watch-action" id="skipintro-toggle">Auto Skip Intro <strong>Off</strong></button><button type="button" class="watch-action" id="save-watch">＋ Add to List</button><a class="watch-action" href="#watch-together">◉ Watch2gether</a><button type="button" class="watch-action" id="prev-text">◀ Prev</button><button type="button" class="watch-action" id="next-text">Next ▶</button><button type="button" class="watch-action" id="report-player">⚠ Report</button></div>'+
     '<div class="watch-server-panel"><div class="watch-server-note"><strong id="server-note-title">You are watching Episode '+ep+'</strong><p>If current server doesn’t work, please try another server beside.</p></div><div class="watch-server-options">'+
      '<div class="server-row"><span class="server-label">▣ &nbsp; SUB:</span><button class="server-choice" data-provider="zokoanime" data-mode="sub">ZokoAnime</button><button class="server-choice" data-provider="megaplay" data-mode="sub">MegaPlay</button></div>'+
      '<div class="server-row" id="dub-server-row"><span class="server-label">♩ &nbsp; DUB:</span><span class="dub-availability" id="dub-availability" role="status">Checking availability…</span></div>'+
      ''+
     '</div></div>'+
     '<section class="watch-anime-info"><img class="watch-info-poster" src="'+esc(poster)+'" alt="'+esc(animeTitle)+' poster"><div class="watch-info-copy"><h1>'+esc(animeTitle)+'</h1><div class="watch-info-stats"><span class="rating-badge">R</span><span class="rating-badge pink">HD</span><span class="rating-badge green">CC '+(count||"—")+'</span><span class="rating-badge blue">♩ '+(count||"—")+'</span><span class="watch-meta-dot">• '+esc(a.format||"TV")+' • '+(a.duration?Number(a.duration)+"m":"24m")+'</span></div><p>'+esc(description.slice(0,540))+(description.length>540?' …':'')+' <button class="inline-more" id="more-description">＋ More</button></p><a class="button button-quiet button-small" href="/watch.html?id='+id+(malId?"&mal="+malId:"")+"&source=mal"+'">View detail</a></div></section>'+
    '</section>'+
    '<aside class="watch-related-sidebar"><h2>Related</h2><div class="watch-related-list">'+(seasons.length?seasons.map(x=>'<a class="watch-related-item" href="/watch.html?id='+Number(x.node.id)+'"><img src="'+esc(x.node.coverImage?.medium||x.node.coverImage?.large||"")+'" alt=""><span><strong>'+esc(x.node.title?.english||x.node.title?.romaji||"Related anime")+'</strong><small>'+esc(x.node.format||"Anime")+' · '+(x.node.episodes?Number(x.node.episodes)+" Eps":"Episodes unknown")+(x.node.duration?" · "+Number(x.node.duration)+" min":"")+'</small></span></a>').join(""):'<p class="related-empty">No related titles found.</p>')+'</div></aside>'+
   '</div>';
  async function checkDubAvailability(){
   const status=$("#dub-availability"),row=$("#dub-server-row");
   if(!status||!row)return;
   try{
    const response=await fetch("/api/provider-availability?id="+encodeURIComponent(id)+"&mal="+encodeURIComponent(malId||0)+"&ep="+encodeURIComponent(ep)+"&mode=dub");
    if(!response.ok)throw new Error("Availability check unavailable");
    const result=await response.json(),available=(result.providers||[]).filter(x=>x.available);
    if(!available.length){status.textContent="Dub not available";return}
    status.remove();
    available.forEach(x=>{const b=document.createElement("button");b.type="button";b.className="server-choice";b.dataset.provider=x.provider;b.dataset.mode="dub";b.textContent=x.provider==="zokoanime"?"ZokoAnime":"MegaPlay";b.addEventListener("click",()=>{provider=x.provider;mode="dub";load()});row.appendChild(b)});
   }catch{status.textContent="Dub availability unknown";}
  }
  function updateURL(){const u=new URL(location.href);u.searchParams.set("ep",ep);u.searchParams.set("mode",mode);u.searchParams.set("provider",provider);if(malId)u.searchParams.set("mal",malId);history.replaceState({},"",u)}
  function episodeList(){
   const n=$("#episode-list"),len=Math.min(availableEpisodeCount||0,2000),filter=$("#episode-search")?.value.trim()||"";
   const paged=len>=100;
   const pageSize=100;
   const pageCount=Math.ceil(len/pageSize);
   let page=Math.min(pageCount-1,Math.max(0,Math.floor((ep-1)/pageSize)));
   if(filter&&paged){
    const matches=Array.from({length:len},(_,i)=>i+1).filter(x=>String(x).includes(filter));
    const ranges=[...new Set(matches.map(x=>Math.floor((x-1)/pageSize)))];
    page=ranges.length?ranges[0]:page;
   }
   if(paged){
    const rangeStart=page*pageSize+1,rangeEnd=Math.min(len,rangeStart+pageSize-1);
    n.innerHTML='<div class="episode-grid-toolbar"><span class="episode-grid-icon">☷</span><label class="episode-range-label" for="episode-range">EPS: <select id="episode-range">'+Array.from({length:pageCount},(_,i)=>'<option value="'+i+'" '+(i===page?'selected':'')+'>'+String(i*pageSize+1).padStart(3,"0")+'-'+Math.min(len,(i+1)*pageSize)+'</option>').join("")+'</select></label><span class="episode-grid-search-icon">⌕</span></div><div class="episode-number-grid">'+Array.from({length:rangeEnd-rangeStart+1},(_,i)=>rangeStart+i).filter(x=>!filter||String(x).includes(filter)).map(x=>'<button class="episode-number-tile '+(x===ep?'active':'')+'" data-ep="'+x+'">'+x+'</button>').join("")+'</div>'||"";
    const sel=$("#episode-range",n);
    sel.addEventListener("change",()=>{const start=Number(sel.value)*pageSize+1;setEpisode(start)});
   }else{
    n.innerHTML=len===0?'<p class="episode-empty">No episodes have aired yet.</p>':Array.from({length:len},(_,i)=>i+1).filter(x=>!filter||String(x).includes(filter)).map(x=>'<button class="episode-row reference-episode-row '+(x===ep?"active":"")+'" data-ep="'+x+'"><span class="episode-number">'+x+'</span><span class="episode-name">Episode '+x+'</span><span class="episode-play">▶</span></button>').join("")||'<p class="episode-empty">No matching episode.</p>';
   }
   $$("[data-ep]",n).forEach(b=>b.addEventListener("click",()=>setEpisode(Number(b.dataset.ep))));
  }
  let frameLoadTimer=null;
  function load(){
   if(provider==="megaplay"&&mode==="hsub")mode="sub";
   if(frameLoadTimer){clearTimeout(frameLoadTimer);frameLoadTimer=null}
   const src=streamURL(provider,malId||id,ep,mode)+"?color=a78bfa";
   const frame=document.createElement("iframe");
   frame.src=src;frame.title=animeTitle+" episode "+ep;
   frame.allow="autoplay; fullscreen; picture-in-picture";if(provider==="zokoanime")frame.setAttribute("sandbox","allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock allow-pointer-lock");
   frame.loading="eager";frame.referrerPolicy="strict-origin-when-cross-origin";
   frame.addEventListener("error",()=>handleStreamFailure());
   frame.addEventListener("load",()=>{if(frameLoadTimer){clearTimeout(frameLoadTimer);frameLoadTimer=null}});
   $("#video-frame-wrap").replaceChildren(frame);
   frameLoadTimer=setTimeout(()=>{if(!frame.isConnected)return;handleStreamFailure()},5500);
   $("#server-note-title").textContent="You are watching Episode "+ep;
   $$("[data-provider]").forEach(b=>b.classList.toggle("active",b.dataset.provider===provider&&b.dataset.mode===mode));
   episodeList();updateURL();record(a,ep);
  }
  function handleStreamFailure(){
   toast("The stream could not load. Try another episode or select a different provider.");
  }
  function setEpisode(n){if(Number.isInteger(n)&&n>=1&&n<=availableEpisodeCount){ep=n;load()}}
  $("#episode-search").addEventListener("input",episodeList);
  $("#prev-text").addEventListener("click",()=>setEpisode(ep-1));$("#next-text").addEventListener("click",()=>setEpisode(ep+1));
  $$("[data-provider]").forEach(b=>b.addEventListener("click",()=>{provider=b.dataset.provider;mode=b.dataset.mode;load()}));
  $("#save-watch").addEventListener("click",()=>{const saved=toggleSaved(id);$("#save-watch").textContent=saved?"✓ Added to List":"＋ Add to List";toast(saved?"Added to watchlist":"Removed from watchlist")});
  let lightOn=true,autoPlay=true,autoNext=false,skipIntro=false;
  function toggleSetting(id,label,get,set){const b=$("#"+id);b.addEventListener("click",()=>{set(!get());b.innerHTML=label+' <strong>'+(get()?"On":"Off")+'</strong>';if(id==="light-toggle"||id==="toggle-light")document.body.classList.toggle("watch-lights-off",!get())})}
  toggleSetting("light-toggle","💡 Light",()=>lightOn,v=>lightOn=v);
  toggleSetting("autoplay-toggle","Auto Play",()=>autoPlay,v=>autoPlay=v);
  toggleSetting("autonext-toggle","Auto Next",()=>autoNext,v=>autoNext=v);
  toggleSetting("skipintro-toggle","Auto Skip Intro",()=>skipIntro,v=>skipIntro=v);
  $("#report-player").addEventListener("click",()=>toast("If playback fails, switch server or audio mode."));
  $("#more-description").addEventListener("click",()=>{const p=$("#more-description").parentElement;p.innerHTML=esc(description)+' <button class="inline-more" id="less-description">− Less</button>';$("#less-description").addEventListener("click",()=>location.reload())});
  if(a.status==="RELEASING"&&a.nextAiringEpisode&&Number(a.nextAiringEpisode.airingAt)*1000>Date.now()){
   const airingAt=Number(a.nextAiringEpisode.airingAt)*1000,dateEl=$("#airing-date"),countdownEl=$("#airing-countdown"),close=$("#airing-notice-close"),notice=$("#airing-notice");
   const dateText=new Date(airingAt).toLocaleString(undefined,{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
   if(dateEl)dateEl.textContent=dateText;
   const tick=()=>{if(!countdownEl||!notice)return;const ms=airingAt-Date.now();if(ms<=0){notice.remove();return}const days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000),minutes=Math.floor(ms%3600000/60000),seconds=Math.floor(ms%60000/1000);countdownEl.textContent=' ('+(days?days+' days, ':'')+hours+' hours, '+minutes+' minutes, '+seconds+' seconds)';};
   tick();const airingTimer=setInterval(()=>{if(!document.getElementById("airing-countdown")){clearInterval(airingTimer);return}tick()},1000);
   close?.addEventListener("click",()=>{notice.remove();clearInterval(airingTimer)});
  }
  load();checkDubAvailability();
 }catch(e){box.innerHTML='<div class="error-state"><h2>Could not open this anime</h2><p>'+esc(e.message)+'</p><a href="/search.html">Back to discovery</a></div>'}
}
async function library(type){const n=type==="watchlist"?$("#library-results"):$("#history-results");if(type==="history"){$("#clear-history")?.addEventListener("click",()=>{if(confirm("Clear history on this device?")){write(K.h,[]);drawHistory(n,[])}});drawHistory(n,read(K.h));return}let filter="all";async function render(){const all=watchlist(),items=filter==="all"?all:all.filter(x=>x.status===filter);if(!items.length){n.innerHTML='<div class="empty-state"><span>♡</span><h2>Your watchlist starts here</h2><p>Save anime from any poster preview to build your collection.</p><a class="button button-primary" href="/search.html">Discover anime</a></div>';return}try{const aa=await getMalAnimeByIds(items.map(x=>x.id)),m=new Map(aa.map(x=>[x.id,x]));n.innerHTML=items.map(x=>{const a=m.get(Number(x.id));if(!a)return"";return'<article class="poster-card"><a class="poster-cover" href="/watch.html?id='+a.id+'"><img src="'+esc(cover(a))+'" alt="'+esc(title(a))+'"><span class="poster-score">★ '+score(a)+'</span></a><a class="poster-title" href="/watch.html?id='+a.id+'">'+esc(title(a))+'</a><div class="poster-meta">'+esc(meta(a))+'</div><label class="field" style="margin-top:8px"><span>List status</span><select class="control-select list-status" data-id="'+a.id+'" style="width:100%;max-width:none"><option value="watching" '+(x.status==="watching"?"selected":"")+'>Watching</option><option value="planned" '+(x.status==="planned"?"selected":"")+'>Plan to watch</option><option value="completed" '+(x.status==="completed"?"selected":"")+'>Completed</option><option value="dropped" '+(x.status==="dropped"?"selected":"")+'>Dropped</option></select></label><button class="button button-quiet button-small remove-saved" data-id="'+a.id+'" style="margin-top:8px;width:100%">Remove</button></article>'}).join("");$$(".list-status",n).forEach(s=>s.addEventListener("change",()=>{const l=watchlist(),it=l.find(x=>Number(x.id)===Number(s.dataset.id));if(it)it.status=s.value;write(K.w,l);toast("Watchlist updated");if(filter!=="all")render()}));$$(".remove-saved",n).forEach(b=>b.addEventListener("click",()=>{write(K.w,watchlist().filter(x=>Number(x.id)!==Number(b.dataset.id)));render();toast("Removed from watchlist")}))}catch(e){n.innerHTML='<div class="empty-state"><p>'+esc(e.message)+'</p></div>'}}$$(".library-tab").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.list;$$(".library-tab").forEach(x=>x.classList.toggle("active",x===b));render()}));await render()}
async function genresPage(){const gs=["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];$("#genre-directory").innerHTML=gs.map(g=>'<a class="genre-tile" href="/search.html?genre='+encodeURIComponent(g)+'">'+esc(g)+' <span>↗</span></a>').join("");try{draw($("#genre-featured"),(await getMalRanking("TRENDING",1,6)).media)}catch(e){$("#genre-featured").innerHTML='<div class="empty-state"><p>'+esc(e.message)+'</p></div>'}}
async function schedulePage(){
 const list=$("#schedule-list"),tabs=$("#schedule-day-tabs"),range=$("#schedule-range"),clock=$("#schedule-clock"),week=$("#schedule-week");
 const dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
 const dayShort=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
 let selectedDay=0,mode="all",items=[],loading=false;
 const localDateKey=date=>{const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return y+"-"+m+"-"+d};
 const dateOnly=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const dateDiff=(a,b)=>Math.round((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()))/86400000);
 const updateClock=()=>{if(clock)clock.textContent=new Date().toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",second:"2-digit"})};
 const zonedParts=(date,timeZone)=>Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,Number(x.value)]));
 const zonedDate=(year,month,day,hour,minute,timeZone)=>{
  const target=Date.UTC(year,month-1,day,hour,minute,0);let guess=target;
  for(let i=0;i<4;i++){const p=zonedParts(new Date(guess),timeZone),represented=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess+=target-represented}
  return new Date(guess)
 };
 const nextBroadcast=anime=>{
  const b=anime.broadcast;if(!b?.day||!b?.time)return null;
  const match=/^(\d{1,2}):(\d{2})$/.exec(String(b.time));if(!match)return null;
  const weekday={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6}[String(b.day).slice(0,3).toLowerCase()];
  if(weekday===undefined)return null;
  const hour=Number(match[1]),minute=Number(match[2]);if(hour>23||minute>59)return null;
  const zone=b.timezone||"Asia/Tokyo";
  try{
   const p=zonedParts(new Date(),zone),todayIndex=new Date(Date.UTC(p.year,p.month-1,p.day)).getUTCDay();
   let delta=(weekday-todayIndex+7)%7;
   let target=new Date(Date.UTC(p.year,p.month-1,p.day+delta));
   let at=zonedDate(target.getUTCFullYear(),target.getUTCMonth()+1,target.getUTCDate(),hour,minute,zone);
   if(at<=new Date()){delta+=7;target=new Date(Date.UTC(p.year,p.month-1,p.day+delta));at=zonedDate(target.getUTCFullYear(),target.getUTCMonth()+1,target.getUTCDate(),hour,minute,zone)}
   return at
  }catch{return null}
 };
 const relative=at=>{const ms=at-Date.now();if(ms<=0)return "Airing now";const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);if(d)return "In "+d+"d "+h+"h";if(h)return "In "+h+"h "+m+"m";return "In "+Math.max(1,m)+"m"};
 const weekDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+i);return d});
 if(week)week.textContent="Broadcast times from MyAnimeList · your local timezone";
 updateClock();const clockTimer=setInterval(()=>{if(!document.getElementById("schedule-clock")){clearInterval(clockTimer);return}updateClock()},1000);
 const renderTabs=()=>{
  if(!tabs)return;
  tabs.innerHTML=weekDays.map((d,i)=>'<button type="button" class="schedule-day-tab '+(i===selectedDay?"active":"")+'" data-schedule-day="'+i+'"><strong>'+dayShort[d.getDay()]+'</strong><small>'+d.toLocaleDateString(undefined,{month:"short",day:"numeric"})+'</small></button>').join("");
  $$("[data-schedule-day]",tabs).forEach(b=>b.addEventListener("click",()=>{selectedDay=Number(b.dataset.scheduleDay);renderTabs();renderList()}))
 };
 const renderList=()=>{
  if(!list)return;
  const date=weekDays[selectedDay],key=localDateKey(date),daily=items.filter(x=>localDateKey(x.at)===key).sort((a,b)=>a.at-b.at);
  if(range)range.textContent=date.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})+" · "+daily.length+" broadcast"+(daily.length===1?"":"s")+" · local time";
  if(!daily.length){list.innerHTML='<div class="schedule-empty"><h2>No broadcasts listed for this day</h2><p>MyAnimeList has not provided a weekly broadcast time for the currently airing titles we found.</p><a class="button button-primary" href="/search.html">Discover anime</a></div>';return}
  list.innerHTML=daily.map(x=>{
   const a=x.anime,id=Number(a.id),url="/watch.html?source=mal&id="+id+"&mal="+id+"&ep=1"+(mode==="all"?"":"&mode="+mode),poster=cover(a),genre=(a.genres||[]).slice(0,3);
   const broadcastText=a.broadcast?.string||("Scheduled "+a.broadcast.day+" at "+a.broadcast.time+" ("+(a.broadcast.timezone||"Asia/Tokyo")+")");
   return '<article class="schedule-episode-card"><div class="schedule-time-column"><strong>'+esc(x.at.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}))+'</strong><small>'+esc(dayNames[x.at.getDay()])+'</small></div><a class="schedule-poster" href="'+url+'"><img src="'+esc(poster)+'" alt="'+esc(title(a))+' poster" loading="lazy"></a><div class="schedule-card-info"><a class="schedule-title" href="'+url+'">'+esc(title(a))+'</a><div class="schedule-card-meta"><span>TV</span><span>'+esc(a.format||"Anime")+'</span><span>MyAnimeList broadcast</span></div><p>'+esc(broadcastText)+'</p><div class="schedule-tags">'+genre.map(g=>'<span>'+esc(g)+'</span>').join("")+'</div></div><div class="schedule-countdown">'+esc(relative(x.at))+'</div></article>'
  }).join("");
 };
 const load=async()=>{
  if(loading)return;loading=true;
  if(list)list.innerHTML='<div class="schedule-empty"><h2>Loading weekly broadcasts…</h2><p>Fetching current airing titles and broadcast times from MyAnimeList.</p></div>';
  if(range)range.textContent="Loading MyAnimeList…";
  try{
   const result=await getMalRanking("AIRING",1,100),seen=new Set(),next=[];
   for(const anime of result.media||[]){
    const id=Number(anime.id);if(!id||seen.has(id)||!anime.broadcast)continue;seen.add(id);
    const at=nextBroadcast(anime);if(!at)continue;
    const dayOffset=dateDiff(dateOnly(at),dateOnly(new Date()));
    if(dayOffset>=0&&dayOffset<7)next.push({anime,at});
   }
   items=next;renderTabs();renderList();
   if(!items.length&&list)list.innerHTML='<div class="schedule-empty"><h2>No weekly broadcast times found</h2><p>MyAnimeList did not return broadcast day and time data for the current airing titles. Try refreshing later.</p><a class="button button-primary" href="/search.html">Discover anime</a></div>';
  }catch(e){
   if(range)range.textContent="Schedule could not load";
   if(list)list.innerHTML='<div class="schedule-empty"><h2>Could not load schedule</h2><p>'+esc(e.message||"MyAnimeList request failed")+'</p><button type="button" class="button button-quiet" id="schedule-retry">Retry</button></div>';
   $("#schedule-retry")?.addEventListener("click",load)
  }finally{loading=false}
 };
 $$(".schedule-mode-tabs button").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.scheduleMode||"all";$$(".schedule-mode-tabs button").forEach(x=>x.classList.toggle("active",x===b));renderList()}));
 $("#refresh-schedule")?.addEventListener("click",load);
 renderTabs();await load();
}

header();footer();const page=document.body.dataset.page;if(page==="home")home();if(page==="search")searchPage();if(page==="anime")animePage();if(page==="watch")watchPage();if(page==="watchlist")library("watchlist");if(page==="history")library("history");if(page==="schedule")schedulePage();
