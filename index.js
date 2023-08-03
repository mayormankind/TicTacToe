
//General variables
const playMP = document.querySelector('.playMP');
const playVsC = document.querySelector('.playVsC');
const barWrapper = document.querySelector('.barWrapper');
const crossBar = document.querySelector('.crossBar');
const turnIndicator = document.querySelector('.turnIndicator');
const helpButton = document.querySelector('#help');
const homepage = document.querySelector('.homePage');
const helpSection = document.querySelector('.help');
const cancelButton = document.querySelectorAll('.cancel');
const app = document.querySelector('.gameContainer');
const game = document.querySelector('.app');
const toMenu = document.querySelector('#toMenu');
const playAgain = document.querySelector('#playAgain');
const winnerPage = document.querySelector('.winnerPage');
const winnerQuote = document.querySelector('.winnerQuote');
let currentplayer = 'X';
let mode = 'vs';
let emptySpaces = [0,1,2,3,4,5,6,7,8];
let isPlayed = false;
let index;


//Multiplayer Variables
const playersInputCard = document.querySelector('.card');//The container that takes player names
const squid1 = document.querySelector('#squid1'); //first player's name / player's name
const squid2 = document.querySelector('#squid2'); //second player's name
let PlayerScore1 = 0;
let PlayerScore2 = 0;
const player1 = document.querySelector('.playerX');
const player2 = document.querySelector('.playerO');
const score1 = document.querySelector('.score1');
const score2 = document.querySelector('.score2');
const multiplayButton = document.querySelector('#multiplayer');


//VsComputer Variables
const playersInputCardVsC = document.querySelector('.card2');//The container that takes player's name
const vsComputerButton = document.querySelector('#vsComputer');
const squidVsC = document.querySelector('#squidVsC'); //first player's name / player's name


