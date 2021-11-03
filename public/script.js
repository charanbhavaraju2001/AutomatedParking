const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied');
const flag = 0
// Seat click event
container.addEventListener('click', (e) => {

    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        e.target.classList.toggle('selected');
        console.log(e.target.id);
        const textip = document.getElementById('text');
        textip.setAttribute('value',e.target.id);
    }
});
