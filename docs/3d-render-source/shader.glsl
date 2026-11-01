#version 300 es
precision highp float;
uniform vec2 uRes;
uniform sampler2D uTex;
uniform float uYaw,uPitch,uScale,uFlap,uXray,uExpl,uGlow,uGhost,uRelight;
uniform vec3 uPos;
out vec4 frag;
const float W=2.026,H=.554,D=.42,PI=3.14159265;
const float HALFW=1.49,CAMD=9.;
const vec2 VENT=vec2(.86,.06);          // half size of the vent opening
const float VENTY=-.2175;               // its centre
const float HINGEY=-.272,HINGEZ=.205;

mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float sdRect(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCylX(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.yz),p.x))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float smax(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return max(a,b)+h*h*k*.25;}

/* ---------- shell ---------- */
const float FLAPH=.042;
float flapLocal(vec3 p,out vec3 q){
  q=p-vec3(0.,HINGEY,HINGEZ);
  q.yz=rot(uFlap*.98)*q.yz;
  vec3 c=q-vec3(0.,FLAPH-.002,.004);
  float y=clamp(c.y/FLAPH,-1.,1.);
  c.z-=.014*(1.-y*y);
  return sdBox(c,vec3(VENT.x-.012,FLAPH,.0045))-.005;
}
// x: distance  y: 1 body 2 flap 3 cavity
vec2 mapShell(vec3 p){
  float a=sdRect(p.xy,vec2(W*.5,H*.5),.04);
  float b=sdRect(p.yz,vec2(H*.5,D*.5),.075);
  float c=sdRect(p.xz,vec2(W*.5,D*.5),.06);
  float body=smax(smax(a,b,.012),c,.012);
  vec3 cq=p-vec3(0.,VENTY-.01,D*.5);
  float cav=sdBox(cq,vec3(VENT.x,VENT.y+.012,.12));
  vec2 res=vec2(max(body,-cav),1.);
  if(cav<res.x+.001&&body<.002)res.y=1.;
  // vanes inside the opening
  vec3 v=cq;v.x=mod(v.x+.085,.17)-.085;
  float vane=max(max(sdBox(v,vec3(.0055,VENT.y+.012,.11)),cav),max(body+.004,p.z-(D*.5-.03)));
  if(vane<res.x)res=vec2(vane,3.);
  vec3 q;float f=flapLocal(p,q);
  if(f<res.x)res=vec2(f,2.);
  // hinge arms between the flap and the body
  float ang=uFlap*.98;
  vec3 tip=vec3(0.,HINGEY+FLAPH*cos(ang),HINGEZ+FLAPH*sin(ang)-.004);
  vec3 ax=p;ax.x=abs(ax.x);ax.x=min(abs(ax.x),abs(ax.x-.44));
  float arm=sdCap(ax,vec3(0.,-.205,.12),tip,.0075);
  if(arm<res.x)res=vec2(arm,3.);
  return res;
}

/* ---------- inner parts ---------- */
vec3 oBlower(){return vec3(-.17-.42*uExpl,-.03-.02*uExpl,.03+.24*uExpl);}
vec3 oMotor(){return vec3(.70+.36*uExpl,-.03,.03+.26*uExpl);}
vec3 oCoil(){return vec3(-.08,.07+.40*uExpl,-.02-.05*uExpl);}
vec3 oPcb(){return vec3(.74+.42*uExpl,.11+.44*uExpl,.08+.16*uExpl);}
vec3 oBack(){return vec3(0.,-.01-.34*uExpl,-.16-.34*uExpl);}

