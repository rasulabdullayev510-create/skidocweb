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
    if (mode === "mobile") {
      el.innerHTML = `<span class="service-from">from</span> $${base + 10}`;
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

