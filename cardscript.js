// Some global variables...
let deckId;
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;

// Statistics for the chart
let wins = 0;
let losses = 0; 

// Initialize game
function startGame() {
    const apiUrl = "https://deckofcardsapi.com/api/deck/new/shuffle/";
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = ''; // Remove current alert if it exists

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            deckId = data.deck_id;
            drawInitialCards();
        })
        .catch(err => console.log('Error:', err));
}

function drawInitialCards() {
    const drawUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`;

    fetch(drawUrl)
        .then(res => res.json())
        .then(data => {
            // Assign player and dealer cards
            playerCards = [data.cards[0], data.cards[2]];
            dealerCards = [data.cards[1], data.cards[3]];

            displayCards(playerCards, 'player-cards');
            displayCards(dealerCards, 'dealer-cards');

            playerScore = calculateScore(playerCards);
            dealerScore = calculateScore(dealerCards);

            // Display scores
            updateScores();
            // Enable buttons
            document.getElementById('hit').disabled = false;
            document.getElementById('stay').disabled = false;
        })
        .catch(err => console.log('Error:', err));
}

function updateScores() {
    document.getElementById('player-score').textContent = `Score: ${playerScore}`;
    document.getElementById('dealer-score').textContent = `Score: ${dealerScore}`;
}

function displayCards(cards, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = ''; // Reset previous cards

    cards.forEach(card => {
        const img = document.createElement('img');
        img.setAttribute('src', card.image);
        img.setAttribute('alt', card.code);
        img.classList.add('m-2');
        container.appendChild(img);
    });
}

function calculateScore(cards) {
    let score = 0;
    let aceCount = 0;

    cards.forEach(card => {
        const value = card.value;
        if (['KING', 'QUEEN', 'JACK'].includes(value)) {
            score += 10;
        } else if (value === 'ACE') {
            aceCount++;
            score += 11; // Count A as 11 initially
        } else {
            score += parseInt(value);
        }
    });

    // Adjust for As if score is too high
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

// Hit function - Player draws one card
function hit() {
    const drawUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    const hitButton = document.getElementById('hit');
    hitButton.disabled = true; // Disable the hit button immediately

    fetch(drawUrl)
        .then(res => res.json())
        .then(data => {
            playerCards.push(data.cards[0]); // Add card to player's hand
            displayCards(playerCards, 'player-cards'); // Update displayed cards

            // Calculate and display score
            playerScore = calculateScore(playerCards);
            updateScores();

            // Check for bust after a delay
            setTimeout(() => {
                if (playerScore > 21) {
                    endGame('Player Bust! Dealer Wins!', 'alert-danger');
                } else {
                    hitButton.disabled = false; // Reenable the hit button if score is 21 or below
                }
            }, 500); // 500ms delay
        })
        .catch(err => {
            console.log('Error:', err);
            hitButton.disabled = false; // Reenable hit button in case of an error
        });
}

// Stay function - Dealer plays
function stay() {
    document.getElementById('hit').disabled = true;
    document.getElementById('stay').disabled = true;

    // Dealer draws until score >= 17 or bust
    const dealerPlay = () => {
        if (dealerScore < 17) {
            const drawUrl = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;

            fetch(drawUrl)
                .then(res => res.json())
                .then(data => {
                    dealerCards.push(data.cards[0]); // Add card to dealer's hand
                    displayCards(dealerCards, 'dealer-cards'); // Update displayed cards

                    dealerScore = calculateScore(dealerCards);
                    updateScores(); // Update dealer score display

                    // Check if dealer needs to continue drawing
                    if (dealerScore < 17) {
                        setTimeout(dealerPlay, 1000); // Delay for drawing
                    } else {
                        setTimeout(checkWinner, 1000); // Delay before checking winner
                    }
                })
                .catch(err => console.log('Error:', err));
        } else {
            setTimeout(checkWinner, 1000); // Check winner if dealer is done
        }
    };

    dealerPlay(); // Start dealer's turn
}

function checkWinner() {
    if (dealerScore > 21) {
        wins++; // Increment wins if dealer busts
        endGame('Dealer Bust! Player Wins!', 'alert-success');
    } else if (playerScore > dealerScore) {
        wins++; // Increment wins if player has a higher score
        endGame('Player Wins!', 'alert-success');
    } else if (playerScore < dealerScore) {
        losses++; // Increment losses if dealer wins
        endGame('Dealer Wins!', 'alert-danger');
    } else {
        endGame('It\'s a Tie!', 'alert-primary');
    }

    // Save stats to local storage
    localStorage.setItem('wins', wins);
    localStorage.setItem('losses', losses);
}

function endGame(message, alertClass) {
    // Hit and stay should be disabled if end
    document.getElementById('hit').disabled = true;
    document.getElementById('stay').disabled = true;

    // Create alert div
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} text-center`;
    alertDiv.role = 'alert';
    alertDiv.textContent = message;

    const alertContainer = document.getElementById('alert-container'); 
    alertContainer.innerHTML = ''; // Clear previous alerts
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000); // Alert will disappear after 3 seconds
}

// Event Listeners
document.querySelector('#start-game').addEventListener('click', startGame);
document.querySelector('#hit').addEventListener('click', hit);
document.querySelector('#stay').addEventListener('click', stay);

// function getApi() {
//     const apiUrl = "https://deckofcardsapi.com/api/deck/new/draw/?count=1";

//     fetch(apiUrl)
//         .then(res => res.json())
//         .then(data => {
//             // console.log(data.cards);
//             if (data.cards && data.cards.length > 0) {
//                 const card = data.cards[0]; // Första kortet i resultatet
//                 const imageUrl = card.image; // kortbildens URL

//                 // Reseta diven
//                 const picDiv = document.querySelector('.pic');
//                 picDiv.innerHTML = ''; 

//                 // Skapa image
//                 const imgElement = document.createElement('img');
//                 imgElement.setAttribute('src', imageUrl); 
//                 imgElement.setAttribute('alt', card.code);

//                 // Lägg till image till diven
//                 picDiv.appendChild(imgElement);
//             } else {
//                 console.log('Error: No cards available');
//             }
//         })
//         .catch(err => {
//             console.log('Error:', err);
//         });
// }

// // EventListener
// document.querySelector('button').addEventListener('click', getApi);