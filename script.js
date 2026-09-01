// Anonymous page-view ping for the admin dashboard's traffic stats.
// No cookies, no PII — just a page identifier and a timestamp.
(function () {
  var path = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  var page = path === "" ? "home"
    : path.indexOf("services") !== -1 ? "services"
    : path.indexOf("mobile") !== -1 ? "mobile"
    : "other";
  try {
    fetch("https://skidoc-booking-eblt.onrender.com/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: page }),
      keepalive: true,
    }).catch(function () {});
  } catch (e) {}
})();

// Live site content from the admin CMS — hero text, contact info, socials,
// and the mobile on/off switch. Falls back to whatever's already in the
// HTML if the fetch fails, so the site is never blocked on this.
(function () {
  var path = location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  var isHome = path === "";
  var isMobilePage = path.indexOf("mobile") !== -1;

  function applyMobileDisabled() {
    document.querySelectorAll('a[href="mobile.html"]').forEach(function (el) { el.style.display = "none"; });
    var banner = document.querySelector(".mobile-banner-wrap");
    if (banner) banner.style.display = "none";
    var toggleBtn = document.querySelector('.toggle-btn[data-mode="mobile"]');
    if (toggleBtn) toggleBtn.style.display = "none";
    if (isMobilePage) {
      var hero = document.querySelector(".hero");
      if (hero) {
        hero.innerHTML = '<div class="hero-content">' +
          '<p class="eyebrow">Mobile Service</p>' +
          '<h1>Currently Unavailable</h1>' +
          '<p class="hero-subtitle">Mobile service isn\'t available right now — check back soon, or visit us in-shop.</p>' +
          '<div class="hero-actions"><a class="btn primary" href="services.html">View In-Shop Services</a></div>' +
          '</div>';
      }
    }
  }

  function applyCmsContent(cfg) {
    if (!cfg) return;

    var phoneEl = document.querySelector(".footer-contact div:nth-child(1) span");
    if (phoneEl && cfg.phone) phoneEl.textContent = cfg.phone;
    var emailLink = document.querySelector(".footer-contact div:nth-child(2) span a");
    if (emailLink && cfg.email) { emailLink.textContent = cfg.email; emailLink.href = "mailto:" + cfg.email; }

    if (cfg.socials) {
      var ig = document.querySelector('.footer-socials a[aria-label="Instagram"]');
      var fb = document.querySelector('.footer-socials a[aria-label="Facebook"]');
      var gg = document.querySelector('.footer-socials a[aria-label="Google"]');
      if (ig && cfg.socials.instagram) ig.href = cfg.socials.instagram;
      if (fb && cfg.socials.facebook) fb.href = cfg.socials.facebook;
      if (gg && cfg.socials.google) gg.href = cfg.socials.google;
    }

    if (isHome && cfg.hero) {
      var h1 = document.querySelector(".hero-content h1");
      var sub = document.querySelector(".hero-content .hero-subtitle");
      if (h1 && cfg.hero.headline) h1.textContent = cfg.hero.headline;
      if (sub && cfg.hero.subtitle) sub.textContent = cfg.hero.subtitle;
    }
    if (isMobilePage && cfg.mobilePage && cfg.mobileEnabled !== false) {
      var mh1 = document.querySelector(".hero-content h1");
      var msub = document.querySelector(".hero-content .hero-subtitle");
      if (mh1 && cfg.mobilePage.headline) mh1.textContent = cfg.mobilePage.headline;
      if (msub && cfg.mobilePage.description) msub.textContent = cfg.mobilePage.description;
    }

    var kidsBanner = document.querySelector(".kids-discount-banner");
    if (kidsBanner && cfg.kidsDiscountText) kidsBanner.textContent = cfg.kidsDiscountText;

    if (cfg.mobileEnabled === false) applyMobileDisabled();
  }

  try {
    fetch("https://skidoc-booking-eblt.onrender.com/api/site-config")
      .then(function (r) { return r.json(); })
      .then(applyCmsContent)
      .catch(function () {});
  } catch (e) {}
})();

const toggleButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (toggleButton && navLinks) {
  toggleButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const toggleBtns = document.querySelectorAll(".toggle-btn");
const servicePriceEls = document.querySelectorAll(".service-price[data-price]");

function applyServiceMode(mode) {
  servicePriceEls.forEach((el) => {
    const base = Number(el.dataset.price);
    const hasFrom = el.dataset.from === "true";
    const was = el.dataset.was ? Number(el.dataset.was) : null;
    if (mode === "mobile") {
      el.innerHTML = `<span class="service-from">from</span> $${base + 10}`;
    } else if (was) {
      el.innerHTML = `<span class="service-was">$${was}</span> $${base}`;
    } else {
      el.innerHTML = hasFrom ? `<span class="service-from">from</span> $${base}` : `$${base}`;
    }
  });
  toggleBtns.forEach((btn) => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });
}

if (toggleBtns.length && servicePriceEls.length) {
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => applyServiceMode(btn.dataset.mode));
  });
  const params = new URLSearchParams(window.location.search);
  applyServiceMode(params.get("view") === "mobile" ? "mobile" : "inshop");
}

