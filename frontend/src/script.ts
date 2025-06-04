const apiUrl: string = "http://localhost:3000";
const apiUrlAvatar: string = "http://localhost:3001";

let currentUser: string | null = null;

declare const content: { [key: string]: string };

const avatarModal = document.getElementById('avatarModal') as HTMLDivElement | null;

let selectedAvatarTemp: string | null = null;

// Chargement du profil utilisateur
async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${apiUrl}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur lors du chargement du profil');
    const user = await res.json();

    updateProfileUI(user);
  } catch (err) {
    console.error(err);
  }
}

// Mise à jour affichage profil utilisateur (nom + avatar)
function updateProfileUI(user: { username: string; avatarUrl?: string }) {
  const usernameElem = document.getElementById('profileUsername');
  const avatarElem = document.getElementById('profile-avatar') as HTMLImageElement;

  console.log("user =", user); // Log complet de l'utilisateur
  console.log("usernameElem =", usernameElem);
  console.log("avatarElem =", avatarElem);

  if (usernameElem) {
    usernameElem.textContent = user.username || 'Utilisateur';
  } else {
    console.warn("⚠️ Élément 'profileUsername' non trouvé !");
  }

  if (avatarElem) {
    if (user.avatarUrl && user.avatarUrl.trim() !== '') {
      avatarElem.src = apiUrlAvatar + user.avatarUrl;
      console.log("✅ Avatar personnalisé chargé :", avatarElem.src);
    } else {
      avatarElem.src = '/assets/default-avatar.png';
      console.log("ℹ️ Avatar par défaut utilisé :", avatarElem.src);
    }
  } else {
    console.warn("⚠️ Élément 'profile-avatar' non trouvé !");
  }
}

// Fonction pour ouvrir la pop-up et charger les avatars
async function openAvatarLibrary() {
console.log('openAvatarLibrary appelée');
  const avatarModal = document.getElementById('avatarModal') as HTMLDivElement | null;
  const avatarList = document.getElementById('avatarList') as HTMLDivElement | null;
  if (!avatarModal || !avatarList) return;

  avatarModal.classList.remove('hidden');
  avatarList.innerHTML = '';

  try {
    console.log("Chargement avatars depuis", apiUrlAvatar + '/api/avatars');
    const res = await fetch(`${apiUrlAvatar}/api/avatars`);
    if (!res.ok) throw new Error('Erreur lors du chargement des avatars');

    const data = await res.json() as { avatars: string[] };

    data.avatars.forEach(avatarUrl => {
    const img = document.createElement('img');
    img.src = apiUrlAvatar + avatarUrl; // <-- ici, concatène la base URL complète
    img.alt = 'Avatar';
    img.className = 'cursor-pointer rounded border-2 border-transparent hover:border-cyan-500';
    img.style.width = '64px';
    img.style.height = '64px';
    img.style.objectFit = 'cover';

    img.addEventListener('click', () => {
    
    selectAvatar(avatarUrl);
    });

    avatarList.appendChild(img);
    });
  } catch (error) {
    if (avatarList) avatarList.innerHTML = '<p class="text-red-500">Impossible de charger les avatars.</p>';
    console.error(error);
  }
}

function selectAvatar(avatarUrl: string) {
  selectedAvatarTemp = avatarUrl;
  // Met à jour l'affichage local dans la pop-up (facultatif)
  const preview = document.getElementById('avatarPreview') as HTMLImageElement | null;
  if (preview) {
    preview.src = apiUrlAvatar + avatarUrl;
  }
}

