/** ---------------------------------------------------------
 * CONFIGURATION
 * --------------------------------------------------------- */
const defaultConfig = {
    full_name: "Yogendra Kavuluri",
    job_title: "Python Full Stack Trainee",
    email: "yogendrakavuluri@gmail.com",
    phone: "6302886712",
    github_username: "YOGENDRAKAVULURI"
};

/** ---------------------------------------------------------
 * THEME SWITCHING
 * --------------------------------------------------------- */
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const body = document.body;

const storedTheme = localStorage.getItem("theme") || "light";
body.setAttribute("data-theme", storedTheme);
themeIcon.textContent = storedTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
    const current = body.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeIcon.textContent = next === "dark" ? "☀️" : "🌙";
});

/** ---------------------------------------------------------
 * SMOOTH SCROLLING
 * --------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

/** ---------------------------------------------------------
 * INTERSECTION OBSERVER (Animations)
 * --------------------------------------------------------- */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    },
    { threshold: 0.1 }
);

document
    .querySelectorAll(
        ".fade-in, .slide-in-left, .slide-in-right, .bounce-in, .rotate-in, .zoom-in"
    )
    .forEach((el) => observer.observe(el));

/** ---------------------------------------------------------
 * NAVBAR & MOBILE NAV
 * --------------------------------------------------------- */
function initializeNavbar() {
    const navbar = document.getElementById("navbar");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileNav = document.getElementById("mobile-nav");
    const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });

    mobileMenu.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
        mobileNav.classList.toggle("active");
        document.body.style.overflow = mobileNav.classList.contains("active")
            ? "hidden"
            : "";
    });

    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
            mobileNav.classList.remove("active");
            document.body.style.overflow = "";
        });
    });

    // highlight current section
    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        document.querySelectorAll("section[id]").forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((l) => l.classList.remove("active"));
                document
                    .querySelectorAll(`a[href="#${section.id}"]`)
                    .forEach((l) => l.classList.add("active"));
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink);
    updateActiveLink();
}

/** ---------------------------------------------------------
 * GITHUB PROJECT FETCHER
 * --------------------------------------------------------- */
async function fetchGitHubProjects() {
    const username =
        window.elementSdk?.config?.github_username ||
        defaultConfig.github_username;
    const container = document.getElementById("projects-container");

    container.innerHTML = `<div class="project-card"><div class="project-title">Loading...</div></div>`;

    try {
        const res = await fetch(
            `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
        );
        const repos = await res.json();
        if (!Array.isArray(repos)) throw new Error();

        const top = repos
            .sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            )
            .slice(0, 6);

        container.innerHTML = top
            .map(
                (repo) => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">${repo.name}</div>
                    <div class="project-language">${
                        repo.language || "N/A"
                    }</div>
                </div>
                <div class="project-body">
                    <div class="project-description">${
                        repo.description || "No description."
                    }</div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank">View Code</a>
                        ${
                            repo.homepage
                                ? `<a href="${repo.homepage}" target="_blank">Live Demo</a>`
                                : ""
                        }
                    </div>
                    <div class="project-date">Updated: ${new Date(
                        repo.updated_at
                    ).toLocaleDateString()}</div>
                </div>
            </div>
        `
            )
            .join("");
    } catch (err) {
        container.innerHTML = `<p>Error loading projects.</p>`;
    }
}

/** ---------------------------------------------------------
 * REAL WEATHER API (OpenWeather)
 * --------------------------------------------------------- */
const WEATHER_KEY = "e0ce78c24045a9e1c75effa5f2b1d580";

