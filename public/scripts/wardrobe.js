// handle filtering
const select_filter = () => {
    document.querySelectorAll('.filter').forEach((filter)=>{
        filter.addEventListener('click', ()=>{
            const tag = filter.getAttribute('wardrobe-filter');
            document.querySelectorAll('.filter').forEach(btn=>btn.classList.remove('selected'))
            filter.classList.add('selected');
            displayCards(cards, tag);
        })
    })
}

select_filter();
    

// Deleting cards
const deleteCard = (id)=>{
    fetch(`/delete/${id}`,{
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            console.log(`Card with ID ${id} deleted successfully.`);
        } else {
            console.log('Failed to delete card.');
        }
    })
}

//cards animations
function handleCardClick(card) {
    console.log("clicked card");

    const cardRect = card.getBoundingClientRect();
    

    cardPreviewBox = document.createElement('div');
    cardPreviewBox.classList.add('preview-box');
    

    const clone = card.cloneNode(true);
    clone.classList.add('clone'); 
    clone.style.position = 'absolute';
    clone.style.top = `${cardRect.top}px`;
    clone.style.left = `${cardRect.left}px`;
    clone.style.zIndex = '1000';

    cardPreviewBox.appendChild(clone);

    // Delete button functionality
    clone.addEventListener('click', (event)=>{
        if (event.target.classList.contains('card-delete')) {
            closePreview();
            console.log("Deleting card with ID:", clone.id);
            setTimeout(() => document.getElementById(clone.id).remove(), 320)
            deleteCard(clone.id);
        }
    });

    document.body.append(cardPreviewBox);

    setTimeout(()=>{
        cardPreviewBox.style.backdropFilter = `blur(3px)`
        cardPreviewBox.style.backgroundColor = `rgba(0,0,0,0.4)`
        clone.classList.add('preview');
        clone.style.top = '50%';
        clone.style.left = '50%';

    },10);

    function closePreview(){
        console.log("close prev");
        
        clone.classList.remove('preview');
        clone.style.top = `${cardRect.top}px`;
        clone.style.left = `${cardRect.left}px`;
        cardPreviewBox.style.backdropFilter = `blur(0px)`
        cardPreviewBox.style.backgroundColor = `rgba(0,0,0,0)`
        setTimeout(() => {
            cardPreviewBox.remove();
        }, 300);
        document.removeEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(event) {
        if (event.target === cardPreviewBox) {  // Check if the click is outside the clone
            closePreview();
        }
    }

    document.addEventListener('click', handleOutsideClick);

    document.addEventListener('keydown', (event)=>{
        if(event.key === "Escape"){
            closePreview();
        }
    })
}


// card loader
async function loadCards() {
    const response = await fetch('/cards', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' 
        }
    })
    if (response.ok) {
        cards = await response.json();
        console.log("Loading cards complete!");
    }else {console.log("Error loading cards!");}
}

// initial load of cards
let cardElements = [];
let cards;
loadCards()
.then(()=>{
    if(cards) {
        displayCards(cards, 'all');
    }
});



//display tagged cards  
async function displayCards(cards, tag='all') {

    const cardContainer = document.getElementById('cardsContainer');
    cardContainer.innerHTML = ''; 
    
    cards.forEach(card => {
        if (tag ==='all' || card.tag === tag) {
            
            
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.setAttribute('id', card._id);
            cardElement.setAttribute('wardrobe-category', card.tag)
            cardElement.innerHTML = `
            <div class="card-thumbnail" style="background-image: url(data:image/jpeg;base64,${card.image})"></div>
            <div class="text">
            <h2 class="card-title">${card.name}</h2>
            <p class="card-description">${card.description}</p>
            <p class="card-tag">${card.tag}</p>
            <button class="card-delete">Delete</button>
            </div>`;
            cardContainer.appendChild(cardElement);
            
            cardElement.addEventListener('click', () => handleCardClick(cardElement));
        }
    });
    
}


// Adding the cards
document.getElementById('detailsForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value;
    let file = document.getElementById('add-img-file').files[0]; 

    if(file){
        const form_data = new FormData();
        form_data.append('image', file);
        form_data.append('name', name);
        form_data.append('description', description);
        form_data.append('tag', tags);

        for (let pair of form_data.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }        
        
        fetch('/add' ,{
            method: "POST",
            body: form_data
        })
        .then(response => response.json())
        .then(data => {
            const cardContainer = document.getElementById('cardsContainer');
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('id', data._id);
            card.setAttribute('wardrobe-category', data.tag)
            card.innerHTML = `<div class="card-thumbnail" style="background-image: url(data:image/jpeg;base64,${data.image})"></div>
                            <h2 class="card-title">${data.name}</h2>
                            <p class="card-tag">${data.tag}</p>`;
            cardContainer.appendChild(card);
        })
    }
    
    await loadCards()
    .then(()=>displayCards(cards))
    document.querySelectorAll('.filter').forEach(btn=>{
        if (btn.getAttribute('wardrobe-filter') === 'all') {
            btn.classList.add('selected');
        }else btn.classList.remove('selected')
    })
    
    hideFormContainer();
    document.querySelector('.add-img-container').style.backgroundImage = '';
    document.querySelector('.add-img-container .h3').innerHTML = "Add Image";
    this.reset();
});
