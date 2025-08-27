const apiUrlAvatar = import.meta.env.VITE_API_URL_AVATAR || '/avatar';
const AVATAR_BASE_URL = "http://pongwars.com:3001";


import { currentUser, userState, updateUserMenu } from "./script";
import { applyTranslations } from "./script";
import { t, Language } from './i18n/i18n';
import fr from './i18n/fr.json'; 
import en from './i18n/en.json'; 
import es from './i18n/es.json'; 
import { currentLang } from './script';

let selectedAvatarTemp: string | null = null;
let currentUserId: number | null = null;

/**
 * Initialise la page de profil : gestion des modales, avatars, formulaire de profil, mot de passe, 2FA...
 */

export type UserData = {
  id: number;
  pseudo: string;
  avatar?: string; // si ton backend renvoie aussi un avatar
};

export type MatchData = {
  matchId: number;
  p1: number;
  p2: number;
  p1Score: number;
  p2Score: number;
  winner: number;
  isTournament: number;
  spaceInvaders: number;
};

export type TournamentData = {
  tournamentId: number;
  tournamentName: string;
  nbPlayers: number;
  matchIds: number[];
};

// =======================
// Nouvelle route: GET /users/:id
// =======================
async function fetchUser(userId: number): Promise<UserData> {
  if (!Number.isFinite(userId) || userId < 1) {
    throw new TypeError("userId must be a number over 0");
  }

  const res = await fetch(`/api/users/by-id/${userId}`);
  if (!res.ok) throw new Error(`GET /api/users/by-id/${userId} -> HTTP ${res.status}`);

  return (await res.json()) as UserData;
}

// =======================
// Nouvelle fonction loadMatches
// =======================

//GET /matches/:id
async function fetchMatch(id: number): Promise<MatchData> {
  if (!Number.isFinite(id) || id < 1) throw new TypeError("id must be a number over 0");

  const res = await fetch(`/blockchain/matches/${id}`);
  if (!res.ok) throw new Error(`GET /matches/${id} -> HTTP ${res.status}`);

  return (await res.json()) as MatchData;
}

//GET /tournament/:id
 async function fetchTournament(id: number): Promise<TournamentData> {
  if (!Number.isFinite(id) || id < 1) throw new TypeError("id must be a number over 0");

  const res = await fetch(`/blockchain/tournament/${id}`);
  if (!res.ok) throw new Error(`GET /tournament/${id} -> HTTP ${res.status}`);

  return (await res.json()) as TournamentData;
}

async function fetchPlayerMatches(playerId: number): Promise<number[]> {
  if (!Number.isFinite(playerId) || playerId < 1) 
    throw new TypeError("playerId must be a number over 0");

  const res = await fetch(`/blockchain/playerMatches/${playerId}`);
  
  if (!res.ok) 
    throw new Error(`GET /playerMatches/${playerId} -> HTTP ${res.status}`);

  const data = await res.json();


  if (Array.isArray(data.matchIds)) {
    console.log("matchIds récupérés:", data.matchIds);
  } else {
    console.warn("⚠️ matchIds n'est pas un tableau", data.matchIds);
  }

  return data.matchIds ?? [];
}


