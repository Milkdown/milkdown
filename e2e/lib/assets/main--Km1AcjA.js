var z=e=>{throw TypeError(e)};var J=(e,t,s)=>t.has(e)||z("Cannot "+s);var S=(e,t,s)=>(J(e,t,"read from private field"),s?s.call(e):t.get(e)),L=(e,t,s)=>t.has(e)?z("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),j=(e,t,s,n)=>(J(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s);import"./style-DeZY9Jm1.js";var g,T;class ut{constructor(t){L(this,g);L(this,T,new Set);j(this,g,t)}get current(){return S(this,g)}set current(t){S(this,g)!=t&&(j(this,g,t),S(this,T).forEach(s=>s(t)))}on(t){return S(this,T).add(t),()=>S(this,T).delete(t)}}g=new WeakMap,T=new WeakMap;const Z=e=>new ut(e),w=Symbol.for("atomico.hooks");globalThis[w]=globalThis[w]||{};let O=globalThis[w];const at=Symbol.for("Atomico.suspense"),ht=Symbol.for("Atomico.effect"),mt=Symbol.for("Atomico.layoutEffect"),Q=Symbol.for("Atomico.insertionEffect"),G=(e,t,s)=>{const{i:n,hooks:o}=O.c,r=o[n]=o[n]||{};return r.value=e(r.value),r.effect=t,r.tag=s,O.c.i++,o[n].value},pt=e=>G((t=Z(e))=>t),Et=()=>G((e=Z(O.c.host))=>e),bt=(e,t,s=0)=>{let n={},o=!1;const r=()=>o,c=(u,a)=>{for(const h in n){const l=n[h];l.effect&&l.tag===u&&(l.value=l.effect(l.value,a))}};return{load:u=>{O.c={host:t,hooks:n,update:e,i:0,id:s};let a;try{o=!1,a=u()}catch(h){if(h!==at)throw h;o=!0}finally{O.c=null}return a},cleanEffects:u=>(c(Q,u),()=>(c(mt,u),()=>{c(ht,u)})),isSuspense:r}},C=Symbol.for;function dt(e,t){const s=e.length;if(s!==t.length)return!1;for(let n=0;n<s;n++){let o=e[n],r=t[n];if(o!==r)return!1}return!0}const N=e=>typeof e=="function",A=e=>typeof e=="object",{isArray:Nt}=Array,H=(e,t)=>(t?e instanceof HTMLStyleElement:!0)&&"hydrate"in((e==null?void 0:e.dataset)||{});function v(e,t){let s;const n=o=>{let{length:r}=o;for(let c=0;c<r;c++){const f=o[c];if(f&&Array.isArray(f))n(f);else{const i=typeof f;if(f==null||i==="function"||i==="boolean")continue;i==="string"||i==="number"?(s==null&&(s=""),s+=f):(s!=null&&(t(s),s=null),t(f))}}};n(e),s!=null&&t(s)}const x=(e,t,s)=>(e.addEventListener(t,s),()=>e.removeEventListener(t,s));class V{constructor(t,s,n){this.message=s,this.target=t,this.value=n}}class gt extends V{}class St extends V{}const D="Custom",Pt=null,Tt={true:1,"":1,1:1};function yt(e,t,s,n,o){const{type:r,reflect:c,event:f,value:i,attr:u=_t(t)}=(s==null?void 0:s.name)!=D&&A(s)&&s!=Pt?s:{type:s},a=(r==null?void 0:r.name)===D&&r.map,h=i!=null?r==Function||!N(i)?()=>i:i:null;Object.defineProperty(e,t,{configurable:!0,set(l){const m=this[t];h&&r!=Boolean&&l==null&&(l=h());const{error:b,value:d}=(a?Mt:Rt)(r,l);if(b&&d!=null)throw new gt(this,`The value defined for prop '${t}' must be of type '${r.name}'`,d);m!=d&&(this._props[t]=d??void 0,this.update(),f&&At(this,f),this.updated.then(()=>{c&&(this._ignoreAttr=u,Ot(this,r,u,this[t]),this._ignoreAttr=null)}))},get(){return this._props[t]}}),h&&(o[t]=h()),n[u]={prop:t,type:r}}const At=(e,{type:t,base:s=CustomEvent,...n})=>e.dispatchEvent(new s(t,n)),_t=e=>e.replace(/([A-Z])/g,"-$1").toLowerCase(),Ot=(e,t,s,n)=>n==null||t==Boolean&&!n?e.removeAttribute(s):e.setAttribute(s,(t==null?void 0:t.name)===D&&(t!=null&&t.serialize)?t==null?void 0:t.serialize(n):A(n)?JSON.stringify(n):t==Boolean?"":n),Ct=(e,t)=>e==Boolean?!!Tt[t]:e==Number?Number(t):e==String?t:e==Array||e==Object?JSON.parse(t):e.name==D?t:new e(t),Mt=({map:e},t)=>{try{return{value:e(t),error:!1}}catch{return{value:t,error:!0}}},Rt=(e,t)=>e==null||t==null?{value:t,error:!1}:e!=String&&t===""?{value:void 0,error:!1}:e==Object||e==Array||e==Symbol?{value:t,error:{}.toString.call(t)!==`[object ${e.name}]`}:t instanceof e?{value:t,error:e==Number&&Number.isNaN(t.valueOf())}:e==String||e==Number||e==Boolean?{value:t,error:e==Number?typeof t!="number"?!0:Number.isNaN(t):e==String?typeof t!="string":typeof t!="boolean"}:{value:t,error:!0};let kt=0;const Dt=e=>{var s;const t=((s=(e==null?void 0:e.dataset)||{})==null?void 0:s.hydrate)||"";return t||"c"+kt++},tt=(e,t=HTMLElement)=>{const s={},n={},o="prototype"in t&&t.prototype instanceof Element,r=o?t:"base"in t?t.base:HTMLElement,{props:c,styles:f}=o?e:t;class i extends r{constructor(){super(),this._setup(),this._render=()=>e({...this._props});for(const a in n)this[a]=n[a]}static get styles(){return[super.styles,f]}async _setup(){if(this._props)return;this._props={};let a,h;this.mounted=new Promise(p=>this.mount=()=>{p(),a!=this.parentNode&&(h!=a?this.unmounted.then(this.update):this.update()),a=this.parentNode}),this.unmounted=new Promise(p=>this.unmount=()=>{p(),(a!=this.parentNode||!this.isConnected)&&(l.cleanEffects(!0)()(),h=this.parentNode,a=null)}),this.symbolId=this.symbolId||Symbol(),this.symbolIdParent=Symbol();const l=bt(()=>this.update(),this,Dt(this));let m,b=!0;const d=H(this);this.update=()=>(m||(m=!0,this.updated=(this.updated||this.mounted).then(()=>{try{const p=l.load(this._render),E=l.cleanEffects();return p&&p.render(this,this.symbolId,d),m=!1,b&&!l.isSuspense()&&(b=!1,!d&&It(this)),E()}finally{m=!1}}).then(p=>{p&&p()})),this.updated),this.update()}connectedCallback(){this.mount(),super.connectedCallback&&super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),this.unmount()}attributeChangedCallback(a,h,l){if(s[a]){if(a===this._ignoreAttr||h===l)return;const{prop:m,type:b}=s[a];try{this[m]=Ct(b,l)}catch{throw new St(this,`The value defined as attr '${a}' cannot be parsed by type '${b.name}'`,l)}}else super.attributeChangedCallback(a,h,l)}static get props(){return{...super.props,...c}}static get observedAttributes(){const a=super.observedAttributes||[];for(const h in c)yt(this.prototype,h,c[h],s,n);return Object.keys(s).concat(a)}}return i};function It(e){const{styles:t}=e.constructor,{shadowRoot:s}=e;if(s&&t.length){const n=[];v(t,o=>{o&&(o instanceof Element?s.appendChild(o.cloneNode(!0)):n.push(o))}),n.length&&(s.adoptedStyleSheets=n)}}const Lt=e=>(t,s)=>{G(([n,o]=[])=>((o||!o)&&(o&&dt(o,s)?n=n||!0:(N(n)&&n(),n=null)),[n,s]),([n,o],r)=>r?(N(n)&&n(),[]):[n||t(),o],e)},jt=Lt(Q),B=C("atomico/options");globalThis[B]=globalThis[B]||{sheet:!!document.adoptedStyleSheets};const et=globalThis[B];new Promise(e=>{et.ssr||(document.readyState==="loading"?x(document,"DOMContentLoaded",e):e())});const $t={checked:1,value:1,selected:1},wt={list:1,type:1,size:1,form:1,width:1,height:1,src:1,href:1,slot:1},Ht={shadowDom:1,staticNode:1,cloneNode:1,children:1,key:1},k={},F=[];class Y extends Text{}const Bt=C("atomico/id"),_=C("atomico/type"),$=C("atomico/ref"),st=C("atomico/vnode"),Ft=()=>{};function Yt(e,t,s){return ot(this,e,t,s)}const nt=(e,t,...s)=>{const n=t||k;let{children:o}=n;if(o=o??(s.length?s:F),e===Ft)return o;const r=e?e instanceof Node?1:e.prototype instanceof HTMLElement&&2:0;if(r===!1&&e instanceof Function)return e(o!=F?{children:o,...n}:n);const c=et.render||Yt;return{[_]:st,type:e,props:n,children:o,key:n.key,shadow:n.shadowDom,static:n.staticNode,raw:r,is:n.is,clone:n.cloneNode,render:c}};function ot(e,t,s=Bt,n,o){let r;if(t&&t[s]&&t[s].vnode==e||e[_]!=st)return t;(e||!t)&&(o=o||e.type=="svg",r=e.type!="host"&&(e.raw==1?(t&&e.clone?t[$]:t)!=e.type:e.raw==2?!(t instanceof e.type):t?t[$]||t.localName!=e.type:!t),r&&e.type!=null&&(e.raw==1&&e.clone?(n=!0,t=e.type.cloneNode(!0),t[$]=e.type):t=e.raw==1?e.type:e.raw==2?new e.type:o?document.createElementNS("http://www.w3.org/2000/svg",e.type):document.createElement(e.type,e.is?{is:e.is}:void 0)));const c=t[s]?t[s]:k,{vnode:f=k,cycle:i=0}=c;let{fragment:u,handlers:a}=c;const{children:h=F,props:l=k}=f;if(a=r?{}:a||{},e.static&&!r)return t;if(e.shadow&&!t.shadowRoot&&t.attachShadow({mode:"open",...e.shadow}),e.props!=l&&zt(t,l,e.props,a,o),e.children!==h){const m=e.shadow?t.shadowRoot:t;u=Gt(e.children,u,m,s,!i&&n,o&&e.type=="foreignObject"?!1:o)}return t[s]={vnode:e,handlers:a,fragment:u,cycle:i+1},t}function Ut(e,t){const s=new Y(""),n=new Y("");let o;if(e[t?"prepend":"append"](s),t){let{lastElementChild:r}=e;for(;r;){const{previousElementSibling:c}=r;if(H(r,!0)&&!H(c,!0)){o=r;break}r=c}}return o?o.before(n):e.append(n),{markStart:s,markEnd:n}}function Gt(e,t,s,n,o,r){e=e==null?null:Nt(e)?e:[e];const c=t||Ut(s,o),{markStart:f,markEnd:i,keyes:u}=c;let a;const h=u&&new Set;let l=f;if(e&&v(e,m=>{if(typeof m=="object"&&!m[_])return;const b=m[_]&&m.key,d=u&&b!=null&&u.get(b);l!=i&&l===d?h.delete(l):l=l==i?i:l.nextSibling;const p=u?d:l;let E=p;if(m[_])E=ot(m,p,n,o,r);else{const I=m+"";!(E instanceof Text)||E instanceof Y?E=new Text(I):E.data!=I&&(E.data=I)}E!=l&&(u&&h.delete(E),!p||u?(s.insertBefore(E,l),u&&l!=i&&h.add(l)):p==i?s.insertBefore(E,i):(s.replaceChild(E,p),l=E)),b!=null&&(a=a||new Map,a.set(b,E))}),l=l==i?i:l.nextSibling,t&&l!=i)for(;l!=i;){const m=l;l=l.nextSibling,m.remove()}return h&&h.forEach(m=>m.remove()),c.keyes=a,c}function zt(e,t,s,n,o){for(const r in t)!(r in s)&&X(e,r,t[r],null,o,n);for(const r in s)X(e,r,t[r],s[r],o,n)}function X(e,t,s,n,o,r){if(t=t=="class"&&!o?"className":t,s=s??null,n=n??null,t in e&&$t[t]&&(s=e[t]),!(n===s||Ht[t]||t[0]=="_"))if(e.localName==="slot"&&t==="assignNode"&&"assign"in e)e.assign(n);else if(t[0]=="o"&&t[1]=="n"&&(N(n)||N(s)))Jt(e,t.slice(2),n,r);else if(t=="ref")n&&(N(n)?n(e):n.current=e);else if(t=="style"){const{style:c}=e;s=s||"",n=n||"";const f=A(s),i=A(n);if(f)for(const u in s)if(i)!(u in n)&&q(c,u,null);else break;if(i)for(const u in n){const a=n[u];f&&s[u]===a||q(c,u,a)}else c.cssText=n}else{const c=t[0]=="$"?t.slice(1):t;c===t&&(!o&&!wt[t]&&t in e||N(n)||N(s))?e[t]=n??"":n==null?e.removeAttribute(c):e.setAttribute(c,A(n)?JSON.stringify(n):n)}}function Jt(e,t,s,n){if(n.handleEvent||(n.handleEvent=o=>n[o.type].call(e,o)),s){if(!n[t]){const o=s.capture||s.once||s.passive?Object.assign({},s):null;e.addEventListener(t,n,o)}n[t]=s}else n[t]&&(e.removeEventListener(t,n),delete n[t])}function q(e,t,s){let n="setProperty";s==null&&(n="removeProperty",s=null),~t.indexOf("-")?e[n](t,s):e[t]=s}const Xt=nt("host",{style:"display: contents"}),qt="value",Kt=(e,t)=>{const s=Et(),n=pt();jt(()=>x(s.current,"ConnectContext",o=>{o.composedPath().at(0)!==o.currentTarget&&e===o.detail.id&&(o.stopPropagation(),o.detail.connect(n))}),[e]),n.current=t},Wt=e=>{const t=tt(({value:s})=>(Kt(t,s),Xt),{props:{value:{type:Object,value:()=>e}}});return t[qt]=e,t};Wt({dispatch(e,t){}});const Zt=0,P=1,M=2,R=3,K=4,y=5,U=6,rt=0,Qt=2,it=3,ct=4,lt=y,vt=U,ft=(e,t,s,n)=>{let o;t[0]=0;for(let r=1;r<t.length;r++){const c=t[r++],f=t[r]?(t[0]|=c?1:2,s[t[r++]]):t[++r];c===it?n[0]=f:c===ct?n[1]=Object.assign(n[1]||{},f):c===lt?(n[1]=n[1]||{})[t[++r]]=f:c===vt?n[1][t[++r]]+=f+"":c?(o=e.apply(f,ft(e,f,s,["",null])),n.push(o),f[0]?t[0]|=2:(t[r-2]=rt,t[r]=o)):n.push(f)}return n},xt=function(e){let t=P,s="",n="",o=[0],r,c;const f=i=>{t===P&&(i||(s=s.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?o.push(rt,i,s):t===R&&(i||s)?(o.push(it,i,s),t=M):t===M&&s==="..."&&i?o.push(ct,i,0):t===M&&s&&!i?o.push(lt,0,!0,s):t>=y&&((s||!i&&t===y)&&(o.push(t,0,s,c),t=U),i&&(o.push(t,i,0,c),t=U)),s=""};for(let i=0;i<e.length;i++){i&&(t===P&&f(),f(i));for(let u=0;u<e[i].length;u++)r=e[i][u],t===P?r==="<"?(f(),o=[o],t=R):s+=r:t===K?s==="--"&&r===">"?(t=P,s=""):s=r+s[0]:n?r===n?n="":s+=r:r==='"'||r==="'"?n=r:r===">"?(f(),t=P):t&&(r==="="?(t=y,c=s,s=""):r==="/"&&(t<y||e[i][u+1]===">")?(f(),t===R&&(o=o[0]),t=o,(o=o[0]).push(Qt,0,t),t=Zt):r===" "||r==="	"||r===`
`||r==="\r"?(f(),t=M):s+=r),t===R&&s==="!--"&&(t=K,o=o[0])}return f(),o},Vt=new Map;function W(e){let t=Vt;return t=ft(nt,t.get(e)||(t.set(e,t=xt(e)),t),arguments,[]),t.length>1?t:t[0]}const te={title:"Multi Editor",link:"/multi-editor/"},ee={title:"AutoMd",link:"/plugin-automd/"},se={title:"Math",link:"/plugin-math/"},ne={title:"Listener",link:"/plugin-listener/"},oe={title:"Commonmark",link:"/preset-commonmark/"},re={title:"GFM",link:"/preset-gfm/"},ie=[oe,re,te,ne,ee,se];function ce(){return W`
    <host>
      <ul class="m-10">
        ${ie.map(e=>W`<li class="py-3 hover:text-blue-500 block w-full cursor-pointer"><a href=${e.link}>${e.title}</a></li>`)}
      </ul>
    </host>
  `}customElements.define("milkdown-test-app",tt(ce));
