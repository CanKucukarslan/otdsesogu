document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Auth State Observer
    auth.onAuthStateChanged((user) => {
        if (user) {
            showDashboard();
        } else {
            showLogin();
        }
    });

    // Login Handle
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const email = "admin@esoguotds.com";

        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                console.error("Login failed", error);
                alert('Giriş başarısız! ' + error.message);
            });
    });

    // Logout Handle
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            location.reload();
        });
    });

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';

        subscribeToEvents();
        subscribeToGallery();
        subscribeToApplications();
        subscribeToMessages();
    }

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    // --- Event Management ---
    const eventForm = document.getElementById('event-form');
    const eventList = document.getElementById('event-list');

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEvent = {
            title: document.getElementById('event-title').value,
            day: document.getElementById('event-day').value,
            month: document.getElementById('event-month').value,
            desc: document.getElementById('event-desc').value,
            createdAt: new Date().toISOString()
        };

        db.collection("events").add(newEvent)
            .then(() => {
                eventForm.reset();
            })
            .catch((error) => {
                alert("Hata: " + error.message);
            });
    });

    function subscribeToEvents() {
        db.collection("events").onSnapshot((snapshot) => {
            eventList.innerHTML = '';
            snapshot.forEach((docSnap) => {
                const event = docSnap.data();
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <span>${event.title} (${event.day} ${event.month})</span>
                    <button class="delete-btn" data-id="${docSnap.id}">Sil</button>
                `;
                // Add event listener to the button
                div.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(docSnap.id));
                eventList.appendChild(div);
            });
        });
    }

    function deleteEvent(id) {
        if (confirm("Silmek istediğinize emin misiniz?")) {
            db.collection("events").doc(id).delete();
        }
    }

    // --- Gallery Management ---
    const galleryForm = document.getElementById('gallery-form');
    const galleryList = document.getElementById('gallery-list');

    galleryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('gallery-title').value;
        const fileInput = document.getElementById('gallery-image');
        const file = fileInput.files[0];

        if (!file) {
            alert("Lütfen bir görsel seçin!");
            return;
        }

        if (file.size > 500 * 1024) { // 500KB
            alert("Dosya boyutu çok büyük! Lütfen 500KB'dan küçük bir görsel seçin.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64String = e.target.result;

            const newItem = {
                title: title,
                imageUrl: base64String,
                createdAt: new Date().toISOString()
            };

            db.collection("gallery").add(newItem)
                .then(() => {
                    galleryForm.reset();
                    alert("Görsel başarıyla eklendi!");
                })
                .catch((error) => {
                    alert("Hata: " + error.message);
                });
        };
        reader.onerror = function () {
            alert("Dosya okunurken hata oluştu.");
        };
        reader.readAsDataURL(file);
    });

    function subscribeToGallery() {
        db.collection("gallery").onSnapshot((snapshot) => {
            galleryList.innerHTML = '';
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <span>${item.title}</span>
                    <button class="delete-btn" data-id="${docSnap.id}">Sil</button>
                `;
                div.querySelector('.delete-btn').addEventListener('click', () => deleteGalleryItem(docSnap.id));
                galleryList.appendChild(div);
            });
        });
    }

    function deleteGalleryItem(id) {
        if (confirm("Silmek istediğinize emin misiniz?")) {
            db.collection("gallery").doc(id).delete();
        }
    }

    // --- Applications Management ---
    const applicationList = document.getElementById('application-list');

    function subscribeToApplications() {
        db.collection("applications").onSnapshot((snapshot) => {
            applicationList.innerHTML = '';
            if (snapshot.empty) {
                applicationList.innerHTML = '<p style="color: #a0a0a0;">Henüz başvuru yok.</p>';
                return;
            }
            snapshot.forEach((docSnap) => {
                const app = docSnap.data();
                const div = document.createElement('div');
                div.className = 'list-item';
                div.style.flexDirection = 'column';
                div.style.alignItems = 'flex-start';
                div.innerHTML = `
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; color: var(--color-primary);">${app.name}</span>
                        <button class="delete-btn" data-id="${docSnap.id}">Sil</button>
                    </div>
                    <div style="font-size: 0.9rem; color: #ccc;">
                        <p>Bölüm: ${app.dept}</p>
                        <p>Telefon: ${app.phone || 'Yok'}</p>
                        <p>İlgi Alanı: ${app.interest}</p>
                        <p>Tarih: ${app.date}</p>
                    </div>
                `;
                div.querySelector('.delete-btn').addEventListener('click', () => deleteApplication(docSnap.id));
                applicationList.appendChild(div);
            });
        });
    }

    function deleteApplication(id) {
        if (confirm('Bu başvuruyu silmek istediğinize emin misiniz?')) {
            db.collection("applications").doc(id).delete();
        }
    }

    // --- Messages Management ---
    const messageList = document.getElementById('message-list');

    function subscribeToMessages() {
        db.collection("messages").orderBy("date", "desc").onSnapshot((snapshot) => {
            messageList.innerHTML = '';
            if (snapshot.empty) {
                messageList.innerHTML = '<p style="color: #a0a0a0;">Henüz mesaj yok.</p>';
                return;
            }
            snapshot.forEach((docSnap) => {
                const msg = docSnap.data();
                let dateStr = "Tarih yok";
                if (msg.date) {
                    try {
                        dateStr = new Date(msg.date).toLocaleDateString('tr-TR') + ' ' + new Date(msg.date).toLocaleTimeString('tr-TR');
                    } catch (e) { }
                }

                const div = document.createElement('div');
                div.className = 'list-item';
                div.style.flexDirection = 'column';
                div.style.alignItems = 'flex-start';
                div.innerHTML = `
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; color: var(--color-primary);">${msg.name}</span>
                        <button class="delete-btn" data-id="${docSnap.id}">Sil</button>
                    </div>
                    <div style="font-size: 0.9rem; color: #ccc;">
                        <p><strong>Email:</strong> ${msg.email}</p>
                        <p style="margin-top:5px;">${msg.message}</p>
                        <small style="color: #666; margin-top:5px; display:block;">${dateStr}</small>
                    </div>
                `;
                div.querySelector('.delete-btn').addEventListener('click', () => deleteMessage(docSnap.id));
                messageList.appendChild(div);
            });
        });
    }

    function deleteMessage(id) {
        if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
            db.collection("messages").doc(id).delete();
        }
    }
});