float sdBlower(vec3 p){
  float b=sdCylX(p,.14,.74);
  if(b>.06)return b;
  float n=30.,s=2.*PI/n;
  float a=atan(p.z,p.y);a=mod(a+s*.5,s)-s*.5;
  float l=length(p.yz);
  vec2 q=vec2(l*cos(a),l*sin(a))-vec2(.112,0.);
  q=rot(.55)*q;
  float blade=max(sdRect(q,vec2(.026,.0032),.002),abs(p.x)-.72);
  vec3 r=p;r.x=mod(r.x+.122,.244)-.122;
  float disc=max(sdCylX(r,.134,.0045),-(length(p.yz)-.06));
  float caps=sdCylX(p-vec3(.725,0,0),.134,.012);
  caps=min(caps,sdCylX(p+vec3(.725,0,0),.134,.012));
  float hub=sdCylX(p-vec3(.72,0,0),.05,.05);
  float d=min(min(blade,disc),min(caps,hub));
  return d;
}
float sdBlowerCore(vec3 p){return sdCylX(p,.078,.7);}
vec2 sdMotor(vec3 p){
  float bound=sdBox(p-vec3(0.,-.02,0.),vec3(.27,.22,.18));
  if(bound>.08)return vec2(bound,3.);
  float l=length(p.yz),a=atan(p.z,p.y);
  // copper stator with cooling fins
  float fin=smoothstep(.0028,.0015,abs(mod(p.x,.0135)-.00675));
  vec2 res=vec2(sdCylX(p,.127+.017*fin,.11),2.);
  float s4=2.*PI/8.;float a4=mod(a+s4*.5,s4)-s4*.5;
  float tie=max(sdCylX(p,.152,.112),abs(l*sin(a4))-.0065);
  if(tie<res.x)res=vec2(tie,3.);
  // end bells
  vec3 q=p-vec3(.128,0,0);
  float bell=sdCylX(q,.126-.5*max(q.x,0.),.024)-.003;
  float s=2.*PI/18.;float a2=mod(a+s*.5,s)-s*.5;
  float cap=sdCylX(p-vec3(.17,0,0),.085,.022);
  cap=min(cap,max(sdCylX(p-vec3(.158,0,0),.1,.008),abs(l*sin(a2))-.012));
  bell=min(bell,sdCylX(p+vec3(.128,0,0),.126,.024)-.003);
  float rings=sdCylX(p-vec3(.195,0,0),.06+.018*sin(l*150.),.006);
  float m=min(min(bell,cap),rings);
  if(m<res.x)res=vec2(m,3.);
  // shaft
  float sh=sdCylX(p+vec3(.19,0,0),.02,.17);
  if(sh<res.x)res=vec2(sh,3.);
  // cradle
  vec3 c=p-vec3(0,-.158,0);
  float base=sdBox(c-vec3(0,-.03,0),vec3(.2,.012,.135))-.004;
  vec3 g=c;g.x=abs(g.x)-.13;
  float leg=max(sdBox(g,vec3(.012,.034,.1)),-(l-.135));
  float d=min(base,leg);
  if(d<res.x)res=vec2(d,4.);
  return res;
}
vec2 sdCoilSlab(vec3 p,vec3 size){
  float b=sdBox(p,size+vec3(.03,0.,0.));
  if(b>.03)return vec2(b,5.);
  float box=sdBox(p,size);
  float fin=max(box,abs(mod(p.x,.0175)-.00875)-.0026);
  float core=sdBox(p,size-vec3(.0,.002,.006));
  vec2 res=vec2(min(fin,core+.0045),5.);
  // copper tubes, seen at the ends and through the fins
  vec3 q=p;q.y=mod(q.y+.024,.048)-.024;q.z=abs(q.z)-size.z*.5;
  float t=sdCylX(q,.0072,size.x+.022);
  t=max(t,abs(p.y)-size.y);
  if(t<res.x)res=vec2(t,6.);
  // hairpin bends on the left end
  vec3 u=p+vec3(size.x+.022,0.,0.);u.y=mod(u.y+.024,.048)-.024;
  float tor=length(vec2(length(u.xz*vec2(1.,1.))-size.z*.5,u.y))-.0072;
  tor=max(tor,max(u.x,abs(p.y)-size.y));
  if(tor<res.x)res=vec2(tor,6.);
  return res;
}
vec2 sdCoil(vec3 p){
  vec2 res=vec2(1e3,5.);
  vec3 a=p-vec3(0.,0.,.12);a.yz=rot(.42)*a.yz;
  vec2 d=sdCoilSlab(a,vec3(.86,.165,.026));if(d.x<res.x)res=d;
  vec3 b=p-vec3(0.,.04,-.12);b.yz=rot(-.72)*b.yz;
  d=sdCoilSlab(b,vec3(.86,.125,.026));if(d.x<res.x)res=d;
  return res;
}
vec2 sdPcb(vec3 p){
  float b=sdBox(p,vec3(.14,.1,.04));
  if(b>.05)return vec2(b,7.);
  vec2 res=vec2(sdBox(p+vec3(0,0,.012),vec3(.13,.092,.005))-.002,7.);
  vec3 q=p-vec3(0,0,.012);
  float d=sdBox(q-vec3(-.06,.03,0),vec3(.03,.024,.012))-.002;
  d=min(d,sdBox(q-vec3(.065,.04,.004),vec3(.022,.022,.016))-.002);
  d=min(d,sdBox(q-vec3(.0,-.045,0),vec3(.08,.012,.008))-.001);
  if(d<res.x)res=vec2(d,8.);
  float cap=length(max(abs(vec2(length(q.xy-vec2(.03,.01)),q.z-.012))-vec2(.018,.022),0.))-.002;
  if(cap<res.x)res=vec2(cap,3.);
  return res;
}
vec2 sdBack(vec3 p){
  float b=sdRect(p.xy,vec2(.985,.25),.05);
  float plate=max(b,abs(p.z)-.014)-.002;
  // moulded ribs
  float rib=max(abs(mod(p.x+.09,.18)-.09)-.006,max(b+.02,abs(p.z-.014)-.012));
  rib=min(rib,max(abs(mod(p.y+.08,.16)-.08)-.005,max(b+.02,abs(p.z-.014)-.01)));
  float tray=sdBox(p-vec3(0,-.21,.14),vec3(.93,.012,.13))-.004;
  tray=min(tray,sdBox(p-vec3(0,-.185,.262),vec3(.93,.03,.006)));
  vec3 s=p;s.x=abs(s.x)-.93;
  float side=sdBox(s-vec3(0,-.02,.13),vec3(.01,.19,.12));
  float d=min(min(plate,rib),min(tray,side));
  return vec2(d,9.);
}
float sdWire(vec3 p){
  vec3 a=oMotor()+vec3(.05,.11,-.02),b=oPcb()+vec3(-.1,-.09,-.01);
  vec3 m=mix(a,b,.5)+vec3(0.,-.03,-.05);
  float d=1e3;vec3 prev=a;
  for(int i=1;i<=5;i++){float t=float(i)/5.;vec3 c=mix(mix(a,m,t),mix(m,b,t),t);d=min(d,sdCap(p,prev,c,.0075));prev=c;}
  return d;
}
vec2 mapInner(vec3 p){
  vec2 res=sdBack(p-oBack());
  float d=sdBlower(p-oBlower());if(d<res.x)res=vec2(d,1.);
  d=sdBlowerCore(p-oBlower());if(d<res.x)res=vec2(d,10.);
  vec2 v=sdMotor(p-oMotor());if(v.x<res.x)res=v;
  v=sdCoil(p-oCoil());if(v.x<res.x)res=v;
  v=sdPcb(p-oPcb());if(v.x<res.x)res=v;
  d=sdWire(p);if(d<res.x)res=vec2(d,10.);
  return res;
}

