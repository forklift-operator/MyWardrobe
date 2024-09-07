
// ADD ITEM MODAL
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



// LOGOUT BTN
const logout_btn = document.querySelector('.logout-btn');
logout_btn.addEventListener('click',async ()=>{
    fetch('/logout', {method: "GET"})
    .then(res => {
        if(res.redirected){
            window.location.href = res.url;
        }
    })
})