function getApi() {
    const apiUrl = "https://deckofcardsapi.com/api/deck/new/draw/?count=1";

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            // console.log(data.cards);
            if (data.cards && data.cards.length > 0) {
                const card = data.cards[0]; // Första kortet i resultatet
                const imageUrl = card.image; // kortbildens URL

                // Reseta diven
                const picDiv = document.querySelector('.pic');
                picDiv.innerHTML = ''; 

                // Skapa image
                const imgElement = document.createElement('img');
                imgElement.setAttribute('src', imageUrl); 
                imgElement.setAttribute('alt', card.code);

                // Lägg till image till diven
                picDiv.appendChild(imgElement);
            } else {
                console.log('Error: No cards available');
            }
        })
        .catch(err => {
            console.log('Error:', err);
        });
}

// EventListener
document.querySelector('button').addEventListener('click', getApi);