document.querySelectorAll(".service-row-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const row = toggle.closest(".service-row");
    const isOpen = row.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
});

const reviewsGrid = document.querySelector("#reviews-grid");
const reviewsRating = document.querySelector("#reviews-rating");
const reviewsCount = document.querySelector("#reviews-count");

const reviewsConfig = {
  placeId: "",
  apiKey: "",
  reviewsEndpoint: "",
  maxReviews: 8,
  manualReviews: {
    summary: {
      rating: 5.0,
      total: 20,
    },
    reviews: [
      {
        author_name: "Ammar Abdurashidov",
        rating: 5,
        relative_time_description: "7 months ago",
        text: "Rasul does an awesome job. He’s fast, honest, and my skis felt brand new after his tune. Highly recommend.",
      },
      {
        author_name: "Richard Hunter",
        rating: 5,
        relative_time_description: "6 months ago",
        text: "I set up a drop-off time and pick-up time at my convenience — 2 day turn-around. No parking issues, no waiting in line. Skis look great!",
      },
      {
        author_name: "William Chen",
        rating: 5,
        relative_time_description: "6 months ago",
        text: "Very professional and excellent service. Brought in a pair of skis last minute as other businesses had very long turnaround times and the service was done quickly and with precision.",
      },
      {
        author_name: "Elnur",
        rating: 5,
        relative_time_description: "6 months ago",
        text: "Got the full ski tuneup and my skis look brand new, will definitely be coming back!",
      },
      {
        author_name: "Likith Punuganti",
        rating: 5,
        relative_time_description: "6 months ago",
        text: "Dropped off my snowboard for waxing and sharpening, looked amazing and felt great on the slopes!",
      },
      {
        author_name: "Emre Can Mert",
        rating: 5,
        relative_time_description: "3 months ago",
        text: "Amazing service and nice guy, my snowboard felt brand new! I highly recommend.",
      },
      {
        author_name: "Namaz",
        rating: 5,
        relative_time_description: "5 months ago",
        text: "Skis looked and felt amazing after getting the full ski tuneup. Definitely recommend if you need edges or waxing done!",
      },
      {
        author_name: "Brianna de Haas",
        rating: 5,
        relative_time_description: "7 months ago",
        text: "So glad I found this place. My skis look great! Big shoutout to Rasul.",
      },
    ],
  },
};

const createStars = (rating) => {
  const full = Math.round(rating);
  return "★".repeat(full).padEnd(5, "☆");
};

const getInitials = (name) => {
  if (!name) return "★";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const renderReviews = (reviews = [], summary) => {
  if (!reviewsGrid) return;
  reviewsGrid.innerHTML = "";

  if (summary) {
    if (reviewsRating) {
      reviewsRating.textContent = `${summary.rating.toFixed(1)}★`;
    }
    if (reviewsCount) {
      reviewsCount.textContent = `${summary.total} Google reviews`;
    }
  }

  if (!reviews.length) {
    reviewsGrid.innerHTML = `
      <div class="card review-loading">
        <p>No reviews available yet. Check back soon.</p>
      </div>
    `;
    return;
  }

  reviews.slice(0, reviewsConfig.maxReviews).forEach((review) => {
    const card = document.createElement("article");
    card.className = "card review-card";
    card.innerHTML = `
      <div class="review-meta">
        <div class="review-avatar">${getInitials(review.author_name)}</div>
        <div>
          <div class="review-name">${review.author_name || "Google Reviewer"}</div>
          <div class="review-date">${review.relative_time_description || ""}</div>
        </div>
      </div>
      <div class="review-stars" aria-label="${review.rating} out of 5 stars">
        ${createStars(review.rating || 5)}
      </div>
      <p class="review-text">${review.text || ""}</p>
    `;
    reviewsGrid.appendChild(card);
  });
};

const loadReviewsFromEndpoint = async () => {
  if (!reviewsConfig.reviewsEndpoint) return null;
  const response = await fetch(reviewsConfig.reviewsEndpoint);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
};

const loadReviewsFromGoogle = async () => {
  if (!reviewsConfig.placeId || !reviewsConfig.apiKey) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", reviewsConfig.placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,reviews");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", reviewsConfig.apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch Google reviews");
  return response.json();
};

const initReviews = async () => {
  if (!reviewsGrid) return;

  try {
    if (reviewsConfig.manualReviews?.reviews?.length) {
      renderReviews(reviewsConfig.manualReviews.reviews, reviewsConfig.manualReviews.summary);
      return;
    }
    const data = (await loadReviewsFromEndpoint()) || (await loadReviewsFromGoogle());
    if (!data || !data.result) throw new Error("No review data");

    renderReviews(data.result.reviews || [], {
      rating: data.result.rating || 0,
      total: data.result.user_ratings_total || 0,
    });
  } catch (error) {
    if (reviewsCount) {
      reviewsCount.textContent = "Add Google API details to show live reviews.";
    }
    renderReviews([], null);
  }
};

initReviews();

