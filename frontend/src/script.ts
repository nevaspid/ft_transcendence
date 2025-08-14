import { initProfilPage } from './profilPage';
import { t, Language } from './i18n/i18n';
import fr from './i18n/fr.json'; 
import en from './i18n/en.json'; 
import es from './i18n/es.json'; 
import { toCanvas } from 'qrcode';


// -----------------------------
// 🧠 Variables utilisateur
// -----------------------------
export let pseudoUser: string | null = localStorage.getItem("pseudoUser");
export let currentUser: string | null = localStorage.getItem("username");


let is2FANeeded = false;
let is2FASetup = false;
let user2FASecret: string | null = null;
let currentPage = 'home';

declare const content: { [key: string]: string }; // Contenu HTML dynamique (pages)

// Pour Google Sign-In
declare global { interface Window { google: any; } }


// 📌 État utilisateur global (reactif)
export const userState = {
  username: "",
  pseudoUser: "",
  currentUser: "",
  avatarBaseUrl: ""
};

// -----------------------------
// 🌍 Gestion Crawl intro
// -----------------------------

function showCrawlLang(lang: 'fr' | 'en' | 'es') {
  const blocks = document.querySelectorAll('.lang-block');
  blocks.forEach(block => {
    const el = block as HTMLElement;
    el.style.display = el.classList.contains(lang) ? 'block' : 'none';
  });
}

function restartCrawlAnimation() {
  const crawl = document.querySelector('.crawl') as HTMLElement;
  crawl.classList.remove('animate-crawl');
  // Force reflow
  void crawl.offsetWidth;
  crawl.classList.add('animate-crawl');
}


// -----------------------------
// 🌍 Gestion multilingue
// -----------------------------

export function applyTranslations(lang: Language): void {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n') as keyof typeof fr;
    if (!key) return;

    const useHTML = el.hasAttribute('data-i18n-html');

    // Traduction
    const translation = t(lang, key);

    // Gestion des attributs spéciaux
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      // Pour input/textarea, on traduit le placeholder
      el.placeholder = translation;
    } else if (el instanceof HTMLImageElement) {
      // Pour image, on traduit l'attribut alt
      el.alt = translation;
    } else if (el.hasAttribute('data-i18n-attr')) {
      // Si un attribut est spécifié explicitement, ex: data-i18n-attr="title"
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, translation);
    } else {
      // Sinon, injecter soit HTML soit texte dans le contenu
      if (useHTML) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    }
  });
}


const selector = document.getElementById('languageSelector') as HTMLSelectElement;
export let currentLang: Language = 'fr'; // Valeur par défaut


// Fonction pour charger la langue depuis le backend
async function loadUserLanguage(): Promise<Language> {
  const token = localStorage.getItem('token');
  if (!token) return localStorage.getItem('lang') as Language || 'fr';

  try {
    const res = await fetch(`/api/language`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok)throw new Error(t(currentLang, 'server_language_unavailable'));

    const data = await res.json();
    const lang = data.language as Language;

    localStorage.setItem('lang', lang);
    return lang;
  } catch (err) {
    console.warn('Erreur chargement langue utilisateur:', err);
    return localStorage.getItem('lang') as Language || 'fr';
  }
}

// Fonction pour enregistrer la langue côté serveur
async function saveUserLanguage(lang: Language): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await fetch(`/api/language`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lang }),
    });
  } catch (err) {
    console.warn('Erreur enregistrement langue côté serveur:', err);
  }
}

// Initialisation au chargement
loadUserLanguage().then(lang => {
  currentLang = lang;
  applyTranslations(lang);
  if (selector) selector.value = lang;
});

