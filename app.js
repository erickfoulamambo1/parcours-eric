document.addEventListener("DOMContentLoaded", () => {
    chargerParcoursPublic();
    gererFormulaireAdmin();
    mettreAJourCompteur();
});

// --- GESTION DES DONNÉES ---
function sauvegarderParcours(parcoursList) {
    try {
        localStorage.setItem("monParcoursAcademique", JSON.stringify(parcoursList));
        return true;
    } catch (error) {
        console.error("Erreur de sauvegarde:", error);
        alert("❌ Erreur lors de la sauvegarde. Vérifiez l'espace de stockage.");
        return false;
    }
}

function recupererParcours() {
    try {
        return JSON.parse(localStorage.getItem("monParcoursAcademique")) || [];
    } catch (error) {
        console.error("Erreur de récupération:", error);
        return [];
    }
}

// --- ADMINISTRATION ---
function gererFormulaireAdmin() {
    const form = document.getElementById("parcoursForm");
    if (!form) return;

    const imageInput = document.getElementById("imageParcours");
    let imageBase64 = "";

    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Veuillez sélectionner une image valide.");
                imageInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("L'image est trop volumineuse (max 5MB).");
                imageInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => { 
                imageBase64 = reader.result;
                const preview = document.getElementById("imagePreview");
                const container = document.getElementById("previewContainer");
                if (preview && container) {
                    preview.src = reader.result;
                    container.style.display = 'block';
                }
            };
            reader.onerror = () => alert("Erreur lors de la lecture de l'image.");
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const niveau = document.getElementById("niveauParcours").value;
        const titre = document.getElementById("titreParcours").value.trim();
        const description = document.getElementById("descParcours").value.trim();

        if (!titre || !description || !niveau) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (!imageBase64) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        const nouveauParcours = {
            id: Date.now(),
            niveau: niveau,
            titre: titre,
            description: description,
            image: imageBase64,
            dateCreation: new Date().toLocaleDateString('fr-FR')
        };

        let parcoursList = recupererParcours();
        parcoursList.push(nouveauParcours);
        
        if (sauvegarderParcours(parcoursList)) {
            alert(`✅ "${titre}" ajouté avec succès !`);
            form.reset();
            imageBase64 = "";
            document.getElementById("previewContainer").style.display = 'none';
            chargerParcoursPublic();
            mettreAJourCompteur();
            
            document.getElementById('portfolio').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
}

// --- AFFICHAGE PUBLIC ---
function chargerParcoursPublic() {
    const conteneur = document.getElementById("listeParcours");
    if (!conteneur) return;

    const parcoursList = recupererParcours();

    if (parcoursList.length === 0) {
        conteneur.innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding: 80px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🌱</div>
                <h3 style="color: var(--text-dark); margin-bottom: 10px;">Aucun souvenir enregistré</h3>
                <p style="color: var(--text-gray);">Commencez à documenter votre parcours académique !</p>
                <a href="#admin-section" class="btn btn-primary" style="margin-top: 20px;">Ajouter mon premier souvenir</a>
            </div>
        `;
        return;
    }

    const ordreNiveaux = { "Licence 1 (L1)": 1, "Licence 2 (L2)": 2, "Licence 3 (L3)": 3 };
    parcoursList.sort((a, b) => (ordreNiveaux[a.niveau] || 0) - (ordreNiveaux[b.niveau] || 0));

    conteneur.innerHTML = "";

    parcoursList.forEach(parcours => {
        const carte = document.createElement("div");
        carte.classList.add("carte-parcours");
        
        carte.innerHTML = `
            <img src="${parcours.image}" alt="${parcours.titre}" class="carte-image" loading="lazy">
            <div class="carte-contenu">
                <span class="tag-niveau">${parcours.niveau}</span>
                <h3>${parcours.titre}</h3>
                <p>${parcours.description}</p>
                ${parcours.dateCreation ? `<small>📅 ${parcours.dateCreation}</small>` : ''}
                <button onclick="supprimerParcours(${parcours.id})" class="btn btn-danger" style="margin-top: 15px; padding: 8px 16px; font-size: 0.8rem; width: auto;">
                    🗑️ Supprimer
                </button>
            </div>
        `;
        conteneur.appendChild(carte);
    });
}

// --- SUPPRESSION ---
function supprimerParcours(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette étape ?")) return;
    
    let parcoursList = recupererParcours();
    parcoursList = parcoursList.filter(p => p.id !== id);
    
    if (sauvegarderParcours(parcoursList)) {
        alert("🗑️ Élément supprimé.");
        chargerParcoursPublic();
        mettreAJourCompteur();
    }
}

// --- COMPTEUR ---
function mettreAJourCompteur() {
    const parcours = recupererParcours();
    const compteur = document.getElementById('projectCount');
    if (compteur) {
        compteur.textContent = parcours.length;
    }
}