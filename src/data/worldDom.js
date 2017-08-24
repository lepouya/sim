const game = {
  name: 'World Domination Simulator',
  version: '0.0.1',
  updateGranularity: 0.25,
  maxUpdateCycles: 3600,
  tutorial: {
    steps: [
      {
        text: "Welcome to the world domination simulator!<br/>" +
              "You are a poor nobody in middle of a poor village, but you have some ideas about world domination and a ridiculous amount of determination<br/>" +
              "<br/>Oh, and some magic.<br/><br/>...<br/>Definitely a lot of magic!<br/>Through this console, that is.<br/></br>" +
              "Let's get started and dominate this digital world of yours!" +
              "<p>Author's note: I'm still in very experimental phase, so you might have to reset your game often</p>",
        button: "Let's get started",
      },
      {
        text: "First, let's get familiarized with some basic resources<br/>" +
              'On the "Resources" tab below, go to the "Wood" section and try to chop some wood<br/>' +
              "5 pieces sould be enough",
        post: {wood: 5},
        button: "All done!",
      },
      {
        text: "Great!<br/>" +
              "You might have noticed that you can't have more than 10 pieces of wood at once. " +
              "We will talk about how you can increase the size of the storage later",
        button: "Ok, so what can I do with these now?",
      },
      {
        text: "Next, let's talk about money<br/>" +
              "You will need some coins if you want to dominate this world... ok, a lot of coins<br/><br/>" +
              "Go ahead and sell some of that wood you just axed down. You can get 1 coin for each one of them from the local market",
        post: {coin: 1},
        prize: {coin: 5},
        button: "Yay I got some money",
      },
      {
        text: 'Notice that a new "Money" section just opened up below. Go ahead and look in it<br/>' +
              "We're gonna need some more coins if we want to continue. How about you sell the rest of that wood?",
        post: {coin: 10},
        button: "I'm rich!",
      },
      {
        text: "Now let's get quarrying! Put your back to it and go to the Stone section below and dig out some rocks!<br/>" +
              "5 pieces should be enough",
        post: {stone: 5},
        prize: {wood: 5},
        button: "Easy peasy",
      },
      {
        text: "Great!<br/>" +
              "Now, why don't we try and make some storage places so that we can keep more of the goodies and resources?<br/>" +
              "Go ahead and chop down some more wood. We're gonna need some wood and stone to build a makeshift shed",
        post: {wood: 10, stone: 5, coin: 10},
        prize: {coin: 10},
        button: "Phew! That was hard work"
      },
      {
        text: "That's all the tutorial I have made so far. Next time you come back you might actually have to reset the game",
      },
    ],
  },
  tabs: [{
      title: 'Resources',
      items: [{
          title: 'Money',
          primary: 'coin',
          items: [{primary: ['coin']}],
        },
        {
          title: 'Wood',
          primary: 'wood',
          items: [
            {items: ['wood']},
          ],
        },
        {
          title: 'Stone',
          primary: 'stone',
          items: [
            {items: ['stone']},
          ],
        },
      ]
    },
    {
      title: 'People',
      primary: 'invisible',
      items: [],
    },
  ],
  growths: {
  },
  resources: {
    invisible: {visible: false},
    coin: {
      description: "The main currency of your world",
      count: 0,
      visible: false,
      requirement: [{entity: 'coin', baseRate: 1}],
    },
    wood: {
      description: "Basic material for construction",
      count: 0,
      limit: 10,
      unlocked: true,
      price: [{entity: 'coin', baseRate: 0}],
      sellModifier: [{growthFunction: 'constant', coefficient: 1}],
      display: {buy: 'Chop', sell: 'Sell'},
    },
    stone: {
      description: "Basic material for construction",
      count: 0,
      limit: 10,
      visible: false,
      requirement: [{entity: 'coin', baseRate: 5}],
      price: [{entity: 'coin', baseRate: 0}],
      sellModifier: [{growthFunction: 'constant', coefficient: 1}],
      display: {buy: 'Dig', sell: 'Sell'},
    },
  },
};

export default game;