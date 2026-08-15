// Formato internacional sin + ni espacios: es lo que exige wa.me.
// 57 = Colombia.
const WHATSAPP = "573044871896";

// El mismo número en versión legible, para pintarlo en la sección de contacto.
export const WHATSAPP_TEXTO = "+57 304 487 1896";

export const whatsappUrl = (mensaje: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

export const REDES = {
  instagram:
    "https://www.instagram.com/scale.automatization/?utm_source=ig_web_button_share_sheet",
  // ponytail: sin página propia todavía; apunta al inicio de Facebook.
  facebook: "https://facebook.com",
};