// Listener sur le sélecteur
if (selector) {
  selector.addEventListener('change', async () => {
    const newLang = selector.value as Language;
    localStorage.setItem('lang', newLang);
    currentLang = newLang;
    applyTranslations(newLang);
    await saveUserLanguage(newLang);

  if (currentPage === 'space') {
    // Redémarrage de l'animation
    const crawl = document.querySelector<HTMLElement>('.crawl');
    if (crawl) {
      crawl.style.animation = 'none';
      void crawl.offsetHeight; // forcer reflow
      crawl.style.animation = 'crawl 90s linear forwards';
    }

    // Gestion affichage blocs langue
    const allLangBlocks = document.querySelectorAll<HTMLElement>('.crawl .lang-block');
    allLangBlocks.forEach(block => block.classList.add('hidden'));

    const activeBlock = document.querySelector<HTMLElement>(`.crawl .lang-block.${newLang}`);
    if (activeBlock) activeBlock.classList.remove('hidden');
  }
  });
}

// -----------------------------
// 🔁 Mise à jour menu utilisateur
// -----------------------------

export function updateUserMenu(): void {
  const loginBtn = document.getElementById("loginBtn") as HTMLElement | null;
  const userMenu = document.getElementById("userMenu") as HTMLElement | null;
  const usernameSpan = document.getElementById("username") as HTMLElement | null;

  if (!loginBtn || !userMenu || !usernameSpan) return;
 
  if (currentUser) {
    loginBtn.style.display = "none";
    userMenu.classList.remove("hidden");
    usernameSpan.textContent = currentUser;
  } else {
    loginBtn.style.display = "inline-block";
    userMenu.classList.add("hidden");
  }
}

// -----------------------------
// ✅ Vérification session au chargement
// -----------------------------

async function checkSession(): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) {
    currentUser = null;
    userState.pseudoUser = null;
    updateUserMenu();
    return;
  }

  try {
    const response = await fetch(`/api/check-session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data: { isLoggedIn: boolean; username?: string; pseudo?: string } = await response.json();

      if (data.isLoggedIn && data.username) {
        if (data.pseudo) {
          userState.pseudoUser = data.pseudo;
          currentUser = data.username;
        } else if (data.username) {
          userState.pseudoUser = data.username;
          currentUser = data.username;
        } else {
          userState.pseudoUser = null;
          currentUser = null;
          localStorage.removeItem("token");
        }
      } else {
        userState.pseudoUser = null;
        currentUser = null;
        localStorage.removeItem("token");
      }
    } else {
      userState.pseudoUser = null;
      currentUser = null;
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de la session :", error);
    userState.pseudoUser = null;
    currentUser = null;
  }

  updateUserMenu();
}

// -----------------------------
// 👤 Création de compte
// -----------------------------
async function createAccount(): Promise<void> {
  const usernameInput = document.getElementById('signup-username') as HTMLInputElement | null;
  const pseudoInput = document.getElementById('signup-pseudo') as HTMLInputElement | null;
  const passwordInput = document.getElementById('signup-password') as HTMLInputElement | null;
  const emailInput = document.getElementById('signup-email') as HTMLInputElement | null;
  
  if (!usernameInput || !pseudoInput || !passwordInput || !emailInput) {
    alert(t(currentLang, "signup_form_incomplete"));
    return;
  }

  const username = usernameInput.value.trim();
  const pseudo = pseudoInput.value.trim();
  const password = passwordInput.value.trim();
  const email = emailInput.value.trim();

  if (!username || !pseudo || !password || !email) {
    alert(t(currentLang, "signup_fill_all_fields"));
    return;
  }

  try {
    const res = await fetch(`/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pseudo, password, email }) // <-- envoyer pseudo
    });

    const data: { success: boolean; message?: string } = await res.json();
    if (res.ok && data.success) {
      alert(t(currentLang, "signup_success"));
      navigate('login');
    } else {
      alert(data.message || t(currentLang, "signup_error"));
    }
  } catch (error) {
    console.error('Erreur réseau :', error);
    alert(t(currentLang, "signup_network_error"));
  }
}


// -----------------------------
// 🔐 Connexion google
// -----------------------------

window.addEventListener("DOMContentLoaded", () => {
  if (!google || !google.accounts || !google.accounts.id) {
    console.error("Google Identity Services non chargé");
    return;
  }

  google.accounts.id.initialize({
    client_id: "328156739515-ih1nrcb5b34e34af004ptsdfvktbfg1u.apps.googleusercontent.com",
    callback: handleGoogleSignIn,
  });
  // Charger user depuis localStorage
  currentUser = localStorage.getItem("username");
  userState.pseudoUser = localStorage.getItem("pseudo") || null; 
});

