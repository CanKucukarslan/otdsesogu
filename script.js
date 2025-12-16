document.addEventListener('DOMContentLoaded', () => {
    console.log("Oyun ve Tasarım Kulübü - System Initialized (Firebase Compat)");

    // Custom Toast Notification Function
    function showToast(message, type = 'success') {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }

        // Set content and type
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : '❌'}</span>
            <span>${message}</span>
        `;

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Form Handling - Contact
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot Check
            const honeyInput = contactForm.querySelector('input[name="website_hp"]');
            if (honeyInput && honeyInput.value) {
                console.warn("Bot detected. Submission rejected.");
                return; // Silent fail
            }

            const inputs = contactForm.querySelectorAll('input:not(.visually-hidden), textarea');
            const messageData = {
                name: inputs[0].value,
                email: inputs[1].value,
                message: inputs[2].value,
                date: new Date().toISOString()
            };

            db.collection("messages").add(messageData)
                .then(() => {
                    showToast('Mesajınız başarıyla gönderildi!');
                    contactForm.reset();
                })
                .catch((error) => {
                    console.error("Error adding message: ", error);
                    showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
                });
        });
    }

    // Join Form Handling
    const joinForm = document.getElementById('join-form');
    if (joinForm) {
        // Restrict Phone Input to Numbers Only
        const phoneInput = document.getElementById('join-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        joinForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot Check
            const honeyInput = joinForm.querySelector('input[name="website_hp"]');
            if (honeyInput && honeyInput.value) {
                console.warn("Bot detected. Submission rejected.");
                return; // Silent fail
            }

            const application = {
                name: document.getElementById('join-name').value,
                phone: document.getElementById('join-phone').value,
                dept: document.getElementById('join-dept').value,
                interest: document.getElementById('join-interest').value,
                date: new Date().toLocaleDateString('tr-TR'),
                submittedAt: new Date().toISOString()
            };

            db.collection("applications").add(application)
                .then(() => {
                    showToast('Başvurunuz başarıyla alındı!');
                    joinForm.reset();
                })
                .catch((error) => {
                    console.error("Error adding application: ", error);
                    showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
                });
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dynamic Content Loading (Real-time)
    try {
        if (typeof db !== 'undefined') {
            loadDynamicContent();
        } else {
            console.warn("Firebase 'db' is not defined. Checking window.db...");
            if (window.db) {
                loadDynamicContent();
            } else {
                console.error("Firebase Initialization Failed: 'db' not found. Check firebase-config.js.");
                showToast("Veritabanı bağlantısı kurulamadı.", "error");
            }
        }
    } catch (e) {
        console.error("Error starting app:", e);
    }

    function loadDynamicContent() {
        const database = window.db || db;
        // Render Events
        const eventList = document.querySelector('.event-list');
        if (eventList) {
            // events koleksiyonunu dinle
            database.collection("events").onSnapshot((querySnapshot) => {
                const events = [];
                querySnapshot.forEach((doc) => {
                    events.push({ id: doc.id, ...doc.data() });
                });

                if (events.length === 0) {
                    eventList.innerHTML = '<p style="text-align:center; width:100%;">Henüz etkinlik yok.</p>';
                } else {
                    eventList.innerHTML = events.map(event => `
                        <div class="event-item">
                            <div class="event-date">
                                <span>${event.day}</span>
                                <span>${event.month}</span>
                            </div>
                            <div class="event-info">
                                <h3>${event.title}</h3>
                                <span>${event.desc}</span>
                            </div>
                            <a href="event-details.html?id=${event.id}" class="btn btn-small">Detaylar</a>
                        </div>
                    `).join('');
                }
            }, (error) => {
                console.error("Error getting events:", error);
                // showToast("Etkinlikler yüklenemedi.", "error"); // Reduce noise
            });
        }

        // Render Event Details (New Page)
        const eventDetailsContainer = document.getElementById('event-details-container');
        if (eventDetailsContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');

            if (eventId) {
                database.collection("events").doc(eventId).get().then((doc) => {
                    if (doc.exists) {
                        const event = doc.data();
                        eventDetailsContainer.innerHTML = `
                            <div class="event-detail-card" style="background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                                    <div class="event-date" style="margin: 0;">
                                        <span>${event.day}</span>
                                        <span>${event.month}</span>
                                    </div>
                                    <h1 style="font-size: 2.5rem; color: var(--color-primary);">${event.title}</h1>
                                </div>
                                <p style="font-size: 1.2rem; line-height: 1.8; color: #ddd; margin-bottom: 2rem;">
                                    ${event.desc}
                                </p>
                                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <h3 style="margin-bottom: 1rem;">Detaylı Bilgi</h3>
                                    <p>Bu etkinlik hakkında daha fazla bilgi almak veya kayıt olmak için bizimle iletişime geçebilirsiniz.</p>
                                    <br>
                                    <a href="index.html#contact" class="btn btn-primary">İletişime Geç</a>
                                </div>
                            </div>
                        `;
                    } else {
                        eventDetailsContainer.innerHTML = '<p style="text-align: center; color: white;">Etkinlik bulunamadı.</p>';
                    }
                }).catch((error) => {
                    console.error("Error getting event details:", error);
                    eventDetailsContainer.innerHTML = '<p style="text-align: center; color: white;">Bir hata oluştu.</p>';
                });
            } else {
                eventDetailsContainer.innerHTML = '<p style="text-align: center; color: white;">Geçersiz bağlantı.</p>';
            }
        }

        // Render Gallery
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            database.collection("gallery").onSnapshot((querySnapshot) => {
                const gallery = [];
                querySnapshot.forEach((doc) => {
                    gallery.push({ id: doc.id, ...doc.data() });
                });

                if (gallery.length === 0) {
                    galleryGrid.innerHTML = '<p style="text-align:center; width:100%;">Henüz proje yok.</p>';
                } else {
                    galleryGrid.innerHTML = gallery.map(item => {
                        if (item.imageUrl) {
                            return `
                                <div class="gallery-item" onclick="viewImage('${item.imageUrl}', '${item.title}')">
                                    <img src="${item.imageUrl}" alt="${item.title}" class="gallery-image">
                                    <div class="gallery-overlay">
                                        <span>${item.title}</span>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="gallery-item">
                                    <div class="gallery-placeholder">${item.title}</div>
                                </div>
                            `;
                        }
                    }).join('');
                }
            }, (error) => {
                console.error("Error getting gallery:", error);
            });
        }
    }

    // Scroll Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('waiting-for-scroll');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in-section');
        section.classList.add('waiting-for-scroll');
        observer.observe(section);

        // Safety: If stuck mostly visible but not triggering, force visible
        setTimeout(() => {
            if (!section.classList.contains('visible') && window.scrollY < 100) {
                section.classList.add('visible');
                section.classList.remove('waiting-for-scroll');
            }
        }, 1000);
    });
});