async function saveSelectedAvatar() {
  if (!selectedAvatarTemp) return;

  try {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('Token manquant, utilisateur non authentifié');
      return;
    }

    const res = await fetch(`${apiUrl}/api/profile/avatar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ avatar_url: selectedAvatarTemp }),
    });

    if (!res.ok) throw new Error('Erreur lors de la sauvegarde de l\'avatar');

    const data = await res.json();
    console.log('Avatar sauvegardé avec succès:', data);

    // Met à jour l'avatar dans le profil
    const profileAvatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;
    if (profileAvatarImg && data.avatarUrl) {
      profileAvatarImg.src = apiUrlAvatar + (data.avatarUrl.startsWith('/') ? data.avatarUrl : '/' + data.avatarUrl) + '?t=' + Date.now();
    }

    // Ferme la pop-up
    closeModal();
    selectedAvatarTemp = null;

  } catch (err) {
    console.error(err);
  }
}

// Fermer la pop-up avatar
function closeModal() {
  const avatarModal = document.getElementById('avatarModal');
  if (!avatarModal) return;
  avatarModal.classList.add('hidden');
}

// Mise à jour affichage menu utilisateur
function updateUserMenu(): void {
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

// Vérification session serveur au chargement
async function checkSession(): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    currentUser = null;
    updateUserMenu();
    return;
  }

  try {
    const response = await fetch('/api/check-session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data: { isLoggedIn: boolean; username?: string } = await response.json();
      if (data.isLoggedIn && data.username) {
        currentUser = data.username;
      } else {
        currentUser = null;
        localStorage.removeItem("token");
      }
    } else {
      currentUser = null;
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de la session :", error);
    currentUser = null;
  }

  updateUserMenu();
}

// Création de compte
async function createAccount(): Promise<void> {
  const usernameInput = document.getElementById('signup-username') as HTMLInputElement | null;
  const passwordInput = document.getElementById('signup-password') as HTMLInputElement | null;
  if (!usernameInput || !passwordInput) {
    alert("Formulaire non trouvé");
    return;
  }
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data: { success: boolean; message?: string } = await res.json();
    if (res.ok && data.success) {
      alert('Compte créé, connectez-vous !');
      navigate('login');
    } else {
      alert(data.message || 'Erreur lors de la création');
    }
  } catch (error) {
    console.error('Erreur réseau :', error);
    alert('Erreur réseau lors de la création du compte');
  }
}

// Connexion utilisateur
async function loginUser() {
  const usernameInput = document.getElementById("login-username") as HTMLInputElement | null;
  const passwordInput = document.getElementById("login-password") as HTMLInputElement | null;

  if (!usernameInput || !passwordInput) {
    alert("Le formulaire de connexion n'est pas chargé.");
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data: { success: boolean; token?: string } = await response.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        currentUser = username;
        updateUserMenu();
        navigate('home');
      } else {
        alert("Identifiants incorrects.");
      }
    } else {
      alert("Erreur lors de la connexion.");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Erreur réseau lors de la connexion.");
  }
}

// Déconnexion
async function logoutUser(): Promise<void> {
  localStorage.removeItem("token");
  currentUser = null;
  updateUserMenu();
  navigate('home');
}

// Fonction de navigation et gestion du contenu dynamique
function navigate(page: string) {
  const publicPages = ['login', 'signup', 'home'];

  if (!currentUser && !publicPages.includes(page)) {
    page = 'login';
  }

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = content[page] ?? '<p>Page introuvable</p>';

  // Gestion des événements dans le contenu chargé dynamiquement
  if (page === 'login') {
    const loginBtn = main.querySelector('button');
    if (loginBtn) loginBtn.addEventListener('click', loginUser);

    const signupLink = main.querySelector("#signuplink");
    if (signupLink) {
      signupLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigate("signup");
      });
    }
  } else if (page === 'signup') {
    const createAccountBtn = main.querySelector('button');
    if (createAccountBtn) createAccountBtn.addEventListener('click', createAccount);
  }

  if (page === 'profil') {
    const chooseAvatarBtn = main.querySelector('#chooseAvatarBtn') as HTMLButtonElement | null;
    const avatarModal = main.querySelector('#avatarModal') as HTMLDivElement | null;
    const closeAvatarModal = main.querySelector('#closeAvatarModal') as HTMLButtonElement | null;
    const saveAvatarBtn = main.querySelector('#saveAvatarBtn') as HTMLButtonElement | null;
    const changePasswordBtn = main.querySelector('#changePasswordBtn') as HTMLButtonElement | null;
    const passwordModal = main.querySelector('#passwordModal') as HTMLDivElement | null;
    const cancelPasswordChange = main.querySelector('#cancelPasswordChange') as HTMLButtonElement | null;
    const passwordForm = main.querySelector('#passwordChangeForm') as HTMLFormElement | null;
    loadUserProfile();

    saveAvatarBtn?.addEventListener('click', saveSelectedAvatar);

    chooseAvatarBtn?.addEventListener('click', () => {
      console.log('Bouton cliqué !');
      openAvatarLibrary();
    });
    closeAvatarModal?.addEventListener('click', () => {
      if (avatarModal) avatarModal.classList.add('hidden');
    });

    avatarModal?.addEventListener('click', (e) => {
      if (e.target === avatarModal) avatarModal.classList.add('hidden');
    });

    // Bouton "Changer le mot de passe"
    changePasswordBtn?.addEventListener('click', () => {
      passwordModal?.classList.remove('hidden');
    });

    // Bouton "Annuler" dans la modal
    cancelPasswordChange?.addEventListener('click', () => {
      passwordModal?.classList.add('hidden');
    });

    // Soumission du formulaire de changement de mot de passe
    passwordForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPassword = (main.querySelector('#oldPassword') as HTMLInputElement).value;
      const newPassword = (main.querySelector('#newPassword') as HTMLInputElement).value;

      try {
        const res = await fetch(`${apiUrl}/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors du changement de mot de passe');

        alert('✅ Mot de passe changé avec succès !');
        passwordModal?.classList.add('hidden');
      } catch (err: any) {
        alert('❌ ' + err.message);
      }
    });
    
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

// Gestion du menu utilisateur (dropdown)
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

  // Initialisation de l’état utilisateur
  checkSession();

  // Chargement de la page d'accueil par défaut
  navigate('home');
});
