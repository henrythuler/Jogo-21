//Variável para contar o número de vítorias
let winnings = 0

//Varíavel para contar o número de partidas
let matches = 0

//Pegando os elementos do site
let game = document.querySelector('.game')
let turn = document.querySelector('.turn')
let buyCardEl = document.querySelector('.buy')
let playerScoreArea = document.querySelector('.player .score')
let optionsFinal = document.querySelector('.options-final')
let aiFinalScore = document.querySelector('.ai .cards .score')
let finish = document.querySelector('.finish')
let options = document.querySelector(".options")

//Função para pegar o ID do baralho
async function getDeck(){
    let deckIdReq = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    let deckIdRes = await deckIdReq.json()

    //Gerando Deck Id
    deckId = deckIdRes.deck_id
}

async function buildGame(){

    cardsAreaAi = document.querySelector(".cards-area-ai")
    cardsAreaPlayer = document.querySelector('.cards-area')

    //Gerando todas as cartas
    let allCards = []
    allCards = await drawCards()

    //Cartas de cada jogador
    aiCards = []
    playerCards = []

    let halfCards = allCards.length / 2

    //Distribuindo as cartas para cada jogador
    for(let i = 0; i < allCards.length; i++){

        if(i < halfCards){
    
            aiCards.push({
            
                value: allCards[i].value,
                image: allCards[i].image
                    
            })
            
        }else{
            
            playerCards.push({
            
                value: allCards[i].value,
                image: allCards[i].image
            
            })
            
        }
    
    }

    //Checando a pontuação do jogador
    playerScore = checkScore(playerCards)

    //Exibindo a pontuação
    playerScoreArea.innerHTML = `Sua pontuação: <span>${playerScore}</span>`

    //Escondendo a pontuação do adversário
    aiFinalScore.innerHTML = ``

    //Escondendo as opções do final
    optionsFinal.style.display = "none"

    //Mostrando a opção de compra
    buyCardEl.style.display = "block"

    //Montando o jogo
    buildAI(aiCards)
    buildPlayer(playerCards)

}

function buildAI(aiCards){

    //Se for a primeira partida, basta montar as cartas
    if(matches == 0){

        for(let i = 0; i < aiCards.length; i++){

            let cardAiImage = document.createElement("img")
            cardAiImage.src = "./assets/images/cardback.png"
            cardsAreaAi.append(cardAiImage)

        }
    
    //Se não, precisamos limpar o conteúdo primeiro para depois montá-las
    }else{

        cardsAreaAi.innerText = ""

        for(let i = 0; i < aiCards.length; i++){

            let cardAiImage = document.createElement("img")
            cardAiImage.src = "./assets/images/cardback.png"
            cardsAreaAi.append(cardAiImage)

        }

    }

}

function buildPlayer(playerCards){

    //Deixando visível as opções de compra e finalizar jogada
    options.style.display = "block"

    //Se for a primeira partida, basta montar as cartas
    if(matches == 0){

        for(let i = 0; i < playerCards.length; i++){

            let cardPlayerImage = document.createElement("img")
            cardPlayerImage.src = playerCards[i].image
            cardsAreaPlayer.append(cardPlayerImage)

        }

    //Se não, precisamos limpar o conteúdo primeiro para depois montá-las
    }else{
    
        cardsAreaPlayer.innerText = ""

        for(let i = 0; i < playerCards.length; i++){

            let cardPlayerImage = document.createElement("img")
            cardPlayerImage.src = playerCards[i].image
            cardsAreaPlayer.append(cardPlayerImage)

        }

    }

}

async function start(){

    turn.innerHTML = ''

    showLoading()

    //Montando o Jogo
    await buildGame()

    setTimeout(showLoading(), 3000)

    turn.innerHTML = 'Sua vez de jogar!'

    //Exibindo o jogo
    game.style.display = 'flex'

}

//Finalizando a jogada
finish.addEventListener('click', async () => {

    options.style.display = "none"
    await startAi(aiCards, playerScore)

})

