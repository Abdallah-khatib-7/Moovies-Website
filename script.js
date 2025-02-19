const apiKey = 'ae8b9648'; // Your OMDB API key

// DOM Elements
const authPage = document.getElementById('auth-page');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const signupUsername = document.getElementById('signup-username');
const signupPassword = document.getElementById('signup-password');
const loginSubmit = document.getElementById('login-submit');
const signupSubmit = document.getElementById('signup-submit');

const mainContent = document.getElementById('main-content');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const paginationDiv = document.getElementById('pagination');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const favoritesLink = document.getElementById('favorites-link');
const favoritesPage = document.getElementById('favorites-page');
const backToMain = document.getElementById('back-to-main');
const favoritesList = document.getElementById('favorites-list');
const homeLink = document.getElementById('home-link');

const movieDetailsPage = document.getElementById('movie-details-page');
const backToMainFromDetails = document.getElementById('back-to-main-from-details');
const movieDetailsTitle = document.getElementById('movie-details-title');
const movieDetailsPoster = document.getElementById('movie-details-poster');
const movieDetailsYear = document.getElementById('movie-details-year');
const movieDetailsPlot = document.getElementById('movie-details-plot');
const stars = document.querySelectorAll('.star');
const ratingFeedback = document.getElementById('rating-feedback');

let currentPage = 1;
let totalPages = 1;
let currentSearchQuery = '';
let currentMovieId = '';

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    authPage.style.display = 'none';
    mainContent.style.display = 'block';
    showRandomMovies(); // Show random movies on load
  } else {
    authPage.style.display = 'flex';
    mainContent.style.display = 'none';
  }
}

// Switch between Login and Signup forms
switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
});

switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// Login functionality
loginSubmit.addEventListener('click', () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  const user = localStorage.getItem('user');

  if (!user) {
    alert('No user found. Please sign up first.');
    return;
  }

  const storedUser = JSON.parse(user);
  if (storedUser.username === username && storedUser.password === password) {
    localStorage.setItem('isLoggedIn', 'true');
    alert('Login successful! Redirecting...');
    checkAuth();
  } else {
    alert('Invalid username or password.');
  }
});

// Signup functionality
signupSubmit.addEventListener('click', () => {
  const username = signupUsername.value.trim();
  const password = signupPassword.value.trim();

  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const user = { username, password };
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');

  alert('Sign up successful! You are now logged in.');
  checkAuth();
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn');
  alert('Logged out successfully!');
  checkAuth();
});

// Fetch movies from OMDB API
async function fetchMovies(query, page = 1) {
  const url = `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === 'True') {
      displayMovies(data.Search);
      totalPages = Math.ceil(data.totalResults / 10);
      paginationDiv.classList.remove('hidden');
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    } else {
      resultsDiv.innerHTML = `<p>No movies found. Try another search!</p>`;
      paginationDiv.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
    resultsDiv.innerHTML = `<p>An error occurred. Please try again.</p>`;
  }
}

// Search for movies
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    alert('Please enter a movie name to search.');
    return;
  }
  currentSearchQuery = query;
  currentPage = 1;
  fetchMovies(query, currentPage);
});

// Display movies in the results section
function displayMovies(movies) {
  resultsDiv.innerHTML = movies
    .map(
      (movie) => `
      <div class="movie-card" data-id="${movie.imdbID}">
        <img src="${movie.Poster}" alt="${movie.Title}">
        <div class="movie-info">
          <h3>${movie.Title}</h3>
          <p>Year: ${movie.Year}</p>
          <button class="show-details-btn">Show Details</button>
          <button class="favorite-btn">Add to Favorites</button>
        </div>
      </div>
    `
    )
    .join('');

  // Add event listeners to "Show Details" buttons
  document.querySelectorAll('.show-details-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const movieCard = btn.closest('.movie-card');
      currentMovieId = movieCard.dataset.id;
      showMovieDetails(currentMovieId);
    });
  });

  // Add event listeners to "Add to Favorites" buttons
  document.querySelectorAll('.favorite-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const movieCard = btn.closest('.movie-card');
      const movie = {
        imdbID: movieCard.dataset.id,
        Title: movieCard.querySelector('h3').innerText,
        Year: movieCard.querySelector('p').innerText.replace('Year: ', ''),
        Poster: movieCard.querySelector('img').src,
      };
      addToFavorites(movie);
    });
  });
}

// Add a movie to favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some((fav) => fav.imdbID === movie.imdbID)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Added to favorites!');
    displayFavorites(); // Update favorites list immediately
  } else {
    alert('Already in favorites!');
  }
}

// Show random movies on the home page
async function showRandomMovies() {
  const randomQueries = ['action', 'comedy', 'drama', 'horror', 'sci-fi'];
  const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  fetchMovies(randomQuery);
}

// Show movie details
async function showMovieDetails(movieId) {
  const url = `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === 'True') {
      movieDetailsTitle.textContent = data.Title;
      movieDetailsPoster.src = data.Poster;
      movieDetailsYear.textContent = `Year: ${data.Year}`;
      movieDetailsPlot.textContent = `Plot: ${data.Plot}`;
      mainContent.classList.add('hidden');
      movieDetailsPage.classList.remove('hidden');
    } else {
      alert('Movie details not found.');
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    alert('An error occurred. Please try again.');
  }
}

// Go back to the main page from movie details
backToMainFromDetails.addEventListener('click', () => {
  movieDetailsPage.classList.add('hidden');
  mainContent.classList.remove('hidden');
});

// Handle star ratings
stars.forEach((star) => {
  star.addEventListener('click', () => {
    const value = star.getAttribute('data-value');
    ratingFeedback.textContent = `You rated this movie ${value} star(s).`;
    localStorage.setItem(`rating-${currentMovieId}`, value);
  });
});

// Show favorites page
favoritesLink.addEventListener('click', () => {
  mainContent.classList.add('hidden');
  favoritesPage.classList.remove('hidden');
  displayFavorites();
});

// Display favorites list
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p>No favorite movies yet.</p>';
    return;
  }
  favoritesList.innerHTML = favorites
    .map(
      (movie) => `
      <div class="movie-card" data-id="${movie.imdbID}">
        <img src="${movie.Poster}" alt="${movie.Title}">
        <div class="movie-info">
          <h3>${movie.Title}</h3>
          <p>Year: ${movie.Year}</p>
          <button class="remove-favorite-btn">Remove from Favorites</button>
        </div>
      </div>
    `
    )
    .join('');

  // Add event listeners to "Remove from Favorites" buttons
  document.querySelectorAll('.remove-favorite-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const movieCard = e.target.closest('.movie-card');
      removeFromFavorites(movieCard.dataset.id);
      displayFavorites(); // Update favorites list immediately
    });
  });
}

// Remove a movie from favorites
function removeFromFavorites(movieId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter((movie) => movie.imdbID !== movieId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Go back to the main page from favorites
backToMain.addEventListener('click', () => {
  favoritesPage.classList.add('hidden');
  mainContent.classList.remove('hidden');
});

// Go back to the main page from home link
homeLink.addEventListener('click', () => {
  favoritesPage.classList.add('hidden');
  movieDetailsPage.classList.add('hidden');
  mainContent.classList.remove('hidden');
  showRandomMovies(); // Show random movies on home page
});

// Pagination: Next and Previous buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(currentSearchQuery, currentPage);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchMovies(currentSearchQuery, currentPage);
  }
});

// Initialize the app
checkAuth();