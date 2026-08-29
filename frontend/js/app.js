document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // TOAST NOTIFICATION SYSTEM
    // ==========================================
    function showToast(message, type = 'error') {
        const toast = document.getElementById('toast-alert');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');

        toastMessage.textContent = message;
        toast.classList.remove('error', 'success', 'info');

        if (type === 'error') {
            toastIcon.textContent = '⚠️';
            toast.classList.add('error');
        } else if (type === 'success') {
            toastIcon.textContent = '✅';
            toast.classList.add('success');
        } else {
            toastIcon.textContent = 'ℹ️';
            toast.classList.add('info');
        }

        toast.classList.add('show');
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => {
            closeToast();
        }, 3500);
    }

    function closeToast() {
        const toast = document.getElementById('toast-alert');
        toast.classList.remove('show');
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
            window.toastTimeout = null;
        }
    }

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = {
        quotes: document.getElementById('quotes-section'),
        post: document.getElementById('post-section')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(contents).forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.dataset.tab;
            contents[tabId].classList.add('active');
        });
    });

    // ==========================================
    // WEEK 1: GET QUOTES
    // ==========================================
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');
    const findBtn = document.getElementById('findQuotesBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const quoteGrid = document.getElementById('quoteGrid');

    findBtn.addEventListener('click', async function () {
        const pickup = pickupInput.value.trim();
        const dropoff = dropoffInput.value.trim();

        if (!pickup || !dropoff) {
            showToast('Please enter both pickup and dropoff locations.', 'error');
            return;
        }

        loadingDiv.style.display = 'block';
        resultsDiv.style.display = 'none';

        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pickup, dropoff })
            });

            const data = await response.json();

            if (data.error) {
                showToast('Error: ' + data.error, 'error');
                loadingDiv.style.display = 'none';
                return;
            }

            renderQuotes(data.quotes);
            loadingDiv.style.display = 'none';
            resultsDiv.style.display = 'block';

        } catch (error) {
            console.error('Error fetching quotes:', error);
            showToast('Something went wrong. Please try again.', 'error');
            loadingDiv.style.display = 'none';
        }
    });

    function renderQuotes(quotes) {
        quoteGrid.innerHTML = '';
        const colors = ['#0EA5E9', '#F97316', '#22C55E'];
        quotes.forEach((rider, index) => {
            const card = document.createElement('div');
            card.className = 'quote-card-item';
            card.style.borderLeftColor = colors[index % colors.length];
            card.innerHTML = `
                <div class="rider-name">${rider.rider_name}</div>
                <div class="vehicle">${rider.vehicle}</div>
                <div class="rating">⭐ ${rider.rating}</div>
                <div class="price">₦${rider.price.toLocaleString()} <span>flat fee</span></div>
                <div class="eta">⏱️ ${rider.estimated_time}</div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">📏 ${rider.distance}</div> <!-- NEW: Show distance -->
                <button class="btn-book" data-rider='${JSON.stringify(rider)}' style="margin-top: 12px; background: var(--accent-orange); color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; width: 100%;">
                    📱 Book Now
                </button>
            `;
            quoteGrid.appendChild(card);
        });

        document.querySelectorAll('.btn-book').forEach(btn => {
            btn.addEventListener('click', function () {
                const rider = JSON.parse(this.dataset.rider);
                handleBooking(rider);
            });
        });
    }

    // ==========================================
    // WEEK 2: BROADCAST JOB
    // ==========================================
    const postPickup = document.getElementById('postPickup');
    const postDropoff = document.getElementById('postDropoff');
    const postItem = document.getElementById('postItem');
    const broadcastBtn = document.getElementById('broadcastBtn');
    const broadcastLoading = document.getElementById('broadcastLoading');
    const broadcastResults = document.getElementById('broadcastResults');
    const broadcastGrid = document.getElementById('broadcastGrid');

    broadcastBtn.addEventListener('click', async function () {
        const pickup = postPickup.value.trim();
        const dropoff = postDropoff.value.trim();
        const item = postItem.value.trim() || 'Package';

        if (!pickup || !dropoff) {
            showToast('Please enter both pickup and dropoff locations.', 'error');
            return;
        }

        broadcastLoading.style.display = 'block';
        broadcastResults.style.display = 'none';

        try {
            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pickup, dropoff, item })
            });

            const data = await response.json();

            if (data.error) {
                showToast('Error: ' + data.error, 'error');
                broadcastLoading.style.display = 'none';
                return;
            }

            renderBroadcast(data.riders, data.job_id);
            broadcastLoading.style.display = 'none';
            broadcastResults.style.display = 'block';

        } catch (error) {
            console.error('Error broadcasting job:', error);
            showToast('Something went wrong. Please try again.', 'error');
            broadcastLoading.style.display = 'none';
        }
    });

    function renderBroadcast(riders, jobId) {
        broadcastGrid.innerHTML = '';
        riders.forEach(rider => {
            const card = document.createElement('div');
            card.className = 'quote-card-item';
            card.style.borderLeftColor = '#22C55E';
            card.innerHTML = `
                <div class="rider-name">${rider.name}</div>
                <div class="vehicle">${rider.vehicle}</div>
                <div class="rating">⭐ ${rider.rating}</div>
                <div style="margin-top: 8px; background: #DCFCE7; color: #166534; padding: 4px 12px; border-radius: 30px; font-weight: 600; font-size: 14px; display: inline-block;">
                    ✅ Accepted
                </div>
                <div class="eta" style="margin-top: 8px;">🛵 Heading to pickup now</div>
            `;
            broadcastGrid.appendChild(card);
        });

        const note = document.createElement('p');
        note.style.marginTop = '20px';
        note.style.color = '#64748B';
        note.style.fontSize = '14px';
        note.textContent = `📋 Job #${jobId} broadcasted successfully. ${riders.length} rider(s) assigned.`;
        broadcastGrid.appendChild(note);
    }

    // ==========================================
    // WEEK 3: BOOKING LOGIC (PROFESSIONAL MODAL)
    // ==========================================
    let currentBookingRider = null;

    async function handleBooking(rider) {
        const pickup = document.getElementById('pickup').value.trim();
        const dropoff = document.getElementById('dropoff').value.trim();

        if (!pickup || !dropoff) {
            showToast('Please enter pickup and dropoff locations first.', 'error');
            return;
        }

        currentBookingRider = {
            ...rider,
            pickup: pickup,
            dropoff: dropoff
        };

        document.getElementById('modalRiderName').textContent = rider.rider_name;
        document.getElementById('modalRiderVehicle').textContent = rider.vehicle;
        document.getElementById('modalRiderRating').textContent = '⭐ ' + rider.rating;
        document.getElementById('modalPrice').textContent = '₦' + rider.price.toLocaleString();
        document.getElementById('modalPickup').textContent = pickup;
        document.getElementById('modalDropoff').textContent = dropoff;
        document.getElementById('modalEta').textContent = '⏱️ Estimated arrival: ' + rider.estimated_time;

        document.getElementById('bookingModal').classList.add('show');
    }

    function closeBookingModal() {
        document.getElementById('bookingModal').classList.remove('show');
        currentBookingRider = null;
    }

    document.addEventListener('click', async function (e) {
        if (e.target.id === 'modalConfirmBtn') {
            if (!currentBookingRider) return;

            const rider = currentBookingRider;

            try {
                const response = await fetch('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rider_id: rider.rider_id,
                        rider_name: rider.rider_name,
                        pickup: rider.pickup,
                        dropoff: rider.dropoff,
                        price: rider.price,
                        estimated_time: rider.estimated_time
                    })
                });

                const data = await response.json();

                if (response.status === 201) {
                    showToast(`✅ ${rider.rider_name} is confirmed! They will arrive in ${rider.estimated_time}.`, 'success');
                    closeBookingModal();
                } else {
                    showToast('Error: ' + data.error, 'error');
                }
            } catch (error) {
                console.error('Booking error:', error);
                showToast('Something went wrong. Please try again.', 'error');
            }
        }
    });

    document.addEventListener('click', function (e) {
        const modal = document.getElementById('bookingModal');
        if (e.target === modal) {
            closeBookingModal();
        }
    });

});