function handleGoogleSignIn(response?: google.accounts.id.CredentialResponse): void {
  if (!response?.credential) {
    console.error("Aucun token reçu de Google");
    return;
  }

  fetch(`/auth/google`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: response.credential }),
  })
  .then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur d'authentification");
    currentUser = data.user.username;
    userState.pseudoUser = data.user.pseudo;
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("pseudo", data.user.pseudo);
    updateUserMenu();
    navigate("home");
  })
  .catch((err) => {
    console.error("Erreur Google Sign-In :", err);
    alert(t(currentLang, "google_login_error"));
  });
}

// -----------------------------
// 🔐 Connexion classique
// -----------------------------

// -----------------------------
// 🔐 Vérification manuelle 2FA (étape 1)
async function loginUser() {
  const usernameInput = document.getElementById("login-username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("login-password") as HTMLInputElement | null;
  const twoFaDiv = document.getElementById("2fa-management");

  if (!usernameInput || !passwordInput || !twoFaDiv) {
    alert(t(currentLang, "form_incomplete"));
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert(t(currentLang, "fill_all_fields"));
    return;
  }

  try {
    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(t(currentLang, data.message || "login_error"));
      return;
    }

    // Stockage du pseudo + état global
    pseudoUser = data.pseudo || null;
    userState.pseudoUser = pseudoUser;
    localStorage.setItem("pseudoUser", userState.pseudoUser || "");

     // ➕ Si 2FA est requis
    if (data.twofaRequired) {
      twoFaDiv.classList.remove("hidden");
      const verifyButton = document.getElementById("verify-2fa-button") as HTMLButtonElement;

      verifyButton.onclick = async () => {
        const codeInput = document.getElementById("2fa-code") as HTMLInputElement;
        const code = codeInput?.value.trim();

        if (!code) {
          alert(t(currentLang, "enter_2fa_code"));
          return;
        }

        try {
          const res = await fetch(`/api/auth/verify-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, twoFactorToken: code }),
          });

          const resData = await res.json();

          if (!res.ok || !resData.success) {
            alert(t(currentLang, resData.message || "invalid_2fa_code"));
            return;
          }

          if (resData.token) {
            localStorage.setItem("token", resData.token);

            // 🟡 appliquer la langue utilisateur
            const lang = await loadUserLanguage();
            applyTranslations(lang);
            if (selector) selector.value = lang;

            await checkSession();
            navigate('home');
          }
        } catch (error) {
          alert(t(currentLang, "network_error_2fa_2"));
          console.error(error);
        }
      };

    } else if (data.token) {
      localStorage.setItem("token", data.token);

      // 🟡 appliquer la langue utilisateur
      const lang = await loadUserLanguage();
      applyTranslations(lang);
      if (selector) selector.value = lang;

      await checkSession();
      navigate('home');
    }

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Erreur réseau.");
  }
}

// -----------------------------
// 🔐 Vérification manuelle 2FA (étape 2)
async function verify2FA() {
  const codeInput = document.getElementById("2fa-code") as HTMLInputElement | null;

  if (!codeInput) {
    alert(t(currentLang, "missing_2fa_field"));
    return;
  }

  const code = codeInput.value.trim();

  if (!code) {
    alert(t(currentLang, "enter_2fa_code"));
    return;
  }

  if (!currentUser) {
    alert(t(currentLang, "user_not_defined"));
    return;
  }

  try {
    const response = await fetch(`/api/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, code })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(t(currentLang, data.message || "invalid_2fa_code"));
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      updateUserMenu();
      navigate("home");
    }

  } catch (error) {
    console.error("Erreur lors de la vérification 2FA :", error);
    alert(t(currentLang, "network_error"));
  }
}

// -----------------------------
// 🔓 Déconnexion
async function logoutUser(): Promise<void> {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("pseudo");
  currentUser = null;
  pseudoUser = null;
  userState.pseudoUser = null;
  userState.currentUser = null;
  updateUserMenu();
  navigate('home');
}

// -----------------------------
// 📦 Navigation dynamique entre les pages
// -----------------------------

async function navigate(page: string) {
  const publicPages = ['login', 'signup', 'home'];
  currentPage = page;
  
  if (!currentUser && !publicPages.includes(page)) {
    page = 'login';
  }

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = content[page] ?? '<p>Page introuvable</p>';

  currentLang = await loadUserLanguage();
  applyTranslations(currentLang);
  
  if (selector) selector.value = currentLang;

  if (page === 'space') {
    // Afficher le bloc langue correct et cacher les autres
    const langBlocks = main.querySelectorAll<HTMLElement>('.lang-block');
    langBlocks.forEach(block => {
      if (block.classList.contains(currentLang)) {
        block.classList.remove('hidden');
      } else {
        block.classList.add('hidden');
      }
    });

    // Reset animation CSS sur .crawl pour relancer le scroll
    const crawl = main.querySelector<HTMLElement>('.crawl');
    if (crawl) {
      crawl.style.animation = 'none';
      // trigger reflow
      void crawl.offsetHeight;
      // relancer l'animation crawl (la même que dans CSS)
      crawl.style.animation = 'crawl 90s linear forwards';
    }
  }

   // Gestion des événements dynamiques en fonction de la page
  if (page === 'login') {
    // Bouton login classique
    const loginBtn = main.querySelector('#loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', (e) => {
      e.preventDefault(); // pour éviter le rechargement de page si bouton dans un form
      loginUser();
    });

    // Lien vers signup
    const signupLink = main.querySelector("#signuplink");
    if (signupLink) {
      signupLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigate("signup");
      });
    } 
    // ======== Gestion du bouton Google Sign-In ========
    const googleSignInBtn = main.querySelector('#custom-google-btn');
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        google.accounts.id.prompt();
      });
      
    }

  }
  // 📝 Page signup
  else if (page === 'signup') {
    const createAccountBtn = main.querySelector('button');
    if (createAccountBtn) createAccountBtn.addEventListener('click', createAccount);
  }
  if(page === 'profil'){
    initProfilPage();
  }

  // Ajout gestion boutons avec data-page dans contenu dynamique
  const buttons = main.querySelectorAll<HTMLButtonElement>('[data-page]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetPage = button.dataset.page;
      if (targetPage) navigate(targetPage);
    });
  });
  // Met à jour l’état du menu utilisateur après chaque navigation
  updateUserMenu();
}