export async function loadMatches() {
  try {
    const matchContainer = document.getElementById("match-history");
    if (!matchContainer) return;

    matchContainer.innerHTML = "";

    let matchIds = await fetchPlayerMatches(currentUserId);

    const noMatchesText = t(currentLang, "no_matches");
    const tournamentText = t(currentLang, "tournament2");

    if (!matchIds.length) {
      matchContainer.innerHTML = `<p class="text-gray-400">${noMatchesText}</p>`;
      return;
    }

    // ✅ On garde seulement les 3 derniers
    matchIds = matchIds.slice(-3);

    for (const matchId of matchIds) {
      const match = await fetchMatch(matchId);

      const p1 = await fetchUser(match.p1);
      const p2 = await fetchUser(match.p2);

      const p1Class = match.winner === match.p1 ? "text-green-400" : "text-red-400";
      const p2Class = match.winner === match.p2 ? "text-green-400" : "text-red-400";

      const matchDiv = document.createElement("div");
      matchDiv.id = `match-${match.matchId}`;
      matchDiv.className = "flex flex-col items-center gap-1 p-2 border-b border-gray-700";

      if (match.spaceInvaders === 0 && match.isTournament === 0) {
        // -------------------------------
        // Pong
        // -------------------------------
        matchDiv.innerHTML = `
          <div class="text-yellow-500">Pong Match iD: ${match.matchId}</div>
          <div class="flex items-center gap-2">
            <span class="font-semibold ${p1Class}">${p1.pseudo}</span>
            <span class="mx-2">${match.p1Score} - ${match.p2Score}</span>
            <span class="font-semibold ${p2Class}">${p2.pseudo}</span>
          </div>
        `;
      } else if (match.isTournament > 0) {
       
        let tournamentName = "N/A";
        if (Number.isFinite(match.isTournament) && match.isTournament > 0) {
          const tournament = await fetchTournament(match.isTournament);
          tournamentName = tournament.tournamentName;
        }

        matchDiv.innerHTML = `
          <div class="flex items-center justify-center gap-2 text-yellow-500">
            <span>${tournamentText}</span>
            <span class="font-medium text-[#fff9c4]">${tournamentName}</span>
          </div>
          <div class="text-yellow-500">Pong Match iD: ${match.matchId}</div>
          <div class="flex items-center gap-2">
            <span class="font-semibold ${p1Class}">${p1.pseudo}</span>
            <span class="mx-2">${match.p1Score} - ${match.p2Score}</span>
            <span class="font-semibold ${p2Class}">${p2.pseudo}</span>
          </div>
        `;
      } else if(match.spaceInvaders === 1){
        matchDiv.innerHTML = `
          <div class="text-yellow-500">Space invaders Match iD: ${match.matchId}</div>
          <div class="flex items-center gap-2">
            <span class="font-semibold ${p1Class}">${p1.pseudo}</span>
            <span class="mx-2">${match.p1Score} - ${match.p2Score}</span>
            <span class="font-semibold ${p2Class}">${p2.pseudo}</span>
          </div>
        `;
      }

      // Ligne de séparation
      const hr = document.createElement("hr");
      hr.className = "border-t border-yellow-500 w-24 mx-auto my-2";
      matchDiv.appendChild(hr);

      matchContainer.appendChild(matchDiv);
    }
  } catch (err) {
    console.error("Erreur lors du chargement des matchs:", err);
  }
}




