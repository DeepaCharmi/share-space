/* ==========================================================================
   JavaScript Logic - Share Space
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackCard = document.getElementById('feedbackCard');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    
    const starBtns = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('rating');
    const starRatingContainer = document.getElementById('starRatingContainer');
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const commentInput = document.getElementById('comment');
    
    const successState = document.getElementById('successState');
    const demoNotice = document.getElementById('demoNotice');
    const resetBtn = document.getElementById('resetBtn');

    // API configuration
    const API_URL = 'http://127.0.0.1:5001/submit';

    /* ==========================================================================
       1. Interactive Star Rating System
       ========================================================================== */
    
    // Highlight stars on hover
    starBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const currentVal = parseInt(btn.dataset.value);
            highlightStars(currentVal, 'hover-active');
        });
    });

    // Remove hover highlight when mouse leaves the container
    starRatingContainer.addEventListener('mouseleave', () => {
        starBtns.forEach(btn => btn.classList.remove('hover-active'));
    });

    // Select rating on click
    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentVal = parseInt(btn.dataset.value);
            ratingInput.value = currentVal;
            
            // Set active aria check status
            starBtns.forEach(b => {
                b.setAttribute('aria-checked', parseInt(b.dataset.value) === currentVal ? 'true' : 'false');
            });

            highlightStars(currentVal, 'selected');
            
            // Remove validation error if active
            const ratingGroup = ratingInput.closest('.rating-group');
            ratingGroup.classList.remove('invalid');
            document.getElementById('ratingError').style.display = 'none';
        });
    });

    // Helper to highlight star array up to selected/hovered element
    function highlightStars(value, className) {
        starBtns.forEach(btn => {
            const btnVal = parseInt(btn.dataset.value);
            if (btnVal <= value) {
                btn.classList.add(className);
            } else {
                btn.classList.remove(className);
            }
        });
    }

    /* ==========================================================================
       2. Real-time Form Validation & Error Clearing
       ========================================================================== */
    const inputs = [nameInput, emailInput, commentInput];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.input-group');
            group.classList.remove('invalid');
            
            const errorElement = document.getElementById(`${input.id}Error`);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    });

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email.toLowerCase());
    }

    function showFieldError(input, errorId) {
        const group = input.closest('.input-group');
        group.classList.add('invalid');
        document.getElementById(errorId).style.display = 'block';
    }

    function validateForm() {
        let isValid = true;

        // Name Validation
        if (!nameInput.value.trim()) {
            showFieldError(nameInput, 'nameError');
            isValid = false;
        }

        // Email Validation
        if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
            showFieldError(emailInput, 'emailError');
            isValid = false;
        }

        // Rating Validation
        if (!ratingInput.value) {
            const ratingGroup = ratingInput.closest('.rating-group');
            ratingGroup.classList.add('invalid');
            document.getElementById('ratingError').style.display = 'block';
            isValid = false;
        }

        // Comment Validation
        if (!commentInput.value.trim()) {
            showFieldError(commentInput, 'commentError');
            isValid = false;
        }

        return isValid;
    }

    /* ==========================================================================
       3. Elegant Submit Handler using Fetch API
       ========================================================================== */
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validate form fields
        if (!validateForm()) {
            showToast('Please fix the highlighted fields.');
            return;
        }

        // 2. Set UI loading state
        setLoadingState(true);

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            rating: parseInt(ratingInput.value),
            comment: commentInput.value.trim()
        };

        try {
            // 3. Post to the backend Flask application
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // 4. Handle success response
                setTimeout(() => {
                    transitionToSuccess(result.status === 'demo_success');
                }, 600); // Small timeout for aesthetic loading flow
            } else {
                // 5. Handle response errors from backend validation
                showToast(result.message || 'Transmission failed. Please try again.');
                setLoadingState(false);
            }
        } catch (error) {
            // 6. Handle network or offline connection issues
            console.error('Fetch error:', error);
            showToast('Unable to connect to Server. Ensure the Flask backend is active on http://127.0.0.1:5001');
            setLoadingState(false);
        }
    });

    /* ==========================================================================
       4. State Transition & Reset Helpers
       ========================================================================== */
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    }

    function transitionToSuccess(isDemoMode) {
        // Hide loading state
        setLoadingState(false);
        
        // Add fade-out to form
        feedbackForm.style.opacity = '0';
        feedbackForm.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            feedbackForm.classList.add('hidden');
            successState.classList.remove('hidden');
            
            if (isDemoMode) {
                demoNotice.classList.remove('hidden');
            } else {
                demoNotice.classList.add('hidden');
            }
        }, 300);
    }

    // Reset Form to send another feedback
    resetBtn.addEventListener('click', () => {
        // Fade out success state
        successState.style.opacity = '0';
        successState.style.transform = 'scale(0.96)';

        setTimeout(() => {
            // Reset fields
            feedbackForm.reset();
            ratingInput.value = '';
            
            // Clear star highlights
            starBtns.forEach(btn => {
                btn.classList.remove('selected', 'hover-active');
                btn.setAttribute('aria-checked', 'false');
            });
            
            // Toggle visibility
            successState.classList.add('hidden');
            successState.style.opacity = '';
            successState.style.transform = '';
            
            feedbackForm.classList.remove('hidden');
            feedbackForm.style.opacity = '1';
            feedbackForm.style.transform = 'translateY(0)';
        }, 300);
    });

    /* ==========================================================================
       5. Toast Notification System
       ========================================================================== */
    function showToast(message) {
        // Remove existing toast if present
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span>⚠️</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        // Remove toast automatically after 4.5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.4s reverse ease-out forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4500);
    }
});
