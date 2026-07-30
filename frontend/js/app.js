document.addEventListener('DOMContentLoaded', function() {

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

        // Show loading, hide previous results
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

            // Render the quotes
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
        quotes.forEach((rider, index) => {
            // Assign a different border color for each card
            const colors = ['#0EA5E9', '#F97316', '#22C55E'];
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
});