async function drawCards(){

    let cards = []

    //Requisição de 6 cartas para distribuir entre os jogadores
    let drawCardReq = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=6`)
    let drawCardsRes = await drawCardReq.json()
    
    for(let i = 0; i < drawCardsRes.cards.length; i++){

        //Adicionando o valor e a imagem de cada carta ao array de cartas
        cards.push({

            value: drawCardsRes.cards[i].value,
            image: drawCardsRes.cards[i].image
            
        })

    }

    //Retornando meu array
    return cards

}

function verifyValue(value){

    //Verificando o valor das cartas e retornando o valor inteiro
    switch(value){

        case "ACE":
            return 1
        
        case "JACK":
            return 11
        
        case "QUEEN":
            return 12
        
        case "KING":
            return 13
        
        default:
            return parseInt(value)

    }

}

function checkScore(turnCards){

    let score = 0

    //Somando o valor das cartas para obter a pontuação do jogador
    for(card of turnCards){

        score += verifyValue(card.value)

    }

    return score

}

async function buyCards(){

    //Requisição de 1 carta
    let buyCardReq = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    let buyCardsRes = await buyCardReq.json()
    
    //Objeto com o valor e imagem da carta
    let newCard = {
    
        value: buyCardsRes.cards[0].value,
        image: buyCardsRes.cards[0].image
    
    }

    //Retornando objeto
    return newCard

}

async function startAi(aiCards, playerScore){

    turn.innerHTML = 'Vez do adversário...'

    let aiScore = checkScore(aiCards)

    setTimeout(async () => {

        if(aiScore < 14){

            let newCardAi = await buyCards()

            let newCardAiEl = document.createElement('img')
            newCardAiEl.src = "./assets/images/cardback.png"

            cardsAreaAi.appendChild(newCardAiEl)

            aiScore += verifyValue(newCardAi.value)

            aiCards.push(newCardAi)

        }

    }, 1000);

    setTimeout(() => final(aiScore, playerScore, aiCards), 3000)

}

function final(aiScore, playerScore, aiCards){

    let winner = {

            playerWinner: ((playerScore == 21 && aiScore != 21) || (playerScore > aiScore && playerScore <= 21) || ((playerScore < aiScore) && (aiScore > 21 && playerScore < 21))),
            aiWinner: ((aiScore == 21 && playerScore != 21) || (aiScore > playerScore && aiScore < 21) || (aiScore < playerScore && playerScore > 21)),

        }
    
    let cardsAreaAiImgs = document.querySelectorAll('.cards-area-ai img')

    for(let i = 0; i < cardsAreaAiImgs.length; i++){

        cardsAreaAiImgs[i].src = aiCards[i].image

    }
    
    setTimeout(() => {

        aiFinalScore.innerHTML = `Pontuação da AI: <span>${aiScore}</span>`

        if(playerScore === aiScore){

            turn.innerHTML = "Empatou..."
    
        }else if((playerScore > 21) && (aiScore > 21)){
    
            turn.innerHTML = "Ninguém ganhou..."
    
        }else if(winner.playerWinner){
    
            turn.innerHTML = "Você ganhou!"
            winnings++
    
        }else if(winner.aiWinner){
    
            turn.innerHTML = "A AI ganhou..."
    
        }

        optionsFinal.style.display = "block"

    }, 500)

}

function showLoading(){

    let loader = document.querySelector('.loader')

    if(loader.style.display === '' || loader.style.display === "none"){

        loader.style.display = "block"

    }else{

        loader.style.display = "none"

    }

}

function quit(){

    game.style.display = 'none'
    let quitMessage = document.querySelector('.quit-message')

    quitMessage.style.display = 'block'

    if(winnings == 1){

        quitMessage.innerHTML = `Obrigado por jogar<br>Você ganhou <span>${winnings}</span> vez!`

    }else if(winnings == 0){

        quitMessage.innerHTML = `Obrigado por jogar<br>Infelizmente, você ganhou nenhuma vez...`

    }else{

        quitMessage.innerHTML = `Obrigado por jogar<br>Você ganhou <span>${winnings}</span> vezes!`

    }
    
}

let button = document.querySelector('button')

button.addEventListener('click', async () => {

    button.style.display = 'none'

    await getDeck()

    await start()

})

buyCardEl.addEventListener('click', async () => {

    let newCard = await buyCards()

    playerCards.push(newCard)

    let newCardEl = document.createElement('img')

    newCardEl.src = newCard.image

    cardsAreaPlayer.append(newCardEl)
    
    playerScore += verifyValue(newCard.value)
    
    playerScoreArea.innerHTML = `Sua pontuação: <span>${playerScore}</span>`

    buyCardEl.style.display = "none"    

})

document.querySelector('.play-again').addEventListener('click', async () => {

    matches++

    let returnDeckReq = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/return/`)
    let returnDeckRes = await returnDeckReq.json()

    deckId = returnDeckRes.deck_id

    start()

})

document.querySelector('.quit').addEventListener("click", () => {

    quit()

})