async function getWeather() {
    const cityInput = document.getElementById("info") || document.getElementById("city-input");
    const city = cityInput ? cityInput.value.trim() : '';
    const result = document.getElementById("weather-result") || document.getElementById("display");

    if (!city) {
        result.innerHTML = `<p>Please enter a city name.</p>`;
        return;
    }

    result.innerHTML = `<div class="loading"></div> Fetching weather...`;

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_KEY}&units=metric`
        );
        const data = await res.json();

        if (data.cod !== 200) throw new Error(data.message);

        result.innerHTML = `
            <div class="weather-card">
                <h3>${data.name}</h3>
                <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                <div class="weather-desc">${data.weather[0].description}</div>

                <div class="weather-grid">
                    <div>Humidity: ${data.main.humidity}%</div>
                    <div>Wind: ${data.wind.speed} m/s</div>
                </div>
            </div>
        `;
    } catch (err) {
        result.innerHTML = `<p>Unable to fetch weather.</p>`;
    }
}

// Attach weather button handler (graceful if elements present)
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'getBtn') {
        getWeather();
    }
});

/** ---------------------------------------------------------
 * JOKE GENERATOR
 * --------------------------------------------------------- */
async function getJoke() {
    const result = document.getElementById("joke-result");
    result.innerHTML = `<div class="loading"></div> Fetching joke...`;

    try {
        const res = await fetch(
            "https://official-joke-api.appspot.com/random_joke"
        );
        const joke = await res.json();

        result.innerHTML = `
            <p>${joke.setup}</p>
            <strong>${joke.punchline}</strong>
        `;
    } catch {
        result.innerHTML = `<p>Could not fetch joke.</p>`;
    }
}

/** ---------------------------------------------------------
 * CONTACT FORM WITH EMAILJS (FIXED)
 * --------------------------------------------------------- */

// Ensure EmailJS is initialized (the HTML already loads/inits it, so guard to avoid double-init)
if (window.emailjs && !window.emailjs.__initialized) {
    try {
        emailjs.init("HSHDnM58KKGrxosqW");
        window.emailjs.__initialized = true;
    } catch (e) {
        console.warn('EmailJS init skipped or failed:', e);
    }
}

function handleContactForm() {
    const form = document.getElementById("contact-form");
    const btn = document.getElementById("submit-btn");
    const text = document.getElementById("btn-text");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("sender-name").value.trim();
        const email = document.getElementById("sender-email").value.trim();
        const subject = document.getElementById("message-subject").value.trim();
        const message = document.getElementById("message-content").value.trim();

        text.innerHTML = `<div class="loading" aria-hidden="true"></div> Sending...`;
        btn.disabled = true;

        const params = {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            sent_at: new Date().toLocaleString()
        };

        // Send via EmailJS (ensure service/template IDs are correct for your account)
        emailjs
            .send("service_toxy47z", "template_o41d9zc", params)
            .then((res) => {
                console.log("EmailJS SUCCESS:", res);
                showSuccessPopup('Message sent successfully!');
                form.reset();
            })
            .catch((err) => {
                console.error("EmailJS ERROR:", err);
                showSuccessPopup('Message failed to send.');
            })
            .finally(() => {
                btn.disabled = false;
                text.textContent = "Send Message";
            });
    });
}


/** POPUP */
function showSuccessPopup(msg = 'Message sent successfully!') {
    const modal = document.getElementById('form-modal');
    const modalMessage = document.getElementById('modal-message');
    if (modalMessage) modalMessage.textContent = msg;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('visible');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        // auto-close after 3s
        setTimeout(() => closePopup(), 3000);
    }
}
function closePopup() {
    const modal = document.getElementById('form-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('visible');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

/** ---------------------------------------------------------
 * PARALLAX EFFECT (Improved)
 * --------------------------------------------------------- */
function initParallax() {
    const hero = document.querySelector(".hero");
    const layer = document.querySelectorAll(".parallax-layer");

    if (!hero || !layer || layer.length === 0) return;

    window.addEventListener(
        "scroll",
        () => {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const move = rect.top * -0.15;
            layer.forEach((l, i) => {
                const depth = 1 + i * 0.08;
                l.style.transform = `translateY(${move * depth}px) scale(${1 + i * 0.03})`;
            });
        },
        { passive: true }
    );
}

/** ---------------------------------------------------------
 * INIT
 * --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    initializeNavbar();
    fetchGitHubProjects();
    handleContactForm();
    initParallax();
});

// Location detection feature removed — static Vijayawada location is displayed in the contact section.
