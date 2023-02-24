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
let playAgain = document.querySelector('.play-again')
let quitButton = document.querySelector('.quit')

//Função para pegar o ID do baralho
async function getDeck(){
    let deckIdReq = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    let deckIdRes = await deckIdReq.json()

    //Gerando Deck Id
    deckId = deckIdRes.deck_id
}

//Função para "construir" o meu tabuleiro
async function buildGame(){

    //Pegando a área de cada jogador
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

//Função para montar o meu player "AI"
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

//Função para construir meu player principal
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

//Função para iniciar o jogo
async function start(){

    //Zerando o meu turno
    turn.innerHTML = ''

    //Exibindo meu loading
    showLoading()

    //Montando o Jogo
    await buildGame()

    //Escondendo meu loading
    setTimeout(showLoading(), 3000)

    //Exibindo o meu turno
    turn.innerHTML = 'Sua vez de jogar!'

    //Exibindo o jogo
    game.style.display = 'flex'

}

//Finalizando a jogada
finish.addEventListener('click', async () => {

    //As opções ficarão invisíveis
    options.style.display = "none"

    //Vez da AI
    await startAi(aiCards, playerScore)

})

//Função para retirar as cartas do baralho
async function drawCards(){

    //Array para as cartas retiradas
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

    //Retornando meu array de cartas
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

//Função para iniciar a vez da AI
async function startAi(aiCards, playerScore){

    turn.innerHTML = 'Vez do adversário...'

    //Checando a pontuação da minha AI
    let aiScore = checkScore(aiCards)


    setTimeout(async () => {

        //Se a pontuação for menor que 14 ela comprará mais uma carta
        if(aiScore < 14){

            //Requisição para retirar mais uma carta
            let newCardAi = await buyCards()

            //Criando o elemento de uma nova carta
            let newCardAiEl = document.createElement('img')
            newCardAiEl.src = "./assets/images/cardback.png"

            //Adicionando esse elemento à área da AI
            cardsAreaAi.appendChild(newCardAiEl)

            //Somando o valor da carta com a pontuação atual
            aiScore += verifyValue(newCardAi.value)

            //Adicionando a carta ao array de cartas da AI
            aiCards.push(newCardAi)

        }

    }, 1000);

    //Executando a função final
    setTimeout(() => final(aiScore, playerScore, aiCards), 3000)

}


function final(aiScore, playerScore, aiCards){

    //Casos com cada vencedor
    let winner = {

            playerWinner: ((playerScore == 21 && aiScore != 21) || (playerScore > aiScore && playerScore <= 21) || ((playerScore < aiScore) && (aiScore > 21 && playerScore < 21))),
            aiWinner: ((aiScore == 21 && playerScore != 21) || (aiScore > playerScore && aiScore < 21) || (aiScore < playerScore && playerScore > 21)),

        }
    
    //Pegando todas os elementos das cartas da AI
    let cardsAreaAiImgs = document.querySelectorAll('.cards-area-ai img')
    
    //Exibindo cada carta da AI
    for(let i = 0; i < cardsAreaAiImgs.length; i++){

        cardsAreaAiImgs[i].src = aiCards[i].image

    }
    
    setTimeout(() => {

        //Exibindo a pontuação da AI
        aiFinalScore.innerHTML = `Pontuação da AI: <span>${aiScore}</span>`

        //Verificando o vencedor
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

        //Mostrando as opções finais
        optionsFinal.style.display = "block"

    }, 500)

}

//Função para exibir o meu loading
function showLoading(){

    //Pegando o elemento de loading
    let loader = document.querySelector('.loader')

    //Se o elemento está escondido, então exibimos
    if(loader.style.display === '' || loader.style.display === "none"){

        loader.style.display = "block"
    
    //Caso contrário, escondemos
    }else{

        loader.style.display = "none"

    }

}

//Função para sair do jogo
function quit(){

    //Escondendo o meu tabuleiro
    game.style.display = 'none'

    //Pegando o elemento com a mensagem final
    let quitMessage = document.querySelector('.quit-message')

    //Exibindo a mensagem final
    quitMessage.style.display = 'block'

    //Verificando a quantidade de vitórias e exibindo uma mensagem final
    if(winnings == 1){

        quitMessage.innerHTML = `Obrigado por jogar<br>Você ganhou <span>${winnings}</span> vez!`

    }else if(winnings == 0){

        quitMessage.innerHTML = `Obrigado por jogar<br>Infelizmente, você ganhou nenhuma vez...`

    }else{

        quitMessage.innerHTML = `Obrigado por jogar<br>Você ganhou <span>${winnings}</span> vezes!`

    }
    
}

//Pegando meu botão inicial
let button = document.querySelector('button')

//Adicionando o evento de clique ao meu botão
button.addEventListener('click', async () => {

    //Escondendo meu botão
    button.style.display = 'none'

    //Pegando ID do meu deck
    await getDeck()

    //Iniciando o jogo
    await start()

})

//Adicionando evento de clique para comprar carta
buyCardEl.addEventListener('click', async () => {

    //Requisição para comprar uma carta
    let newCard = await buyCards()

    //Adicionando a carta nova ao array de cartas do jogador principal
    playerCards.push(newCard)

    //Criando um elemento para a carta nova
    let newCardEl = document.createElement('img')

    //Adicionando o src da imagem da carta nova ao meu elemento criado
    newCardEl.src = newCard.image

    //Adicionando o elemento criado à área do meu jogador principal
    cardsAreaPlayer.append(newCardEl)
    
    //Somando a pontuação do jogador principal com o valor da carta retirada
    playerScore += verifyValue(newCard.value)
    
    //Pegando a largura atual da minha tela
    let largura = window.innerWidth

    //Se ela for menor ou igual a 690px, irá adicionar a pontuação em um span
    if(largura <= 690){

        //Exibindo a nova pontuação
        playerScoreArea.innerHTML = `Sua pontuação: <span>${playerScore}</span>`
    
    //Caso contrário, ela será adicionada em um parágrafo
    }else{

        //Exibindo a nova pontuação
        playerScoreArea.innerHTML = `Sua pontuação: <p>${playerScore}</p>`

    }
    
    //Escondendo a opção de compra para essa rodada
    buyCardEl.style.display = "none"    

})

//Adicionando evento de clique para o meu botão de jogar novamente
playAgain.addEventListener('click', async () => {

    //Incrementando o número de partidas
    matches++

    optionsFinal.style.display = 'none'

    //Retornando as cartas para o meu deck
    let returnDeckReq = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/return/`)
    let returnDeckRes = await returnDeckReq.json()

    //Atribuindo o ID do deck com todas as cartas ao meu deckID
    deckId = returnDeckRes.deck_id

    //Iniciando o jogo
    start()

})

//Adicionando evento de clique ao meu botão de sair do jogo
quitButton.addEventListener("click", () => {

    //Execuntando a função para sair do jogo
    quit()

})