vec3 nShell(vec3 p){vec2 e=vec2(.0006,-.0006);return normalize(e.xyy*mapShell(p+e.xyy).x+e.yyx*mapShell(p+e.yyx).x+e.yxy*mapShell(p+e.yxy).x+e.xxx*mapShell(p+e.xxx).x);}
vec3 nInner(vec3 p){vec2 e=vec2(.0005,-.0005);return normalize(e.xyy*mapInner(p+e.xyy).x+e.yyx*mapInner(p+e.yyx).x+e.yxy*mapInner(p+e.yxy).x+e.xxx*mapInner(p+e.xxx).x);}

/* ---------- light ---------- */
vec3 env(vec3 d){
  float y=d.y;
  vec3 c=mix(vec3(.05,.2,.62),vec3(.012,.03,.12),smoothstep(-.5,.5,y));
  c+=vec3(.05,.42,.95)*pow(max(-y,0.),2.)*.9;                       // the blue glow under the unit
  float box=smoothstep(.1,.16,d.x+.75)*smoothstep(.1,.16,.05-d.x)*smoothstep(.22,.3,y);
  c+=vec3(1.,.99,.97)*box*2.3;                                      // big softbox above left
  c+=vec3(.75,.85,1.)*smoothstep(.02,.0,abs(d.x-.62)-.03)*smoothstep(-.1,.3,y)*1.1; // strip light
  return c;
}
const vec3 KEY=normalize(vec3(-.45,.72,.62));
float softShadow(vec3 ro,vec3 rd){
  float res=1.,t=.02;
  for(int i=0;i<18;i++){float h=mapInner(ro+rd*t).x;res=min(res,10.*h/t);t+=clamp(h,.012,.1);if(res<.02||t>1.2)break;}
  return clamp(res,0.,1.);
}
float ao(vec3 p,vec3 n,bool inner){
  float o=0.,w=1.;
  for(int i=1;i<=4;i++){float h=.012*float(i)*float(i)*.5+.006;float d=inner?mapInner(p+n*h).x:mapShell(p+n*h).x;o+=(h-d)*w;w*=.6;}
  return clamp(1.-3.5*o,0.,1.);
}
vec3 shadeInner(vec3 p,vec3 n,vec3 v,float m){
  vec3 alb=vec3(.8);float metal=0.,rough=.4;
  if(m<1.5){alb=vec3(.74,.77,.82);metal=.6;rough=.28;}
  else if(m<2.5){alb=vec3(.93,.4,.17);metal=1.;rough=.3;}
  else if(m<3.5){alb=vec3(.86,.88,.92);metal=1.;rough=.2;}
  else if(m<4.5){alb=vec3(.58,.62,.68);metal=.7;rough=.4;}
  else if(m<5.5){alb=vec3(.62,.7,.8);metal=.8;rough=.3;}
  else if(m<6.5){alb=vec3(.95,.42,.18);metal=1.;rough=.25;}
  else if(m<7.5){alb=vec3(.02,.2,.13);metal=.1;rough=.35;}
  else if(m<8.5){alb=vec3(.02,.022,.03);metal=.1;rough=.3;}
  else if(m<9.5){alb=vec3(.46,.48,.53);metal=0.;rough=.45;}
  else{alb=vec3(.02,.02,.025);metal=.2;rough=.35;}
  float ndl=max(dot(n,KEY),0.);
  float sh=softShadow(p+n*.004,KEY);
  float a=ao(p,n,true);
  vec3 r=reflect(-v,n);
  float fre=pow(1.-max(dot(n,v),0.),5.);
  vec3 f0=mix(vec3(.04),alb,metal);
  vec3 e=env(r);
  float band=.07+1.55*smoothstep(.2,.62,r.y)+.8*smoothstep(.34,.02,abs(r.x+.38))*smoothstep(-.35,.25,r.y)+.5*smoothstep(.2,.0,abs(r.x-.55))+.2*smoothstep(-.5,-.85,r.y);
  vec3 studio=vec3(band)+e*.3;
  vec3 spec=studio*(f0+(1.-f0)*fre);
  vec3 h=normalize(KEY+v);
  float s=pow(max(dot(n,h),0.),mix(220.,40.,rough))*sh;
  vec3 dif=alb*(1.-metal)*(ndl*sh*vec3(1.,.98,.95)*1.15+vec3(.16,.28,.5)*(.5-.5*n.y)+vec3(.24,.27,.34));
  dif+=alb*metal*(ndl*sh*.22+.04);
  return (dif+spec*(.55+.45*a))*a+f0*s*1.4;
}
vec3 plastic(vec3 p,vec3 n,vec3 v,vec3 base,float gloss){
  float ndl=max(dot(n,KEY),0.);
  float fill=max(dot(n,normalize(vec3(.78,.12,.52))),0.);
  float hemi=.5+.5*n.y;
  vec3 r=reflect(-v,n);
  float fre=pow(1.-max(dot(n,v),0.),4.);
  vec3 dif=base*(ndl*.5+fill*.42+.3+hemi*.2);
  vec3 h=normalize(KEY+v);
  float s=pow(max(dot(n,h),0.),220.);
  return dif+env(r)*(.035+.6*fre)*gloss+vec3(s)*.35*gloss;
}
float shellShadow(vec3 ro,vec3 rd){
  float res=1.,t=.012;
  for(int i=0;i<14;i++){float h=mapShell(ro+rd*t).x;res=min(res,7.*h/t);t+=clamp(h,.01,.08);if(res<.02||t>.7)break;}
  return clamp(res,0.,1.);
}
vec3 sampleTex(vec2 xy,float side){
  vec2 uv=vec2(xy.x/W+.5,.5-xy.y/H);
  vec4 t=texture(uTex,uv);
  vec3 lin=pow(t.rgb,vec3(2.2));
  return mix(pow(vec3(.8,.815,.87),vec3(2.2)),lin,t.a*side);
}
// x-ray pass needs the parts seen through the cover
vec4 traceInner(vec3 ro,vec3 rd){
  float t=6.;
  for(int i=0;i<110;i++){
    vec3 p=ro+rd*t;float d=mapInner(p).x;
    if(d<.0006){
      vec3 n=nInner(p);float m=mapInner(p).y;
      return vec4(shadeInner(p,n,-rd,m),1.);
    }
    t+=d*.85;if(t>13.)break;
  }
  return vec4(0.);
}
vec4 traceShell(vec3 ro,vec3 rd,out float ghost){
  float t=6.;ghost=0.;
  for(int i=0;i<90;i++){
    vec3 p=ro+rd*t;vec2 r=mapShell(p);
    if(r.x<.0004){
      vec3 n=nShell(p),v=-rd;float m=r.y;
      float ndv=max(dot(n,v),0.);
      ghost=clamp(.045+pow(1.-ndv,3.)*.75,0.,1.);
      vec3 col;
      vec3 plasticBase=pow(vec3(.8,.815,.87),vec3(2.2));
      float occ=ao(p,n,false);
      if(m>2.5){                                  // vanes and hinge arms
        col=plastic(p,n,v,vec3(.055,.058,.066),.3)*occ;
      }else if(m>1.5){                            // flap
        vec3 q;flapLocal(p,q);
        vec3 closed=q+vec3(0.,HINGEY,HINGEZ);
        vec3 tx=sampleTex(closed.xy,1.);
        float a=uFlap*.98;
        float outer=smoothstep(-.15,.15,dot(n,vec3(0.,sin(-a)*-1.*-1.,cos(a))));
        vec3 base=mix(plasticBase*.55,tx,outer);
        vec3 lit=plastic(p,n,v,base,1.)*(.55+.45*shellShadow(p+n*.004,KEY))*occ;
        col=mix(tx,lit,smoothstep(.0,.3,uFlap));
      }else{
        float inCav=step(p.z,D*.5-.016)*step(abs(p.x),VENT.x+.002)*step(p.y,VENTY+VENT.y+.003);
        if(inCav>.5){
          vec4 inn=traceInner(ro,rd);
          float depth=smoothstep(.0,.3,uFlap);
          vec3 real=(inn.a>.5?inn.rgb*.11:vec3(.003))+vec3(.004,.009,.024)*uGlow;
          col=mix(sampleTex(p.xy,1.),real,depth);
        }else{
          float fw=smoothstep(.2,.6,n.z);
          vec3 tx=sampleTex(p.xy,1.);
          vec3 base=mix(plasticBase,tx,fw);
          // seam, top grille, side trim
          float seam=smoothstep(.003,.0015,abs(p.z+.055))*(1.-fw);
          base*=1.-.6*seam;
          if(n.y>.6){float g=smoothstep(.0035,.0015,abs(mod(p.x,.024)-.012))*step(abs(p.z+.0),.13)*step(abs(p.x),.93);base*=1.-.8*g;}
          vec3 lit=plastic(p,n,v,base,1.);
          float direct=fw*(1.-uRelight);
          col=mix(lit,tx,direct);
          if(fw>.5)col=mix(col,tx*(.74+.28*max(dot(n,KEY),0.)/.6)+env(reflect(-v,n))*.11,uRelight*.999);
          col*=mix(1.,occ,.75*uRelight);
        }
      }
      return vec4(col,1.);
    }
    t+=r.x*.9;if(t>13.)break;
  }
  return vec4(0.);
}
vec4 render(vec2 px){
  vec2 ndc=(px/uRes)*2.-1.;
  float zf=CAMD-D*.5;
  vec3 ro=vec3(0.,0.,CAMD);
  vec3 rd=normalize(vec3(ndc.x*HALFW/zf/uScale,ndc.y*HALFW*(uRes.y/uRes.x)/zf/uScale,-1.));
  ro-=uPos;
  ro.yz=rot(uPitch)*ro.yz;rd.yz=rot(uPitch)*rd.yz;
  ro.xz=rot(uYaw)*ro.xz;rd.xz=rot(uYaw)*rd.xz;
  float ghost;
  vec4 sh=uGhost>.001?traceShell(ro,rd,ghost):vec4(0.);
  if(uXray<.001)return sh;
  vec4 inn=traceInner(ro,rd);
  float a=mix(1.,ghost*uGhost,uXray)*sh.a;
  vec3 gc=mix(sh.rgb,vec3(.42,.85,1.)*1.1,uXray*.86);
  vec3 c=inn.rgb*inn.a*(1.-a)+gc*a;
  float al=a+inn.a*(1.-a);
  return vec4(al>0.?c/al:vec3(0.),al);
}
uniform vec2 uJit;
void main(){
  vec4 r=render(floor(gl_FragCoord.xy)+uJit);
  frag=vec4(r.rgb*r.a,r.a);
}
