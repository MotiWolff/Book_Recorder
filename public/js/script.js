// Bootstrap form validation
(function() {
    'use strict';
    window.addEventListener('load', function() {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Enhanced book cover loading
function handleImageError(img) {
    const placeholder = document.createElement('div');
    placeholder.className = 'no-cover-placeholder';
    placeholder.innerHTML = '<i class="bi bi-book display-4 text-muted"></i>';
    
    img.parentNode.replaceChild(placeholder, img);
}

// Add loading animation to images
document.addEventListener('DOMContentLoaded', function() {
    const bookCovers = document.querySelectorAll('.book-cover');
    
    bookCovers.forEach(cover => {
        const img = cover.querySelector('img');
        if (img) {
            img.setAttribute('data-loading', 'true');
            
            img.addEventListener('load', function() {
                this.removeAttribute('data-loading');
            });
            
            img.addEventListener('error', function() {
                handleImageError(this);
            });
        }
    });
});

// Search functionality (for future enhancement)
function initializeSearch() {
    const searchInput = document.getElementById('bookSearch');
    const bookCards = document.querySelectorAll('.book-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            bookCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const author = card.querySelector('.card-subtitle').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || author.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.3s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Auto-resize textareas
function autoResizeTextarea() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    autoResizeTextarea();
    
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// ISBN lookup functionality (enhanced feature)
async function lookupBookByISBN(isbn) {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const data = await response.json();
        
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            const book = data[bookKey];
            return {
                title: book.title,
                authors: book.authors ? book.authors.map(author => author.name).join(', ') : '',
                cover: book.cover ? book.cover.medium : null
            };
        }
        return null;
    } catch (error) {
        console.error('Error looking up book:', error);
        return null;
    }
}

// Auto-fill form when ISBN is entered
document.addEventListener('DOMContentLoaded', function() {
    const isbnInput = document.getElementById('isbn');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    
    if (isbnInput && titleInput && authorInput) {
        let timeoutId;
        
        isbnInput.addEventListener('input', function(e) {
            clearTimeout(timeoutId);
            const isbn = e.target.value.trim();
            
            if (isbn.length >= 10) {
                timeoutId = setTimeout(async () => {
                    const bookData = await lookupBookByISBN(isbn);
                    
                    if (bookData && !titleInput.value && !authorInput.value) {
                        titleInput.value = bookData.title;
                        authorInput.value = bookData.authors;
                        
                        // Show success message
                        showToast('Book information found!', 'success');
                    }
                }, 1000);
            }
        });
    }
});

// Toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '11';
    document.body.appendChild(container);
    return container;
}