//click event for cancel button
cancelButton.forEach(but=>{
    but.addEventListener('click',()=>{
        homepage.style.display = 'flex';
        playersInputCard.style.display = 'none';
        playersInputCardVsC.style.display = 'none';
    })
})
//click event for help button
helpButton.addEventListener('click',(e)=>{
    helpSection.style.display = 'flex';
    homepage.style.display = 'none';
});
//click event for homepage
toMenu.addEventListener('click',(e)=>{
    score1.innerHTML = 0;
    score2.innerHTML = 0;
    homepage.style.display = 'flex';
    clearGameData();
    winnerPage.style.display = 'none';
});
//click event for play a mode again
playAgain.addEventListener('click',(e)=>{
    clearGameData();
    score1.innerHTML = 0;
    score2.innerHTML = 0;
    winnerPage.style.display = 'none';
    if(mode = 'mp'){
        playersInputCard.style.display = 'flex';
    }else{
        playersInputCardVsC.style.display = 'flex';
    }
});
//click event for multiplayer button
multiplayButton.addEventListener('click',(e)=>{
    playersInputCard.style.display = 'flex';
    helpSection.style.display = 'none';
    homepage.style.display = 'none';
});
//click event for vsComputer button
vsComputerButton.addEventListener('click',(e)=>{
    playersInputCardVsC.style.display = 'flex';
    helpSection.style.display = 'none';
    homepage.style.display = 'none';
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

playMP.addEventListener('click',(e)=>{
    e.preventDefault();
    PlayerScore1 = 0;
    PlayerScore2 = 0;
    mode = 'mp';
    player1.innerHTML = `${squid1.value}`;
    player2.innerHTML = `${squid2.value}`;
    game.style.display = 'grid';
    playersInputCard.style.display = 'none';
})

playVsC.addEventListener('click',(e)=>{
    e.preventDefault();
    PlayerScore1 = 0;
    PlayerScore2 = 0;
    mode = 'vs';
    player1.innerHTML = `${squidVsC.value}`;
    player2.innerHTML = 'PickBot';
    game.style.display = 'grid';
    playersInputCardVsC.style.display = 'none';
})

//gameplay and player setting
const boxes = document.querySelectorAll('.box');
boxes.forEach((box,i)=>{
    box.addEventListener('click',()=>{
        emptySpaces.splice(emptySpaces.indexOf(i),1);
        //to check if box is occupied
        if(box.classList.contains('unfilled')){
            box.innerHTML+=`<span class='tag'>${currentplayer}</span>`;
            box.setAttribute('value',currentplayer);
            box.classList.replace('unfilled','filled');
            isPlayed = true;
            isWinner(currentplayer);
            currentplayer = (currentplayer=='X')?'O':'X';
            if(mode=='vs' && currentplayer=='O' && isPlayed==true ){
                setTimeout(()=>{
                    PickBot();
                    isPlayed=false;
                    currentplayer = (currentplayer=='O')?'X':'O';
                    turnIndicator.innerHTML = `<p>It is ${squidVsC.value}'s turn </p>`
                },2200)
            }
            (currentplayer=='X')?turnIndicator.innerHTML = `<p>It is ${mode=='mp' ? squid1.value : squidVsC.value}'s turn </p>`:(turnIndicator.innerHTML = `<p>It is ${mode=='mp' ? squid2.value : 'PickBot'}'s turn </p>`);
        }
        NoWinner();
    })
});  

//vs_Computer_Logic
function PickBot(){
        let index_of_emptySpaces = Math.round(Math.random() * (emptySpaces.length - 1));
        if( isPlayed == true && currentplayer == 'O'){
            boxes[emptySpaces[index_of_emptySpaces]].innerHTML += `<span class='tag'>O</span>`;
            boxes[emptySpaces[index_of_emptySpaces]].setAttribute('value','O');
            boxes[emptySpaces[index_of_emptySpaces]].classList.replace('unfilled','filled');
            isWinner(currentplayer);
            emptySpaces.splice(emptySpaces.indexOf(emptySpaces[index_of_emptySpaces]),1)
            if(NoWinner()){
                setTimeout(()=>{
                    clearBoard();
                },2000)
            }
        }
}

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
    let winner;
    if(localStorage.getItem(`${mode=='mp' ? squid1.value : squidVsC.value}`)==3 || localStorage.getItem(`${mode=='mp'?squid2.value:'PickBot'}`)==3){
        if(mode == 'mp'){
            if(localStorage.getItem(squid1.value) >=3){
                winner = squid1.value;
            }else if(localStorage.getItem(squid2.value) >=3){
                winner = squid2.value;
            }
        }else {
            if(localStorage.getItem(squidVsC.value) >=3){
                winner = squidVsC.value;
            }else if(localStorage.getItem('PickBot') >=3){
                winner = 'PickBot';
            }
        }
        barWrapper.style.display = 'none';
        game.style.display = 'none';
        winnerPage.style.display = 'flex';
        winnerQuote.textContent = `${winner} wins!`;
    }
}

function clearBars(index){
    setTimeout(()=>{
        barWrapper.style.display = 'none';
        crossBar.children[index].style.display = 'none';
        clearBoard();
    },2000)
}

function clearGameData(){
    localStorage.clear();
    emptySpaces=[];
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
            localStorage.setItem(`${mode=='mp' ? squid1.value : squidVsC.value}`,PlayerScore1);
            score1.innerHTML = localStorage.getItem(`${mode=='mp' ? squid1.value : squidVsC.value}`);
        }else{
            PlayerScore2 +=1;
            localStorage.setItem(`${mode=='mp' ? squid2.value : 'PickBot'}`,PlayerScore2);
            score2.innerHTML = localStorage.getItem(`${mode=='mp' ? squid2.value : 'PickBot'}`);
        }
        barWrapper.style.display = 'flex';
        emptySpaces = [0,1,2,3,4,5,6,7,8];
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
    if(app.children[0].classList.contains('filled') && app.children[1].classList.contains('filled') && app.children[2].classList.contains('filled') && app.children[3].classList.contains('filled') && app.children[4].classList.contains('filled') && app.children[5].classList.contains('filled') && app.children[6].classList.contains('filled') && app.children[7].classList.contains('filled') && app.children[8].classList.contains('filled')){
        clearBoard();
        clearBars();
        emptySpaces = [0,1,2,3,4,5,6,7,8];
    }
};