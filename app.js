// Sports Card Tracker App

class SportsCardTracker {
    constructor() {
        this.cards = [];
        this.currentFilter = 'all';
        this.currentCardForSale = null;
        this.loadData();
        this.initializeEventListeners();
        this.setTodayDate();
        this.displayCards();
        this.updateStats();
    }

    // Local Storage Methods
    loadData() {
        const savedData = localStorage.getItem('sportsCards');
        if (savedData) {
            this.cards = JSON.parse(savedData);
        }
    }

    saveData() {
        localStorage.setItem('sportsCards', JSON.stringify(this.cards));
    }

    // Initialize Event Listeners
    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add card form
        document.getElementById('add-card-form').addEventListener('submit', (e) => this.addCard(e));

        // Filter cards
        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.displayCards();
        });

        // Sell modal
        const modal = document.getElementById('sell-modal');
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Sell form
        document.getElementById('sell-form').addEventListener('submit', (e) => this.confirmSale(e));
    }

    // Set today's date as default
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('purchase-date').valueAsDate = new Date();
        document.getElementById('purchase-date').value = today;
        document.getElementById('sell-date').value = today;
    }

    // Tab Switching
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        event.target.classList.add('active');

        if (tabName === 'stats') {
            this.updateStats();
        }
    }

    // Add Card
    addCard(e) {
        e.preventDefault();

        const card = {
            id: Date.now(),
            playerName: document.getElementById('player-name').value,
            year: document.getElementById('card-year').value,
            set: document.getElementById('card-set').value,
            condition: document.getElementById('card-condition').value,
            purchasePrice: parseFloat(document.getElementById('purchase-price').value),
            purchaseDate: document.getElementById('purchase-date').value,
            status: 'owned',
            salePrice: null,
            saleDate: null
        };

        this.cards.push(card);
        this.saveData();

        // Reset form
        document.getElementById('add-card-form').reset();
        this.setTodayDate();

        // Show confirmation
        alert('Card added successfully!');
        this.displayCards();
        this.updateStats();
    }

    // Display Cards
    displayCards() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        let filteredCards = this.cards;

        if (this.currentFilter === 'owned') {
            filteredCards = this.cards.filter(card => card.status === 'owned');
        } else if (this.currentFilter === 'sold') {
            filteredCards = this.cards.filter(card => card.status === 'sold');
        }

        if (filteredCards.length === 0) {
            container.innerHTML = '<p class="empty-state">No cards in this category.</p>';
            return;
        }

        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            let profitLossHTML = '';
            if (card.status === 'sold') {
                const profit = card.salePrice - card.purchasePrice;
                const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
                const profitText = profit >= 0 ? '+' : '';
                profitLossHTML = `
                    <div class="detail-row">
                        <span class="detail-label">Sale Price:</span>
                        <span class="detail-value">$${card.salePrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Profit/Loss:</span>
                        <span class="detail-value ${profitClass}">${profitText}$${profit.toFixed(2)}</span>
                    </div>
                `;
            }

            const statusClass = card.status === 'owned' ? 'status-owned' : 'status-sold';
            const statusText = card.status === 'owned' ? '✓ Owned' : '✓ Sold';

            cardElement.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${card.playerName}</div>
                    <div class="card-subtitle">${card.year} ${card.set}</div>
                </div>
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">Condition:</span>
                        <span class="detail-value">${card.condition}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Purchase Price:</span>
                        <span class="detail-value">$${card.purchasePrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Purchased:</span>
                        <span class="detail-value">${new Date(card.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    ${profitLossHTML}
                    ${card.status === 'sold' ? `
                        <div class="detail-row">
                            <span class="detail-label">Sold:</span>
                            <span class="detail-value">${new Date(card.saleDate).toLocaleDateString()}</span>
                        </div>
                    ` : ''}
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-actions">
                    ${card.status === 'owned' ? `<button class="btn btn-sell" onclick="tracker.openSellModal(${card.id})">Sell Card</button>` : ''}
                    <button class="btn btn-delete" onclick="tracker.deleteCard(${card.id})">Delete</button>
                </div>
            `;

            container.appendChild(cardElement);
        });
    }

    // Delete Card
    deleteCard(cardId) {
        if (confirm('Are you sure you want to delete this card?')) {
            this.cards = this.cards.filter(card => card.id !== cardId);
            this.saveData();
            this.displayCards();
            this.updateStats();
        }
    }

    // Open Sell Modal
    openSellModal(cardId) {
        this.currentCardForSale = this.cards.find(card => card.id === cardId);
        document.getElementById('sell-modal').classList.add('show');
    }

    // Close Modal
    closeModal() {
        document.getElementById('sell-modal').classList.remove('show');
        this.currentCardForSale = null;
        document.getElementById('sell-form').reset();
    }

    // Confirm Sale
    confirmSale(e) {
        e.preventDefault();

        if (!this.currentCardForSale) return;

        const salePrice = parseFloat(document.getElementById('sell-price').value);
        const saleDate = document.getElementById('sell-date').value;

        const card = this.cards.find(c => c.id === this.currentCardForSale.id);
        if (card) {
            card.status = 'sold';
            card.salePrice = salePrice;
            card.saleDate = saleDate;
            this.saveData();
        }

        this.closeModal();
        this.displayCards();
        this.updateStats();
    }

    // Update Stats
    updateStats() {
        const totalCards = this.cards.length;
        const ownedCards = this.cards.filter(c => c.status === 'owned').length;
        const soldCards = this.cards.filter(c => c.status === 'sold').length;

        const totalInvested = this.cards.reduce((sum, card) => sum + card.purchasePrice, 0);
        const totalRevenue = this.cards
            .filter(c => c.status === 'sold')
            .reduce((sum, card) => sum + card.salePrice, 0);
        const totalProfit = totalRevenue - this.cards
            .filter(c => c.status === 'sold')
            .reduce((sum, card) => sum + card.purchasePrice, 0);

        document.getElementById('stat-total-cards').textContent = totalCards;
        document.getElementById('stat-owned-cards').textContent = ownedCards;
        document.getElementById('stat-sold-cards').textContent = soldCards;
        document.getElementById('stat-total-invested').textContent = `$${totalInvested.toFixed(2)}`;
        document.getElementById('stat-total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;

        const profitElement = document.getElementById('stat-total-profit');
        profitElement.textContent = `$${totalProfit.toFixed(2)}`;
        profitElement.className = totalProfit >= 0 ? 'stat-value profit profit-positive' : 'stat-value profit profit-negative';
    }
}

// Initialize app
const tracker = new SportsCardTracker();