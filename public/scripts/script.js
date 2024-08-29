
// Navbar handling
const navbar = document.querySelector('.nav-bar');
const main_content = document.querySelector('.main-content');
const navbar_buttons = document.querySelectorAll('.nav-btn')

navbar_buttons.forEach(btn => {
    btn.addEventListener('click', (event)=>{
        event.preventDefault();
        navbar_buttons.forEach(btn=>btn.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-target');
        // if (target) {   
        //     navigateTo(target);
        // }
    })
})

// function navigateTo(target) {
//     fetch(`/${target}`)
//         .then(response => response.text())
//         .then(html => {
//             main_content.innerHTML = html;  
//         })
//         .catch(error => console.error('Error loading content:', error));
// }


// handle add item to wardrobe modal 
const form_container = document.querySelector('.form-container');

const showFormContainer = () => {
    form_container.style.display = 'block';
    setTimeout(()=>{
        form_container.classList.add('show');
    }, 10)
}

const hideFormContainer = () => {
    form_container.classList.remove('show');
    setTimeout(()=>{
        form_container.style.display = 'none';
    },600);
}

const add_item_btn = document.querySelector('.add-btn');
add_item_btn.addEventListener('click', ()=> {
    form_container.focus();
    showFormContainer();
})
form_container.addEventListener('click', (e)=>{
    if (e.target === form_container) {
        hideFormContainer();
    }
})

window.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        hideFormContainer();
    }
})

// setting btn to logout



// add imgage to details
document.querySelector('.add-img-btn').addEventListener('click', (event)=>{
    event.preventDefault()
    document.getElementById('add-img-file').click();
})
document.getElementById('add-img-file').addEventListener('change', (event) => {
    event.preventDefault()

    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) =>{
            const addImageContainer = document.querySelector('.add-img-container');
            // Set the background of the div to the uploaded image
            addImageContainer.style.backgroundImage = `url('${e.target.result}')`;
            addImageContainer.style.backgroundSize = 'cover';
            addImageContainer.style.backgroundPosition = 'center';
            document.querySelector('.add-img-btn .h3').innerHTML = event.target.files[0].name;
        }
        reader.readAsDataURL(file);
    }
})




// initial load of cards
let cards;
loadCards()
.then(()=>{
    if(cards) displayCards(cards, 'all');
});


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
        console.log(cards);
        
    }else {console.log("Error loading cards!");}
}



// filter card container content
const filterContent = (cards, filter) => {
    
    cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('wardrobe-category') === filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
};


// handle filtering
const wardrobe_filters = document.querySelectorAll('.filter');
wardrobe_filters.forEach((filter)=>{
    filter.addEventListener('click', ()=>{
        const tag = filter.getAttribute('wardrobe-filter');
        wardrobe_filters.forEach(btn=>btn.classList.remove('selected'))
        filter.classList.add('selected');
        displayCards(cards, tag);
    })
})


//display tagged cards  
function displayCards(cards, tag) {
    const cardContainer = document.getElementById('cardsContainer');
    cardContainer.innerHTML = ''; 

    cards.forEach(card => {
        if (tag ==='all' || card.tag === tag) {
            
            const cardElement = document.createElement('div');
            
            cardElement.className = 'card';
            cardElement.setAttribute('wardrobe-category', card.tag)
            cardElement.innerHTML = `<div class="card-thumbnail" style="background-image: url(data:image/jpeg;base64,${card.image})"></div>
            <h2 class="card-title">${card.name}</h2>
            <p class="card-tag">${card.tag}</p>`;
            cardContainer.appendChild(cardElement);
        }
    });
}
 
// card creator
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
            console.log('Received JSON data:', data);

            const cardContainer = document.getElementById('cardsContainer');
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('wardrobe-category', data.tag)
            card.innerHTML = `<div class="card-thumbnail" style="background-image: url(data:image/jpeg;base64,${data.image})"></div>
                            <h2 class="card-title">${data.name}</h2>
                            <p class="card-tag">${data.tag}</p>`;
            cardContainer.appendChild(card);
        })
    }

        
    await loadCards();
    hideFormContainer();
    document.querySelector('.add-img-container').style.backgroundImage = '';
    document.querySelector('.add-img-container .h3').innerHTML = "Add Image";
    this.reset();
});