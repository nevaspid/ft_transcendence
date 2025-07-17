const apiUrl: string = "http://localhost:3000";
const apiUrlAvatar: string = "http://localhost:3001";
const twofaApiUrl : string = "http://localhost:4001";

import { currentUser, userState, updateUserMenu } from "./script";

let selectedAvatarTemp: string | null = null;

/**
 * Initialise la page de profil : gestion des modales, avatars, formulaire de profil, mot de passe, 2FA...
 */

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
  
  loadUserProfile(); // Charge les données de profil de l'utilisateur au chargement de la page

  let is2FAEnabled = false;

  /**
   * Vérifie si l'utilisateur a déjà activé la 2FA
   */

  if (currentUser && toggle2FAButton) {
    fetch(`${apiUrl}/check-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          is2FAEnabled = data.twoFactorEnabled;
          toggle2FAButton.textContent = is2FAEnabled ? "Désactiver la 2FA" : "Activer la 2FA";
        } else {
          console.error("Erreur check 2FA:", data.message);
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

      fetch(`${twofaApiUrl}/twofa/generate?username=${encodeURIComponent(currentUser)}`)
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

      fetch(`${apiUrl}/disable-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            is2FAEnabled = false;
            toggle2FAButton.textContent = "Activer la 2FA";
            toggle2FAButton.disabled = false;
            console.log("2FA désactivée avec succès");
          } else {
            console.error("Échec de la désactivation de la 2FA :", data.message);
            alert("Erreur lors de la désactivation de la 2FA.");
          }
        })
        .catch(err => {
          console.error("Erreur réseau :", err);
          alert("Impossible de désactiver la 2FA.");
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
      alert("Erreur : secret introuvable. Veuillez régénérer le QR code.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      alert("Code invalide (6 chiffres requis)");
      return;
    }

    fetch(`${twofaApiUrl}/twofa/verify`, {
      method: "POST",
      body: JSON.stringify({ username: currentUser, token: code }),
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          is2FAEnabled = true;
          toggle2FAButton!.textContent = "Désactiver la 2FA";
          toggle2FAButton!.disabled = false;
          close2FAModal();

          // Notifier le user_service
          fetch(`${apiUrl}/enable-2fa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser }),
          })
            .then(res => {
              if (!res.ok) throw new Error("Erreur côté user_service");
              console.log("2FA activée côté user_service.");
            })
            .catch(err => {
              console.error("Erreur lors de l'activation 2FA côté user_service :", err);
            });
        } else {
          alert("Code incorrect.");
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
    passwordModal?.classList.remove('hidden');
  });

  cancelPasswordChange?.addEventListener('click', () => {
    passwordModal?.classList.add('hidden');
  });

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

    fetch(`${apiUrl}/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updateData),
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Erreur lors de la mise à jour du profil'); });
        return res.json();
      })
      .then(data => {
        alert('✅ Profil mis à jour avec succès !');
        if (editProfileModal) editProfileModal.classList.add('hidden');
        loadUserProfile();
      })
      .catch(err => {
        alert('❌ ' + err.message);
      });
  });

  /**
   * Charge les infos du profil depuis l’API
   */

  async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${apiUrl}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur lors du chargement du profil');
    const user = await res.json();
    userState.pseudoUser = user.pseudo;
    updateUserMenu();

    updateProfileUI(user);
  } catch (err) {
    console.error(err);
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
    usernameElem.textContent = `${user.pseudo} (${user.username})`;
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

  /**
   * Ouvre la modale d’avatars et affiche les avatars disponibles
   */

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

      // Met à jour l'avatar dans le profil (page principale)
      const profileAvatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;
      if (profileAvatarImg && data.avatarUrl) {
          profileAvatarImg.src = apiUrlAvatar + data.avatarUrl;
      }

      // Ferme la modale avatar
      const avatarModal = document.getElementById('avatarModal') as HTMLDivElement | null;
      if (avatarModal) avatarModal.classList.add('hidden');

      // Reset sélection temporaire
      selectedAvatarTemp = null;

      } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde de l\'avatar.');
      }
  }


  /**
   * Gère le téléversement personnalisé d’un avatar
   */

  document.getElementById('uploadAvatarBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('avatarUpload') as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    alert('Veuillez choisir une image.');
    return;
  }

  const file = input.files[0];

  // ✅ Vérification de la taille max : 2 Mo
  const maxSize = 2 * 1024 * 1024; // 2 MB
  if (file.size > maxSize) {
    alert("Le fichier est trop volumineux (max 2 Mo).");
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);


  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté.');
      return;
    }

    const response = await fetch(`${apiUrlAvatar}/api/profile/avatar/upload`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Échec du téléversement');

    const data = await response.json();

    // ✅ Met à jour l’aperçu et la sélection active
    const preview = document.getElementById('avatarPreview') as HTMLImageElement;
    if (data.avatar_url && preview) {
        selectedAvatarTemp = data.avatar_url;
        preview.src = apiUrlAvatar + data.avatar_url;
      }


    alert('Avatar téléversé avec succès !');

  } catch (error) {
    console.error('Erreur lors du téléversement :', error);
    alert('Erreur lors du téléversement de l\'avatar.');
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
}
