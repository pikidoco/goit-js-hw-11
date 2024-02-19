import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const searchForm = document.getElementById("search-form");
const searchBtn = searchForm.querySelector(".button");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");

const API_KEY = "42435762-b1c684062f6a39471d7f00191";
const URL = `https://pixabay.com/api/?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true`;

const perPage = 40;
let currentPage = 1;
let searchQuery = "";

searchForm.addEventListener('submit', onSubmit);
let lightbox = new SimpleLightbox('.gallery a');
loadMoreBtn.addEventListener('click', onLoadMore);
loadMoreBtn.classList.add('is-hidden');

async function fetchImages(q, page, perPage) {
    const response = await axios.get(URL, {
        params: {
            key: API_KEY,
            q: searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
        },
    });
    return response.data;
}

async function onSubmit(event) {
    event.preventDefault();
    clearGallery();
    searchQuery = event.target.elements.searchQuery.value.trim();
    currentPage = 1;

    try {
        const data = await fetchImages(searchQuery, currentPage, perPage);
        const searchImages = data.hits;

        if (searchQuery.length === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        } else {
            Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
            createMarkup(searchImages);
            lightbox.refresh();
            if (data.totalHits > perPage) {
                loadMoreBtn.classList.remove('is-hidden');
            } else {
                loadMoreBtn.classList.add('is-hidden');
            }
        }
    } catch (error) {
        console.log(error);
        Notiflix.Notify.failure("Failed to fetch images. Please try again later.");
    }
}

async function onLoadMore() {
    currentPage += 1;

    try {
        const data = await fetchImages(searchQuery, currentPage, perPage);
        const searchImages = data.hits;

        if (searchImages.length > 0) {
            createMarkup(searchImages);
            lightbox.refresh();
            if (gallery.children.length >= data.totalHits) {
                loadMoreBtn.classList.add('is-hidden');
            }
            smoothScroll();
        }
    } catch (error) {
        console.log(error);
        Notiflix.Notify.failure("Failed to fetch more images. Please try again later.");
    }

    loadMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function smoothScroll() {
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}

function createMarkup(searchImages) {
    const markup = searchImages
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => `
            <div class="photo-card">
                <a href="${largeImageURL}">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </a>
                <div class="info">
                    <p class="info-item">
                        <b>Likes</b> ${likes}
                    </p>
                    <p class="info-item">
                        <b>Views</b> ${views}
                    </p>
                    <p class="info-item">
                        <b>Comments</b> ${comments}
                    </p>
                    <p class="info-item">
                        <b>Downloads</b> ${downloads}
                    </p>
                </div>
            </div>
        `
        )
        .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
}