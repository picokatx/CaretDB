import{U as u}from"./Bm2e5bU1.js";import{bk as b,aR as r,aS as d,aT as l,b6 as a,b5 as y,b0 as w,bc as B,bj as $,b9 as i,bt as k,a_ as g,aW as h,b7 as I,b8 as p,aV as P,bb as D,bu as S,bv as V,ba as A,aU as H}from"./BZDiR4Go.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},n=new e.Error().stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4b1f0ca4-ef93-4178-a818-d75f25b320af",e._sentryDebugIdIdentifier="sentry-dbid-4b1f0ca4-ef93-4178-a818-d75f25b320af")}catch{}})();var f={name:"MinusIcon",extends:b};function T(e,n,t,c,o,s){return r(),d("svg",a({width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e.pti()),n[0]||(n[0]=[l("path",{d:"M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",fill:"currentColor"},null,-1)]),16)}f.render=T;var m={name:"PlusIcon",extends:b};function E(e,n,t,c,o,s){return r(),d("svg",a({width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e.pti()),n[0]||(n[0]=[l("path",{d:"M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z",fill:"currentColor"},null,-1)]),16)}m.render=E;var K=function(n){var t=n.dt;return`
.p-panel {
    border: 1px solid `.concat(t("panel.border.color"),`;
    border-radius: `).concat(t("panel.border.radius"),`;
    background: `).concat(t("panel.background"),`;
    color: `).concat(t("panel.color"),`;
}

.p-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: `).concat(t("panel.header.padding"),`;
    background: `).concat(t("panel.header.background"),`;
    color: `).concat(t("panel.header.color"),`;
    border-style: solid;
    border-width: `).concat(t("panel.header.border.width"),`;
    border-color: `).concat(t("panel.header.border.color"),`;
    border-radius: `).concat(t("panel.header.border.radius"),`;
}

.p-panel-toggleable .p-panel-header {
    padding: `).concat(t("panel.toggleable.header.padding"),`;
}

.p-panel-title {
    line-height: 1;
    font-weight: `).concat(t("panel.title.font.weight"),`;
}

.p-panel-content {
    padding: `).concat(t("panel.content.padding"),`;
}

.p-panel-footer {
    padding: `).concat(t("panel.footer.padding"),`;
}
`)},L={root:function(n){var t=n.props;return["p-panel p-component",{"p-panel-toggleable":t.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",content:"p-panel-content",footer:"p-panel-footer"},M=y.extend({name:"panel",theme:K,classes:L}),N={name:"BasePanel",extends:A,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:M,provide:function(){return{$pcPanel:this,$parentInstance:this}}},j={name:"Panel",extends:N,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{id:this.$attrs.id,d_collapsed:this.collapsed}},watch:{"$attrs.id":function(n){this.id=n||u()},collapsed:function(n){this.d_collapsed=n}},mounted:function(){this.id=this.id||u()},methods:{toggle:function(n){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:n,value:this.d_collapsed})},onKeyDown:function(n){(n.code==="Enter"||n.code==="NumpadEnter"||n.code==="Space")&&(this.toggle(n),n.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header}},components:{PlusIcon:m,MinusIcon:f,Button:w},directives:{ripple:B}},U=["id"],R=["id","aria-labelledby"];function Z(e,n,t,c,o,s){var C=$("Button");return r(),d("div",a({class:e.cx("root")},e.ptmi("root")),[l("div",a({class:e.cx("header")},e.ptm("header")),[i(e.$slots,"header",{id:o.id+"_header",class:k(e.cx("title"))},function(){return[e.header?(r(),d("span",a({key:0,id:o.id+"_header",class:e.cx("title")},e.ptm("title")),H(e.header),17,U)):p("",!0)]}),l("div",a({class:e.cx("headerActions")},e.ptm("headerActions")),[i(e.$slots,"icons"),e.toggleable?(r(),g(C,a({key:0,id:o.id+"_header",class:e.cx("pcToggleButton"),"aria-label":s.buttonAriaLabel,"aria-controls":o.id+"_content","aria-expanded":!o.d_collapsed,unstyled:e.unstyled,onClick:s.toggle,onKeydown:s.onKeyDown},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:h(function(v){return[i(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:o.d_collapsed},function(){return[(r(),g(I(o.d_collapsed?"PlusIcon":"MinusIcon"),a({class:v.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","onClick","onKeydown","pt"])):p("",!0)],16)],16),P(V,a({name:"p-toggleable-content"},e.ptm("transition")),{default:h(function(){return[D(l("div",a({id:o.id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":o.id+"_header"},e.ptm("contentContainer")),[l("div",a({class:e.cx("content")},e.ptm("content")),[i(e.$slots,"default")],16),e.$slots.footer?(r(),d("div",a({key:0,class:e.cx("footer")},e.ptm("footer")),[i(e.$slots,"footer")],16)):p("",!0)],16,R),[[S,!o.d_collapsed]])]}),_:3},16)],16)}j.render=Z;export{f as a,j as b,m as s};
