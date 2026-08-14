// Publicaciones de Instagram incrustadas (embed oficial por URL).
//
// No necesita cuenta profesional, ni Facebook, ni API: Instagram permite
// incrustar cualquier publicación PÚBLICA pegando su enlace.
//
// Reparto del contenido:
//   - postsKentucky → publicaciones de la etapa de Kentucky
//     (se muestran en Crónicas y Kentukianas).
//   - postsMenorca  → publicaciones nuevas de Menorca (se muestran en Menorquianas).
//
// Cómo añadir una publicación: abre el post en Instagram, copia su enlace
// (botón «…» → «Copiar enlace», o la URL del navegador) y pégalo en la lista.
// Debe tener este formato:  https://www.instagram.com/p/XXXXXXXXX/
// (los reels valen igual: https://www.instagram.com/reel/XXXXXXXXX/)
//
// Mientras una lista esté vacía, esa sección no mostrará nada.

export const INSTAGRAM = {
  handle: "cronicaskentukianas",
  postsKentucky: [
    "https://www.instagram.com/p/DQV-FirDIvP/",
    "https://www.instagram.com/p/DQkEG0XjHD1/",
    "https://www.instagram.com/p/DQy0DcJjB3D/",
    "https://www.instagram.com/p/DQyzZPxjLZa/",
    "https://www.instagram.com/p/DQpJDZlDNxT/",
    "https://www.instagram.com/p/DQnEpMSjFy7/",
    "https://www.instagram.com/p/DQZkUP-DArZ/",
    "https://www.instagram.com/p/DByoPiaI2UI/",
  ] as string[],
  postsMenorca: [] as string[],
};
