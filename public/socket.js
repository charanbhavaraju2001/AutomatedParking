const socket = io.connect("http://localhost:3000")
const bookbtn = document.getElementById("book");
const id = document.getElementById('text');

bookbtn.addEventListener('click',()=>{
    socket.emit('slotbooked',{
        id: id.value
    })
})


socket.on('slotbooked',(data)=>{
    const slot = document.getElementById(data.id);
    slot.classList.toggle('occupied')
})



// const leavebtn = document.getElementById('leave');
// const bookedid = document.getElementsByClassName('bookedslot')[0]


// leavebtn.addEventListener('click',()=>{
//     socket.emit('slotleft',{
//         id: bookedid.innerText
//     })
// })
// socket.on('slotleft',(data)=>{
//     const slot = document.getElementById(data.id);
//     slot.classList.toggle('occupied')

// })