module.exports=[25635,a=>{"use strict";let b=(0,a.i(70106).default)("compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);a.s(["Compass",()=>b],25635)},41710,a=>{"use strict";let b=(0,a.i(70106).default)("clock",[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);a.s(["Clock",()=>b],41710)},75849,a=>{"use strict";var b=a.i(87924),c=a.i(38246),d=a.i(50944),e=a.i(41710),f=a.i(25635),g=a.i(70106);let h=(0,g.default)("map",[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]]),i=(0,g.default)("video",[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]]),j=(0,g.default)("moon",[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]),k=(0,g.default)("book-open",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]),l=[{href:"/",label:"Jadwal",icon:e.Clock},{href:"/compass",label:"Kompas",icon:f.Compass},{href:"/ramadhan",label:"Ramadhan",icon:j},{href:"/quran",label:"Quran",icon:k},{href:"/pathway",label:"Peta",icon:h},{href:"/videos",label:"Video",icon:i}];function m({visible:a=!0}){let e=(0,d.usePathname)();return(0,b.jsx)("div",{className:`
        fixed bottom-6 left-1/2 z-[1000]
        -translate-x-1/2
        w-[90%] max-w-md
        rounded-2xl
        bg-white
        shadow-xl
        p-2
        flex gap-2
        transition-all duration-300
        ${a?"translate-y-0 opacity-100":"translate-y-24 opacity-0 pointer-events-none"}
      `,children:l.map(a=>{let d=e===a.href,f=a.icon;return(0,b.jsx)(c.default,{href:a.href,className:`
              flex flex-1 flex-col items-center justify-center
              gap-1 py-2 rounded-xl
              text-xs font-medium
              transition-all duration-300
              ${d?"bg-[var(--color-royal)] text-white shadow-md":"text-purple-700 hover:bg-purple-50"}
            `,children:(0,b.jsx)(f,{size:18,strokeWidth:2.2})},a.href)})})}a.s(["default",()=>m],75849)}];

//# sourceMappingURL=_a26241aa._.js.map