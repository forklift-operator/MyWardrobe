
// Navbar handling
const navbar_buttons = document.querySelectorAll('.nav-btn');


navbar_buttons.forEach(btn => {
    if(btn!=document.querySelector('.add-btn')){
        btn.addEventListener('click', (event)=>{
            navbar_buttons.forEach(btn=>btn.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            console.log(target);
            if (target) {   
                navigateTo(target);
            }
        })
    }
})


// Section render
function navigateTo(target) {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(sec => {
        sec.classList.remove('active')
        
        if(sec.getAttribute('content')===target){
            sec.classList.add('active');
        }
    })
}
