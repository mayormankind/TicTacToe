const app = document.querySelector('.gameContainer');
const game = document.querySelector('.app');
let currentplayer = 'X';

//this block for the players name input 
const playersInputCard = document.querySelector('.card');//The container that takes player names
const squid1 = document.querySelector('#squid1'); //first player's name
const squid2 = document.querySelector('#squid2'); //second player's name
let PlayerScore1 = 0;
let PlayerScore2 = 0;
const player1 = document.querySelector('.playerX');
const player2 = document.querySelector('.playerO');
const score1 = document.querySelector('.score1');
const score2 = document.querySelector('.score2');
const submitBut = document.querySelector('.add');
const barWrapper = document.querySelector('.barWrapper');
const crossBar = document.querySelector('.crossBar');
const turnIndicator = document.querySelector('.turnIndicator');

const helpButton = document.querySelector('#help');
const homepage = document.querySelector('.homePage');
const helpSection = document.querySelector('.help');
const multiplayButton = document.querySelector('#multiplayer');
helpButton.addEventListener('click',(e)=>{
    helpSection.style.display = 'flex';
    homepage.style.display = 'none';
});
multiplayButton.addEventListener('click',(e)=>{
    homepage.style.display = 'none';
    playersInputCard.style.display = 'flex';
});

if(location.reload){
    localStorage.clear();
}
// game board Layout render
(function Canvas(){
    for( c=0; c<9; c++){
        app.innerHTML+=`<div class='box unfilled'></div>`;
    }
}());

submitBut.addEventListener('click',(e)=>{
    e.preventDefault();
    player1.innerHTML = `${squid1.value}`;
    player2.innerHTML = `${squid2.value}`;
    game.style.display = 'grid';
    playersInputCard.style.display = 'none';
})

//gameplay and player setting
const boxes = document.querySelectorAll('.box');
boxes.forEach((box)=>{
    box.addEventListener('click',()=>{
        //to check if box is occupied
        if(box.classList.contains('unfilled')){
            box.innerHTML+=`<span class='tag'>${currentplayer}</span>`;
            box.setAttribute('value',currentplayer);
            box.classList.replace('unfilled','filled');
            isWinner(currentplayer);
            currentplayer = (currentplayer=='X')?'O':'X';
            (currentplayer=='X')?turnIndicator.innerHTML = `<p>It is ${squid1.value}'s turn </p>`:(turnIndicator.innerHTML = `<p>It is ${squid2.value}'s turn </p>`);
        }
        NoWinner();
    })
});

//resets the board when there is a winner
function clearBoard(){
    boxes.forEach(box=>{
        box.innerHTML = '';
        box.classList.replace('filled','unfilled')
        box.removeAttribute('value');
    })
}

//clears the scoreboard when one of the players reach a score of 7
function gameOver(){
    if(localStorage.getItem(`${squid1.value}`)==7 || localStorage.getItem(`${squid2.value}`)==7){
        localStorage.clear();
        game.style.display = 'none';
        playersInputCard.style.display = 'flex';
    }
}

function clearBars(index){
    setTimeout(()=>{
        clearBoard();
        barWrapper.style.display = 'none';
        crossBar.children[index].style.display = 'none';
    },2000)
}

//checking if there is a winner
function isWinner(play){
    let box0=0,box1=0,box2=0,box3=0,box4=0,box5=0,box6=0,box7= 0;
    for (b=0; b<3; b++ ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box0++;
        }
    }
    for (b=3; b<6; b++ ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box1++;
        }
    }
    for (b=0; b<7; b+=3 ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box2++;
        }
    }
    for (b=0; b<9; b+=4 ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box3++;
        }
    }
    for (b=1; b<8; b+=3 ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box4++;
        }
    }
    for (b=2; b<9; b+=3 ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box5++;
        }
    }
    for (b=2; b<7; b+=2 ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box6++;
        }
    }
    for (b=6; b<9; b++ ){
        if(boxes[b].getAttribute('value')!= undefined && boxes[b].getAttribute('value')===currentplayer){
            box7++;
        }
    }
    if(box0>=3 || box1>=3 || box2>=3 || box3>=3 || box4>=3 || box5>=3 || box6>=3 || box7>=3){
        if(currentplayer=='X'){
            PlayerScore1 +=1;
            localStorage.setItem(`${squid1.value}`,PlayerScore1);
            score1.innerHTML = localStorage.getItem(`${squid1.value}`);
        }else{
            PlayerScore2 +=1;
            localStorage.setItem(`${squid2.value}`,PlayerScore2);
            score2.innerHTML = localStorage.getItem(`${squid2.value}`);
        }
        barWrapper.style.display = 'flex';
        if(box2>=3){crossBar.children[0].style.display='block'; clearBars(0);}
        else if(box5>=3){crossBar.children[1].style.display='block'; clearBars(1);}
        else if(box4>=3){crossBar.children[2].style.display='block'; clearBars(2);}
        else if(box0>=3){crossBar.children[3].style.display='block'; clearBars(3);}
        else if(box7>=3){crossBar.children[4].style.display='block'; clearBars(4);}
        else if(box1>=3){crossBar.children[5].style.display='block'; clearBars(5);}
        else if(box3>=3){crossBar.children[6].style.display='block'; clearBars(6);}
        else if(box6>=3){crossBar.children[7].style.display='block'; clearBars(7);}
        gameOver();
    }
}

// checks if board is filled and there's no winner
function NoWinner(){
    // let filledCounter = 0;
    if(app.children[0].classList.contains('filled') && app.children[1].classList.contains('filled') && app.children[2].classList.contains('filled') && app.children[3].classList.contains('filled') && app.children[4].classList.contains('filled') && app.children[5].classList.contains('filled') && app.children[6].classList.contains('filled') && app.children[7].classList.contains('filled') && app.children[8].classList.contains('filled')){
        console.log('filled ooooooooooo');
        clearBoard();
        clearBars();
    }
};