// -----------------------------
// 📅 Événements DOM initiaux
// ----------------------------- 

document.getElementById("userBtn")?.addEventListener("click", (event: MouseEvent) => {
  event.stopPropagation();
  const dropdown = document.getElementById("dropdownMenu");
  dropdown?.classList.toggle("hidden");
});

document.addEventListener("click", (event: MouseEvent) => {
  const dropdown = document.getElementById("dropdownMenu");
  const userBtn = document.getElementById("userBtn");

  if (dropdown && userBtn && !dropdown.classList.contains("hidden") && !userBtn.contains(event.target as Node)) {
    dropdown.classList.add("hidden");
  }
});

// Événement unique DOMContentLoaded pour lier tous les événements fixes
document.addEventListener('DOMContentLoaded', () => {
  // Bouton login dans le header/menu principal (hors contenu dynamique)
  document.getElementById("loginBtn")?.addEventListener("click", () => {
    navigate("login");
  });

  // Bouton logout dans le menu utilisateur
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    logoutUser();
  });

  // Bouton profil
  document.getElementById("profilBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("profil");
  });

  // Boutons dans le menu principal qui ont data-page
  const navButtons = document.querySelectorAll<HTMLButtonElement>("button[data-page]");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (page) navigate(page);
    });
});

  checkSession();  // Vérifie si utilisateur est connecté

  navigate('home'); // Affiche la page d'accueil au démarrage
});