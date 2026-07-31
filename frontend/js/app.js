document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // TAB SWITCHING
    // ==========================================
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = {
        quotes: document.getElementById('quotes-section'),
        post: document.getElementById('post-section')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(contents).forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
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

    findBtn.addEventListener('click', async function() {
        const pickup = pickupInput.value.trim();
        const dropoff = dropoffInput.value.trim();

        if (!pickup || !dropoff) {
            alert('Please enter both pickup and dropoff locations.');
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
                alert('Error: ' + data.error);
                loadingDiv.style.display = 'none';
                return;
            }

            renderQuotes(data.quotes);
            loadingDiv.style.display = 'none';
            resultsDiv.style.display = 'block';

        } catch (error) {
            console.error('Error fetching quotes:', error);
            alert('Something went wrong. Please try again.');
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
            `;
            quoteGrid.appendChild(card);
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

    broadcastBtn.addEventListener('click', async function() {
        const pickup = postPickup.value.trim();
        const dropoff = postDropoff.value.trim();
        const item = postItem.value.trim() || 'Package';

        if (!pickup || !dropoff) {
            alert('Please enter both pickup and dropoff locations.');
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
                alert('Error: ' + data.error);
                broadcastLoading.style.display = 'none';
                return;
            }

            renderBroadcast(data.riders, data.job_id);
            broadcastLoading.style.display = 'none';
            broadcastResults.style.display = 'block';

        } catch (error) {
            console.error('Error broadcasting job:', error);
            alert('Something went wrong. Please try again.');
            broadcastLoading.style.display = 'none';
        }
    });

    function renderBroadcast(riders, jobId) {
        broadcastGrid.innerHTML = '';
        riders.forEach(rider => {
            const card = document.createElement('div');
            card.className = 'quote-card-item';
            card.style.borderLeftColor = '#22C55E'; // Green for accepted
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

        // Add a small note about the job ID
        const note = document.createElement('p');
        note.style.marginTop = '20px';
        note.style.color = '#64748B';
        note.style.fontSize = '14px';
        note.textContent = `📋 Job #${jobId} broadcasted successfully. ${riders.length} rider(s) assigned.`;
        broadcastGrid.appendChild(note);
    }

});