export function initProfilPage() {
  // Récupère le conteneur principal
  const main = document.getElementById('main-content');
  if (!main) {
    console.error("main-content introuvable");
    return;
  }
  // === Déclarations d'éléments ===
  
  // Boutons et modales liés au profil, 2FA, avatar, mot de passe
  const modifyProfileBtn = main.querySelector('#modifyProfileBtn') as HTMLButtonElement | null;

  const twofaModal = main.querySelector('#twofaModal') as HTMLDivElement | null;
  const qrImage = main.querySelector('#qrImage') as HTMLImageElement | null;
  const cancel2FA = main.querySelector('#cancel-2fa-btn') as HTMLButtonElement | null;
  const close2FAModalBtn = main.querySelector('#close2faModal') as HTMLButtonElement | null;

  const editProfileModal = main.querySelector('#editProfileModal') as HTMLDivElement | null;
  const closeEditProfileModalBtn = main.querySelector('#closeEditProfileModal') as HTMLButtonElement | null;
  const cancelEditProfileBtn = main.querySelector('#cancelEditProfile') as HTMLButtonElement | null;
  const editProfileForm = main.querySelector('#editProfileForm') as HTMLFormElement | null;

  const chooseAvatarBtn = main.querySelector('#chooseAvatarBtn') as HTMLButtonElement | null;
  const saveAvatarBtn = main.querySelector('#saveAvatarBtn') as HTMLButtonElement | null;
  const avatarModal = main.querySelector('#avatarModal') as HTMLDivElement | null;
  const closeAvatarModal = main.querySelector('#closeAvatarModal') as HTMLButtonElement | null;

  const changePasswordBtn = main.querySelector('#changePasswordBtn') as HTMLButtonElement | null;
  const passwordModal = main.querySelector('#passwordModal') as HTMLDivElement | null;
  const cancelPasswordChange = main.querySelector('#cancelPasswordChange') as HTMLButtonElement | null;
  const passwordForm = main.querySelector('#passwordChangeForm') as HTMLFormElement | null;

  const toggle2FAButton = document.getElementById("generate-2fa-btn") as HTMLButtonElement | null;
  const qrContainer = document.getElementById("qr-container") as HTMLDivElement | null;
  const verify2FACode = document.getElementById("2fa-code") as HTMLInputElement | null;
  const confirm2FA = document.getElementById("confirm-2fa-btn") as HTMLButtonElement | null;
  const display2FACode = document.getElementById("display-2fa-code") as HTMLDivElement | null;
  const submitEditProfileBtn = document.getElementById("submitEditProfileBtn") as HTMLButtonElement | null;
  
  const addFriendModal = document.getElementById('addFriendModal');
  const addFriendBtn = document.getElementById('addFriendBtn');

  const userList = document.getElementById('userList');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const friendRequestsList = document.getElementById('friendRequestsList');
  const friendRequestsModal = document.getElementById('friendRequestsModal');
  const closeFriendRequestsBtn = document.getElementById('closeFriendRequestsBtn');
  const seeFriendRequestsBtn = document.getElementById('seeFriendRequestsBtn');

  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  loadUserProfile(); 
  let is2FAEnabled = false;

  /**
   * Vérifie si l'utilisateur a déjà activé la 2FA
   */

  if (currentUser && toggle2FAButton) {
    fetch(`/api/check-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          is2FAEnabled = data.twoFactorEnabled;

          if (toggle2FAButton) {
            const newKey = is2FAEnabled ? "deactivate_2FA" : "activate_2FA";
            toggle2FAButton.setAttribute("data-i18n", newKey);

            const lang = localStorage.getItem('lang') as Language || 'fr';
            applyTranslations(lang);
          }
        } else {
          console.error(t(currentLang, 'error_check_2fa'), data.message);
        }
      })
      .catch(err => {
        console.error("Erreur réseau check 2FA:", err);
      });
  }

  /**
   * Ouvre la modale 2FA
   */

  const open2FAModal = () => {
    if (twofaModal) twofaModal.classList.remove('hidden');
  };

  /**
   * Ferme la modale 2FA et réinitialise l’état
   */

  const close2FAModal = () => {
    if (twofaModal) twofaModal.classList.add('hidden');
    if (toggle2FAButton) toggle2FAButton.disabled = false;
    sessionStorage.removeItem("2fa-secret");
  };

  /**
     * Gère le clic sur le bouton 2FA (activation ou désactivation)
     */

  toggle2FAButton?.addEventListener('click', () => {
    if (!is2FAEnabled) {
      if (!currentUser) return console.error("Nom d'utilisateur non défini.");

      fetch(`/twofa/generate?username=${encodeURIComponent(currentUser)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.qr && qrImage) {
            qrImage.src = data.qr;
            open2FAModal();
            toggle2FAButton.textContent = "2FA en attente...";
            toggle2FAButton.disabled = true;
            sessionStorage.setItem("2fa-secret", data.secret);
          } else {
            console.error("QR code non reçu ou données manquantes :", data);
          }
        })
        .catch(error => {
          console.error("Erreur lors de la génération du QR code :", error);
        });
    } else {
      if (!currentUser) return console.error("Nom d'utilisateur non défini.");

      fetch(`/api/disable-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            is2FAEnabled = false;
            toggle2FAButton.textContent = t(currentLang, 'enable_2fa');
            toggle2FAButton.disabled = false;
            console.log("2FA désactivée avec succès");
          } else {
            console.error("Échec de la désactivation de la 2FA :", data.message);
            alert(t(currentLang, '2fa_disable_error'));
          }
        })
        .catch(err => {
          console.error("Erreur réseau :", err);
          alert(t(currentLang, 'network_error_2fa'));
        });
    }
  });

  /**
   * Vérifie le code 2FA saisi par l’utilisateur
   */
  confirm2FA?.addEventListener("click", () => {
    const code = verify2FACode?.value ?? '';
    const secret = sessionStorage.getItem("2fa-secret");
    if (!secret) {
      alert(t(currentLang, 'secret_missing'));
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      alert(t(currentLang, 'invalid_code_format'));
      return;
    }

    fetch(`/twofa/verify`, {
      method: "POST",
      body: JSON.stringify({ username: currentUser, token: code }),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          is2FAEnabled = true;
          toggle2FAButton!.textContent = t(currentLang, 'disable_2fa');
          toggle2FAButton!.disabled = false;
          close2FAModal();

          // Notifier le user_service
          fetch(`/api/enable-2fa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser }),
          })
            .then(res => {
              if (!res.ok) throw new Error(t(currentLang, 'user_service_error'));
              console.log("2FA activée côté user_service.");
            })
            .catch(err => {
              console.error("Erreur lors de l'activation 2FA côté user_service :", err);
            });
        } else {
          alert(t(currentLang, 'wrong_code'));
        }
      });
  });

  // === Gestion des modales 2FA ===
  cancel2FA?.addEventListener("click", () => {
    close2FAModal();
  });

  close2FAModalBtn?.addEventListener("click", () => {
    close2FAModal();
  });

  // === Gestion des avatars ===

  saveAvatarBtn?.addEventListener('click', saveSelectedAvatar);

  chooseAvatarBtn?.addEventListener('click', () => {
  openAvatarLibrary();
  });

  closeAvatarModal?.addEventListener('click', () => {
    if (avatarModal) avatarModal.classList.add('hidden');
  });

  avatarModal?.addEventListener('click', (e) => {
    if (e.target === avatarModal) avatarModal.classList.add('hidden');
  });

  /**
   * Gère le changement de mot de passe
   */
  changePasswordBtn?.addEventListener('click', () => {
    editProfileModal?.classList.add('hidden'); // fermer modal profil
    passwordModal?.classList.remove('hidden'); // ouvrir modal mot de passe
  });

  cancelPasswordChange?.addEventListener('click', () => {
    passwordModal?.classList.add('hidden');
  });

  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPassword = (main.querySelector('#oldPassword') as HTMLInputElement).value;
    const newPassword = (main.querySelector('#newPassword') as HTMLInputElement).value;

    try {
      const res = await fetch(`/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
       if (!res.ok) throw new Error(data.message || t(currentLang, 'password_change_error'));

      alert(t(currentLang, 'password_change_success'));
      passwordModal?.classList.add('hidden');
    } catch (err: any) {
      alert('❌ ' + (err.message || t(currentLang, 'password_change_error')));
    }
  });

  // === Gestion du formulaire de modification du profil ===
  modifyProfileBtn?.addEventListener("click", () => {
    if (editProfileModal) editProfileModal.classList.remove("hidden");
  });

  closeEditProfileModalBtn?.addEventListener("click", () => {
    if (editProfileModal) editProfileModal.classList.add("hidden");
  });

  cancelEditProfileBtn?.addEventListener("click", () => {
    if (editProfileModal) editProfileModal.classList.add("hidden");
  });

 /**
  * Envoie les modifications de profil (pseudo/email)
  */
  submitEditProfileBtn?.addEventListener("click", () =>{
    console.log("🚀 Le formulaire est soumis");
    const usernameInput = main.querySelector('#edit-username') as HTMLInputElement | null;
    const emailInput = main.querySelector('#edit-email') as HTMLInputElement | null;

    if (!usernameInput || !emailInput) return;

    const updateData: { pseudo?: string; email?: string } = {};

    if (usernameInput.value.trim() !== '') {
      updateData.pseudo = usernameInput.value.trim();
    }
    if (emailInput.value.trim() !== '') {
      updateData.email = emailInput.value.trim();
    }

    fetch(`/api/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updateData),
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || t(currentLang, 'profile_update_error')); });
        return res.json();
      })
      .then(data => {
        alert(t(currentLang, 'profile_update_success'));
        if (editProfileModal) editProfileModal.classList.add('hidden');
        loadUserProfile();
      })
      .catch(err => {
        alert(t(currentLang, 'profile_update_error') + ' - ' + err.message);
      });
  });

  /**
   * Charge les infos du profil depuis l’API
   */

  async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(t(currentLang, 'profile_load_error'));

    const user = await res.json();
    userState.pseudoUser = user.pseudo;
    localStorage.setItem("pseudoUser", user.pseudo ?? "");
    userState.avatarBaseUrl = apiUrlAvatar;
    userState.userId = user.id;

    updateUserMenu();
    updateProfileUI(user);
    displayUserInfo(user);

    if (user.id) {
      currentUserId = user.id;
      
      // 🟢 Mise à jour immédiate du statut
      updateUserStatus(user.id);

      // ⏳ Mise à jour régulière toutes les 30s
      setInterval(() => updateUserStatus(user.id), 30000);

      await loadAllFriends();
      await loadMatches();
    }
  } catch (err) {
    console.error(err);
  }
}


    /**
     * Status du client
     */
    async function updateUserStatus(userId: number) {
      try {
        // Envoie heartbeat
        await fetch(`/api/user/${userId}/heartbeat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        // Récupère statut
        const res = await fetch(`/api/user/${userId}/status`);
        const data = await res.json();

        const dot = document.getElementById('status-dot');
        const isOnline = !!data.is_online;

        if (dot) {
      // Supprime anciennes couleurs et effets
      dot.classList.remove('bg-green-500', 'bg-red-500', 'bg-gray-500');
      dot.style.boxShadow = '';

      if (isOnline) {
        dot.classList.add('bg-green-500');
        dot.style.boxShadow = '0 0 8px #22c55e, 0 0 12px #22c55e, 0 0 24px #22c55e';
      } else {
        dot.classList.add('bg-red-500');
        dot.style.boxShadow = '0 0 6px #f87171, 0 0 12px #f87171, 0 0 24px #f87171';
      }
    }
      } catch (err) {
        console.error('Erreur statut utilisateur:', err);
      }
    }


    /**
     * Met à jour l'affichage des données utilisateur sur la page profil
     */

    function updateProfileUI(user: { id: number; pseudo: string; username: string; avatarUrl?: string }) {
    const usernameElem = document.getElementById('profileUsername');
    const avatarElem = document.getElementById('profile-avatar') as HTMLImageElement;
    const idElem = document.getElementById('profile-id');

    if (usernameElem) {
      usernameElem.textContent = `${user.pseudo}`;
    }

    if (avatarElem) {
      avatarElem.src = user.avatarUrl && user.avatarUrl.trim() !== ''
        ? apiUrlAvatar + user.avatarUrl
        : '/src/empty.png';
    }

    if (idElem) {
      idElem.textContent = `${user.id}`;
    }
    }

    function displayUserInfo(user: { pseudo: string; email: string }) {
      const pseudoElem = document.getElementById('currentPseudo');
      const emailElem = document.getElementById('currentEmail');
      if (pseudoElem) pseudoElem.textContent = `${user.pseudo}`;
      if(emailElem) emailElem.textContent = `${user.email}`;
    }

    /**
     * Ouvre la modale d’avatars et affiche les avatars disponibles
     */

    async function openAvatarLibrary() {
        const avatarModal = document.getElementById('avatarModal') as HTMLDivElement | null;
        const avatarList = document.getElementById('avatarList') as HTMLDivElement | null;
        if (!avatarModal || !avatarList) return;

        avatarModal.classList.remove('hidden');
        avatarList.innerHTML = '';

        try {
            
            const res = await fetch(`/avatar/api/avatars`);
            if (!res.ok) throw new Error(t(currentLang, 'avatar_load_error'));

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

    /**
     * Sélectionne un avatar temporairement (affichage dans la prévisualisation)
     */

    function selectAvatar(avatarUrl: string) {
        selectedAvatarTemp = avatarUrl;
        // Met à jour l'affichage local dans la pop-up (facultatif)
        const preview = document.getElementById('avatarPreview') as HTMLImageElement | null;
        if (preview) {
            preview.src = apiUrlAvatar + avatarUrl;
        }
    }


      /**
     * Sauvegarde l’avatar sélectionné en base
     */
     async function saveSelectedAvatar() {
        if (!selectedAvatarTemp) return;

        try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token manquant, utilisateur non authentifié');
            return;
        }

        const res = await fetch(`/api/api/profile/avatar`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({ avatar_url: selectedAvatarTemp }),
        });

        if (!res.ok) throw new Error(t(currentLang, 'avatar_save_error'));


        const data = await res.json();
        console.log('Avatar sauvegardé avec succès:', data);

        // Met à jour l'avatar dans le profil (page principale)
        const profileAvatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;
        if (profileAvatarImg && data.avatarUrl) {
            profileAvatarImg.src = apiUrlAvatar + data.avatarUrl;
            localStorage.setItem("avatarplayer", `${data.avatarUrl}`);
            userState.avatarplayer = `${data.avatarUrl}`;          
        }

        // Ferme la modale avatar
        const avatarModal = document.getElementById('avatarModal') as HTMLDivElement | null;
        if (avatarModal) avatarModal.classList.add('hidden');

        // Reset sélection temporaire
        selectedAvatarTemp = null;

        } catch (error) {
        console.error(error);
        alert(t(currentLang, 'avatar_save_error'));
        }
    }
      /**
       * Gère le téléversement personnalisé d’un avatar
       */

      document.getElementById('uploadAvatarBtn')?.addEventListener('click', async () => {
      const input = document.getElementById('avatarUpload') as HTMLInputElement;
      if (!input.files || input.files.length === 0) {
        alert(t(currentLang, 'choose_image'));
        return;
      }

      const file = input.files[0];

      // ✅ Vérification de la taille max : 2 Mo
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSize) {
        alert(t(currentLang, 'file_too_large'));
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);


      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert(t(currentLang, 'must_be_logged_in'));
          return;
        }

        const response = await fetch(`/avatar/api/profile/avatar/upload`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
          },
          body: formData,
        });

        if (!response.ok) throw new Error(t(currentLang, 'upload_failed'));

        const data = await response.json();

        // ✅ Met à jour l’aperçu et la sélection active
        const preview = document.getElementById('avatarPreview') as HTMLImageElement;
        if (data.avatar_url && preview) {
            selectedAvatarTemp = data.avatar_url;
            preview.src = apiUrlAvatar + data.avatar_url;
          }


        alert(t(currentLang, 'upload_success'));

      } catch (error) {
        console.error('Erreur lors du téléversement :', error);
        alert(t(currentLang, 'upload_error'));
      }
    });

    /**
     * Ferme la modale d’avatars
     */

    function closeModal() {
        const avatarModal = document.getElementById('avatarModal');
        if (!avatarModal) return;
        avatarModal.classList.add('hidden');
    }

    /**
     * Friends list
     */

    async function loadAllFriends() {
      try {
        const response = await fetch(`/api/friends/${currentUserId}`);
        if (!response.ok) throw new Error('Erreur API');
        const friends = await response.json();
        
        const friendListDiv = document.getElementById('friendList');
        friendListDiv.innerHTML = ''; // vide la liste avant

        friends.forEach(friend => {
          const avatarSrc = friend.avatar_url && friend.avatar_url.trim() !== ''
            ? userState.avatarBaseUrl + friend.avatar_url
            : '/src/empty.png';

          const card = document.createElement('div');
          card.className = 'friend-card bg-gray-800 p-4 rounded shadow text-white flex flex-col items-center w-40 border border-cyan-500 hover:border-cyan-300';

          card.innerHTML = `
            <!-- Pseudo + point -->
            <div class="flex items-center mb-2">
              <h4 class="font-semibold mr-4">${friend.username}</h4>
              <div id="status-friend-${friend.id}" class="w-10 h-2 rounded-r-full bg-red-500 relative" 
                  style="box-shadow: 0 0 4px #f87171, 0 0 12px #f87171, 0 0 18px #f87171;">
                <span class="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-2 bg-gray-300 "></span>
              </div>
            </div>
            

            <!-- Avatar -->
            <img src="${avatarSrc}" alt="${friend.username}"
                class="w-14 h-14 rounded-full object-cover border border-cyan-500" />
          `;

          friendListDiv.appendChild(card);

          // ✅ Mise à jour immédiate du statut
          updateFriendStatus(friend.id);
        });
      } catch (err) {
        console.error('Erreur chargement amis:', err);
      }
    }

    async function updateFriendStatus(friendId) {
      try {
        const res = await fetch(`/api/user/${friendId}/status`);
        if (!res.ok) throw new Error('Erreur statut ami');

        const data = await res.json();
        const isOnline = !!data.is_online;

        const dot = document.getElementById(`status-friend-${friendId}`);
        if (dot) {
          // Retirer les classes bg
          dot.classList.remove('bg-green-500', 'bg-red-500');
          
          // Appliquer la couleur
          dot.classList.add(isOnline ? 'bg-green-500' : 'bg-red-500');

          // Mettre le neon
          dot.style.boxShadow = isOnline
            ? '0 0 6px #4ade80, 0 0 12px #4ade80, 0 0 18px #4ade80' // neon vert
            : '0 0 6px #f87171, 0 0 12px #f87171, 0 0 18px #f87171'; // neon rouge
        }
      } catch (err) {
        console.error(`Erreur statut ami ${friendId}:`, err);
      }
    }

    // Ouvrir la modale demandes reçues
    async function loadAllUsers() {
      if (!userList) return;

      // Récupérer tous les utilisateurs
      const res = await fetch(`/api/friends/all-users`);
      const users = await res.json();

      // Récupérer les amis actuels
      const friendsRes = await fetch(`/api/friends/${currentUserId}`);
      const friends = await friendsRes.json(); // tableau d'objets { id, username... }

      userList.innerHTML = '';

      users
        .filter(user => user.id !== currentUserId)
        .forEach(user => {
          const isFriend = friends.some(f => f.id === user.id);
          const div = document.createElement('div');
          div.className = 'p-2 text-white rounded flex justify-between items-center border-2 border-cyan-500 shadow-[0_0_8px_3px_rgba(0,255,255,0.5)]';

          // bouton en fonction du statut
          if (isFriend) {
            div.innerHTML = `
              <span>${user.username}</span>
              <button class="bg-red-600 text-white px-2 py-1 rounded text-sm">${t(currentLang, 'delete')}</button>
            `;
            const button = div.querySelector('button');
            button.addEventListener('click', async () => {
              const res = await fetch(`/api/friends/remove/${user.id}?userId=${currentUserId}`, {
                method: 'DELETE',
              });

              if (res.ok) {
                // ✅ Changer le bouton en "Ajouter"
                button.textContent = t(currentLang, 'add');
                button.className = 'bg-cyan-600 text-white px-2 py-1 rounded text-sm';

                // Nouveau comportement du bouton
                button.onclick = async () => {
                  await sendFriendRequest(currentUserId, user.id);
                  button.textContent = t(currentLang, 'sent');
                  button.disabled = true;
                };
              } else {
                console.error('Erreur lors de la suppression');
              }
            });
          } else {
            div.innerHTML = `
              <span>${user.username}</span>
              <button class="bg-cyan-600 text-white px-2 py-1 rounded text-sm">${t(currentLang, 'add')}</button>
            `;
            const button = div.querySelector('button');
            button.addEventListener('click', async () => {
              await sendFriendRequest(currentUserId, user.id);
              button.textContent = t(currentLang, 'sent');
              button.disabled = true;
            });
          }

          userList.appendChild(div);
        });
    }

    async function sendFriendRequest(from: number, to: number) {
          const res = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to }),
          });
          if (!res.ok) {
            console.error('Erreur envoi de la demande');
          }
        }

        if (seeFriendRequestsBtn && friendRequestsModal) {
          seeFriendRequestsBtn.addEventListener('click', async () => {
            friendRequestsModal.classList.remove('hidden');
            await loadFriendRequests();
          });
        }

        if (closeFriendRequestsBtn && friendRequestsModal) {
          closeFriendRequestsBtn.addEventListener('click', () => {
            friendRequestsModal.classList.add('hidden');
            loadUserProfile();
          });
        }

        if (addFriendBtn && addFriendModal) {
          addFriendBtn.addEventListener('click', () => {
            addFriendModal.classList.remove('hidden');
            loadAllUsers();
          });
        }

        if (closeModalBtn && addFriendModal) {
          closeModalBtn.addEventListener('click', () => {
            addFriendModal.classList.add('hidden');
            loadUserProfile();
          });
        }

        async function loadFriendRequests() {
          if (!friendRequestsList) return;
          const res = await fetch(`/api/friends/requests/${currentUserId}`);
          const requests = await res.json();

          friendRequestsList.innerHTML = '';
          requests.forEach(request => {
            const div = document.createElement('div');
            div.className = 'flex flex-col p-2 text-white rounded mb-2 bg-white/10 border-2 border-cyan-500 shadow-[0_0_8px_3px_rgba(0,255,255,0.6)]';
            div.innerHTML = `
              <span>${request.username}</span>
              <div>
                <button class="accept-btn bg-cyan-500 text-white px-2 py-1 rounded mr-2">${t(currentLang, 'accept')}</button>
                <button class="reject-btn bg-red-500 text-white px-2 py-1 rounded">${t(currentLang, 'deny')}</button>
              </div>
            `;

            const acceptBtn = div.querySelector('.accept-btn');
            const rejectBtn = div.querySelector('.reject-btn');

            acceptBtn?.addEventListener('click', async () => {
              await respondToFriendRequest(request.id, 'accepted');
              div.remove();
            });
            rejectBtn?.addEventListener('click', async () => {
              await respondToFriendRequest(request.id, 'rejected');
              div.remove();
            });

            friendRequestsList.appendChild(div);
        });
    }

    async function respondToFriendRequest(requestId: number, status: 'accepted' | 'rejected') {
      await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }

}