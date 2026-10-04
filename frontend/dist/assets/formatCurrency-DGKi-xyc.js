function e(n){const r=Number(n||0);return!Number.isFinite(r)||r<=0?"Liên hệ":new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(r)}export{e as f};
