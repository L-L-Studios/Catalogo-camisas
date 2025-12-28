// supabase.js - VERSIÓN CORREGIDA
console.log('🔧 Cargando Supabase...');

// Verificar si ya está cargado
if (window.supabase) {
  console.log('✅ Supabase ya está cargado');
} else {
  (function () {
    const SUPABASE_URL = "https://bpfqaydoopbjfzasgamu.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_lQm9e9OVzJR9iU0uNlBSOg_zid5dFB7";

    // Cargar la librería de Supabase solo si no está ya cargada
    if (!document.querySelector('script[src*="supabase-js"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => {
        console.log('📚 Librería Supabase cargada');
        
        // Crear cliente
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Cliente Supabase creado");
        
        // Disparar evento cuando Supabase esté listo
        const event = new CustomEvent('supabase:ready', { 
          detail: { client: window.supabase } 
        });
        document.dispatchEvent(event);
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando la librería Supabase');
      };
      
      document.head.appendChild(script);
    }
  })();
}