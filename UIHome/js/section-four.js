const bt=document.querySelectorAll('.tab-btn');
const mainImg= document.querySelector('#main-img');
const contentDesc= document.querySelector('#content');

bt.forEach(button => {
    button.addEventListener('click', function(){
        document.querySelector('.tab-btn.active').classList.remove('active');
        this.classList.add('active');
        const newImg = this.getAttribute('inner-img');
        const newDesc = this.getAttribute('inner-desc');

        mainImg.src=newImg;
        contentDesc.innerText= newDesc;
    });
});